import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  BellRing,
  Bookmark,
  Building,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flame,
  Lightbulb,
  MapPin,
  Megaphone,
  Palette,
  Percent,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  fetchDashboardData,
  fetchNotifications,
  fetchRecommendations,
} from "@/api";
import {
  DashboardData,
  Notification,
  ProgramCardProps,
  Recommendation,
} from "@/shared/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramCard } from "@/components/program-card";
import { InvestmentCard } from "@/components/investment-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { MatchScoreBadge } from "@/components/match-score-badge";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery<DashboardData>(["dashboardData"], fetchDashboardData);

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useQuery<Notification[]>(["notifications"], fetchNotifications);

  const {
    data: recommendations,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
  } = useQuery<Recommendation[]>(
    ["recommendations"],
    fetchRecommendations,
    {
      enabled: !!dashboardData?.userProfileExists, // 프로필이 있을 때만 호출
    }
  );

  const today = useMemo(() => format(new Date(), "yyyy년 MM월 dd일", { locale: ko }), []);

  const dummyTags = [
    "초기 창업",
    "기술 스타트업",
    "수출 지원",
    "제조업 혁신",
    "청년 일자리",
  ];

  const filteredGovPrograms = useMemo(() => {
    if (!dashboardData?.recentGovPrograms) return [];
    if (!activeFilter) return dashboardData.recentGovPrograms;
    // 실제 필터링 로직 필요
    return dashboardData.recentGovPrograms.filter((p) =>
      p.title.includes(activeFilter)
    );
  }, [dashboardData?.recentGovPrograms, activeFilter]);

  const filteredInvestPrograms = useMemo(() => {
    if (!dashboardData?.recentInvestmentPrograms) return [];
    if (!activeFilter) return dashboardData.recentInvestmentPrograms;
    // 실제 필터링 로직 필요
    return dashboardData.recentInvestmentPrograms.filter((p) =>
      p.title.includes(activeFilter)
    );
  }, [dashboardData?.recentInvestmentPrograms, activeFilter]);

  if (dashboardError)
    return (
      <div className="text-center text-error-foreground p-8">
        대시보드 데이터를 불러오는 데 실패했습니다: {dashboardError.message}
      </div>
    );
  if (notificationsError)
    return (
      <div className="text-center text-error-foreground p-8">
        알림 데이터를 불러오는 데 실패했습니다: {notificationsError.message}
      </div>
    );
  if (recommendationsError)
    return (
      <div className="text-center text-error-foreground p-8">
        추천 데이터를 불러오는 데 실패했습니다: {recommendationsError.message}
      </div>
    );

  return (
    <div className="page-container space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-background via-card to-background rounded-2xl shadow-lg border border-border/50">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in">
          안녕하세요, <span className="gradient-text">사업가님!</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{today}</p>
        <div className="max-w-xl mx-auto px-4">
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="궁금한 정부지원사업이나 투자정보를 검색해보세요!"
              className="pl-12 pr-4 py-2 rounded-full h-12 text-base shadow-md focus-visible:ring-primary focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {dummyTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeFilter === tag ? "primary" : "secondary"}
                className={cn(
                  "cursor-pointer px-4 py-1 text-sm rounded-full transition-all duration-200",
                  activeFilter === tag ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding CTA */}
      {!isDashboardLoading && !dashboardData?.userProfileExists && (
        <Card className="border-primary/20 bg-primary/5 shadow-md card-interactive relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-light group-hover:to-primary-dark transition-all duration-300"></div>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-300">
                <Lightbulb />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-primary-dark dark:text-primary-light">
                  사업 프로필을 완성하고 맞춤 추천을 받아보세요!
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  몇 가지 정보만 입력하면 AI가 딱 맞는 사업을 찾아드립니다.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="default"
              className="group-hover:bg-primary-dark group-hover:shadow-lg transition-all duration-300"
            >
              <Link href="/onboarding">
                시작하기 <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary" />
          한눈에 보는 나의 사업 현황
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isDashboardLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            : dashboardData?.statistics.map((stat) => (
                <Card key={stat.label} className="card-interactive">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.label}
                    </CardTitle>
                    {stat.icon === "ClipboardList" && (
                      <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    )}
                    {stat.icon === "Bookmark" && (
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    )}
                    {stat.icon === "CheckCircle2" && (
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    )}
                    {stat.icon === "Percent" && (
                      <Percent className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Deadline Notifications */}
      {!isNotificationsLoading && notifications && notifications.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center">
            <BellRing className="w-6 h-6 mr-2 text-error" />
            마감 임박 알림
          </h2>
          <Card className="border-error/30 bg-error/5 shadow-md card-interactive relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error to-error-light group-hover:to-error-dark transition-all duration-300"></div>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Flame className="w-8 h-8 text-error flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <CardTitle className="text-lg font-semibold text-error-dark dark:text-error-light">
                    {notifications.length}개의 사업 마감일이 임박했어요!
                  </CardTitle>
                  <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1">
                    {notifications.slice(0, 3).map((notif) => (
                      <li key={notif.id}>
                        <Link href={`/programs/government/${notif.programId}`} className="text-primary hover:underline font-medium">
                          <span className="text-error font-bold mr-1">{notif.dDay}</span> {notif.title}
                        </Link>
                      </li>
                    ))}
                    {notifications.length > 3 && (
                      <li>
                        <Link href="/notifications" className="text-primary hover:underline">
                          더 많은 알림 보기
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Government Programs Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gov-primary/10 text-gov-primary flex items-center justify-center mr-3">
              <Building className="w-6 h-6" />
            </div>
            새로운 정부지원사업
          </h2>
          <Button asChild variant="ghost" className="text-gov-primary hover:bg-gov-primary/10">
            <Link href="/programs/government">
              전체보기 <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isDashboardLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            : filteredGovPrograms.slice(0, 6).map((program) => (
                <ProgramCard
                  key={program.id}
                  program={{
                    ...program,
                    gradient: "gradient-gov-card-top", // 새로운 클래스 적용
                  }}
                />
              ))}
        </div>
      </section>

      {/* Investment Programs Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <div className="w-10 h-10 rounded-xl bg-invest-primary/10 text-invest-primary flex items-center justify-center mr-3">
              <Megaphone className="w-6 h-6" />
            </div>
            새로운 투자유치 기회
          </h2>
          <Button asChild variant="ghost" className="text-invest-primary hover:bg-invest-primary/10">
            <Link href="/programs/investment">
              전체보기 <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isDashboardLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            : filteredInvestPrograms.slice(0, 4).map((program) => (
                <InvestmentCard
                  key={program.id}
                  program={{
                    ...program,
                    gradient: "gradient-invest-card-top", // 새로운 클래스 적용
                  }}
                />
              ))}
        </div>
      </section>

      {/* AI Recommendations Section */}
      {!isRecommendationsLoading && recommendations && recommendations.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mr-3">
                <UserCheck className="w-6 h-6" />
              </div>
              AI 맞춤 추천 사업
            </h2>
            <Button asChild variant="ghost" className="text-amber-500 hover:bg-amber-500/10">
              <Link href="/recommendations">
                전체보기 <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isRecommendationsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))
              : recommendations.slice(0, 3).map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
          </div>
        </section>
      )}
    </div>
  );
}

// SearchIcon 추가 (Lucide Icons에서 직접 가져오기)
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
