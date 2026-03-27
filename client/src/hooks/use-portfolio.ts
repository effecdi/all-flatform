import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Portfolio {
  id: number;
  userId: number;
  companyName: string;
  tagline: string | null;
  mission: string | null;
  vision: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  brandColor: string | null;
  accentColor: string | null;
  industrySector: string | null;
  businessStage: string | null;
  foundedYear: string | null;
  region: string | null;
  employeeCount: string | null;
  website: string | null;
  teamMembers: TeamMember[] | null;
  projects: Project[] | null;
  milestones: Milestone[] | null;
  metrics: Metric[] | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string> | null;
  aboutUs: string | null;
  techStack: string[] | null;
  awards: string[] | null;
  isPublic: number;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description?: string;
  imageUrl?: string;
  linkedIn?: string;
  email?: string;
}

export interface Project {
  title: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  url?: string;
  year?: string;
}

export interface Milestone {
  date: string;
  title: string;
  description?: string;
  type?: "founding" | "funding" | "product" | "award" | "partnership" | "growth" | "other";
}

export interface Metric {
  label: string;
  value: string;
  suffix?: string;
  icon?: string;
}

export type PortfolioInput = Omit<Portfolio, "id" | "createdAt" | "updatedAt">;

export function usePortfolio() {
  return useQuery<Portfolio | null>({
    queryKey: ["/api/portfolio"],
    retry: false,
  });
}

export function usePortfolioBySlug(slug: string) {
  return useQuery<Portfolio>({
    queryKey: ["/api/portfolio", slug],
    queryFn: async () => {
      const res = await fetch(`/api/portfolio/${slug}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
    retry: false,
  });
}

export function useSavePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PortfolioInput>) => {
      const res = await apiRequest("POST", "/api/portfolio", data);
      return res.json() as Promise<Portfolio>;
    },
    onSuccess: (portfolio) => {
      qc.setQueryData(["/api/portfolio"], portfolio);
    },
  });
}
