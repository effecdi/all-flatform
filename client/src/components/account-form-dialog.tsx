import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  insertAccountSchema,
  CATEGORIES,
  BILLING_CYCLES,
  DELETE_DIFFICULTIES,
  LOGO_STYLES,
  type Account,
  type InsertAccount,
  type CategoryKey,
} from "@shared/schema";
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export function AccountFormDialog({ open, onOpenChange, account }: AccountFormDialogProps) {
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const isEdit = !!account;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      serviceName: "",
      serviceUrl: "",
      category: "other",
      username: "",
      email: "",
      notes: "",
      isSubscription: false,
      isFavorite: false,
      subscriptionCost: undefined,
      billingCycle: undefined,
      currency: "KRW",
      logoStyle: undefined,
      deleteDifficulty: undefined,
      deleteUrl: "",
      deleteGuide: "",
    },
  });

  const isSubscription = watch("isSubscription");

  useEffect(() => {
    if (account) {
      reset({
        serviceName: account.serviceName,
        serviceUrl: account.serviceUrl || "",
        category: account.category,
        username: account.username || "",
        email: account.email || "",
        notes: account.notes || "",
        isSubscription: account.isSubscription,
        isFavorite: account.isFavorite,
        subscriptionCost: account.subscriptionCost ?? undefined,
        billingCycle: account.billingCycle ?? undefined,
        currency: account.currency,
        logoStyle: account.logoStyle ?? undefined,
        deleteDifficulty: account.deleteDifficulty ?? undefined,
        deleteUrl: account.deleteUrl || "",
        deleteGuide: account.deleteGuide || "",
      });
    } else {
      reset({
        serviceName: "",
        serviceUrl: "",
        category: "other",
        username: "",
        email: "",
        notes: "",
        isSubscription: false,
        isFavorite: false,
        subscriptionCost: undefined,
        billingCycle: undefined,
        currency: "KRW",
        logoStyle: undefined,
        deleteDifficulty: undefined,
        deleteUrl: "",
        deleteGuide: "",
      });
    }
  }, [account, reset]);

  const onSubmit = async (data: InsertAccount) => {
    if (isEdit && account) {
      await update.mutateAsync({ id: account.id, data });
    } else {
      await create.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "계정 수정" : "새 계정 추가"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "계정 정보를 수정하세요." : "관리할 계정 정보를 입력하세요."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="serviceName">서비스 이름 *</Label>
              <Input id="serviceName" placeholder="예: Netflix, Naver" {...register("serviceName")} />
              {errors.serviceName && (
                <p className="text-xs text-destructive">{errors.serviceName.message}</p>
              )}
            </div>

            {/* Service URL */}
            <div className="space-y-2">
              <Label htmlFor="serviceUrl">사이트 URL</Label>
              <Input id="serviceUrl" placeholder="https://..." {...register("serviceUrl")} />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) => setValue("category", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {CATEGORIES[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logo Style */}
            <div className="space-y-2">
              <Label>로고 스타일</Label>
              <Select
                value={watch("logoStyle") || ""}
                onValueChange={(v) => setValue("logoStyle", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOGO_STYLES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span>{v.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input id="username" placeholder="username" {...register("username")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" placeholder="email@example.com" {...register("email")} />
              </div>
            </div>

            {/* Subscription toggle */}
            <div className="flex items-center justify-between">
              <Label>구독 서비스</Label>
              <Switch
                checked={isSubscription}
                onCheckedChange={(v) => setValue("isSubscription", v)}
              />
            </div>

            {/* Subscription details */}
            {isSubscription && (
              <div className="space-y-3 p-3 glass rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>월 비용 (원)</Label>
                    <Input
                      type="number"
                      placeholder="9900"
                      {...register("subscriptionCost", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>결제 주기</Label>
                    <Select
                      value={watch("billingCycle") || ""}
                      onValueChange={(v) => setValue("billingCycle", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BILLING_CYCLES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Delete difficulty */}
            <div className="space-y-2">
              <Label>탈퇴 난이도</Label>
              <Select
                value={watch("deleteDifficulty") || ""}
                onValueChange={(v) => setValue("deleteDifficulty", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DELETE_DIFFICULTIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delete URL */}
            <div className="space-y-2">
              <Label>탈퇴 페이지 URL</Label>
              <Input placeholder="https://..." {...register("deleteUrl")} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">메모</Label>
              <Input id="notes" placeholder="추가 메모" {...register("notes")} />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90"
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending ? "저장 중..." : isEdit ? "수정" : "추가"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
