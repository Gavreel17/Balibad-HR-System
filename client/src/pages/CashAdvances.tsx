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
import { db, CashAdvanceRequest, UserRole } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function CashAdvancesPage() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return null;
    const [requests, setRequests] = useState(db.getCashAdvanceRequests());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        amount: '',
        purpose: ''
    });

    const isAdmin = currentUser.role === 'admin';
    const isHR = currentUser.role === 'hr';
    const isAdminOrHR = isAdmin || isHR;

    // Filter requests based on role
    // Admin/HR sees all, Employees see only theirs
    const visibleRequests = isAdminOrHR
        ? requests
        : requests.filter(r => r.userId === currentUser.id);

    const [selectedUserId, setSelectedUserId] = useState(currentUser.id);

    // Update selectedUserId if currentUser changes (e.g. re-login)
    // But mostly we want to initialize it to currentUser.id

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
    };

    const getSelectedUser = () => {
        return db.getUsers().find(u => u.id === selectedUserId) || currentUser;
    };

    const handleSubmitRequest = () => {
        if (!newRequest.amount || !newRequest.purpose) {
            MySwal.fire('Error', 'Please fill in all fields', 'error');
            return;
        }

        const request: CashAdvanceRequest = {
            id: `ca-${Date.now()}`,
            userId: selectedUserId,
            amount: parseFloat(newRequest.amount),
            purpose: newRequest.purpose,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        db.addCashAdvanceRequest(request);

        // Send notification to admin if requested by non-admin
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

        setNewRequest({ amount: '', purpose: '' });
        // Reset to current user after submit if desired, or keep selected
        setSelectedUserId(currentUser.id);
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

    const selectedUser = getSelectedUser();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-heading font-bold tracking-tight">Cash Advances</h2>
                        <p className="text-muted-foreground">Manage cash advance requests.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Request Advance
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Cash Advance</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    {isAdminOrHR ? (
                                        <div className="col-span-3">
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={selectedUserId}
                                                onChange={(e) => handleUserSelect(e.target.value)}
                                            >
                                                {db.getUsers().map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <Input
                                            id="name"
                                            value={currentUser.name}
                                            disabled
                                            className="col-span-3 bg-muted"
                                        />
                                    )}
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="empId" className="text-right">Employee ID</Label>
                                    <Input
                                        id="empId"
                                        value={selectedUser.id}
                                        disabled
                                        className="col-span-3 bg-muted"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        className="col-span-3"
                                        placeholder="e.g. 5000"
                                        value={newRequest.amount}
                                        onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="purpose" className="text-right">Purpose</Label>
                                    <Textarea
                                        id="purpose"
                                        className="col-span-3"
                                        placeholder="Reason for cash advance..."
                                        value={newRequest.purpose}
                                        onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSubmitRequest}>Submit Request</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                            {(!isAdminOrHR || req.status !== 'pending') && req.userId === currentUser.id && req.status === 'pending' && (
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
