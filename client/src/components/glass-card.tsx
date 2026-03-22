import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  hover?: boolean;
  children: React.ReactNode;
}

export function GlassCard({ className, hover = true, children }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("glass rounded-2xl p-5 transition-shadow hover:shadow-lg", className)}
    >
      {children}
    </motion.div>
  );
}
