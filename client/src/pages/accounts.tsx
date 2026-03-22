import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Zap } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { AccountCard } from "@/components/account-card";
import { AccountFormDialog } from "@/components/account-form-dialog";
import { QuickImportDialog } from "@/components/quick-import-dialog";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/use-accounts";
import type { Account } from "@shared/schema";

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickImportOpen, setQuickImportOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const { data: accounts, isLoading } = useAccounts({ search, category });

  const sortedAccounts = useMemo(() => {
    if (!accounts) return [];
    return [...accounts].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  }, [accounts]);

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setDialogOpen(true);
  };

  const handleOpenNew = () => {
    setEditAccount(null);
    setDialogOpen(true);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading gradient-text">계정 목록</h1>
            <p className="text-sm text-muted-foreground mt-1">
              등록된 계정 {accounts?.length || 0}개
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setQuickImportOpen(true)}
              className="gap-1.5 border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10"
            >
              <Zap className="w-4 h-4" /> 빠른 추가
            </Button>
            <Button
              onClick={handleOpenNew}
              className="gap-1.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> 계정 추가
            </Button>
          </div>
        </div>

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          </div>
        ) : sortedAccounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground mb-2">등록된 계정이 없습니다</p>
            <p className="text-xs text-muted-foreground/60">
              위의 "계정 추가" 버튼으로 첫 번째 계정을 등록하세요
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {sortedAccounts.map((account, i) => (
              <AccountCard
                key={account.id}
                account={account}
                index={i}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        <AccountFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          account={editAccount}
        />
        <QuickImportDialog
          open={quickImportOpen}
          onOpenChange={setQuickImportOpen}
        />
      </div>
    </PageTransition>
  );
}
