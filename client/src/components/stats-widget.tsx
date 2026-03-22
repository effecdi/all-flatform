import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

interface StatsWidgetProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  index?: number;
}

export function StatsWidget({ icon: Icon, label, value, color, index = 0 }: StatsWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <GlassCard className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-heading">{value}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
