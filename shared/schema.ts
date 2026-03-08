import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'admin', 'hr', 'employee'
  department: text("department").notNull(),
  position: text("position").notNull(),
  avatar: text("avatar"),
  joinDate: text("join_date").notNull(),
  salary: integer("salary").notNull(),
  status: text("status").notNull(), // 'active', 'terminated'
  branch: text("branch").notNull(),
  address: text("address"),
  contactNumber: text("contact_number"),
  isEmployee: boolean("is_employee").notNull().default(true),
  biometricCredential: text("biometric_credential"),
  lastLogin: text("last_login"),
  isOnline: boolean("is_online").notNull().default(false),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  timeIn: text("time_in").notNull(),
  timeOut: text("time_out"),
  status: text("status").notNull(), // 'present', 'late', 'absent', 'half_day'
});


export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: text("size").notNull(),
  uploadDate: text("upload_date").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  avatar: text("avatar"),
  user: text("user").notNull(),
  userRole: text("user_role"),
  action: text("action").notNull(),
  target: text("target").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
});

export const cashAdvances = pgTable("cash_advances", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected', 'paid'
  requestDate: text("request_date").notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: integer("id").primaryKey(),
  companyName: text("company_name").notNull(),
  emailNotifications: boolean("email_notifications").notNull(),
  biometricEnforced: boolean("biometric_enforced").notNull(),
  maintenanceMode: boolean("maintenance_mode").notNull(),
  autoBackup: boolean("auto_backup").notNull(),
  timezone: text("timezone").notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance);
export const selectAttendanceSchema = createSelectSchema(attendance);
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = z.infer<typeof selectAttendanceSchema>;


export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = z.infer<typeof selectDocumentSchema>;

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = z.infer<typeof selectActivityLogSchema>;

export const insertCashAdvanceSchema = createInsertSchema(cashAdvances);
export const selectCashAdvanceSchema = createSelectSchema(cashAdvances);
export type InsertCashAdvance = z.infer<typeof insertCashAdvanceSchema>;
export type CashAdvance = z.infer<typeof selectCashAdvanceSchema>;

export const insertSystemSettingsSchema = createInsertSchema(systemSettings);
export const selectSystemSettingsSchema = createSelectSchema(systemSettings);
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = z.infer<typeof selectSystemSettingsSchema>;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
