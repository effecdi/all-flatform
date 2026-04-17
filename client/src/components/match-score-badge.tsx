import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  className?: string;
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const color = score >= 90
    ? "bg-success/15 text-success dark:text-success-light border-success/20"
    : score >= 70
    ? "bg-ai-primary/15 text-ai-primary dark:text-ai-primary-light border-ai-primary/20"
    : "bg-warning/15 text-warning dark:text-warning-light border-warning/20";

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold tabular-nums",
      color,
      className
    )}>
      {score}%
    </span>
  );
}
