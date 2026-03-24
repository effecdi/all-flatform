import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";
import { logger } from "./logger";
import type { BusinessProfile, AiRecommendation, RecommendationItem } from "@shared/schema";
import type { IStorage } from "./storage";

export async function generateRecommendations(
  userId: number,
  profile: BusinessProfile,
  storage: IStorage
): Promise<AiRecommendation> {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  }

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
      description: p.description?.substring(0, 200) || "",
      region: p.region,
      endDate: p.endDate,
      supportAmount: p.supportAmount,
    })),
    ...invResult.data.map(p => ({
      id: p.id,
      type: "investment" as const,
      title: p.title,
      organization: p.organization,
      investorType: p.investorType,
      description: p.description?.substring(0, 200) || "",
      targetStage: p.targetStage,
      investmentScale: p.investmentScale,
    })),
  ];

  if (programList.length === 0) {
    throw new Error("현재 모집중인 프로그램이 없습니다.");
  }

  const prompt = `당신은 한국 스타트업/중소기업을 위한 정부지원사업 및 투자유치 전문 컨설턴트입니다.

다음은 사용자의 사업 프로필입니다:
- 회사명: ${profile.companyName}
- 창업 단계: ${profile.businessStage}
- 업종: ${profile.industrySector}
- 지역: ${profile.region}
- 직원 수: ${profile.employeeCount || "미입력"}
- 매출 규모: ${profile.annualRevenue || "미입력"}
- 기술 분야: ${profile.techField || "미입력"}
- 희망 자금: ${profile.desiredFunding || "미입력"}
- 사업 설명: ${profile.businessDescription || "미입력"}

다음은 현재 모집중인 프로그램 목록입니다:
${JSON.stringify(programList, null, 2)}

위 프로그램 중에서 이 사업자에게 가장 적합한 프로그램을 최대 10개 추천해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
[
  {
    "programId": <number>,
    "programType": "government" | "investment",
    "matchScore": <0-100>,
    "reasoning": "<한국어로 2-3문장 추천 이유>",
    "title": "<프로그램 제목>"
  }
]

matchScore 기준:
- 90-100: 매우 적합 (단계, 업종, 지역 모두 일치)
- 70-89: 적합 (주요 조건 대부분 일치)
- 50-69: 보통 (일부 조건 일치)
- 50 미만: 추천하지 마세요`;

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find(c => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.");
  }

  let recommendations: RecommendationItem[];
  try {
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    recommendations = JSON.parse(jsonStr);
  } catch {
    logger.error("AI 응답 파싱 실패", textContent.text);
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
    .filter(r =>
      !isNaN(r.programId) && r.programId > 0 &&
      (r.programType === "government" || r.programType === "investment") &&
      !isNaN(r.matchScore) && r.matchScore >= 50 &&
      r.reasoning && r.title
    )
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

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
    modelUsed: "claude-sonnet-4-20250514",
    promptTokens: response.usage.input_tokens,
    completionTokens: response.usage.output_tokens,
  });

  return result;
}
