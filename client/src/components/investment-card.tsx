import { Link } from "wouter";
import { Building2, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeadlineBadge } from "./deadline-badge";
import { BookmarkButton } from "./bookmark-button";
import { INVESTOR_TYPE_LABELS } from "@shared/constants";

interface InvestmentCardProps {
  id: number;
  title: string;
  organization: string | null;
  investorType: string;
  investmentScale: string | null;
  targetStage: string | null;
  endDate: string | null;
  status: string;
}

export function InvestmentCard({
  id,
  title,
  organization,
  investorType,
  investmentScale,
  targetStage,
  endDate,
  status,
}: InvestmentCardProps) {
  return (
    <Link href={`/programs/investment/${id}`}>
      <div className="group relative bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium border",
              status === "모집중"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "모집예정"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}>
              {status}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              {INVESTOR_TYPE_LABELS[investorType] || investorType}
            </span>
            <DeadlineBadge endDate={endDate} />
          </div>
          <BookmarkButton programType="investment" programId={id} />
        </div>

        <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {organization && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{organization}</span>
            </div>
          )}
          {investmentScale && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>{investmentScale}</span>
            </div>
          )}
          {targetStage && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>{targetStage}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
