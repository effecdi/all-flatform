import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { useSaveBusinessProfile } from "@/hooks/use-business-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  REGIONS,
  BUSINESS_STAGE_LABELS,
  INDUSTRY_SECTOR_LABELS,
  REVENUE_RANGES,
  FUNDING_RANGES,
} from "@shared/constants";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const saveProfile = useSaveBusinessProfile();

  const [form, setForm] = useState({
    companyName: "",
    businessStage: "",
    industrySector: "",
    region: "",
    employeeCount: "",
    annualRevenue: "",
    techField: "",
    desiredFunding: "",
    businessDescription: "",
  });

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 1) return form.companyName && form.businessStage && form.industrySector;
    if (step === 2) return form.region;
    return true;
  };

  const handleSubmit = async () => {
    try {
      await saveProfile.mutateAsync({
        companyName: form.companyName,
        businessStage: form.businessStage as any,
        industrySector: form.industrySector as any,
        region: form.region,
        employeeCount: form.employeeCount ? parseInt(form.employeeCount, 10) : null,
        annualRevenue: form.annualRevenue || null,
        techField: form.techField || null,
        desiredFunding: form.desiredFunding || null,
        businessDescription: form.businessDescription || null,
      });
      setLocation("/");
    } catch (err) {
      console.error("프로필 저장 실패", err);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-20 pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">사업 프로필 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI 맞춤 추천을 위해 사업 정보를 입력해주세요
          </p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 space-y-5">
          {step === 1 && (
            <>
              <Field label="회사명 *">
                <Input value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="회사명을 입력하세요" />
              </Field>
              <Field label="창업 단계 *">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BUSINESS_STAGE_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={form.businessStage === key ? "default" : "outline"}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => update("businessStage", key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field label="업종 *">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(INDUSTRY_SECTOR_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={form.industrySector === key ? "default" : "outline"}
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => update("industrySector", key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="지역 *">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.region}
                  onChange={e => update("region", e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="매출 규모">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.annualRevenue}
                  onChange={e => update("annualRevenue", e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {REVENUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="직원 수">
                <Input
                  type="number"
                  value={form.employeeCount}
                  onChange={e => update("employeeCount", e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="기술/전문 분야">
                <Input
                  value={form.techField}
                  onChange={e => update("techField", e.target.value)}
                  placeholder="예: AI, 바이오, 로보틱스"
                />
              </Field>
              <Field label="희망 자금 규모">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.desiredFunding}
                  onChange={e => update("desiredFunding", e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {FUNDING_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="사업 설명">
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y"
                  value={form.businessDescription}
                  onChange={e => update("businessDescription", e.target.value)}
                  placeholder="사업 아이템과 특징을 간단히 설명해주세요"
                />
              </Field>
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1">
              <ArrowLeft className="w-4 h-4" /> 이전
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1">
              다음 <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saveProfile.isPending} className="gap-1">
              {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              완료
            </Button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
