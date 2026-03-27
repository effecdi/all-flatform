import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessProfileSchema, insertInvestmentProgramSchema, insertPortfolioSchema } from "@shared/schema";
import { logger } from "./logger";
import { requireAuth, requireAdmin } from "./auth-middleware";
import { DESIGN_TOKENS } from "@shared/design-tokens";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =====================
  // Auth (static default user)
  // =====================

  app.get("/api/auth/me", (_req, res) => {
    res.json({
      id: 1,
      email: "user@all-flatform.kr",
      name: "기본 사용자",
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // =====================
  // Business Profile
  // =====================

  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile(req.user!.id);
      res.json(profile || null);
    } catch (err) {
      logger.error("GET /api/profile 실패", err);
      res.status(500).json({ message: "프로필 조회에 실패했습니다." });
    }
  });

  app.post("/api/profile", requireAuth, async (req, res) => {
    try {
      const parsed = insertBusinessProfileSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({
          message: "입력값이 올바르지 않습니다.",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const profile = await storage.upsertBusinessProfile(parsed.data);
      res.json(profile);
    } catch (err) {
      logger.error("POST /api/profile 실패", err);
      res.status(500).json({ message: "프로필 저장에 실패했습니다." });
    }
  });

  // =====================
  // Government Programs
  // =====================

  app.get("/api/programs/government", async (req, res) => {
    try {
      const { supportType, status, region, search, deadline, page, limit } = req.query as Record<string, string | undefined>;
      const result = await storage.getGovernmentPrograms({
        supportType,
        status,
        region,
        search,
        deadline: deadline === "true",
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      res.json(result);
    } catch (err) {
      logger.error("GET /api/programs/government 실패", err);
      res.status(500).json({ message: "프로그램 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/programs/government/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const program = await storage.getGovernmentProgram(id);
      if (!program) return res.status(404).json({ message: "프로그램을 찾을 수 없습니다." });
      res.json(program);
    } catch (err) {
      logger.error("GET /api/programs/government/:id 실패", err);
      res.status(500).json({ message: "프로그램 조회에 실패했습니다." });
    }
  });

  // =====================
  // Investment Programs
  // =====================

  app.get("/api/programs/investment", async (req, res) => {
    try {
      const { investorType, status, search, page, limit } = req.query as Record<string, string | undefined>;
      const result = await storage.getInvestmentPrograms({
        investorType,
        status,
        search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      res.json(result);
    } catch (err) {
      logger.error("GET /api/programs/investment 실패", err);
      res.status(500).json({ message: "투자 프로그램 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/programs/investment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const program = await storage.getInvestmentProgram(id);
      if (!program) return res.status(404).json({ message: "프로그램을 찾을 수 없습니다." });
      res.json(program);
    } catch (err) {
      logger.error("GET /api/programs/investment/:id 실패", err);
      res.status(500).json({ message: "프로그램 조회에 실패했습니다." });
    }
  });

  // =====================
  // Bookmarks
  // =====================

  app.get("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const list = await storage.getBookmarks(req.user!.id);
      res.json(list);
    } catch (err) {
      logger.error("GET /api/bookmarks 실패", err);
      res.status(500).json({ message: "북마크 조회에 실패했습니다." });
    }
  });

  app.post("/api/bookmarks", requireAuth, async (req, res) => {
    try {
      const { programType, programId } = req.body as {
        programType?: string;
        programId?: number;
      };
      if (!programType || !programId) {
        return res.status(400).json({ message: "programType과 programId가 필요합니다." });
      }
      if (!["government", "investment"].includes(programType)) {
        return res.status(400).json({ message: "programType은 government 또는 investment이어야 합니다." });
      }
      const bookmark = await storage.addBookmark({
        userId: req.user!.id,
        programType,
        programId,
      });
      res.status(201).json(bookmark);
    } catch (err) {
      logger.error("POST /api/bookmarks 실패", err);
      res.status(500).json({ message: "북마크 추가에 실패했습니다." });
    }
  });

  app.delete("/api/bookmarks/:type/:id", requireAuth, async (req, res) => {
    try {
      const programType = req.params.type as string;
      const programId = parseInt(req.params.id as string, 10);
      if (isNaN(programId)) return res.status(400).json({ message: "잘못된 ID" });
      const deleted = await storage.removeBookmark(req.user!.id, programType, programId);
      if (!deleted) return res.status(404).json({ message: "북마크를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (err) {
      logger.error("DELETE /api/bookmarks/:type/:id 실패", err);
      res.status(500).json({ message: "북마크 삭제에 실패했습니다." });
    }
  });

  // =====================
  // AI Recommendations
  // =====================

  app.post("/api/recommendations/generate", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile(req.user!.id);
      if (!profile) {
        return res.status(400).json({ message: "먼저 사업 프로필을 작성해주세요." });
      }

      const { generateRecommendations } = await import("./ai-recommender");
      const result = await generateRecommendations(req.user!.id, profile, storage);
      res.json(result);
    } catch (err: any) {
      logger.error("POST /api/recommendations/generate 실패", err);
      res.status(500).json({ message: err.message || "AI 추천 생성에 실패했습니다." });
    }
  });

  app.get("/api/recommendations", requireAuth, async (req, res) => {
    try {
      const list = await storage.getRecommendations(req.user!.id);
      res.json(list);
    } catch (err) {
      logger.error("GET /api/recommendations 실패", err);
      res.status(500).json({ message: "추천 목록 조회에 실패했습니다." });
    }
  });

  // =====================
  // Discover (Search + Web)
  // =====================

  // Fast: internal DB search only
  app.get("/api/discover/programs", async (req, res) => {
    try {
      const query = (req.query.query as string || "").trim();
      if (!query) {
        return res.status(400).json({ message: "검색어를 입력해주세요." });
      }
      const { searchPrograms } = await import("./search-service");
      const result = await searchPrograms(query, storage);
      res.json(result);
    } catch (err: any) {
      logger.error("GET /api/discover/programs 실패", err);
      res.status(500).json({ message: err.message || "프로그램 검색에 실패했습니다." });
    }
  });

  // Slower: AI-powered web search
  app.get("/api/discover/web", async (req, res) => {
    try {
      const query = (req.query.query as string || "").trim();
      if (!query) {
        return res.status(400).json({ message: "검색어를 입력해주세요." });
      }
      const { searchWeb } = await import("./search-service");
      const results = await searchWeb(query);
      res.json({ webResults: results });
    } catch (err: any) {
      logger.error("GET /api/discover/web 실패", err);
      res.status(500).json({ message: err.message || "웹 검색에 실패했습니다." });
    }
  });

  // =====================
  // Portfolio
  // =====================

  app.get("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio(req.user!.id);
      res.json(portfolio || null);
    } catch (err) {
      logger.error("GET /api/portfolio 실패", err);
      res.status(500).json({ message: "포트폴리오 조회에 실패했습니다." });
    }
  });

  app.get("/api/portfolio/:slug", async (req, res) => {
    try {
      const slug = req.params.slug as string;
      const portfolio = await storage.getPortfolioBySlug(slug);
      if (!portfolio) return res.status(404).json({ message: "포트폴리오를 찾을 수 없습니다." });
      res.json(portfolio);
    } catch (err) {
      logger.error("GET /api/portfolio/:slug 실패", err);
      res.status(500).json({ message: "포트폴리오 조회에 실패했습니다." });
    }
  });

  app.post("/api/portfolio", requireAuth, async (req, res) => {
    try {
      const parsed = insertPortfolioSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({
          message: "입력값이 올바르지 않습니다.",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const portfolio = await storage.upsertPortfolio(parsed.data);
      res.json(portfolio);
    } catch (err) {
      logger.error("POST /api/portfolio 실패", err);
      res.status(500).json({ message: "포트폴리오 저장에 실패했습니다." });
    }
  });

  // =====================
  // Dashboard Stats
  // =====================

  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user!.id);
      res.json(stats);
    } catch (err) {
      logger.error("GET /api/dashboard/stats 실패", err);
      res.status(500).json({ message: "통계 조회에 실패했습니다." });
    }
  });

  // =====================
  // Admin Routes
  // =====================

  app.post("/api/admin/crawl/:source", requireAdmin, async (req, res) => {
    try {
      const source = req.params.source as string;
      if (!["k-startup", "bizinfo"].includes(source)) {
        return res.status(400).json({ message: "유효하지 않은 소스입니다. k-startup 또는 bizinfo를 사용하세요." });
      }

      const { runCrawler } = await import("./crawlers/index");
      const result = await runCrawler(source, storage);
      res.json(result);
    } catch (err: any) {
      logger.error(`POST /api/admin/crawl/${req.params.source} 실패`, err);
      res.status(500).json({ message: err.message || "크롤링에 실패했습니다." });
    }
  });

  app.get("/api/admin/crawl-logs", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await storage.getCrawlLogs(limit);
      res.json(logs);
    } catch (err) {
      logger.error("GET /api/admin/crawl-logs 실패", err);
      res.status(500).json({ message: "크롤링 로그 조회에 실패했습니다." });
    }
  });

  app.post("/api/admin/investment-programs", requireAdmin, async (req, res) => {
    try {
      const parsed = insertInvestmentProgramSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "입력값이 올바르지 않습니다.",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const program = await storage.createInvestmentProgram(parsed.data);
      res.status(201).json(program);
    } catch (err) {
      logger.error("POST /api/admin/investment-programs 실패", err);
      res.status(500).json({ message: "투자 프로그램 생성에 실패했습니다." });
    }
  });

  // =====================
  // Health
  // =====================

  // =====================
  // Design Tokens
  // =====================

  app.get("/api/design-tokens", (_req, res) => {
    res.json(DESIGN_TOKENS);
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  return httpServer;
}
