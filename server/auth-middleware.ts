import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";
import crypto from "crypto";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const COOKIE_NAME = "anon_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1년

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let anonId = req.cookies?.[COOKIE_NAME];
    if (!anonId) {
      anonId = crypto.randomUUID();
      res.cookie(COOKIE_NAME, anonId, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }
    const user = await storage.findOrCreateUserByAnonId(anonId);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    let anonId = req.cookies?.[COOKIE_NAME];
    if (!anonId) {
      anonId = crypto.randomUUID();
      res.cookie(COOKIE_NAME, anonId, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }
    const user = await storage.findOrCreateUserByAnonId(anonId);
    req.user = user;
    // 익명 사용자 시스템에서는 첫 번째 사용자를 admin으로 취급
    if (!user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }
    next();
  } catch (err) {
    next(err);
  }
}
