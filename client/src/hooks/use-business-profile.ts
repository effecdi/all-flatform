import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface BusinessProfile {
  id: number;
  userId: number;
  companyName: string;
  businessStage: string;
  industrySector: string;
  region: string;
  employeeCount: number | null;
  annualRevenue: string | null;
  techField: string | null;
  desiredFunding: string | null;
  businessDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useBusinessProfile() {
  return useQuery<BusinessProfile | null>({
    queryKey: ["/api/profile"],
    retry: false,
  });
}

export function useSaveBusinessProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<BusinessProfile, "id" | "userId" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/profile", data);
      return res.json() as Promise<BusinessProfile>;
    },
    onSuccess: (profile) => {
      qc.setQueryData(["/api/profile"], profile);
    },
  });
}
