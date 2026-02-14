import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Banknote,
  FileText,
  Calendar,
  Settings,
  LogOut,
  PieChart,
  DollarSign
} from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: Calendar, label: "Attendance", href: "/attendance" },
  { icon: Banknote, label: "Cash Advances", href: "/cash-advances" },
  { icon: DollarSign, label: "Payroll", href: "/payroll" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: PieChart, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar text-sidebar-foreground transition-transform">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
          <div className="h-8 w-8 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span>BALIBAD STORE</span>
        </div>
      </div>

      <div className="py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-current" : "text-sidebar-foreground/50 group-hover:text-current")} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-4 left-0 w-full px-4">
        <Link href="/">
          <a className="flex w-full items-center gap-2 rounded-md border border-sidebar-border px-4 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </Link>
      </div>
    </aside>
  );
}
