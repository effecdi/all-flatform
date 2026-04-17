import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  console.log("마이그레이션을 시작합니다...");

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("마이그레이션이 완료되었습니다.");
  } catch (error) {
    console.error("마이그레이션 실패:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
