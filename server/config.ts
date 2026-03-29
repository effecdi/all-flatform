export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  dataGoKrApiKey: process.env.DATA_GO_KR_API_KEY || "",
  bizinfoApiKey: process.env.BIZINFO_API_KEY || "",
  adminKey: process.env.ADMIN_KEY || "",
};

export function validateProductionConfig() {
  if (config.nodeEnv !== "production") return;

  const errors: string[] = [];

  if (!config.databaseUrl) {
    errors.push("DATABASE_URL은 프로덕션 환경에서 필수입니다.");
  }

  if (!config.adminKey) {
    errors.push("ADMIN_KEY는 프로덕션 환경에서 필수입니다. (관리자 API 보호)");
  }

  if (errors.length > 0) {
    console.error("환경변수 검증 실패:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}
