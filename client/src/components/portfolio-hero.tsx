import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Briefcase, Globe, Award } from "lucide-react";

interface PortfolioHeroProps {
  userName: string | undefined;
  userEmail: string | undefined;
}

const QUICK_TAGS = ["정부지원사업", "투자유치", "창업패키지", "기술개발", "사업화"];

export function PortfolioHero({ userName, userEmail }: PortfolioHeroProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = userName || userEmail?.split("@")[0] || "사용자";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/discover?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/discover?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl pf-hero-bg">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 pf-blob opacity-40 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 pf-blob opacity-30 pointer-events-none" style={{ animationDelay: "4s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--pf-primary)/0.03)] blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl pf-gradient-bg flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg pf-glow rotate-3 hover:rotate-0 transition-transform duration-500">
              {initial}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[hsl(var(--pf-secondary))] flex items-center justify-center shadow-md">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Greeting */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight pf-text leading-tight">
            안녕하세요,{" "}
            <span className="pf-gradient-text">{displayName}</span>님
          </h1>

          <p className="mt-4 text-base sm:text-lg pf-text-secondary max-w-2xl mx-auto leading-relaxed">
            정부지원사업과 투자유치 프로그램을 탐색하고, AI 맞춤 추천으로 최적의 기회를 발견하세요.
          </p>

          {/* Quick stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
            <QuickStat icon={<Briefcase className="w-4 h-4" />} label="지원사업" accent="primary" />
            <QuickStat icon={<Globe className="w-4 h-4" />} label="투자유치" accent="secondary" />
            <QuickStat icon={<Award className="w-4 h-4" />} label="AI 추천" accent="accent" />
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mt-10 mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pf-text-muted" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="관심 분야를 검색해보세요 (예: 창업패키지, 기술개발)"
                className="pl-12 h-14 rounded-2xl text-base bg-[hsl(var(--pf-surface))] border-[hsl(var(--pf-border))] focus:border-[hsl(var(--pf-primary)/0.5)] shadow-pf-card placeholder:text-[hsl(var(--pf-text-muted))]"
              />
            </div>
            <Button
              type="submit"
              disabled={!searchQuery.trim()}
              size="lg"
              className="px-8 h-14 rounded-2xl text-base font-semibold pf-gradient-bg border-0 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </form>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="group/tag flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[hsl(var(--pf-border))] bg-[hsl(var(--pf-surface)/0.6)] backdrop-blur-sm text-[hsl(var(--pf-text-secondary))] hover:bg-[hsl(var(--pf-primary)/0.08)] hover:border-[hsl(var(--pf-primary)/0.3)] hover:text-[hsl(var(--pf-primary))] transition-all duration-200"
              >
                #{tag}
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/tag:opacity-100 group-hover/tag:translate-x-0 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStat({ icon, label, accent }: { icon: React.ReactNode; label: string; accent: "primary" | "secondary" | "accent" }) {
  const colorMap = {
    primary: "text-[hsl(var(--pf-primary))] bg-[hsl(var(--pf-primary)/0.1)]",
    secondary: "text-[hsl(var(--pf-secondary))] bg-[hsl(var(--pf-secondary)/0.1)]",
    accent: "text-[hsl(var(--pf-accent))] bg-[hsl(var(--pf-accent)/0.1)]",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[accent]}`}>
        {icon}
      </div>
      <span className="text-sm font-medium pf-text-secondary">{label}</span>
    </div>
  );
}
