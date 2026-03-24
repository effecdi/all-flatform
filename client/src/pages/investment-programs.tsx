import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { InvestmentCard } from "@/components/investment-card";
import { useInvestmentPrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { INVESTOR_TYPE_LABELS } from "@shared/constants";

export default function InvestmentProgramsPage() {
  const [filters, setFilters] = useState({
    investorType: "",
    status: "",
    search: "",
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInvestmentPrograms({
    investorType: filters.investorType || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    page,
    limit: 20,
  });

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">투자유치 프로그램</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `총 ${data.total}개의 투자 프로그램` : "투자 프로그램을 검색하세요"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="투자 프로그램 검색..."
                  value={filters.search}
                  onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={filters.investorType === "" ? "default" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => { setFilters(f => ({ ...f, investorType: "" })); setPage(1); }}
              >
                전체
              </Button>
              {Object.entries(INVESTOR_TYPE_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filters.investorType === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => { setFilters(f => ({ ...f, investorType: key })); setPage(1); }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  이전
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  {page} / {data.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                  다음
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
