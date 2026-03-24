import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessProfileSchema, insertInvestmentProgramSchema } from "@shared/schema";
import { logger } from "./logger";
import {
  createSession,
  deleteSession,
  createEmailUser,
  loginEmailUser,
  updateUserPassword,
  verifyPassword,
} from "./auth";
import {
  requireAuth,
  requireAdmin,
  getSessionId,
  setSessionCookie,
  clearSessionCookie,
} from "./auth-middleware";
import { getSessionUser } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =====================
  // Auth Routes
  // =====================

  app.get("/api/auth/me", async (req, res) => {
    try {
      const sid = getSessionId(req);
      if (!sid) return res.json(null);
      const user = await getSessionUser(sid);
      if (!user) {
        clearSessionCookie(res);
        return res.json(null);
      }
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      logger.error("GET /api/auth/me 실패", err);
      res.json(null);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body as {
        email?: string;
        password?: string;
        name?: string;
      };
      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });
      }
      const user = await createEmailUser(email, password, name);
      const sessionId = await createSession(user.id);
      setSessionCookie(res, sessionId);
      const { passwordHash, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      logger.error("POST /api/auth/register 실패", err);
      res.status(400).json({ message: err.message || "회원가입에 실패했습니다." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };
      if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
      }
      const user = await loginEmailUser(email, password);
      const sessionId = await createSession(user.id);
      setSessionCookie(res, sessionId);
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      logger.error("POST /api/auth/login 실패", err);
      res.status(401).json({ message: err.message || "로그인에 실패했습니다." });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sid = getSessionId(req);
      if (sid) await deleteSession(sid);
      clearSessionCookie(res);
      res.json({ success: true });
    } catch (err) {
      logger.error("POST /api/auth/logout 실패", err);
      res.json({ success: true });
    }
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
      const { supportType, status, region, search, page, limit } = req.query as Record<string, string | undefined>;
      const result = await storage.getGovernmentPrograms({
        supportType,
        status,
        region,
        search,
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
  // Settings
  // =====================

  app.put("/api/settings/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "현재 비밀번호와 새 비밀번호를 입력하세요." });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });
      }
      if (!req.user!.passwordHash) {
        return res.status(400).json({ message: "비밀번호가 설정되지 않은 계정입니다." });
      }
      const valid = await verifyPassword(currentPassword, req.user!.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "현재 비밀번호가 올바르지 않습니다." });
      }
      await updateUserPassword(req.user!.id, newPassword);
      res.json({ success: true });
    } catch (err) {
      logger.error("PUT /api/settings/password 실패", err);
      res.status(500).json({ message: "비밀번호 변경에 실패했습니다." });
    }
  });

  // =====================
  // Health
  // =====================

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  return httpServer;
}
