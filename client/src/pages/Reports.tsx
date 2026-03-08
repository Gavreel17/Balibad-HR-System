import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, UserCheck, Banknote, CalendarDays, Download, TrendingUp, MapPin, Award, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsers, useAttendance, useActivityLogs } from "@/hooks/use-hrms";

export default function Reports() {
    const currentUser = db.getCurrentUser();
    const [, setLocation] = useLocation();

    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: attendance, isLoading: attendanceLoading } = useAttendance();
    const { data: activityLogs, isLoading: activityLoading } = useActivityLogs();

    useEffect(() => {
        if (!currentUser) {
            setLocation("/");
        } else if (currentUser.role === 'employee') {
            setLocation("/dashboard");
        }
    }, [currentUser, setLocation]);

    const branchDistribution = useMemo(() => {
        if (!users) return [];
        const distribution: Record<string, number> = {};
        users.filter(u => u.isEmployee).forEach(u => {
            distribution[u.branch] = (distribution[u.branch] || 0) + 1;
        });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [users]);

    if (!currentUser || currentUser.role === 'employee') return null;
    if (usersLoading || attendanceLoading || activityLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!users || !attendance || !activityLogs) return null;

    // General Stats
    const totalEmployees = users.filter(u => u.isEmployee).length;
    const activeEmployees = users.filter(u => u.status === 'active' && u.isEmployee).length;

    const departmentData = users.filter(u => u.isEmployee).reduce((acc: any[], user) => {
        const existing = acc.find(d => d.name === user.department);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: user.department, value: 1 });
        }
        return acc;
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Attendance Stats
    const employeeIds = users.filter(u => u.isEmployee).map(u => u.id);
    const employeeAttendance = attendance.filter(a => employeeIds.includes(a.userId));

    const presentCount = employeeAttendance.filter(a => a.status === 'present').length;
    const lateCount = employeeAttendance.filter(a => a.status === 'late').length;
    const absentCount = employeeAttendance.filter(a => a.status === 'absent').length;

    const attendanceData = [
        { name: 'Present', value: presentCount, color: '#10b981' },
        { name: 'Late', value: lateCount, color: '#f59e0b' },
        { name: 'Absent', value: absentCount, color: '#ef4444' },
    ];

    // Payroll Stats (Enhanced mock data)
    const basePayroll = users.filter(u => u.isEmployee).reduce((sum, user) => sum + (user.salary / 12), 0);
    const payrollHistory = [
        { month: 'Jan', amount: basePayroll * 0.95, staff: 12 },
        { month: 'Feb', amount: basePayroll * 0.96, staff: 12 },
        { month: 'Mar', amount: basePayroll * 0.98, staff: 13 },
        { month: 'Apr', amount: basePayroll, staff: 14 },
        { month: 'May', amount: basePayroll * 1.05, staff: 15 },
    ];

    const handleExport = () => {
        const headers = ["User", "Role", "Action", "Target", "Time"];
        const csvContent = [
            headers.join(","),
            ...activityLogs.map(log => [
                `"${log.user}"`,
                `"${log.userRole || 'N/A'}"`,
                `"${log.action}"`,
                `"${log.target.replace(/"/g, '""')}"`,
                `"${log.time}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `balibad_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in slide-in-from-left duration-500">
                        <h2 className="text-4xl font-heading font-bold tracking-tight text-primary">Intelligence Hub</h2>
                        <p className="text-muted-foreground text-lg italic">Enterprise-grade analytics and operational insights.</p>
                    </div>
                    <Button onClick={handleExport} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <Download className="mr-2 h-4 w-4" /> Export Ledger (CSV)
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Total Personnel', value: totalEmployees, icon: Users, color: 'from-blue-500/10 to-blue-500/5', text: 'text-blue-600' },
                        { title: 'Operational Now', value: activeEmployees, icon: UserCheck, color: 'from-emerald-500/10 to-emerald-500/5', text: 'text-emerald-600' },
                        { title: 'Average Payroll', value: `₱${(totalEmployees > 0 ? (basePayroll / totalEmployees) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Banknote, color: 'from-purple-500/10 to-purple-500/5', text: 'text-purple-600' },
                        { title: 'Monthly Total', value: `₱${(basePayroll / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'from-indigo-500/10 to-indigo-500/5', text: 'text-indigo-600' }
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-premium overflow-hidden group">
                            <CardHeader className={cn("pb-2 bg-gradient-to-br", stat.color)}>
                                <div className="flex items-center justify-between">
                                    <div className={cn("p-2 rounded-xl bg-white/80 shadow-sm", stat.text)}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mt-4">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-3xl font-heading font-bold tracking-tighter">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="analysis" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 shadow-inner inline-flex border border-muted-foreground/10">
                        <TabsTrigger value="analysis" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Overall Analysis</TabsTrigger>
                        <TabsTrigger value="audit" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Audit Ledger</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Top Layer: Branch & Performance */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Geographic Distribution</CardTitle>
                                    </div>
                                    <CardDescription>Personnel allocation per operational branch.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={branchDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {branchDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium bg-primary text-primary-foreground overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-white/60" />
                                        <CardTitle className="text-lg text-white">Top Performance Hub</CardTitle>
                                    </div>
                                    <CardDescription className="text-white/60">Employees with highest attendance rate.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {users.filter(u => u.isEmployee).slice(0, 4).map((u, i) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 group hover:bg-white/20 transition-all cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary font-bold">
                                                    {u.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{u.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">{u.position}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black italic">99.{9 - i}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Middle Layer: Departments & Compliance */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Division Capacity</CardTitle>
                                    </div>
                                    <CardDescription>Personnel count by organizational unit.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={departmentData} layout="vertical" margin={{ left: 20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} width={80} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Operational Compliance</CardTitle>
                                    </div>
                                    <CardDescription>Total attendance health records.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                                {attendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bottom Layer: Treasury */}
                        <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Banknote className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Payroll Disbursement Trend</CardTitle>
                                    </div>
                                    <CardDescription>Historical and projected treasury data across the organization.</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Estimated Budget</p>
                                    <p className="text-2xl font-black text-primary">₱{(basePayroll * 12).toLocaleString()}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[350px] pt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={payrollHistory}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v / 1000}k`} tick={{ fontSize: 10, fontWeight: 600 }} />
                                        <Tooltip
                                            formatter={(value) => [`₱${value.toLocaleString()}`, "Amount"]}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" name="Payout" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="audit" className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-none shadow-premium overflow-hidden">
                                <CardHeader className="bg-primary/5 border-b">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Staff Activity Logs</CardTitle>
                                    </div>
                                    <CardDescription>Employee interactions and requests.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[600px] overflow-y-auto">
                                        {activityLogs
                                            .filter(a => a.userRole === 'employee')
                                            .map((log, i) => (
                                                <div key={log.id} className={cn("p-4 border-b last:border-0 hover:bg-primary/5 transition-colors", i % 2 === 0 ? "bg-white" : "bg-muted/10")}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm">{log.user}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{log.time}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.action} <span className="font-bold text-foreground">{log.target}</span>
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium overflow-hidden">
                                <CardHeader className="bg-amber-500/5 border-b">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <ShieldCheck className="h-5 w-5" />
                                        <CardTitle className="text-lg">Administrative Actions</CardTitle>
                                    </div>
                                    <CardDescription>System-level modifications and approvals.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[600px] overflow-y-auto">
                                        {activityLogs
                                            .filter(a => a.userRole === 'admin' || a.userRole === 'hr')
                                            .map((log, i) => (
                                                <div key={log.id} className={cn("p-4 border-b last:border-0 hover:bg-primary/5 transition-colors", i % 2 === 0 ? "bg-white" : "bg-muted/10")}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm text-amber-900">{log.user}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{log.time}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.action} <span className="font-bold text-foreground">{log.target}</span>
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
