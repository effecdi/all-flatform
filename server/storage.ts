import {
  accounts,
  type Account,
  type InsertAccount,
  type UpdateAccount,
} from "@shared/schema";
import { requireDb } from "./db";
import { eq, desc, ilike, and } from "drizzle-orm";
import { POPULAR_SERVICES } from "@shared/popular-services";

export interface IStorage {
  getAccounts(filters?: {
    category?: string;
    subscription?: string;
    search?: string;
  }): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(data: InsertAccount): Promise<Account>;
  updateAccount(id: number, data: UpdateAccount): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<Account | undefined>;
  getDashboardStats(): Promise<{
    totalAccounts: number;
    subscriptionAccounts: number;
    monthlyCost: number;
    categoryBreakdown: { category: string; count: number }[];
  }>;
  createAccountsBulk(serviceIds: string[]): Promise<{ created: number; skipped: number }>;
}

export class MemoryStorage implements IStorage {
  private accounts: Account[] = [];
  private nextId = 1;

  async getAccounts(filters?: {
    category?: string;
    subscription?: string;
    search?: string;
  }): Promise<Account[]> {
    let result = [...this.accounts];
    if (filters?.category && filters.category !== "all") {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters?.subscription === "true") {
      result = result.filter((a) => a.isSubscription);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.serviceName.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.username?.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.find((a) => a.id === id);
  }

  async createAccount(data: InsertAccount): Promise<Account> {
    const now = new Date();
    const account: Account = {
      id: this.nextId++,
      serviceName: data.serviceName,
      serviceUrl: data.serviceUrl ?? null,
      category: data.category ?? "other",
      username: data.username ?? null,
      email: data.email ?? null,
      logoUrl: data.logoUrl ?? null,
      notes: data.notes ?? null,
      isSubscription: data.isSubscription ?? false,
      isFavorite: data.isFavorite ?? false,
      subscriptionCost: data.subscriptionCost ?? null,
      billingCycle: data.billingCycle ?? null,
      nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
      currency: data.currency ?? "KRW",
      logoStyle: data.logoStyle ?? null,
      deleteDifficulty: data.deleteDifficulty ?? null,
      deleteUrl: data.deleteUrl ?? null,
      deleteGuide: data.deleteGuide ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.accounts.push(account);
    return account;
  }

  async updateAccount(
    id: number,
    data: UpdateAccount
  ): Promise<Account | undefined> {
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.accounts[idx] = {
      ...this.accounts[idx],
      ...data,
      updatedAt: new Date(),
    } as Account;
    return this.accounts[idx];
  }

  async deleteAccount(id: number): Promise<boolean> {
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.accounts.splice(idx, 1);
    return true;
  }

  async toggleFavorite(id: number): Promise<Account | undefined> {
    const account = this.accounts.find((a) => a.id === id);
    if (!account) return undefined;
    account.isFavorite = !account.isFavorite;
    account.updatedAt = new Date();
    return account;
  }

  async getDashboardStats() {
    const totalAccounts = this.accounts.length;
    const subs = this.accounts.filter((a) => a.isSubscription);
    const subscriptionAccounts = subs.length;
    const monthlyCost = subs.reduce((sum, a) => {
      if (!a.subscriptionCost) return sum;
      if (a.billingCycle === "yearly") return sum + Math.round(a.subscriptionCost / 12);
      if (a.billingCycle === "weekly") return sum + a.subscriptionCost * 4;
      return sum + a.subscriptionCost;
    }, 0);

    const catMap = new Map<string, number>();
    for (const a of this.accounts) {
      catMap.set(a.category, (catMap.get(a.category) || 0) + 1);
    }
    const categoryBreakdown = Array.from(catMap.entries()).map(
      ([category, count]) => ({ category, count })
    );

    return { totalAccounts, subscriptionAccounts, monthlyCost, categoryBreakdown };
  }

  async createAccountsBulk(serviceIds: string[]): Promise<{ created: number; skipped: number }> {
    const existingNames = new Set(this.accounts.map((a) => a.serviceName));
    let created = 0;
    let skipped = 0;

    for (const sid of serviceIds) {
      const svc = POPULAR_SERVICES.find((s) => s.id === sid);
      if (!svc) continue;
      if (existingNames.has(svc.name)) {
        skipped++;
        continue;
      }
      const now = new Date();
      this.accounts.push({
        id: this.nextId++,
        serviceName: svc.name,
        serviceUrl: svc.url,
        category: svc.category,
        username: null,
        email: null,
        logoUrl: null,
        notes: null,
        isSubscription: svc.isSubscription,
        isFavorite: false,
        subscriptionCost: svc.subscriptionCost ?? null,
        billingCycle: svc.billingCycle ?? null,
        nextBillingDate: null,
        currency: svc.currency ?? "KRW",
        logoStyle: svc.logoStyle,
        deleteDifficulty: svc.deleteDifficulty,
        deleteUrl: svc.deleteUrl ?? null,
        deleteGuide: svc.deleteGuide ?? null,
        createdAt: now,
        updatedAt: now,
      });
      existingNames.add(svc.name);
      created++;
    }

    return { created, skipped };
  }
}

export class DatabaseStorage implements IStorage {
  private get db() {
    return requireDb().db;
  }

  async getAccounts(filters?: {
    category?: string;
    subscription?: string;
    search?: string;
  }): Promise<Account[]> {
    const conditions = [];
    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(accounts.category, filters.category as any));
    }
    if (filters?.subscription === "true") {
      conditions.push(eq(accounts.isSubscription, true));
    }
    if (filters?.search) {
      conditions.push(ilike(accounts.serviceName, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      return this.db
        .select()
        .from(accounts)
        .where(and(...conditions))
        .orderBy(desc(accounts.createdAt));
    }
    return this.db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    return account;
  }

  async createAccount(data: InsertAccount): Promise<Account> {
    const [account] = await this.db.insert(accounts).values(data).returning();
    return account;
  }

  async updateAccount(
    id: number,
    data: UpdateAccount
  ): Promise<Account | undefined> {
    const [account] = await this.db
      .update(accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await this.db
      .delete(accounts)
      .where(eq(accounts.id, id))
      .returning();
    return result.length > 0;
  }

  async toggleFavorite(id: number): Promise<Account | undefined> {
    const existing = await this.getAccount(id);
    if (!existing) return undefined;
    const [account] = await this.db
      .update(accounts)
      .set({ isFavorite: !existing.isFavorite, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async getDashboardStats() {
    const allAccounts: Account[] = await this.db.select().from(accounts);
    const totalAccounts = allAccounts.length;
    const subs = allAccounts.filter((a: Account) => a.isSubscription);
    const subscriptionAccounts = subs.length;
    const monthlyCost = subs.reduce((sum: number, a: Account) => {
      if (!a.subscriptionCost) return sum;
      if (a.billingCycle === "yearly")
        return sum + Math.round(a.subscriptionCost / 12);
      if (a.billingCycle === "weekly") return sum + a.subscriptionCost * 4;
      return sum + a.subscriptionCost;
    }, 0);

    const catMap = new Map<string, number>();
    for (const a of allAccounts) {
      catMap.set(a.category, (catMap.get(a.category) || 0) + 1);
    }
    const categoryBreakdown = Array.from(catMap.entries()).map(
      ([category, count]) => ({ category, count })
    );

    return {
      totalAccounts,
      subscriptionAccounts,
      monthlyCost,
      categoryBreakdown,
    };
  }

  async createAccountsBulk(serviceIds: string[]): Promise<{ created: number; skipped: number }> {
    const existingAccounts: Account[] = await this.db.select().from(accounts);
    const existingNames = new Set(existingAccounts.map((a) => a.serviceName));
    let created = 0;
    let skipped = 0;
    const toInsert: InsertAccount[] = [];

    for (const sid of serviceIds) {
      const svc = POPULAR_SERVICES.find((s) => s.id === sid);
      if (!svc) continue;
      if (existingNames.has(svc.name)) {
        skipped++;
        continue;
      }
      toInsert.push({
        serviceName: svc.name,
        serviceUrl: svc.url,
        category: svc.category,
        isSubscription: svc.isSubscription,
        subscriptionCost: svc.subscriptionCost,
        billingCycle: svc.billingCycle,
        currency: svc.currency ?? "KRW",
        logoStyle: svc.logoStyle,
        deleteDifficulty: svc.deleteDifficulty,
        deleteUrl: svc.deleteUrl,
        deleteGuide: svc.deleteGuide,
      });
      existingNames.add(svc.name);
      created++;
    }

    if (toInsert.length > 0) {
      await this.db.insert(accounts).values(toInsert);
    }

    return { created, skipped };
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemoryStorage();
