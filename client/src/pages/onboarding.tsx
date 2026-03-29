import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSaveBusinessProfile, useBusinessProfile } from "@/hooks/use-business-profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Check, Copy, CheckCheck } from "lucide-react";
import {
  REGIONS,
  BUSINESS_STAGE_LABELS,
  INDUSTRY_SECTOR_LABELS,
  REVENUE_RANGES,
  FUNDING_RANGES,
} from "@shared/constants";

interface StepConfig {
  key: string;
  emoji: string;
  question: string;
  subtitle?: string;
  required: boolean;
  autoAdvance: boolean;
}

const STEPS: StepConfig[] = [
  { key: "companyName", emoji: "🏢", question: "회사명을 알려주세요", subtitle: "정식 법인명 또는 팀명을 입력해주세요", required: true, autoAdvance: false },
  { key: "businessStage", emoji: "🚀", question: "창업 단계는 어디에 해당하나요?", subtitle: "현재 사업의 성장 단계를 선택해주세요", required: true, autoAdvance: true },
  { key: "industrySector", emoji: "💡", question: "어떤 분야에서 활동하고 계신가요?", subtitle: "가장 가까운 업종을 선택해주세요", required: true, autoAdvance: true },
  { key: "region", emoji: "📍", question: "활동 지역은 어디인가요?", subtitle: "주요 사업장이 위치한 지역을 선택해주세요", required: true, autoAdvance: true },
  { key: "companySize", emoji: "📊", question: "회사 규모를 알려주세요", subtitle: "건너뛰어도 괜찮아요", required: false, autoAdvance: false },
  { key: "techFunding", emoji: "🔬", question: "기술 분야와 희망 자금을 알려주세요", subtitle: "건너뛰어도 괜찮아요", required: false, autoAdvance: false },
  { key: "businessDescription", emoji: "✍️", question: "마지막으로, 사업을 소개해주세요", subtitle: "AI가 더 정확한 추천을 드릴 수 있어요", required: false, autoAdvance: false },
];

const TOTAL_STEPS = STEPS.length;

const STAGE_META: Record<string, { icon: string; desc: string }> = {
  "예비창업": { icon: "💭", desc: "아이디어를 구체화하는 중" },
  "초기": { icon: "🌱", desc: "사업 초기, 제품 개발 중" },
  "성장": { icon: "📈", desc: "매출 성장, 시장 확대 중" },
  "도약": { icon: "🏆", desc: "안정적 성장, 스케일업 단계" },
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-border/30">
      <motion.div className="h-full bg-gradient-to-r from-primary to-violet-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
    </div>
  );
}

function QuestionHeader({ emoji, question, subtitle }: { emoji: string; question: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <motion.div className="text-5xl mb-4" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
        {emoji}
      </motion.div>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{question}</h2>
      {subtitle && <p className="text-muted-foreground mt-2 text-base">{subtitle}</p>}
    </div>
  );
}

function SelectionCard({ label, icon, description, selected, onClick }: { label: string; icon: string; description: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        relative text-left p-6 rounded-2xl border transition-colors backdrop-blur-sm cursor-pointer
        ${selected
          ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30"
          : "bg-card/80 dark:bg-card/60 border-border/50 hover:border-primary/30 hover:bg-accent/50"
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-base">{label}</div>
      <div className="text-sm text-muted-foreground mt-1">{description}</div>
      {selected && (
        <motion.div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
          <Check className="w-3.5 h-3.5 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

function PillButton({ label, selected, onClick, delay = 0 }: { label: string; selected: boolean; onClick: () => void; delay?: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-full border text-sm font-medium transition-colors cursor-pointer
        ${selected
          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
          : "bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-accent/50 text-foreground"
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: delay * 0.03 }}
    >
      {label}
    </motion.button>
  );
}

function CompletionScreen({ recoveryCode, onContinue }: { recoveryCode: string | null; onContinue: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!recoveryCode) return;
    await navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}>
          <Check className="w-10 h-10 text-success" />
        </motion.div>
      </motion.div>
      <motion.h2 className="text-2xl sm:text-3xl font-bold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        프로필 설정 완료!
      </motion.h2>

      {recoveryCode ? (
        <motion.div className="mt-6 max-w-sm w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <p className="text-muted-foreground text-sm mb-4">
            아래 복구 코드를 저장해두세요.<br />
            브라우저 변경이나 쿠키 삭제 시 프로필을 복구할 수 있습니다.
          </p>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">복구 코드</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-xl font-mono font-bold tracking-widest text-foreground">{recoveryCode}</code>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? <CheckCheck className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={onContinue} className="mt-6 w-full">
            확인, 시작하기
          </Button>
        </motion.div>
      ) : (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
        </motion.div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const saveProfile = useSaveBusinessProfile();
  const { data: existingProfile } = useBusinessProfile();
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    companyName: "", businessStage: "", industrySector: "", region: "",
    employeeCount: "", annualRevenue: "", techField: "", desiredFunding: "", businessDescription: "",
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        companyName: existingProfile.companyName || "",
        businessStage: existingProfile.businessStage || "",
        industrySector: existingProfile.industrySector || "",
        region: existingProfile.region || "",
        employeeCount: existingProfile.employeeCount?.toString() || "",
        annualRevenue: existingProfile.annualRevenue || "",
        techField: existingProfile.techField || "",
        desiredFunding: existingProfile.desiredFunding || "",
        businessDescription: existingProfile.businessDescription || "",
      });
    }
  }, [existingProfile]);

  const update = useCallback((key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  }, []);

  const canProceed = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return false;
    switch (step.key) {
      case "companyName": return form.companyName.trim().length > 0;
      case "businessStage": return form.businessStage !== "";
      case "industrySector": return form.industrySector !== "";
      case "region": return form.region !== "";
      default: return true;
    }
  }, [currentStep, form]);

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) { setDirection(1); setCurrentStep(s => s + 1); }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) { setDirection(-1); setCurrentStep(s => s - 1); }
  }, [currentStep]);

  const triggerAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => goNext(), 500);
  }, [goNext]);

  useEffect(() => { return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current); }; }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    if (!form.companyName.trim()) { setSubmitError("회사명을 입력해주세요."); return; }
    if (!form.businessStage) { setSubmitError("창업 단계를 선택해주세요."); return; }
    if (!form.industrySector) { setSubmitError("업종을 선택해주세요."); return; }
    if (!form.region) { setSubmitError("지역을 선택해주세요."); return; }

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
      setCompleted(true);
      // 복구 코드 가져오기
      try {
        const rcRes = await fetch("/api/recovery-code", { credentials: "same-origin" });
        if (rcRes.ok) {
          const { recoveryCode: code } = await rcRes.json();
          setRecoveryCode(code);
        }
      } catch { /* 복구 코드 실패해도 진행 */ }
    } catch (err: any) {
      let message = "프로필 저장에 실패했습니다. 다시 시도해주세요.";
      try {
        const body = JSON.parse(err.message.replace(/^\d+:\s*/, ""));
        if (body.errors) {
          const fields = Object.entries(body.errors).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`);
          message = fields.join("\n");
        } else if (body.message) { message = body.message; }
      } catch { /* use default */ }
      setSubmitError(message);
    }
  }, [form, saveProfile, setLocation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (completed) return;
      if (e.key === "Enter") {
        const isTextareaStep = STEPS[currentStep]?.key === "businessDescription";
        if (isTextareaStep && !(e.metaKey || e.ctrlKey)) return;
        e.preventDefault();
        if (currentStep === TOTAL_STEPS - 1) { if (canProceed()) handleSubmit(); }
        else if (canProceed()) { goNext(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentStep, completed, canProceed, goNext, handleSubmit]);

  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const stepConfig = STEPS[currentStep];

  const renderStepContent = () => {
    switch (stepConfig.key) {
      case "companyName":
        return (
          <div className="max-w-md mx-auto">
            <Input autoFocus value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="회사명을 입력하세요" className="h-14 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-sm text-lg text-center border-border/50 focus-visible:border-primary" />
          </div>
        );
      case "businessStage":
        return (
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {Object.entries(BUSINESS_STAGE_LABELS).map(([key, label]) => (
              <SelectionCard key={key} label={label} icon={STAGE_META[key]?.icon || "📌"} description={STAGE_META[key]?.desc || ""} selected={form.businessStage === key} onClick={() => { update("businessStage", key); triggerAutoAdvance(); }} />
            ))}
          </div>
        );
      case "industrySector":
        return (
          <div className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto">
            {Object.entries(INDUSTRY_SECTOR_LABELS).map(([key, label], i) => (
              <PillButton key={key} label={label} selected={form.industrySector === key} delay={i} onClick={() => { update("industrySector", key); triggerAutoAdvance(); }} />
            ))}
          </div>
        );
      case "region":
        return (
          <div className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto">
            {REGIONS.map((r, i) => (
              <PillButton key={r} label={r} selected={form.region === r} delay={i} onClick={() => { update("region", r); triggerAutoAdvance(); }} />
            ))}
          </div>
        );
      case "companySize":
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">매출 규모</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {REVENUE_RANGES.map((r, i) => <PillButton key={r} label={r} selected={form.annualRevenue === r} delay={i} onClick={() => update("annualRevenue", r)} />)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">직원 수</label>
              <Input type="number" value={form.employeeCount} onChange={e => update("employeeCount", e.target.value)} placeholder="직원 수를 입력하세요" min={0} className="h-14 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-sm text-lg text-center border-border/50 focus-visible:border-primary" />
            </div>
          </div>
        );
      case "techFunding":
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">기술/전문 분야</label>
              <Input value={form.techField} onChange={e => update("techField", e.target.value)} placeholder="예: AI, 바이오, 로보틱스" className="h-14 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-sm text-lg text-center border-border/50 focus-visible:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">희망 자금 규모</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {FUNDING_RANGES.map((r, i) => <PillButton key={r} label={r} selected={form.desiredFunding === r} delay={i} onClick={() => update("desiredFunding", r)} />)}
              </div>
            </div>
          </div>
        );
      case "businessDescription":
        return (
          <div className="max-w-md mx-auto">
            <textarea value={form.businessDescription} onChange={e => update("businessDescription", e.target.value)} placeholder="사업 아이템과 특징을 간단히 설명해주세요" className="w-full rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-border/50 focus:border-primary px-4 py-4 text-base min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/70" />
            <p className="text-xs text-muted-foreground mt-2 text-center">Ctrl+Enter 또는 Cmd+Enter로 완료</p>
          </div>
        );
      default: return null;
    }
  };

  if (completed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <CompletionScreen recoveryCode={recoveryCode} onContinue={() => setLocation("/")} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <ProgressBar current={currentStep} total={TOTAL_STEPS} />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
        <div className="text-center mb-2">
          <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">{currentStep + 1} / {TOTAL_STEPS}</span>
        </div>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentStep} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
            <QuestionHeader emoji={stepConfig.emoji} question={stepConfig.question} subtitle={stepConfig.subtitle} />
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="max-w-md mx-auto mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-red-700 dark:text-red-300 text-sm text-center">
            {submitError}
          </div>
        )}

        <div className="flex justify-between items-center mt-10 max-w-md mx-auto">
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={goPrev} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> 이전
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            {!stepConfig.required && (
              <Button variant="ghost" onClick={isLastStep ? handleSubmit : goNext} className="text-muted-foreground" disabled={isLastStep && saveProfile.isPending}>
                건너뛰기
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleSubmit} disabled={saveProfile.isPending || !canProceed()} className="gap-1.5 px-6">
                {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                완료
              </Button>
            ) : (
              <Button onClick={goNext} disabled={stepConfig.required && !canProceed()} className="gap-1.5 px-6">
                다음 <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
