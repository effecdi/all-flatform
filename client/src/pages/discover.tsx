import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Search,
  Loader2,
  ExternalLink,
  Building2,
  MapPin,
  Banknote,
  Globe,
  Landmark,
  TrendingUp,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeadlineBadge } from "@/components/deadline-badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { SUPPORT_TYPE_LABELS } from "@shared/constants";
import type { DiscoverProject, WebSearchResult } from "@shared/types";

const STATUS_VARIANT: Record<string, "success" | "info" | "secondary"> = {
  "모집중": "success",
  "모집예정": "info",
  "모집마감": "secondary",
};

function ProjectCard({ project }: { project: DiscoverProject }) {
  const detailHref = project.type === "government"
    ? `/programs/government/${project.id}`
    : `/programs/investment/${project.id}`;
  const externalUrl = project.applicationUrl || project.sourceUrl;
  const isGov = project.type === "government";

  return (
    <Card className={cn("group card-interactive", isGov ? "card-left-gov" : "card-left-invest")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"}>
              {project.status}
            </Badge>
            {project.supportType && (
              <Badge variant="outline">
                {SUPPORT_TYPE_LABELS[project.supportType] || project.supportType}
              </Badge>
            )}
            {project.investorType && (
              <Badge variant="outline">
                {project.investorType}
              </Badge>
            )}
            <DeadlineBadge endDate={project.endDate} />
          </div>
          <BookmarkButton programType={project.type} programId={project.id} />
        </div>

        <h3 className={cn(
          "font-semibold text-base leading-snug mb-2.5 line-clamp-2 transition-colors",
          isGov
            ? "group-hover:text-gov-primary dark:group-hover:text-gov-primary-light"
            : "group-hover:text-invest-primary dark:group-hover:text-invest-primary-light"
        )}>{project.title}</h3>

        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
          {project.organization && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span className="truncate">{project.organization}</span>
            </div>
          )}
          {project.region && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span>{project.region}</span>
            </div>
          )}
          {project.supportAmount && (
            <div className="flex items-center gap-2">
              <Banknote className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span className="truncate">{project.supportAmount}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2.5 border-t border-border">
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary-dark transition-colors">
              <ExternalLink className="w-3 h-3" />
              바로가기
            </a>
          )}
          <Link href={detailHref}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
              상세 보기
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function WebResultCard({ result }: { result: WebSearchResult }) {
  return (
    <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="card-interactive">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-2 mb-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm text-primary hover:underline line-clamp-1">{result.title}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate mt-0.5">{result.url}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 pl-5">{result.snippet}</p>
        </CardContent>
      </Card>
    </a>
  );
}

function ResultSection({ title, icon: Icon, children, isEmpty, emptyMessage, isLoading }: {
  title: string; icon: React.ElementType; children: React.ReactNode; isEmpty: boolean; emptyMessage: string; isLoading?: boolean;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-border bg-card/50">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">검색 중...</span>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-8 rounded-lg border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">{children}</div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [govProjects, setGovProjects] = useState<DiscoverProject[]>([]);
  const [invProjects, setInvProjects] = useState<DiscoverProject[]>([]);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchString = useSearch();
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  useEffect(() => {
    if (initialSearchDone) return;
    const params = new URLSearchParams(searchString);
    const q = params.get("q");
    if (q) {
      setInitialSearchDone(true);
      handleSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  const handleSearch = async (searchQuery?: string) => {
    const trimmed = (searchQuery || query).trim();
    if (!trimmed || programsLoading) return;

    setQuery(trimmed);
    setSearchedQuery(trimmed);
    setProgramsLoading(true);
    setWebLoading(true);
    setError(null);
    setGovProjects([]);
    setInvProjects([]);
    setWebResults([]);

    const encoded = encodeURIComponent(trimmed);

    try {
      const res = await fetch(`/api/discover/programs?query=${encoded}`, { credentials: "same-origin" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `검색 실패 (${res.status})`);
      }
      const data = await res.json();
      setGovProjects(data.governmentProjects || []);
      setInvProjects(data.investmentProjects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로그램 검색에 실패했습니다.");
    } finally {
      setProgramsLoading(false);
    }

    try {
      const res = await fetch(`/api/discover/web?query=${encoded}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setWebResults(data.webResults || []);
      }
    } catch {
      // non-critical
    } finally {
      setWebLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const hasSearched = !!searchedQuery;
  const hasPrograms = govProjects.length > 0 || invProjects.length > 0;

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="icon-box icon-box-lg bg-info/10">
            <Compass className="w-7 h-7 text-info dark:text-info-light" />
          </div>
          <div>
            <span className="section-number">Discover</span>
            <h1>사업 검색</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              정부지원사업, 투자유치, 관련 웹 정보를 한 번에 검색하세요
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="원하는 사업이나 정보를 검색해보세요" className="h-12 pl-12 rounded-2xl text-base" disabled={programsLoading} />
          </div>
          <Button type="submit" disabled={programsLoading || !query.trim()} className="gap-2 h-12 px-6 rounded-2xl text-base">
            {programsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            검색
          </Button>
        </form>

        {/* Initial State */}
        {!hasSearched && !programsLoading && (
          <div className="py-12">
            <p className="text-sm text-muted-foreground mb-4">추천 검색어로 시작해보세요</p>
            <div className="flex flex-wrap gap-2.5">
              {["청년 창업 지원", "소상공인 디지털 전환", "AI 스타트업 투자", "기술 사업화"].map(
                (suggestion) => (
                  <button key={suggestion} type="button" onClick={() => handleSearch(suggestion)} className="meta-chip hover:bg-accent cursor-pointer transition-colors">
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mb-5 px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {programsLoading && !hasPrograms && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">"{searchedQuery}" 검색 중...</p>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !programsLoading && !hasPrograms && !webLoading && webResults.length === 0 && !error && (
          <div className="py-12">
            <p className="text-sm text-muted-foreground">"{searchedQuery}"에 대한 검색 결과가 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">다른 검색어로 시도해보세요</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && (hasPrograms || webResults.length > 0 || webLoading) && !programsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ResultSection title="정부지원사업" icon={Landmark} isEmpty={govProjects.length === 0} emptyMessage="검색어와 일치하는 정부지원사업이 없습니다.">
                {govProjects.map((project) => <ProjectCard key={`gov-${project.id}`} project={project} />)}
              </ResultSection>
              {invProjects.length > 0 && (
                <ResultSection title="투자유치 프로그램" icon={TrendingUp} isEmpty={false} emptyMessage="">
                  {invProjects.map((project) => <ProjectCard key={`inv-${project.id}`} project={project} />)}
                </ResultSection>
              )}
            </div>
            <div>
              <ResultSection title="관련 웹 정보" icon={Globe} isEmpty={webResults.length === 0 && !webLoading} emptyMessage="검색어와 일치하는 웹 정보를 찾을 수 없습니다." isLoading={webLoading}>
                {webResults.map((result, i) => <WebResultCard key={i} result={result} />)}
              </ResultSection>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
