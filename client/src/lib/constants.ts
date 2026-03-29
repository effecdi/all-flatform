import {
  LayoutDashboard,
  Landmark,
  TrendingUp,
  Sparkles,
  Search,
  Bookmark,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "대시보드", href: "/", icon: LayoutDashboard },
  { label: "정부지원사업", href: "/programs/government", icon: Landmark },
  { label: "투자유치", href: "/programs/investment", icon: TrendingUp },
  { label: "AI 추천", href: "/recommendations", icon: Sparkles },
  { label: "사업 검색", href: "/discover", icon: Search },
  { label: "북마크", href: "/bookmarks", icon: Bookmark },
] as const;
