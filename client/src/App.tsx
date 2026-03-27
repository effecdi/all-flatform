import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";

import DashboardPage from "@/pages/dashboard";
import OnboardingPage from "@/pages/onboarding";
import GovProgramsPage from "@/pages/gov-programs";
import InvestmentProgramsPage from "@/pages/investment-programs";
import ProgramDetailPage from "@/pages/program-detail";
import RecommendationsPage from "@/pages/recommendations";
import DiscoverPage from "@/pages/discover";
import BookmarksPage from "@/pages/bookmarks";
import SettingsPage from "@/pages/settings";
import PortfolioEditPage from "@/pages/portfolio-edit";
import PortfolioViewPage from "@/pages/portfolio-view";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  // 공개 포트폴리오 뷰에서는 Navbar/Footer 숨김 (독립 디자인)
  const isPortfolioView =
    location.startsWith("/portfolio/") &&
    location !== "/portfolio/edit";

  if (isPortfolioView) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/programs/government" component={GovProgramsPage} />
            <Route path="/programs/investment" component={InvestmentProgramsPage} />
            <Route path="/programs/government/:id" component={ProgramDetailPage} />
            <Route path="/programs/investment/:id" component={ProgramDetailPage} />
            <Route path="/recommendations" component={RecommendationsPage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/portfolio/edit" component={PortfolioEditPage} />
            <Route path="/portfolio/preview" component={PortfolioViewPage} />
            <Route path="/portfolio/:slug" component={PortfolioViewPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
