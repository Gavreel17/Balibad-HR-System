import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Folder, Upload, Cloud, HardDrive, Download, MoreVertical } from "lucide-react";

const files = [
  { name: "Employee Handbook 2024.pdf", size: "2.4 MB", type: "PDF", date: "Jan 15, 2024" },
  { name: "Q1 Payroll Report.xlsx", size: "1.1 MB", type: "Excel", date: "Mar 30, 2024" },
  { name: "Company Policies v2.docx", size: "450 KB", type: "Word", date: "Feb 10, 2024" },
  { name: "Safety Procedures.pdf", size: "3.2 MB", type: "PDF", date: "Jan 20, 2024" },
  { name: "Leave Request Form Template.pdf", size: "120 KB", type: "PDF", date: "Jan 01, 2024" },
  { name: "Onboarding Checklist.xlsx", size: "85 KB", type: "Excel", date: "Jan 05, 2024" },
];

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Documents</h2>
            <p className="text-muted-foreground">Manage and secure company files.</p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-3 border-none shadow-sm">
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Files</TabsTrigger>
                  <TabsTrigger value="contracts">Contracts</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary mr-4">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
