import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { BookmarkButton } from "./bookmark-button";
import { DeadlineBadge } from "./deadline-badge";
import { Building2, MapPin, Banknote, TrendingUp } from "lucide-react";

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
        "group cursor-pointer card-interactive h-full",
        isGov ? "card-accent-gov" : "card-accent-invest"
      )}>
        <CardContent className="p-4">
          {/* Badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
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
            "font-medium text-sm leading-snug mb-2.5 line-clamp-2 transition-colors",
            isGov
              ? "group-hover:text-gov-primary dark:group-hover:text-gov-primary-light"
              : "group-hover:text-invest-primary dark:group-hover:text-invest-primary-light"
          )}>
            {title}
          </h3>

          {/* Meta */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {organization && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0 opacity-50" />
                <span className="truncate">{organization}</span>
              </div>
            )}
            {region && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0 opacity-50" />
                <span>{region}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center gap-1.5">
                {isGov
                  ? <Banknote className="w-3 h-3 shrink-0 opacity-50" />
                  : <TrendingUp className="w-3 h-3 shrink-0 opacity-50" />
                }
                <span className="truncate">{amount}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
