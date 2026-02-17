import { useState, useEffect } from "react";
import { useLocation } from "wouter";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, MoreHorizontal, Download, Pencil, Trash, Users, UserCheck, CalendarDays, Award, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db, User, UserRole } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Employees() {
  const currentUser = db.getCurrentUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
    } else if (currentUser.role === 'employee') {
      setLocation("/dashboard");
    }
  }, [currentUser, setLocation]);

  if (!currentUser || currentUser.role === 'employee') return null;

  const [users, setUsers] = useState(db.getUsers().filter(u => u.isEmployee));
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    branch: '',
    address: '',
    contactNumber: '',
    department: '',
    position: '',
    salary: '30000',
    status: 'active'
  });

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.branch && newEmployee.department) {
      if (editingId) {
        // Update existing
        db.updateUser(editingId, {
          name: newEmployee.name,
          email: newEmployee.email,
          department: newEmployee.department,
          position: newEmployee.position,
          salary: parseFloat(newEmployee.salary),
          branch: newEmployee.branch,
          address: newEmployee.address,
          contactNumber: newEmployee.contactNumber,
          status: newEmployee.status as 'active' | 'on_leave' | 'terminated'
        });
        MySwal.fire({
          title: 'Updated!',
          text: 'Employee details updated successfully.',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      } else {
        // Create new
        const existingIds = users.map(u => parseInt(u.id.replace(/\D/g, '')) || 0);
        const maxId = Math.max(0, ...existingIds);
        const nextId = (maxId + 1).toString().padStart(3, '0');

        const employee: User = {
          id: nextId,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role as UserRole || 'employee',
          department: newEmployee.department,
          position: newEmployee.position || (newEmployee.role === 'admin' ? 'System Administrator' : newEmployee.role === 'hr' ? 'HR Manager' : 'Staff Member'),
          joinDate: new Date().toISOString().split('T')[0],
          salary: parseFloat(newEmployee.salary) || 30000,
          status: newEmployee.status as 'active' | 'on_leave' | 'terminated',
          branch: newEmployee.branch,
          address: newEmployee.address,
          contactNumber: newEmployee.contactNumber,
          isEmployee: true
        };
        db.addUser(employee);
        MySwal.fire({
          title: 'Success!',
          text: `New employee added successfully with ID ${nextId}.`,
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      }
    }
    setUsers(db.getUsers().filter(u => u.isEmployee));
    resetForm();
    setIsAddDialogOpen(false);
  }

  const resetForm = () => {
    setNewEmployee({
      name: '',
      email: '',
      role: '',
      branch: '',
      address: '',
      contactNumber: '',
      department: '',
      position: '',
      salary: '30000',
      status: 'active'
    });
    setEditingId(null);
  }


  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setNewEmployee({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      address: user.address || '',
      contactNumber: user.contactNumber || '',
      department: user.department,
      position: user.position || '',
      salary: user.salary.toString(),
      status: user.status
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        db.deleteUser(id);
        setUsers(db.getUsers().filter(u => u.isEmployee));
        MySwal.fire(
          'Deleted!',
          'Employee has been deleted.',
          'success'
        );
      }
    });
  };

  const exportEmployees = () => {
    const headers = ["ID", "Name", "Email", "Department", "Position", "Salary", "Join Date", "Status", "Branch"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [
        u.id,
        u.name,
        u.email,
        u.department,
        u.position,
        u.salary,
        u.joinDate,
        u.status,
        u.branch
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    MySwal.fire({
      title: 'Export Success',
      text: 'Employee directory has been exported to CSV.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = [
    { label: 'Total Team', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'On Leave', value: users.filter(u => u.status === 'on_leave').length, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Offboarded', value: users.filter(u => u.status === 'terminated').length, icon: Award, color: 'text-red-600', bg: 'bg-red-500/10' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-heading font-bold tracking-tight text-primary">Team Directory</h2>
            <p className="text-muted-foreground text-lg italic mt-1 font-medium">
              Manage organizational personnel and operational roles.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportEmployees} variant="outline" className="shadow-sm border-primary/20 hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" className="col-span-3" placeholder="John Doe" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" className="col-span-3" placeholder="john@company.com" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="branch" className="text-right">Branch</Label>
                    <Select value={newEmployee.branch} onValueChange={(value) => setNewEmployee({ ...newEmployee, branch: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dimataling">Dimataling</SelectItem>
                        <SelectItem value="Tabina">Tabina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Address</Label>
                    <Input id="address" className="col-span-3" placeholder="123 Main St" value={newEmployee.address} onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right">Contact #</Label>
                    <Input id="contact" className="col-span-3" placeholder="09123456789" value={newEmployee.contactNumber} onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="salary" className="text-right">Salary</Label>
                    <Input id="salary" type="number" className="col-span-3" placeholder="30000" value={newEmployee.salary} onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">Department</Label>
                    <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Inventory">Inventory</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={newEmployee.status} onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddEmployee}>{editingId ? 'Update Employee' : 'Save Employee'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <Card key={i} className="border-none shadow-premium bg-white/80 backdrop-blur-sm group transition-all hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-heading font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl shadow-inner", s.bg, s.color)}>
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">All Employees</CardTitle>
                <p className="text-xs text-muted-foreground font-medium italic">Comprehensive database of all staff members.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="Search personnel..."
                    className="pl-10 h-10 border-none bg-muted focus-visible:ring-1 text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 border-primary/10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Team Member</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">ID</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Position</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Department</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Branch</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-muted-foreground px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-primary/5 transition-all border-b border-muted/50 group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border shadow-sm group-hover:scale-110 transition-transform">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary uppercase">{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground/80">{user.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="text-sm font-medium">{user.position}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase tracking-wider">{user.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'active' ? 'default' : user.status === 'on_leave' ? 'secondary' : 'destructive'}
                        className={cn(
                          "capitalize px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm border mt-1",
                          user.status === 'active' ? "bg-green-50 border-green-200 text-green-700" :
                            user.status === 'on_leave' ? "bg-amber-50 border-amber-200 text-amber-700" :
                              "bg-red-50 border-red-200 text-red-700"
                        )}
                      >
                        {user.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground">{user.branch}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-none">
                          <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">Management</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)} className="rounded-lg cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4 text-blue-500" /> <span className="font-bold">Edit Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 rounded-lg cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" /> <span className="font-bold">Delete Record</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium italic">
                      No personnel records matching your search criteria.
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
