import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogOut, CheckCircle2, AlertCircle, UserCheck, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db, Attendance, User } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MySwal = withReactContent(Swal);

export default function AttendancePage() {
    const [attendance, setAttendance] = useState(db.getAttendance());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingStatus, setViewingStatus] = useState<'present' | 'late' | 'absent' | null>(null);
    const currentUser = db.getCurrentUser();

    const isAdminOrHR = currentUser.role === 'admin' || currentUser.role === 'hr';
    const today = new Date().toISOString().split('T')[0];

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTimeIn = () => {
        const existing = attendance.find(a => a.userId === currentUser.id && a.date === today);

        if (existing) {
            MySwal.fire({
                title: 'Already Timed In',
                text: 'You have already timed in for today.',
                icon: 'info'
            });
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Simple logic: Late if after 9:00 AM
        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

        const newRecord: Attendance = {
            id: `att-${Date.now()}`,
            userId: currentUser.id,
            date: today,
            timeIn: timeString,
            status: isLate ? 'late' : 'present'
        };

        db.addAttendance(newRecord);
        db.addActivity({
            type: 'attendance',
            avatar: currentUser.name.split(' ').map(n => n[0]).join(''),
            user: currentUser.name,
            action: 'timed in',
            target: isLate ? 'late' : 'on time',
            time: 'Just now'
        });

        setAttendance(db.getAttendance());

        MySwal.fire({
            title: 'Success!',
            text: `Timed in at ${timeString}`,
            icon: 'success'
        });
    };

    const handleTimeOut = () => {
        const currentRecord = attendance.find(a => a.userId === currentUser.id && a.date === today && !a.timeOut);

        if (!currentRecord) {
            MySwal.fire({
                title: 'Error',
                text: 'No active time-in record found for today.',
                icon: 'error'
            });
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        db.updateAttendance(currentRecord.id, { timeOut: timeString });
        db.addActivity({
            type: 'attendance',
            avatar: currentUser.name.split(' ').map(n => n[0]).join(''),
            user: currentUser.name,
            action: 'timed out',
            target: `at ${timeString}`,
            time: 'Just now'
        });

        setAttendance(db.getAttendance());

        MySwal.fire({
            title: 'Success!',
            text: `Timed out at ${timeString}`,
            icon: 'success'
        });
    };

    const getEmployeeName = (userId: string) => {
        return db.getUsers().find(u => u.id === userId)?.name || 'Unknown';
    };

    const filteredAttendance = attendance.filter(a => {
        const matchesUser = isAdminOrHR || a.userId === currentUser.id;
        const name = getEmployeeName(a.userId).toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || a.date.includes(searchTerm);
        return matchesUser && matchesSearch;
    });

    // Stats for today
    const todaysRecords = attendance.filter(a => a.date === today);
    const presentToday = todaysRecords.filter(a => a.status === 'present').length;
    const lateToday = todaysRecords.filter(a => a.status === 'late').length;
    const activeStaff = db.getUsers().filter(u => u.status === 'active').length;
    const absentToday = Math.max(0, activeStaff - todaysRecords.length);

    const isCurrentTimedIn = attendance.some(a => a.userId === currentUser.id && a.date === today);
    const isCurrentTimedOut = attendance.some(a => a.userId === currentUser.id && a.date === today && a.timeOut);

    const getPresentEmployees = () => todaysRecords.filter(a => a.status === 'present').map(a => db.getUsers().find(u => u.id === a.userId)).filter(Boolean) as User[];
    const getLateEmployees = () => todaysRecords.filter(a => a.status === 'late').map(a => db.getUsers().find(u => u.id === a.userId)).filter(Boolean) as User[];
    const getAbsentEmployees = () => {
        const timedInIds = todaysRecords.map(a => a.userId);
        return db.getUsers().filter(u => u.status === 'active' && !timedInIds.includes(u.id));
    };

    const getViewingList = () => {
        if (viewingStatus === 'present') return getPresentEmployees();
        if (viewingStatus === 'late') return getLateEmployees();
        if (viewingStatus === 'absent') return getAbsentEmployees();
        return [];
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-heading font-bold tracking-tight text-primary">Attendance Tracking</h2>
                        <p className="text-muted-foreground mt-1">
                            {isAdminOrHR ? "Monitor company-wide daily attendance and status." : "Log your daily attendance and view history."}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Clock & Action Card */}
                    <Card className="md:col-span-2 overflow-hidden border-none shadow-premium bg-gradient-to-br from-primary/5 to-secondary/30">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="text-sm font-medium uppercase tracking-wider text-primary/60">Current Time</h3>
                                    <div className="text-5xl font-mono font-bold tracking-tighter text-primary">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Button
                                        size="xl"
                                        className="h-16 px-8 text-lg font-bold shadow-lg transition-all hover:scale-105"
                                        onClick={handleTimeIn}
                                        disabled={isCurrentTimedIn}
                                    >
                                        <Clock className="mr-3 h-6 w-6" />
                                        {isCurrentTimedIn ? "Already Timed In" : "Time In Now"}
                                    </Button>
                                    <Button
                                        size="xl"
                                        variant="outline"
                                        className="h-16 px-8 text-lg font-bold shadow-sm transition-all hover:scale-105 border-destructive/20 text-destructive hover:bg-destructive/10"
                                        onClick={handleTimeOut}
                                        disabled={!isCurrentTimedIn || isCurrentTimedOut}
                                    >
                                        <LogOut className="mr-3 h-6 w-6" />
                                        {isCurrentTimedOut ? "Already Timed Out" : "Time Out Now"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Summary (for Admin/HR or Staff stats) */}
                    <Card className="border-none shadow-premium">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">Today's Overview</CardTitle>
                            <CardDescription>Daily status summary</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <button
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => isAdminOrHR && setViewingStatus('present')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                                        <UserCheck className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">On Time</span>
                                </div>
                                <span className="text-lg font-bold">{presentToday}</span>
                            </button>
                            <button
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => isAdminOrHR && setViewingStatus('late')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                        <AlertCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Late</span>
                                </div>
                                <span className="text-lg font-bold">{lateToday}</span>
                            </button>
                            <button
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                onClick={() => isAdminOrHR && setViewingStatus('absent')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Absent</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{absentToday}</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee List Dialog */}
                <Dialog open={!!viewingStatus} onOpenChange={(open) => !open && setViewingStatus(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="capitalize">{viewingStatus} Employees Today</DialogTitle>
                            <DialogDescription>
                                List of employees currently marked as {viewingStatus}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[300px] overflow-y-auto space-y-4 py-4">
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
                            {getViewingList().length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-8">No employees in this category.</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Attendance List */}
                <Card className="border-none shadow-premium">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Attendance Records</CardTitle>
                                <CardDescription>History of logs across the organization</CardDescription>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or date..."
                                    className="pl-9 bg-secondary/50 border-none focus-visible:ring-1"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-muted/50 rounded-lg">
                                <TableRow>
                                    {isAdminOrHR && <TableHead className="font-bold">Employee</TableHead>}
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Time In</TableHead>
                                    <TableHead className="font-bold">Time Out</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAttendance.sort((a, b) => b.date.localeCompare(a.date)).map((record) => (
                                    <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                                        {isAdminOrHR && (
                                            <TableCell className="font-semibold">
                                                {getEmployeeName(record.userId)}
                                            </TableCell>
                                        )}
                                        <TableCell className="font-medium">{record.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-none">
                                                {record.timeIn}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {record.timeOut ? (
                                                <Badge variant="outline" className="font-mono bg-purple-50 dark:bg-purple-900/10 text-purple-600 border-none">
                                                    {record.timeOut}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">Pending...</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'destructive' : 'secondary'}
                                                className={`capitalize px-3 py-1 ${record.status === 'present' ? 'bg-green-600 hover:bg-green-700' :
                                                    record.status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''
                                                    }`}
                                            >
                                                {record.status === 'present' ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        On Time
                                                    </div>
                                                ) : record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredAttendance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={isAdminOrHR ? 5 : 4} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Clock className="h-8 w-8 opacity-20" />
                                                <p>No attendance records found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
