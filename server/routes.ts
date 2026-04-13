import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePasswords } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Users
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    // Exclude passwords from the response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  });

  app.post("/api/login", async (req, res) => {
    const { email, password, role } = req.body;
    console.log(`Login attempt: email=${email}, role=${role}`);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await storage.getUserByEmail(email);

    if (!user) {
      console.log(`Login failed: User ${email} not found`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (role && user.role !== role) {
      console.log(`Login failed: Role mismatch for ${email}. Expected ${user.role}, got ${role}`);
      return res.status(401).json({ message: "Invalid email or role" });
    }

    const isValid = await comparePasswords(password, user.password);
    console.log(`Password comparison for ${email}: ${isValid}`);
    
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { password: _, ...safeUser } = user;
    console.log(`Login success: ${email}, role=${safeUser.role}`);
    res.json(safeUser);
  });

  app.post("/api/users", async (req, res) => {
    const { authCode, ...userData } = req.body;

    // Check authorization code for registering an account
    if (authCode !== "BALIBAD2026") {
      console.warn(`Registration failed: Invalid auth code "${authCode}"`);
      return res.status(403).json({ message: "Invalid authorization code for registration." });
    }

    try {
      const user = await storage.createUser(userData);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user." });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    res.json(user);
  });

  app.delete("/api/users/:id", async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.sendStatus(204);
  });

  // Attendance
  app.get("/api/attendance", async (_req, res) => {
    const records = await storage.getAttendance();
    res.json(records);
  });

  app.post("/api/attendance", async (req, res) => {
    const record = await storage.addAttendance(req.body);
    res.json(record);
  });

  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const records = await storage.addAttendanceBulk(req.body);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to bulk upload attendance." });
    }
  });
  app.patch("/api/attendance/:id", async (req, res) => {
    const record = await storage.updateAttendance(req.params.id, req.body);
    res.json(record);
  });


  // Documents
  app.get("/api/documents", async (_req, res) => {
    const docs = await storage.getDocuments();
    res.json(docs);
  });

  app.post("/api/documents", async (req, res) => {
    const doc = await storage.addDocument(req.body);
    res.json(doc);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    await storage.deleteDocument(req.params.id);
    res.sendStatus(204);
  });

  // Cash Advances
  app.get("/api/cash-advances", async (_req, res) => {
    const advances = await storage.getCashAdvances();
    res.json(advances);
  });

  app.post("/api/cash-advances", async (req, res) => {
    const advance = await storage.addCashAdvance(req.body);
    res.json(advance);
  });

  app.patch("/api/cash-advances/:id/status", async (req, res) => {
    const advance = await storage.updateCashAdvanceStatus(req.params.id, req.body.status);
    res.json(advance);
  });

  app.delete("/api/cash-advances/:id", async (req, res) => {
    await storage.deleteCashAdvance(req.params.id);
    res.sendStatus(204);
  });

  // Activity Logs
  app.get("/api/activity-logs", async (_req, res) => {
    const logs = await storage.getActivityLogs();
    res.json(logs);
  });

  app.post("/api/activity-logs", async (req, res) => {
    const log = await storage.addActivity(req.body);
    res.json(log);
  });

  // System Settings
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  });

  app.patch("/api/settings", async (req, res) => {
    const settings = await storage.updateSystemSettings(req.body);
    res.json(settings);
  });

  return httpServer;
}
