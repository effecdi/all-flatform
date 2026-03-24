import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user } = useAuth();
  const logout = useLogout();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">All-Flatform</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div className="relative px-3 py-1.5">
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout.mutate()}
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    location === item.href
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </div>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { logout.mutate(); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
