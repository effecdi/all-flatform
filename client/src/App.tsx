import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

import DashboardPage from "@/pages/dashboard";
import AccountsPage from "@/pages/accounts";
import SubscriptionsPage from "@/pages/subscriptions";
import DeleteGuidePage from "@/pages/delete-guide";
import AutoDiscoverPage from "@/pages/auto-discover";
import ScreenRecordingPage from "@/pages/screen-recording";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/accounts" component={AccountsPage} />
      <Route path="/subscriptions" component={SubscriptionsPage} />
      <Route path="/delete-guide" component={DeleteGuidePage} />
      <Route path="/auto-discover" component={AutoDiscoverPage} />
      <Route path="/screen-recording" component={ScreenRecordingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Router />
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
