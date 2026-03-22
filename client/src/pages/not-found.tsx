import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold font-heading gradient-text mb-4">404</h1>
        <p className="text-muted-foreground mb-6">페이지를 찾을 수 없습니다</p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
