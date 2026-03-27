import { FileText, TrendingUp, Clock, Bookmark, Sparkles, Target } from "lucide-react";
import type { DashboardStats } from "@shared/types";

interface PortfolioStatsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  bookmarkCount?: number;
}

const STAT_CONFIG = [
  {
    key: "totalGovernmentPrograms" as const,
    label: "전체 지원사업",
    icon: FileText,
    color: "primary",
    suffix: "건",
  },
  {
    key: "activeGovernmentPrograms" as const,
    label: "진행중 사업",
    icon: Target,
    color: "secondary",
    suffix: "건",
  },
  {
    key: "totalInvestmentPrograms" as const,
    label: "투자 프로그램",
    icon: TrendingUp,
    color: "accent",
    suffix: "건",
  },
  {
    key: "upcomingDeadlines" as const,
    label: "마감 임박",
    icon: Clock,
    color: "warm",
    suffix: "건",
  },
  {
    key: "bookmarkCount" as const,
    label: "저장한 프로그램",
    icon: Bookmark,
    color: "primary",
    suffix: "건",
  },
];

const colorStyles: Record<string, { icon: string; bg: string; ring: string }> = {
  primary: {
    icon: "text-[hsl(var(--pf-primary))]",
    bg: "bg-[hsl(var(--pf-primary)/0.08)]",
    ring: "ring-[hsl(var(--pf-primary)/0.15)]",
  },
  secondary: {
    icon: "text-[hsl(var(--pf-secondary))]",
    bg: "bg-[hsl(var(--pf-secondary)/0.08)]",
    ring: "ring-[hsl(var(--pf-secondary)/0.15)]",
  },
  accent: {
    icon: "text-[hsl(var(--pf-accent))]",
    bg: "bg-[hsl(var(--pf-accent)/0.08)]",
    ring: "ring-[hsl(var(--pf-accent)/0.15)]",
  },
  warm: {
    icon: "text-[hsl(var(--pf-warm))]",
    bg: "bg-[hsl(var(--pf-warm)/0.08)]",
    ring: "ring-[hsl(var(--pf-warm)/0.15)]",
  },
};

export function PortfolioStats({ stats, isLoading }: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {STAT_CONFIG.map((cfg, i) => {
        const value = stats?.[cfg.key] ?? 0;
        const style = colorStyles[cfg.color];
        const Icon = cfg.icon;

        return (
          <div
            key={cfg.key}
            className="pf-card group px-5 py-5 flex flex-col gap-3"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl ${style.bg} ring-1 ${style.ring} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-5 h-5 ${style.icon}`} />
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-16 rounded-md bg-[hsl(var(--pf-border))] animate-pulse" />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold pf-text pf-count-up">
                  {value.toLocaleString()}
                  <span className="text-sm font-normal pf-text-muted ml-0.5">{cfg.suffix}</span>
                </div>
              )}
              <p className="text-xs pf-text-muted mt-1">{cfg.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
