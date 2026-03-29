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
const isProd = process.env.NODE_ENV === "production";

function cookieOptions() {
  return {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: isProd,
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let anonId = req.cookies?.[COOKIE_NAME];
    if (!anonId) {
      anonId = crypto.randomUUID();
      res.cookie(COOKIE_NAME, anonId, cookieOptions());
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
    // 프로덕션에서는 환경변수 ADMIN_KEY 필수
    const adminKey = process.env.ADMIN_KEY;
    if (isProd) {
      const provided = req.headers["x-admin-key"];
      if (!adminKey || provided !== adminKey) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
    }

    let anonId = req.cookies?.[COOKIE_NAME];
    if (!anonId) {
      anonId = crypto.randomUUID();
      res.cookie(COOKIE_NAME, anonId, cookieOptions());
    }
    const user = await storage.findOrCreateUserByAnonId(anonId);
    req.user = user;

    // 개발 환경: 첫 번째 사용자를 admin으로 취급
    if (!isProd && !user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    next();
  } catch (err) {
    next(err);
  }
}
