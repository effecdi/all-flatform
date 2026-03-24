import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const DEFAULT_USER: User = {
  id: 1,
  email: "user@all-flatform.kr",
  name: "기본 사용자",
  passwordHash: null,
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = DEFAULT_USER;
  next();
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  req.user = DEFAULT_USER;
  next();
}
