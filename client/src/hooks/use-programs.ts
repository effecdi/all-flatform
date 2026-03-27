import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@shared/types";

export interface GovernmentProgram {
  id: number;
  title: string;
  organization: string | null;
  supportType: string;
  status: string;
  description: string | null;
  targetAudience: string | null;
  supportAmount: string | null;
  applicationMethod: string | null;
  applicationUrl: string | null;
  region: string | null;
  startDate: string | null;
  endDate: string | null;
  announcementDate: string | null;
  requiredDocuments: string | null;
  selectionProcess: string | null;
  supportDetails: string | null;
  contactInfo: string | null;
  excludedTargets: string | null;
  attachmentUrls: string | null;
  sourceUrl: string | null;
  source: string;
  viewCount: number;
  createdAt: string;
}

export interface InvestmentProgram {
  id: number;
  title: string;
  organization: string | null;
  investorType: string;
  description: string | null;
  investmentScale: string | null;
  targetStage: string | null;
  targetIndustry: string | null;
  contactInfo: string | null;
  websiteUrl: string | null;
  applicationUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

export function useGovernmentPrograms(filters: {
  supportType?: string;
  status?: string;
  region?: string;
  search?: string;
  deadline?: boolean;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.supportType) params.set("supportType", filters.supportType);
  if (filters.status) params.set("status", filters.status);
  if (filters.region) params.set("region", filters.region);
  if (filters.search) params.set("search", filters.search);
  if (filters.deadline) params.set("deadline", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const queryStr = params.toString();
  const url = `/api/programs/government${queryStr ? `?${queryStr}` : ""}`;

  return useQuery<PaginatedResult<GovernmentProgram>>({
    queryKey: ["/api/programs/government", filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw new Error("프로그램 목록 조회 실패");
      return res.json();
    },
  });
}

export function useGovernmentProgram(id: number) {
  return useQuery<GovernmentProgram>({
    queryKey: ["/api/programs/government", id],
    queryFn: async () => {
      const res = await fetch(`/api/programs/government/${id}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("프로그램 조회 실패");
      return res.json();
    },
    enabled: id > 0,
  });
}

export function useInvestmentPrograms(filters: {
  investorType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.investorType) params.set("investorType", filters.investorType);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const queryStr = params.toString();
  const url = `/api/programs/investment${queryStr ? `?${queryStr}` : ""}`;

  return useQuery<PaginatedResult<InvestmentProgram>>({
    queryKey: ["/api/programs/investment", filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw new Error("투자 프로그램 조회 실패");
      return res.json();
    },
  });
}

export function useInvestmentProgram(id: number) {
  return useQuery<InvestmentProgram>({
    queryKey: ["/api/programs/investment", id],
    queryFn: async () => {
      const res = await fetch(`/api/programs/investment/${id}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("투자 프로그램 조회 실패");
      return res.json();
    },
    enabled: id > 0,
  });
}
