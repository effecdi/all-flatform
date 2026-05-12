import { useState, useMemo } from "react";
import { PageTransition } from "@/components/page-transition";
import { ProgramCard } from "@/components/program-card";
import { ProgramFilters } from "@/components/program-filters";
import { useGovernmentPrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, X, Landmark, Clock } from "lucide-react";
import { useLocation, useSearch } from "wouter";

export default function GovProgramsPage() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const initialStatus = urlParams.get("status") || "";
  const initialDeadline = urlParams.get("deadline") === "true";

  const [filters, setFilters] = useState({ supportType: "", status: initialStatus, region: "", search: "" });
  const [deadlineFilter, setDeadlineFilter] = useState(initialDeadline);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGovernmentPrograms({
    ...filters,
    supportType: filters.supportType || undefined,
    status: filters.status || undefined,
    region: filters.region || undefined,
    search: filters.search || undefined,
    deadline: deadlineFilter || undefined,
    page,
    limit: 20,
  });

  const clearDeadlineFilter = () => {
    setDeadlineFilter(false);
    setPage(1);
    navigate("/programs/government", { replace: true });
  };

  return (
    <PageTransition>
      <div className="page-container">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="icon-box icon-box-lg bg-gov-primary/10">
              <Landmark className="w-7 h-7 text-gov-primary dark:text-gov-primary-light" />
            </div>
            <div>
              <span className="section-number">Government Programs</span>
              <h1>정부지원사업</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {data ? `총 ${data.total}개의 지원사업` : "지원사업을 검색하세요"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="md:hidden gap-1.5 rounded-xl" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            필터
          </Button>
        </div>

        {deadlineFilter && (
          <div className="flex items-center gap-3 mb-6 px-5 py-4 rounded-2xl bg-error/8 border border-error/15">
            <Clock className="w-5 h-5 text-error shrink-0" />
            <p className="text-sm font-semibold text-error flex-1">마감임박 사업만 표시 중 (7일 이내 마감)</p>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm text-error hover:bg-error/10 rounded-lg" onClick={clearDeadlineFilter}>
              <X className="w-4 h-4 mr-1" /> 해제
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-72 shrink-0`}>
            <Card className="sticky top-24">
              <CardContent className="p-5">
                <ProgramFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}><div className="h-1.5 bg-muted rounded-t-xl" /><CardContent className="p-6">
                    <div className="flex gap-2 mb-4"><Skeleton className="w-16 h-6 rounded-full" /><Skeleton className="w-12 h-6 rounded-full" /></div>
                    <Skeleton className="w-full h-5 mb-2.5" /><Skeleton className="w-3/4 h-5 mb-5" /><Skeleton className="w-1/2 h-4" />
                  </CardContent></Card>
                ))}
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.data.map((p) => (
                    <ProgramCard key={p.id} id={p.id} title={p.title} organization={p.organization} supportType={p.supportType} status={p.status} region={p.region} endDate={p.endDate} supportAmount={p.supportAmount} />
                  ))}
                </div>
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl px-5">이전</Button>
                    <span className="text-sm text-muted-foreground px-3 tabular-nums font-medium">{page} / {data.totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl px-5">다음</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 rounded-2xl border-2 border-dashed border-border bg-card/30">
                <p className="text-lg text-muted-foreground">검색 결과가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">필터를 변경하거나 검색어를 수정해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
