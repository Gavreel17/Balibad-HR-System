import { apiRequest } from "./queryClient";

export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'terminated';
  branch: string;
  address?: string;
  contactNumber?: string;
  isEmployee: boolean;
  biometricCredential?: string;
  lastLogin?: string;
  isOnline?: boolean;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  status: 'present' | 'late' | 'absent' | 'half_day';
}


export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface ActivityLog {
  id: string;
  avatar: string;
  user: string;
  userRole?: UserRole;
  action: string;
  target: string;
  time: string;
  type: string;
}

export interface CashAdvanceRequest {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestDate: string;
}

export interface SystemSettings {
  companyName: string;
  emailNotifications: boolean;
  biometricEnforced: boolean;
  maintenanceMode: boolean;
  autoBackup: boolean;
  timezone: string;
}

class DataManager {
  private currentUser: User | null = null;
  private settings: SystemSettings | null = null;
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(i => i !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const res = await apiRequest("GET", "/api/settings");
    this.settings = await res.json();
    return this.settings!;
  }

  async updateSystemSettings(data: Partial<SystemSettings>) {
    await apiRequest("PATCH", "/api/settings", data);
    await this.getSystemSettings();
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const saved = localStorage.getItem('hr_current_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch (e) {
          localStorage.removeItem('hr_current_user');
        }
      }
    }
    return this.currentUser;
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('hr_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hr_current_user');
    }
    this.notify();
  }

  async getUsers(): Promise<User[]> {
    const res = await apiRequest("GET", "/api/users");
    return await res.json();
  }

  async addUser(user: Partial<User> & { password?: string, authCode?: string }): Promise<User> {
    const res = await apiRequest("POST", "/api/users", {
      ...user,
      id: user.id || `u-${Date.now()}`
    });
    return await res.json();
  }

  async updateUser(id: string, data: Partial<User>) {
    const res = await apiRequest("PATCH", `/api/users/${id}`, data);
    const updatedUser = await res.json();

    // If the updated user is the current user, update the local storage session
    if (this.currentUser && this.currentUser.id === id) {
      this.setCurrentUser(updatedUser);
    }

    return updatedUser;
  }

  async deleteUser(id: string) {
    await apiRequest("DELETE", `/api/users/${id}`);
  }

  async getAttendance(): Promise<Attendance[]> {
    const res = await apiRequest("GET", "/api/attendance");
    return await res.json();
  }

  async addAttendance(record: Partial<Attendance>) {
    await apiRequest("POST", "/api/attendance", {
      ...record,
      id: record.id || `att-${Date.now()}`
    });
  }

  async addAttendanceBulk(records: Partial<Attendance>[]) {
    await apiRequest("POST", "/api/attendance/bulk", records);
  }

  async updateAttendance(id: string, data: Partial<Attendance>) {
    await apiRequest("PATCH", `/api/attendance/${id}`, data);
  }


  async getDocuments(): Promise<Document[]> {
    const res = await apiRequest("GET", "/api/documents");
    return await res.json();
  }

  async addDocument(doc: Partial<Document>) {
    await apiRequest("POST", "/api/documents", {
      ...doc,
      id: doc.id || `d-${Date.now()}`
    });
  }

  async deleteDocument(id: string) {
    await apiRequest("DELETE", `/api/documents/${id}`);
  }

  async getCashAdvanceRequests(): Promise<CashAdvanceRequest[]> {
    const res = await apiRequest("GET", "/api/cash-advances");
    return await res.json();
  }

  async addCashAdvanceRequest(request: Partial<CashAdvanceRequest>) {
    await apiRequest("POST", "/api/cash-advances", {
      ...request,
      id: request.id || `ca-${Date.now()}`
    });
  }

  async updateCashAdvanceStatus(id: string, status: string) {
    await apiRequest("PATCH", `/api/cash-advances/${id}/status`, { status });
  }

  async deleteCashAdvanceRequest(id: string) {
    await apiRequest("DELETE", `/api/cash-advances/${id}`);
  }

  async getRecentActivity(): Promise<ActivityLog[]> {
    const res = await apiRequest("GET", "/api/activity-logs");
    return await res.json();
  }

  async addActivity(activity: Partial<ActivityLog>) {
    await apiRequest("POST", "/api/activity-logs", {
      ...activity,
      id: activity.id || `act-${Date.now()}`
    });
  }

  async login(email: string, role?: string, password?: string) {
    try {
      const loginData: any = { email, password };
      if (role) {
        loginData.role = role;
      }
      const res = await apiRequest("POST", "/api/login", loginData);
      if (res.ok) {
        const user = await res.json();
        const now = new Date();
        const lastLogin = now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const updatedUser = { ...user, isOnline: true, lastLogin };
        
        try {
          await this.updateUser(user.id, { isOnline: true, lastLogin });
        } catch (e) {
          console.warn("Could not update online status, but proceeding with login:", e);
        }

        this.setCurrentUser(updatedUser);
        return updatedUser;
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `Status ${res.status}`);
      }
    } catch (e: any) {
      console.error("Detailed Login Error:", e);
      throw e;
    }
  }

  async logout() {
    const user = this.getCurrentUser();
    if (user) {
      try {
        await this.updateUser(user.id, { isOnline: false });
      } catch (e) {
        console.error("Failed to update status on logout:", e);
      }
    }
    this.setCurrentUser(null);
  }
}

export const db = new DataManager();
