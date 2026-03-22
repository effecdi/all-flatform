import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type CategoryKey } from "@shared/schema";

export function CategoryBadge({ category }: { category: CategoryKey }) {
  const meta = CATEGORIES[category];
  return (
    <Badge
      variant="secondary"
      className="text-xs font-medium"
      style={{
        backgroundColor: `${meta.color}20`,
        color: meta.color,
        borderColor: `${meta.color}40`,
      }}
    >
      {meta.label}
    </Badge>
  );
}
