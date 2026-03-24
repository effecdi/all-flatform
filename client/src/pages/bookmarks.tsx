import { PageTransition } from "@/components/page-transition";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useGovernmentProgram, useInvestmentProgram } from "@/hooks/use-programs";
import { ProgramCard } from "@/components/program-card";
import { InvestmentCard } from "@/components/investment-card";
import { Loader2, Bookmark } from "lucide-react";

function BookmarkedGovProgram({ programId }: { programId: number }) {
  const { data: program } = useGovernmentProgram(programId);
  if (!program) return null;
  return (
    <ProgramCard
      id={program.id}
      title={program.title}
      organization={program.organization}
      supportType={program.supportType}
      status={program.status}
      region={program.region}
      endDate={program.endDate}
      supportAmount={program.supportAmount}
    />
  );
}

function BookmarkedInvProgram({ programId }: { programId: number }) {
  const { data: program } = useInvestmentProgram(programId);
  if (!program) return null;
  return (
    <InvestmentCard
      id={program.id}
      title={program.title}
      organization={program.organization}
      investorType={program.investorType}
      investmentScale={program.investmentScale}
      targetStage={program.targetStage}
      endDate={program.endDate}
      status={program.status}
    />
  );
}

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useBookmarks();

  const govBookmarks = bookmarks?.filter(b => b.programType === "government") ?? [];
  const invBookmarks = bookmarks?.filter(b => b.programType === "investment") ?? [];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">저장한 프로그램</h1>
          <p className="text-sm text-muted-foreground mt-1">관심 있는 프로그램을 모아보세요</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !bookmarks || bookmarks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>저장한 프로그램이 없습니다</p>
            <p className="text-sm mt-1">관심 있는 프로그램에 북마크를 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-8">
            {govBookmarks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">정부지원사업 ({govBookmarks.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {govBookmarks.map(b => (
                    <BookmarkedGovProgram key={b.id} programId={b.programId} />
                  ))}
                </div>
              </div>
            )}
            {invBookmarks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">투자유치 ({invBookmarks.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {invBookmarks.map(b => (
                    <BookmarkedInvProgram key={b.id} programId={b.programId} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
