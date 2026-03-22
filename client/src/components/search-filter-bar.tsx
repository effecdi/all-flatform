import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type CategoryKey } from "@shared/schema";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="서비스명, 이메일, 아이디로 검색..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 glass"
        />
      </div>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[160px] glass">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
            <SelectItem key={key} value={key}>
              {CATEGORIES[key].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
