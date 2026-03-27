import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { InvestmentCard } from "@/components/investment-card";
import { InvestmentFilters } from "@/components/investment-filters";
import { useInvestmentPrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, X, TrendingUp } from "lucide-react";

export default function InvestmentProgramsPage() {
  const [filters, setFilters] = useState({
    investorType: "",
    status: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useInvestmentPrograms({
    investorType: filters.investorType || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    page,
    limit: 20,
  });

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-invest-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-invest-primary dark:text-invest-primary-light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">투자유치 프로그램</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data ? `총 ${data.total}개의 투자 프로그램` : "투자 프로그램을 검색하세요"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="md:hidden gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            필터
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters - matching gov-programs layout */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}>
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <InvestmentFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <div className="h-2 bg-muted rounded-t-xl" />
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
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.data.map((p) => (
                    <InvestmentCard
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      organization={p.organization}
                      investorType={p.investorType}
                      investmentScale={p.investmentScale}
                      targetStage={p.targetStage}
                      endDate={p.endDate}
                      status={p.status}
                    />
                  ))}
                </div>

                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground px-2 tabular-nums">
                      {page} / {data.totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                      다음
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 rounded-xl border border-dashed border-border bg-card/50">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-1">필터를 변경하거나 검색어를 수정해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
