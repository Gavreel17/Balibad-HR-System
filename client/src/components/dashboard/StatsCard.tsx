import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend && (
            <span className={cn(
              "font-medium",
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
            )}>
              {trendValue}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
