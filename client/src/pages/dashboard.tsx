import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useGovernmentPrograms, useInvestmentPrograms } from "@/hooks/use-programs";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramCard } from "@/components/program-card";
import { InvestmentCard } from "@/components/investment-card";
import { RecommendationCard } from "@/components/recommendation-card";
import {
  FileText,
  TrendingUp,
  Clock,
  Bookmark,
  Sparkles,
  ArrowRight,
  Landmark,
  Search,
} from "lucide-react";
import type { DashboardStats } from "@shared/types";
import type { RecommendationItem } from "@shared/schema";

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: govPrograms, isLoading: govLoading } = useGovernmentPrograms({
    limit: 6,
  });

  const { data: invPrograms, isLoading: invLoading } = useInvestmentPrograms({
    limit: 4,
  });

  const { data: recommendations } = useQuery<Array<{
    id: number;
    recommendations: RecommendationItem[];
    createdAt: string;
  }>>({
    queryKey: ["/api/recommendations"],
  });

  const latestRecs = recommendations?.[0]?.recommendations?.slice(0, 3);

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            안녕하세요, {user?.name || user?.email}님
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            오늘의 지원사업과 투자유치 정보를 확인하세요
          </p>
        </div>

        {/* Onboarding prompt */}
        {!profileLoading && !profile && (
          <Link href="/onboarding">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-6 cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">사업 프로필을 작성하세요</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    프로필을 작성하면 AI가 맞춤형 지원사업을 추천해드립니다
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0 ml-auto" />
              </div>
            </div>
          </Link>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="전체 사업"
            value={stats?.totalGovernmentPrograms ?? 0}
            color="text-gov-primary dark:text-gov-primary-light"
            bg="bg-gov-primary/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="모집중"
            value={stats?.activeGovernmentPrograms ?? 0}
            color="text-success dark:text-success-light"
            bg="bg-success/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="투자 프로그램"
            value={stats?.totalInvestmentPrograms ?? 0}
            color="text-invest-primary dark:text-invest-primary-light"
            bg="bg-invest-primary/10"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="마감임박"
            value={stats?.upcomingDeadlines ?? 0}
            color="text-error dark:text-error-light"
            bg="bg-error/10"
            href={stats?.upcomingDeadlines ? "/programs/government?deadline=true" : undefined}
          />
          <StatCard
            icon={<Bookmark className="w-5 h-5" />}
            label="북마크"
            value={stats?.bookmarkCount ?? 0}
            color="text-warning dark:text-warning-light"
            bg="bg-warning/10"
            href="/bookmarks"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <QuickAction
            href="/programs/government"
            icon={<Landmark className="w-4.5 h-4.5" />}
            label="정부지원사업"
            desc="지원사업 목록 보기"
            color="text-gov-primary dark:text-gov-primary-light"
            bg="bg-gov-primary/10"
          />
          <QuickAction
            href="/programs/investment"
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            label="투자유치"
            desc="투자 프로그램 보기"
            color="text-invest-primary dark:text-invest-primary-light"
            bg="bg-invest-primary/10"
          />
          <QuickAction
            href="/recommendations"
            icon={<Sparkles className="w-4.5 h-4.5" />}
            label="AI 맞춤 추천"
            desc="나에게 맞는 사업 찾기"
            color="text-warning dark:text-warning-light"
            bg="bg-warning/10"
          />
          <QuickAction
            href="/discover"
            icon={<Search className="w-4.5 h-4.5" />}
            label="사업 검색"
            desc="통합 검색으로 찾기"
            color="text-primary dark:text-primary-light"
            bg="bg-primary/10"
          />
        </div>

        {/* 최신 정부지원사업 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gov-primary dark:text-gov-primary-light" />
              최신 정부지원사업
            </h2>
            <Link href="/programs/government">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                전체보기 <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {govLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : govPrograms && govPrograms.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {govPrograms.data.map((p) => (
                <ProgramCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <EmptyState text="등록된 정부지원사업이 없습니다." />
          )}
        </section>

        {/* 최신 투자유치 프로그램 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-invest-primary dark:text-invest-primary-light" />
              최신 투자유치 프로그램
            </h2>
            <Link href="/programs/investment">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                전체보기 <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {invLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : invPrograms && invPrograms.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {invPrograms.data.map((p) => (
                <InvestmentCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <EmptyState text="등록된 투자유치 프로그램이 없습니다." />
          )}
        </section>

        {/* AI 추천 */}
        {latestRecs && latestRecs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning dark:text-warning-light" />
                AI 추천 사업
              </h2>
              <Link href="/recommendations">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  전체보기 <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestRecs.map((rec, i) => (
                <RecommendationCard key={i} {...rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}

/* ── Sub Components ── */

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
  href?: string;
}) {
  const inner = (
    <Card className={`${href ? "cursor-pointer hover:shadow-soft-hover hover:-translate-y-0.5" : ""} transition-all`}>
      <CardContent className="p-4">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
          <div className={color}>{icon}</div>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

function QuickAction({
  href,
  icon,
  label,
  desc,
  color,
  bg,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  bg: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover:shadow-soft-hover hover:-translate-y-0.5 transition-all h-full">
        <CardContent className="p-5">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
            <div className={color}>{icon}</div>
          </div>
          <h3 className="font-semibold text-sm">{label}</h3>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <div className="h-1.5 bg-muted rounded-t-xl" />
      <CardContent className="p-5 pt-4">
        <div className="flex gap-1.5 mb-3">
          <Skeleton className="w-14 h-5 rounded-full" />
          <Skeleton className="w-10 h-5 rounded-full" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-4" />
        <Skeleton className="w-1/2 h-3.5" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/50">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
