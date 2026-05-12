import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="sm:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-foreground tracking-tight block leading-tight">All-Flatform</span>
                <span className="text-[11px] text-muted-foreground font-medium">정부지원 & 투자유치</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px]">
              정부지원사업과 투자유치 정보를 한 곳에서 탐색하고, AI 맞춤 추천으로 최적의 기회를 찾아보세요.
            </p>
          </div>

          {/* Quick links */}
          <div className="sm:col-span-4">
            <h4 className="section-number mb-4">서비스</h4>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-muted-foreground">
              <Link href="/programs/government" className="hover:text-foreground transition-colors w-fit">
                정부지원사업
              </Link>
              <Link href="/programs/investment" className="hover:text-foreground transition-colors w-fit">
                투자유치
              </Link>
              <Link href="/recommendations" className="hover:text-foreground transition-colors w-fit">
                AI 맞춤 추천
              </Link>
              <Link href="/discover" className="hover:text-foreground transition-colors w-fit">
                통합 검색
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="sm:col-span-3">
            <h4 className="section-number mb-4">지원</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link href="/settings" className="hover:text-foreground transition-colors w-fit">
                설정
              </Link>
              <Link href="/onboarding" className="hover:text-foreground transition-colors w-fit">
                사업 프로필
              </Link>
              <Link href="/bookmarks" className="hover:text-foreground transition-colors w-fit">
                북마크
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} All-Flatform. All rights reserved.</p>
          <p>정부지원사업 & 투자유치 통합 탐색 플랫폼</p>
        </div>
      </div>
    </footer>
  );
}
