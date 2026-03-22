import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema, updateAccountSchema } from "@shared/schema";
import { logger } from "./logger";
import { POPULAR_SERVICES } from "@shared/popular-services";
import { getAuthUrl, getTokensFromCode, storeTokens, getStoredTokens, clearTokens } from "./google-auth";
import { scanGmail } from "./gmail-scanner";
import { config } from "./config";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ---- Accounts CRUD ----

  app.get("/api/accounts", async (req, res) => {
    try {
      const { category, subscription, search } = req.query as Record<
        string,
        string | undefined
      >;
      const accounts = await storage.getAccounts({
        category,
        subscription,
        search,
      });
      res.json(accounts);
    } catch (err) {
      logger.error("GET /api/accounts 실패", err);
      res.status(500).json({ message: "계정 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const account = await storage.getAccount(id);
      if (!account) return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      res.json(account);
    } catch (err) {
      logger.error("GET /api/accounts/:id 실패", err);
      res.status(500).json({ message: "계정 조회에 실패했습니다." });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const parsed = insertAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "입력값이 올바르지 않습니다.",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const account = await storage.createAccount(parsed.data);
      res.status(201).json(account);
    } catch (err) {
      logger.error("POST /api/accounts 실패", err);
      res.status(500).json({ message: "계정 생성에 실패했습니다." });
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const parsed = updateAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "입력값이 올바르지 않습니다.",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const account = await storage.updateAccount(id, parsed.data);
      if (!account) return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      res.json(account);
    } catch (err) {
      logger.error("PATCH /api/accounts/:id 실패", err);
      res.status(500).json({ message: "계정 수정에 실패했습니다." });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const deleted = await storage.deleteAccount(id);
      if (!deleted) return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (err) {
      logger.error("DELETE /api/accounts/:id 실패", err);
      res.status(500).json({ message: "계정 삭제에 실패했습니다." });
    }
  });

  app.patch("/api/accounts/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID" });
      const account = await storage.toggleFavorite(id);
      if (!account) return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
      res.json(account);
    } catch (err) {
      logger.error("PATCH /api/accounts/:id/favorite 실패", err);
      res.status(500).json({ message: "즐겨찾기 토글에 실패했습니다." });
    }
  });

  // ---- Bulk Create ----

  app.get("/api/popular-services", (_req, res) => {
    res.json(POPULAR_SERVICES);
  });

  app.post("/api/accounts/bulk", async (req, res) => {
    try {
      const { services } = req.body as { services?: string[] };
      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "서비스 ID 배열이 필요합니다." });
      }
      if (services.length > 100) {
        return res.status(400).json({ message: "한 번에 최대 100개까지 추가 가능합니다." });
      }
      const result = await storage.createAccountsBulk(services);
      res.status(201).json(result);
    } catch (err) {
      logger.error("POST /api/accounts/bulk 실패", err);
      res.status(500).json({ message: "일괄 추가에 실패했습니다." });
    }
  });

  // ---- Dashboard Stats ----

  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      logger.error("GET /api/dashboard/stats 실패", err);
      res.status(500).json({ message: "통계 조회에 실패했습니다." });
    }
  });

  // ---- Favicon Proxy ----

  app.get("/api/favicon", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) return res.status(400).json({ message: "url 쿼리 필요" });
      const domain = new URL(url).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      res.redirect(faviconUrl);
    } catch (err) {
      res.status(400).json({ message: "유효하지 않은 URL" });
    }
  });

  // ---- Google OAuth + Gmail Scan ----

  app.get("/api/auth/google", (_req, res) => {
    if (!config.googleClientId || !config.googleClientSecret) {
      return res.status(501).json({
        message: "Google OAuth가 설정되지 않았습니다. GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET 환경변수를 설정하세요.",
      });
    }
    try {
      const url = getAuthUrl();
      res.json({ url });
    } catch (err) {
      logger.error("Google Auth URL 생성 실패", err);
      res.status(500).json({ message: "Google 인증 URL 생성에 실패했습니다." });
    }
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ message: "인증 코드가 없습니다." });

      const tokens = await getTokensFromCode(code);
      const sessionId = crypto.randomUUID();
      storeTokens(sessionId, tokens);

      // Redirect to auto-discover page with session ID
      res.redirect(`/auto-discover?session=${sessionId}`);
    } catch (err) {
      logger.error("Google OAuth 콜백 실패", err);
      res.redirect("/auto-discover?error=auth_failed");
    }
  });

  app.post("/api/gmail/scan", async (req, res) => {
    try {
      const { sessionId } = req.body as { sessionId?: string };
      if (!sessionId) {
        return res.status(400).json({ message: "세션 ID가 필요합니다." });
      }

      const tokens = getStoredTokens(sessionId);
      if (!tokens) {
        return res.status(401).json({ message: "인증이 만료되었습니다. 다시 로그인하세요." });
      }

      const accounts = await scanGmail(tokens.access_token);
      res.json({ accounts, total: accounts.length });
    } catch (err) {
      logger.error("Gmail 스캔 실패", err);
      res.status(500).json({ message: "Gmail 스캔에 실패했습니다." });
    }
  });

  app.post("/api/auth/google/logout", (req, res) => {
    const { sessionId } = req.body as { sessionId?: string };
    if (sessionId) clearTokens(sessionId);
    res.json({ success: true });
  });

  // ---- Health ----

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  return httpServer;
}
