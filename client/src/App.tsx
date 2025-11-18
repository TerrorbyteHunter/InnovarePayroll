import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";

import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Payroll from "@/pages/payroll";
import Payslips from "@/pages/payslips";
import Reports from "@/pages/reports";
import Leave from "@/pages/leave";
import Advances from "@/pages/advances";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  // Check authentication on mount and location changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      
      // Redirect to login if not authenticated and not on public routes
      if (!token && location !== "/login" && location !== "/register") {
        setLocation("/login");
      }
    }
  }, [location, setLocation]);

  // Public routes (no sidebar)
  if (location === "/login" || location === "/register") {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }

  // Show loading while checking auth
  if (isAuthenticated === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to login handled in useEffect, show loading
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  // Protected routes (with sidebar)
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
      } as React.CSSProperties}
    >
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-2 p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/employees" component={Employees} />
              <Route path="/payroll" component={Payroll} />
              <Route path="/payslips" component={Payslips} />
              <Route path="/reports" component={Reports} />
              <Route path="/leave" component={Leave} />
              <Route path="/advances" component={Advances} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
