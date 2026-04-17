import { useQuery } from "@tanstack/react-query";

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
    staleTime: Infinity,
  });
}
