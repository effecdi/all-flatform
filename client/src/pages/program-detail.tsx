import { useRoute, Link } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { useGovernmentProgram, useInvestmentProgram } from "@/hooks/use-programs";
import { BookmarkButton } from "@/components/bookmark-button";
import { DeadlineBadge } from "@/components/deadline-badge";
import { Button } from "@/components/ui/button";
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

function GovProgramDetail({ id }: { id: number }) {
  const { data: program, isLoading } = useGovernmentProgram(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!program) {
    return <div className="text-center py-20 text-muted-foreground">프로그램을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {program.status}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {SUPPORT_TYPE_LABELS[program.supportType] || program.supportType}
            </span>
            <DeadlineBadge endDate={program.endDate} />
          </div>
          <h1 className="text-xl font-bold leading-snug">{program.title}</h1>
        </div>
        <BookmarkButton programType="government" programId={id} className="shrink-0" />
      </div>

      {/* Meta info */}
      <div className="grid gap-3 text-sm">
        {program.organization && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4 shrink-0" />
            <span>{program.organization}</span>
          </div>
        )}
        {program.region && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{program.region}</span>
          </div>
        )}
        {(program.startDate || program.endDate) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {program.startDate ? formatDate(program.startDate) : "미정"} ~{" "}
              {program.endDate ? formatDate(program.endDate) : "미정"}
            </span>
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        {program.description && (
          <DetailSection icon={<FileText className="w-4 h-4" />} title="사업 개요" content={program.description} />
        )}

        {program.targetAudience && (
          <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="신청 대상" content={program.targetAudience} />
        )}

        {program.excludedTargets && (
          <DetailSection icon={<AlertTriangle className="w-4 h-4" />} title="제외 대상" content={program.excludedTargets} highlight="warning" />
        )}

        {program.supportAmount && (
          <DetailSection icon={<Banknote className="w-4 h-4" />} title="지원 금액" content={program.supportAmount} />
        )}

        {program.supportDetails && (
          <DetailSection icon={<ClipboardList className="w-4 h-4" />} title="지원 내용" content={program.supportDetails} />
        )}

        {program.applicationMethod && (
          <DetailSection icon={<ExternalLink className="w-4 h-4" />} title="신청 방법" content={program.applicationMethod} />
        )}

        {program.requiredDocuments && (
          <DetailSection icon={<FileText className="w-4 h-4" />} title="제출 서류" content={program.requiredDocuments} highlight="info" />
        )}

        {program.selectionProcess && (
          <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="선정 절차 및 평가" content={program.selectionProcess} />
        )}

        {program.contactInfo && (
          <DetailSection icon={<Phone className="w-4 h-4" />} title="문의처" content={program.contactInfo} />
        )}

        {program.attachmentUrls && (
          <DetailSection icon={<Paperclip className="w-4 h-4" />} title="첨부파일" content={program.attachmentUrls} />
        )}
      </div>

      {/* Action button */}
      {program.applicationUrl && (
        <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer">
          <Button className="gap-2 w-full sm:w-auto">
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!program) {
    return <div className="text-center py-20 text-muted-foreground">프로그램을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {program.status}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              {INVESTOR_TYPE_LABELS[program.investorType] || program.investorType}
            </span>
            <DeadlineBadge endDate={program.endDate} />
          </div>
          <h1 className="text-xl font-bold leading-snug">{program.title}</h1>
        </div>
        <BookmarkButton programType="investment" programId={id} className="shrink-0" />
      </div>

      <div className="grid gap-3 text-sm text-muted-foreground">
        {program.organization && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 shrink-0" />
            <span>{program.organization}</span>
          </div>
        )}
        {(program.startDate || program.endDate) && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {program.startDate ? formatDate(program.startDate) : "미정"} ~{" "}
              {program.endDate ? formatDate(program.endDate) : "미정"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {program.description && (
          <DetailSection icon={<FileText className="w-4 h-4" />} title="개요" content={program.description} />
        )}
        {program.investmentScale && (
          <DetailSection icon={<Banknote className="w-4 h-4" />} title="투자 규모" content={program.investmentScale} />
        )}
        {program.targetStage && (
          <DetailSection icon={<CheckCircle2 className="w-4 h-4" />} title="대상 단계" content={program.targetStage} />
        )}
        {program.targetIndustry && (
          <DetailSection icon={<ClipboardList className="w-4 h-4" />} title="대상 업종" content={program.targetIndustry} />
        )}
        {program.contactInfo && (
          <DetailSection icon={<Phone className="w-4 h-4" />} title="연락처" content={program.contactInfo} />
        )}
      </div>

      {(program.applicationUrl || program.websiteUrl) && (
        <div className="flex gap-3">
          {program.applicationUrl && (
            <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2">
                <ExternalLink className="w-4 h-4" />
                신청하기
              </Button>
            </a>
          )}
          {program.websiteUrl && (
            <a href={program.websiteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                웹사이트
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function DetailSection({
  icon,
  title,
  content,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  highlight?: "info" | "warning";
}) {
  const bgClass =
    highlight === "info"
      ? "bg-blue-50 border-blue-200"
      : highlight === "warning"
      ? "bg-amber-50 border-amber-200"
      : "bg-gray-50 border-border";

  return (
    <div className={`rounded-lg border p-4 ${bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <Link href={isGov ? "/programs/government" : "/programs/investment"}>
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </Link>

        <div className="bg-white rounded-lg border border-border p-6">
          {isGov ? <GovProgramDetail id={id} /> : <InvProgramDetail id={id} />}
        </div>
      </div>
    </PageTransition>
  );
}
