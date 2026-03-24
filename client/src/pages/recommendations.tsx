import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { RecommendationItem } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface RecommendationRecord {
  id: number;
  recommendations: RecommendationItem[];
  createdAt: string;
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
  const selected = history?.[selectedIdx];

  if (!profile) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-10">
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">사업 프로필이 필요합니다</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              AI 맞춤 추천을 받으려면 먼저 사업 프로필을 작성해주세요
            </p>
            <Link href="/onboarding">
              <Button className="gap-1">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI 맞춤 추천</h1>
            <p className="text-sm text-muted-foreground mt-1">사업 프로필 기반 맞춤 추천</p>
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

        {generate.isError && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 mb-6">
            {(generate.error as Error).message || "추천 생성에 실패했습니다."}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>아직 추천 결과가 없습니다</p>
            <p className="text-sm mt-1">"새 추천 받기" 버튼을 눌러 AI 분석을 시작하세요</p>
          </div>
        ) : (
          <>
            {history.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {history.map((h, i) => (
                  <Button
                    key={h.id}
                    variant={selectedIdx === i ? "default" : "outline"}
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={() => setSelectedIdx(i)}
                  >
                    {formatDate(h.createdAt)}
                  </Button>
                ))}
              </div>
            )}

            {selected && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selected.recommendations.map((rec, i) => (
                  <RecommendationCard key={i} {...rec} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
