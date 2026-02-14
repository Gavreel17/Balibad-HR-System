import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";

export default function Dashboard() {
  const user = db.getCurrentUser();

  // Admin role sees the main dashboard
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // HR and regular employees see their personal dashboard
  return <StaffDashboard user={user} />;
}
