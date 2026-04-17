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

