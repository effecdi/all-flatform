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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="투자 프로그램 검색..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">모집 상태</label>
        <div className="flex flex-wrap gap-1.5">
          {["전체", "모집중", "모집예정", "모집마감"].map((s) => (
            <Button
              key={s}
              variant={filters.status === (s === "전체" ? "" : s) ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handleChange("status", s === "전체" ? "" : s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Investor Type */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">투자자 유형</label>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={filters.investorType === "" ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => handleChange("investorType", "")}
          >
            전체
          </Button>
          {Object.entries(INVESTOR_TYPE_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.investorType === key ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
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
