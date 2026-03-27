import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  className?: string;
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const variant = score >= 90 ? "success" : score >= 70 ? "info" : "warning";

  return (
    <Badge variant={variant} className={cn("tabular-nums font-bold", className)}>
      {score}%
    </Badge>
  );
}
