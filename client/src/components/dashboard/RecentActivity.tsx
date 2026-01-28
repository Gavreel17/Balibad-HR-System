import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    user: "Sarah Jenkins",
    action: "approved leave request for",
    target: "Emily Blunt",
    time: "2 hours ago",
    avatar: "SJ"
  },
  {
    user: "Michael Chen",
    action: "added new employee",
    target: "David Ross",
    time: "4 hours ago",
    avatar: "MC"
  },
  {
    user: "System",
    action: "generated monthly payroll report",
    target: "April 2024",
    time: "Yesterday",
    avatar: "SYS"
  },
  {
    user: "Emily Blunt",
    action: "submitted leave request",
    target: "Sick Leave",
    time: "Yesterday",
    avatar: "EB"
  }
];

export function RecentActivity() {
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
