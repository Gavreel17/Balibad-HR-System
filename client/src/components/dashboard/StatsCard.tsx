import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

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
    <Card className="overflow-hidden border-none shadow-premium hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-heading font-bold tracking-tight mb-1">{value}</div>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              trend === "up" ? "bg-green-100 text-green-700" :
                trend === "down" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
            )}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> :
                trend === "down" ? <ArrowDownRight className="h-3 w-3" /> :
                  <Minus className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
          <p className="text-[11px] font-medium text-muted-foreground italic">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
