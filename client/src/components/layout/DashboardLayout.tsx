import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/40 font-sans">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="container mx-auto p-6 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
