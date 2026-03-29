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
  Zap,
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
        <div className="hero-gradient rounded-3xl p-8 sm:p-12 lg:p-16 mb-12 relative overflow-hidden shadow-hero">
          {/* 배경 장식 요소 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.04] rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium text-white/80">정부지원사업 & 투자유치 통합 플랫폼</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              {user?.name || "사용자"}님,<br />
              환영합니다
            </h1>
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed">
              오늘의 지원사업과 투자유치 정보를 확인하고,
              AI 맞춤 추천으로 최적의 기회를 찾아보세요.
            </p>
          </div>
        </div>

        {/* ── Onboarding Prompt ── */}
        {!profileLoading && !profile && (
          <Link href="/onboarding">
            <div className="rounded-2xl border-2 border-primary/15 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 sm:p-8 mb-12 cursor-pointer hover:border-primary/30 transition-all duration-300 group">
              <div className="flex items-center gap-5">
                <div className="icon-box icon-box-lg bg-primary/10 shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg">사업 프로필을 작성하세요</p>
                  <p className="text-muted-foreground mt-1.5">
                    프로필을 작성하면 AI가 맞춤형 지원사업을 추천해드립니다
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-12">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
          <QuickAction
            href="/programs/government"
            icon={<Landmark className="w-6 h-6" />}
            label="정부지원사업"
            desc="지원사업 전체 목록"
            iconColor="text-gov-primary dark:text-gov-primary-light"
            iconBg="bg-gov-primary/10"
          />
          <QuickAction
            href="/programs/investment"
            icon={<TrendingUp className="w-6 h-6" />}
            label="투자유치"
            desc="투자 프로그램 탐색"
            iconColor="text-invest-primary dark:text-invest-primary-light"
            iconBg="bg-invest-primary/10"
          />
          <QuickAction
            href="/recommendations"
            icon={<Zap className="w-6 h-6" />}
            label="AI 맞춤 추천"
            desc="나에게 맞는 사업"
            iconColor="text-warning-dark dark:text-warning-light"
            iconBg="bg-warning/10"
          />
          <QuickAction
            href="/discover"
            icon={<Search className="w-6 h-6" />}
            label="사업 검색"
            desc="통합 검색으로 찾기"
            iconColor="text-info dark:text-info-light"
            iconBg="bg-info/10"
          />
        </div>

        {/* ── 최신 정부지원사업 ── */}
        <section className="mb-16">
          <SectionHeader title="최신 정부지원사업" href="/programs/government" />
          {govLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : govPrograms && govPrograms.data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {govPrograms.data.map((p) => (
                <ProgramCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <EmptyState text="등록된 정부지원사업이 없습니다." />
          )}
        </section>

        {/* ── 최신 투자유치 프로그램 ── */}
        <section className="mb-16">
          <SectionHeader title="최신 투자유치 프로그램" href="/programs/investment" />
          {invLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : invPrograms && invPrograms.data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="section-divider" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium rounded-xl">
          전체보기 <ArrowRight className="w-4 h-4" />
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
    <Card className={`${href ? "cursor-pointer card-interactive" : ""} overflow-hidden`}>
      <CardContent className="p-5 sm:p-6">
        <div className={`icon-box icon-box-sm ${iconBg} ${color} mb-4`}>
          {icon}
        </div>
        <p className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
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
        <CardContent className="p-6">
          <div className={`icon-box icon-box-lg ${iconBg} ${iconColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <p className="font-bold text-lg mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-4">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-5 mb-2.5" />
        <Skeleton className="w-3/4 h-5 mb-5" />
        <Skeleton className="w-1/2 h-4" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-card/30">
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
