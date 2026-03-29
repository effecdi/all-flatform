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
    <nav ref={menuRef} className="fixed top-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-md border-b border-border/60 shadow-soft">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center shadow-sm">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-base text-foreground hidden sm:block tracking-tight">
              All-Flatform
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                location === item.href ||
                (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary dark:text-primary-light"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
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
                  "w-9 h-9 rounded-lg hidden lg:inline-flex",
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
                className="w-9 h-9 rounded-lg hidden lg:inline-flex text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
                onClick={handleLogout}
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-card border-t border-border/60 px-5 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary dark:text-primary-light"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          <Link href="/settings">
            <div
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                location === "/settings"
                  ? "bg-primary/10 text-primary dark:text-primary-light"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Settings className="w-4.5 h-4.5" />
              설정
            </div>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all duration-150 w-full text-left"
            >
              <LogOut className="w-4.5 h-4.5" />
              로그아웃
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
