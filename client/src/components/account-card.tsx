import { motion } from "framer-motion";
import { Star, ExternalLink, CreditCard, Pencil, Trash2 } from "lucide-react";
import type { Account } from "@shared/schema";
import { CATEGORIES, BILLING_CYCLES, LOGO_STYLES } from "@shared/schema";
import { CategoryBadge } from "./category-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/favicon-fetcher";
import { useToggleFavorite, useDeleteAccount } from "@/hooks/use-accounts";

interface AccountCardProps {
  account: Account;
  index: number;
  onEdit: (account: Account) => void;
}

export function AccountCard({ account, index, onEdit }: AccountCardProps) {
  const toggleFav = useToggleFavorite();
  const deleteAccount = useDeleteAccount();
  const favicon = getFaviconUrl(account.serviceUrl) || account.logoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass rounded-2xl p-5 group relative"
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
          {favicon ? (
            <img src={favicon} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {account.serviceName.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{account.serviceName}</h3>
            <button
              onClick={() => toggleFav.mutate(account.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Star
                className={cn(
                  "w-4 h-4 transition-colors",
                  account.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={account.category} />
            {account.logoStyle && LOGO_STYLES[account.logoStyle] && (
              <Badge
                variant="secondary"
                className="text-[10px]"
                style={{
                  backgroundColor: `${LOGO_STYLES[account.logoStyle].color}20`,
                  color: LOGO_STYLES[account.logoStyle].color,
                }}
              >
                {LOGO_STYLES[account.logoStyle].label}
              </Badge>
            )}
          </div>

          {account.email && (
            <p className="text-xs text-muted-foreground mt-2 truncate">{account.email}</p>
          )}
          {account.username && (
            <p className="text-xs text-muted-foreground truncate">@{account.username}</p>
          )}

          {account.isSubscription && account.subscriptionCost && (
            <div className="flex items-center gap-1 mt-2 text-xs text-neon-green">
              <CreditCard className="w-3 h-3" />
              <span>
                {formatCurrency(account.subscriptionCost)} / {BILLING_CYCLES[account.billingCycle || "monthly"]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {account.serviceUrl && (
          <a href={account.serviceUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(account)}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:text-destructive"
          onClick={() => deleteAccount.mutate(account.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
