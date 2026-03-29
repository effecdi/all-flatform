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
  ChevronRight,
  BarChart3,
  Shield,
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
        {/* ── Hero Section ── */}
        <div className="hero-gradient rounded-2xl p-8 sm:p-10 lg:p-12 mb-10 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-white/70" />
              <span className="text-sm font-medium text-white/70">정부지원사업 & 투자유치 통합 플랫폼</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {user?.name || "사용자"}님, 환영합니다
            </h1>
            <p className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
              오늘의 지원사업과 투자유치 정보를 확인하고,<br className="hidden sm:block" />
              AI 맞춤 추천으로 최적의 기회를 찾아보세요.
            </p>
          </div>
        </div>

        {/* ── Onboarding Prompt ── */}
        {!profileLoading && !profile && (
          <Link href="/onboarding">
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 mb-10 cursor-pointer hover:border-primary/40 hover:bg-primary/8 transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base">사업 프로필을 작성하세요</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    프로필을 작성하면 AI가 맞춤형 지원사업을 추천해드립니다
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="전체 사업"
            value={stats?.totalGovernmentPrograms ?? 0}
            color="text-gov-primary dark:text-gov-primary-light"
            iconBg="bg-gov-primary/10"
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="모집중"
            value={stats?.activeGovernmentPrograms ?? 0}
            color="text-success dark:text-success-light"
            iconBg="bg-success/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="투자 프로그램"
            value={stats?.totalInvestmentPrograms ?? 0}
            color="text-invest-primary dark:text-invest-primary-light"
            iconBg="bg-invest-primary/10"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="마감임박"
            value={stats?.upcomingDeadlines ?? 0}
            color="text-error dark:text-error-light"
            iconBg="bg-error/10"
            href={stats?.upcomingDeadlines ? "/programs/government?deadline=true" : undefined}
          />
          <StatCard
            icon={<Bookmark className="w-5 h-5" />}
            label="북마크"
            value={stats?.bookmarkCount ?? 0}
            color="text-warning dark:text-warning-light"
            iconBg="bg-warning/10"
            href="/bookmarks"
          />
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <QuickAction
            href="/programs/government"
            icon={<Landmark className="w-5 h-5" />}
            label="정부지원사업"
            desc="지원사업 목록 보기"
            iconColor="text-gov-primary"
            iconBg="bg-gov-primary/10"
          />
          <QuickAction
            href="/programs/investment"
            icon={<TrendingUp className="w-5 h-5" />}
            label="투자유치"
            desc="투자 프로그램 보기"
            iconColor="text-invest-primary"
            iconBg="bg-invest-primary/10"
          />
          <QuickAction
            href="/recommendations"
            icon={<Sparkles className="w-5 h-5" />}
            label="AI 맞춤 추천"
            desc="나에게 맞는 사업 찾기"
            iconColor="text-warning-dark dark:text-warning-light"
            iconBg="bg-warning/10"
          />
          <QuickAction
            href="/discover"
            icon={<Search className="w-5 h-5" />}
            label="사업 검색"
            desc="통합 검색으로 찾기"
            iconColor="text-info dark:text-info-light"
            iconBg="bg-info/10"
          />
        </div>

        {/* ── 최신 정부지원사업 ── */}
        <section className="mb-12">
          <SectionHeader title="최신 정부지원사업" href="/programs/government" />
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

        {/* ── 최신 투자유치 프로그램 ── */}
        <section className="mb-12">
          <SectionHeader title="최신 투자유치 프로그램" href="/programs/investment" />
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

        {/* ── AI 추천 ── */}
        {latestRecs && latestRecs.length > 0 && (
          <section>
            <SectionHeader title="AI 추천 사업" href="/recommendations" />
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

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="section-divider mb-0 w-1 h-6 rounded-full bg-primary" />
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
      </div>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium">
          전체보기 <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  iconBg,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  iconBg: string;
  href?: string;
}) {
  const inner = (
    <Card className={`${href ? "cursor-pointer card-interactive" : ""}`}>
      <CardContent className="p-4 sm:p-5">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3 ${color}`}>
          {icon}
        </div>
        <p className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
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
  iconColor,
  iconBg,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer card-interactive h-full group">
        <CardContent className="p-5">
          <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <p className="font-semibold text-base mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex gap-2 mb-3">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-5 mb-2" />
        <Skeleton className="w-3/4 h-5 mb-4" />
        <Skeleton className="w-1/2 h-4" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/30">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
