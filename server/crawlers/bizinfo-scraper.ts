import * as cheerio from "cheerio";
import { logger } from "../logger";
import type { InsertGovernmentProgram } from "@shared/schema";

const BASE_URL = "https://www.bizinfo.go.kr";

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

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
};

function classifySupportType(title: string): string {
  const text = title.toLowerCase();
  if (text.includes("예비창업")) return "예비창업패키지";
  if (text.includes("초기창업")) return "초기창업패키지";
  if (text.includes("도약") || text.includes("창업도약")) return "도약패키지";
  if (text.includes("r&d") || text.includes("기술개발") || text.includes("연구") || text.includes("혁신")) return "기술개발";
  if (text.includes("사업화") || text.includes("성장") || text.includes("스케일업") || text.includes("지원사업")) return "사업화지원";
  if (text.includes("멘토") || text.includes("컨설팅") || text.includes("교육") || text.includes("설명회") || text.includes("강의")) return "멘토링_컨설팅";
  if (text.includes("시설") || text.includes("공간") || text.includes("입주") || text.includes("인큐베이")) return "시설_공간";
  if (text.includes("해외") || text.includes("글로벌") || text.includes("수출") || text.includes("통상")) return "해외진출";
  if (text.includes("융자") || text.includes("정책자금") || text.includes("대출") || text.includes("보증") || text.includes("이자")) return "정책자금";
  return "기타지원";
}

function extractRegion(title: string): string | null {
  const match = title.match(/\[([가-힣]+)\]/);
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}

interface BizinfoDetail {
  description: string | null;
  targetAudience: string | null;
  excludedTargets: string | null;
  supportAmount: string | null;
  supportDetails: string | null;
  applicationMethod: string | null;
  requiredDocuments: string | null;
  selectionProcess: string | null;
  contactInfo: string | null;
  organization: string | null;
  startDate: string | null;
  endDate: string | null;
  attachmentUrls: string | null;
}

async function fetchBizinfoDetail(detailUrl: string): Promise<BizinfoDetail> {
  const empty: BizinfoDetail = {
    description: null, targetAudience: null, excludedTargets: null,
    supportAmount: null, supportDetails: null, applicationMethod: null,
    requiredDocuments: null, selectionProcess: null, contactInfo: null,
    organization: null, startDate: null, endDate: null, attachmentUrls: null,
  };

  try {
    const res = await fetch(detailUrl, { headers: HEADERS });
    if (!res.ok) return empty;

    const html = await res.text();
    const $ = cheerio.load(html);
    const result: BizinfoDetail = { ...empty };

    // bizinfo 상세 페이지: <span class="s_title">라벨</span> + <div class="txt">값</div> 구조
    $("li").each((_, li) => {
      const $li = $(li);
      const label = cleanText($li.find("span.s_title").text());
      const valueEl = $li.find("div.txt");
      const value = cleanText(valueEl.text());
      if (!label || !value) return;

      if (label.includes("소관부처") || label.includes("지자체")) {
        // 소관부처 is the ministry - can include in organization
        if (!result.organization) result.organization = value;
      }
      if (label.includes("사업수행기관") || label.includes("수행기관")) {
        result.organization = value; // override with actual implementing org
      }
      if (label.includes("신청기간") || label.includes("접수기간") || label.includes("모집기간")) {
        const dates = value.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})/g);
        if (dates && dates.length >= 1) result.startDate = dates[0].replace(/\./g, "-");
        if (dates && dates.length >= 2) result.endDate = dates[1].replace(/\./g, "-");
      }
      if (label.includes("사업개요") || label.includes("개요")) {
        // Get HTML content for better parsing
        const htmlContent = valueEl.html() || "";
        // Convert <p> and <br> to newlines, strip other tags
        const parsed = htmlContent
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        if (parsed.length > 10) result.description = parsed;
      }
      if (label.includes("신청대상") || label.includes("지원대상") || label.includes("참여대상")) {
        result.targetAudience = value;
      }
      if (label.includes("제외대상") || label.includes("배제대상")) {
        result.excludedTargets = value;
      }
      if (label.includes("지원규모") || label.includes("지원금액") || label.includes("지원내용")) {
        result.supportDetails = value;
        if (!result.supportAmount) result.supportAmount = value;
      }
      if (label.includes("신청방법") || label.includes("접수방법") || label.includes("사업신청 방법")) {
        result.applicationMethod = value;
      }
      if (label.includes("사업신청 사이트")) {
        if (!result.applicationMethod) {
          result.applicationMethod = value;
        }
      }
      if (label.includes("제출서류") || label.includes("구비서류")) {
        result.requiredDocuments = value;
      }
      if (label.includes("선정절차") || label.includes("심사") || label.includes("평가기준")) {
        result.selectionProcess = value;
      }
      if (label.includes("문의처") || label.includes("문의") || label.includes("연락처") || label.includes("담당부서")) {
        result.contactInfo = value;
      }
    });

    // 사업개요에서 지원대상/지원내용 추출 (개요에 포함된 경우)
    if (result.description && !result.targetAudience) {
      const lines = result.description.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("☞") || trimmed.startsWith("○") || trimmed.startsWith("●")) {
          const content = trimmed.replace(/^[☞○●]\s*/, "");
          if (content.includes("대상") || content.includes("사업자") || content.includes("기업")) {
            if (!result.targetAudience) result.targetAudience = content;
          }
        }
      }
    }

    // 첨부파일: .file_name 클래스 또는 attached_file_list 내의 링크
    const attachments: string[] = [];
    $(".file_name, .attached_file_list .file_name").each((_, el) => {
      const fileName = cleanText($(el).text());
      if (fileName && fileName.length > 2) attachments.push(fileName);
    });
    // fallback: a 태그에서
    if (attachments.length === 0) {
      $("a[href*='fileDown']").each((_, el) => {
        const fileName = cleanText($(el).text());
        if (fileName && fileName.length > 2) attachments.push(fileName);
      });
    }
    if (attachments.length > 0) {
      result.attachmentUrls = attachments.join("\n");
    }

    return result;
  } catch (err) {
    logger.warn(`기업마당 상세 페이지 파싱 실패: ${detailUrl}`, err);
    return empty;
  }
}

export async function scrapeBizinfo(): Promise<InsertGovernmentProgram[]> {
  logger.info("기업마당 웹 스크래핑 시작...");

  const programs: InsertGovernmentProgram[] = [];
  const maxPages = 3;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${BASE_URL}/sii/siia/selectSIIA200View.do?rows=15&cpage=${page}&schEndAt=N`;
      logger.info(`기업마당 페이지 ${page} 스크래핑...`);

      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) {
        logger.error(`기업마당 페이지 응답 오류: ${res.status}`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const links = $('a[href*="selectSIIA200Detail"]');
      if (links.length === 0) {
        logger.info(`기업마당 페이지 ${page}: 공고 없음, 종료`);
        break;
      }

      const items: { title: string; pblancId: string; detailUrl: string; region: string | null; supportType: string }[] = [];

      links.each((_, el) => {
        const $el = $(el);
        const title = $el.attr("title")?.replace(" 페이지 이동", "").trim();
        if (!title) return;

        const href = $el.attr("href") || "";
        const idMatch = href.match(/pblancId=([A-Z0-9_]+)/);
        const pblancId = idMatch ? idMatch[1] : null;
        if (!pblancId) return;

        const region = extractRegion(title);
        const supportType = classifySupportType(title);
        const detailUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

        items.push({
          title: title.replace(/^\[[가-힣]+\]\s*/, ""),
          pblancId,
          detailUrl,
          region,
          supportType,
        });
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        logger.info(`  [${(page - 1) * 15 + i + 1}] 상세 가져오는 중: ${item.title.substring(0, 40)}...`);

        await new Promise(resolve => setTimeout(resolve, 600));
        const detail = await fetchBizinfoDetail(item.detailUrl);

        programs.push({
          title: item.title,
          organization: detail.organization,
          supportType: item.supportType as any,
          status: determineProgramStatus(detail.startDate, detail.endDate) as any,
          description: detail.description,
          targetAudience: detail.targetAudience,
          supportAmount: detail.supportAmount,
          supportDetails: detail.supportDetails,
          applicationMethod: detail.applicationMethod,
          applicationUrl: item.detailUrl,
          region: item.region,
          startDate: detail.startDate,
          endDate: detail.endDate,
          announcementDate: null,
          requiredDocuments: detail.requiredDocuments,
          selectionProcess: detail.selectionProcess,
          contactInfo: detail.contactInfo,
          excludedTargets: detail.excludedTargets,
          attachmentUrls: detail.attachmentUrls,
          sourceUrl: item.detailUrl,
          sourceId: `bizinfo-${item.pblancId}`,
          source: "bizinfo",
        });
      }

      if (page < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (err) {
    logger.error("기업마당 웹 스크래핑 실패", err);
    throw err;
  }

  logger.info(`기업마당 웹 스크래핑 완료: ${programs.length}건 수집`);
  return programs;
}
