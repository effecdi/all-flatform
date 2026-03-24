import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const crawlLogs = pgTable("crawl_logs", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "success" | "error"
  programsFound: integer("programs_found").notNull().default(0),
  programsCreated: integer("programs_created").notNull().default(0),
  programsUpdated: integer("programs_updated").notNull().default(0),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const selectCrawlLogSchema = createSelectSchema(crawlLogs);

export type CrawlLog = typeof crawlLogs.$inferSelect;
