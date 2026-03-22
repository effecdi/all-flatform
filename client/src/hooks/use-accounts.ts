import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Account, InsertAccount, UpdateAccount } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export function useAccounts(filters?: {
  category?: string;
  subscription?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== "all") params.set("category", filters.category);
  if (filters?.subscription) params.set("subscription", filters.subscription);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();

  return useQuery<Account[]>({
    queryKey: [`/api/accounts${qs ? `?${qs}` : ""}`],
  });
}

export function useAccount(id: number) {
  return useQuery<Account>({
    queryKey: [`/api/accounts/${id}`],
    enabled: id > 0,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAccount) => {
      const res = await apiRequest("POST", "/api/accounts", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/accounts"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "계정이 추가되었습니다." });
    },
    onError: (err: Error) => {
      toast({ title: "추가 실패", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAccount }) => {
      const res = await apiRequest("PATCH", `/api/accounts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/accounts"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "계정이 수정되었습니다." });
    },
    onError: (err: Error) => {
      toast({ title: "수정 실패", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/accounts"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "계정이 삭제되었습니다." });
    },
    onError: (err: Error) => {
      toast({ title: "삭제 실패", description: err.message, variant: "destructive" });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/accounts/${id}/favorite`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
  });
}

export function useBulkCreateAccounts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (services: string[]) => {
      const res = await apiRequest("POST", "/api/accounts/bulk", { services });
      return res.json() as Promise<{ created: number; skipped: number }>;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/accounts"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      const msg =
        data.skipped > 0
          ? `${data.created}개 추가, ${data.skipped}개 중복 스킵`
          : `${data.created}개 계정이 추가되었습니다.`;
      toast({ title: msg });
    },
    onError: (err: Error) => {
      toast({ title: "일괄 추가 실패", description: err.message, variant: "destructive" });
    },
  });
}

export function useDashboardStats() {
  return useQuery<{
    totalAccounts: number;
    subscriptionAccounts: number;
    monthlyCost: number;
    categoryBreakdown: { category: string; count: number }[];
  }>({
    queryKey: ["/api/dashboard/stats"],
  });
}
