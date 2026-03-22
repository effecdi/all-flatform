import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, Loader2, AlertCircle, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBulkCreateAccounts } from "@/hooks/use-accounts";
import { apiRequest } from "@/lib/queryClient";
import { POPULAR_SERVICES } from "@shared/popular-services";
import { toast } from "@/hooks/use-toast";

interface DiscoveredAccount {
  serviceName: string;
  serviceUrl: string;
  category: string;
  emailSubject: string;
  emailDate: string;
  fromAddress: string;
}

interface GmailScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
}

export function GmailScanDialog({ open, onOpenChange, sessionId }: GmailScanDialogProps) {
  const [scanning, setScanning] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredAccount[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bulkCreate = useBulkCreateAccounts();

  const startScan = async () => {
    if (!sessionId) return;
    setScanning(true);
    setError(null);
    try {
      const res = await apiRequest("POST", "/api/gmail/scan", { sessionId });
      const data = await res.json();
      setDiscovered(data.accounts || []);
      setSelected(new Set((data.accounts || []).map((a: DiscoveredAccount) => a.serviceName)));
      setScanned(true);
    } catch (err: any) {
      setError(err.message || "스캔에 실패했습니다.");
    } finally {
      setScanning(false);
    }
  };

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAdd = async () => {
    // Map discovered accounts to popular-services IDs where possible, otherwise create directly
    const serviceIds: string[] = [];
    const directAccounts: { serviceName: string; serviceUrl: string; category: string }[] = [];

    for (const acc of discovered) {
      if (!selected.has(acc.serviceName)) continue;
      const popular = POPULAR_SERVICES.find((s) => s.name === acc.serviceName);
      if (popular) {
        serviceIds.push(popular.id);
      } else {
        directAccounts.push({
          serviceName: acc.serviceName,
          serviceUrl: acc.serviceUrl,
          category: acc.category,
        });
      }
    }

    if (serviceIds.length > 0) {
      await bulkCreate.mutateAsync(serviceIds);
    }

    // Create accounts not in popular-services DB individually
    for (const acc of directAccounts) {
      try {
        await apiRequest("POST", "/api/accounts", acc);
      } catch {
        // skip duplicates
      }
    }

    if (directAccounts.length > 0 && serviceIds.length === 0) {
      toast({ title: `${directAccounts.length}개 계정이 추가되었습니다.` });
    }

    onOpenChange(false);
    setDiscovered([]);
    setSelected(new Set());
    setScanned(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-neon-blue" />
            Gmail 계정 탐색
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 px-6 overflow-auto">
          {!scanned && !scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Gmail 받은편지함을 스캔하여
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                가입된 서비스를 자동으로 찾습니다.
              </p>
              <Button
                onClick={startScan}
                disabled={!sessionId}
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
              >
                <Mail className="w-4 h-4" />
                스캔 시작
              </Button>
              {!sessionId && (
                <p className="text-xs text-destructive mt-3">
                  Google 인증이 필요합니다. 먼저 로그인하세요.
                </p>
              )}
            </motion.div>
          )}

          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Loader2 className="w-10 h-10 animate-spin text-neon-blue mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">받은편지함 스캔 중...</p>
              <p className="text-xs text-muted-foreground">
                가입 확인 메일을 분석하고 있습니다
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={startScan}>
                다시 시도
              </Button>
            </motion.div>
          )}

          {scanned && !scanning && discovered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-sm text-muted-foreground">
                가입 메일을 찾지 못했습니다.
              </p>
            </motion.div>
          )}

          {scanned && discovered.length > 0 && (
            <div className="space-y-2 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  {discovered.length}개 서비스 발견
                </p>
                <span className="text-xs text-neon-blue font-medium">
                  {selected.size}개 선택됨
                </span>
              </div>
              <AnimatePresence>
                {discovered.map((acc) => (
                  <motion.button
                    key={acc.serviceName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => toggle(acc.serviceName)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selected.has(acc.serviceName)
                        ? "border-neon-blue/60 bg-neon-blue/10"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected.has(acc.serviceName)
                          ? "bg-neon-blue border-neon-blue"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected.has(acc.serviceName) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <img
                      src={`/api/favicon?url=${encodeURIComponent(acc.serviceUrl)}`}
                      alt=""
                      className="w-6 h-6 rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {acc.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {acc.emailSubject}
                      </p>
                    </div>
                    {acc.emailDate && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(acc.emailDate).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {scanned && discovered.length > 0 && (
          <div className="border-t border-border/50 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              {selected.size}개 선택됨
            </p>
            <Button
              onClick={handleAdd}
              disabled={selected.size === 0 || bulkCreate.isPending}
              className="gap-1.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
            >
              {bulkCreate.isPending ? "추가 중..." : `${selected.size}개 추가`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
