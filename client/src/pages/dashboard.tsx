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
          <h1 className="text-xl font-bold mb-1">
            {user?.name || "사용자"}님, 환영합니다
          </h1>
          <p className="text-sm text-muted-foreground">
            오늘의 지원사업과 투자유치 정보를 확인하세요
          </p>
        </div>

        {/* Onboarding prompt */}
        {!profileLoading && !profile && (
          <Link href="/onboarding">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-8 cursor-pointer hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">사업 프로필을 작성하세요</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    프로필을 작성하면 AI가 맞춤형 지원사업을 추천해드립니다
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              </div>
            </div>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatCard
            label="전체 사업"
            value={stats?.totalGovernmentPrograms ?? 0}
            color="text-gov-primary dark:text-gov-primary-light"
          />
          <StatCard
            label="모집중"
            value={stats?.activeGovernmentPrograms ?? 0}
            color="text-success dark:text-success-light"
          />
          <StatCard
            label="투자 프로그램"
            value={stats?.totalInvestmentPrograms ?? 0}
            color="text-invest-primary dark:text-invest-primary-light"
          />
          <StatCard
            label="마감임박"
            value={stats?.upcomingDeadlines ?? 0}
            color="text-error dark:text-error-light"
            href={stats?.upcomingDeadlines ? "/programs/government?deadline=true" : undefined}
          />
          <StatCard
            label="북마크"
            value={stats?.bookmarkCount ?? 0}
            color="text-warning dark:text-warning-light"
            href="/bookmarks"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <QuickAction
            href="/programs/government"
            icon={<Landmark className="w-4 h-4" />}
            label="정부지원사업"
            desc="지원사업 목록 보기"
          />
          <QuickAction
            href="/programs/investment"
            icon={<TrendingUp className="w-4 h-4" />}
            label="투자유치"
            desc="투자 프로그램 보기"
          />
          <QuickAction
            href="/recommendations"
            icon={<Sparkles className="w-4 h-4" />}
            label="AI 맞춤 추천"
            desc="나에게 맞는 사업 찾기"
          />
          <QuickAction
            href="/discover"
            icon={<Search className="w-4 h-4" />}
            label="사업 검색"
            desc="통합 검색으로 찾기"
          />
        </div>

        {/* 최신 정부지원사업 */}
        <section className="mb-10">
          <SectionHeader title="최신 정부지원사업" href="/programs/government" />
          {govLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : govPrograms && govPrograms.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <SectionHeader title="최신 투자유치 프로그램" href="/programs/investment" />
          {invLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : invPrograms && invPrograms.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
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
            <SectionHeader title="AI 추천 사업" href="/recommendations" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
          전체보기 <ArrowRight className="w-3 h-3" />
        </Button>
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const inner = (
    <Card className={`${href ? "cursor-pointer card-interactive" : ""}`}>
      <CardContent className="p-3.5">
        <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer card-interactive h-full">
        <CardContent className="p-3.5">
          <div className="text-muted-foreground mb-2">{icon}</div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-1.5 mb-3">
          <Skeleton className="w-14 h-5 rounded" />
          <Skeleton className="w-10 h-5 rounded" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-3" />
        <Skeleton className="w-1/2 h-3.5" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 rounded-lg border border-dashed border-border bg-card/30">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
