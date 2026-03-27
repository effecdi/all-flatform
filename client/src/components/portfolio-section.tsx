import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PortfolioSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: "primary" | "secondary" | "accent" | "warm";
  linkHref?: string;
  linkText?: string;
  children: React.ReactNode;
  className?: string;
}

const iconBgMap: Record<string, string> = {
  primary: "bg-[hsl(var(--pf-primary)/0.1)]",
  secondary: "bg-[hsl(var(--pf-secondary)/0.1)]",
  accent: "bg-[hsl(var(--pf-accent)/0.1)]",
  warm: "bg-[hsl(var(--pf-warm)/0.1)]",
};

const iconTextMap: Record<string, string> = {
  primary: "text-[hsl(var(--pf-primary))]",
  secondary: "text-[hsl(var(--pf-secondary))]",
  accent: "text-[hsl(var(--pf-accent))]",
  warm: "text-[hsl(var(--pf-warm))]",
};

export function PortfolioSection({
  title,
  subtitle,
  icon,
  iconColor,
  linkHref,
  linkText = "전체보기",
  children,
  className = "",
}: PortfolioSectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${iconBgMap[iconColor]} flex items-center justify-center shrink-0`}>
            <div className={iconTextMap[iconColor]}>{icon}</div>
          </div>
          <div>
            <h2 className="pf-section-title">{title}</h2>
            {subtitle && <p className="pf-section-subtitle">{subtitle}</p>}
          </div>
        </div>
        {linkHref && (
          <Link href={linkHref}>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-sm font-medium ${iconTextMap[iconColor]} hover:bg-[hsl(var(--pf-${iconColor === "primary" ? "primary" : iconColor === "secondary" ? "secondary" : iconColor === "accent" ? "accent" : "warm"})/0.08)] shrink-0`}
            >
              {linkText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Empty placeholder when a section has no data */
export function PortfolioEmpty({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-[hsl(var(--pf-border))] bg-[hsl(var(--pf-surface)/0.5)] flex flex-col items-center justify-center gap-3">
      {icon && <div className="pf-text-muted">{icon}</div>}
      <p className="text-base pf-text-muted">{text}</p>
    </div>
  );
}

/** Skeleton card for loading states */
export function PortfolioSkeleton() {
  return (
    <div className="pf-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-[hsl(var(--pf-border))]" />
        <div className="h-5 w-12 rounded-full bg-[hsl(var(--pf-border-subtle))]" />
      </div>
      <div className="h-5 w-3/4 rounded-md bg-[hsl(var(--pf-border))]" />
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-[hsl(var(--pf-border-subtle))]" />
        <div className="h-3.5 w-2/3 rounded bg-[hsl(var(--pf-border-subtle))]" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[hsl(var(--pf-border-subtle))]">
        <div className="h-4 rounded bg-[hsl(var(--pf-border-subtle))]" />
        <div className="h-4 rounded bg-[hsl(var(--pf-border-subtle))]" />
      </div>
    </div>
  );
}

/** Card grid wrapper */
export function PortfolioGrid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return (
    <div className={`pf-stagger ${cols === 3 ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-5 sm:grid-cols-2"}`}>
      {children}
    </div>
  );
}
