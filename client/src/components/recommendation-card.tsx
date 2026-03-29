import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MatchScoreBadge } from "./match-score-badge";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Gift,
  FileText,
} from "lucide-react";
import type { RecommendationItem } from "@shared/schema";

const urgencyConfig = {
  high: { label: "긴급", variant: "error" as const },
  medium: { label: "보통", variant: "warning" as const },
  low: { label: "여유", variant: "info" as const },
} as const;

const difficultyConfig = {
  easy: { label: "쉬움", className: "text-success dark:text-success-light" },
  medium: { label: "보통", className: "text-warning dark:text-warning-light" },
  hard: { label: "어려움", className: "text-error dark:text-error-light" },
} as const;

export function RecommendationCard({
  programId,
  programType,
  matchScore,
  reasoning,
  title,
  urgency,
  benefits,
  preparationTips,
  applicationUrl,
  difficulty,
}: RecommendationItem) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const isGov = programType === "government";

  return (
    <Card className="group h-full card-accent-ai">
      <CardContent className="p-4 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={isGov ? "info" : "success"}>
              {isGov ? "정부지원" : "투자유치"}
            </Badge>
            {urgency && (
              <Badge variant={urgencyConfig[urgency].variant}>
                <Clock className="w-3 h-3 mr-0.5" />
                {urgencyConfig[urgency].label}
              </Badge>
            )}
          </div>
          <MatchScoreBadge score={matchScore} />
        </div>

        {/* Title */}
        <Link href={`/programs/${programType}/${programId}`}>
          <h3 className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2 cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {reasoning}
        </p>

        {/* Difficulty */}
        {difficulty && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">신청 난이도:</span>
            <span className={`font-medium ${difficultyConfig[difficulty].className}`}>
              {difficultyConfig[difficulty].label}
            </span>
          </div>
        )}

        {/* Benefits */}
        {benefits && (
          <div className="flex items-start gap-2 text-xs bg-success/5 rounded-md px-3 py-2">
            <Gift className="w-3 h-3 text-success mt-0.5 shrink-0" />
            <span className="text-foreground/80 leading-relaxed">{benefits}</span>
          </div>
        )}

        {/* Preparation Tips */}
        {preparationTips && (
          <div>
            <button
              onClick={() => setTipsOpen(!tipsOpen)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {tipsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>준비사항 {tipsOpen ? "접기" : "보기"}</span>
            </button>
            {tipsOpen && (
              <div className="mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 leading-relaxed animate-slide-down">
                {preparationTips}
              </div>
            )}
          </div>
        )}

        {/* Apply button */}
        {applicationUrl && (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <ExternalLink className="w-3 h-3" />
              신청하기
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
