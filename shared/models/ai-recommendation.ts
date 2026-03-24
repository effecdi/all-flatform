import {
  pgTable,
  serial,
  integer,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./user";

export interface RecommendationItem {
  programId: number;
  programType: "government" | "investment";
  matchScore: number;
  reasoning: string;
  title: string;
}

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recommendations: jsonb("recommendations").$type<RecommendationItem[]>().notNull(),
  profileSnapshot: jsonb("profile_snapshot").notNull(),
  modelUsed: varchar("model_used", { length: 100 }),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const selectAiRecommendationSchema = createSelectSchema(aiRecommendations);

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = Omit<typeof aiRecommendations.$inferInsert, "id" | "createdAt">;
