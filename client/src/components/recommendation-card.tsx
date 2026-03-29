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
    <Card className="group h-full card-left-ai overflow-hidden">
      <CardContent className="p-5 sm:p-6 flex flex-col gap-3.5">
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
          {/* Score visualization */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ai-primary transition-all duration-500"
                style={{ width: `${matchScore}%` }}
              />
            </div>
            <MatchScoreBadge score={matchScore} />
          </div>
        </div>

        {/* AI Sparkle indicator */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-ai-primary" />
          <span className="text-xs font-semibold text-ai-primary dark:text-ai-primary-light">AI 추천</span>
        </div>

        {/* Title */}
        <Link href={`/programs/${programType}/${programId}`}>
          <h3 className="font-bold text-base sm:text-lg leading-snug hover:text-ai-primary dark:hover:text-ai-primary-light transition-colors line-clamp-2 cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Reasoning */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {reasoning}
        </p>

        {/* Difficulty */}
        {difficulty && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">신청 난이도:</span>
            <span className={`font-semibold ${difficultyConfig[difficulty].className}`}>
              {difficultyConfig[difficulty].label}
            </span>
          </div>
        )}

        {/* Benefits */}
        {benefits && (
          <div className="flex items-start gap-2.5 text-sm bg-ai-primary/5 rounded-xl px-4 py-3">
            <Gift className="w-4 h-4 text-ai-primary mt-0.5 shrink-0" />
            <span className="text-foreground/80 leading-relaxed">{benefits}</span>
          </div>
        )}

        {/* Preparation Tips */}
        {preparationTips && (
          <div>
            <button
              onClick={() => setTipsOpen(!tipsOpen)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {tipsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>준비사항 {tipsOpen ? "접기" : "보기"}</span>
            </button>
            {tipsOpen && (
              <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 leading-relaxed animate-slide-down">
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
            <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10 dark:text-ai-primary-light dark:border-ai-primary-dark/30">
              <ExternalLink className="w-3.5 h-3.5" />
              신청하기
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
