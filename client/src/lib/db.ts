// Mock Data Store for BALIBAD STORE HRMS

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
  status: 'active' | 'on_leave' | 'terminated';
  branch: string;
  address?: string;
  contactNumber?: string;
  isEmployee: boolean;
  biometricCredential?: string; // Stored as base64 or JSON string
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  status: 'present' | 'late' | 'absent' | 'half_day';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
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

// Initial Mock Data

const MOCK_USERS: User[] = [
  {
    id: '001',
    name: 'Sarah Jenkins',
    email: 'admin@balibad.store',
    role: 'admin',
    department: 'Management',
    position: 'General Manager',
    joinDate: '2023-01-15',
    salary: 85000,
    status: 'active',
    branch: 'Dimataling',
    address: 'Dimataling, Zamboanga del Sur',
    contactNumber: '09123456789',
    isEmployee: true
  },
  {
    id: '002',
    name: 'Michael Chen',
    email: 'hr@balibad.store',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: '2023-03-10',
    salary: 65000,
    status: 'active',
    branch: 'Tabina',
    address: 'Tabina, Zamboanga del Sur',
    contactNumber: '09234567890',
    isEmployee: true
  },
  {
    id: '003',
    name: 'Jessica Alverez',
    email: 'jessica@balibad.store',
    role: 'employee',
    department: 'Sales',
    position: 'Senior Sales Associate',
    joinDate: '2023-06-01',
    salary: 42000,
    status: 'active',
    branch: 'Dimataling',
    address: 'Dimataling ZDS',
    contactNumber: '09345678901',
    isEmployee: true
  },
  {
    id: '004',
    name: 'David Ross',
    email: 'david@balibad.store',
    role: 'employee',
    department: 'Inventory',
    position: 'Stock Clerk',
    joinDate: '2023-08-15',
    salary: 38000,
    status: 'active',
    branch: 'Tabina',
    address: 'Tabina ZDS',
    contactNumber: '09456789012',
    isEmployee: true
  },
  {
    id: '005',
    name: 'Emily Blunt',
    email: 'emily@balibad.store',
    role: 'employee',
    department: 'Sales',
    position: 'Sales Associate',
    joinDate: '2023-11-20',
    salary: 35000,
    status: 'on_leave',
    branch: 'Dimataling',
    address: 'Dimataling ZDS',
    contactNumber: '09567890123',
    isEmployee: true
  }
];

const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', userId: '003', date: '2024-05-20', timeIn: '08:55 AM', timeOut: '05:00 PM', status: 'present' },
  { id: 'a2', userId: '004', date: '2024-05-20', timeIn: '09:10 AM', timeOut: '05:05 PM', status: 'late' },
  { id: 'a3', userId: '003', date: '2024-05-21', timeIn: '08:50 AM', timeOut: '05:02 PM', status: 'present' },
  { id: 'a4', userId: '004', date: '2024-05-21', timeIn: '08:58 AM', timeOut: '05:00 PM', status: 'present' },
  { id: 'a5', userId: '003', date: '2026-02-10', timeIn: '-', status: 'absent' },
  { id: 'a6', userId: '004', date: '2026-02-10', timeIn: '-', status: 'absent' },
  { id: 'a7', userId: '003', date: '2026-02-12', timeIn: '-', status: 'absent' },
];

const MOCK_LEAVE: LeaveRequest[] = [
  { id: 'l1', userId: '005', type: 'sick', startDate: '2024-05-20', endDate: '2024-05-22', reason: 'Flu', status: 'approved' },
  { id: 'l2', userId: '003', type: 'vacation', startDate: '2024-06-15', endDate: '2024-06-20', reason: 'Family Trip', status: 'pending' },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', name: 'Employee Handbook', type: 'PDF', size: '2.5 MB', uploadDate: '2024-01-15', uploadedBy: 'Admin' },
  { id: 'd2', name: 'Payroll Policy', type: 'DOCX', size: '1.2 MB', uploadDate: '2024-02-10', uploadedBy: 'HR' },
  { id: 'd3', name: 'Safety Guidelines', type: 'PDF', size: '3.1 MB', uploadDate: '2024-03-05', uploadedBy: 'Admin' },
];

const MOCK_CASH_ADVANCES: CashAdvanceRequest[] = [
  { id: 'ca1', userId: '003', amount: 5000, purpose: 'Medical emergency', status: 'pending', requestDate: '2024-05-20' },
  { id: 'ca2', userId: '004', amount: 3000, purpose: 'Family support', status: 'approved', requestDate: '2024-05-18' },
];

const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'a1', type: 'attendance', avatar: 'JA', user: 'Jessica Alverez', action: 'checked in', target: 'on time', time: '2 hours ago' },
  { id: 'a2', type: 'leave', avatar: 'EB', user: 'Emily Blunt', action: 'requested', target: 'sick leave', time: '4 hours ago' },
  { id: 'a3', type: 'cash_advance', avatar: 'DR', user: 'David Ross', action: 'requested', target: 'cash advance', time: '1 day ago' },
];

// Singleton Data Manager
class DataManager {
  private users: User[] = MOCK_USERS;
  private attendance: Attendance[] = MOCK_ATTENDANCE;
  private leave: LeaveRequest[] = MOCK_LEAVE;
  private documents: Document[] = MOCK_DOCUMENTS;
  private cashAdvances: CashAdvanceRequest[] = MOCK_CASH_ADVANCES;
  private activities: ActivityLog[] = MOCK_ACTIVITIES;
  private archives: any[] = [];
  private currentUser: User | null = null;
  private systemSettings: SystemSettings = {
    companyName: 'BALIBAD STORE',
    emailNotifications: true,
    biometricEnforced: true,
    maintenanceMode: false,
    autoBackup: true,
    timezone: 'GMT+8 (Manila)'
  };

  getSystemSettings() {
    const saved = localStorage.getItem('hrms_settings');
    if (saved) {
      try {
        this.systemSettings = { ...this.systemSettings, ...JSON.parse(saved) };
      } catch (e) { }
    }
    return this.systemSettings;
  }

  updateSystemSettings(data: Partial<SystemSettings>) {
    this.systemSettings = { ...this.systemSettings, ...data };
    localStorage.setItem('hrms_settings', JSON.stringify(this.systemSettings));
  }


  updateCurrentUser(data: Partial<User>) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...data };
      this.users = this.users.map(u => u.id === this.currentUser?.id ? this.currentUser : u);
      localStorage.setItem('hrms_user', JSON.stringify(this.currentUser));
    }
  }

  getArchives() { return this.archives; }

  archiveData(type: string) {
    let movedCount = 0;
    if (type === 'attendance') {
      const oldRecords = this.attendance.filter(a => {
        const recordDate = new Date(a.date);
        const threshold = new Date();
        threshold.setMonth(threshold.getMonth() - 2); // Archive older than 2 months
        return recordDate < threshold;
      });
      this.archives = [...this.archives, ...oldRecords.map(r => ({ ...r, archiveType: 'attendance', archivedAt: new Date().toISOString() }))];
      this.attendance = this.attendance.filter(a => !oldRecords.includes(a));
      movedCount = oldRecords.length;
    }
    return movedCount;
  }

  login(email: string, role: UserRole) {
    // Strict matching for production feel even in mock
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('hrms_user', JSON.stringify(user));
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('hrms_user');
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const saved = localStorage.getItem('hrms_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch (e) {
          localStorage.removeItem('hrms_user');
        }
      }
    }
    return this.currentUser;
  }

  getUsers() { return this.users; }

  addUser(user: User) {
    this.users = [...this.users, user];
    return user;
  }

  updateUser(id: string, data: Partial<User>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...data } : u);
  }

  deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
  }

  getAttendance() { return this.attendance; }

  addAttendance(record: Attendance) {
    this.attendance = [record, ...this.attendance];
  }

  updateAttendance(id: string, data: Partial<Attendance>) {
    this.attendance = this.attendance.map(a => a.id === id ? { ...a, ...data } : a);
  }

  getLeaveRequests() { return this.leave; }

  addLeaveRequest(request: LeaveRequest) {
    this.leave = [request, ...this.leave];
  }

  updateLeaveStatus(id: string, status: LeaveRequest['status']) {
    this.leave = this.leave.map(l => l.id === id ? { ...l, status } : l);
  }

  getDocuments() { return this.documents; }

  addDocument(doc: Document) {
    this.documents = [doc, ...this.documents];
  }

  deleteDocument(id: string) {
    this.documents = this.documents.filter(d => d.id !== id);
  }

  getCashAdvanceRequests() { return this.cashAdvances; }

  addCashAdvanceRequest(request: CashAdvanceRequest) {
    this.cashAdvances = [request, ...this.cashAdvances];
  }

  updateCashAdvanceStatus(id: string, status: CashAdvanceRequest['status']) {
    this.cashAdvances = this.cashAdvances.map(ca => ca.id === id ? { ...ca, status } : ca);
  }

  deleteCashAdvanceRequest(id: string) {
    this.cashAdvances = this.cashAdvances.filter(ca => ca.id !== id);
  }

  addActivity(activity: Omit<ActivityLog, 'id'>) {
    const newActivity: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}`
    };
    this.activities = [newActivity, ...this.activities];
  }

  getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = this.attendance.filter(a => a.date === today);
    const activeStaff = this.users.filter(u => u.status === 'active').length;
    return {
      totalEmployees: activeStaff,
      onTimeToday: todaysRecords.filter(a => a.status === 'present').length,
      lateToday: todaysRecords.filter(a => a.status === 'late').length,
      absentToday: Math.max(0, activeStaff - todaysRecords.length),
      pendingAdvances: this.cashAdvances.filter(ca => ca.status === 'pending').length,
    };
  }

  getWeeklyAttendance() {
    // Mock weekly data
    return [
      { day: 'Mon', present: 12, late: 2, absent: 1 },
      { day: 'Tue', present: 14, late: 1, absent: 0 },
      { day: 'Wed', present: 13, late: 3, absent: 1 },
      { day: 'Thu', present: 15, late: 0, absent: 0 },
      { day: 'Fri', present: 11, late: 4, absent: 2 },
    ];
  }

  getRecentActivity(): ActivityLog[] {
    return this.activities;
  }

  getBranchDistribution() {
    const branches: Record<string, number> = {};
    this.users.filter(u => u.isEmployee).forEach(u => {
      branches[u.branch] = (branches[u.branch] || 0) + 1;
    });
    return Object.entries(branches).map(([name, value]) => ({ name, value }));
  }

  getLeaveBalance(userId: string) {
    // Mock leave balance data
    return {
      total: 15,
      used: this.leave.filter(l => l.userId === userId && l.status === 'approved').length * 2, // simplified
      pending: this.leave.filter(l => l.userId === userId && l.status === 'pending').length
    };
  }
}

export const db = new DataManager();
