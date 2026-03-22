import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { logger } from "./logger";

const { Pool } = pg;

function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "development") {
      logger.warn("DATABASE_URL이 설정되지 않았습니다. 인메모리 스토리지를 사용합니다.");
      return { pool: null as any, db: null as any };
    }
    throw new Error("DATABASE_URL must be set.");
  }

  const poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  const dbInstance = drizzle(poolInstance, { schema });
  return { pool: poolInstance, db: dbInstance };
}

const { pool, db } = createDbConnection();

export function requireDb() {
  if (!db || !pool) {
    throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  }
  return { db, pool };
}

export { db, pool };
