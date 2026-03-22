import { useState } from "react";
import { PageTransition } from "@/components/page-transition";
import { DeleteGuideCard } from "@/components/delete-guide-card";
import { useAccounts } from "@/hooks/use-accounts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DELETE_DIFFICULTIES } from "@shared/schema";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteGuidePage() {
  const { data: accounts, isLoading } = useAccounts();
  const [difficulty, setDifficulty] = useState("all");

  const filtered = accounts?.filter((a) => {
    if (difficulty === "all") return true;
    return a.deleteDifficulty === difficulty;
  }) || [];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading gradient-text">계정 삭제 가이드</h1>
            <p className="text-sm text-muted-foreground mt-1">
              각 서비스의 탈퇴 방법과 난이도를 확인하세요
            </p>
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[130px] glass">
              <SelectValue placeholder="난이도" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {Object.entries(DELETE_DIFFICULTIES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trash2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">표시할 계정이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((account, i) => (
              <DeleteGuideCard key={account.id} account={account} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
