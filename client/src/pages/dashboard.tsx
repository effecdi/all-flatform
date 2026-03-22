import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  Wallet,
  Star,
  Plus,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { BentoGrid, BentoItem } from "@/components/bento-grid";
import { StatsWidget } from "@/components/stats-widget";
import { CategoryChart } from "@/components/category-chart";
import { CostChart } from "@/components/cost-chart";
import { GlassCard } from "@/components/glass-card";
import { AccountFormDialog } from "@/components/account-form-dialog";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { getFaviconUrl } from "@/lib/favicon-fetcher";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isLoading = statsLoading || accountsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  const favoriteAccounts = accounts?.filter((a) => a.isFavorite).slice(0, 6) || [];
  const recentAccounts = accounts?.slice(0, 5) || [];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-text">대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">모든 계정을 한눈에 관리하세요</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> 계정 추가
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatsWidget
            icon={User}
            label="전체 계정"
            value={stats?.totalAccounts || 0}
            color="#a855f7"
            index={0}
          />
          <StatsWidget
            icon={CreditCard}
            label="구독 서비스"
            value={stats?.subscriptionAccounts || 0}
            color="#3b82f6"
            index={1}
          />
          <StatsWidget
            icon={Wallet}
            label="월 구독 비용"
            value={formatCurrency(stats?.monthlyCost || 0)}
            color="#22c55e"
            index={2}
          />
        </div>

        {/* Bento grid */}
        <BentoGrid className="md:grid-cols-2 lg:grid-cols-3">
          {/* Category chart */}
          <BentoItem className="lg:col-span-1">
            <CategoryChart data={stats?.categoryBreakdown || []} />
          </BentoItem>

          {/* Cost chart */}
          <BentoItem className="lg:col-span-2">
            <CostChart accounts={accounts || []} />
          </BentoItem>

          {/* Favorites */}
          <BentoItem className="md:col-span-2 lg:col-span-2">
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-medium">즐겨찾기</h3>
              </div>
              {favoriteAccounts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  즐겨찾기한 계정이 없습니다
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {favoriteAccounts.map((account) => {
                    const favicon = getFaviconUrl(account.serviceUrl) || account.logoUrl;
                    return (
                      <div
                        key={account.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                          {favicon ? (
                            <img src={favicon} alt="" className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                              {account.serviceName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs truncate">{account.serviceName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </BentoItem>

          {/* Recent */}
          <BentoItem className="lg:col-span-1">
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium mb-3">최근 추가</h3>
              {recentAccounts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  아직 계정이 없습니다
                </p>
              ) : (
                <div className="space-y-2">
                  {recentAccounts.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {a.serviceName.charAt(0)}
                        </span>
                      </div>
                      <span className="truncate flex-1">{a.serviceName}</span>
                      <CategoryBadge category={a.category} />
                    </div>
                  ))}
                </div>
              )}
              <Link href="/accounts">
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                  전체 보기
                </Button>
              </Link>
            </GlassCard>
          </BentoItem>
        </BentoGrid>

        <AccountFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </PageTransition>
  );
}
