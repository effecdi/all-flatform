import { motion } from "framer-motion";
import { ExternalLink, AlertCircle } from "lucide-react";
import type { Account } from "@shared/schema";
import { DELETE_DIFFICULTIES } from "@shared/schema";
import { CategoryBadge } from "./category-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFaviconUrl } from "@/lib/favicon-fetcher";

interface DeleteGuideCardProps {
  account: Account;
  index: number;
}

export function DeleteGuideCard({ account, index }: DeleteGuideCardProps) {
  const diff = account.deleteDifficulty
    ? DELETE_DIFFICULTIES[account.deleteDifficulty]
    : null;
  const favicon = getFaviconUrl(account.serviceUrl) || account.logoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
          {favicon ? (
            <img src={favicon} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {account.serviceName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{account.serviceName}</h3>
            <CategoryBadge category={account.category} />
            {diff && (
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ color: diff.color, borderColor: diff.color }}
              >
                {diff.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {account.deleteGuide && (
        <div className="text-sm text-muted-foreground mb-3 p-3 bg-white/5 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-neon-purple" />
            <p className="whitespace-pre-wrap">{account.deleteGuide}</p>
          </div>
        </div>
      )}

      {account.deleteUrl && (
        <a href={account.deleteUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            탈퇴 페이지 바로가기
          </Button>
        </a>
      )}

      {!account.deleteGuide && !account.deleteUrl && (
        <p className="text-xs text-muted-foreground/60 text-center py-2">
          탈퇴 정보가 등록되지 않았습니다
        </p>
      )}
    </motion.div>
  );
}
