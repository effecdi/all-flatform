import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      setLocation("/");
    } catch (err: any) {
      const msg = err.message || "로그인에 실패했습니다.";
      try {
        const parsed = JSON.parse(msg.replace(/^\d+:\s*/, ""));
        setError(parsed.message || msg);
      } catch {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">All-Flatform</h1>
          <p className="text-sm text-muted-foreground mt-1">정부지원사업 & 투자유치 탐색 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">이메일</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호</label>
            <Input
              type="password"
              placeholder="6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            로그인
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
