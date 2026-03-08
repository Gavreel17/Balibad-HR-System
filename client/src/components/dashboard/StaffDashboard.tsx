import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Clock, CalendarCheck, CalendarOff, History, Wallet, Plane, Gift, ArrowRight, Loader2 } from "lucide-react";
import { db, User } from "@/lib/db";
import { useMemo, useEffect } from "react";
import { useAttendance, useCashAdvances, useHRMSMutations } from "@/hooks/use-hrms";
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
    const { data: attendance = [], isLoading: isLoadingAttendance } = useAttendance();
    const { data: allCashAdvances = [], isLoading: isLoadingAdvances } = useCashAdvances();
    const { addCashAdvanceRequest, addActivity } = useHRMSMutations();

    const userAttendance = useMemo(() => attendance.filter(a => a.userId === user.id), [attendance, user.id]);
    const userCashAdvances = useMemo(() => allCashAdvances.filter(ca => ca.userId === user.id), [allCashAdvances, user.id]);


    const stats = useMemo(() => {
        const presentDays = userAttendance.filter(a => a.status === 'present').length;
        const lateDays = userAttendance.filter(a => a.status === 'late').length;
        const pendingAdvances = userCashAdvances.filter(ca => ca.status === 'pending').length;

        return { presentDays, lateDays, pendingAdvances };
    }, [userAttendance, userCashAdvances]);

    const { presentDays, lateDays, pendingAdvances } = stats;

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

        addCashAdvanceRequest.mutate(request);

        // Send notification to admin if requested by non-admin
        if (user.role !== 'admin') {
            addActivity.mutate({
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

    if (isLoadingAttendance || isLoadingAdvances) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
    }

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
                        title="Daily Status"
                        value={userAttendance.find(a => a.date === new Date().toISOString().split('T')[0]) ? "Present" : "Not Logged"}
                        description="Today's activity"
                        icon={CalendarCheck}
                    />
                    <StatsCard
                        title="Days On-Site"
                        value={presentDays.toString()}
                        description="Current month logs"
                        icon={Clock}
                    />
                    <StatsCard
                        title="Late Records"
                        value={lateDays.toString()}
                        description="Current cycle"
                        icon={History}
                    />
                    <StatsCard
                        title="Cash Requests"
                        value={pendingAdvances.toString()}
                        description="Processing status"
                        icon={Wallet}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Left Column: Summary */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-premium overflow-hidden h-full">
                            <CardHeader className="bg-primary/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Recent Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground font-medium italic">Your latest system activity and attendance logs are displayed here.</p>
                                <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Performance Goal</h4>
                                    <p className="text-xl font-bold text-foreground">Perfect Attendance</p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">Maintain high consistency for quality service.</p>
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
                                {userAttendance.slice(0, 5).map((record) => (
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
                                {userAttendance.length === 0 && (
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
                                {userCashAdvances.slice(0, 5).map((req) => (
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
                                {userCashAdvances.length === 0 && (
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
