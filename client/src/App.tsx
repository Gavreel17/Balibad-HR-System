import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Documents from "@/pages/Documents";
import Payroll from "@/pages/Payroll";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/documents" component={Documents} />
      <Route path="/payroll" component={Payroll} />
      
      {/* Placeholder pages for routes that don't have dedicated files yet */}
      <Route path="/attendance">{(params) => <Dashboard />}</Route>
      <Route path="/leave">{(params) => <Dashboard />}</Route>
      <Route path="/reports">{(params) => <Dashboard />}</Route>
      <Route path="/settings">{(params) => <Dashboard />}</Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
