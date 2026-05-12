import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INVESTOR_TYPE_LABELS } from "@shared/constants";

interface InvestmentFiltersProps {
  filters: {
    investorType: string;
    status: string;
    search: string;
  };
  onChange: (filters: any) => void;
}

export function InvestmentFilters({ filters, onChange }: InvestmentFiltersProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-invest-primary" />
        필터
      </h4>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="투자 프로그램 검색..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">모집 상태</label>
        <div className="flex flex-wrap gap-2">
          {["전체", "모집중", "모집예정", "모집마감"].map((s) => (
            <Button
              key={s}
              variant={filters.status === (s === "전체" ? "" : s) ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 rounded-lg"
              onClick={() => handleChange("status", s === "전체" ? "" : s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Investor Type */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">투자자 유형</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.investorType === "" ? "default" : "outline"}
            size="sm"
            className="text-xs h-8 rounded-lg"
            onClick={() => handleChange("investorType", "")}
          >
            전체
          </Button>
          {Object.entries(INVESTOR_TYPE_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.investorType === key ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 rounded-lg"
              onClick={() => handleChange("investorType", key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
