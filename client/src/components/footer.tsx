import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gov-primary to-invest-primary flex items-center justify-center shadow-sm">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">All-Flatform</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
              정부지원사업과 투자유치 정보를 한 곳에서 탐색하고, AI 맞춤 추천으로 최적의 기회를 찾아보세요.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">서비스</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/programs/government" className="hover:text-foreground transition-colors w-fit">
                정부지원사업
              </Link>
              <Link href="/programs/investment" className="hover:text-foreground transition-colors w-fit">
                투자유치 프로그램
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
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">지원</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/settings" className="hover:text-foreground transition-colors w-fit">
                설정
              </Link>
              <Link href="/onboarding" className="hover:text-foreground transition-colors w-fit">
                사업 프로필 작성
              </Link>
              <Link href="/bookmarks" className="hover:text-foreground transition-colors w-fit">
                저장한 프로그램
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} All-Flatform. All rights reserved.</p>
          <p>정부지원사업 & 투자유치 통합 탐색 플랫폼</p>
        </div>
      </div>
    </footer>
  );
}
