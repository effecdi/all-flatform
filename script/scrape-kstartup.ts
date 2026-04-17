/**
 * K-Startup 사이트 직접 스크래핑 스크립트
 * API 키 없이 실제 공고 데이터를 Neon DB에 삽입
 * 실행: DATABASE_URL=... tsx script/scrape-kstartup.ts
 */

import * as https from "https";
import * as http from "http";
import * as pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL 환경변수가 필요합니다.");
  process.exit(1);
}

const pool = new pg.default.Pool({ connectionString: DATABASE_URL });

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = (mod as typeof https).request(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.end();
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function classifySupportType(typeText: string): string {
  const t = typeText.toLowerCase();
  if (t.includes("사업화")) return "사업화지원";
  if (t.includes("기술개발") || t.includes("r&d")) return "기술개발";
  if (t.includes("멘토") || t.includes("컨설팅")) return "멘토링_컨설팅";
  if (t.includes("시설") || t.includes("공간") || t.includes("입주")) return "시설_공간";
  if (t.includes("해외") || t.includes("글로벌")) return "해외진출";
  if (t.includes("융자") || t.includes("정책자금")) return "정책자금";
  if (t.includes("예비창업")) return "예비창업패키지";
  if (t.includes("초기창업")) return "초기창업패키지";
  if (t.includes("도약")) return "도약패키지";
  return "기타지원";
}

function parsePrograms(html: string): Array<{
  pbancSn: string;
  title: string;
  organization: string;
  supportType: string;
  endDate: string | null;
  category: string;
}> {
  const programs: Array<{
    pbancSn: string;
    title: string;
    organization: string;
    supportType: string;
    endDate: string | null;
    category: string;
  }> = [];

  // go_view(ID) 패턴 찾기
  const goViewRegex = /go_view\((\d+)\)/g;
  let match;

  while ((match = goViewRegex.exec(html)) !== null) {
    const pbancSn = match[1];
    if (parseInt(pbancSn) < 10000) continue; // 함수 정의 등 제외

    // 해당 pbancSn 주변 블록 추출
    const pos = match.index;
    const blockStart = html.lastIndexOf("<a ", pos);
    const blockEnd = html.indexOf("</a>", pos);
    if (blockStart === -1 || blockEnd === -1) continue;

    const block = html.substring(blockStart, blockEnd + 4);

    // 마감일 추출
    const dateMatch = block.match(/마감일자\s*([\d-]+)/);
    const endDate = dateMatch ? dateMatch[1] : null;

    // 제목 추출 (.tit)
    const titMatch = block.match(/<p class="tit">([\s\S]*?)(?:<span|<\/p>)/);
    const title = titMatch
      ? titMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    if (!title) continue;

    // 유형 추출 (flag type)
    const typeMatch = block.match(/<span class="flag type\d+">\s*([^<]+)\s*<\/span>/);
    const typeText = typeMatch ? typeMatch[1].trim() : "";

    // li 태그들 (사업유형, 주관기관, 조회수)
    const liMatches = [...block.matchAll(/<li>([^<]+)<\/li>/g)];
    const category = liMatches[0]?.[1]?.trim() || "";
    const organization = liMatches[1]?.[1]?.trim() || "";

    programs.push({
      pbancSn,
      title,
      organization,
      supportType: classifySupportType(typeText || category),
      endDate,
      category,
    });
  }

  return programs;
}

function determineStatus(endDate: string | null): string {
  if (!endDate) return "모집중";
  const end = new Date(endDate);
  const now = new Date();
  if (end < now) return "모집마감";
  return "모집중";
}

async function upsertProgram(program: {
  pbancSn: string;
  title: string;
  organization: string;
  supportType: string;
  endDate: string | null;
  category: string;
}) {
  const status = determineStatus(program.endDate);
  const description = `${program.category} 사업입니다. 자세한 내용은 K-Startup 공고를 확인하세요.`;
  const applicationUrl = `https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=${program.pbancSn}`;

  await pool.query(
    `INSERT INTO government_programs
      (title, organization, support_type, status, description, application_url, source_id, source, region, created_at, updated_at, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
     ON CONFLICT (source_id) DO UPDATE SET
       title = EXCLUDED.title,
       organization = EXCLUDED.organization,
       status = EXCLUDED.status,
       end_date = EXCLUDED.end_date,
       updated_at = NOW()`,
    [
      program.title,
      program.organization || "창업진흥원",
      program.supportType,
      status,
      description,
      applicationUrl,
      `kstartup-${program.pbancSn}`,
      "crawled",
      "전국",
      program.endDate,
    ]
  );
}

async function main() {
  console.log("K-Startup 스크래핑 시작...");

  let totalInserted = 0;
  const BASE_URL = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do";

  // 페이지 1부터 스크래핑
  for (let page = 1; page <= 20; page++) {
    const url = page === 1
      ? BASE_URL
      : `${BASE_URL}?schM=list&page=${page}&pbancSn=&searchType=&bizTrgtAgeCdList=&bizEnyyCdList=&aplyTrgtCdList=&sprvInstSn=&indSn=&schStr=&pageIndex=${page}`;

    console.log(`페이지 ${page}/20 스크래핑 중...`);

    try {
      const html = await fetchPage(url);
      const programs = parsePrograms(html);

      if (programs.length === 0) {
        console.log(`페이지 ${page}: 프로그램 없음, 종료`);
        break;
      }

      console.log(`페이지 ${page}: ${programs.length}개 발견`);

      for (const prog of programs) {
        try {
          await upsertProgram(prog);
          totalInserted++;
        } catch (err: any) {
          console.warn(`  오류 (${prog.pbancSn}): ${err.message}`);
        }
      }

      await sleep(1000); // 서버 부하 방지
    } catch (err: any) {
      console.error(`페이지 ${page} 오류:`, err.message);
      break;
    }
  }

  console.log(`\n완료! 총 ${totalInserted}개 프로그램 DB에 삽입됨`);
  await pool.end();
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
