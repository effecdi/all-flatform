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
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200", className)}>
        마감
      </span>
    );
  }

  const isUrgent = diffDays <= 7;
  const isSoon = diffDays <= 14;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        isUrgent
          ? "bg-red-50 text-red-700 border-red-200"
          : isSoon
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-blue-50 text-blue-700 border-blue-200",
        className
      )}
    >
      D-{diffDays}
    </span>
  );
}
