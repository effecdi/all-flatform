import { spawn } from "node:child_process";
import { logger } from "./logger";
import type { BusinessProfile, AiRecommendation, RecommendationItem } from "@shared/schema";
import type { IStorage } from "./storage";

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    delete env.CLAUDECODE;

    const child = spawn("claude", ["-p", "--output-format", "text"], {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `claude exited with code ${code}`));
      } else {
        resolve(stdout);
      }
    });

    // Write prompt to stdin and close
    child.stdin.write(prompt);
    child.stdin.end();

    // Timeout after 120s
    setTimeout(() => {
      child.kill();
      reject(new Error("claude CLI timeout (120s)"));
    }, 120_000);
  });
}

export async function generateRecommendations(
  userId: number,
  profile: BusinessProfile,
  storage: IStorage
): Promise<AiRecommendation> {
  // Get currently active programs
  const govResult = await storage.getGovernmentPrograms({ status: "모집중", limit: 100 });
  const invResult = await storage.getInvestmentPrograms({ status: "모집중", limit: 50 });

  const programList = [
    ...govResult.data.map(p => ({
      id: p.id,
      type: "government" as const,
      title: p.title,
      organization: p.organization,
      supportType: p.supportType,
      description: p.description?.substring(0, 300) || "",
      targetAudience: p.targetAudience || "",
      excludedTargets: p.excludedTargets || "",
      region: p.region,
      startDate: p.startDate,
      endDate: p.endDate,
      supportAmount: p.supportAmount,
    })),
    ...invResult.data.map(p => ({
      id: p.id,
      type: "investment" as const,
      title: p.title,
      organization: p.organization,
      investorType: p.investorType,
      description: p.description?.substring(0, 300) || "",
      targetStage: p.targetStage,
      targetIndustry: p.targetIndustry || "",
      investmentScale: p.investmentScale,
      startDate: p.startDate,
      endDate: p.endDate,
    })),
  ];

  if (programList.length === 0) {
    throw new Error("현재 모집중인 프로그램이 없습니다.");
  }

  // Build a valid ID set for validation after AI response
  const validIds = new Map<string, number[]>();
  validIds.set("government", govResult.data.map(p => p.id));
  validIds.set("investment", invResult.data.map(p => p.id));

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

## reasoning 작성 가이드 (현실적 조언 포함)
각 추천의 reasoning에 반드시 포함할 내용:
1. 이 사업이 사용자에게 적합한 구체적 이유 (단계, 업종, 지역 매칭 근거)
2. 실질적 혜택 (자금 규모, 멘토링, 공간 등)
3. 준비 팁 또는 유의사항 (예: "사업계획서와 기술 설명 자료 준비 필요", "마감이 임박하여 서둘러 신청하세요", "경쟁률이 높으니 차별화 포인트 강조 필요")

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
[
  {
    "programId": <number>,
    "programType": "government" | "investment",
    "matchScore": <0-100>,
    "reasoning": "<한국어 2-3문장: 적합 이유 + 실질 혜택 + 준비 팁>",
    "title": "<위 목록의 정확한 프로그램 제목>"
  }
]

matchScore 기준:
- 90-100: 단계·업종·지역 모두 정확히 일치, 신청 자격 완벽 충족
- 70-89: 주요 조건 대부분 일치, 자격 충족
- 50-69: 일부 조건 일치, 신청은 가능하나 경쟁력 낮을 수 있음
- 50 미만: 추천하지 마세요`;

  let responseText: string;
  try {
    responseText = await runClaude(prompt);
  } catch (err: any) {
    logger.error("claude CLI 호출 실패", err.message);
    throw new Error("AI 추천 생성에 실패했습니다: " + err.message);
  }

  let recommendations: RecommendationItem[];
  try {
    // Extract JSON from response (handle markdown code blocks and extra text)
    let jsonStr = responseText.trim();
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
    logger.error("AI 응답 파싱 실패", responseText);
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
    modelUsed: "claude-cli",
    promptTokens: 0,
    completionTokens: 0,
  });

  return result;
}
