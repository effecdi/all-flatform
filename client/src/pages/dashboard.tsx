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
  User, // 개인 포트폴리오에 어울리는 아이콘 추가
  Code, // 기술 스택 또는 프로젝트 아이콘
} from "lucide-react";
import type { DashboardStats } from "@shared/types";
import type { RecommendationItem } from "@shared/schema";

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile(); // 비즈니스 프로필 대신 개인 프로필로 가정
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // 포트폴리오 관련 통계 데이터 (가정)
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"], // 실제 데이터는 백엔드 구현에 따라 변경 필요
  });

  // 투자 프로그램 및 정부 사업 데이터를 포트폴리오 프로젝트로 사용
  const { data: govPrograms, isLoading: govLoading } = useGovernmentPrograms({
    status: "완료", // 완료된 프로젝트 위주로 보여주기
    limit: 6,
  });

  const { data: invPrograms, isLoading: invLoading } = useInvestmentPrograms({
    status: "완료", // 완료된 프로젝트 위주로 보여주기
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
      navigate(`/portfolio?q=${encodeURIComponent(trimmed)}`); // 검색 경로 변경
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/portfolio?q=${encodeURIComponent(tag)}`); // 태그 검색 경로 변경
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
      <div className="page-container space-y-12 pb-16 bg-portfolio-background text-portfolio-text font-sans">
        {/* Hero Section - 개인 소개 및 핵심 역량 */}
        <section className="relative py-12 md:py-20 px-6 md:px-10 rounded-2xl bg-portfolio-card shadow-elevated overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-portfolio-primary/[0.05] to-transparent pointer-events-none" />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-portfolio-primary to-portfolio-secondary flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
              {user?.name ? user.name.charAt(0) : (user?.email ? user.email.charAt(0).toUpperCase() : '' )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-portfolio-text mb-4">
              안녕하세요, <span className="gradient-text bg-gradient-to-r from-portfolio-primary to-portfolio-secondary text-transparent bg-clip-text">{user?.name || user?.email}</span>입니다.
            </h1>
            <p className="text-lg text-portfolio-text-light mt-3 max-w-2xl mx-auto">
              UX/UI 디자인, 프론트엔드 개발, 그리고 반응형 웹 전문가로서 사용자 중심의 인터페이스를 구축합니다. 
              다양한 프로젝트 경험을 통해 얻은 인사이트로 탁월한 사용자 경험을 제공합니다.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mt-8 mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-portfolio-text-light" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="관심 있는 프로젝트나 기술 스택을 검색해보세요 (예: React, Figma, 모바일 앱)"
                  className="pl-12 h-14 rounded-full shadow-md text-base border-portfolio-border focus:border-portfolio-primary/50 bg-white"
                />
              </div>
              <Button type="submit" disabled={!searchQuery.trim()} size="lg" className="px-8 h-14 rounded-full text-base font-semibold shadow-md bg-portfolio-primary hover:bg-portfolio-primary-dark text-white">
                검색
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["React", "TypeScript", "Tailwind CSS", "UX/UI 디자인", "모바일 앱"].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-4 py-2 text-sm rounded-full border border-portfolio-primary/20 bg-portfolio-primary/5 text-portfolio-primary hover:bg-portfolio-primary/15 hover:border-portfolio-primary/40 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* 핵심 역량 (Statistics 대체) */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold flex items-center gap-4 text-portfolio-text">
            <div className="w-12 h-12 rounded-xl bg-portfolio-secondary/10 flex items-center justify-center shrink-0">
              <Code className="w-6 h-6 text-portfolio-secondary" />
            </div>
            핵심 역량 및 기술 스택
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SkillCard icon={<Lightbulb className="w-6 h-6" />} label="UX/UI 디자인" description="사용자 중심의 직관적이고 매력적인 인터페이스 설계" color="text-portfolio-primary" bg="bg-portfolio-primary/10" />
            <SkillCard icon={<Code className="w-6 h-6" />} label="프론트엔드 개발" description="React, TypeScript, Tailwind CSS를 활용한 반응형 웹 구현" color="text-portfolio-secondary" bg="bg-portfolio-secondary/10" />
            <SkillCard icon={<TrendingUp className="w-6 h-6" />} label="반응형 웹" description="모든 디바이스에서 최적화된 사용자 경험 제공" color="text-portfolio-accent" bg="bg-portfolio-accent/10" />
            <SkillCard icon={<Sparkles className="w-6 h-6" />} label="인터랙션 디자인" description="애니메이션과 전환 효과를 통한 동적 UI 구현" color="text-violet-500" bg="bg-violet-500/10" />
          </div>
        </section>

        {/* 주요 프로젝트 (Government Programs 대체) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-4 text-portfolio-text">
              <div className="w-12 h-12 rounded-xl bg-portfolio-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-portfolio-primary" />
              </div>
              주요 프로젝트 (정부지원사업 기반)
            </h2>
            <Link href="/portfolio/government">
              <Button variant="ghost" size="sm" className="gap-1 text-base font-medium text-portfolio-primary hover:text-portfolio-primary-dark hover:bg-portfolio-primary/10 transition-colors">
                전체 프로젝트 보기 <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          {govLoading ? (
            <CardGrid cols={3}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </CardGrid>
          ) : govPrograms && govPrograms.data.length > 0 ? (
            <CardGrid cols={3}>
              {govPrograms.data.map((program) => (
                <ProgramCard key={program.id} {...program} />
              ))}
            </CardGrid>
          ) : (
            <EmptySection text="표시할 정부지원사업 기반 프로젝트가 없습니다." icon={<Building2 className="w-6 h-6 text-portfolio-text-light" />} />
          )}
        </section>

        {/* 투자유치 프로젝트 (Investment Programs 대체) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-4 text-portfolio-text">
              <div className="w-12 h-12 rounded-xl bg-portfolio-secondary/10 flex items-center justify-center shrink-0">
                <Megaphone className="w-6 h-6 text-portfolio-secondary" />
              </div>
              주요 프로젝트 (투자유치 프로그램 기반)
            </h2>
            <Link href="/portfolio/investment">
              <Button variant="ghost" size="sm" className="gap-1 text-base font-medium text-portfolio-secondary hover:text-portfolio-secondary-dark hover:bg-portfolio-secondary/10 transition-colors">
                전체 프로젝트 보기 <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          {invLoading ? (
            <CardGrid cols={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </CardGrid>
          ) : invPrograms && invPrograms.data.length > 0 ? (
            <CardGrid cols={2}>
              {invPrograms.data.map((program) => (
                <InvestmentCard key={program.id} {...program} />
              ))}
            </CardGrid>
          ) : (
            <EmptySection text="표시할 투자유치 프로그램 기반 프로젝트가 없습니다." icon={<Megaphone className="w-6 h-6 text-portfolio-text-light" />} />
          )}
        </section>

        {/* 맞춤 추천 (AI Recommendations 대체) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-4 text-portfolio-text">
              <div className="w-12 h-12 rounded-xl bg-portfolio-accent/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-portfolio-accent" />
              </div>
              AI 기반 맞춤형 제안 (협업, 기술 스택)
            </h2>
            <Link href="/recommendations">
              <Button variant="ghost" size="sm" className="gap-1 text-base font-medium text-portfolio-accent hover:text-portfolio-accent/80 hover:bg-portfolio-accent/10 transition-colors">
                자세히 보기 <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          {recsLoading ? (
            <CardGrid cols={3}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
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
              text={profile ? "AI 추천을 받으려면 추천 페이지에서 분석을 요청하세요." : "개인 프로필을 작성하면 AI 맞춤 제안을 받을 수 있습니다."}
              icon={<Sparkles className="w-6 h-6 text-portfolio-text-light" />}
            />
          )}
        </section>
      </div>
    </PageTransition>
  );
}

// 카드 그리드 컴포넌트
function CardGrid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return <div className={cols === 3 ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-6 sm:grid-cols-2"}>{children}</div>;
}

// 빈 섹션 컴포넌트
function EmptySection({ text, icon }: { text: string, icon?: React.ReactNode }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-portfolio-border bg-portfolio-card/50 flex flex-col items-center justify-center gap-4 text-portfolio-text-light">
      {icon && <div className="text-portfolio-text-light/80">{icon}</div>}
      <p className="text-lg font-medium">{text}</p>
    </div>
  );
}

// 통계 카드 대신 핵심 역량 카드로 변경
function SkillCard({ icon, label, description, color, bg }: { icon: React.ReactNode; label: string; description: string; color: string; bg: string }) {
  return (
    <Card className="h-full border-portfolio-border bg-portfolio-card shadow-card-soft hover:shadow-card-hover transition-all duration-300 group">
      <CardContent className="p-6 flex flex-col items-start">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
          <div className={`${color} text-2xl`}>{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-portfolio-text mb-2">{label}</h3>
        <p className="text-sm text-portfolio-text-light leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

// 스켈레톤 카드 컴포넌트 (로딩 중 UI)
function SkeletonCard() {
  return (
    <Card className="h-full border-portfolio-border bg-portfolio-card p-6 rounded-xl">
      <div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
    </Card>
  );
}
