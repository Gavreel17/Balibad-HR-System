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

// Initial Mock Data
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'admin@balibad.store',
    role: 'admin',
    department: 'Management',
    position: 'General Manager',
    joinDate: '2023-01-15',
    salary: 85000,
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Michael Chen',
    email: 'hr@balibad.store',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: '2023-03-10',
    salary: 65000,
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Jessica Alverez',
    email: 'jessica@balibad.store',
    role: 'employee',
    department: 'Sales',
    position: 'Senior Sales Associate',
    joinDate: '2023-06-01',
    salary: 42000,
    status: 'active'
  },
  {
    id: 'u4',
    name: 'David Ross',
    email: 'david@balibad.store',
    role: 'employee',
    department: 'Inventory',
    position: 'Stock Clerk',
    joinDate: '2023-08-15',
    salary: 38000,
    status: 'active'
  },
  {
    id: 'u5',
    name: 'Emily Blunt',
    email: 'emily@balibad.store',
    role: 'employee',
    department: 'Sales',
    position: 'Sales Associate',
    joinDate: '2023-11-20',
    salary: 35000,
    status: 'on_leave'
  }
];

const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', userId: 'u3', date: '2024-05-20', timeIn: '08:55 AM', timeOut: '05:00 PM', status: 'present' },
  { id: 'a2', userId: 'u4', date: '2024-05-20', timeIn: '09:10 AM', timeOut: '05:05 PM', status: 'late' },
  { id: 'a3', userId: 'u3', date: '2024-05-21', timeIn: '08:50 AM', timeOut: '05:02 PM', status: 'present' },
  { id: 'a4', userId: 'u4', date: '2024-05-21', timeIn: '08:58 AM', timeOut: '05:00 PM', status: 'present' },
];

const MOCK_LEAVE: LeaveRequest[] = [
  { id: 'l1', userId: 'u5', type: 'sick', startDate: '2024-05-20', endDate: '2024-05-22', reason: 'Flu', status: 'approved' },
  { id: 'l2', userId: 'u3', type: 'vacation', startDate: '2024-06-15', endDate: '2024-06-20', reason: 'Family Trip', status: 'pending' },
];

// Singleton Data Manager
class DataManager {
  private users: User[] = MOCK_USERS;
  private attendance: Attendance[] = MOCK_ATTENDANCE;
  private leave: LeaveRequest[] = MOCK_LEAVE;
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

  getLeaveRequests() { return this.leave; }
  
  addLeaveRequest(request: LeaveRequest) {
    this.leave = [request, ...this.leave];
  }

  updateLeaveStatus(id: string, status: LeaveRequest['status']) {
    this.leave = this.leave.map(l => l.id === id ? { ...l, status } : l);
  }
}

export const db = new DataManager();
