import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, UserCheck, Clock, CalendarOff, Plus, FileText, Banknote, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function AdminDashboard() {
    const stats = db.getDashboardStats();
    const attendanceData = db.getWeeklyAttendance();
    const recentActivity = db.getRecentActivity().slice(0, 50);
    const user = db.getCurrentUser();

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
                        trend="up"
                        trendValue="+2"
                    />
                    <StatsCard
                        title="On-Time Rate"
                        value={`${Math.round((stats.onTimeToday / (stats.onTimeToday + stats.lateToday || 1)) * 100)}%`}
                        description="Current shift status"
                        icon={UserCheck}
                        trend="up"
                        trendValue="+5%"
                    />
                    <StatsCard
                        title="Late Arrivals"
                        value={stats.lateToday.toString()}
                        description="Action required"
                        icon={Clock}
                        trend="down"
                        trendValue="-1"
                    />
                    <StatsCard
                        title="Absent Today"
                        value={stats.absentToday.toString()}
                        description="Team non-attendance"
                        icon={CalendarOff}
                        trend="neutral"
                        trendValue="Review"
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
                                <Link href="/payroll">
                                    <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all border-dashed">
                                        <Banknote className="h-6 w-6 text-primary" />
                                        <span className="text-xs">Process Payroll</span>
                                    </Button>
                                </Link>
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
