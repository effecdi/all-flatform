import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { User, Building2, Sun, Moon, Settings, ChevronRight, LogOut, Trash2, Key, Copy, CheckCheck, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { data: profile } = useBusinessProfile();
  const { data: user } = useAuth();
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [recoverInput, setRecoverInput] = useState("");
  const [recoverStatus, setRecoverStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [recovering, setRecovering] = useState(false);

  const fetchRecoveryCode = async () => {
    try {
      const res = await fetch("/api/recovery-code", { credentials: "same-origin" });
      if (res.ok) {
        const { recoveryCode: code } = await res.json();
        setRecoveryCode(code);
      }
    } catch { /* ignore */ }
  };

  const handleCopyCode = async () => {
    if (!recoveryCode) return;
    await navigator.clipboard.writeText(recoveryCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleRecover = async () => {
    if (!recoverInput.trim()) return;
    setRecovering(true);
    setRecoverStatus(null);
    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ recoveryCode: recoverInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoverStatus({ type: "success", message: data.message });
        setRecoverInput("");
        qc.invalidateQueries({ queryKey: ["/api/profile"] });
        qc.invalidateQueries({ queryKey: ["/api/bookmarks"] });
        fetchRecoveryCode();
      } else {
        setRecoverStatus({ type: "error", message: data.message });
      }
    } catch {
      setRecoverStatus({ type: "error", message: "복구에 실패했습니다." });
    } finally {
      setRecovering(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      qc.setQueryData(["/api/auth/me"], null);
      qc.clear();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="icon-box icon-box-lg bg-muted">
            <Settings className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">설정</h1>
            <p className="text-sm text-muted-foreground mt-1.5">계정 및 환경 설정</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Account */}
          {user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                  </div>
                  계정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">이메일</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                {user.name && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">이름</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-500/10">
                    <LogOut className="w-3.5 h-3.5" />
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business profile */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-success dark:text-success-light" />
                  </div>
                  사업 프로필
                </CardTitle>
                <Link href="/onboarding">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    {profile ? "수정" : "작성하기"}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">회사명</span>
                    <span className="font-medium">{profile.companyName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">단계</span>
                    <span className="font-medium">{profile.businessStage}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">업종</span>
                    <span className="font-medium">{profile.industrySector}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">지역</span>
                    <span className="font-medium">{profile.region}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">프로필이 아직 작성되지 않았습니다.</p>
              )}
            </CardContent>
          </Card>

          {/* Recovery Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                프로필 복구
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 내 복구 코드 */}
              {profile && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    내 복구 코드 (브라우저 변경 시 프로필 복구용)
                  </p>
                  {recoveryCode ? (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <code className="font-mono font-bold tracking-wider text-sm flex-1">{recoveryCode}</code>
                      <Button variant="ghost" size="sm" onClick={handleCopyCode} className="shrink-0 h-7 w-7 p-0">
                        {codeCopied ? <CheckCheck className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={fetchRecoveryCode} className="gap-2">
                      <Key className="w-3.5 h-3.5" />
                      복구 코드 확인
                    </Button>
                  )}
                </div>
              )}

              {/* 복구 코드로 복원 */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  기존 복구 코드로 프로필 복원
                </p>
                <div className="flex gap-2">
                  <Input
                    value={recoverInput}
                    onChange={e => setRecoverInput(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="font-mono uppercase text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecover}
                    disabled={recovering || !recoverInput.trim()}
                    className="shrink-0 gap-1.5"
                  >
                    {recovering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    복구
                  </Button>
                </div>
                {recoverStatus && (
                  <p className={`text-xs mt-2 ${recoverStatus.type === "success" ? "text-success" : "text-red-500"}`}>
                    {recoverStatus.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
                </div>
                테마 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">현재 테마: {theme === "dark" ? "다크 모드" : "라이트 모드"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">원하는 화면 모드를 선택하세요</p>
                </div>
                <Button variant="outline" size="sm" onClick={toggle} className="gap-2">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === "dark" ? "라이트 모드" : "다크 모드"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {user && (
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-red-600 dark:text-red-400">위험 영역</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={async () => {
                      try {
                        await fetch("/api/auth/account", { method: "DELETE", credentials: "same-origin" });
                        window.location.href = "/";
                      } catch {
                        setConfirmDelete(false);
                      }
                    }}>
                      정말 삭제합니다
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-500/10 gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    계정 삭제
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
