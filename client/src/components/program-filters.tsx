import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REGIONS, SUPPORT_TYPE_LABELS } from "@shared/constants";

interface ProgramFiltersProps {
  filters: {
    supportType: string;
    status: string;
    region: string;
    search: string;
  };
  onChange: (filters: any) => void;
}

export function ProgramFilters({ filters, onChange }: ProgramFiltersProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="프로그램 검색..."
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

      {/* Support Type */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">지원 유형</label>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={filters.supportType === "" ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => handleChange("supportType", "")}
          >
            전체
          </Button>
          {Object.entries(SUPPORT_TYPE_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={filters.supportType === key ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handleChange("supportType", key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">지역</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          value={filters.region}
          onChange={(e) => handleChange("region", e.target.value)}
        >
          <option value="">전국</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
