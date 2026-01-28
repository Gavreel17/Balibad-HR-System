import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, UserCheck, Clock, CalendarOff } from "lucide-react";
import { db } from "@/lib/db";

export default function Dashboard() {
  const users = db.getUsers();
  const activeEmployees = users.filter(u => u.status === 'active').length;
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Employees" 
            value={users.length.toString()} 
            description="Active employees" 
            icon={Users} 
            trend="up"
            trendValue="+2"
          />
          <StatsCard 
            title="On Time Today" 
            value="42" 
            description="95% attendance rate" 
            icon={UserCheck} 
            trend="up"
            trendValue="+5%"
          />
          <StatsCard 
            title="Late Arrivals" 
            value="3" 
            description="Needs attention" 
            icon={Clock} 
            trend="down"
            trendValue="-1"
          />
          <StatsCard 
            title="On Leave" 
            value="4" 
            description="Approved leaves" 
            icon={CalendarOff} 
            trend="neutral"
            trendValue="Same"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <AttendanceChart />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
}
