import { db } from "@/lib/db";
import { useLocation } from "wouter";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";

export default function Dashboard() {
  const user = db.getCurrentUser();
  const [, setLocation] = useLocation();

  // If no user is found, redirect to login
  if (!user) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  // Admin role sees the main dashboard
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // HR and regular employees see their personal dashboard
  return <StaffDashboard user={user} />;
}
