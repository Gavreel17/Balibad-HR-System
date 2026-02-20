import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActivityLog } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, ShieldAlert } from "lucide-react";

interface RecentActivityProps {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const staffActivities = activities.filter(a => a.userRole === 'employee');
  const adminActivities = activities.filter(a => a.userRole === 'admin' || a.userRole === 'hr');

  const renderActivityList = (list: ActivityLog[]) => (
    <div className="space-y-6">
      {list.map((activity, index) => (
        <div key={activity.id} className="relative flex items-start group">
          {index !== list.length - 1 && (
            <span className="absolute left-[18px] top-10 h-full w-[1px] bg-border transition-colors group-hover:bg-primary/30" />
          )}
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm z-10">
            <AvatarFallback className={cn(
              "text-[10px] font-bold",
              activity.type === 'attendance' ? "bg-green-100 text-green-700" :
                activity.type === 'leave' ? "bg-indigo-100 text-indigo-700" :
                  activity.type === 'payroll' ? "bg-purple-100 text-purple-700" :
                    "bg-amber-100 text-amber-700"
            )}>
              {activity.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none text-foreground/90">
                {activity.user}
              </p>
              {activity.userRole !== 'employee' && (
                <ShieldAlert className="h-3 w-3 text-primary animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              {activity.action} <span className="font-bold text-foreground/80">{activity.target}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">No recent activity detected.</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="col-span-3 border-none shadow-premium bg-card/50 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl font-heading font-bold">Activity Ledger</CardTitle>
        <CardDescription>Real-time audit of system interactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 mb-6 rounded-xl h-10">
            <TabsTrigger value="staff" className="rounded-lg font-bold text-xs flex items-center gap-2">
              <User className="h-3 w-3" /> Staff Logs
            </TabsTrigger>
            <TabsTrigger value="admin" className="rounded-lg font-bold text-xs flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Admin Logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="staff" className="animate-in fade-in duration-300">
            {renderActivityList(staffActivities)}
          </TabsContent>
          <TabsContent value="admin" className="animate-in fade-in duration-300">
            {renderActivityList(adminActivities)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
