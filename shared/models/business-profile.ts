import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./user";

export const businessStageEnum = pgEnum("business_stage", [
  "예비창업",
  "초기",
  "성장",
  "도약",
]);

export const industrySectorEnum = pgEnum("industry_sector", [
  "IT_SW",
  "바이오_의료",
  "제조_하드웨어",
  "에너지_환경",
  "콘텐츠_미디어",
  "유통_물류",
  "교육",
  "금융_핀테크",
  "농업_식품",
  "기타",
]);

export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  businessStage: businessStageEnum("business_stage").notNull(),
  industrySector: industrySectorEnum("industry_sector").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  employeeCount: integer("employee_count"),
  annualRevenue: varchar("annual_revenue", { length: 100 }),
  techField: varchar("tech_field", { length: 300 }),
  desiredFunding: varchar("desired_funding", { length: 100 }),
  businessDescription: text("business_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles, {
  companyName: (s) => s.min(1, "회사명을 입력하세요").max(200),
  region: (s) => s.min(1, "지역을 선택하세요"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectBusinessProfileSchema = createSelectSchema(businessProfiles);

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
