import {
  users,
  governmentPrograms,
  investmentPrograms,
  bookmarks,
  businessProfiles,
  aiRecommendations,
  crawlLogs,

  type User,
  type GovernmentProgram,
  type InsertGovernmentProgram,
  type InvestmentProgram,
  type InsertInvestmentProgram,
  type Bookmark,
  type InsertBookmark,
  type BusinessProfile,
  type InsertBusinessProfile,
  type AiRecommendation,
  type InsertAiRecommendation,
  type CrawlLog,
  type RecommendationItem,

} from "@shared/schema";
import type { ProgramFilters, PaginatedResult, DashboardStats, InvestmentFilters } from "@shared/types";
import { requireDb } from "./db";
import { eq, desc, ilike, and, sql, count, or } from "drizzle-orm";

export interface IStorage {
  // Anonymous Users
  findOrCreateUserByAnonId(anonId: string): Promise<User>;

  // Government Programs
  getGovernmentPrograms(filters: ProgramFilters): Promise<PaginatedResult<GovernmentProgram>>;
  getGovernmentProgram(id: number): Promise<GovernmentProgram | undefined>;
  upsertGovernmentProgram(data: InsertGovernmentProgram): Promise<GovernmentProgram>;
  bulkUpsertGovernmentPrograms(data: InsertGovernmentProgram[]): Promise<{ created: number; updated: number }>;

  // Investment Programs
  getInvestmentPrograms(filters: InvestmentFilters): Promise<PaginatedResult<InvestmentProgram>>;
  getInvestmentProgram(id: number): Promise<InvestmentProgram | undefined>;
  createInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram>;
  upsertInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram>;
  updateInvestmentProgram(id: number, data: Partial<InsertInvestmentProgram>): Promise<InvestmentProgram | undefined>;
  deleteInvestmentProgram(id: number): Promise<boolean>;

  // Business Profiles
  getBusinessProfile(userId: number): Promise<BusinessProfile | undefined>;
  upsertBusinessProfile(data: InsertBusinessProfile): Promise<BusinessProfile>;

  // Bookmarks
  getBookmarks(userId: number): Promise<Bookmark[]>;
  addBookmark(data: InsertBookmark): Promise<Bookmark>;
  removeBookmark(userId: number, programType: string, programId: number): Promise<boolean>;
  isBookmarked(userId: number, programType: string, programId: number): Promise<boolean>;

  // AI Recommendations
  createRecommendation(data: InsertAiRecommendation): Promise<AiRecommendation>;
  getRecommendations(userId: number): Promise<AiRecommendation[]>;

  // Crawl Logs
  createCrawlLog(data: Omit<CrawlLog, "id" | "createdAt">): Promise<CrawlLog>;
  getCrawlLogs(limit?: number): Promise<CrawlLog[]>;

  // Dashboard
  getDashboardStats(userId: number): Promise<DashboardStats>;
}

export class MemoryStorage implements IStorage {
  private usersList: User[] = [];
  private govPrograms: GovernmentProgram[] = [];
  private invPrograms: InvestmentProgram[] = [];
  private bookmarksList: Bookmark[] = [];
  private profiles: BusinessProfile[] = [];
  private recommendations: AiRecommendation[] = [];
  private crawlLogsList: CrawlLog[] = [];

  private nextUserId = 1;
  private nextGovId = 1;
  private nextInvId = 1;
  private nextBookmarkId = 1;
  private nextProfileId = 1;
  private nextRecId = 1;
  private nextLogId = 1;


  async findOrCreateUserByAnonId(anonId: string): Promise<User> {
    const email = `anon_${anonId}@anonymous`;
    let user = this.usersList.find(u => u.email === email);
    if (!user) {
      const now = new Date();
      const isFirst = this.usersList.length === 0;
      user = {
        id: this.nextUserId++,
        email,
        name: `사용자 ${this.nextUserId - 1}`,
        passwordHash: null,
        isAdmin: isFirst, // 첫 번째 사용자만 admin
        createdAt: now,
        updatedAt: now,
      };
      this.usersList.push(user);
    }
    return user;
  }

  async getGovernmentPrograms(filters: ProgramFilters): Promise<PaginatedResult<GovernmentProgram>> {
    let result = [...this.govPrograms];
    if (filters.supportType) result = result.filter(p => p.supportType === filters.supportType);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.region) result = result.filter(p => p.region === filters.region);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.organization?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (filters.deadline) {
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter(p => {
        if (!p.endDate) return false;
        const end = new Date(p.endDate);
        return end >= now && end <= weekLater;
      });
    }
    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    result = result
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(start, start + limit);
    return { data: result, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getGovernmentProgram(id: number): Promise<GovernmentProgram | undefined> {
    return this.govPrograms.find(p => p.id === id);
  }

  async upsertGovernmentProgram(data: InsertGovernmentProgram): Promise<GovernmentProgram> {
    const existing = data.sourceId
      ? this.govPrograms.find(p => p.sourceId === data.sourceId && p.source === data.source)
      : undefined;
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    const now = new Date();
    const program: GovernmentProgram = {
      id: this.nextGovId++,
      title: data.title,
      organization: data.organization ?? null,
      supportType: data.supportType ?? "기타지원",
      status: data.status ?? "모집중",
      description: data.description ?? null,
      targetAudience: data.targetAudience ?? null,
      supportAmount: data.supportAmount ?? null,
      applicationMethod: data.applicationMethod ?? null,
      applicationUrl: data.applicationUrl ?? null,
      region: data.region ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      announcementDate: data.announcementDate ?? null,
      requiredDocuments: data.requiredDocuments ?? null,
      selectionProcess: data.selectionProcess ?? null,
      supportDetails: data.supportDetails ?? null,
      contactInfo: data.contactInfo ?? null,
      excludedTargets: data.excludedTargets ?? null,
      attachmentUrls: data.attachmentUrls ?? null,
      sourceUrl: data.sourceUrl ?? null,
      sourceId: data.sourceId ?? null,
      source: data.source ?? "manual",
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.govPrograms.push(program);
    return program;
  }

  async bulkUpsertGovernmentPrograms(data: InsertGovernmentProgram[]): Promise<{ created: number; updated: number }> {
    let created = 0, updated = 0;
    for (const item of data) {
      const existing = item.sourceId
        ? this.govPrograms.find(p => p.sourceId === item.sourceId && p.source === item.source)
        : undefined;
      if (existing) {
        Object.assign(existing, item, { updatedAt: new Date() });
        updated++;
      } else {
        await this.upsertGovernmentProgram(item);
        created++;
      }
    }
    return { created, updated };
  }

  async getInvestmentPrograms(filters: InvestmentFilters): Promise<PaginatedResult<InvestmentProgram>> {
    let result = [...this.invPrograms];
    if (filters.investorType) result = result.filter(p => p.investorType === filters.investorType);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.organization?.toLowerCase().includes(q)
      );
    }
    const total = result.length;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    result = result
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(start, start + limit);
    return { data: result, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getInvestmentProgram(id: number): Promise<InvestmentProgram | undefined> {
    return this.invPrograms.find(p => p.id === id);
  }

  async createInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram> {
    const now = new Date();
    const program: InvestmentProgram = {
      id: this.nextInvId++,
      title: data.title,
      organization: data.organization ?? null,
      investorType: data.investorType,
      description: data.description ?? null,
      investmentScale: data.investmentScale ?? null,
      targetStage: data.targetStage ?? null,
      targetIndustry: data.targetIndustry ?? null,
      contactInfo: data.contactInfo ?? null,
      websiteUrl: data.websiteUrl ?? null,
      applicationUrl: data.applicationUrl ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      status: data.status ?? "모집중",
      createdAt: now,
      updatedAt: now,
    };
    this.invPrograms.push(program);
    return program;
  }

  async upsertInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram> {
    const existing = this.invPrograms.find(
      p => p.title === data.title && p.organization === (data.organization ?? null)
    );
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    return this.createInvestmentProgram(data);
  }

  async updateInvestmentProgram(id: number, data: Partial<InsertInvestmentProgram>): Promise<InvestmentProgram | undefined> {
    const program = this.invPrograms.find(p => p.id === id);
    if (!program) return undefined;
    Object.assign(program, data, { updatedAt: new Date() });
    return program;
  }

  async deleteInvestmentProgram(id: number): Promise<boolean> {
    const idx = this.invPrograms.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.invPrograms.splice(idx, 1);
    return true;
  }

  async getBusinessProfile(userId: number): Promise<BusinessProfile | undefined> {
    return this.profiles.find(p => p.userId === userId);
  }

  async upsertBusinessProfile(data: InsertBusinessProfile): Promise<BusinessProfile> {
    const existing = this.profiles.find(p => p.userId === data.userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    }
    const now = new Date();
    const profile: BusinessProfile = {
      id: this.nextProfileId++,
      userId: data.userId,
      companyName: data.companyName,
      businessStage: data.businessStage,
      industrySector: data.industrySector,
      region: data.region,
      employeeCount: data.employeeCount ?? null,
      annualRevenue: data.annualRevenue ?? null,
      techField: data.techField ?? null,
      desiredFunding: data.desiredFunding ?? null,
      businessDescription: data.businessDescription ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.push(profile);
    return profile;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return this.bookmarksList.filter(b => b.userId === userId);
  }

  async addBookmark(data: InsertBookmark): Promise<Bookmark> {
    const existing = this.bookmarksList.find(
      b => b.userId === data.userId && b.programType === data.programType && b.programId === data.programId
    );
    if (existing) return existing;
    const bookmark: Bookmark = {
      id: this.nextBookmarkId++,
      userId: data.userId,
      programType: data.programType,
      programId: data.programId,
      createdAt: new Date(),
    };
    this.bookmarksList.push(bookmark);
    return bookmark;
  }

  async removeBookmark(userId: number, programType: string, programId: number): Promise<boolean> {
    const idx = this.bookmarksList.findIndex(
      b => b.userId === userId && b.programType === programType && b.programId === programId
    );
    if (idx === -1) return false;
    this.bookmarksList.splice(idx, 1);
    return true;
  }

  async isBookmarked(userId: number, programType: string, programId: number): Promise<boolean> {
    return this.bookmarksList.some(
      b => b.userId === userId && b.programType === programType && b.programId === programId
    );
  }

  async createRecommendation(data: InsertAiRecommendation): Promise<AiRecommendation> {
    const rec: AiRecommendation = {
      id: this.nextRecId++,
      userId: data.userId,
      recommendations: data.recommendations as RecommendationItem[],
      profileSnapshot: data.profileSnapshot,
      modelUsed: data.modelUsed ?? null,
      promptTokens: data.promptTokens ?? null,
      completionTokens: data.completionTokens ?? null,
      createdAt: new Date(),
    };
    this.recommendations.push(rec);
    return rec;
  }

  async getRecommendations(userId: number): Promise<AiRecommendation[]> {
    return this.recommendations
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCrawlLog(data: Omit<CrawlLog, "id" | "createdAt">): Promise<CrawlLog> {
    const log: CrawlLog = {
      id: this.nextLogId++,
      ...data,
      createdAt: new Date(),
    };
    this.crawlLogsList.push(log);
    return log;
  }

  async getCrawlLogs(limit = 50): Promise<CrawlLog[]> {
    return this.crawlLogsList
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const activeGov = this.govPrograms.filter(p => p.status === "모집중").length;
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = this.govPrograms.filter(p => {
      if (!p.endDate) return false;
      const end = new Date(p.endDate);
      return end >= now && end <= weekLater;
    }).length;
    const userBookmarks = this.bookmarksList.filter(b => b.userId === userId).length;

    return {
      totalGovernmentPrograms: this.govPrograms.length,
      activeGovernmentPrograms: activeGov,
      totalInvestmentPrograms: this.invPrograms.length,
      upcomingDeadlines: upcoming,
      bookmarkCount: userBookmarks,
    };
  }
}

export class DatabaseStorage implements IStorage {
  private get db() {
    return requireDb().db;
  }

  async findOrCreateUserByAnonId(anonId: string): Promise<User> {
    const email = `anon_${anonId}@anonymous`;
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) return existing;

    // 첫 번째 사용자인지 확인 (admin 부여용)
    const [userCount] = await this.db.select({ count: count() }).from(users);
    const isFirst = (userCount?.count ?? 0) === 0;

    const [created] = await this.db
      .insert(users)
      .values({
        email,
        name: `사용자`,
        isAdmin: isFirst,
      })
      .returning();
    return created;
  }

  async getGovernmentPrograms(filters: ProgramFilters): Promise<PaginatedResult<GovernmentProgram>> {
    const conditions: any[] = [];
    if (filters.supportType) {
      conditions.push(eq(governmentPrograms.supportType, filters.supportType as any));
    }
    if (filters.status) {
      conditions.push(eq(governmentPrograms.status, filters.status as any));
    }
    if (filters.region) {
      conditions.push(eq(governmentPrograms.region, filters.region));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(governmentPrograms.title, `%${filters.search}%`),
          ilike(governmentPrograms.organization, `%${filters.search}%`)
        )
      );
    }
    if (filters.deadline) {
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nowStr = now.toISOString().split("T")[0];
      const weekLaterStr = weekLater.toISOString().split("T")[0];
      conditions.push(
        and(
          sql`${governmentPrograms.endDate} >= ${nowStr}`,
          sql`${governmentPrograms.endDate} <= ${weekLaterStr}`
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(governmentPrograms)
      .where(where);
    const total = totalResult?.count ?? 0;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(governmentPrograms)
      .where(where)
      .orderBy(desc(governmentPrograms.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getGovernmentProgram(id: number): Promise<GovernmentProgram | undefined> {
    const [program] = await this.db
      .select()
      .from(governmentPrograms)
      .where(eq(governmentPrograms.id, id));
    return program;
  }

  async upsertGovernmentProgram(data: InsertGovernmentProgram): Promise<GovernmentProgram> {
    if (data.sourceId && data.source) {
      const [existing] = await this.db
        .select()
        .from(governmentPrograms)
        .where(
          and(
            eq(governmentPrograms.sourceId, data.sourceId),
            eq(governmentPrograms.source, data.source)
          )
        );
      if (existing) {
        const [updated] = await this.db
          .update(governmentPrograms)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(governmentPrograms.id, existing.id))
          .returning();
        return updated;
      }
    }
    const [created] = await this.db
      .insert(governmentPrograms)
      .values(data)
      .returning();
    return created;
  }

  async bulkUpsertGovernmentPrograms(data: InsertGovernmentProgram[]): Promise<{ created: number; updated: number }> {
    let created = 0, updated = 0;
    for (const item of data) {
      if (item.sourceId && item.source) {
        const [existing] = await this.db
          .select()
          .from(governmentPrograms)
          .where(
            and(
              eq(governmentPrograms.sourceId, item.sourceId),
              eq(governmentPrograms.source, item.source)
            )
          );
        if (existing) {
          await this.db
            .update(governmentPrograms)
            .set({ ...item, updatedAt: new Date() })
            .where(eq(governmentPrograms.id, existing.id));
          updated++;
          continue;
        }
      }
      await this.db.insert(governmentPrograms).values(item);
      created++;
    }
    return { created, updated };
  }

  async getInvestmentPrograms(filters: InvestmentFilters): Promise<PaginatedResult<InvestmentProgram>> {
    const conditions: any[] = [];
    if (filters.investorType) {
      conditions.push(eq(investmentPrograms.investorType, filters.investorType as any));
    }
    if (filters.status) {
      conditions.push(eq(investmentPrograms.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(investmentPrograms.title, `%${filters.search}%`),
          ilike(investmentPrograms.organization, `%${filters.search}%`)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(investmentPrograms)
      .where(where);
    const total = totalResult?.count ?? 0;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(investmentPrograms)
      .where(where)
      .orderBy(desc(investmentPrograms.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getInvestmentProgram(id: number): Promise<InvestmentProgram | undefined> {
    const [program] = await this.db
      .select()
      .from(investmentPrograms)
      .where(eq(investmentPrograms.id, id));
    return program;
  }

  async createInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram> {
    const [program] = await this.db.insert(investmentPrograms).values(data).returning();
    return program;
  }

  async upsertInvestmentProgram(data: InsertInvestmentProgram): Promise<InvestmentProgram> {
    const [existing] = await this.db
      .select()
      .from(investmentPrograms)
      .where(
        and(
          eq(investmentPrograms.title, data.title),
          data.organization
            ? eq(investmentPrograms.organization, data.organization)
            : sql`${investmentPrograms.organization} IS NULL`
        )
      );
    if (existing) {
      const [updated] = await this.db
        .update(investmentPrograms)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(investmentPrograms.id, existing.id))
        .returning();
      return updated;
    }
    return this.createInvestmentProgram(data);
  }

  async updateInvestmentProgram(id: number, data: Partial<InsertInvestmentProgram>): Promise<InvestmentProgram | undefined> {
    const [program] = await this.db
      .update(investmentPrograms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(investmentPrograms.id, id))
      .returning();
    return program;
  }

  async deleteInvestmentProgram(id: number): Promise<boolean> {
    const result = await this.db
      .delete(investmentPrograms)
      .where(eq(investmentPrograms.id, id))
      .returning();
    return result.length > 0;
  }

  async getBusinessProfile(userId: number): Promise<BusinessProfile | undefined> {
    const [profile] = await this.db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId));
    return profile;
  }

  async upsertBusinessProfile(data: InsertBusinessProfile): Promise<BusinessProfile> {
    const [existing] = await this.db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, data.userId));

    if (existing) {
      const [updated] = await this.db
        .update(businessProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(businessProfiles.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(businessProfiles)
      .values(data)
      .returning();
    return created;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return this.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async addBookmark(data: InsertBookmark): Promise<Bookmark> {
    const [existing] = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, data.userId),
          eq(bookmarks.programType, data.programType),
          eq(bookmarks.programId, data.programId)
        )
      );
    if (existing) return existing;

    const [bookmark] = await this.db.insert(bookmarks).values(data).returning();
    return bookmark;
  }

  async removeBookmark(userId: number, programType: string, programId: number): Promise<boolean> {
    const result = await this.db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.programType, programType),
          eq(bookmarks.programId, programId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async isBookmarked(userId: number, programType: string, programId: number): Promise<boolean> {
    const [found] = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.programType, programType),
          eq(bookmarks.programId, programId)
        )
      );
    return !!found;
  }

  async createRecommendation(data: InsertAiRecommendation): Promise<AiRecommendation> {
    const [rec] = await this.db.insert(aiRecommendations).values(data).returning();
    return rec;
  }

  async getRecommendations(userId: number): Promise<AiRecommendation[]> {
    return this.db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt));
  }

  async createCrawlLog(data: Omit<CrawlLog, "id" | "createdAt">): Promise<CrawlLog> {
    const [log] = await this.db.insert(crawlLogs).values(data).returning();
    return log;
  }

  async getCrawlLogs(limit = 50): Promise<CrawlLog[]> {
    return this.db
      .select()
      .from(crawlLogs)
      .orderBy(desc(crawlLogs.createdAt))
      .limit(limit);
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const [totalGov] = await this.db
      .select({ count: count() })
      .from(governmentPrograms);

    const [activeGov] = await this.db
      .select({ count: count() })
      .from(governmentPrograms)
      .where(eq(governmentPrograms.status, "모집중"));

    const [totalInv] = await this.db
      .select({ count: count() })
      .from(investmentPrograms);

    const now = new Date().toISOString().split("T")[0];
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const upcomingResult = await this.db
      .select({ count: count() })
      .from(governmentPrograms)
      .where(
        and(
          sql`${governmentPrograms.endDate} >= ${now}`,
          sql`${governmentPrograms.endDate} <= ${weekLater}`
        )
      );

    const [bookmarkResult] = await this.db
      .select({ count: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return {
      totalGovernmentPrograms: totalGov?.count ?? 0,
      activeGovernmentPrograms: activeGov?.count ?? 0,
      totalInvestmentPrograms: totalInv?.count ?? 0,
      upcomingDeadlines: upcomingResult[0]?.count ?? 0,
      bookmarkCount: bookmarkResult?.count ?? 0,
    };
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemoryStorage();
