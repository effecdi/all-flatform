import cron from "node-cron";
import { logger } from "../logger";
import type { IStorage } from "../storage";
import type { CrawlLog } from "@shared/schema";
import { config } from "../config";

export async function runCrawler(
  source: string,
  storage: IStorage
): Promise<CrawlLog> {
  const startTime = Date.now();

  try {
    let programs;

    if (source === "k-startup") {
      // API 키 있으면 API 사용, 없으면 웹 스크래핑
      if (config.dataGoKrApiKey) {
        logger.info("K-Startup API 크롤링 (API 키 사용)...");
        const { crawlKStartup } = await import("./k-startup-crawler");
        programs = await crawlKStartup();
      } else {
        logger.info("K-Startup 웹 스크래핑 (API 키 없음)...");
        const { scrapeKStartup } = await import("./k-startup-scraper");
        programs = await scrapeKStartup();
      }
    } else if (source === "bizinfo") {
      // API 키 있으면 API 사용, 없으면 웹 스크래핑
      if (config.bizinfoApiKey) {
        logger.info("기업마당 API 크롤링 (API 키 사용)...");
        const { crawlBizinfo } = await import("./bizinfo-crawler");
        programs = await crawlBizinfo();
      } else {
        logger.info("기업마당 웹 스크래핑 (API 키 없음)...");
        const { scrapeBizinfo } = await import("./bizinfo-scraper");
        programs = await scrapeBizinfo();
      }
    } else {
      throw new Error(`알 수 없는 소스: ${source}`);
    }

    const result = await storage.bulkUpsertGovernmentPrograms(programs);
    const durationMs = Date.now() - startTime;

    const log = await storage.createCrawlLog({
      source,
      status: "success",
      programsFound: programs.length,
      programsCreated: result.created,
      programsUpdated: result.updated,
      errorMessage: null,
      durationMs,
    });

    logger.info(`크롤링 완료 [${source}]: ${programs.length}건 수집, ${result.created}건 생성, ${result.updated}건 갱신 (${durationMs}ms)`);
    return log;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const log = await storage.createCrawlLog({
      source,
      status: "error",
      programsFound: 0,
      programsCreated: 0,
      programsUpdated: 0,
      errorMessage: err.message || String(err),
      durationMs,
    });

    logger.error(`크롤링 실패 [${source}]`, err);
    return log;
  }
}

export async function runAllCrawlers(storage: IStorage) {
  logger.info("전체 크롤링 시작...");
  try {
    await runCrawler("k-startup", storage);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await runCrawler("bizinfo", storage);
  } catch (err) {
    logger.error("크롤링 실패", err);
  }
  logger.info("전체 크롤링 완료");
}

export function startCrawlScheduler(storage: IStorage) {
  // 서버 시작 후 10초 뒤에 첫 크롤링 실행
  setTimeout(() => {
    runAllCrawlers(storage);
  }, 10_000);

  // 매일 06:00, 12:00, 18:00 KST에 크롤링 (21:00, 03:00, 09:00 UTC)
  cron.schedule("0 21,3,9 * * *", async () => {
    logger.info("스케줄된 크롤링 시작...");
    await runAllCrawlers(storage);
  });

  logger.info("크롤링 스케줄러 등록 완료 (매일 06:00/12:00/18:00 KST + 서버 시작 10초 후)");
}
