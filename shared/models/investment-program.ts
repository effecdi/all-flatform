import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const investorTypeEnum = pgEnum("investor_type", [
  "VC",
  "AC",
  "CVC",
  "엔젤",
  "정책금융",
]);

export const investmentPrograms = pgTable("investment_programs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  organization: varchar("organization", { length: 300 }),
  investorType: investorTypeEnum("investor_type").notNull(),
  description: text("description"),
  investmentScale: varchar("investment_scale", { length: 200 }),
  targetStage: varchar("target_stage", { length: 200 }),
  targetIndustry: varchar("target_industry", { length: 300 }),
  contactInfo: text("contact_info"),
  websiteUrl: text("website_url"),
  applicationUrl: text("application_url"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).notNull().default("모집중"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertInvestmentProgramSchema = createInsertSchema(investmentPrograms, {
  title: (s) => s.min(1, "제목을 입력하세요").max(500),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectInvestmentProgramSchema = createSelectSchema(investmentPrograms);

export type InvestmentProgram = typeof investmentPrograms.$inferSelect;
export type InsertInvestmentProgram = z.infer<typeof insertInvestmentProgramSchema>;
