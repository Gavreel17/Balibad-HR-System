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
    contactNumber: '09123456789'
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
    contactNumber: '09234567890'
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
    contactNumber: '09345678901'
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
    contactNumber: '09456789012'
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
    contactNumber: '09567890123'
  }
];

const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', userId: '003', date: '2024-05-20', timeIn: '08:55 AM', timeOut: '05:00 PM', status: 'present' },
  { id: 'a2', userId: '004', date: '2024-05-20', timeIn: '09:10 AM', timeOut: '05:05 PM', status: 'late' },
  { id: 'a3', userId: '003', date: '2024-05-21', timeIn: '08:50 AM', timeOut: '05:02 PM', status: 'present' },
  { id: 'a4', userId: '004', date: '2024-05-21', timeIn: '08:58 AM', timeOut: '05:00 PM', status: 'present' },
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
  private currentUser: User | null = null;

  login(email: string, role: UserRole) {
    // For prototype, just finding by role/email to simulate login
    const user = this.users.find(u => u.email === email || u.role === role);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  getCurrentUser() {
    return this.currentUser || this.users[0]; // Fallback to admin for dev
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
    return {
      totalEmployees: this.users.filter(u => u.status === 'active').length,
      onTimeToday: this.attendance.filter(a => a.date === today && a.status === 'present').length,
      lateToday: this.attendance.filter(a => a.date === today && a.status === 'late').length,
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
}

export const db = new DataManager();
