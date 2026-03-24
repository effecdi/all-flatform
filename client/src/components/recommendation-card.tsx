import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./match-score-badge";

interface RecommendationCardProps {
  programId: number;
  programType: "government" | "investment";
  matchScore: number;
  reasoning: string;
  title: string;
}

export function RecommendationCard({
  programId,
  programType,
  matchScore,
  reasoning,
  title,
}: RecommendationCardProps) {
  return (
    <Link href={`/programs/${programType}/${programId}`}>
      <div className="group bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-medium border",
            programType === "government"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : "bg-teal-50 text-teal-700 border-teal-200"
          )}>
            {programType === "government" ? "정부지원사업" : "투자유치"}
          </span>
          <MatchScoreBadge score={matchScore} />
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {reasoning}
        </p>
      </div>
    </Link>
  );
}
