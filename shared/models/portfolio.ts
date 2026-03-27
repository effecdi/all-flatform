import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./user";

// ── 팀원 정보 ──
export const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  linkedIn: z.string().optional(),
  email: z.string().optional(),
});

// ── 프로젝트/제품 정보 ──
export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  url: z.string().optional(),
  year: z.string().optional(),
});

// ── 마일스톤/연혁 ──
export const milestoneSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["founding", "funding", "product", "award", "partnership", "growth", "other"]).optional(),
});

// ── 핵심 지표 ──
export const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  suffix: z.string().optional(),
  icon: z.string().optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Metric = z.infer<typeof metricSchema>;

// ── DB 테이블 ──
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // 기본 정보
  companyName: varchar("company_name", { length: 200 }).notNull(),
  tagline: varchar("tagline", { length: 300 }),
  mission: text("mission"),
  vision: text("vision"),
  logoUrl: varchar("logo_url", { length: 500 }),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),

  // 브랜드 색상
  brandColor: varchar("brand_color", { length: 20 }),
  accentColor: varchar("accent_color", { length: 20 }),

  // 사업 정보
  industrySector: varchar("industry_sector", { length: 100 }),
  businessStage: varchar("business_stage", { length: 100 }),
  foundedYear: varchar("founded_year", { length: 10 }),
  region: varchar("region", { length: 100 }),
  employeeCount: varchar("employee_count", { length: 50 }),
  website: varchar("website", { length: 500 }),

  // 구조화된 JSON 데이터
  teamMembers: jsonb("team_members").$type<TeamMember[]>(),
  projects: jsonb("projects").$type<Project[]>(),
  milestones: jsonb("milestones").$type<Milestone[]>(),
  metrics: jsonb("metrics").$type<Metric[]>(),

  // 연락처 & 소셜
  contactEmail: varchar("contact_email", { length: 200 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),

  // 추가 설명
  aboutUs: text("about_us"),
  techStack: jsonb("tech_stack").$type<string[]>(),
  awards: jsonb("awards").$type<string[]>(),

  // 메타
  isPublic: integer("is_public").default(0),
  slug: varchar("slug", { length: 100 }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPortfolioSchema = createInsertSchema(portfolios, {
  companyName: (s) => s.min(1, "회사명을 입력하세요").max(200),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPortfolioSchema = createSelectSchema(portfolios);

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
