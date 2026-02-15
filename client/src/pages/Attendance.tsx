import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogOut, CheckCircle2, AlertCircle, UserCheck, Users, Search, Fingerprint, ShieldCheck, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db, Attendance, User } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MySwal = withReactContent(Swal);

export default function AttendancePage() {
    const [attendance, setAttendance] = useState(db.getAttendance());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingStatus, setViewingStatus] = useState<'present' | 'late' | 'absent' | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanningState, setScanningState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [scannerMessage, setScannerMessage] = useState("Place your finger on the sensor");
    const currentUser = db.getCurrentUser();

    const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const today = new Date().toISOString().split('T')[0];

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const processAttendance = (mode: 'in' | 'out') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (mode === 'in') {
            const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
            const newRecord: Attendance = {
                id: `att-${Date.now()}`,
                userId: currentUser!.id,
                date: today,
                timeIn: timeString,
                status: isLate ? 'late' : 'present'
            };
            db.addAttendance(newRecord);
            db.addActivity({
                type: 'attendance',
                avatar: currentUser!.name.split(' ').map(n => n[0]).join(''),
                user: currentUser!.name,
                action: 'timed in (Biometric)',
                target: isLate ? 'late' : 'on time',
                time: 'Just now'
            });
        } else {
            const currentRecord = attendance.find(a => a.userId === currentUser!.id && a.date === today && !a.timeOut);
            if (currentRecord) {
                db.updateAttendance(currentRecord.id, { timeOut: timeString });
                db.addActivity({
                    type: 'attendance',
                    avatar: currentUser!.name.split(' ').map(n => n[0]).join(''),
                    user: currentUser!.name,
                    action: 'timed out (Biometric)',
                    target: `at ${timeString}`,
                    time: 'Just now'
                });
            }
        }

        setAttendance(db.getAttendance());
    };

    const runBiometricScan = () => {
        setIsScannerOpen(true);
        setScanningState('scanning');
        setScannerMessage("Validating fingerprint data...");

        const isCurrentlyIn = attendance.some(a => a.userId === currentUser?.id && a.date === today);
        const mode = isCurrentlyIn ? 'out' : 'in';

        setTimeout(() => {
            setScanningState('success');
            setScannerMessage("Identity Verified!");

            setTimeout(() => {
                processAttendance(mode);
                setIsScannerOpen(false);
                setScanningState('idle');

                MySwal.fire({
                    title: 'Biometric Success',
                    text: `Self-Identity verified. Access logged successfully.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }, 1000);
        }, 2500);
    };

    const handleTimeIn = () => {
        const existing = attendance.find(a => a.userId === currentUser?.id && a.date === today);
        if (existing) {
            MySwal.fire({ title: 'Already Timed In', text: 'You have already timed in for today.', icon: 'info' });
            return;
        }
        runBiometricScan();
    };

    const handleTimeOut = () => {
        const currentRecord = attendance.find(a => a.userId === currentUser?.id && a.date === today && !a.timeOut);
        if (!currentRecord) {
            MySwal.fire({ title: 'Error', text: 'No active time-in record found for today.', icon: 'error' });
            return;
        }
        runBiometricScan();
    };

    const getEmployeeName = (userId: string) => {
        return db.getUsers().find(u => u.id === userId)?.name || 'Unknown';
    };

    const filteredAttendance = attendance.filter(a => {
        const matchesUser = isAdminOrHR || a.userId === currentUser?.id;
        const name = getEmployeeName(a.userId).toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || a.date.includes(searchTerm);
        return matchesUser && matchesSearch;
    });

    const todaysRecords = attendance.filter(a => a.date === today);
    const presentToday = todaysRecords.filter(a => a.status === 'present').length;
    const lateToday = todaysRecords.filter(a => a.status === 'late').length;
    const activeStaff = db.getUsers().filter(u => u.status === 'active').length;
    const absentToday = Math.max(0, activeStaff - todaysRecords.length);

    const isCurrentTimedIn = attendance.some(a => a.userId === currentUser?.id && a.date === today);
    const isCurrentTimedOut = attendance.some(a => a.userId === currentUser?.id && a.date === today && a.timeOut);

    const getViewingList = () => {
        const timedInIds = todaysRecords.map(a => a.userId);
        if (viewingStatus === 'present') return todaysRecords.filter(a => a.status === 'present').map(a => db.getUsers().find(u => u.id === a.userId)).filter(Boolean) as User[];
        if (viewingStatus === 'late') return todaysRecords.filter(a => a.status === 'late').map(a => db.getUsers().find(u => u.id === a.userId)).filter(Boolean) as User[];
        if (viewingStatus === 'absent') return db.getUsers().filter(u => u.status === 'active' && !timedInIds.includes(u.id));
        return [];
    };

    if (!currentUser) return null;

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="animate-in fade-in slide-in-from-left duration-500">
                        <h2 className="text-4xl font-heading font-bold tracking-tight text-primary">Biometric Attendance</h2>
                        <p className="text-muted-foreground text-lg mt-1 font-medium italic">
                            Secure identity verification via digital biometric sensors.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 overflow-hidden border-none shadow-premium bg-white/80 backdrop-blur-sm group transition-all hover:bg-white/90">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                                <div className="space-y-2 text-center md:text-left animate-in zoom-in duration-300">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Real-Time Clocking</h3>
                                    <div className="text-6xl font-heading font-bold tracking-tighter text-primary">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <p className="text-lg text-muted-foreground font-bold italic">
                                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        size="xl"
                                        className={cn(
                                            "h-24 px-10 text-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 group relative overflow-hidden rounded-2xl",
                                            isCurrentTimedIn ? "bg-muted text-muted-foreground grayscale" : "bg-primary text-primary-foreground"
                                        )}
                                        onClick={handleTimeIn}
                                        disabled={isCurrentTimedIn}
                                    >
                                        <div className="relative z-10 flex items-center gap-3">
                                            <Fingerprint className={cn("h-8 w-8", !isCurrentTimedIn && "animate-pulse")} />
                                            <span>{isCurrentTimedIn ? "Verified In" : "Scan Finger"}</span>
                                        </div>
                                        {!isCurrentTimedIn && <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/10 to-primary-foreground/0 animate-shimmer" />}
                                    </Button>
                                    <Button
                                        size="xl"
                                        variant="outline"
                                        className={cn(
                                            "h-24 px-10 text-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95 rounded-2xl border-2",
                                            !isCurrentTimedIn || isCurrentTimedOut ? "opacity-50 cursor-not-allowed" : "border-destructive/20 text-destructive hover:bg-destructive/10"
                                        )}
                                        onClick={handleTimeOut}
                                        disabled={!isCurrentTimedIn || isCurrentTimedOut}
                                    >
                                        <LogOut className="mr-3 h-8 w-8" />
                                        <span>{isCurrentTimedOut ? "Logged Out" : "Exit Scan"}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-card/40 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                Departmental Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {[
                                { label: 'Active Present', count: presentToday, color: 'green', type: 'present', icon: UserCheck },
                                { label: 'Tardy Arrival', count: lateToday, color: 'amber', type: 'late', icon: AlertCircle },
                                { label: 'Non-compliant', count: absentToday, color: 'red', type: 'absent', icon: XCircle }
                            ].map((stat) => (
                                <button
                                    key={stat.type}
                                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 group text-left"
                                    onClick={() => isAdminOrHR && setViewingStatus(stat.type as any)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl shadow-inner group-hover:scale-110 transition-transform",
                                            stat.color === 'green' ? "bg-green-100 dark:bg-green-900/40 text-green-600" :
                                                stat.color === 'amber' ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600" :
                                                    "bg-red-100 dark:bg-red-900/40 text-red-600"
                                        )}>
                                            <stat.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground/80">{stat.label}</span>
                                    </div>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        stat.color === 'green' ? "text-green-600" :
                                            stat.color === 'amber' ? "text-amber-600" :
                                                "text-red-600"
                                    )}>{stat.count}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                    <DialogContent className="sm:max-w-md border-none shadow-2xl overflow-hidden p-0 rounded-3xl">
                        <div className="p-8 space-y-8 flex flex-col items-center text-center bg-gradient-to-b from-primary/10 to-transparent">
                            <div className="relative">
                                <div className={cn(
                                    "h-48 w-48 rounded-full border-4 flex items-center justify-center transition-all duration-500",
                                    scanningState === 'idle' ? "border-muted" :
                                        scanningState === 'scanning' ? "border-primary animate-pulse" :
                                            scanningState === 'success' ? "border-green-500 bg-green-500/10" :
                                                "border-red-500"
                                )}>
                                    {scanningState === 'scanning' && <Fingerprint className="h-24 w-24 text-primary animate-in zoom-in-50 duration-500" />}
                                    {scanningState === 'success' && <ShieldCheck className="h-24 w-24 text-green-500 animate-in zoom-in-50 duration-500" />}
                                    {scanningState === 'error' && <XCircle className="h-24 w-24 text-red-500 animate-in zoom-in-50 duration-500" />}
                                </div>
                                {scanningState === 'scanning' && (
                                    <div className="absolute inset-0 h-48 w-48 flex items-end justify-center pb-8">
                                        <div className="h-1 w-32 bg-primary/40 rounded-full animate-scan-bar" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className={cn("text-2xl font-heading font-bold", scanningState === 'success' ? "text-green-600" : "text-primary")}>
                                    {scanningState === 'scanning' ? "Initializing Sensor..." : scanningState === 'success' ? "Access Granted" : "System Error"}
                                </h3>
                                <p className="text-muted-foreground font-medium max-w-[250px]">{scannerMessage}</p>
                            </div>
                            {scanningState === 'scanning' && (
                                <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Scanning Biometric Map
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingStatus} onOpenChange={(open) => !open && setViewingStatus(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="capitalize">{viewingStatus} Employees Today</DialogTitle>
                            <DialogDescription>List of employees currently marked as {viewingStatus}.</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[300px] overflow-y-auto space-y-4 py-4 px-1">
                            {getViewingList().map((emp) => (
                                <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg border bg-card shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{emp.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{emp.position}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{emp.department}</Badge>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                                    <Clock className="h-5 w-5" /> Organization Ledger
                                </CardTitle>
                                <CardDescription className="font-medium italic">Audit-ready historical logs.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    placeholder="Search records..."
                                    className="pl-10 h-10 border-none bg-muted focus-visible:ring-1 text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    {isAdminOrHR && <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Team Member</TableHead>}
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Date</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Terminal In</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Terminal Out</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground text-right">Verification</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAttendance.sort((a, b) => b.date.localeCompare(a.date)).map((record) => (
                                    <TableRow key={record.id} className="hover:bg-primary/5 transition-all border-b border-muted/50 group">
                                        {isAdminOrHR && (
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border shadow-sm group-hover:scale-110 transition-transform">
                                                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary uppercase">{getEmployeeName(record.userId).substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm font-bold text-foreground/80">{getEmployeeName(record.userId)}</div>
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-sm font-medium text-muted-foreground">{record.date}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                                                <span className="font-mono text-xs font-bold">{record.timeIn}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {record.timeOut ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-destructive shadow-sm shadow-destructive/50" />
                                                    <span className="font-mono text-xs font-bold">{record.timeOut}</span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 italic border-none bg-transparent">In Progress</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={cn("capitalize px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm border mt-1", record.status === 'present' ? "bg-green-50 border-green-200 text-green-700" : record.status === 'late' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700")}>
                                                {record.status === 'present' ? "Verified: On Time" : record.status === 'late' ? "Verified: Late Arrival" : record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
