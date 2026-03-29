import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl hero-gradient flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-foreground tracking-tight block leading-tight">All-Flatform</span>
                <span className="text-xs text-muted-foreground">정부지원 & 투자유치</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px]">
              정부지원사업과 투자유치 정보를 한 곳에서 탐색하고, AI 맞춤 추천으로 최적의 기회를 찾아보세요.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">서비스</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
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
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">지원</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
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

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} All-Flatform. All rights reserved.</p>
          <p className="font-medium">정부지원사업 & 투자유치 통합 탐색 플랫폼</p>
        </div>
      </div>
    </footer>
  );
}
