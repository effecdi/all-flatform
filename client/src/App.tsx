import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

import DashboardPage from "@/pages/dashboard";
import OnboardingPage from "@/pages/onboarding";
import GovProgramsPage from "@/pages/gov-programs";
import InvestmentProgramsPage from "@/pages/investment-programs";
import ProgramDetailPage from "@/pages/program-detail";
import RecommendationsPage from "@/pages/recommendations";
import BookmarksPage from "@/pages/bookmarks";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/programs/government" component={GovProgramsPage} />
            <Route path="/programs/investment" component={InvestmentProgramsPage} />
            <Route path="/programs/government/:id" component={ProgramDetailPage} />
            <Route path="/programs/investment/:id" component={ProgramDetailPage} />
            <Route path="/recommendations" component={RecommendationsPage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
