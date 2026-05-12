import { config } from "../config";
import { logger } from "../logger";
import type { InsertGovernmentProgram } from "@shared/schema";

const API_URL = "https://apis.data.go.kr/B552735/kisedKstartupService/getAnnouncementInformation";

function classifySupportType(title: string, category?: string): string {
  const text = `${title} ${category || ""}`.toLowerCase();
  if (text.includes("예비창업")) return "예비창업패키지";
  if (text.includes("초기창업")) return "초기창업패키지";
  if (text.includes("창업도약") || text.includes("도약")) return "도약패키지";
  if (text.includes("기술개발") || text.includes("r&d") || text.includes("연구")) return "기술개발";
  if (text.includes("사업화")) return "사업화지원";
  if (text.includes("멘토") || text.includes("컨설팅")) return "멘토링_컨설팅";
  if (text.includes("시설") || text.includes("공간") || text.includes("입주")) return "시설_공간";
  if (text.includes("해외") || text.includes("글로벌") || text.includes("수출")) return "해외진출";
  if (text.includes("융자") || text.includes("정책자금") || text.includes("대출")) return "정책자금";
  return "기타지원";
}

function determineProgramStatus(startDate?: string, endDate?: string): string {
  if (!endDate) return "모집중";
  const now = new Date();
  const end = new Date(endDate);
  if (end < now) return "모집마감";
  if (startDate) {
    const start = new Date(startDate);
    if (start > now) return "모집예정";
  }
  return "모집중";
}

interface KStartupItem {
  bizPblancNm?: string;
  excInsttNm?: string;
  pblancEndDt?: string;
  pblancBgngDt?: string;
  bizPblancSn?: string;
  pblancNtceDt?: string;
  bizPblancDtlCn?: string;
  sprtTrgtCn?: string;
  sprtCn?: string;
  reqstMthdCn?: string;
  pblancUrl?: string;
  ctprvnNm?: string;
}

export async function crawlKStartup(): Promise<InsertGovernmentProgram[]> {
  if (!config.dataGoKrApiKey) {
    throw new Error("DATA_GO_KR_API_KEY가 설정되지 않았습니다.");
  }

  const programs: InsertGovernmentProgram[] = [];
  let pageNo = 1;
  const numOfRows = 100;
  let totalCount = 0;

  do {
    const url = new URL(API_URL);
    url.searchParams.set("serviceKey", config.dataGoKrApiKey);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("numOfRows", String(numOfRows));
    url.searchParams.set("returnType", "json");

    logger.info(`K-Startup 크롤링 페이지 ${pageNo}...`);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        logger.error(`K-Startup API 응답 오류: ${res.status} ${res.statusText}`);
        break;
      }

      const json = await res.json();
      const body = json?.response?.body;
      if (!body) {
        logger.warn("K-Startup API 응답 형식 이상");
        break;
      }

      totalCount = body.totalCount || 0;
      const rawItems = body.items?.item;
      // API가 단일 결과일 때 배열이 아닌 객체를 반환할 수 있음 (XML→JSON 변환 특성)
      const items: KStartupItem[] = !rawItems ? [] : Array.isArray(rawItems) ? rawItems : [rawItems];

      if (items.length === 0) break;

      for (const item of items) {
        if (!item.bizPblancNm) continue;

        const startDate = item.pblancBgngDt || null;
        const endDate = item.pblancEndDt || null;

        programs.push({
          title: item.bizPblancNm,
          organization: item.excInsttNm || null,
          supportType: classifySupportType(item.bizPblancNm) as any,
          status: determineProgramStatus(startDate || undefined, endDate || undefined) as any,
          description: item.bizPblancDtlCn || null,
          targetAudience: item.sprtTrgtCn || null,
          supportAmount: item.sprtCn || null,
          applicationMethod: item.reqstMthdCn || null,
          applicationUrl: item.pblancUrl || null,
          region: item.ctprvnNm || null,
          startDate: startDate,
          endDate: endDate,
          announcementDate: item.pblancNtceDt || null,
          sourceUrl: item.pblancUrl || null,
          sourceId: item.bizPblancSn || null,
          source: "k-startup",
        });
      }

      // Rate limit: wait 1 second between requests
      if (pageNo * numOfRows < totalCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      logger.error(`K-Startup 크롤링 페이지 ${pageNo} 실패`, err);
      break;
    }

    pageNo++;
  } while ((pageNo - 1) * numOfRows < totalCount);

  logger.info(`K-Startup 크롤링 완료: ${programs.length}건 수집`);
  return programs;
}
