import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Users
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    const user = await storage.createUser(req.body);
    res.json(user);
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
