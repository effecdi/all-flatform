import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  className?: string;
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const color =
    score >= 90
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 70
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border",
        color,
        className
      )}
    >
      {score}%
    </span>
  );
}
