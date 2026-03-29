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
      <Card className="group cursor-pointer card-interactive h-full overflow-hidden border-border/60">
        <div className={isGov ? "card-top-bar-gov" : "card-top-bar-invest"} />
        <CardContent className="p-5 pt-4">
          {/* Badges */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>
              {typeLabel && (
                <Badge variant="outline" className="text-muted-foreground border-border/60">
                  {typeLabel}
                </Badge>
              )}
              <DeadlineBadge endDate={endDate} />
            </div>
            <BookmarkButton programType={type} programId={id} />
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-semibold text-base leading-snug mb-3 line-clamp-2 transition-colors duration-200",
            isGov
              ? "group-hover:text-gov-primary dark:group-hover:text-gov-primary-light"
              : "group-hover:text-invest-primary dark:group-hover:text-invest-primary-light"
          )}>
            {title}
          </h3>

          {/* Meta */}
          <div className="space-y-1.5 text-[13px] text-muted-foreground">
            {organization && (
              <div className="flex items-center gap-2">
                <Building2 className={cn("w-3.5 h-3.5 shrink-0", isGov ? "text-gov-primary/50" : "text-invest-primary/50")} />
                <span className="truncate">{organization}</span>
              </div>
            )}
            {region && (
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-3.5 h-3.5 shrink-0", isGov ? "text-gov-primary/50" : "text-invest-primary/50")} />
                <span>{region}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center gap-2">
                {isGov
                  ? <Banknote className="w-3.5 h-3.5 shrink-0 text-gov-primary/50" />
                  : <TrendingUp className="w-3.5 h-3.5 shrink-0 text-invest-primary/50" />
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
