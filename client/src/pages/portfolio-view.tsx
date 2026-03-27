import { useParams } from "wouter";
import { usePortfolio, usePortfolioBySlug } from "@/hooks/use-portfolio";
import type { Portfolio, TeamMember, Project, Milestone, Metric } from "@/hooks/use-portfolio";
import { PageTransition } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Building2,
  Rocket,
  Award,
  Handshake,
  TrendingUp,
  Star,
  ExternalLink,
  Linkedin,
  ChevronRight,
  Layers,
  Zap,
  Target,
  Code2,
} from "lucide-react";

// 마일스톤 타입별 아이콘/색상
const milestoneTypeConfig: Record<string, { icon: typeof Rocket; color: string; bg: string }> = {
  founding: { icon: Building2, color: "text-pf-primary", bg: "bg-pf-primary/10" },
  funding: { icon: TrendingUp, color: "text-pf-secondary", bg: "bg-pf-secondary/10" },
  product: { icon: Rocket, color: "text-pf-accent", bg: "bg-pf-accent/10" },
  award: { icon: Award, color: "text-pf-warm", bg: "bg-pf-warm/10" },
  partnership: { icon: Handshake, color: "text-pf-secondary", bg: "bg-pf-secondary/10" },
  growth: { icon: TrendingUp, color: "text-pf-primary", bg: "bg-pf-primary/10" },
  other: { icon: Star, color: "text-pf-text-2", bg: "bg-pf-text-2/10" },
};

export default function PortfolioViewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  // slug가 있으면 공개 뷰, 없으면 내 포트폴리오 미리보기
  const publicQuery = usePortfolioBySlug(slug || "");
  const myQuery = usePortfolio();

  const isPublic = !!slug;
  const { data: portfolio, isLoading, error } = isPublic ? publicQuery : myQuery;

  if (isLoading) return <PortfolioSkeleton />;
  if (error || !portfolio) return <PortfolioNotFound />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-pf-bg">
        {/* ─── HERO SECTION ─── */}
        <HeroSection portfolio={portfolio} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-0">
          {/* ─── METRICS ─── */}
          {portfolio.metrics && portfolio.metrics.length > 0 && (
            <MetricsSection metrics={portfolio.metrics} />
          )}

          {/* ─── ABOUT ─── */}
          {(portfolio.aboutUs || portfolio.mission || portfolio.vision) && (
            <AboutSection portfolio={portfolio} />
          )}

          {/* ─── TECH STACK ─── */}
          {portfolio.techStack && portfolio.techStack.length > 0 && (
            <TechStackSection techStack={portfolio.techStack} />
          )}

          {/* ─── PROJECTS ─── */}
          {portfolio.projects && portfolio.projects.length > 0 && (
            <ProjectsSection projects={portfolio.projects} brandColor={portfolio.brandColor} />
          )}

          {/* ─── MILESTONES ─── */}
          {portfolio.milestones && portfolio.milestones.length > 0 && (
            <MilestonesSection milestones={portfolio.milestones} />
          )}

          {/* ─── AWARDS ─── */}
          {portfolio.awards && portfolio.awards.length > 0 && (
            <AwardsSection awards={portfolio.awards} />
          )}

          {/* ─── TEAM ─── */}
          {portfolio.teamMembers && portfolio.teamMembers.length > 0 && (
            <TeamSection members={portfolio.teamMembers} />
          )}

          {/* ─── CONTACT ─── */}
          <ContactSection portfolio={portfolio} />
        </div>
      </div>
    </PageTransition>
  );
}

/* ============================================================
   HERO SECTION — 풀스크린, 그라데이션 배경, 대담한 타이포그래피
   ============================================================ */
function HeroSection({ portfolio }: { portfolio: Portfolio }) {
  const brandColor = portfolio.brandColor || undefined;

  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 pf-hero-bg" />
      {/* 장식 블롭 */}
      <div className="absolute -top-32 -right-32 w-96 h-96 pf-blob opacity-40" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 pf-blob opacity-30" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 로고 */}
        {portfolio.logoUrl ? (
          <div className="animate-pf-scale-in mb-8 inline-block">
            <img
              src={portfolio.logoUrl}
              alt={`${portfolio.companyName} 로고`}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-elevated border-2 border-white/80 dark:border-pf-border"
            />
          </div>
        ) : (
          <div className="animate-pf-scale-in mb-8 inline-flex">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-elevated border-2 border-white/80 dark:border-pf-border pf-gradient-bg"
              style={brandColor ? { background: brandColor } : undefined}
            >
              <span className="text-4xl sm:text-5xl font-black text-white">
                {portfolio.companyName.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* 회사명 */}
        <h1 className="animate-pf-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight pf-text leading-tight">
          {portfolio.companyName}
        </h1>

        {/* 태그라인 */}
        {portfolio.tagline && (
          <p className="animate-pf-fade-up text-lg sm:text-xl md:text-2xl pf-text-secondary mt-4 max-w-3xl mx-auto leading-relaxed" style={{ animationDelay: "100ms" }}>
            {portfolio.tagline}
          </p>
        )}

        {/* 메타 배지 */}
        <div className="animate-pf-fade-up flex flex-wrap items-center justify-center gap-3 mt-8" style={{ animationDelay: "200ms" }}>
          {portfolio.industrySector && (
            <Badge variant="secondary" className="pf-badge bg-pf-primary/10 text-pf-primary border-0 px-3 py-1.5 text-sm">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              {portfolio.industrySector}
            </Badge>
          )}
          {portfolio.businessStage && (
            <Badge variant="secondary" className="pf-badge bg-pf-secondary/10 text-pf-secondary border-0 px-3 py-1.5 text-sm">
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              {portfolio.businessStage}
            </Badge>
          )}
          {portfolio.region && (
            <Badge variant="secondary" className="pf-badge bg-pf-accent/10 text-pf-accent border-0 px-3 py-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              {portfolio.region}
            </Badge>
          )}
          {portfolio.foundedYear && (
            <Badge variant="secondary" className="pf-badge bg-pf-warm/10 text-pf-warm border-0 px-3 py-1.5 text-sm">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {portfolio.foundedYear}년 설립
            </Badge>
          )}
          {portfolio.employeeCount && (
            <Badge variant="secondary" className="pf-badge bg-pf-text-2/10 text-pf-text-2 border-0 px-3 py-1.5 text-sm">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {portfolio.employeeCount}명
            </Badge>
          )}
        </div>

        {/* CTA 버튼 */}
        <div className="animate-pf-fade-up flex flex-wrap items-center justify-center gap-4 mt-10" style={{ animationDelay: "300ms" }}>
          {portfolio.website && (
            <a
              href={portfolio.website.startsWith("http") ? portfolio.website : `https://${portfolio.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full pf-gradient-bg text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Globe className="w-4 h-4" />
              웹사이트 방문
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}
          {portfolio.contactEmail && (
            <a
              href={`mailto:${portfolio.contactEmail}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border pf-border pf-surface text-sm font-semibold pf-text hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Mail className="w-4 h-4" />
              연락하기
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   METRICS — 핵심 지표 카운터 애니메이션
   ============================================================ */
function MetricsSection({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="pf-view-section -mt-10 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="pf-card p-6 sm:p-8 text-center"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="pf-metric-value animate-pf-counter" style={{ animationDelay: `${400 + i * 150}ms` }}>
              {metric.value}
              {metric.suffix && <span className="text-2xl sm:text-3xl">{metric.suffix}</span>}
            </div>
            <p className="pf-text-secondary text-sm sm:text-base mt-2 font-medium">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   ABOUT — 미션 & 비전
   ============================================================ */
function AboutSection({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Target className="w-5 h-5" />} title="소개" />

      <div className="space-y-8 mt-8">
        {portfolio.aboutUs && (
          <div className="pf-card p-8 sm:p-10">
            <p className="text-base sm:text-lg pf-text leading-relaxed whitespace-pre-line">
              {portfolio.aboutUs}
            </p>
          </div>
        )}

        {(portfolio.mission || portfolio.vision) && (
          <div className="grid sm:grid-cols-2 gap-6">
            {portfolio.mission && (
              <div className="pf-card-highlight p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pf-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-pf-primary" />
                  </div>
                  <h3 className="text-lg font-bold pf-text">미션</h3>
                </div>
                <p className="pf-text-secondary leading-relaxed">{portfolio.mission}</p>
              </div>
            )}
            {portfolio.vision && (
              <div className="pf-card-highlight p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pf-accent/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-pf-accent" />
                  </div>
                  <h3 className="text-lg font-bold pf-text">비전</h3>
                </div>
                <p className="pf-text-secondary leading-relaxed">{portfolio.vision}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   TECH STACK — 기술 스택 태그
   ============================================================ */
function TechStackSection({ techStack }: { techStack: string[] }) {
  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Code2 className="w-5 h-5" />} title="기술 스택" />
      <div className="flex flex-wrap gap-3 mt-8">
        {techStack.map((tech, i) => (
          <span
            key={i}
            className="px-4 py-2 rounded-full text-sm font-medium pf-surface pf-border border transition-all duration-200 hover:border-pf-primary/40 hover:bg-pf-primary/5 hover:-translate-y-0.5 cursor-default animate-pf-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PROJECTS — 프로젝트 카드 그리드
   ============================================================ */
function ProjectsSection({ projects, brandColor }: { projects: Project[]; brandColor?: string | null }) {
  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Rocket className="w-5 h-5" />} title="프로젝트" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pf-stagger">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Wrapper = project.url ? "a" : "div";
  const linkProps = project.url
    ? { href: project.url.startsWith("http") ? project.url : `https://${project.url}`, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper {...linkProps} className="pf-project-card group block">
      {/* 이미지 영역 */}
      {project.imageUrl ? (
        <div className="aspect-video overflow-hidden bg-pf-bg">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-pf-primary/5 to-pf-accent/5 flex items-center justify-center">
          <Rocket className="w-10 h-10 text-pf-primary/20" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold pf-text group-hover:text-pf-primary transition-colors leading-snug">
            {project.title}
          </h3>
          {project.year && (
            <span className="text-xs pf-text-muted shrink-0 mt-1">{project.year}</span>
          )}
        </div>

        {project.description && (
          <p className="pf-text-secondary text-sm mt-3 leading-relaxed line-clamp-3">
            {project.description}
          </p>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-pf-primary/8 text-pf-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.url && (
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-pf-primary opacity-0 group-hover:opacity-100 transition-opacity">
            자세히 보기 <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </Wrapper>
  );
}

/* ============================================================
   MILESTONES — 타임라인
   ============================================================ */
function MilestonesSection({ milestones }: { milestones: Milestone[] }) {
  // 날짜 역순 정렬
  const sorted = [...milestones].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Calendar className="w-5 h-5" />} title="연혁" />
      <div className="mt-8 space-y-0">
        {sorted.map((ms, i) => {
          const config = milestoneTypeConfig[ms.type || "other"] || milestoneTypeConfig.other;
          const Icon = config.icon;

          return (
            <div key={i} className="pf-timeline-item py-6 animate-pf-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="pf-timeline-dot">
                <div className="pf-timeline-dot-inner" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold pf-text-muted uppercase tracking-wider">{ms.date}</span>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.bg} ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {ms.type === "founding" && "설립"}
                    {ms.type === "funding" && "투자"}
                    {ms.type === "product" && "제품"}
                    {ms.type === "award" && "수상"}
                    {ms.type === "partnership" && "파트너십"}
                    {ms.type === "growth" && "성장"}
                    {ms.type === "other" && "기타"}
                    {!ms.type && "기타"}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold pf-text">{ms.title}</h3>
                {ms.description && (
                  <p className="pf-text-secondary text-sm mt-1 leading-relaxed">{ms.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   AWARDS — 수상 내역
   ============================================================ */
function AwardsSection({ awards }: { awards: string[] }) {
  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Award className="w-5 h-5" />} title="수상 & 인증" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {awards.map((award, i) => (
          <div
            key={i}
            className="pf-card p-5 flex items-start gap-4 animate-pf-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-pf-warm/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-pf-warm" />
            </div>
            <p className="pf-text text-sm font-medium leading-relaxed">{award}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   TEAM — 팀 멤버
   ============================================================ */
function TeamSection({ members }: { members: TeamMember[] }) {
  return (
    <section className="pf-view-section pt-20 sm:pt-28">
      <SectionHeader icon={<Users className="w-5 h-5" />} title="팀" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pf-stagger">
        {members.map((member, i) => (
          <div key={i} className="pf-card p-6 text-center">
            {/* 아바타 */}
            <div className="mx-auto mb-4 pf-avatar-ring inline-block">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full pf-gradient-bg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <h3 className="text-base font-bold pf-text">{member.name}</h3>
            <p className="text-sm pf-text-secondary mt-1">{member.role}</p>
            {member.description && (
              <p className="text-xs pf-text-muted mt-3 leading-relaxed">{member.description}</p>
            )}

            {/* 소셜 링크 */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {member.linkedIn && (
                <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-pf-text-m hover:text-pf-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-pf-text-m hover:text-pf-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT — 연락처 & 소셜
   ============================================================ */
function ContactSection({ portfolio }: { portfolio: Portfolio }) {
  const hasSocial = portfolio.socialLinks && Object.keys(portfolio.socialLinks).length > 0;
  const hasContact = portfolio.contactEmail || portfolio.contactPhone || portfolio.website;

  if (!hasContact && !hasSocial) return null;

  return (
    <section className="pf-view-section pt-20 sm:pt-28 pb-8">
      <SectionHeader icon={<Mail className="w-5 h-5" />} title="연락처" />

      <div className="pf-card-highlight p-8 sm:p-10 mt-8">
        <div className="grid sm:grid-cols-2 gap-8">
          {/* 왼쪽: 연락처 정보 */}
          <div className="space-y-4">
            {portfolio.contactEmail && (
              <a href={`mailto:${portfolio.contactEmail}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-pf-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-pf-primary" />
                </div>
                <div>
                  <p className="text-xs pf-text-muted">이메일</p>
                  <p className="text-sm font-medium pf-text group-hover:text-pf-primary transition-colors">{portfolio.contactEmail}</p>
                </div>
              </a>
            )}
            {portfolio.contactPhone && (
              <a href={`tel:${portfolio.contactPhone}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-pf-secondary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-pf-secondary" />
                </div>
                <div>
                  <p className="text-xs pf-text-muted">전화</p>
                  <p className="text-sm font-medium pf-text group-hover:text-pf-secondary transition-colors">{portfolio.contactPhone}</p>
                </div>
              </a>
            )}
            {portfolio.website && (
              <a href={portfolio.website.startsWith("http") ? portfolio.website : `https://${portfolio.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-pf-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-pf-accent" />
                </div>
                <div>
                  <p className="text-xs pf-text-muted">웹사이트</p>
                  <p className="text-sm font-medium pf-text group-hover:text-pf-accent transition-colors">{portfolio.website}</p>
                </div>
              </a>
            )}
          </div>

          {/* 오른쪽: 소셜 링크 */}
          {hasSocial && (
            <div>
              <p className="text-xs font-semibold pf-text-muted uppercase tracking-wider mb-4">소셜 미디어</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(portfolio.socialLinks!).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full pf-surface pf-border border text-sm font-medium pf-text hover:border-pf-primary/40 hover:text-pf-primary transition-all"
                  >
                    {platform}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SHARED UI COMPONENTS
   ============================================================ */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl pf-gradient-bg flex items-center justify-center text-white">
        {icon}
      </div>
      <h2 className="pf-section-title">{title}</h2>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-pf-bg">
      <div className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Skeleton className="w-28 h-28 rounded-3xl mx-auto" />
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="flex justify-center gap-3 mt-6">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioNotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-pf-bg flex items-center justify-center">
        <div className="text-center space-y-4 animate-pf-fade-up">
          <div className="w-20 h-20 rounded-3xl pf-gradient-bg flex items-center justify-center mx-auto opacity-30">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold pf-text">포트폴리오를 찾을 수 없습니다</h1>
          <p className="pf-text-secondary">요청하신 포트폴리오가 존재하지 않거나 비공개 상태입니다.</p>
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full pf-gradient-bg text-white text-sm font-semibold mt-4 hover:shadow-lg transition-shadow">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </PageTransition>
  );
}
