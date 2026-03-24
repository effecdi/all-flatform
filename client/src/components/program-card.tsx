import { Link } from "wouter";
import { Building2, MapPin, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeadlineBadge } from "./deadline-badge";
import { BookmarkButton } from "./bookmark-button";
import { SUPPORT_TYPE_LABELS } from "@shared/constants";

interface ProgramCardProps {
  id: number;
  title: string;
  organization: string | null;
  supportType: string;
  status: string;
  region: string | null;
  endDate: string | null;
  supportAmount: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  "모집중": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "모집예정": "bg-blue-50 text-blue-700 border-blue-200",
  "모집마감": "bg-gray-100 text-gray-500 border-gray-200",
};

export function ProgramCard({
  id,
  title,
  organization,
  supportType,
  status,
  region,
  endDate,
  supportAmount,
}: ProgramCardProps) {
  return (
    <Link href={`/programs/government/${id}`}>
      <div className="group relative bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", STATUS_STYLES[status] || STATUS_STYLES["모집마감"])}>
              {status}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {SUPPORT_TYPE_LABELS[supportType] || supportType}
            </span>
            <DeadlineBadge endDate={endDate} />
          </div>
          <BookmarkButton programType="government" programId={id} />
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
          {region && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{region}</span>
            </div>
          )}
          {supportAmount && (
            <div className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{supportAmount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
