import { logger } from "./logger";
import type { IStorage } from "./storage";
import type { DiscoverProject, WebSearchResult } from "@shared/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API 응답이 비어있습니다.");
  }
  return text;
}

export async function searchPrograms(
  query: string,
  storage: IStorage
): Promise<{ governmentProjects: DiscoverProject[]; investmentProjects: DiscoverProject[] }> {
  // Split query into individual keywords for broader matching
  const keywords = query.split(/\s+/).filter(k => k.length > 0);
  const searchTerms = keywords.length > 1 ? [query, ...keywords] : [query];

  // Search with each keyword in parallel
  const allResults = await Promise.all(
    searchTerms.map(term =>
      Promise.all([
        storage.getGovernmentPrograms({ search: term, limit: 10 }),
        storage.getInvestmentPrograms({ search: term, limit: 10 }),
      ])
    )
  );

  // Deduplicate by id
  const govMap = new Map<number, DiscoverProject>();
  const invMap = new Map<number, DiscoverProject>();

  for (const [govResult, invResult] of allResults) {
    for (const p of govResult.data) {
      if (!govMap.has(p.id)) {
        govMap.set(p.id, {
          id: p.id,
          type: "government",
          title: p.title,
          organization: p.organization,
          description: p.description?.substring(0, 200) || null,
          status: p.status,
          region: p.region,
          endDate: p.endDate,
          supportAmount: p.supportAmount,
          supportType: p.supportType,
          applicationUrl: p.applicationUrl || null,
          sourceUrl: p.sourceUrl || null,
        });
      }
    }
    for (const p of invResult.data) {
      if (!invMap.has(p.id)) {
        invMap.set(p.id, {
          id: p.id,
          type: "investment",
          title: p.title,
          organization: p.organization,
          description: p.description?.substring(0, 200) || null,
          status: p.status,
          region: null,
          endDate: p.endDate,
          supportAmount: p.investmentScale,
          investorType: p.investorType,
          applicationUrl: p.applicationUrl || null,
          sourceUrl: p.websiteUrl || null,
        });
      }
    }
  }

  return {
    governmentProjects: Array.from(govMap.values()).slice(0, 15),
    investmentProjects: Array.from(invMap.values()).slice(0, 15),
  };
}

export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  const prompt = `당신은 한국 정부지원사업 및 창업/투자 전문가입니다.
사용자가 "${query}" 에 대해 검색했습니다.

이 검색어와 관련된 유용한 한국 웹사이트/정보를 5~8개 추천해주세요.
실제로 존재하는 한국 정부 및 공공기관 웹사이트, 뉴스, 블로그 등을 추천하세요.

반드시 아래 JSON 배열 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):
[
  {
    "title": "<페이지 제목 (한국어)>",
    "url": "<실제 URL>",
    "snippet": "<1~2문장 설명 (한국어)>"
  }
]

추천 시 다음 사이트들을 우선 고려하세요:
- K-스타트업 (k-startup.go.kr)
- 기업마당 (bizinfo.go.kr)
- 중소벤처기업부 (mss.go.kr)
- 창업진흥원 (kised.or.kr)
- 소상공인시장진흥공단 (semas.or.kr)
- 정부24 (gov.kr)
- 보조금24 (subsidy.go.kr)
- 관련 뉴스/블로그`;

  try {
    const responseText = await callGemini(prompt);
    let jsonStr = responseText.trim();

    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
    }

    const results: WebSearchResult[] = JSON.parse(jsonStr);
    return results
      .filter(r => r.title && r.url && r.snippet)
      .slice(0, 8);
  } catch (err: any) {
    logger.error("Gemini 웹 검색 실패", err.message);
    return getDefaultWebResults(query);
  }
}

function getDefaultWebResults(query: string): WebSearchResult[] {
  const encoded = encodeURIComponent(query);
  return [
    {
      title: `K-스타트업 - "${query}" 관련 지원사업`,
      url: `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schStr=${encoded}`,
      snippet: "K-스타트업에서 관련 창업지원사업을 검색해보세요.",
    },
    {
      title: `기업마당 - "${query}" 지원시책 검색`,
      url: `https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?search=${encoded}`,
      snippet: "기업마당에서 중소기업 지원시책을 확인할 수 있습니다.",
    },
    {
      title: `보조금24 - 맞춤형 보조금 검색`,
      url: "https://www.gov.kr/subsidy",
      snippet: "정부 보조금을 한눈에 조회하고 신청할 수 있는 통합 서비스입니다.",
    },
    {
      title: `중소벤처기업부 - 정책 정보`,
      url: "https://www.mss.go.kr/site/smba/main.do",
      snippet: "중소벤처기업부의 최신 정책 및 지원사업 정보를 확인하세요.",
    },
    {
      title: `소상공인시장진흥공단`,
      url: "https://www.semas.or.kr",
      snippet: "소상공인을 위한 경영지원, 교육, 자금 등 다양한 지원 서비스를 제공합니다.",
    },
  ];
}
