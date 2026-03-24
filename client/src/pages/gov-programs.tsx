import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { ProgramCard } from "@/components/program-card";
import { ProgramFilters } from "@/components/program-filters";
import { useGovernmentPrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

export default function GovProgramsPage() {
  const [filters, setFilters] = useState({
    supportType: "",
    status: "",
    region: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGovernmentPrograms({
    ...filters,
    supportType: filters.supportType || undefined,
    status: filters.status || undefined,
    region: filters.region || undefined,
    search: filters.search || undefined,
    page,
    limit: 20,
  });

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">정부지원사업</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {data ? `총 ${data.total}개의 지원사업` : "지원사업을 검색하세요"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="w-4 h-4 mr-1" /> : <SlidersHorizontal className="w-4 h-4 mr-1" />}
            필터
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}>
            <div className="sticky top-20 bg-white rounded-lg border border-border p-4">
              <ProgramFilters
                filters={filters}
                onChange={(f) => { setFilters(f); setPage(1); }}
              />
            </div>
          </div>

          {/* Program grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.data.map((p) => (
                    <ProgramCard
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      organization={p.organization}
                      supportType={p.supportType}
                      status={p.status}
                      region={p.region}
                      endDate={p.endDate}
                      supportAmount={p.supportAmount}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      {page} / {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">필터를 변경하거나 검색어를 수정해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
