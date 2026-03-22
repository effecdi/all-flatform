import { PageTransition } from "@/components/page-transition";
import { SubscriptionTracker } from "@/components/subscription-tracker";
import { useAccounts } from "@/hooks/use-accounts";
import { Loader2 } from "lucide-react";

export default function SubscriptionsPage() {
  const { data: accounts, isLoading } = useAccounts();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading gradient-text">구독 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            구독 중인 서비스와 결제 현황을 추적하세요
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          </div>
        ) : (
          <SubscriptionTracker accounts={accounts || []} />
        )}
      </div>
    </PageTransition>
  );
}
