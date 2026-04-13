import "dotenv/config";
import {
  users, attendance, documents, activityLogs, cashAdvances, systemSettings,
  type User, type InsertUser,
  type Attendance, type InsertAttendance,
  type Document, type InsertDocument,
  type ActivityLog, type InsertActivityLog,
  type CashAdvance, type InsertCashAdvance,
  type SystemSettings, type InsertSystemSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Attendance
  getAttendance(): Promise<Attendance[]>;
  addAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, record: Partial<Attendance>): Promise<Attendance>;
  addAttendanceBulk(records: InsertAttendance[]): Promise<Attendance[]>;


  // Documents
  getDocuments(): Promise<Document[]>;
  addDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Cash Advances
  getCashAdvances(): Promise<CashAdvance[]>;
  addCashAdvance(request: InsertCashAdvance): Promise<CashAdvance>;
  updateCashAdvanceStatus(id: string, status: string): Promise<CashAdvance>;
  deleteCashAdvance(id: string): Promise<void>;

  // Activity Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  addActivity(activity: InsertActivityLog): Promise<ActivityLog>;

  // System Settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private attendance: Map<string, Attendance>;
  private documents: Map<string, Document>;
  private cashAdvances: Map<string, CashAdvance>;
  private activityLogs: Map<string, ActivityLog>;
  private systemSettings: SystemSettings | undefined;

  constructor() {
    this.users = new Map();
    this.attendance = new Map();
    this.documents = new Map();
    this.cashAdvances = new Map();
    this.activityLogs = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByUsername(name: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.name === name);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      avatar: insertUser.avatar ?? null,
      address: insertUser.address ?? null,
      contactNumber: insertUser.contactNumber ?? null,
      biometricCredential: insertUser.biometricCredential ?? null,
      lastLogin: insertUser.lastLogin ?? null,
      isEmployee: insertUser.isEmployee ?? true,
      isOnline: insertUser.isOnline ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updateData };
    if (updateData.password) {
      updated.password = await hashPassword(updateData.password);
    }
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  async addAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = record.id || `att-${Date.now()}`;
    const newRecord: Attendance = {
      ...record,
      id,
      timeOut: record.timeOut ?? null,
    };
    this.attendance.set(id, newRecord);
    return newRecord;
  }

  async updateAttendance(id: string, record: Partial<Attendance>): Promise<Attendance> {
    const existing = this.attendance.get(id);
    if (!existing) throw new Error("Attendance record not found");
    const updated = { ...existing, ...record };
    this.attendance.set(id, updated);
    return updated;
  }

  async addAttendanceBulk(records: InsertAttendance[]): Promise<Attendance[]> {
    const results: Attendance[] = [];
    for (const record of records) {
      const id = record.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newRecord: Attendance = {
        ...record,
        id,
        timeOut: record.timeOut ?? null,
      };
      this.attendance.set(id, newRecord);
      results.push(newRecord);
    }
    return results;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async addDocument(doc: InsertDocument): Promise<Document> {
    const id = doc.id || `d-${Date.now()}`;
    const newDoc: Document = { ...doc, id };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  // Cash Advances
  async getCashAdvances(): Promise<CashAdvance[]> {
    return Array.from(this.cashAdvances.values());
  }

  async addCashAdvance(request: InsertCashAdvance): Promise<CashAdvance> {
    const id = request.id || `ca-${Date.now()}`;
    const newRequest: CashAdvance = { ...request, id };
    this.cashAdvances.set(id, newRequest);
    return newRequest;
  }

  async updateCashAdvanceStatus(id: string, status: string): Promise<CashAdvance> {
    const existing = this.cashAdvances.get(id);
    if (!existing) throw new Error("Cash advance not found");
    const updated = { ...existing, status };
    this.cashAdvances.set(id, updated);
    return updated;
  }

  async deleteCashAdvance(id: string): Promise<void> {
    this.cashAdvances.delete(id);
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).sort((a, b) => b.time.localeCompare(a.time));
  }

  async addActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const id = activity.id || `act-${Date.now()}`;
    const newActivity: ActivityLog = {
      ...activity,
      id,
      avatar: activity.avatar ?? null,
      userRole: activity.userRole ?? null,
    };
    this.activityLogs.set(id, newActivity);
    return newActivity;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    return this.systemSettings;
  }

  async updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings> {
    const updated: SystemSettings = { ...settings, id: 1 };
    this.systemSettings = updated;
    return updated;
  }
}
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const hashedPassword = await hashPassword(insertUser.password || "Employee123!");
    const userData = {
      ...insertUser,
      id,
      password: hashedPassword,
      avatar: insertUser.avatar ?? null,
      address: insertUser.address ?? null,
      contactNumber: insertUser.contactNumber ?? null,
      biometricCredential: insertUser.biometricCredential ?? null,
      lastLogin: insertUser.lastLogin ?? null,
      isEmployee: insertUser.isEmployee ?? true,
      isOnline: insertUser.isOnline ?? false,
    };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const finalUpdateData = { ...updateData };
    if (finalUpdateData.password) {
      finalUpdateData.password = await hashPassword(finalUpdateData.password);
    }
    const [user] = await db.update(users).set(finalUpdateData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async addAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = record.id || `att-${Date.now()}`;
    const [newRecord] = await db.insert(attendance).values({ 
      ...record, 
      id,
      timeOut: record.timeOut ?? null
    }).returning();
    return newRecord;
  }

  async updateAttendance(id: string, record: Partial<Attendance>): Promise<Attendance> {
    const [updated] = await db.update(attendance).set(record).where(eq(attendance.id, id)).returning();
    return updated;
  }

  async addAttendanceBulk(records: InsertAttendance[]): Promise<Attendance[]> {
    const formattedRecords = records.map(record => ({
      ...record,
      id: record.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timeOut: record.timeOut ?? null
    }));
    
    return await db.insert(attendance).values(formattedRecords).returning();
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async addDocument(doc: InsertDocument): Promise<Document> {
    const id = doc.id || `d-${Date.now()}`;
    const [newDoc] = await db.insert(documents).values({ ...doc, id }).returning();
    return newDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Cash Advances
  async getCashAdvances(): Promise<CashAdvance[]> {
    return await db.select().from(cashAdvances);
  }

  async addCashAdvance(request: InsertCashAdvance): Promise<CashAdvance> {
    const id = request.id || `ca-${Date.now()}`;
    const [newRequest] = await db.insert(cashAdvances).values({ ...request, id }).returning();
    return newRequest;
  }

  async updateCashAdvanceStatus(id: string, status: string): Promise<CashAdvance> {
    const [updated] = await db.update(cashAdvances).set({ status }).where(eq(cashAdvances.id, id)).returning();
    return updated;
  }

  async deleteCashAdvance(id: string): Promise<void> {
    await db.delete(cashAdvances).where(eq(cashAdvances.id, id));
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.time));
  }

  async addActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const id = activity.id || `act-${Date.now()}`;
    const [newActivity] = await db.insert(activityLogs).values({ 
      ...activity, 
      id,
      avatar: activity.avatar ?? null,
      userRole: activity.userRole ?? null
    }).returning();
    return newActivity;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).where(eq(systemSettings.id, 1));
    return settings;
  }

  async updateSystemSettings(settings: InsertSystemSettings): Promise<SystemSettings> {
    const [updated] = await db.insert(systemSettings)
      .values({ ...settings, id: 1 })
      .onConflictDoUpdate({
        target: systemSettings.id,
        set: settings
      })
      .returning();
    return updated;
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
