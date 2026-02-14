import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ActivityLog } from "@/lib/db";

interface RecentActivityProps {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-3 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{activity.avatar}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user} <span className="text-muted-foreground font-normal">{activity.action}</span> <span className="font-semibold">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
