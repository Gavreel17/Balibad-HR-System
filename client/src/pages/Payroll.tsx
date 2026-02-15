import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Coins, FileText, Search, CreditCard, Wallet, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, User } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedPayslip, setSelectedPayslip] = useState<User | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);

  const users = db.getUsers().filter(u => u.status === 'active');
  const cashAdvances = db.getCashAdvanceRequests();
  const currentUser = db.getCurrentUser();

  if (!currentUser) return null;

  // Helper Calculations
  const calcMonthlyGross = (annual: number) => annual / 12;

  const getCashAdvanceDeduction = (userId: string) => {
    return cashAdvances
      .filter(ca => ca.userId === userId && (ca.status === 'approved' || ca.status === 'paid'))
      .reduce((total, adv) => total + adv.amount, 0);
  };

  const getAbsenceDeduction = (userId: string, salary: number) => {
    const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const absences = db.getAttendance().filter(a =>
      a.userId === userId &&
      a.status === 'absent' &&
      a.date.startsWith(currentMonthPrefix)
    ).length;
    const monthlySalary = salary / 12;
    const dailyRate = monthlySalary / 22; // Assuming 22 work days/month
    return absences * dailyRate;
  };

  const calculateFullPayrollData = (user: User) => {
    const gross = calcMonthlyGross(user.salary);
    const advance = getCashAdvanceDeduction(user.id);
    const absences = getAbsenceDeduction(user.id, user.salary);
    const totalDeductions = advance + absences;
    const net = gross - totalDeductions;

    return { gross, advance, absences, totalDeductions, net };
  };

  const filteredUsers = users.filter(user => {
    const matchesName = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "all" || user.department === deptFilter;
    return matchesName && matchesDept;
  });

  // Summary Stats
  const totalGross = filteredUsers.reduce((sum, u) => sum + calcMonthlyGross(u.salary), 0);
  const totalDeductions = filteredUsers.reduce((sum, u) => {
    const data = calculateFullPayrollData(u);
    return sum + data.totalDeductions;
  }, 0);
  const totalNet = totalGross - totalDeductions;

  const handleRunPayroll = () => {
    MySwal.fire({
      title: 'Initialize Payroll?',
      text: `Process payments for ${filteredUsers.length} employees? Total: ₱${totalNet.toLocaleString()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm Payments',
      confirmButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        db.addActivity({
          type: 'payroll',
          avatar: currentUser.name.split(' ').map(n => n[0]).join(''),
          user: currentUser.name,
          action: 'processed',
          target: `payroll for ${filteredUsers.length} employees`,
          time: 'Just now'
        });

        MySwal.fire('Success!', 'Payroll data has been recorded and tasks sent to Finance.', 'success');
      }
    });
  };

  const handlePrint = (userId: string) => {
    // For prototype, we'll trigger a browser print
    // In a real app, this might target a specific hidden printable frame
    const user = users.find(u => u.id === userId);
    if (!user) return;

    MySwal.fire({
      title: 'Preparing Print...',
      text: `Formatting payslip for ${user.name}`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      didOpen: () => {
        MySwal.showLoading();
      }
    }).then(() => {
      window.print();
    });
  };

  const handleDownloadPDF = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    MySwal.fire({
      title: 'Generating PDF...',
      text: 'Compiling electronic payroll record...',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      didOpen: () => {
        MySwal.showLoading();
      }
    }).then(() => {
      MySwal.fire({
        title: 'PDF Downloaded',
        text: `PAYSLIP_FEB2026_${user.id}.pdf has been saved.`,
        icon: 'success'
      });
    });
  };

  const handleBatchPrint = () => {
    MySwal.fire({
      title: 'Initialize Batch Print?',
      text: `This will generate payslips for all ${filteredUsers.length} filtered employees.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Start Printing',
      confirmButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsBatchPrinting(true);
        MySwal.fire({
          title: 'Processing Batch...',
          html: '<div className="flex flex-col gap-2">Generating printable manifests...</div>',
          didOpen: () => {
            MySwal.showLoading();
          }
        });

        setTimeout(() => {
          setIsBatchPrinting(false);
          window.print();
          MySwal.fire('Success', 'Batch print command sent to printer queue.', 'success');
        }, 2000);
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight text-primary">Payroll Management</h2>
            <p className="text-muted-foreground">Manage organizational salaries, tax logic, and disbursements.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleBatchPrint} variant="outline" className="shadow-sm border-primary/20 hover:bg-primary/5">
              <Printer className="mr-2 h-4 w-4" />
              Batch Print
            </Button>
            <Button onClick={handleRunPayroll} className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:scale-105">
              <Coins className="mr-2 h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-none shadow-premium bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" /> Total Gross
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalGross.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total before deductions</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-premium bg-gradient-to-br from-red-500/10 to-red-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" /> Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{totalDeductions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Advances & Absences</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-premium bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-500" /> Net Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{totalNet.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 text-green-600/80">Net amount to disburse</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-premium bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Pay Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Feb 28, 2026</div>
              <p className="text-xs text-muted-foreground mt-1">End of Month (Monthly)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and List */}
        <Card className="border-none shadow-premium">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-xl">Salary Disbursements</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employee..."
                    className="pl-9 bg-secondary/50 border-none focus-visible:ring-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-secondary/50 border-none">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Employee</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold">Gross Salary</TableHead>
                  <TableHead className="font-bold">Total Ded.</TableHead>
                  <TableHead className="font-bold">Net Pay</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const data = calculateFullPayrollData(user);
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-muted-foreground">ID: {user.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{user.department}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">₱{data.gross.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-red-500">-₱{data.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className="font-mono font-bold text-green-600">₱{data.net.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500 hover:bg-green-600">Processed</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => setSelectedPayslip(user)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payslip View Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedPayslip && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <div>
                    <DialogTitle className="text-2xl">Electronic Payslip</DialogTitle>
                    <DialogDescription>Monthly Payroll Cycle: Feb 2026</DialogDescription>
                  </div>
                  <Coins className="h-8 w-8 text-primary opacity-20" />
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-muted-foreground font-medium">Employee Name</p>
                    <p className="font-bold">{selectedPayslip.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground font-medium">Employee ID</p>
                    <p className="font-bold">{selectedPayslip.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Position</p>
                    <p className="font-bold">{selectedPayslip.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground font-medium">Department</p>
                    <p className="font-bold">{selectedPayslip.department}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Earnings
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span>Basic Monthly Salary</span>
                    <span className="font-mono font-semibold">₱{calcMonthlyGross(selectedPayslip.salary).toLocaleString()}</span>
                  </div>
                  <Separator />

                  <h4 className="font-bold flex items-center gap-2 pt-2 text-red-600">
                    <TrendingDown className="h-4 w-4" /> Deductions
                  </h4>
                  <div className="space-y-2 text-sm">
                    {getCashAdvanceDeduction(selectedPayslip.id) > 0 && (
                      <div className="flex justify-between font-medium text-red-500">
                        <span>Cash Advance Repayment</span>
                        <span className="font-mono">-₱{getCashAdvanceDeduction(selectedPayslip.id).toLocaleString()}</span>
                      </div>
                    )}
                    {getAbsenceDeduction(selectedPayslip.id, selectedPayslip.salary) > 0 && (
                      <div className="flex justify-between font-medium text-red-500">
                        <span>Absence Deductions ({db.getAttendance().filter(a => a.userId === selectedPayslip.id && a.status === 'absent' && a.date.startsWith(new Date().toISOString().substring(0, 7))).length} days)</span>
                        <span className="font-mono">-₱{getAbsenceDeduction(selectedPayslip.id, selectedPayslip.salary).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {getCashAdvanceDeduction(selectedPayslip.id) === 0 && getAbsenceDeduction(selectedPayslip.id, selectedPayslip.salary) === 0 && (
                      <p className="text-xs text-muted-foreground italic">No deductions for this period.</p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">NET PAYABLE</p>
                    <p className="text-2xl font-black text-primary font-mono">
                      ₱{calculateFullPayrollData(selectedPayslip).net.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 no-print">
                  <Button variant="outline" size="sm" onClick={() => handlePrint(selectedPayslip.id)}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                  <Button size="sm" onClick={() => handleDownloadPDF(selectedPayslip.id)}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden Printable Content for Batch Printing */}
      <div id="printable-area" className="hidden-print-area">
        {isBatchPrinting && filteredUsers.map(user => {
          const data = calculateFullPayrollData(user);
          return (
            <div key={user.id} className="printable-payslip p-12 border-b-2 border-dashed border-gray-300 page-break">
              <div className="flex justify-between border-b pb-4 mb-6">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">BALIBAD STORE</h1>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Electronic Payroll Record</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Period Ending</p>
                  <p className="text-xl font-bold">Feb 28, 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Employee Detail</p>
                  <p className="text-2xl font-bold">{user.name}</p>
                  <p className="text-sm font-medium">{user.position} • {user.department}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Branch Location</p>
                  <p className="text-lg font-bold">{user.branch}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Basic Monthly Salary</span>
                  <span className="font-mono font-bold">₱{data.gross.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-red-600 uppercase">Deductions</p>
                  <div className="flex justify-between text-sm">
                    <span>Cash Advance Repayments</span>
                    <span className="font-mono">-₱{data.advance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absence Deductions ({db.getAttendance().filter(a => a.userId === user.id && a.status === 'absent' && a.date.startsWith(new Date().toISOString().substring(0, 7))).length} days)</span>
                    <span className="font-mono">-₱{data.absences.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-xl flex justify-between items-center bg-zinc-100">
                <span className="text-xl font-black">NET PAYABLE AMOUNT</span>
                <span className="text-3xl font-black font-mono">₱{data.net.toLocaleString()}</span>
              </div>

              <div className="mt-12 pt-8 border-t flex justify-between items-center italic text-xs text-muted-foreground">
                <p>Produced by Balibad Core Systems on {new Date().toLocaleDateString()}</p>
                <p className="uppercase tracking-widest font-bold">Confidential Record</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          #printable-area {
            display: none;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
