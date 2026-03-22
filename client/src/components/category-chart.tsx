import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORIES, type CategoryKey } from "@shared/schema";
import { GlassCard } from "./glass-card";

interface CategoryChartProps {
  data: { category: string; count: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((d) => ({
    name: CATEGORIES[d.category as CategoryKey]?.label || d.category,
    value: d.count,
    color: CATEGORIES[d.category as CategoryKey]?.color || "#6b7280",
  }));

  if (chartData.length === 0) {
    return (
      <GlassCard hover={false} className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false} className="h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">카테고리 분포</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
