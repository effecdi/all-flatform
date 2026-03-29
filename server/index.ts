import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { logger } from "./logger";
import { validateProductionConfig, config } from "./config";
import { ensureDefaultUser } from "./auth";

validateProductionConfig();

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === "production" ? undefined : false,
}));

// CORS — 같은 origin만 허용 (프로덕션)
app.use(cors({
  origin: config.nodeEnv === "production"
    ? (process.env.ALLOWED_ORIGIN || true)
    : true,
  credentials: true,
}));

// 전역 rate limit — 분당 100회
app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
}));

// AI 추천 rate limit — 분당 3회 (Claude API 비용 보호)
app.use("/api/recommendations/generate", rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI 추천은 1분에 3회까지 가능합니다." },
}));

// Admin API rate limit — 분당 10회
app.use("/api/admin/", rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "관리자 API 요청 제한을 초과했습니다." },
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const logStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${logStr.length > 500 ? logStr.substring(0, 500) + "..." : logStr}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Ensure default user exists
    try {
      await ensureDefaultUser();
      logger.info("기본 사용자 확인 완료");
    } catch (err) {
      logger.warn("기본 사용자 생성 실패 (무시하고 계속)", err);
    }

    await registerRoutes(httpServer, app);

    const { storage } = await import("./storage");

    // 실제 프로그램 데이터 시드 (최초 실행 시)
    try {
      const { seedRealData } = await import("./seed");
      await seedRealData(storage);
    } catch (err) {
      logger.warn("데이터 시드 실패 (무시하고 계속)", err);
    }

    // 크롤링 스케줄러 등록 (production + development 모두)
    try {
      const { startCrawlScheduler } = await import("./crawlers/index");
      startCrawlScheduler(storage);
    } catch (err) {
      logger.warn("크롤링 스케줄러 시작 실패 (무시하고 계속)", err);
    }
  } catch (error: any) {
    logger.error("라우트 등록 중 오류 발생", error);
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "development") {
      logger.warn("인메모리 스토리지로 동작합니다.");
    } else {
      throw error;
    }
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    logger.error("Internal Server Error", err);
    if (res.headersSent) return next(err);
    const message =
      process.env.NODE_ENV === "production" && status >= 500
        ? "서버 내부 오류가 발생했습니다."
        : err.message || "Internal Server Error";
    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
