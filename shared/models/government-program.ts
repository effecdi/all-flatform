import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  integer,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const supportTypeEnum = pgEnum("support_type", [
  "예비창업패키지",
  "초기창업패키지",
  "도약패키지",
  "창업도약패키지",
  "기술개발",
  "사업화지원",
  "멘토링_컨설팅",
  "시설_공간",
  "해외진출",
  "정책자금",
  "기타지원",
]);

export const programStatusEnum = pgEnum("program_status", [
  "모집중",
  "모집예정",
  "모집마감",
]);

export const governmentPrograms = pgTable("government_programs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  organization: varchar("organization", { length: 300 }),
  supportType: supportTypeEnum("support_type").notNull().default("기타지원"),
  status: programStatusEnum("status").notNull().default("모집중"),
  description: text("description"),
  targetAudience: text("target_audience"),
  supportAmount: varchar("support_amount", { length: 200 }),
  applicationMethod: text("application_method"),
  applicationUrl: text("application_url"),
  region: varchar("region", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  announcementDate: date("announcement_date"),
  requiredDocuments: text("required_documents"),
  selectionProcess: text("selection_process"),
  supportDetails: text("support_details"),
  contactInfo: text("contact_info"),
  excludedTargets: text("excluded_targets"),
  attachmentUrls: text("attachment_urls"),
  sourceUrl: text("source_url"),
  sourceId: varchar("source_id", { length: 200 }),
  source: varchar("source", { length: 50 }).notNull().default("manual"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertGovernmentProgramSchema = createInsertSchema(governmentPrograms, {
  title: (s) => s.min(1, "제목을 입력하세요").max(500),
}).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });

export const selectGovernmentProgramSchema = createSelectSchema(governmentPrograms);

export type GovernmentProgram = typeof governmentPrograms.$inferSelect;
export type InsertGovernmentProgram = z.infer<typeof insertGovernmentProgramSchema>;
