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
import { FileText, Folder, Upload, Cloud, MoreVertical, Trash, Search, Plus } from "lucide-react";
import { db, Document } from "@/lib/db";
import Swal from 'sweetalert2';

export default function Documents() {
  const currentUser = db.getCurrentUser();
  const [documents, setDocuments] = useState<Document[]>(db.getDocuments());
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
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
      uploadedBy: currentUser.role === 'admin' ? 'Admin' : 'HR'
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Documents</h2>
            <p className="text-muted-foreground">Manage and secure company files.</p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-3 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">File Manager</CardTitle>
              <div className="relative w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Files</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">No documents found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDocuments.map((file) => (
                        <div key={file.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors group relative">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary mr-4">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size} • {file.uploadDate}</p>
                            <p className="text-xs text-muted-foreground">By {file.uploadedBy}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="recent">
                  <div className="text-sm text-muted-foreground">Recent files view not implemented yet.</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Storage
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Enterprise Plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Used</span>
                    <span className="font-bold">45 GB</span>
                  </div>
                  <Progress value={4.5} className="bg-primary-foreground/20" />
                  <div className="text-xs text-right text-primary-foreground/80">
                    of 1 TB Capacity
                  </div>
                </div>
                <Button variant="secondary" className="w-full text-primary font-bold">
                  Upgrade Storage
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                  HR Policies
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4 text-blue-500" />
                  Employee Contracts
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Folder className="mr-2 h-4 w-4 text-green-500" />
                  Financial Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
