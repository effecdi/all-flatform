import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookmarkButton } from "./bookmark-button";
import { DeadlineBadge } from "./deadline-badge";
import { Building2, MapPin, Banknote, TrendingUp, ArrowRight } from "lucide-react";

interface BusinessCardProps {
  type: "government" | "investment";
  id: number;
  title: string;
  status: string;
  endDate: string | null;
  organization: string | null;
  region?: string | null;
  amount?: string | null;
  typeLabel?: string;
}

const STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "secondary"> = {
  "모집중": "success",
  "모집예정": "info",
  "모집마감": "secondary",
};

export function BusinessCard({
  type,
  id,
  title,
  status,
  endDate,
  organization,
  region,
  amount,
  typeLabel,
}: BusinessCardProps) {
  const isGov = type === "government";

  return (
    <Link href={`/programs/${type}/${id}`}>
      <Card className={cn(
        "group cursor-pointer card-interactive h-full overflow-hidden",
        isGov ? "card-left-gov" : "card-left-invest"
      )}>
        <CardContent className="p-5 sm:p-6">
          {/* Badges */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>
              {typeLabel && (
                <Badge variant="outline" className="text-muted-foreground">
                  {typeLabel}
                </Badge>
              )}
              <DeadlineBadge endDate={endDate} />
            </div>
            <BookmarkButton programType={type} programId={id} />
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-bold text-base sm:text-lg leading-snug mb-3.5 line-clamp-2 transition-colors",
            isGov
              ? "group-hover:text-gov-primary dark:group-hover:text-gov-primary-light"
              : "group-hover:text-invest-primary dark:group-hover:text-invest-primary-light"
          )}>
            {title}
          </h3>

          {/* Meta - chip style */}
          <div className="flex flex-wrap gap-2 mb-4">
            {organization && (
              <span className="meta-chip">
                <Building2 className="w-3.5 h-3.5 opacity-50" />
                <span className="truncate max-w-[140px]">{organization}</span>
              </span>
            )}
            {region && (
              <span className="meta-chip">
                <MapPin className="w-3.5 h-3.5 opacity-50" />
                {region}
              </span>
            )}
            {amount && (
              <span className="meta-chip">
                {isGov
                  ? <Banknote className="w-3.5 h-3.5 opacity-50" />
                  : <TrendingUp className="w-3.5 h-3.5 opacity-50" />
                }
                <span className="truncate max-w-[120px]">{amount}</span>
              </span>
            )}
          </div>

          {/* Hover CTA */}
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0",
            isGov
              ? "text-gov-primary dark:text-gov-primary-light"
              : "text-invest-primary dark:text-invest-primary-light"
          )}>
            자세히 보기
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
