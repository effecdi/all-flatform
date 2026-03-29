import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessProfileSchema, insertInvestmentProgramSchema } from "@shared/schema";
import { logger } from "./logger";
import { requireAuth } from "./auth-middleware";
import { DESIGN_TOKENS } from "@shared/design-tokens";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =====================
  // Auth (anonymous cookie-based user)
  // =====================

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
  // Recovery Code
  // =====================

  app.get("/api/recovery-code", requireAuth, async (req, res) => {
    try {
      const code = await storage.ensureRecoveryCode(req.user!.id);
      res.json({ recoveryCode: code });
    } catch (err) {
      logger.error("GET /api/recovery-code 실패", err);
      res.status(500).json({ message: "복구 코드 생성에 실패했습니다." });
    }
  });

  app.post("/api/recover", requireAuth, async (req, res) => {
    try {
      const { recoveryCode } = req.body;
      if (!recoveryCode || typeof recoveryCode !== "string") {
        return res.status(400).json({ message: "복구 코드를 입력해주세요." });
      }
      const code = recoveryCode.trim().toUpperCase();
      const oldUser = await storage.findUserByRecoveryCode(code);
      if (!oldUser) {
        return res.status(404).json({ message: "유효하지 않은 복구 코드입니다." });
      }
      if (oldUser.id === req.user!.id) {
        return res.json({ message: "이미 현재 계정의 복구 코드입니다." });
      }
      await storage.transferUserData(oldUser.id, req.user!.id);
      // 새 유저에게 복구 코드 이전
      await storage.ensureRecoveryCode(req.user!.id);
      res.json({ message: "프로필이 복구되었습니다." });
    } catch (err) {
      logger.error("POST /api/recover 실패", err);
      res.status(500).json({ message: "프로필 복구에 실패했습니다." });
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
