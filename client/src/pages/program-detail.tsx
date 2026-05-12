import { useRoute, Link } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { useGovernmentProgram, useInvestmentProgram } from "@/hooks/use-programs";
import { BookmarkButton } from "@/components/bookmark-button";
import { DeadlineBadge } from "@/components/deadline-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  FileText,
  CheckCircle2,
  Phone,
  AlertTriangle,
  ClipboardList,
  Banknote,
  Paperclip,
} from "lucide-react";
import { SUPPORT_TYPE_LABELS, INVESTOR_TYPE_LABELS } from "@shared/constants";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "info" | "secondary"> = {
  "모집중": "success",
  "모집예정": "info",
  "모집마감": "secondary",
};

function GovProgramDetail({ id }: { id: number }) {
  const { data: program, isLoading } = useGovernmentProgram(id);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!program) {
    return <div className="text-center py-20 text-muted-foreground">프로그램을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge variant={STATUS_VARIANT[program.status] ?? "secondary"}>{program.status}</Badge>
            <Badge variant="gov">{SUPPORT_TYPE_LABELS[program.supportType] || program.supportType}</Badge>
            <DeadlineBadge endDate={program.endDate} />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">{program.title}</h1>
        </div>
        <BookmarkButton programType="government" programId={id} className="shrink-0" />
      </div>

      <div className="grid gap-3 text-base">
        {program.organization && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-gov-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-3.5 h-3.5 text-gov-primary" /></div>
            <span className="font-medium">{program.organization}</span>
          </div>
        )}
        {program.region && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-gov-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-3.5 h-3.5 text-gov-primary" /></div>
            <span>{program.region}</span>
          </div>
        )}
        {(program.startDate || program.endDate) && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-gov-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-gov-primary" /></div>
            <span>{program.startDate ? formatDate(program.startDate) : "미정"} ~ {program.endDate ? formatDate(program.endDate) : "미정"}</span>
          </div>
        )}
      </div>

      <div className="section-divider" />

      <div className="space-y-3">
        {program.description && <DetailSection icon={<FileText className="w-4 h-4" />} title="사업 개요" content={program.description} />}
        {program.targetAudience && <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="신청 대상" content={program.targetAudience} />}
        {program.excludedTargets && <DetailSection icon={<AlertTriangle className="w-4 h-4" />} title="제외 대상" content={program.excludedTargets} highlight="warning" />}
        {program.supportAmount && <DetailSection icon={<Banknote className="w-4 h-4" />} title="지원 금액" content={program.supportAmount} highlight="info" />}
        {program.supportDetails && <DetailSection icon={<ClipboardList className="w-4 h-4" />} title="지원 내용" content={program.supportDetails} />}
        {program.applicationMethod && <DetailSection icon={<ExternalLink className="w-4 h-4" />} title="신청 방법" content={program.applicationMethod} />}
        {program.requiredDocuments && <DetailSection icon={<FileText className="w-4 h-4" />} title="제출 서류" content={program.requiredDocuments} />}
        {program.selectionProcess && <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="선정 절차 및 평가" content={program.selectionProcess} />}
        {program.contactInfo && <DetailSection icon={<Phone className="w-4 h-4" />} title="문의처" content={program.contactInfo} />}
        {program.attachmentUrls && <DetailSection icon={<Paperclip className="w-4 h-4" />} title="첨부파일" content={program.attachmentUrls} />}
      </div>

      {program.applicationUrl && (
        <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <ExternalLink className="w-4 h-4" />
            신청 페이지 바로가기
          </Button>
        </a>
      )}
    </div>
  );
}

function InvProgramDetail({ id }: { id: number }) {
  const { data: program, isLoading } = useInvestmentProgram(id);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!program) {
    return <div className="text-center py-20 text-muted-foreground">프로그램을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge variant={STATUS_VARIANT[program.status] ?? "secondary"}>{program.status}</Badge>
            <Badge variant="invest">{INVESTOR_TYPE_LABELS[program.investorType] || program.investorType}</Badge>
            <DeadlineBadge endDate={program.endDate} />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">{program.title}</h1>
        </div>
        <BookmarkButton programType="investment" programId={id} className="shrink-0" />
      </div>

      <div className="grid gap-3 text-base text-muted-foreground">
        {program.organization && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-invest-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-3.5 h-3.5 text-invest-primary" /></div>
            <span className="font-medium">{program.organization}</span>
          </div>
        )}
        {(program.startDate || program.endDate) && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-invest-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-invest-primary" /></div>
            <span>{program.startDate ? formatDate(program.startDate) : "미정"} ~ {program.endDate ? formatDate(program.endDate) : "미정"}</span>
          </div>
        )}
      </div>

      <div className="section-divider" />

      <div className="space-y-3">
        {program.description && <DetailSection icon={<FileText className="w-4 h-4" />} title="개요" content={program.description} />}
        {program.investmentScale && <DetailSection icon={<Banknote className="w-4 h-4" />} title="투자 규모" content={program.investmentScale} highlight="info" />}
        {program.targetStage && <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="대상 단계" content={program.targetStage} />}
        {program.targetIndustry && <DetailSection icon={<ClipboardList className="w-4 h-4" />} title="대상 업종" content={program.targetIndustry} />}
        {program.contactInfo && <DetailSection icon={<Phone className="w-4 h-4" />} title="연락처" content={program.contactInfo} />}
      </div>

      {(program.applicationUrl || program.websiteUrl) && (
        <div className="flex gap-3">
          {program.applicationUrl && (
            <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2"><ExternalLink className="w-4 h-4" />신청하기</Button>
            </a>
          )}
          {program.websiteUrl && (
            <a href={program.websiteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2"><ExternalLink className="w-4 h-4" />웹사이트</Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function DetailSection({ icon, title, content, highlight }: { icon: React.ReactNode; title: string; content: string; highlight?: "info" | "warning" }) {
  const bgClass =
    highlight === "info"
      ? "bg-info/5 border-info/20"
      : highlight === "warning"
      ? "bg-amber-500/5 border-amber-500/20"
      : "bg-muted/30 border-border/60";

  return (
    <div className={`rounded-xl border p-4 ${bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}

export default function ProgramDetailPage() {
  const [, govParams] = useRoute("/programs/government/:id");
  const [, invParams] = useRoute("/programs/investment/:id");

  const isGov = !!govParams;
  const id = parseInt((govParams?.id || invParams?.id || "0") as string, 10);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        <Link href={isGov ? "/programs/government" : "/programs/investment"}>
          <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground hover:text-foreground rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </Link>

        <Card className="overflow-hidden shadow-hero rounded-2xl">
          <div className={isGov ? "card-top-bar-gov" : "card-top-bar-invest"} />
          <CardContent className="p-7 sm:p-12">
            {isGov ? <GovProgramDetail id={id} /> : <InvProgramDetail id={id} />}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
