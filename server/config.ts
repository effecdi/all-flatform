export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  dataGoKrApiKey: process.env.DATA_GO_KR_API_KEY || "",
  bizinfoApiKey: process.env.BIZINFO_API_KEY || "",
};

export function validateProductionConfig() {
  if (config.nodeEnv !== "production") return;

  const errors: string[] = [];

  if (!config.databaseUrl) {
    errors.push("DATABASE_URL은 프로덕션 환경에서 필수입니다.");
  }

  if (config.sessionSecret === "dev-secret-change-in-production") {
    errors.push("SESSION_SECRET을 프로덕션용으로 변경하세요.");
  }

  if (errors.length > 0) {
    console.error("환경변수 검증 실패:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}
