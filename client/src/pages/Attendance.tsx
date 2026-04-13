import { useState, useEffect, useMemo } from "react";
import { useAttendance, useUsers, useHRMSMutations, useSettings } from "@/hooks/use-hrms";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogOut, CheckCircle2, AlertCircle, UserCheck, Users, Search, Fingerprint, ShieldCheck, XCircle, Loader2, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db, Attendance, User } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { verifyBiometrics } from "@/lib/biometrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Download, Info, Edit, Save } from "lucide-react";


const MySwal = withReactContent(Swal);

export default function AttendancePage() {
    const { data: attendance = [], isLoading: isLoadingAttendance } = useAttendance();
    const { data: users = [], isLoading: isLoadingUsers } = useUsers();
    const { data: settings, isLoading: isLoadingSettings } = useSettings();
    const { addAttendance, updateAttendance, addAttendanceBulk, addActivity } = useHRMSMutations();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingStatus, setViewingStatus] = useState<'present' | 'late' | 'absent' | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanningState, setScanningState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [scannerMessage, setScannerMessage] = useState("Place your finger on the sensor");
    const [importData, setImportData] = useState<Partial<Attendance>[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
    const currentUser = db.getCurrentUser();

    const isAdmin = currentUser?.role === 'admin';
    const isHR = currentUser?.role === 'hr';
    const isAdminOrHR = isAdmin || isHR;
    const today = new Date().toISOString().split('T')[0];

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Check for biometric support
        if (!window.PublicKeyCredential) {
            console.warn("Biometric authentication not supported in this browser.");
        }

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
            addAttendance.mutate(newRecord);
            addActivity.mutate({
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
                updateAttendance.mutate({ id: currentRecord.id, data: { timeOut: timeString } });
                addActivity.mutate({
                    type: 'attendance',
                    avatar: currentUser!.name.split(' ').map(n => n[0]).join(''),
                    user: currentUser!.name,
                    action: 'timed out (Biometric)',
                    target: `at ${timeString}`,
                    time: 'Just now'
                });
            }
        }
    };

    const runBiometricScan = async () => {
        setIsScannerOpen(true);
        setScanningState('scanning');
        setScannerMessage("Waiting for sensor response...");

        const isCurrentlyIn = attendance.some(a => a.userId === currentUser?.id && a.date === today);
        const mode = isCurrentlyIn ? 'out' : 'in';

        const hasFingerprint = !!currentUser?.biometricCredential;

        try {
            if (hasFingerprint) {
                setScannerMessage("Validating fingerprint with secure enclave...");
                await verifyBiometrics(currentUser.biometricCredential!);
            } else if (settings?.biometricEnforced) {
                // If enforced and no fingerprint, fail the scan
                throw new Error("Biometric verification is ENFORCED. Please register your fingerprint in Settings first.");
            } else {
                // Fallback simulation if not enforced and no fingerprint
                setScannerMessage("Identity Verification in progress...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

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
        } catch (err: any) {
            setScanningState('error');
            setScannerMessage(err.message || "Verification Failed");
            setTimeout(() => {
                setIsScannerOpen(false);
                setScanningState('idle');
            }, 2000);
        }
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

    const getViewingList = () => {
        const timedInIds = todaysRecords.map(a => a.userId);
        const employeesOnly = users.filter(u => u.isEmployee);
        if (viewingStatus === 'present') return todaysRecords.filter(a => a.status === 'present').map(a => employeesOnly.find(u => u.id === a.userId)).filter(Boolean) as User[];
        if (viewingStatus === 'late') return todaysRecords.filter(a => a.status === 'late').map(a => employeesOnly.find(u => u.id === a.userId)).filter(Boolean) as User[];
        if (viewingStatus === 'absent') return employeesOnly.filter(u => u.status === 'active' && !timedInIds.includes(u.id));
        return [];
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            const parsed: Partial<Attendance>[] = [];
            
            // Assume format: EmployeeID, Date, Time, Status
            // Skip header if it looks like one
            const startIdx = (lines[0].toLowerCase().includes('id') || lines[0].toLowerCase().includes('date')) ? 1 : 0;
            
            for (let i = startIdx; i < lines.length; i++) {
                const [userId, date, time, status] = lines[i].split(',').map(s => s.trim());
                if (userId && date && time) {
                    parsed.push({
                        id: `imp-${Date.now()}-${i}`,
                        userId,
                        date,
                        timeIn: time,
                        status: (status as any) || 'present'
                    });
                }
            }
            setImportData(parsed);
            MySwal.fire({
                title: 'File Parsed',
                text: `Found ${parsed.length} attendance records.`,
                icon: 'info'
            });
        };
        reader.readAsText(file);
    };

    const handleBulkUpload = async () => {
        if (importData.length === 0) return;
        
        setIsImporting(true);
        try {
            await addAttendanceBulk.mutateAsync(importData);
            MySwal.fire('Success', 'Attendance data imported successfully!', 'success');
            setImportData([]);
        } catch (error) {
            MySwal.fire('Error', 'Failed to import data.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const getEmployeeName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || 'Unknown';
    };

    const filteredAttendance = useMemo(() => {
        return attendance.filter(a => {
            const user = users.find(u => u.id === a.userId);
            if (!user?.isEmployee) return false;
            const matchesUser = isAdmin || a.userId === currentUser?.id;
            const name = user.name.toLowerCase();
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || a.date.includes(searchTerm);
            return matchesUser && matchesSearch;
        });
    }, [attendance, isAdminOrHR, currentUser?.id, searchTerm, users]);

    const todaysRecords = useMemo(() => attendance.filter(a => a.date === today), [attendance, today]);

    const stats = useMemo(() => {
        const employeeIds = users.filter(u => u.isEmployee).map(u => u.id);
        const employeeRecordsToday = todaysRecords.filter(a => employeeIds.includes(a.userId));

        const presentToday = isAdmin ? employeeRecordsToday.filter(a => a.status === 'present').length : (attendance.some(a => a.userId === currentUser?.id && a.date === today && a.status === 'present') ? 1 : 0);
        const lateToday = isAdmin ? employeeRecordsToday.filter(a => a.status === 'late').length : (attendance.some(a => a.userId === currentUser?.id && a.date === today && a.status === 'late') ? 1 : 0);
        const activeStaffCount = isAdmin ? users.filter(u => u.status === 'active' && u.isEmployee).length : 1;
        const absentToday = isAdmin ? Math.max(0, activeStaffCount - employeeRecordsToday.length) : (attendance.some(a => a.userId === currentUser?.id && a.date === today) ? 0 : 1);

        const isCurrentTimedIn = attendance.some(a => a.userId === currentUser?.id && a.date === today);
        const isCurrentTimedOut = attendance.some(a => a.userId === currentUser?.id && a.date === today && a.timeOut);

        return { presentToday, lateToday, absentToday, isCurrentTimedIn, isCurrentTimedOut };
    }, [todaysRecords, users, attendance, currentUser?.id, today, isAdmin]);

    const { presentToday, lateToday, absentToday, isCurrentTimedIn, isCurrentTimedOut } = stats;

    if (!currentUser) return null;

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="animate-in fade-in slide-in-from-left duration-500">
                    </div>
                </div>

                <Tabs defaultValue="import" className="w-full">
                    <TabsList className="mb-4 bg-muted/50 p-1 rounded-xl h-12">
                        {isAdminOrHR && <TabsTrigger value="import" className="rounded-lg font-bold">Biometric Import</TabsTrigger>}
                    </TabsList>




                    <TabsContent value="import" className="space-y-6">
                        <Card className="border-none shadow-premium bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Fingerprint className="h-5 w-5 text-primary" />
                                    Biometric Batch Integration
                                </CardTitle>
                                <CardDescription>Sync attendance records from your hardware's CSV export.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    <div className="p-8 border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FileUp className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold">Drop biometric file here</p>
                                            <p className="text-xs text-muted-foreground font-medium italic">Supports CSV/TXT exports (ID, Date, Time, Status)</p>
                                        </div>
                                        <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="max-w-[250px] cursor-pointer" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-muted/30 p-4 rounded-2xl border border-muted flex items-start gap-3">
                                            <Info className="h-5 w-5 text-primary mt-0.5" />
                                            <div className="text-xs space-y-1">
                                                <p className="font-bold text-primary uppercase tracking-tighter">System Instructions</p>
                                                <p className="text-muted-foreground leading-relaxed">Ensure your CSV follows the sequence: <strong>Employee ID, YYYY-MM-DD, HH:MM:SS, [Optional Status]</strong> for accurate processing.</p>
                                            </div>
                                        </div>
                                        
                                        {importData.length > 0 && (
                                            <div className="p-6 rounded-2xl bg-white space-y-4 border shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold">Staged Records</p>
                                                        <p className="text-xs text-muted-foreground">{importData.length} entries detected</p>
                                                    </div>
                                                    <Button onClick={handleBulkUpload} disabled={isImporting} className="rounded-xl shadow-lg ring-offset-2 ring-primary/20">
                                                        {isImporting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                                        Confirm & Sync
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

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
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="capitalize">{viewingStatus} Employees Today</DialogTitle>
                                    <DialogDescription>List of employees currently marked as {viewingStatus}.</DialogDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.print()}
                                    className="no-print"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print List
                                </Button>
                            </div>
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
                                    {isAdminOrHR && <TableHead className="w-[50px] no-print"></TableHead>}
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
                                        {isAdminOrHR && (
                                            <TableCell className="no-print">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setEditingRecord(record)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Record Dialog */}
                <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Correct Attendance Record</DialogTitle>
                            <DialogDescription>Manually adjust time entry for {editingRecord && getEmployeeName(editingRecord.userId)}.</DialogDescription>
                        </DialogHeader>
                        {editingRecord && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Date</Label>
                                    <Input value={editingRecord.date} disabled className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Time In</Label>
                                    <Input 
                                        value={editingRecord.timeIn} 
                                        onChange={(e) => setEditingRecord({...editingRecord, timeIn: e.target.value})}
                                        className="col-span-3" 
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Time Out</Label>
                                    <Input 
                                        value={editingRecord.timeOut || ''} 
                                        onChange={(e) => setEditingRecord({...editingRecord, timeOut: e.target.value})}
                                        className="col-span-3"
                                        placeholder="HH:MM:SS"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Status</Label>
                                    <select 
                                        value={editingRecord.status}
                                        onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value as any})}
                                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="absent">Absent</option>
                                        <option value="half_day">Half Day</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancel</Button>
                            <Button onClick={() => {
                                if (editingRecord) {
                                    updateAttendance.mutate({ id: editingRecord.id, data: editingRecord });
                                    setEditingRecord(null);
                                    MySwal.fire('Updated', 'Record adjusted successfully.', 'success');
                                }
                            }}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Correction
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .no-print {
                        display: none !important;
                    }
                    [role="dialog"], [role="dialog"] * {
                        visibility: visible;
                    }
                    [role="dialog"] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
