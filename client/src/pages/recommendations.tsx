import { useState, useMemo, useEffect } from "react";
import { PageTransition } from "@/components/page-transition";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Clock,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "wouter";
import type { RecommendationItem } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface RecommendationRecord {
  id: number;
  recommendations: RecommendationItem[];
  createdAt: string;
}

type FilterType = "all" | "government" | "investment";
type SortType = "score" | "urgency" | "type";

const LOADING_STEPS = [
  "프로필 분석 중...",
  "프로그램 매칭 중...",
  "AI 추천 생성 중...",
  "결과 검증 중...",
];

function LoadingProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center py-16 gap-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
      </div>
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {LOADING_STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-3 w-full">
            <div
              className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
                i < step ? "bg-success" : i === step ? "bg-amber-500 animate-pulse" : "bg-muted"
              }`}
            />
            <span
              className={`text-sm transition-colors duration-300 ${
                i <= step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryStats({ recommendations }: { recommendations: RecommendationItem[] }) {
  const stats = useMemo(() => {
    if (recommendations.length === 0) return null;
    const avgScore = Math.round(
      recommendations.reduce((s, r) => s + r.matchScore, 0) / recommendations.length
    );
    const govCount = recommendations.filter(r => r.programType === "government").length;
    const invCount = recommendations.filter(r => r.programType === "investment").length;
    const urgentCount = recommendations.filter(r => r.urgency === "high").length;
    return { avgScore, govCount, invCount, urgentCount };
  }, [recommendations]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
        <div className="text-2xl font-bold text-primary">{stats.avgScore}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">평균 매칭 점수</div>
      </div>
      <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
        <div className="text-2xl font-bold text-gov-primary">{stats.govCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">정부지원사업</div>
      </div>
      <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
        <div className="text-2xl font-bold text-invest-primary">{stats.invCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">투자유치</div>
      </div>
      <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
        <div className="text-2xl font-bold text-error">{stats.urgentCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">긴급 마감</div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { data: profile } = useBusinessProfile();
  const qc = useQueryClient();
  const { data: history, isLoading } = useQuery<RecommendationRecord[]>({
    queryKey: ["/api/recommendations"],
  });

  const generate = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/recommendations/generate");
      return res.json() as Promise<RecommendationRecord>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("score");

  const selected = history?.[selectedIdx];

  const filteredAndSorted = useMemo(() => {
    if (!selected) return [];
    let items = [...selected.recommendations];

    // Filter
    if (filterType !== "all") {
      items = items.filter(r => r.programType === filterType);
    }

    // Sort
    if (sortType === "score") {
      items.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortType === "urgency") {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => {
        const ua = urgencyOrder[a.urgency ?? "low"];
        const ub = urgencyOrder[b.urgency ?? "low"];
        return ua !== ub ? ua - ub : b.matchScore - a.matchScore;
      });
    } else if (sortType === "type") {
      items.sort((a, b) => {
        if (a.programType !== b.programType) {
          return a.programType === "government" ? -1 : 1;
        }
        return b.matchScore - a.matchScore;
      });
    }

    return items;
  }, [selected, filterType, sortType]);

  if (!profile) {
    return (
      <PageTransition>
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 pb-10">
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/50">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold text-lg">사업 프로필이 필요합니다</p>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              AI 맞춤 추천을 받으려면 먼저 사업 프로필을 작성해주세요
            </p>
            <Link href="/onboarding">
              <Button className="gap-2">
                프로필 작성하기 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI 맞춤 추천</h1>
              <p className="text-sm text-muted-foreground mt-0.5">사업 프로필 기반 맞춤 추천</p>
            </div>
          </div>
          <Button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="gap-2"
          >
            {generate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generate.isPending ? "분석 중..." : "새 추천 받기"}
          </Button>
        </div>

        {/* Error */}
        {generate.isError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/15 text-red-700 dark:text-red-300 text-sm">
            {(generate.error as Error).message || "추천 생성에 실패했습니다."}
          </div>
        )}

        {/* Loading with progress */}
        {generate.isPending ? (
          <LoadingProgress />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/50">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-amber-500/50" />
            </div>
            <p className="font-medium">아직 추천 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">"새 추천 받기" 버튼을 눌러 AI 분석을 시작하세요</p>
          </div>
        ) : (
          <>
            {/* History selector */}
            {history.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {history.map((h, i) => (
                  <Button
                    key={h.id}
                    variant={selectedIdx === i ? "default" : "outline"}
                    size="sm"
                    className="text-xs shrink-0 rounded-full"
                    onClick={() => setSelectedIdx(i)}
                  >
                    {formatDate(h.createdAt)}
                  </Button>
                ))}
              </div>
            )}

            {selected && (
              <>
                {/* Summary stats */}
                <SummaryStats recommendations={selected.recommendations} />

                {/* Filter & Sort controls */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">유형:</span>
                  </div>
                  {([
                    ["all", "전체"],
                    ["government", "정부지원"],
                    ["investment", "투자유치"],
                  ] as const).map(([val, label]) => (
                    <Button
                      key={val}
                      variant={filterType === val ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 rounded-full px-3"
                      onClick={() => setFilterType(val)}
                    >
                      {label}
                    </Button>
                  ))}

                  <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

                  <div className="flex items-center gap-1.5 mr-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">정렬:</span>
                  </div>
                  {([
                    ["score", "점수순"],
                    ["urgency", "긴급순"],
                    ["type", "유형순"],
                  ] as const).map(([val, label]) => (
                    <Button
                      key={val}
                      variant={sortType === val ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 rounded-full px-3"
                      onClick={() => setSortType(val)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Results count */}
                {filterType !== "all" && (
                  <p className="text-xs text-muted-foreground mb-4">
                    {filteredAndSorted.length}개 결과
                  </p>
                )}

                {/* Cards grid */}
                {filteredAndSorted.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSorted.map((rec, i) => (
                      <RecommendationCard key={`${rec.programType}-${rec.programId}`} {...rec} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    해당 유형의 추천 결과가 없습니다
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
