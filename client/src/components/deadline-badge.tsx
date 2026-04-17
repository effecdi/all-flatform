import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineBadgeProps {
  endDate: string | null;
  className?: string;
}

export function DeadlineBadge({ endDate, className }: DeadlineBadgeProps) {
  if (!endDate) return null;

  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return <Badge variant="secondary" className={className}>마감</Badge>;
  }

  const isUrgent = diffDays <= 7;
  const isSoon = diffDays <= 14;
  const variant = isUrgent ? "error" : isSoon ? "warning" : "info";

  return (
    <Badge variant={variant} className={cn("gap-0.5", className)}>
      <Clock className="w-3 h-3" />
      D-{diffDays}
    </Badge>
  );
}
