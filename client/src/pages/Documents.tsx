import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Folder, Upload, Cloud, Trash, Search, Users, Clock, Banknote, FileCheck } from "lucide-react";
import { db, Document } from "@/lib/db";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function Documents() {
  const currentUser = db.getCurrentUser();
  const [documents, setDocuments] = useState<Document[]>(db.getDocuments());
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const employees = db.getUsers();
  const attendance = db.getAttendance();
  const cashAdvances = db.getCashAdvanceRequests();

  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'PDF',
    size: '1.5 MB' // Mock size
  });

  const handleUpload = () => {
    if (!newDoc.name) {
      Swal.fire('Error', 'Please enter a file name', 'error');
      return;
    }

    const doc: Document = {
      id: `d-${Date.now()}`,
      name: newDoc.name,
      type: newDoc.type,
      size: newDoc.size,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.role === 'admin' ? 'Admin' : 'HR'
    };

    db.addDocument(doc);
    setDocuments(db.getDocuments());
    setIsUploadDialogOpen(false);
    setNewDoc({ name: '', type: 'PDF', size: '1.5 MB' });

    Swal.fire({
      title: 'Success!',
      text: 'Document uploaded successfully.',
      icon: 'success'
    });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        db.deleteDocument(id);
        setDocuments(db.getDocuments());
        Swal.fire('Deleted!', 'Document has been deleted.', 'success');
      }
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeName = (userId: string) => {
    return employees.find(u => u.id === userId)?.name || 'Unknown';
  };

  if (!currentUser) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-heading font-bold tracking-tight text-primary">Records & Archives</h2>
            <p className="text-muted-foreground text-lg">Central repository for all company and employee data.</p>
          </div>
          <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-500">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-premium">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">File Name</Label>
                    <Input
                      id="name"
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g. New Policy.pdf"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select value={newDoc.type} onValueChange={(val) => setNewDoc({ ...newDoc, type: val })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Word">Word</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="Image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpload}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-3 border-none shadow-premium bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Enterprise Data Hub
                </CardTitle>
                <div className="relative w-full sm:w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    className="pl-9 h-10 border-none bg-muted/50 focus-visible:ring-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-muted/10 h-12 px-2">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                    <FileText className="mr-2 h-4 w-4" /> Files
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                    <Users className="mr-2 h-4 w-4" /> Team
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                    <Clock className="mr-2 h-4 w-4" /> Attendance
                  </TabsTrigger>
                  <TabsTrigger value="advances" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                    <Banknote className="mr-2 h-4 w-4" /> Advances
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="all" className="m-0 focus-visible:ring-0">
                    {filteredDocuments.length === 0 ? (
                      <div className="text-center py-20">
                        <Folder className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground font-medium">No documents found in the archives.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredDocuments.map((file) => (
                          <div key={file.id} className="flex items-center p-4 rounded-2xl border border-muted/50 hover:border-primary/30 hover:bg-primary/5 transition-all group relative">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 shrink-0 transition-transform group-hover:scale-110">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                              <p className="font-bold text-sm truncate uppercase tracking-tight" title={file.name}>{file.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px] font-bold py-0 h-4">{file.type}</Badge>
                                <span className="text-[10px] text-muted-foreground font-bold">{file.size}</span>
                                <span className="text-[10px] text-muted-foreground italic tracking-tighter">• {file.uploadDate}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="employees" className="m-0 focus-visible:ring-0">
                    <div className="rounded-xl border border-muted/50 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="font-bold">Team Member</TableHead>
                            <TableHead className="font-bold">Branch</TableHead>
                            <TableHead className="font-bold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.map((emp) => (
                            <TableRow key={emp.id} className="hover:bg-muted/20">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border shadow-sm">
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{emp.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-bold leading-none">{emp.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{emp.position}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-bold text-muted-foreground">{emp.branch}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={emp.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize font-bold">
                                  {emp.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="attendance" className="m-0 focus-visible:ring-0">
                    <div className="rounded-xl border border-muted/50 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="font-bold">Employee</TableHead>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="font-bold text-right">Logging</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.slice(0, 15).map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/20">
                              <TableCell className="text-sm font-bold">{getEmployeeName(log.userId)}</TableCell>
                              <TableCell className="text-xs font-bold text-muted-foreground">{log.date}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-bold uppercase",
                                  log.status === 'present' ? "border-green-500 text-green-600 bg-green-50" : "border-amber-500 text-amber-600 bg-amber-50"
                                )}>
                                  {log.status} • {log.timeIn}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="advances" className="m-0 focus-visible:ring-0">
                    <div className="rounded-xl border border-muted/50 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="font-bold">Requested By</TableHead>
                            <TableHead className="font-bold">Amount</TableHead>
                            <TableHead className="font-bold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cashAdvances.map((adv) => (
                            <TableRow key={adv.id} className="hover:bg-muted/20">
                              <TableCell>
                                <div>
                                  <p className="text-sm font-bold leading-none">{getEmployeeName(adv.userId)}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium mt-1 italic tracking-tight">{adv.purpose}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-bold text-primary">₱{adv.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge className={cn(
                                  "text-[10px] font-bold uppercase",
                                  adv.status === 'approved' ? "bg-green-600" : adv.status === 'pending' ? "bg-amber-500" : "bg-destructive"
                                )}>
                                  {adv.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-premium bg-primary text-primary-foreground overflow-hidden group">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Hosting
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 font-medium">
                  Active Database Plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">Usage Metrics</span>
                    <span className="font-bold">4.2%</span>
                  </div>
                  <Progress value={4.2} className="bg-white/20 h-2" />
                  <div className="text-[10px] text-right font-bold text-primary-foreground/60 uppercase tracking-widest">
                    Optimization Required
                  </div>
                </div>
                <Button variant="secondary" className="w-full text-primary font-bold shadow-lg hover:scale-105 transition-transform rounded-xl">
                  Optimize Storage
                </Button>
              </CardContent>
              <div className="absolute -bottom-12 -right-12 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            </Card>

            <Card className="border-none shadow-premium">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 group rounded-xl px-2">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Folder className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">Corporate Policies</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 group rounded-xl px-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Folder className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">Legal Contracts</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 group rounded-xl px-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Folder className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">Financial Ledger</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
