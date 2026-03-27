import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold gradient-text mb-2">404</h1>
        <p className="text-muted-foreground text-lg mb-8">페이지를 찾을 수 없습니다</p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
