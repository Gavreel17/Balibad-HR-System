import { useState, useEffect } from "react";
import { useLocation } from "wouter";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, UserCheck, Banknote, CalendarDays, Download, TrendingUp, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Reports() {
    const currentUser = db.getCurrentUser();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!currentUser) {
            setLocation("/");
        } else if (currentUser.role === 'employee') {
            setLocation("/dashboard");
        }
    }, [currentUser, setLocation]);

    if (!currentUser || currentUser.role === 'employee') return null;

    const users = db.getUsers();
    const attendance = db.getAttendance();
    const branchDistribution = db.getBranchDistribution();

    // General Stats
    const totalEmployees = users.length;
    const activeEmployees = users.filter(u => u.status === 'active').length;
    const onLeaveEmployees = users.filter(u => u.status === 'on_leave').length;

    const departmentData = users.reduce((acc: any[], user) => {
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
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    const attendanceData = [
        { name: 'Present', value: presentCount, color: '#10b981' },
        { name: 'Late', value: lateCount, color: '#f59e0b' },
        { name: 'Absent', value: absentCount, color: '#ef4444' },
    ];

    // Payroll Stats (Enhanced mock data)
    const basePayroll = users.reduce((sum, user) => sum + (user.salary / 12), 0);
    const payrollHistory = [
        { month: 'Jan', amount: basePayroll * 0.95, staff: 12 },
        { month: 'Feb', amount: basePayroll * 0.96, staff: 12 },
        { month: 'Mar', amount: basePayroll * 0.98, staff: 13 },
        { month: 'Apr', amount: basePayroll, staff: 14 },
        { month: 'May', amount: basePayroll * 1.05, staff: 15 },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in slide-in-from-left duration-500">
                        <h2 className="text-4xl font-heading font-bold tracking-tight text-primary">Intelligence Hub</h2>
                        <p className="text-muted-foreground text-lg italic">Enterprise-grade analytics and operational insights.</p>
                    </div>
                    <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                        <Download className="mr-2 h-4 w-4" /> Export Ledger (PDF)
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Total Personnel', value: totalEmployees, icon: Users, color: 'from-blue-500/10 to-blue-500/5', text: 'text-blue-600' },
                        { title: 'Operational Now', value: activeEmployees, icon: UserCheck, color: 'from-emerald-500/10 to-emerald-500/5', text: 'text-emerald-600' },
                        { title: 'On Regular Leave', value: onLeaveEmployees, icon: CalendarDays, color: 'from-amber-500/10 to-amber-500/5', text: 'text-amber-600' },
                        { title: 'Payroll estimate', value: `₱${(basePayroll / 1000).toFixed(1)}k`, icon: Banknote, color: 'from-purple-500/10 to-purple-500/5', text: 'text-purple-600' }
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

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 shadow-inner inline-flex border border-muted-foreground/10">
                        <TabsTrigger value="overview" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Overview</TabsTrigger>
                        <TabsTrigger value="departments" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Divisions</TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Logistics</TabsTrigger>
                        <TabsTrigger value="financials" className="rounded-xl px-8 font-bold data-[state=active]:shadow-md">Financials</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-6 md:grid-cols-2 h-[450px]">
                            <Card className="border-none shadow-premium">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" /> Branch Distribution
                                    </CardTitle>
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
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Award className="h-5 w-5 text-white/60" /> Top Performer Hub
                                    </CardTitle>
                                    <CardDescription className="text-white/60">Employees with highest attendance rate.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {users.slice(0, 3).map((u, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 group hover:bg-white/20 transition-all cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary font-bold">
                                                    {u.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{u.name}</p>
                                                    <p className="text-xs text-white/50">{u.position}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold">99.2%</span>
                                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Rate</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="departments" className="space-y-4 animate-in fade-in duration-500">
                        <Card className="border-none shadow-premium">
                            <CardHeader>
                                <CardTitle>Department Capacity Analysis</CardTitle>
                                <CardDescription>Personnel count by organizational unit.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentData} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="space-y-4 animate-in fade-in duration-500">
                        <Card className="border-none shadow-premium">
                            <CardHeader>
                                <CardTitle>Operational Compliance</CardTitle>
                                <CardDescription>Total attendance health records.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                                            {attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financials" className="space-y-4 animate-in fade-in duration-500">
                        <Card className="border-none shadow-premium">
                            <CardHeader>
                                <CardTitle>Bi-Annual Payroll Disbursement</CardTitle>
                                <CardDescription>Historical and projected treasury data.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={payrollHistory}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₱${v / 1000}k`} />
                                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" name="Payout" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
