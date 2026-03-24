import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { users, sessions, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ---- In-memory stores (used when DATABASE_URL is not set) ----
const memUsers: User[] = [];
let memNextUserId = 1;
const memSessions = new Map<string, { userId: number; expiresAt: Date }>();

function useDb(): boolean {
  return !!db;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  if (useDb()) {
    await db!.insert(sessions).values({ id, userId, expiresAt });
  } else {
    memSessions.set(id, { userId, expiresAt });
  }
  return id;
}

export async function getSessionUser(sessionId: string): Promise<User | null> {
  if (useDb()) {
    const [session] = await db!
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      await db!.delete(sessions).where(eq(sessions.id, sessionId));
      return null;
    }
    const [user] = await db!
      .select()
      .from(users)
      .where(eq(users.id, session.userId));
    return user ?? null;
  }

  // Memory fallback
  const session = memSessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    memSessions.delete(sessionId);
    return null;
  }
  return memUsers.find((u) => u.id === session.userId) ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (useDb()) {
    await db!.delete(sessions).where(eq(sessions.id, sessionId));
  } else {
    memSessions.delete(sessionId);
  }
}

export async function createEmailUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  if (useDb()) {
    const [existing] = await db!
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) {
      throw new Error("이미 등록된 이메일입니다.");
    }
    const [user] = await db!
      .insert(users)
      .values({ email, passwordHash, name })
      .returning();
    return user;
  }

  // Memory fallback
  if (memUsers.find((u) => u.email === email)) {
    throw new Error("이미 등록된 이메일입니다.");
  }
  const now = new Date();
  const user: User = {
    id: memNextUserId++,
    email,
    name: name ?? null,
    passwordHash,
    isAdmin: false,
    createdAt: now,
    updatedAt: now,
  };
  memUsers.push(user);
  return user;
}

export async function loginEmailUser(
  email: string,
  password: string
): Promise<User> {
  let user: User | undefined;

  if (useDb()) {
    const [found] = await db!
      .select()
      .from(users)
      .where(eq(users.email, email));
    user = found;
  } else {
    user = memUsers.find((u) => u.email === email);
  }

  if (!user || !user.passwordHash) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
  return user;
}

export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  if (useDb()) {
    await db!
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } else {
    const user = memUsers.find((u) => u.id === userId);
    if (user) {
      user.passwordHash = passwordHash;
      user.updatedAt = new Date();
    }
  }
}
