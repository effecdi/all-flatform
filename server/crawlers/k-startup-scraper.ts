import * as cheerio from "cheerio";
import { logger } from "../logger";
import type { InsertGovernmentProgram } from "@shared/schema";

const BASE_URL = "https://www.k-startup.go.kr";
const LIST_URL = `${BASE_URL}/web/contents/bizpbanc-ongoing.do`;

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

function classifySupportType(title: string, flagText?: string): string {
  const text = `${title} ${flagText || ""}`;
  if (text.includes("예비창업")) return "예비창업패키지";
  if (text.includes("초기창업")) return "초기창업패키지";
  if (text.includes("도약") || text.includes("창업도약")) return "도약패키지";
  if (text.includes("TIPS") || text.includes("팁스")) return "기술개발";
  if (text.includes("R&D") || text.includes("기술개발") || text.includes("연구")) return "기술개발";
  if (text.includes("사업화") || text.includes("성장")) return "사업화지원";
  if (text.includes("멘토") || text.includes("컨설팅") || text.includes("교육") || text.includes("강의") || text.includes("설명회")) return "멘토링_컨설팅";
  if (text.includes("시설") || text.includes("공간") || text.includes("입주")) return "시설_공간";
  if (text.includes("해외") || text.includes("글로벌") || text.includes("수출") || text.includes("Global")) return "해외진출";
  if (text.includes("융자") || text.includes("정책자금") || text.includes("대출") || text.includes("보증")) return "정책자금";
  if (flagText) {
    if (flagText.includes("사업화")) return "사업화지원";
    if (flagText.includes("글로벌")) return "해외진출";
    if (flagText.includes("기술개발") || flagText.includes("R&D")) return "기술개발";
    if (flagText.includes("창업교육") || flagText.includes("멘토링")) return "멘토링_컨설팅";
    if (flagText.includes("시설") || flagText.includes("공간")) return "시설_공간";
    if (flagText.includes("정책자금") || flagText.includes("융자")) return "정책자금";
  }
  return "기타지원";
}

function parseEndDate(text: string): string | null {
  const match = text.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function parseDday(text: string): number | null {
  const match = text.match(/D-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}

interface DetailData {
  description: string | null;
  targetAudience: string | null;
  excludedTargets: string | null;
  supportAmount: string | null;
  supportDetails: string | null;
  applicationMethod: string | null;
  requiredDocuments: string | null;
  selectionProcess: string | null;
  contactInfo: string | null;
  region: string | null;
  startDate: string | null;
  endDate: string | null;
  organization: string | null;
  attachmentUrls: string | null;
}

async function fetchDetailPage(pbancSn: string): Promise<DetailData> {
  const empty: DetailData = {
    description: null, targetAudience: null, excludedTargets: null,
    supportAmount: null, supportDetails: null, applicationMethod: null,
    requiredDocuments: null, selectionProcess: null, contactInfo: null,
    region: null, startDate: null, endDate: null, organization: null,
    attachmentUrls: null,
  };

  try {
    const url = `${LIST_URL}?schM=view&pbancSn=${pbancSn}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return empty;

    const html = await res.text();
    const $ = cheerio.load(html);

    const result: DetailData = { ...empty };

    // === 상단 정보 박스 (information_box-wrap) ===
    $(".information_box-wrap .title_wrap .title").find(".tit").each((_, el) => {
      const label = $(el).text().trim();
      const valueEl = $(el).next(".txt");
      const value = cleanText(valueEl.text());
      if (!value) return;

      if (label.includes("접수기간")) {
        const dates = value.match(/(\d{4})\.(\d{2})\.(\d{2})/g);
        if (dates && dates.length >= 1) result.startDate = dates[0].replace(/\./g, "-");
        if (dates && dates.length >= 2) result.endDate = dates[1].replace(/\./g, "-");
      }
      if (label.includes("주관기관")) result.organization = value;
      if (label.includes("지역") && value.length < 50) result.region = value;
    });

    // === 사업 개요 (tit_bl) ===
    const overviewEl = $(".tit_bl");
    if (overviewEl.length) {
      const overviewText = cleanText(overviewEl.text());
      if (overviewText.length > 10) result.description = overviewText;
    }

    // === 각 information_list 섹션에서 추출 ===
    $(".information_list").each((_, section) => {
      const sectionTitle = $(section).find("> .title").first().text().trim();
      const items: string[] = [];

      $(section).find(".dot_list").each((_, li) => {
        const $li = $(li);
        // bl 클래스는 안내문구이므로 건너뛰기
        if ($li.hasClass("bl")) return;

        const itemTitle = $li.find("> .table_inner > .tit, > .tit").first().text().trim();
        const itemContent = cleanText(
          $li.find("> .table_inner > .txt, > .table_inner > div.txt, > .list_wrap .list, > .table_inner .list_wrap .list").text()
        );

        if (itemTitle && itemContent) {
          items.push(`${itemTitle}: ${itemContent}`);
        } else if (itemTitle) {
          items.push(itemTitle);
        }
      });

      const content = items.join("\n");
      if (!content) return;

      if (sectionTitle.includes("신청방법") || sectionTitle.includes("신청")) {
        // 신청방법/대상 섹션에서 세부 항목 분리
        items.forEach(item => {
          if (item.startsWith("신청기간")) {
            const dates = item.match(/(\d{4})\.(\d{2})\.(\d{2})/g);
            if (dates && dates.length >= 1 && !result.startDate) result.startDate = dates[0].replace(/\./g, "-");
            if (dates && dates.length >= 2 && !result.endDate) result.endDate = dates[1].replace(/\./g, "-");
          }
          if (item.startsWith("신청방법")) result.applicationMethod = item.replace("신청방법: ", "");
          if (item.startsWith("신청대상")) result.targetAudience = item.replace("신청대상: ", "");
          if (item.startsWith("제외대상")) result.excludedTargets = item.replace("제외대상: ", "");
        });
      } else if (sectionTitle.includes("제출서류")) {
        result.requiredDocuments = content;
      } else if (sectionTitle.includes("선정절차") || sectionTitle.includes("평가")) {
        result.selectionProcess = content;
      } else if (sectionTitle.includes("지원내용") || sectionTitle.includes("지원규모")) {
        result.supportDetails = content;
        // supportAmount는 첫번째 항목에서
        if (items.length > 0) {
          result.supportAmount = items[0];
        }
      } else if (sectionTitle.includes("문의")) {
        result.contactInfo = content;
      }
    });

    // === 첨부파일 ===
    const attachments: string[] = [];
    $(".board_file a.file_bg").each((_, el) => {
      const fileName = $(el).attr("title")?.replace("[첨부파일] ", "") || $(el).text().trim();
      if (fileName) attachments.push(fileName);
    });
    if (attachments.length > 0) {
      result.attachmentUrls = attachments.join("\n");
    }

    return result;
  } catch (err) {
    logger.warn(`K-Startup 상세 페이지 파싱 실패: ${pbancSn}`, err);
    return empty;
  }
}

export async function scrapeKStartup(): Promise<InsertGovernmentProgram[]> {
  logger.info("K-Startup 웹 스크래핑 시작...");
  const programs: InsertGovernmentProgram[] = [];

  try {
    const res = await fetch(LIST_URL, { headers: HEADERS });
    if (!res.ok) throw new Error(`K-Startup 페이지 응답 오류: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const slides = $("div.slide");
    logger.info(`K-Startup 공고 ${slides.length}건 발견`);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides.eq(i);

      const linkHref = slide.find("a").attr("href") || "";
      const idMatch = linkHref.match(/go_view\((\d+)\)/);
      if (!idMatch) continue;
      const pbancSn = idMatch[1];

      const title = slide.find(".tit_wrap .tit").text().trim();
      if (!title) continue;

      const flagText = slide.find(".flag").first().text().trim();
      let endDate: string | null = null;
      const dateText = slide.find(".txt").text().trim();
      endDate = parseEndDate(dateText);

      const ddayText = slide.find(".flag.day").text().trim();
      const infoItems = slide.find("ul li");
      const organization = infoItems.length >= 2 ? infoItems.eq(1).text().trim() : null;

      if (!endDate && ddayText) {
        const ddays = parseDday(ddayText);
        if (ddays !== null) {
          const end = new Date();
          end.setDate(end.getDate() + ddays);
          endDate = end.toISOString().split("T")[0];
        }
      }

      const supportType = classifySupportType(title, flagText);
      const detailUrl = `${LIST_URL}?schM=view&pbancSn=${pbancSn}`;

      // 상세 페이지에서 전체 정보 가져오기
      logger.info(`  [${i + 1}/${slides.length}] 상세 가져오는 중: ${title.substring(0, 40)}...`);
      await new Promise(resolve => setTimeout(resolve, 800));
      const detail = await fetchDetailPage(pbancSn);

      programs.push({
        title,
        organization: detail.organization || organization || "창업진흥원",
        supportType: supportType as any,
        status: determineProgramStatus(detail.startDate, detail.endDate || endDate) as any,
        description: detail.description,
        targetAudience: detail.targetAudience,
        supportAmount: detail.supportAmount,
        supportDetails: detail.supportDetails,
        applicationMethod: detail.applicationMethod || "K-Startup(k-startup.go.kr) 온라인 접수",
        applicationUrl: detailUrl,
        region: detail.region,
        startDate: detail.startDate,
        endDate: detail.endDate || endDate,
        announcementDate: null,
        requiredDocuments: detail.requiredDocuments,
        selectionProcess: detail.selectionProcess,
        contactInfo: detail.contactInfo,
        excludedTargets: detail.excludedTargets,
        attachmentUrls: detail.attachmentUrls,
        sourceUrl: detailUrl,
        sourceId: `kstartup-${pbancSn}`,
        source: "k-startup",
      });
    }
  } catch (err) {
    logger.error("K-Startup 웹 스크래핑 실패", err);
    throw err;
  }

  logger.info(`K-Startup 웹 스크래핑 완료: ${programs.length}건 수집`);
  return programs;
}
