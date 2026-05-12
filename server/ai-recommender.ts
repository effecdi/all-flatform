import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";
import type { BusinessProfile, AiRecommendation, RecommendationItem } from "@shared/schema";
import type { IStorage } from "./storage";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface GeminiResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

async function runGemini(prompt: string, maxRetries = 3): Promise<GeminiResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) {
        throw new Error("AI 응답에 텍스트가 없습니다.");
      }

      // Extract token usage from response metadata
      const usage = result.response.usageMetadata;
      const promptTokens = usage?.promptTokenCount ?? 0;
      const completionTokens = usage?.candidatesTokenCount ?? 0;

      return { text, promptTokens, completionTokens };
    } catch (err: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      if (isLastAttempt) throw err;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(`Gemini API 재시도 ${attempt + 1}/${maxRetries} (${delay}ms 후): ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Gemini API 최대 재시도 횟수 초과");
}

function computeDaysRemaining(endDate: string | Date | null | undefined): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export async function generateRecommendations(
  userId: number,
  profile: BusinessProfile,
  storage: IStorage
): Promise<AiRecommendation> {
  // Get currently active programs
  const govResult = await storage.getGovernmentPrograms({ status: "모집중", limit: 100 });
  const invResult = await storage.getInvestmentPrograms({ status: "모집중", limit: 50 });

  // Build applicationUrl lookup map (server-side, prevents AI hallucination)
  const applicationUrlMap = new Map<string, string | null>();
  for (const p of govResult.data) {
    applicationUrlMap.set(`government:${p.id}`, p.applicationUrl || null);
  }
  for (const p of invResult.data) {
    applicationUrlMap.set(`investment:${p.id}`, p.applicationUrl || null);
  }

  const programList = [
    ...govResult.data.map(p => ({
      id: p.id,
      type: "government" as const,
      title: p.title,
      organization: p.organization,
      supportType: p.supportType,
      description: p.description?.substring(0, 500) || "",
      targetAudience: p.targetAudience || "",
      excludedTargets: p.excludedTargets || "",
      region: p.region,
      startDate: p.startDate,
      endDate: p.endDate,
      daysRemaining: computeDaysRemaining(p.endDate),
      supportAmount: p.supportAmount,
    })),
    ...invResult.data.map(p => ({
      id: p.id,
      type: "investment" as const,
      title: p.title,
      organization: p.organization,
      investorType: p.investorType,
      description: p.description?.substring(0, 500) || "",
      targetStage: p.targetStage,
      targetIndustry: p.targetIndustry || "",
      investmentScale: p.investmentScale,
      startDate: p.startDate,
      endDate: p.endDate,
      daysRemaining: computeDaysRemaining(p.endDate),
    })),
  ];

  if (programList.length === 0) {
    throw new Error("현재 모집중인 프로그램이 없습니다.");
  }

  // Build a valid ID set for validation after AI response
  const validIds = new Map<string, number[]>();
  validIds.set("government", govResult.data.map(p => p.id));
  validIds.set("investment", invResult.data.map(p => p.id));

  // Fetch user bookmarks as implicit preference signal
  const bookmarks = await storage.getBookmarks(userId);
  let bookmarkContext = "";
  if (bookmarks.length > 0) {
    const bookmarkedTitles: string[] = [];
    for (const bm of bookmarks) {
      const prog = programList.find(p => p.id === bm.programId && p.type === bm.programType);
      if (prog) bookmarkedTitles.push(`${prog.title} (${prog.type})`);
    }
    if (bookmarkedTitles.length > 0) {
      bookmarkContext = `\n## 사용자가 관심 표시한 프로그램 (북마크)
이 목록은 사용자의 관심사를 파악하는 참고 자료입니다:
${bookmarkedTitles.map(t => `- ${t}`).join("\n")}
`;
    }
  }

  // Map enum values to readable descriptions for the AI
  const stageDescriptions: Record<string, string> = {
    "예비창업": "예비창업자 (사업자등록 전, 아이디어 단계)",
    "초기": "초기 창업자 (사업자등록 후 3년 미만)",
    "성장": "성장기 기업 (창업 3~7년차)",
    "도약": "도약기 기업 (창업 7년 이상)",
  };
  const sectorDescriptions: Record<string, string> = {
    "IT_SW": "IT/소프트웨어",
    "바이오_의료": "바이오/의료",
    "제조_하드웨어": "제조/하드웨어",
    "에너지_환경": "에너지/환경",
    "콘텐츠_미디어": "콘텐츠/미디어",
    "유통_물류": "유통/물류",
    "교육": "교육",
    "금융_핀테크": "금융/핀테크",
    "농업_식품": "농업/식품",
    "기타": "기타",
  };

  const stageLabel = stageDescriptions[profile.businessStage] || profile.businessStage;
  const sectorLabel = sectorDescriptions[profile.industrySector] || profile.industrySector;

  const prompt = `당신은 한국 정부지원사업 및 투자유치 전문 컨설턴트입니다.
실제 창업자에게 꼭 필요하고 현실적으로 신청 가능한 사업만 추천해야 합니다.

## 사용자 프로필
- 회사명: ${profile.companyName}
- 창업 단계: ${stageLabel}
- 업종: ${sectorLabel}
- 지역: ${profile.region}
- 직원 수: ${profile.employeeCount || "미입력"}
- 매출 규모: ${profile.annualRevenue || "미입력"}
- 기술 분야: ${profile.techField || "미입력"}
- 희망 자금: ${profile.desiredFunding || "미입력"}
- 사업 설명: ${profile.businessDescription || "미입력"}
${bookmarkContext}
## 모집중인 프로그램 목록
${JSON.stringify(programList, null, 2)}

## 필수 검증 규칙 (하나라도 위반하면 추천 금지)

### 규칙 1: 반드시 위 목록의 id와 title만 사용
목록에 없는 프로그램을 절대 만들어내지 마세요.

### 규칙 2: 창업 단계 자격 검증 (가장 중요)
사용자의 창업 단계(${profile.businessStage})에 따라 신청 자격이 없는 사업은 반드시 제외하세요:

- "예비창업": targetAudience에 "예비창업" 또는 "사업자등록 전"이 포함된 사업만 가능. 투자 프로그램은 시드 단계만 가능. 시리즈A 이상 투자, 창업 3년 이상 대상 사업은 절대 추천 금지.
- "초기": targetAudience에 "창업 3년 이내" 또는 초기 관련 내용이 있는 사업. 투자는 시드~프리시리즈A까지. 도약패키지, 시리즈B 이상은 추천 금지.
- "성장": 창업 3~7년 대상 사업. 투자는 시리즈A~B. 예비창업패키지, 초기창업패키지는 추천 금지.
- "도약": 창업 7년 이상 대상 사업. 정책자금, 해외진출, 시리즈B 이상 투자. 예비/초기 전용 패키지는 추천 금지.

### 규칙 3: 업종 적합성 검증
- 제조업/하드웨어 전용 사업(스마트공장 등)은 IT_SW 기업에게 추천 금지
- 농식품 전용 사업은 농업_식품 업종에만 추천
- 바이오 R&D는 바이오_의료 업종에만 추천
- targetIndustry가 명시된 투자 프로그램은 사용자 업종과 일치할 때만 추천

### 규칙 4: 지역 적합성 검증
- 지역 한정 사업(서울, 경기, 부산, 대전 등)은 해당 지역 사용자에게만 추천
- "전국" 사업은 모든 지역에 추천 가능
- 사용자 지역이 "전국"이면 모든 사업 추천 가능

### 규칙 5: 희망 자금 매칭
- 사용자의 희망 자금과 프로그램 지원 금액이 현실적으로 맞아야 함
- 희망 자금 5천만원 이하인데 최소 10억 이상 투자 프로그램은 추천 금지

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
[
  {
    "programId": <number>,
    "programType": "government" | "investment",
    "matchScore": <0-100>,
    "reasoning": "<한국어 2-3문장: 이 사업이 사용자에게 적합한 구체적 이유>",
    "title": "<위 목록의 정확한 프로그램 제목>",
    "urgency": "high" | "medium" | "low",
    "benefits": "<예상 혜택: 자금 규모, 멘토링, 공간 등 1-2문장>",
    "preparationTips": "<준비사항: 필요 서류, 유의점, 경쟁력 확보 팁 등 2-3문장>",
    "difficulty": "easy" | "medium" | "hard"
  }
]

## 각 필드 가이드
- urgency: daysRemaining 기준. 7일 이하="high", 30일 이하="medium", 그 외="low". daysRemaining이 null이면 "low"
- benefits: 실질적 혜택을 구체적으로 (예: "최대 1억원 사업화 자금 + 전담 멘토링 6개월")
- preparationTips: 신청 준비에 도움이 되는 실질 조언 (예: "사업계획서와 기술 설명 자료 필수, IR 피칭 준비 권장")
- difficulty: 신청 절차 복잡도. easy=간단한 서류 제출, medium=사업계획서 + 발표, hard=다단계 심사 + 현장실사

matchScore 기준:
- 90-100: 단계·업종·지역 모두 정확히 일치, 신청 자격 완벽 충족
- 70-89: 주요 조건 대부분 일치, 자격 충족
- 50-69: 일부 조건 일치, 신청은 가능하나 경쟁력 낮을 수 있음
- 50 미만: 추천하지 마세요`;

  let geminiResult: GeminiResult;
  try {
    geminiResult = await runGemini(prompt);
  } catch (err: any) {
    logger.error("Gemini API 호출 실패", err.message);
    throw new Error("AI 추천 생성에 실패했습니다: " + err.message);
  }

  let recommendations: RecommendationItem[];
  try {
    // Extract JSON from response (handle markdown code blocks and extra text)
    let jsonStr = geminiResult.text.trim();
    // Remove markdown code fences
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    // Try to extract JSON array if there's surrounding text
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
    }
    recommendations = JSON.parse(jsonStr);
  } catch {
    logger.error("AI 응답 파싱 실패", geminiResult.text);
    throw new Error("AI 응답을 파싱할 수 없습니다.");
  }

  // Validate, coerce types, and filter recommendations
  recommendations = recommendations
    .map(r => ({
      ...r,
      programId: Number(r.programId),
      matchScore: Number(r.matchScore),
      programType: String(r.programType) as "government" | "investment",
      reasoning: String(r.reasoning || ""),
      title: String(r.title || ""),
      urgency: (["high", "medium", "low"].includes(r.urgency as string) ? r.urgency : undefined) as RecommendationItem["urgency"],
      benefits: r.benefits ? String(r.benefits) : undefined,
      preparationTips: r.preparationTips ? String(r.preparationTips) : undefined,
      difficulty: (["easy", "medium", "hard"].includes(r.difficulty as string) ? r.difficulty : undefined) as RecommendationItem["difficulty"],
      // applicationUrl is set server-side below, not from AI
      applicationUrl: undefined as string | null | undefined,
    }))
    .filter(r => {
      if (isNaN(r.programId) || r.programId <= 0) return false;
      if (r.programType !== "government" && r.programType !== "investment") return false;
      if (isNaN(r.matchScore) || r.matchScore < 50) return false;
      if (!r.reasoning || !r.title) return false;
      // Validate that programId actually exists in the fetched programs
      const ids = validIds.get(r.programType);
      if (!ids || !ids.includes(r.programId)) {
        logger.warn(`AI가 존재하지 않는 프로그램 ID를 반환: ${r.programType}/${r.programId} (${r.title})`);
        return false;
      }
      return true;
    })
    .map(r => {
      // Attach applicationUrl from server-side lookup (prevents AI hallucination)
      const url = applicationUrlMap.get(`${r.programType}:${r.programId}`);
      return { ...r, applicationUrl: url ?? null };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  if (recommendations.length === 0) {
    throw new Error("현재 프로필에 적합한 프로그램을 찾지 못했습니다. 프로필을 업데이트하거나 나중에 다시 시도해주세요.");
  }

  const result = await storage.createRecommendation({
    userId,
    recommendations,
    profileSnapshot: {
      companyName: profile.companyName,
      businessStage: profile.businessStage,
      industrySector: profile.industrySector,
      region: profile.region,
      employeeCount: profile.employeeCount,
      annualRevenue: profile.annualRevenue,
      techField: profile.techField,
      desiredFunding: profile.desiredFunding,
    },
    modelUsed: "gemini-2.5-flash",
    promptTokens: geminiResult.promptTokens,
    completionTokens: geminiResult.completionTokens,
  });

  return result;
}
