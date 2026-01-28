import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  {
    name: "Mon",
    present: 45,
    late: 2,
    absent: 1,
  },
  {
    name: "Tue",
    present: 47,
    late: 1,
    absent: 0,
  },
  {
    name: "Wed",
    present: 44,
    late: 3,
    absent: 1,
  },
  {
    name: "Thu",
    present: 46,
    late: 1,
    absent: 1,
  },
  {
    name: "Fri",
    present: 42,
    late: 4,
    absent: 2,
  },
  {
    name: "Sat",
    present: 30,
    late: 0,
    absent: 0,
  },
  {
    name: "Sun",
    present: 25,
    late: 0,
    absent: 0,
  },
];

export function AttendanceChart() {
  return (
    <Card className="col-span-4 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Weekly Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              cursor={{fill: 'rgba(0,0,0,0.05)'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="present" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
