import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, UserCheck, Clock, CalendarOff, Plus, FileText, Banknote, ShieldCheck, Loader2 } from "lucide-react";
import { db } from "@/lib/db";
import { useMemo } from "react";
import { useUsers, useAttendance, useActivityLogs } from "@/hooks/use-hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function AdminDashboard() {
    const { data: users = [], isLoading: isLoadingUsers } = useUsers();
    const { data: attendance = [], isLoading: isLoadingAttendance } = useAttendance();
    const { data: activityLogs = [], isLoading: isLoadingActivities } = useActivityLogs();
    const user = db.getCurrentUser();

    const today = new Date().toISOString().split('T')[0];

    const stats = useMemo(() => {
        const employeeIds = users.filter(u => u.isEmployee).map(u => u.id);
        const totalEmployees = employeeIds.length;
        const todaysAttendance = attendance.filter(a => a.date === today && employeeIds.includes(a.userId));
        const onTimeToday = todaysAttendance.filter(a => a.status === 'present').length;
        const lateToday = todaysAttendance.filter(a => a.status === 'late').length;
        const absentToday = Math.max(0, users.filter(u => u.status === 'active' && u.isEmployee).length - todaysAttendance.length);

        return { totalEmployees, onTimeToday, lateToday, absentToday };
    }, [users, attendance, today]);

    const attendanceData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return last7Days.map(dateStr => {
            const date = new Date(dateStr);
            const dayName = dayNames[date.getDay()];
            const employeeIds = users.filter(u => u.isEmployee).map(u => u.id);
            const dayAttendance = attendance.filter(a => a.date === dateStr && employeeIds.includes(a.userId));

            return {
                day: dayName,
                present: dayAttendance.filter(a => a.status === 'present').length,
                late: dayAttendance.filter(a => a.status === 'late').length,
                absent: Math.max(0, users.filter(u => u.status === 'active' && u.isEmployee).length - dayAttendance.length)
            };
        });
    }, [users, attendance]);

    const recentActivity = useMemo(() => activityLogs.slice(0, 50), [activityLogs]);

    if (isLoadingUsers || isLoadingAttendance || isLoadingActivities) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
    }

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in slide-in-from-left duration-500">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">System Live</span>
                        </div>
                        <h2 className="text-4xl font-heading font-bold tracking-tight text-primary flex items-center gap-3">
                            Welcome back, {user.role === 'admin' ? 'Administrator' : 'HR Manager'} {user.name}
                            <ShieldCheck className="h-6 w-6 text-primary/40" />
                        </h2>
                        <p className="text-muted-foreground text-lg">Central hub for BALIBAD STORE operations.</p>
                    </div>

                    <div className="flex items-center gap-3 animate-in slide-in-from-right duration-500">
                        <Link href="/employees">
                            <Button className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Plus className="mr-2 h-4 w-4" /> Add Employee
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Active Team"
                        value={stats.totalEmployees.toString()}
                        description="Across all branches"
                        icon={Users}
                    />
                    <StatsCard
                        title="On-Time Rate"
                        value={`${Math.round((stats.onTimeToday / (stats.onTimeToday + stats.lateToday || 1)) * 100)}%`}
                        description="Current shift status"
                        icon={UserCheck}
                    />
                    <StatsCard
                        title="Late Arrivals"
                        value={stats.lateToday.toString()}
                        description="Action required"
                        icon={Clock}
                    />
                    <StatsCard
                        title="Absent Today"
                        value={stats.absentToday.toString()}
                        description="Team non-attendance"
                        icon={CalendarOff}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    {/* Main Chart Column */}
                    <div className="md:col-span-4 space-y-6">
                        <AttendanceChart data={attendanceData} />

                        {/* Quick Actions Card */}
                        <Card className="border-none shadow-premium bg-gradient-to-br from-primary/5 to-transparent">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Priority Operations</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Link href="/attendance">
                                    <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all border-dashed">
                                        <Clock className="h-6 w-6 text-primary" />
                                        <span className="text-xs">View Logs</span>
                                    </Button>
                                </Link>
                                <Link href="/documents">
                                    <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all border-dashed">
                                        <FileText className="h-6 w-6 text-primary" />
                                        <span className="text-xs">Archives</span>
                                    </Button>
                                </Link>
                                <Link href="/settings">
                                    <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all border-dashed">
                                        <Users className="h-6 w-6 text-primary" />
                                        <span className="text-xs">Staff Roles</span>
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="md:col-span-3">
                        <RecentActivity activities={recentActivity} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
