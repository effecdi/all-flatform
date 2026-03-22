export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || "5000"}/api/auth/google/callback`,
};
