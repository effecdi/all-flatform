import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { ensureDefaultUser } from "./auth";
import { logger } from "./logger";

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet({ contentSecurityPolicy: undefined }));

// CORS
app.use(cors({ origin: true, credentials: true }));

// 전역 rate limit — 분당 100회
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
  })
);

// AI 추천 rate limit — 분당 3회
app.use(
  "/api/recommendations/generate",
  rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "AI 추천은 1분에 3회까지 가능합니다." },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 서버리스 환경에서 최초 요청 시 초기화 (lazy init)
let initialized = false;
let initError: Error | null = null;

const initPromise = (async () => {
  try {
    await ensureDefaultUser();
    logger.info("기본 사용자 확인 완료");
  } catch (err) {
    logger.warn("기본 사용자 생성 실패 (무시하고 계속)", err);
  }

  try {
    await registerRoutes(httpServer, app);
  } catch (err: any) {
    logger.warn("라우트 등록 실패 (무시하고 계속)", err);
    initError = err;
  }

  try {
    const { storage } = await import("./storage");
    const { seedRealData } = await import("./seed");
    await seedRealData(storage);
  } catch (err) {
    logger.warn("데이터 시드 실패 (무시하고 계속)", err);
  }

  initialized = true;
})();

// Error handler
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  logger.error("Internal Server Error", err);
  if (res.headersSent) return next(err);
  const message =
    status >= 500
      ? "서버 내부 오류가 발생했습니다."
      : err.message || "Internal Server Error";
  return res.status(status).json({ message });
});

export default async function handler(req: Request, res: Response) {
  if (!initialized) await initPromise;
  return app(req, res);
}
