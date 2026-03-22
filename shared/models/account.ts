import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ---------- Enums ----------
export const categoryEnum = pgEnum("category", [
  "sns",
  "shopping",
  "finance",
  "entertainment",
  "work",
  "gaming",
  "education",
  "cloud",
  "dev",
  "other",
]);

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "yearly",
  "weekly",
  "one_time",
]);

export const deleteDifficultyEnum = pgEnum("delete_difficulty", [
  "easy",
  "medium",
  "hard",
  "impossible",
]);

export const logoStyleEnum = pgEnum("logo_style", [
  "symbol_simple",
  "symbol_refined",
  "symbol_line",
  "symbol_color",
  "cute_character",
  "wordmark",
  "emblem",
  "mascot",
  "abstract",
  "other",
]);

// ---------- Table ----------
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  serviceName: varchar("service_name", { length: 200 }).notNull(),
  serviceUrl: text("service_url"),
  category: categoryEnum("category").notNull().default("other"),
  username: varchar("username", { length: 200 }),
  email: varchar("email", { length: 300 }),
  logoUrl: text("logo_url"),
  notes: text("notes"),
  isSubscription: boolean("is_subscription").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  subscriptionCost: integer("subscription_cost"),
  billingCycle: billingCycleEnum("billing_cycle"),
  nextBillingDate: timestamp("next_billing_date"),
  currency: varchar("currency", { length: 10 }).notNull().default("KRW"),
  logoStyle: logoStyleEnum("logo_style"),
  deleteDifficulty: deleteDifficultyEnum("delete_difficulty"),
  deleteUrl: text("delete_url"),
  deleteGuide: text("delete_guide"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------- Zod Schemas ----------
export const insertAccountSchema = createInsertSchema(accounts, {
  serviceName: (s) => s.min(1, "서비스 이름을 입력하세요").max(200),
  email: (s) => s.email("유효한 이메일을 입력하세요").optional().or(z.literal("")),
  serviceUrl: (s) => s.url("유효한 URL을 입력하세요").optional().or(z.literal("")),
  subscriptionCost: (s) => s.min(0).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectAccountSchema = createSelectSchema(accounts);

export const updateAccountSchema = insertAccountSchema.partial();

// ---------- Types ----------
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;

// ---------- Category Metadata ----------
export type CategoryKey = Account["category"];

export interface CategoryMeta {
  label: string;
  color: string;
  icon: string; // lucide icon name
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  sns: { label: "SNS", color: "#ec4899", icon: "Share2" },
  shopping: { label: "쇼핑", color: "#f97316", icon: "ShoppingBag" },
  finance: { label: "금융", color: "#22c55e", icon: "Landmark" },
  entertainment: { label: "엔터테인먼트", color: "#a855f7", icon: "Tv" },
  work: { label: "업무", color: "#3b82f6", icon: "Briefcase" },
  gaming: { label: "게임", color: "#ef4444", icon: "Gamepad2" },
  education: { label: "교육", color: "#06b6d4", icon: "GraduationCap" },
  cloud: { label: "클라우드", color: "#6366f1", icon: "Cloud" },
  dev: { label: "개발", color: "#8b5cf6", icon: "Code" },
  other: { label: "기타", color: "#6b7280", icon: "MoreHorizontal" },
};

export const BILLING_CYCLES: Record<string, string> = {
  monthly: "월간",
  yearly: "연간",
  weekly: "주간",
  one_time: "일회성",
};

export const LOGO_STYLES: Record<string, { label: string; description: string; color: string }> = {
  symbol_simple: { label: "심볼 - 단순형", description: "심플한 아이콘 형태의 로고", color: "#6366f1" },
  symbol_refined: { label: "심볼 - 세련형", description: "세련되고 미니멀한 심볼 로고", color: "#8b5cf6" },
  symbol_line: { label: "심볼 - 라인형", description: "라인/윤곽선 위주의 심볼 로고", color: "#a855f7" },
  symbol_color: { label: "심볼 - 컬러형", description: "다채로운 컬러를 사용한 심볼 로고", color: "#ec4899" },
  cute_character: { label: "귀여운 캐릭터형", description: "귀여운 캐릭터/마스코트 로고", color: "#f97316" },
  wordmark: { label: "워드마크형", description: "텍스트 기반의 로고 (Google, Coca-Cola 등)", color: "#3b82f6" },
  emblem: { label: "엠블럼형", description: "뱃지/엠블럼 형태의 로고", color: "#22c55e" },
  mascot: { label: "마스코트형", description: "캐릭터 마스코트가 포함된 로고", color: "#ef4444" },
  abstract: { label: "추상형", description: "추상적 도형/패턴의 로고", color: "#06b6d4" },
  other: { label: "기타", description: "분류되지 않는 로고 스타일", color: "#6b7280" },
};

export const DELETE_DIFFICULTIES: Record<string, { label: string; color: string }> = {
  easy: { label: "쉬움", color: "#22c55e" },
  medium: { label: "보통", color: "#f59e0b" },
  hard: { label: "어려움", color: "#ef4444" },
  impossible: { label: "불가능", color: "#7f1d1d" },
};
