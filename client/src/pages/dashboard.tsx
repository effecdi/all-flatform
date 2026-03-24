import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FileText,
  TrendingUp,
  Clock,
  Bookmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { DashboardStats } from "@shared/types";
import type { RecommendationItem } from "@shared/schema";
import { RecommendationCard } from "@/components/recommendation-card";

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useBusinessProfile();
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  const { data: recommendations } = useQuery<Array<{
    id: number;
    recommendations: RecommendationItem[];
    createdAt: string;
  }>>({
    queryKey: ["/api/recommendations"],
  });

  const latestRecs = recommendations?.[0]?.recommendations?.slice(0, 5);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
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
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 mb-6 cursor-pointer hover:bg-primary/10 transition-colors">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="전체 사업"
            value={stats?.totalGovernmentPrograms ?? 0}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="모집중"
            value={stats?.activeGovernmentPrograms ?? 0}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="투자 프로그램"
            value={stats?.totalInvestmentPrograms ?? 0}
            color="text-teal-600"
            bg="bg-teal-50"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="마감임박"
            value={stats?.upcomingDeadlines ?? 0}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            icon={<Bookmark className="w-5 h-5" />}
            label="북마크"
            value={stats?.bookmarkCount ?? 0}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/programs/government">
            <div className="bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm">정부지원사업</h3>
              <p className="text-xs text-muted-foreground mt-1">지원사업 목록 보기</p>
            </div>
          </Link>
          <Link href="/programs/investment">
            <div className="bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="font-semibold text-sm">투자유치</h3>
              <p className="text-xs text-muted-foreground mt-1">투자 프로그램 보기</p>
            </div>
          </Link>
          <Link href="/recommendations">
            <div className="bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-sm">AI 맞춤 추천</h3>
              <p className="text-xs text-muted-foreground mt-1">나에게 맞는 사업 찾기</p>
            </div>
          </Link>
        </div>

        {/* Latest recommendations */}
        {latestRecs && latestRecs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">AI 추천 사업</h2>
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
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-border p-4">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
