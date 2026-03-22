import { motion } from "framer-motion";
import { CreditCard, CalendarClock, AlertTriangle } from "lucide-react";
import type { Account } from "@shared/schema";
import { BILLING_CYCLES } from "@shared/schema";
import { GlassCard } from "./glass-card";
import { CategoryBadge } from "./category-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/favicon-fetcher";

interface SubscriptionTrackerProps {
  accounts: Account[];
}

export function SubscriptionTracker({ accounts }: SubscriptionTrackerProps) {
  const subs = accounts
    .filter((a) => a.isSubscription)
    .sort((a, b) => {
      if (a.nextBillingDate && b.nextBillingDate) {
        return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      }
      return (b.subscriptionCost || 0) - (a.subscriptionCost || 0);
    });

  if (subs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">구독 중인 서비스가 없습니다</p>
        <p className="text-xs text-muted-foreground/60 mt-1">계정 추가 시 "구독 서비스"를 활성화하세요</p>
      </div>
    );
  }

  const totalMonthly = subs.reduce((sum, a) => {
    if (!a.subscriptionCost) return sum;
    if (a.billingCycle === "yearly") return sum + Math.round(a.subscriptionCost / 12);
    if (a.billingCycle === "weekly") return sum + a.subscriptionCost * 4;
    return sum + a.subscriptionCost;
  }, 0);

  return (
    <div className="space-y-4">
      <GlassCard hover={false} className="neon-purple">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">월간 총 구독 비용</p>
            <p className="text-3xl font-bold font-heading gradient-text">
              {formatCurrency(totalMonthly)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">연간 환산</p>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(totalMonthly * 12)}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-2">
        {subs.map((account, i) => {
          const favicon = getFaviconUrl(account.serviceUrl) || account.logoUrl;
          const isUpcoming =
            account.nextBillingDate &&
            new Date(account.nextBillingDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                {favicon ? (
                  <img src={favicon} alt="" className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {account.serviceName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{account.serviceName}</span>
                  <CategoryBadge category={account.category} />
                  {isUpcoming && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      <AlertTriangle className="w-3 h-3 mr-0.5" />곧 결제
                    </Badge>
                  )}
                </div>
                {account.nextBillingDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <CalendarClock className="w-3 h-3" />
                    <span>다음 결제: {formatDate(account.nextBillingDate)}</span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">
                  {account.subscriptionCost ? formatCurrency(account.subscriptionCost) : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {BILLING_CYCLES[account.billingCycle || "monthly"]}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
