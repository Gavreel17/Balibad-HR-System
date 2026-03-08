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

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Attendance
  getAttendance(): Promise<Attendance[]>;
  addAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, record: Partial<Attendance>): Promise<Attendance>;


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

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
    const [user] = await db.insert(users).values({ ...insertUser, id }).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
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
    const [newRecord] = await db.insert(attendance).values({ ...record, id }).returning();
    return newRecord;
  }

  async updateAttendance(id: string, record: Partial<Attendance>): Promise<Attendance> {
    const [updated] = await db.update(attendance).set(record).where(eq(attendance.id, id)).returning();
    return updated;
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
    const [newActivity] = await db.insert(activityLogs).values({ ...activity, id }).returning();
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

export const storage = new DatabaseStorage();
