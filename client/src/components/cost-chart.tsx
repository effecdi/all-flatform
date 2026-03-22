import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORIES, BILLING_CYCLES, type Account, type CategoryKey } from "@shared/schema";
import { GlassCard } from "./glass-card";
import { formatCurrency } from "@/lib/utils";

interface CostChartProps {
  accounts: Account[];
}

export function CostChart({ accounts }: CostChartProps) {
  const subs = accounts.filter((a) => a.isSubscription && a.subscriptionCost);
  const costByCategory = new Map<string, number>();

  for (const a of subs) {
    const cat = CATEGORIES[a.category as CategoryKey]?.label || a.category;
    let monthly = a.subscriptionCost!;
    if (a.billingCycle === "yearly") monthly = Math.round(monthly / 12);
    if (a.billingCycle === "weekly") monthly = monthly * 4;
    costByCategory.set(cat, (costByCategory.get(cat) || 0) + monthly);
  }

  const data = Array.from(costByCategory.entries())
    .map(([name, cost]) => ({ name, cost }))
    .sort((a, b) => b.cost - a.cost);

  if (data.length === 0) {
    return (
      <GlassCard hover={false} className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">구독 데이터가 없습니다</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false} className="h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">카테고리별 월 비용</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [formatCurrency(value), "월 비용"]}
            />
            <Bar dataKey="cost" fill="#a855f7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
