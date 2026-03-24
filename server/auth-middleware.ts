import type { Request, Response, NextFunction } from "express";
import { getSessionUser } from "./auth";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const SESSION_COOKIE = "session_id";

export function getSessionId(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE];
}

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sid = getSessionId(req);
  if (!sid) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  const user = await getSessionUser(sid);
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ message: "세션이 만료되었습니다. 다시 로그인하세요." });
  }
  req.user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const sid = getSessionId(req);
  if (!sid) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  const user = await getSessionUser(sid);
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ message: "세션이 만료되었습니다." });
  }
  if (!user.isAdmin) {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  req.user = user;
  next();
}
