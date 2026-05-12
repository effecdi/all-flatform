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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ProgramCardProps } from "@/shared/types";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { DeadlineBadge } from "@/components/deadline-badge";

export function ProgramCard({ program }: { program: ProgramCardProps }) {
  const deadlineDate = program.deadline ? new Date(program.deadline) : null;
  const formattedDeadline = deadlineDate
    ? format(deadlineDate, "yyyy.MM.dd", { locale: ko })
    : "상시 모집";

  return (
    <Card className="flex flex-col h-full card-interactive relative overflow-hidden">
      {/* Dynamic Gradient Bar */}
      <div className={cn("absolute top-0 left-0 w-full h-1", program.gradient || "bg-gradient-to-r from-gov-primary to-gov-primary-light")}></div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-gov-primary/10 text-gov-primary border-gov-primary/30">
              {program.type}
            </Badge>
            <Badge variant="secondary">{program.status}</Badge>
            {program.dDay && <DeadlineBadge dDay={program.dDay} />}
          </div>
          <BookmarkButton isBookmarked={program.isBookmarked} programId={program.id} />
        </div>

        <Link href={`/programs/government/${program.id}`}>
          <h3 className="text-lg font-semibold leading-relaxed hover:text-gov-primary transition-colors duration-200 cursor-pointer my-2">
            {program.title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-muted-foreground mt-auto">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-gov-primary/10 text-gov-primary flex items-center justify-center mr-2">
              <Building className="w-3.5 h-3.5" />
            </div>
            <span>{program.organization}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-gov-primary/10 text-gov-primary flex items-center justify-center mr-2">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span>{program.region}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-gov-primary/10 text-gov-primary flex items-center justify-center mr-2">
              <Banknote className="w-3.5 h-3.5" />
            </div>
            <span>{program.amount}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-md bg-gov-primary/10 text-gov-primary flex items-center justify-center mr-2">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <span>{formattedDeadline} 마감</span>
          </div>
        </div>

        <Link href={`/programs/government/${program.id}`} className="mt-4 self-end">
          <Badge variant="ghost" className="text-gov-primary hover:bg-gov-primary/10 pr-2">
            자세히 보기 <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Badge>
        </Link>
      </div>
    </Card>
  );
}
