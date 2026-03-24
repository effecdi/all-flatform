import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Check, Lock, User, Settings } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { data: user } = useAuth();
  const { data: profile } = useBusinessProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    setPwLoading(true);
    try {
      await apiRequest("PUT", "/api/settings/password", {
        currentPassword,
        newPassword,
      });
      setPwMsg({ type: "success", text: "비밀번호가 변경되었습니다." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      const msg = err.message || "변경 실패";
      try {
        const parsed = JSON.parse(msg.replace(/^\d+:\s*/, ""));
        setPwMsg({ type: "error", text: parsed.message || msg });
      } catch {
        setPwMsg({ type: "error", text: msg });
      }
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">설정</h1>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">계정 정보</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이름</span>
              <span>{user?.name || "-"}</span>
            </div>
          </div>
        </div>

        {/* Business profile */}
        <div className="bg-white rounded-lg border border-border p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">사업 프로필</h2>
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="text-xs">
                {profile ? "수정" : "작성하기"}
              </Button>
            </Link>
          </div>
          {profile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">회사명</span>
                <span>{profile.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">단계</span>
                <span>{profile.businessStage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">업종</span>
                <span>{profile.industrySector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">지역</span>
                <span>{profile.region}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">프로필이 아직 작성되지 않았습니다.</p>
          )}
        </div>

        {/* Password change */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold">비밀번호 변경</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwMsg.text && (
              <div className={`p-3 rounded-lg text-sm border ${
                pwMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {pwMsg.text}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm">현재 비밀번호</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">새 비밀번호</label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={pwLoading} className="gap-1">
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              변경
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
