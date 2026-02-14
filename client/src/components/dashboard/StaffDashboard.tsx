import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Clock, CalendarCheck, CalendarOff, History } from "lucide-react";
import { db, User } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StaffDashboardProps {
    user: User;
}

export function StaffDashboard({ user }: StaffDashboardProps) {
    // Mock data for staff dashboard
    const cashAdvances = db.getCashAdvanceRequests().filter(ca => ca.userId === user.id);

    const presentDays = db.getAttendance().filter(a => a.userId === user.id && a.status === 'present').length;
    const lateDays = db.getAttendance().filter(a => a.userId === user.id && a.status === 'late').length;
    const pendingAdvances = cashAdvances.filter(ca => ca.status === 'pending').length;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-heading font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h2>
                        <p className="text-muted-foreground">Here's your personal activity overview.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.position}</p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Attendance Rate"
                        value="98%"
                        description="Last 30 days"
                        icon={CalendarCheck}
                        trend="up"
                        trendValue="+1%"
                    />
                    <StatsCard
                        title="Days Present"
                        value={presentDays.toString()}
                        description="This month"
                        icon={Clock}
                        trend="neutral"
                        trendValue="Same"
                    />
                    <StatsCard
                        title="Late Arrivals"
                        value={lateDays.toString()}
                        description="This month"
                        icon={History}
                        trend={lateDays > 0 ? "down" : "neutral"}
                        trendValue={lateDays > 0 ? "+1" : "0"}
                    />
                    <StatsCard
                        title="Cash Advances"
                        value={pendingAdvances.toString()}
                        description="Pending requests"
                        icon={CalendarOff}
                        trend="neutral"
                        trendValue="Active"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Attendance</CardTitle>
                            <CardDescription>Your check-in/out history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {db.getAttendance().filter(a => a.userId === user.id).slice(0, 5).map((record) => (
                                    <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{record.status}</span>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="text-green-600">In: {record.timeIn}</div>
                                            {record.timeOut && <div className="text-muted-foreground">Out: {record.timeOut}</div>}
                                        </div>
                                    </div>
                                ))}
                                {db.getAttendance().filter(a => a.userId === user.id).length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">No attendance records found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cash Advances</CardTitle>
                            <CardDescription>Your cash advance requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cashAdvances.slice(0, 5).map((req) => (
                                    <div key={req.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium capitalize">{req.purpose}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(req.requestDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">
                                                ₱{req.amount.toLocaleString()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {cashAdvances.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">No cash advance requests found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
