// /client/src/pages/dashboard.tsx
import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useGovernmentPrograms, useInvestmentPrograms } from "@/hooks/use-programs";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  AlertTriangle,
  ChevronRight,
  Building2,
  Megaphone,
  Lightbulb,
} from "lucide-react";
import type { DashboardStats } from "@shared/types";
import type { RecommendationItem } from "@shared/schema";

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: govPrograms, isLoading: govLoading } = useGovernmentPrograms({
    status: "모집중",
    limit: 6,
  });

  const { data: invPrograms, isLoading: invLoading } = useInvestmentPrograms({
    status: "모집중",
    limit: 4,
  });

  const { data: recommendations, isLoading: recsLoading } = useQuery<Array<{
    id: number;
    recommendations: RecommendationItem[];
    createdAt: string;
  }>>({
    queryKey: ["/api/recommendations"],
  });

  const latestRecs = recommendations?.[0]?.recommendations?.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/discover?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/discover?q=${encodeURIComponent(tag)}`);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <PageTransition>
      <div className="page-container space-y-8 pb-10">
        {/* Hero Section */}
        <section className="relative py-8 md:py-10 px-6 md:px-10 rounded-2xl bg-gradient-to-br from-background via-card to-primary/5 border border-border/60 shadow-soft overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
              안녕하세요, <span className="gradient-text bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">{user?.name || user?.email}</span>님
            </h1>
            <p className="text-md text-muted-foreground mt-3">{dateStr}</p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="다양한 지원사업을 검색해보세요 (예: 청년 창업, AI 스타트업)"
                  className="pl-12 h-14 rounded-full shadow-md text-base border-border/80 focus:border-primary/50"
                />
              </div>
              <Button type="submit" disabled={!searchQuery.trim()} size="lg" className="px-8 h-14 rounded-full text-base font-semibold shadow-md">
                검색
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {["청년 창업", "소상공인 지원", "기술 사업화", "AI 스타트업", "디지털 전환"].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-4 py-2 text-sm rounded-full border border-primary/20 bg-primary/5 text-primary-dark hover:bg-primary/15 hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Onboarding CTA */}
        {!profileLoading && !profile && (
          <Link href="/onboarding">
            <Card className="cursor-pointer group overflow-hidden border-primary/30 hover:border-primary transition-all shadow-md hover:shadow-lg hover:shadow-primary/5">
              <div className="h-1 bg-gradient-to-r from-primary to-violet-500" />
              <CardContent className="p-5 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Lightbulb className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground">사업 프로필을 작성하고 맞춤형 추천을 받아보세요!</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      프로필을 작성하면 AI가 귀사에 딱 맞는 지원사업을 찾아드립니다.
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Statistics */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            한눈에 보는 현황
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-full"><CardContent className="p-5">
                  <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                  <Skeleton className="w-20 h-8 mb-2" />
                  <Skeleton className="w-16 h-5" />
                </CardContent></Card>
              ))
            ) : (
              <>
                <StatCard icon={<FileText className="w-5 h-5" />} label="전체 사업" value={stats?.totalGovernmentPrograms ?? 0} color="text-gov-primary dark:text-gov-primary-light" bg="bg-gov-primary/10" href="/programs/government" />
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="모집중 사업" value={stats?.activeGovernmentPrograms ?? 0} color="text-success dark:text-success-light" bg="bg-success/10" href="/programs/government?status=모집중" />
                <StatCard icon={<Clock className="w-5 h-5" />} label="마감임박" value={stats?.upcomingDeadlines ?? 0} color="text-error dark:text-error-light" bg="bg-error/10" href="/programs/government?deadline=true" />
                <StatCard icon={<Bookmark className="w-5 h-5" />} label="북마크" value={stats?.bookmarkCount ?? 0} color="text-warning dark:text-warning-light" bg="bg-warning/10" href="/bookmarks" />
              </>
            )}
          </div>
        </section>

        {/* Deadline Alert */}
        {stats && stats.upcomingDeadlines > 0 && (
          <Link href="/programs/government?deadline=true">
            <Card className="cursor-pointer group overflow-hidden border-error/30 hover:border-error transition-all hover:shadow-lg hover:shadow-error/5">
              <div className="h-1 bg-gradient-to-r from-error to-error-light" />
              <CardContent className="p-4 pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-error dark:text-error-light" />
                  </div>
                  <p className="text-base font-medium flex-1 text-foreground">
                    마감임박 사업 <span className="font-bold text-error dark:text-error-light">{stats.upcomingDeadlines}건</span>이 있습니다. 지금 바로 확인하세요!
                  </p>
                  <ChevronRight className="w-5 h-5 text-error/60 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Government Programs */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-xl bg-gov-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-gov-primary" />
              </div>
              모집중 정부지원사업
            </h2>
            <Link href="/programs/government">
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-gov-primary hover:text-gov-primary-dark hover:bg-gov-primary/10 transition-colors">
                전체보기 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {govLoading ? (
            <CardGrid cols={3}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><div className="h-2 bg-muted rounded-t-xl" /><CardContent className="p-5 pt-4">
                  <div className="flex gap-2 mb-3"><Skeleton className="w-16 h-6 rounded-full" /><Skeleton className="w-12 h-6 rounded-full" /></div>
                  <Skeleton className="w-full h-5 mb-2" /><Skeleton className="w-3/4 h-5 mb-4" /><Skeleton className="w-1/2 h-4" />
                </CardContent></Card>
              ))}
            </CardGrid>
          ) : govPrograms && govPrograms.data.length > 0 ? (
            <CardGrid cols={3}>
              {govPrograms.data.map((program) => (
                <ProgramCard key={program.id} {...program} />
              ))}
            </CardGrid>
          ) : (
            <EmptySection text="현재 모집중인 정부지원사업이 없습니다." icon={<Building2 className="w-6 h-6 text-muted-foreground/60" />} />
          )}
        </section>

        {/* Investment Programs */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-xl bg-invest-primary/10 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-invest-primary" />
              </div>
              모집중 투자유치 프로그램
            </h2>
            <Link href="/programs/investment">
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-invest-primary hover:text-invest-primary-dark hover:bg-invest-primary/10 transition-colors">
                전체보기 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {invLoading ? (
            <CardGrid cols={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><div className="h-2 bg-muted rounded-t-xl" /><CardContent className="p-5 pt-4">
                  <div className="flex gap-2 mb-3"><Skeleton className="w-16 h-6 rounded-full" /><Skeleton className="w-12 h-6 rounded-full" /></div>
                  <Skeleton className="w-full h-5 mb-2" /><Skeleton className="w-3/4 h-5 mb-4" /><Skeleton className="w-1/2 h-4" />
                </CardContent></Card>
              ))}
            </CardGrid>
          ) : invPrograms && invPrograms.data.length > 0 ? (
            <CardGrid cols={2}>
              {invPrograms.data.map((program) => (
                <InvestmentCard key={program.id} {...program} />
              ))}
            </CardGrid>
          ) : (
            <EmptySection text="현재 모집중인 투자유치 프로그램이 없습니다." icon={<Megaphone className="w-6 h-6 text-muted-foreground/60" />} />
          )}
        </section>

        {/* AI Recommendations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              AI 맞춤 추천
            </h2>
            <Link href="/recommendations">
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-colors">
                전체보기 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {recsLoading ? (
            <CardGrid cols={3}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><div className="h-2 bg-muted rounded-t-xl" /><CardContent className="p-5 pt-4">
                  <Skeleton className="w-28 h-6 mb-3" /><Skeleton className="w-full h-5 mb-2" /><Skeleton className="w-full h-4 mb-1" /><Skeleton className="w-2/3 h-4" />
                </CardContent></Card>
              ))}
            </CardGrid>
          ) : latestRecs && latestRecs.length > 0 ? (
            <CardGrid cols={3}>
              {latestRecs.map((rec, i) => (
                <RecommendationCard key={i} {...rec} />
              ))}
            </CardGrid>
          ) : (
            <EmptySection
              text={profile ? "AI 추천을 받으려면 추천 페이지에서 분석을 요청하세요." : "사업 프로필을 작성하면 AI 맞춤 추천을 받을 수 있습니다."}
              icon={<Sparkles className="w-6 h-6 text-muted-foreground/60" />}
            />
          )}
        </section>
      </div>
    </PageTransition>
  );
}

function CardGrid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return <div className={cols === 3 ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4 sm:grid-cols-2"}>{children}</div>;
}

function EmptySection({ text, icon }: { text: string, icon?: React.ReactNode }) {
  return (
    <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3">
      {icon && <div className="text-muted-foreground/80">{icon}</div>}
      <p className="text-base text-muted-foreground font-medium">{text}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, href }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer card-interactive group h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
        <CardContent className="p-5">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
            <div className={color}>{icon}</div>
          </div>
          <p className="text-3xl font-extrabold tabular-nums text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
