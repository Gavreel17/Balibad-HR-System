import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, UserCheck, Clock, CalendarOff } from "lucide-react";
import { db } from "@/lib/db";

export function AdminDashboard() {
    const stats = db.getDashboardStats();
    const attendanceData = db.getWeeklyAttendance();
    const recentActivity = db.getRecentActivity();
    const user = db.getCurrentUser();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-heading font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h2>
                    <p className="text-muted-foreground">Overview of company performance and employee status.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Employees"
                        value={stats.totalEmployees.toString()}
                        description="Active employees"
                        icon={Users}
                        trend="up"
                        trendValue="+2"
                    />
                    <StatsCard
                        title="On Time Today"
                        value={stats.onTimeToday.toString()}
                        description="Present employees"
                        icon={UserCheck}
                        trend="up"
                        trendValue="+5%"
                    />
                    <StatsCard
                        title="Late Arrivals"
                        value={stats.lateToday.toString()}
                        description="Needs attention"
                        icon={Clock}
                        trend="down"
                        trendValue="-1"
                    />
                    <StatsCard
                        title="Cash Advances"
                        value={stats.pendingAdvances.toString()}
                        description="Pending approval"
                        icon={CalendarOff}
                        trend="neutral"
                        trendValue="Active"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-7">
                    <AttendanceChart data={attendanceData} />
                    <RecentActivity activities={recentActivity} />
                </div>
            </div>
        </DashboardLayout>
    );
}
