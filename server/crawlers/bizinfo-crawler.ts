import { config } from "../config";
import { logger } from "../logger";
import type { InsertGovernmentProgram } from "@shared/schema";

const API_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

interface BizInfoItem {
  pblancNm?: string;
  jrsdInsttNm?: string;
  reqstBeginEndDe?: string;
  creatPnttm?: string;
  pblancUrl?: string;
  bsnsSumryCn?: string;
  trgetNm?: string;
  sprtCn?: string;
  pblancId?: string;
}

function parseDateRange(dateRange?: string): { startDate: string | null; endDate: string | null } {
  if (!dateRange) return { startDate: null, endDate: null };
  const parts = dateRange.split("~").map(s => s.trim());
  return {
    startDate: parts[0] || null,
    endDate: parts[1] || null,
  };
}

function determineProgramStatus(startDate?: string | null, endDate?: string | null): string {
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

function classifySupportType(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.toLowerCase();
  if (text.includes("예비창업")) return "예비창업패키지";
  if (text.includes("초기창업")) return "초기창업패키지";
  if (text.includes("창업도약") || text.includes("도약패키지")) return "도약패키지";
  if (text.includes("기술개발") || text.includes("r&d") || text.includes("연구개발") || text.includes("기술혁신")) return "기술개발";
  if (text.includes("사업화") || text.includes("스케일업") || text.includes("성장지원")) return "사업화지원";
  if (text.includes("멘토") || text.includes("컨설팅") || text.includes("자문") || text.includes("코칭")) return "멘토링_컨설팅";
  if (text.includes("시설") || text.includes("공간") || text.includes("입주") || text.includes("인큐베이")) return "시설_공간";
  if (text.includes("해외") || text.includes("글로벌") || text.includes("수출") || text.includes("통상")) return "해외진출";
  if (text.includes("융자") || text.includes("정책자금") || text.includes("대출") || text.includes("보증")) return "정책자금";
  return "기타지원";
}

export async function crawlBizinfo(): Promise<InsertGovernmentProgram[]> {
  if (!config.bizinfoApiKey) {
    throw new Error("BIZINFO_API_KEY가 설정되지 않았습니다.");
  }

  const programs: InsertGovernmentProgram[] = [];
  let pageNo = 1;
  const numOfRows = 100;
  let totalCount = 0;

  do {
    const url = new URL(API_URL);
    url.searchParams.set("crtfcKey", config.bizinfoApiKey);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("dataFmt", "json");
    url.searchParams.set("numOfRows", String(numOfRows));

    logger.info(`기업마당 크롤링 페이지 ${pageNo}...`);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        logger.error(`기업마당 API 응답 오류: ${res.status}`);
        break;
      }

      const json = await res.json();
      const rawItems: BizInfoItem[] = json?.dataList || json?.items || [];
      const items = Array.isArray(rawItems) ? rawItems : [];

      if (items.length === 0) break;

      // totalCount가 없으면 현재 페이지 결과 수로 추정 (꽉 차면 다음 페이지 존재)
      if (pageNo === 1) {
        totalCount = json?.totalCount || json?.total || 0;
        if (totalCount === 0 && items.length === numOfRows) {
          // totalCount를 알 수 없으므로 큰 값으로 설정하여 다음 페이지 시도
          totalCount = numOfRows * 100;
        } else if (totalCount === 0) {
          totalCount = items.length;
        }
      }

      for (const item of items) {
        if (!item.pblancNm) continue;

        const { startDate, endDate } = parseDateRange(item.reqstBeginEndDe);

        programs.push({
          title: item.pblancNm,
          organization: item.jrsdInsttNm || null,
          supportType: classifySupportType(item.pblancNm, item.bsnsSumryCn || undefined) as any,
          status: determineProgramStatus(startDate, endDate) as any,
          description: item.bsnsSumryCn || null,
          targetAudience: item.trgetNm || null,
          supportAmount: item.sprtCn || null,
          applicationMethod: null,
          applicationUrl: item.pblancUrl || null,
          region: null,
          startDate,
          endDate,
          announcementDate: item.creatPnttm || null,
          sourceUrl: item.pblancUrl || null,
          sourceId: item.pblancId || null,
          source: "bizinfo",
        });
      }

      if (pageNo * numOfRows < totalCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      logger.error(`기업마당 크롤링 페이지 ${pageNo} 실패`, err);
      break;
    }

    pageNo++;
  } while ((pageNo - 1) * numOfRows < totalCount);

  logger.info(`기업마당 크롤링 완료: ${programs.length}건 수집`);
  return programs;
}
