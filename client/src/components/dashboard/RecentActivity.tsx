import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActivityLog } from "@/lib/db";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-3 border-none shadow-premium bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-heading font-bold">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex items-start group">
              {index !== activities.length - 1 && (
                <span className="absolute left-[18px] top-10 h-full w-[1px] bg-border transition-colors group-hover:bg-primary/30" />
              )}
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm z-10">
                <AvatarFallback className={cn(
                  "text-[10px] font-bold",
                  activity.type === 'attendance' ? "bg-green-100 text-green-700" :
                    activity.type === 'leave' ? "bg-indigo-100 text-indigo-700" :
                      "bg-amber-100 text-amber-700"
                )}>
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 pb-4">
                <p className="text-sm font-semibold leading-none text-foreground/90">
                  {activity.user}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  {activity.action} <span className="font-bold text-foreground/80">{activity.target}</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">No recent activity detected.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
