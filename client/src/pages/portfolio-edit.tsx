import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/page-transition";
import { usePortfolio, useSavePortfolio } from "@/hooks/use-portfolio";
import type { Portfolio, TeamMember, Project, Milestone, Metric } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Building2,
  Palette,
  Users,
  Rocket,
  Calendar,
  Award,
  Target,
  Code2,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Share2,
} from "lucide-react";

// 기본 빈 포트폴리오 데이터
const emptyPortfolio: Partial<Portfolio> = {
  companyName: "",
  tagline: "",
  mission: "",
  vision: "",
  aboutUs: "",
  logoUrl: "",
  coverImageUrl: "",
  brandColor: "#4f6ef7",
  accentColor: "#a855f7",
  industrySector: "",
  businessStage: "",
  foundedYear: "",
  region: "",
  employeeCount: "",
  website: "",
  teamMembers: [],
  projects: [],
  milestones: [],
  metrics: [],
  contactEmail: "",
  contactPhone: "",
  socialLinks: {},
  techStack: [],
  awards: [],
  isPublic: 0,
  slug: "",
};

type SectionKey = "basic" | "brand" | "about" | "metrics" | "projects" | "techStack" | "team" | "milestones" | "awards" | "contact" | "publish";

const SECTIONS: { key: SectionKey; label: string; icon: typeof Building2 }[] = [
  { key: "basic", label: "기본 정보", icon: Building2 },
  { key: "brand", label: "브랜드 컬러", icon: Palette },
  { key: "about", label: "소개 / 미션 / 비전", icon: Target },
  { key: "metrics", label: "핵심 지표", icon: Target },
  { key: "projects", label: "프로젝트", icon: Rocket },
  { key: "techStack", label: "기술 스택", icon: Code2 },
  { key: "team", label: "팀 멤버", icon: Users },
  { key: "milestones", label: "연혁", icon: Calendar },
  { key: "awards", label: "수상 & 인증", icon: Award },
  { key: "contact", label: "연락처 & 소셜", icon: Mail },
  { key: "publish", label: "공개 설정", icon: Share2 },
];

export default function PortfolioEditPage() {
  const { data: existing, isLoading } = usePortfolio();
  const saveMutation = useSavePortfolio();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [form, setForm] = useState<Partial<Portfolio>>(emptyPortfolio);
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set<SectionKey>(["basic"]));

  useEffect(() => {
    if (existing) {
      setForm({
        ...emptyPortfolio,
        ...existing,
        teamMembers: existing.teamMembers || [],
        projects: existing.projects || [],
        milestones: existing.milestones || [],
        metrics: existing.metrics || [],
        techStack: existing.techStack || [],
        awards: existing.awards || [],
        socialLinks: existing.socialLinks || {},
      });
    }
  }, [existing]);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateField = (key: keyof Portfolio, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.companyName?.trim()) {
      toast({ title: "회사명을 입력해주세요.", variant: "destructive" });
      return;
    }
    try {
      await saveMutation.mutateAsync(form as any);
      toast({ title: "포트폴리오가 저장되었습니다." });
    } catch {
      toast({ title: "저장에 실패했습니다.", variant: "destructive" });
    }
  };

  const handlePreview = () => {
    if (form.slug) {
      window.open(`/portfolio/${form.slug}`, "_blank");
    } else {
      navigate("/portfolio/preview");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">포트폴리오 편집</h1>
              <p className="text-muted-foreground mt-1">투자자와 심사위원에게 보여질 포트폴리오를 만드세요.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">미리보기</span>
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5">
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>

          {/* ─── Sections ─── */}
          <div className="space-y-3">
            {SECTIONS.map((section) => {
              const isOpen = openSections.has(section.key);
              const Icon = section.icon;
              return (
                <div key={section.key} className="rounded-2xl border border-border bg-card overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm flex-1">{section.label}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {/* Section Content */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-border/50 space-y-4">
                      {section.key === "basic" && <BasicSection form={form} updateField={updateField} />}
                      {section.key === "brand" && <BrandSection form={form} updateField={updateField} />}
                      {section.key === "about" && <AboutSection form={form} updateField={updateField} />}
                      {section.key === "metrics" && <MetricsSection form={form} setForm={setForm} />}
                      {section.key === "projects" && <ProjectsSection form={form} setForm={setForm} />}
                      {section.key === "techStack" && <TechStackSection form={form} setForm={setForm} />}
                      {section.key === "team" && <TeamSection form={form} setForm={setForm} />}
                      {section.key === "milestones" && <MilestonesSection form={form} setForm={setForm} />}
                      {section.key === "awards" && <AwardsSection form={form} setForm={setForm} />}
                      {section.key === "contact" && <ContactSection form={form} updateField={updateField} />}
                      {section.key === "publish" && <PublishSection form={form} updateField={updateField} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── Bottom Save ─── */}
          <div className="mt-8 flex justify-end gap-2">
            <Button variant="outline" onClick={handlePreview} className="gap-1.5">
              <Eye className="w-4 h-4" /> 미리보기
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5">
              <Save className="w-4 h-4" /> {saveMutation.isPending ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/* ═══════════════════════════════════════════
   개별 섹션 컴포넌트
   ═══════════════════════════════════════════ */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1.5">{children}</label>;
}

function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

/* ─── Basic Info ─── */
function BasicSection({ form, updateField }: { form: Partial<Portfolio>; updateField: (k: keyof Portfolio, v: any) => void }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>회사명 *</FieldLabel>
          <Input value={form.companyName || ""} onChange={(e) => updateField("companyName", e.target.value)} placeholder="회사 이름" />
        </div>
        <div>
          <FieldLabel>태그라인</FieldLabel>
          <Input value={form.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} placeholder="한 줄 소개" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>업종</FieldLabel>
          <Input value={form.industrySector || ""} onChange={(e) => updateField("industrySector", e.target.value)} placeholder="예: AI/SaaS, 헬스케어" />
        </div>
        <div>
          <FieldLabel>사업 단계</FieldLabel>
          <Input value={form.businessStage || ""} onChange={(e) => updateField("businessStage", e.target.value)} placeholder="예: 시리즈 A, 성장기" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel>설립년도</FieldLabel>
          <Input value={form.foundedYear || ""} onChange={(e) => updateField("foundedYear", e.target.value)} placeholder="2024" />
        </div>
        <div>
          <FieldLabel>지역</FieldLabel>
          <Input value={form.region || ""} onChange={(e) => updateField("region", e.target.value)} placeholder="서울" />
        </div>
        <div>
          <FieldLabel>직원 수</FieldLabel>
          <Input value={form.employeeCount || ""} onChange={(e) => updateField("employeeCount", e.target.value)} placeholder="10" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>로고 URL</FieldLabel>
          <Input value={form.logoUrl || ""} onChange={(e) => updateField("logoUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <FieldLabel>웹사이트</FieldLabel>
          <Input value={form.website || ""} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." />
        </div>
      </div>
    </>
  );
}

/* ─── Brand Colors ─── */
function BrandSection({ form, updateField }: { form: Partial<Portfolio>; updateField: (k: keyof Portfolio, v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>브랜드 메인 컬러</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.brandColor || "#4f6ef7"}
              onChange={(e) => updateField("brandColor", e.target.value)}
              className="w-10 h-10 rounded-lg border border-input cursor-pointer"
            />
            <Input value={form.brandColor || ""} onChange={(e) => updateField("brandColor", e.target.value)} placeholder="#4f6ef7" className="flex-1" />
          </div>
        </div>
        <div>
          <FieldLabel>포인트 컬러</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.accentColor || "#a855f7"}
              onChange={(e) => updateField("accentColor", e.target.value)}
              className="w-10 h-10 rounded-lg border border-input cursor-pointer"
            />
            <Input value={form.accentColor || ""} onChange={(e) => updateField("accentColor", e.target.value)} placeholder="#a855f7" className="flex-1" />
          </div>
        </div>
      </div>
      {/* Preview */}
      <div className="rounded-xl p-4 border border-border/50">
        <p className="text-xs text-muted-foreground mb-2">미리보기</p>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: `linear-gradient(135deg, ${form.brandColor || "#4f6ef7"}, ${form.accentColor || "#a855f7"})` }}
          >
            {(form.companyName || "A").charAt(0)}
          </div>
          <div>
            <div className="font-bold" style={{ color: form.brandColor || "#4f6ef7" }}>{form.companyName || "회사명"}</div>
            <div className="text-sm text-muted-foreground">{form.tagline || "태그라인"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── About ─── */
function AboutSection({ form, updateField }: { form: Partial<Portfolio>; updateField: (k: keyof Portfolio, v: any) => void }) {
  return (
    <>
      <div>
        <FieldLabel>회사 소개</FieldLabel>
        <TextArea value={form.aboutUs || ""} onChange={(v) => updateField("aboutUs", v)} rows={5} placeholder="회사에 대해 자유롭게 소개해주세요..." />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>미션</FieldLabel>
          <TextArea value={form.mission || ""} onChange={(v) => updateField("mission", v)} rows={3} placeholder="우리 회사의 미션은..." />
        </div>
        <div>
          <FieldLabel>비전</FieldLabel>
          <TextArea value={form.vision || ""} onChange={(v) => updateField("vision", v)} rows={3} placeholder="우리가 그리는 미래는..." />
        </div>
      </div>
    </>
  );
}

/* ─── Metrics ─── */
function MetricsSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const metrics = form.metrics || [];

  const add = () => setForm((p) => ({ ...p, metrics: [...(p.metrics || []), { label: "", value: "", suffix: "" }] }));
  const remove = (i: number) => setForm((p) => ({ ...p, metrics: (p.metrics || []).filter((_, j) => j !== i) }));
  const update = (i: number, field: keyof Metric, value: string) =>
    setForm((p) => ({ ...p, metrics: (p.metrics || []).map((m, j) => (j === i ? { ...m, [field]: value } : m)) }));

  return (
    <>
      {metrics.map((m, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <Input value={m.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="라벨 (예: 매출)" />
            <Input value={m.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="값 (예: 50)" />
            <Input value={m.suffix || ""} onChange={(e) => update(i, "suffix", e.target.value)} placeholder="단위 (예: 억)" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(i)} className="shrink-0 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> 지표 추가
      </Button>
    </>
  );
}

/* ─── Projects ─── */
function ProjectsSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const projects = form.projects || [];

  const add = () => setForm((p) => ({ ...p, projects: [...(p.projects || []), { title: "", description: "", tags: [], url: "", year: "" }] }));
  const remove = (i: number) => setForm((p) => ({ ...p, projects: (p.projects || []).filter((_, j) => j !== i) }));
  const update = (i: number, field: keyof Project, value: any) =>
    setForm((p) => ({ ...p, projects: (p.projects || []).map((pr, j) => (j === i ? { ...pr, [field]: value } : pr)) }));

  return (
    <>
      {projects.map((proj, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">프로젝트 {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} className="w-7 h-7 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={proj.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="프로젝트 이름" />
            <Input value={proj.year || ""} onChange={(e) => update(i, "year", e.target.value)} placeholder="연도 (예: 2025)" />
          </div>
          <TextArea value={proj.description || ""} onChange={(v) => update(i, "description", v)} rows={2} placeholder="프로젝트 설명" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={proj.url || ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="링크 URL" />
            <Input value={proj.imageUrl || ""} onChange={(e) => update(i, "imageUrl", e.target.value)} placeholder="이미지 URL" />
          </div>
          <div>
            <FieldLabel>태그 (쉼표로 구분)</FieldLabel>
            <Input
              value={(proj.tags || []).join(", ")}
              onChange={(e) => update(i, "tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="React, TypeScript, AI"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> 프로젝트 추가
      </Button>
    </>
  );
}

/* ─── Tech Stack ─── */
function TechStackSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const [input, setInput] = useState("");
  const techStack = form.techStack || [];

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setForm((p) => ({ ...p, techStack: [...(p.techStack || []), trimmed] }));
      setInput("");
    }
  };
  const remove = (i: number) => setForm((p) => ({ ...p, techStack: (p.techStack || []).filter((_, j) => j !== i) }));

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="기술명 입력 후 Enter"
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={add}>추가</Button>
      </div>
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {tech}
              <button onClick={() => remove(i)} className="hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Team Members ─── */
function TeamSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const members = form.teamMembers || [];

  const add = () => setForm((p) => ({ ...p, teamMembers: [...(p.teamMembers || []), { name: "", role: "", description: "" }] }));
  const remove = (i: number) => setForm((p) => ({ ...p, teamMembers: (p.teamMembers || []).filter((_, j) => j !== i) }));
  const update = (i: number, field: keyof TeamMember, value: string) =>
    setForm((p) => ({ ...p, teamMembers: (p.teamMembers || []).map((m, j) => (j === i ? { ...m, [field]: value } : m)) }));

  return (
    <>
      {members.map((m, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">팀원 {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} className="w-7 h-7 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={m.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="이름" />
            <Input value={m.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="역할 (예: CTO)" />
          </div>
          <TextArea value={m.description || ""} onChange={(v) => update(i, "description", v)} rows={2} placeholder="소개 (선택)" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={m.imageUrl || ""} onChange={(e) => update(i, "imageUrl", e.target.value)} placeholder="프로필 이미지 URL" />
            <Input value={m.linkedIn || ""} onChange={(e) => update(i, "linkedIn", e.target.value)} placeholder="LinkedIn URL" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> 팀원 추가
      </Button>
    </>
  );
}

/* ─── Milestones ─── */
function MilestonesSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const milestones = form.milestones || [];
  const types: Milestone["type"][] = ["founding", "funding", "product", "award", "partnership", "growth", "other"];
  const typeLabels: Record<string, string> = {
    founding: "설립", funding: "투자", product: "제품", award: "수상",
    partnership: "파트너십", growth: "성장", other: "기타",
  };

  const add = () => setForm((p) => ({ ...p, milestones: [...(p.milestones || []), { date: "", title: "", description: "", type: "other" }] }));
  const remove = (i: number) => setForm((p) => ({ ...p, milestones: (p.milestones || []).filter((_, j) => j !== i) }));
  const update = (i: number, field: keyof Milestone, value: string) =>
    setForm((p) => ({ ...p, milestones: (p.milestones || []).map((m, j) => (j === i ? { ...m, [field]: value } : m)) }));

  return (
    <>
      {milestones.map((ms, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">연혁 {i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} className="w-7 h-7 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input value={ms.date} onChange={(e) => update(i, "date", e.target.value)} placeholder="날짜 (예: 2024-01)" />
            <Input value={ms.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="제목" className="sm:col-span-2" />
          </div>
          <div className="flex gap-3">
            <select
              value={ms.type || "other"}
              onChange={(e) => update(i, "type", e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {types.map((t) => (
                <option key={t} value={t}>{typeLabels[t!]}</option>
              ))}
            </select>
            <Input value={ms.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="설명 (선택)" className="flex-1" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> 연혁 추가
      </Button>
    </>
  );
}

/* ─── Awards ─── */
function AwardsSection({ form, setForm }: { form: Partial<Portfolio>; setForm: React.Dispatch<React.SetStateAction<Partial<Portfolio>>> }) {
  const [input, setInput] = useState("");
  const awards = form.awards || [];

  const add = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setForm((p) => ({ ...p, awards: [...(p.awards || []), trimmed] }));
      setInput("");
    }
  };
  const remove = (i: number) => setForm((p) => ({ ...p, awards: (p.awards || []).filter((_, j) => j !== i) }));

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="수상 내역 입력 후 Enter"
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={add}>추가</Button>
      </div>
      {awards.length > 0 && (
        <div className="space-y-2">
          {awards.map((award, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/30">
              <Award className="w-4 h-4 text-warning shrink-0" />
              <span className="text-sm flex-1">{award}</span>
              <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Contact ─── */
function ContactSection({ form, updateField }: { form: Partial<Portfolio>; updateField: (k: keyof Portfolio, v: any) => void }) {
  const [socialKey, setSocialKey] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const socialLinks = form.socialLinks || {};

  const addSocial = () => {
    if (socialKey.trim() && socialUrl.trim()) {
      updateField("socialLinks", { ...socialLinks, [socialKey.trim()]: socialUrl.trim() });
      setSocialKey("");
      setSocialUrl("");
    }
  };
  const removeSocial = (key: string) => {
    const next = { ...socialLinks };
    delete next[key];
    updateField("socialLinks", next);
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>이메일</FieldLabel>
          <Input value={form.contactEmail || ""} onChange={(e) => updateField("contactEmail", e.target.value)} placeholder="contact@company.com" />
        </div>
        <div>
          <FieldLabel>전화번호</FieldLabel>
          <Input value={form.contactPhone || ""} onChange={(e) => updateField("contactPhone", e.target.value)} placeholder="02-1234-5678" />
        </div>
      </div>
      <div>
        <FieldLabel>소셜 미디어</FieldLabel>
        <div className="flex gap-2 mb-3">
          <Input value={socialKey} onChange={(e) => setSocialKey(e.target.value)} placeholder="플랫폼 (예: GitHub)" className="w-32" />
          <Input value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} placeholder="URL" className="flex-1" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSocial())} />
          <Button variant="outline" size="sm" onClick={addSocial}>추가</Button>
        </div>
        {Object.entries(socialLinks).length > 0 && (
          <div className="space-y-2">
            {Object.entries(socialLinks).map(([key, url]) => (
              <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/30">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-muted-foreground w-20">{key}</span>
                <span className="text-sm flex-1 truncate">{url}</span>
                <button onClick={() => removeSocial(key)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Publish ─── */
function PublishSection({ form, updateField }: { form: Partial<Portfolio>; updateField: (k: keyof Portfolio, v: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>공개 URL 슬러그</FieldLabel>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">/portfolio/</span>
          <Input
            value={form.slug || ""}
            onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="my-company"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          영문 소문자, 숫자, 하이픈만 사용 가능
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateField("isPublic", form.isPublic === 1 ? 0 : 1)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            form.isPublic === 1 ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              form.isPublic === 1 ? "translate-x-6" : ""
            }`}
          />
        </button>
        <div>
          <p className="text-sm font-medium">{form.isPublic === 1 ? "공개" : "비공개"}</p>
          <p className="text-xs text-muted-foreground">
            {form.isPublic === 1
              ? "누구나 슬러그 URL로 포트폴리오를 볼 수 있습니다."
              : "포트폴리오가 외부에 공개되지 않습니다."}
          </p>
        </div>
      </div>
      {form.isPublic === 1 && form.slug && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <p className="text-xs text-muted-foreground mb-1">공개 URL</p>
          <p className="text-sm font-medium text-primary">{window.location.origin}/portfolio/{form.slug}</p>
        </div>
      )}
    </div>
  );
}
