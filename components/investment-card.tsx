import { Link } from "wouter";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Banknote,
  Bookmark as BookmarkIcon,
  CalendarDays,
  Building,
  MapPin,
  Tag,
  ChevronRight,
  Target, // 투자 대상 단계 아이콘
  BriefcaseBusiness, // 투자규모 아이콘
} from "lucide-react";

import { cn } from "@/lib/utils";
import { InvestmentCardProps } from "@/shared/types";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { DeadlineBadge } from "@/components/deadline-badge";

export function InvestmentCard({ program }: { program: InvestmentCardProps }) {
  const deadlineDate = program.deadline ? new Date(program.deadline) : null;
  const formattedDeadline = deadlineDate
    ? format(deadlineDate, "yyyy.MM.dd", { locale: ko })
    : "상시 모집";

  return (
    <Card className="flex flex-col h-full card-interactive relative overflow-hidden">
      {/* Dynamic Gradient Bar */}
      <div className={cn("absolute top-0 left-0 w-full h-1", program.gradient || "bg-gradient-to-r from-invest-primary to-invest-primary-light")}></div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-invest-primary/10 text-invest-primary border-invest-primary/30">
              {program.investmentType}
            </Badge>
            <Badge variant="secondary">{program.status}</Badge>
            {program.dDay && <DeadlineBadge dDay={program.dDay} />}
          </div>
          <BookmarkButton isBookmarked={program.isBookmarked} programId={program.id} />
        </div>

        <Link href={`/programs/investment/${program.id}`}>
          <h3 className="text-lg font-semibold leading-relaxed hover:text-invest-primary transition-colors duration-200 cursor-pointer my-2">
            {program.title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-muted-foreground mt-auto">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-invest-primary/10 text-invest-primary flex items-center justify-center mr-2">
              <Building className="w-3.5 h-3.5" />
            </div>
            <span>{program.companyName}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-invest-primary/10 text-invest-primary flex items-center justify-center mr-2">
              <Target className="w-3.5 h-3.5" />
            </div>
            <span>{program.targetStage}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-invest-primary/10 text-invest-primary flex items-center justify-center mr-2">
              <BriefcaseBusiness className="w-3.5 h-3.5" />
            </div>
            <span>{program.investmentSize}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-invest-primary/10 text-invest-primary flex items-center justify-center mr-2">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <span>{formattedDeadline} 마감</span>
          </div>
        </div>

        <Link href={`/programs/investment/${program.id}`} className="mt-4 self-end">
          <Badge variant="ghost" className="text-invest-primary hover:bg-invest-primary/10 pr-2">
            자세히 보기 <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Badge>
        </Link>
      </div>
    </Card>
  );
}
