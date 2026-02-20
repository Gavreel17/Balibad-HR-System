import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Clock, CalendarCheck, CalendarOff, History, Wallet, Plane, Gift, ArrowRight } from "lucide-react";
import { db, User } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CashAdvanceRequest } from "@/lib/db";

const MySwal = withReactContent(Swal);

interface StaffDashboardProps {
    user: User;
}

export function StaffDashboard({ user }: StaffDashboardProps) {
    const [cashAdvances, setCashAdvances] = useState(() => db.getCashAdvanceRequests().filter(ca => ca.userId === user.id));
    const presentDays = db.getAttendance().filter(a => a.userId === user.id && a.status === 'present').length;
    const lateDays = db.getAttendance().filter(a => a.userId === user.id && a.status === 'late').length;
    const pendingAdvances = cashAdvances.filter(ca => ca.status === 'pending').length;
    const leaveBalance = db.getLeaveBalance(user.id);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        amount: '',
        purpose: ''
    });

    const handleSubmitRequest = () => {
        if (!newRequest.amount || !newRequest.purpose) {
            MySwal.fire('Error', 'Please fill in all fields', 'error');
            return;
        }

        const request: CashAdvanceRequest = {
            id: `ca-${Date.now()}`,
            userId: user.id,
            amount: parseFloat(newRequest.amount),
            purpose: newRequest.purpose,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        db.addCashAdvanceRequest(request);
        setCashAdvances(db.getCashAdvanceRequests().filter(ca => ca.userId === user.id));

        // Send notification to admin if requested by non-admin
        if (user.role !== 'admin') {
            db.addActivity({
                type: 'cash_advance',
                avatar: user.name.split(' ').map((n: string) => n[0]).join(''),
                user: user.name,
                action: 'requested',
                target: `cash advance of ₱${request.amount.toLocaleString()}`,
                time: 'Just now'
            });
        }

        setNewRequest({ amount: '', purpose: '' });
        setIsDialogOpen(false);

        MySwal.fire({
            title: 'Success!',
            text: 'Cash advance request submitted.',
            icon: 'success'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Personalized Welcome */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-primary to-primary-foreground text-white shadow-xl shadow-primary/20">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <Avatar className="h-24 w-24 border-4 border-white/20 shadow-inner">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl bg-white/10 text-white font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-4xl font-heading font-bold tracking-tight">Mabuhay, {user.name}!</h2>
                            <p className="text-white/80 text-lg mt-1 font-medium">{user.position} • {user.branch} Branch</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/attendance">
                            <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl px-8 h-12">
                                Daily Log
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Monthly Attendance"
                        value="98.5%"
                        description="Excellent consistency"
                        icon={CalendarCheck}
                        trend="up"
                        trendValue="+0.5%"
                    />
                    <StatsCard
                        title="Days On-Site"
                        value={presentDays.toString()}
                        description="Current billing cycle"
                        icon={Clock}
                        trend="neutral"
                        trendValue="Active"
                    />
                    <StatsCard
                        title="Late Records"
                        value={lateDays.toString()}
                        description="Needs improvement"
                        icon={History}
                        trend={lateDays > 0 ? "down" : "neutral"}
                        trendValue={lateDays > 0 ? "+1" : "0"}
                    />
                    <StatsCard
                        title="Cash Requests"
                        value={pendingAdvances.toString()}
                        description="Processing status"
                        icon={Wallet}
                        trend="neutral"
                        trendValue="Pending"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Leave & Progress */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-premium bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Plane className="h-5 w-5 text-indigo-600" />
                                        <CardTitle className="text-lg">Leave Credits</CardTitle>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{leaveBalance.total - leaveBalance.used} Left</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Vacation & Sick Leave</span>
                                        <span className="font-bold">{leaveBalance.used} / {leaveBalance.total} Days</span>
                                    </div>
                                    <Progress value={(leaveBalance.used / leaveBalance.total) * 100} className="h-2 bg-indigo-100" />
                                </div>
                                <Button variant="secondary" className="w-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none">
                                    Request Time Off
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium overflow-hidden">
                            <CardHeader className="bg-amber-50 dark:bg-amber-900/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-amber-600" />
                                    <CardTitle className="text-lg">Upcoming Holiday</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl text-center min-w-[60px]">
                                        <span className="block text-xs font-bold uppercase">Feb</span>
                                        <span className="text-2xl font-bold">25</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-900 dark:text-amber-100">EDSA People Power Revolution Anniversary</p>
                                        <p className="text-xs text-amber-700/70 mt-1 font-medium italic">Regular Holiday</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Column: Attendance History */}
                    <Card className="border-none shadow-premium">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Daily Logs</CardTitle>
                                <CardDescription>Recent check-ins</CardDescription>
                            </div>
                            <Link href="/attendance">
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                                    View All <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {db.getAttendance().filter(a => a.userId === user.id).slice(0, 5).map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{record.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-foreground">In: {record.timeIn}</div>
                                            {record.timeOut && <div className="text-[10px] text-muted-foreground font-medium">Out: {record.timeOut}</div>}
                                        </div>
                                    </div>
                                ))}
                                {db.getAttendance().filter(a => a.userId === user.id).length === 0 && (
                                    <div className="text-center py-10 space-y-2">
                                        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                            <History className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">No recent logs found.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Cash Advances */}
                    <Card className="border-none shadow-premium">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Financial Status</CardTitle>
                                <CardDescription>Cash requests</CardDescription>
                            </div>
                            <Link href="/cash-advances">
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                                    History <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="ml-2 gap-1 shadow-md">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Request</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Cash Advance</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="amount" className="text-right">
                                                Amount (₱)
                                            </Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                value={newRequest.amount}
                                                onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                                                className="col-span-3"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="purpose" className="text-right">
                                                Purpose
                                            </Label>
                                            <Textarea
                                                id="purpose"
                                                value={newRequest.purpose}
                                                onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                                                className="col-span-3"
                                                placeholder="Reason for request..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSubmitRequest}>Submit Request</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cashAdvances.slice(0, 5).map((req) => (
                                    <div key={req.id} className="p-4 rounded-2xl border bg-muted/30 border-muted/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm block truncate w-32 capitalize">{req.purpose}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'}`}
                                            >
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <span className="text-[10px] text-muted-foreground font-bold">₱{req.amount.toLocaleString()}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{new Date(req.requestDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {cashAdvances.length === 0 && (
                                    <div className="text-center py-10 space-y-2">
                                        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                            <Wallet className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">No cash advances yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
