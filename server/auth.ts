import { eq } from "drizzle-orm";
import { users, type User } from "@shared/schema";
import { db } from "./db";

const DEFAULT_USER_EMAIL = "user@all-flatform.kr";

export async function ensureDefaultUser(): Promise<User> {
  if (db) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, 1));
    if (existing) return existing;

    const [user] = await db
      .insert(users)
      .values({
        email: DEFAULT_USER_EMAIL,
        name: "기본 사용자",
        passwordHash: null,
        isAdmin: true,
      })
      .returning();
    return user;
  }

  // Memory fallback — return static user
  return {
    id: 1,
    email: DEFAULT_USER_EMAIL,
    name: "기본 사용자",
    passwordHash: null,
    isAdmin: true,
    recoveryCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
