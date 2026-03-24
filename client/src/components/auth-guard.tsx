import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const DEV_USER = { email: "dev@test.com", password: "dev123", name: "개발자" };

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuth();
  const qc = useQueryClient();
  const autoLoginAttempted = useRef(false);

  useEffect(() => {
    if (isLoading || user || autoLoginAttempted.current) return;
    autoLoginAttempted.current = true;

    (async () => {
      try {
        // Try register first, then login if already exists
        let res: Response;
        try {
          res = await apiRequest("POST", "/api/auth/register", DEV_USER);
        } catch {
          res = await apiRequest("POST", "/api/auth/login", {
            email: DEV_USER.email,
            password: DEV_USER.password,
          });
        }
        const data = await res.json();
        qc.setQueryData(["/api/auth/me"], data);
      } catch {
        // Auto-login failed, will redirect to login page
      }
    })();
  }, [isLoading, user, qc]);

  if (isLoading || (!user && !autoLoginAttempted.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
