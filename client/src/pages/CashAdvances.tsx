import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, X, Trash } from "lucide-react";
import { db, CashAdvanceRequest } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function CashAdvancesPage() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return null;

    const [requests, setRequests] = useState(db.getCashAdvanceRequests());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        name: '',
        amount: '',
        purpose: ''
    });
    const [selectedUserId, setSelectedUserId] = useState('');
    const [nameSuggestions, setNameSuggestions] = useState<{ id: string; name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const allEmployees = db.getUsers().filter(u => u.isEmployee);

    const handleNameInput = (value: string) => {
        setNewRequest({ ...newRequest, name: value });
        setSelectedUserId('');
        if (value.trim().length > 0) {
            const filtered = allEmployees.filter(u =>
                u.name.toLowerCase().includes(value.toLowerCase())
            );
            setNameSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setNameSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectEmployee = (emp: { id: string; name: string }) => {
        setNewRequest({ ...newRequest, name: emp.name });
        setSelectedUserId(emp.id);
        setShowSuggestions(false);
        setNameSuggestions([]);
    };

    const isAdmin = currentUser.role === 'admin';
    const isHR = currentUser.role === 'hr';
    const isAdminOrHR = isAdmin || isHR;

    // Filter requests based on role
    // Admin/HR sees all, Employees see only theirs
    const visibleRequests = isAdminOrHR
        ? requests
        : requests.filter(r => r.userId === currentUser.id);

    const handleSubmitRequest = () => {
        if (!newRequest.amount || !newRequest.purpose) {
            MySwal.fire('Error', 'Please fill in all fields', 'error');
            return;
        }

        const request: CashAdvanceRequest = {
            id: `ca-${Date.now()}`,
            userId: selectedUserId || currentUser.id,
            amount: parseFloat(newRequest.amount),
            purpose: newRequest.purpose,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        db.addCashAdvanceRequest(request);

        // Send notification to admin
        if (currentUser.role !== 'admin') {
            db.addActivity({
                type: 'cash_advance',
                avatar: currentUser.name.split(' ').map(n => n[0]).join(''),
                user: currentUser.name,
                action: 'requested',
                target: `cash advance of ₱${request.amount.toLocaleString()}`,
                time: 'Just now'
            });
        }

        setRequests(db.getCashAdvanceRequests());
        setNewRequest({ name: '', amount: '', purpose: '' });
        setSelectedUserId('');
        setIsDialogOpen(false);

        MySwal.fire({
            title: 'Success!',
            text: 'Cash advance request submitted.',
            icon: 'success'
        });
    };

    const handleUpdateStatus = (id: string, status: CashAdvanceRequest['status']) => {
        db.updateCashAdvanceStatus(id, status);

        const request = requests.find(r => r.id === id);
        if (request) {
            db.addActivity({
                type: 'cash_advance',
                avatar: currentUser.name.split(' ').map(n => n[0]).join(''),
                user: currentUser.name,
                action: status === 'paid' ? 'marked as paid' : (status === 'approved' ? 'approved' : 'rejected'),
                target: `cash advance for ${getUserName(request.userId)}`,
                time: 'Just now'
            });
        }

        setRequests(db.getCashAdvanceRequests());
        MySwal.fire('Updated!', `Request has been ${status}.`, 'success');
    };

    const handleDelete = (id: string) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                db.deleteCashAdvanceRequest(id);
                setRequests(db.getCashAdvanceRequests());
                MySwal.fire('Deleted!', 'Request has been deleted.', 'success');
            }
        });
    };

    const getUserName = (userId: string) => {
        const user = db.getUsers().find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-heading font-bold tracking-tight">Cash Advances</h2>
                        <p className="text-muted-foreground">Manage cash advance requests.</p>
                    </div>
                    {!isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 shadow-md">
                                    <Plus className="h-4 w-4" />
                                    Request Cash Advance
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request Cash Advance</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label htmlFor="ca-name" className="text-right pt-2">Name</Label>
                                        <div className="col-span-3 relative">
                                            <Input
                                                id="ca-name"
                                                value={newRequest.name}
                                                onChange={(e) => handleNameInput(e.target.value)}
                                                onFocus={() => newRequest.name && setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                                placeholder="Type employee name..."
                                                autoComplete="off"
                                            />
                                            {showSuggestions && nameSuggestions.length > 0 && (
                                                <ul className="absolute z-50 w-full bg-background border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                                                    {nameSuggestions.map(emp => (
                                                        <li
                                                            key={emp.id}
                                                            className="px-3 py-2 cursor-pointer hover:bg-primary/10 text-sm flex justify-between items-center"
                                                            onMouseDown={() => handleSelectEmployee(emp)}
                                                        >
                                                            <span className="font-medium">{emp.name}</span>
                                                            <span className="text-xs text-muted-foreground">{emp.id}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {showSuggestions && nameSuggestions.length === 0 && newRequest.name && (
                                                <ul className="absolute z-50 w-full bg-background border border-border rounded-md shadow-lg mt-1">
                                                    <li className="px-3 py-2 text-sm text-muted-foreground">No employees found.</li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="ca-empid" className="text-right">Employee ID</Label>
                                        <Input
                                            id="ca-empid"
                                            value={selectedUserId || ''}
                                            readOnly
                                            className="col-span-3 bg-muted cursor-not-allowed"
                                            placeholder="Auto-filled on selection"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="ca-amount" className="text-right">Amount (₱)</Label>
                                        <Input
                                            id="ca-amount"
                                            type="number"
                                            value={newRequest.amount}
                                            onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                                            className="col-span-3"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="ca-purpose" className="text-right">Purpose</Label>
                                        <Textarea
                                            id="ca-purpose"
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
                    )}
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isAdminOrHR && <TableHead>Employee</TableHead>}
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        {isAdminOrHR && <TableCell className="font-medium">{getUserName(req.userId)}</TableCell>}
                                        <TableCell>{req.requestDate}</TableCell>
                                        <TableCell>₱{req.amount.toLocaleString()}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={req.purpose}>{req.purpose}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : req.status === 'paid' ? 'outline' : 'secondary'}
                                                className="capitalize"
                                            >
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isAdmin && req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Approve" onClick={() => handleUpdateStatus(req.id, 'approved')}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Reject" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {isHR && req.status === 'approved' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleUpdateStatus(req.id, 'paid')}>
                                                        Mark as Paid
                                                    </Button>
                                                </div>
                                            )}
                                            {isHR && req.status === 'paid' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground" disabled>
                                                        Paid
                                                    </Button>
                                                </div>
                                            )}
                                            {req.userId === currentUser.id && req.status === 'pending' && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(req.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {visibleRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No requests found.
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
