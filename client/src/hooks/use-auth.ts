import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; name?: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      qc.setQueryData(["/api/auth/me"], null);
      qc.clear();
      setLocation("/login");
    },
  });
}
