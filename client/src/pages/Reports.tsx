import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, Banknote, CalendarDays } from "lucide-react";

export default function Reports() {
    const users = db.getUsers();
    const attendance = db.getAttendance();
    const cashAdvances = db.getCashAdvanceRequests();

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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Attendance Stats
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    const attendanceData = [
        { name: 'Present', value: presentCount },
        { name: 'Late', value: lateCount },
        { name: 'Absent', value: absentCount },
    ];

    // Payroll Stats (Mocked monthly data based on current active salaries)
    const totalMonthlyPayroll = users.reduce((sum, user) => sum + (user.salary / 12), 0);
    const payrollData = [
        { name: 'Jan', amount: totalMonthlyPayroll * 0.98 },
        { name: 'Feb', amount: totalMonthlyPayroll * 0.99 },
        { name: 'Mar', amount: totalMonthlyPayroll },
        { name: 'Apr', amount: totalMonthlyPayroll * 1.02 }, // New hire
        { name: 'May', amount: totalMonthlyPayroll },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-heading font-bold tracking-tight">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Gain insights into your organization's performance.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalEmployees}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeEmployees}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{onLeaveEmployees}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Est. Monthly Payroll</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{totalMonthlyPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Department Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={departmentData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {departmentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payroll" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll History (Est.)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={payrollData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                                        <Legend />
                                        <Bar dataKey="amount" fill="#82ca9d" name="Total Payout" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
