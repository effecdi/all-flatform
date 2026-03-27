import { Link, useLocation } from "wouter";
import { Menu, X, Layers, Settings, Sun, Moon, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { data: user } = useAuth();
  const qc = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      qc.setQueryData(["/api/auth/me"], null);
      qc.clear();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <nav ref={menuRef} className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-primary to-invest-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
              All-Flatform
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center bg-secondary/60 rounded-xl p-1 border border-border/30">
            {NAV_ITEMS.map((item) => {
              const active =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                      active
                        ? "bg-card text-foreground font-medium shadow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={toggle}
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-9 h-9 rounded-xl hidden lg:inline-flex",
                  location === "/settings"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl hidden lg:inline-flex text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
                onClick={handleLogout}
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    active
                      ? "bg-primary/10 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          <Link href="/settings">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                location === "/settings"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Settings className="w-4 h-4" />
              설정
            </div>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
