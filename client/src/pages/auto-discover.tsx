import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { QuickImportDialog } from "@/components/quick-import-dialog";
import { GmailScanDialog } from "@/components/gmail-scan-dialog";
import { apiRequest } from "@/lib/queryClient";

export default function AutoDiscoverPage() {
  const [quickImportOpen, setQuickImportOpen] = useState(false);
  const [gmailDialogOpen, setGmailDialogOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);

  // Check URL params for session ID from Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    const error = params.get("error");

    if (session) {
      setSessionId(session);
      setGmailDialogOpen(true);
      // Clean URL
      window.history.replaceState({}, "", "/auto-discover");
    }
    if (error) {
      setAuthError("Google 인증에 실패했습니다. 다시 시도해주세요.");
      window.history.replaceState({}, "", "/auto-discover");
    }
  }, []);

  // Check if Google OAuth is configured
  useEffect(() => {
    apiRequest("GET", "/api/auth/google")
      .then(() => setGoogleConfigured(true))
      .catch((err) => {
        if (err.message.includes("501")) {
          setGoogleConfigured(false);
        } else {
          setGoogleConfigured(true);
        }
      });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const res = await apiRequest("GET", "/api/auth/google");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading gradient-text">
            자동 계정 탐색
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            인기 서비스를 빠르게 추가하거나, Gmail에서 가입된 서비스를 자동으로
            찾아보세요.
          </p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{authError}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Import Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-neon-purple/50 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-purple/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2">인기 서비스 빠른 추가</h2>
              <p className="text-sm text-muted-foreground mb-4">
                50개 이상의 인기 서비스 중에서 사용 중인 서비스를 체크하여 한 번에
                등록하세요. 구독 비용, 삭제 난이도 정보가 자동으로 포함됩니다.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-6">
                <li>• SNS, 쇼핑, 금융, 엔터, 업무 등 10개 카테고리</li>
                <li>• 구독 서비스 비용 자동 입력</li>
                <li>• 계정 삭제 난이도 및 가이드 포함</li>
              </ul>
              <Button
                onClick={() => setQuickImportOpen(true)}
                className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
              >
                <Zap className="w-4 h-4" />
                서비스 선택하기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Gmail Scan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-neon-blue/50 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-blue/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2">Gmail 자동 탐색</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Google 계정으로 로그인하면 받은편지함에서 가입 확인 메일을
                자동으로 분석하여 가입된 서비스를 찾아냅니다.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-6">
                <li>• 100개+ 서비스 이메일 패턴 인식</li>
                <li>• 가입 메일 발견 시 근거(제목/날짜) 표시</li>
                <li>• 원하는 서비스만 선택하여 추가</li>
              </ul>
              {googleConfigured === false ? (
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="font-medium mb-1">Google OAuth 미설정</p>
                  <p>
                    .env 파일에 GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을
                    설정하면 사용할 수 있습니다.
                  </p>
                </div>
              ) : sessionId ? (
                <Button
                  onClick={() => setGmailDialogOpen(true)}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
                >
                  <Search className="w-4 h-4" />
                  스캔 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleGoogleLogin}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-red-500 hover:opacity-90"
                >
                  <Mail className="w-4 h-4" />
                  Google 계정으로 로그인
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <QuickImportDialog
          open={quickImportOpen}
          onOpenChange={setQuickImportOpen}
        />
        <GmailScanDialog
          open={gmailDialogOpen}
          onOpenChange={setGmailDialogOpen}
          sessionId={sessionId}
        />
      </div>
    </PageTransition>
  );
}
