import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Zap, ExternalLink, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBulkCreateAccounts } from "@/hooks/use-accounts";
import {
  POPULAR_SERVICES,
  SERVICE_CATEGORIES,
  type PopularService,
} from "@shared/popular-services";
import { formatCurrency } from "@/lib/utils";

interface QuickImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickImportDialog({ open, onOpenChange }: QuickImportDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const bulkCreate = useBulkCreateAccounts();

  const filtered = useMemo(() => {
    let result = POPULAR_SERVICES;
    if (activeTab !== "all") {
      result = result.filter((s) => s.category === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeTab, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = filtered.map((s) => s.id);
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    await bulkCreate.mutateAsync(Array.from(selected));
    setSelected(new Set());
    onOpenChange(false);
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-neon-purple" />
            인기 서비스 빠른 추가
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="서비스 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
              {SERVICE_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple rounded-full border border-border/50 data-[state=active]:border-neon-purple/50"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Select All */}
        <div className="px-6 pb-2 flex items-center justify-between">
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {allFilteredSelected ? "전체 해제" : "전체 선택"} ({filtered.length}개)
          </button>
          <span className="text-xs text-neon-purple font-medium">
            {selected.size}개 선택됨
          </span>
        </div>

        {/* Service List */}
        <ScrollArea className="flex-1 min-h-0 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((svc) => (
                <ServiceItem
                  key={svc.id}
                  service={svc}
                  checked={selected.has(svc.id)}
                  onToggle={() => toggle(svc.id)}
                />
              ))}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              검색 결과가 없습니다
            </p>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            {selected.size}개 서비스 선택됨
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selected.size === 0 || bulkCreate.isPending}
            className="gap-1.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
          >
            {bulkCreate.isPending ? "추가 중..." : `${selected.size}개 일괄 추가`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ServiceItem({
  service,
  checked,
  onToggle,
}: {
  service: PopularService;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onToggle}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
        checked
          ? "border-neon-purple/60 bg-neon-purple/10"
          : "border-border/50 hover:border-border hover:bg-accent/50"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? "bg-neon-purple border-neon-purple"
            : "border-muted-foreground/40"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Favicon */}
      <img
        src={`/api/favicon?url=${encodeURIComponent(service.url)}`}
        alt=""
        className="w-6 h-6 rounded flex-shrink-0"
        loading="lazy"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{service.name}</span>
          {service.isSubscription && (
            <CreditCard className="w-3 h-3 text-neon-blue flex-shrink-0" />
          )}
        </div>
        {service.isSubscription && service.subscriptionCost && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(service.subscriptionCost, service.currency || "KRW")}/
            {service.billingCycle === "monthly"
              ? "월"
              : service.billingCycle === "yearly"
              ? "년"
              : "주"}
          </p>
        )}
      </div>

      {/* Difficulty badge */}
      <Badge
        variant="outline"
        className={`text-[10px] flex-shrink-0 ${
          service.deleteDifficulty === "easy"
            ? "text-green-500 border-green-500/30"
            : service.deleteDifficulty === "medium"
            ? "text-yellow-500 border-yellow-500/30"
            : service.deleteDifficulty === "hard"
            ? "text-red-500 border-red-500/30"
            : "text-red-800 border-red-800/30"
        }`}
      >
        {service.deleteDifficulty === "easy"
          ? "삭제 쉬움"
          : service.deleteDifficulty === "medium"
          ? "삭제 보통"
          : service.deleteDifficulty === "hard"
          ? "삭제 어려움"
          : "삭제 불가"}
      </Badge>
    </motion.button>
  );
}
