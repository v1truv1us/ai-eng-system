import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/context/session.ts
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// src/context/types.ts
var DEFAULT_CONFIG = {
  storagePath: ".ai-context",
  maxMemoriesPerType: 100,
  sessionArchiveDays: 30,
  confidenceDecayRate: 0.05,
  enableEmbeddings: false,
  defaultSkillTier: 1,
  enableAutoInference: true,
  export: {
    enabled: false,
    markdown: {
      outputDir: ".ai-context/exports"
    }
  }
};

// src/context/session.ts
class SessionManager {
  config;
  currentSession = null;
  sessionsDir;
  currentSessionPath;
  archiveDir;
  auditLog = [];
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionsDir = join(this.config.storagePath, "sessions");
    this.currentSessionPath = join(this.sessionsDir, "current.json");
    this.archiveDir = join(this.sessionsDir, "archive");
  }
  async initialize() {
    await mkdir(this.sessionsDir, { recursive: true });
    await mkdir(this.archiveDir, { recursive: true });
  }
  async startSession(metadata = {}) {
    const existing = await this.loadCurrentSession();
    if (existing) {
      existing.lastActive = new Date().toISOString();
      existing.metadata = { ...existing.metadata, ...metadata };
      await this.saveSession(existing);
      this.currentSession = existing;
      return existing;
    }
    const session = this.createSession(metadata);
    await this.saveSession(session);
    this.currentSession = session;
    return session;
  }
  getSession() {
    return this.currentSession;
  }
  createSession(metadata = {}) {
    const now = new Date().toISOString();
    return {
      id: this.generateSessionId(),
      createdAt: now,
      lastActive: now,
      workbench: {
        activeFiles: [],
        pendingTasks: [],
        decisions: [],
        context: {}
      },
      metadata: {
        project: metadata.project || process.cwd(),
        branch: metadata.branch,
        mode: metadata.mode,
        platform: metadata.platform
      }
    };
  }
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess_${timestamp}_${random}`;
  }
  async loadCurrentSession() {
    if (!existsSync(this.currentSessionPath)) {
      return null;
    }
    try {
      const content = await readFile(this.currentSessionPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to load session:", error);
      return null;
    }
  }
  async saveSession(session) {
    await writeFile(this.currentSessionPath, JSON.stringify(session, null, 2));
  }
  async addActiveFile(path) {
    if (!this.currentSession)
      return;
    if (!this.currentSession.workbench.activeFiles.includes(path)) {
      this.currentSession.workbench.activeFiles.push(path);
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  async removeActiveFile(path) {
    if (!this.currentSession)
      return;
    const index = this.currentSession.workbench.activeFiles.indexOf(path);
    if (index > -1) {
      this.currentSession.workbench.activeFiles.splice(index, 1);
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  getActiveFiles() {
    return this.currentSession?.workbench.activeFiles || [];
  }
  async archiveCurrentSession() {
    if (!this.currentSession) {
      throw new Error("No active session to archive");
    }
    const archivePath = join(this.archiveDir, `${this.currentSession.id}.json`);
    await writeFile(archivePath, JSON.stringify(this.currentSession, null, 2));
    this.currentSession = null;
    if (existsSync(this.currentSessionPath)) {
      await writeFile(this.currentSessionPath, "");
    }
  }
  buildContextEnvelope(requestId, depth = 0, previousResults = [], taskContext = {}, memoryManager) {
    if (!this.currentSession) {
      throw new Error("No active session for context envelope");
    }
    const memories = memoryManager ? {
      declarative: [],
      procedural: [],
      episodic: []
    } : {
      declarative: [],
      procedural: [],
      episodic: []
    };
    return {
      session: {
        id: this.currentSession.id,
        parentID: this.currentSession.parentID,
        activeFiles: this.currentSession.workbench.activeFiles,
        pendingTasks: this.currentSession.workbench.pendingTasks,
        decisions: this.currentSession.workbench.decisions
      },
      memories,
      previousResults,
      taskContext,
      meta: {
        requestId,
        timestamp: new Date,
        depth
      }
    };
  }
  recordHandoff(correlationId, fromAgent, toAgent, contextSize, success, reason) {
    if (!this.currentSession)
      return;
    const record = {
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      correlationId,
      fromAgent,
      toAgent,
      timestamp: new Date,
      contextSize,
      success,
      reason,
      sessionId: this.currentSession.id
    };
    this.auditLog.push(record);
    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(-100);
    }
  }
  getAuditTrail(correlationId) {
    return this.auditLog.filter((record) => record.correlationId === correlationId);
  }
  getAllAuditRecords() {
    return [...this.auditLog];
  }
  generateCorrelationId() {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  serializeContextEnvelope(envelope) {
    const limitedEnvelope = {
      ...envelope,
      session: {
        ...envelope.session,
        activeFiles: envelope.session.activeFiles.slice(0, 10),
        pendingTasks: envelope.session.pendingTasks.slice(0, 5),
        decisions: envelope.session.decisions.slice(0, 5)
      },
      memories: {
        declarative: envelope.memories.declarative.slice(0, 3),
        procedural: envelope.memories.procedural.slice(0, 3),
        episodic: envelope.memories.episodic.slice(0, 3)
      },
      previousResults: envelope.previousResults.slice(0, 3)
    };
    return JSON.stringify(limitedEnvelope, null, 2);
  }
  mergeContextEnvelopes(envelopes, strategy = "last-wins") {
    if (envelopes.length === 0) {
      throw new Error("Cannot merge empty envelope array");
    }
    if (envelopes.length === 1) {
      return envelopes[0];
    }
    const baseEnvelope = envelopes[0];
    const allPreviousResults = envelopes.flatMap((e) => e.previousResults);
    const mergedPreviousResults = this.deduplicatePreviousResults(allPreviousResults);
    const mergedTaskContext = this.mergeTaskContexts(envelopes.map((e) => e.taskContext), strategy);
    return {
      ...baseEnvelope,
      previousResults: mergedPreviousResults,
      taskContext: mergedTaskContext,
      meta: {
        ...baseEnvelope.meta,
        mergedFrom: envelopes.length,
        mergeStrategy: strategy
      }
    };
  }
  deduplicatePreviousResults(results) {
    const seen = new Set;
    return results.filter((result) => {
      const key = `${result.agentType}-${JSON.stringify(result.output)}`;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    });
  }
  mergeTaskContexts(contexts, strategy) {
    const merged = {};
    const allKeys = new Set;
    contexts.forEach((ctx) => {
      if (ctx)
        Object.keys(ctx).forEach((key) => allKeys.add(key));
    });
    for (const key of allKeys) {
      const values = contexts.map((ctx) => ctx?.[key]).filter((val) => val !== undefined);
      if (values.length === 0)
        continue;
      switch (strategy) {
        case "last-wins":
          merged[key] = values[values.length - 1];
          break;
        case "consensus": {
          const counts = new Map;
          values.forEach((val) => counts.set(val, (counts.get(val) || 0) + 1));
          let maxCount = 0;
          let consensusValue = values[0];
          counts.forEach((count, value) => {
            if (count > maxCount) {
              maxCount = count;
              consensusValue = value;
            }
          });
          merged[key] = consensusValue;
          break;
        }
        case "priority":
          merged[key] = values[values.length - 1];
          break;
        default:
          merged[key] = values[0];
      }
    }
    return merged;
  }
  async addTask(content, priority = "medium") {
    if (!this.currentSession) {
      throw new Error("No active session");
    }
    const task = {
      id: `task_${Date.now().toString(36)}`,
      content,
      status: "pending",
      priority,
      createdAt: new Date().toISOString()
    };
    this.currentSession.workbench.pendingTasks.push(task);
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
    return task;
  }
  async updateTaskStatus(taskId, status) {
    if (!this.currentSession)
      return;
    const task = this.currentSession.workbench.pendingTasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === "completed") {
        task.completedAt = new Date().toISOString();
      }
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  getTasks() {
    return this.currentSession?.workbench.pendingTasks || [];
  }
  getPendingTasks() {
    return this.getTasks().filter((t) => t.status === "pending" || t.status === "in_progress");
  }
  async addDecision(title, description, rationale, options) {
    if (!this.currentSession) {
      throw new Error("No active session");
    }
    const decision = {
      id: `dec_${Date.now().toString(36)}`,
      title,
      description,
      rationale,
      alternatives: options?.alternatives,
      createdAt: new Date().toISOString(),
      tags: options?.tags || []
    };
    this.currentSession.workbench.decisions.push(decision);
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
    return decision;
  }
  getDecisions() {
    return this.currentSession?.workbench.decisions || [];
  }
  async setContext(key, value) {
    if (!this.currentSession)
      return;
    this.currentSession.workbench.context[key] = value;
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
  }
  getContext(key) {
    return this.currentSession?.workbench.context[key];
  }
  getAllContext() {
    return this.currentSession?.workbench.context || {};
  }
  async archiveSession() {
    if (!this.currentSession)
      return;
    const archivePath = join(this.archiveDir, `${this.currentSession.id}.json`);
    await writeFile(archivePath, JSON.stringify(this.currentSession, null, 2));
    if (existsSync(this.currentSessionPath)) {
      const { rm } = await import("node:fs/promises");
      await rm(this.currentSessionPath);
    }
    this.currentSession = null;
  }
  async listArchivedSessions() {
    if (!existsSync(this.archiveDir)) {
      return [];
    }
    const files = await readdir(this.archiveDir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  }
  async loadArchivedSession(sessionId) {
    const archivePath = join(this.archiveDir, `${sessionId}.json`);
    if (!existsSync(archivePath)) {
      return null;
    }
    try {
      const content = await readFile(archivePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load archived session ${sessionId}:`, error);
      return null;
    }
  }
  getSessionSummary() {
    if (!this.currentSession) {
      return "No active session.";
    }
    const { workbench, metadata } = this.currentSession;
    const pendingTasks = this.getPendingTasks();
    const lines = [
      `## Session: ${this.currentSession.id}`,
      `Project: ${metadata.project}`,
      metadata.branch ? `Branch: ${metadata.branch}` : null,
      metadata.mode ? `Mode: ${metadata.mode}` : null,
      "",
      `### Active Files (${workbench.activeFiles.length})`,
      ...workbench.activeFiles.slice(0, 10).map((f) => `- ${f}`),
      workbench.activeFiles.length > 10 ? `- ... and ${workbench.activeFiles.length - 10} more` : null,
      "",
      `### Pending Tasks (${pendingTasks.length})`,
      ...pendingTasks.slice(0, 5).map((t) => `- [${t.priority}] ${t.content}`),
      pendingTasks.length > 5 ? `- ... and ${pendingTasks.length - 5} more` : null,
      "",
      `### Recent Decisions (${workbench.decisions.length})`,
      ...workbench.decisions.slice(-3).map((d) => `- ${d.title}: ${d.rationale.substring(0, 100)}...`)
    ];
    return lines.filter(Boolean).join(`
`);
  }
}
var defaultManager = null;
function getSessionManager(config) {
  if (!defaultManager) {
    defaultManager = new SessionManager(config);
  }
  return defaultManager;
}
export {
  getSessionManager,
  SessionManager
};

//# debugId=B6D4544A5ABB728764756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbnRleHQvc2Vzc2lvbi50cyIsICIuLi9zcmMvY29udGV4dC90eXBlcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFNlc3Npb24gTWFuYWdlclxuICpcbiAqIE1hbmFnZXMgcGVyc2lzdGVudCBzZXNzaW9uIHN0YXRlIHRoYXQgc3Vydml2ZXMgY29udmVyc2F0aW9uIHJlc3RhcnRzLlxuICogU2Vzc2lvbnMgYWN0IGFzIFwid29ya2JlbmNoZXNcIiBjb250YWluaW5nIGFjdGl2ZSBmaWxlcywgcGVuZGluZyB0YXNrcyxcbiAqIGRlY2lzaW9ucywgYW5kIGFyYml0cmFyeSBjb250ZXh0IGRhdGEuXG4gKi9cblxuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBta2RpciwgcmVhZEZpbGUsIHJlYWRkaXIsIHdyaXRlRmlsZSB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHR5cGUge1xuICAgIEFnZW50VHlwZSxcbiAgICBDb25maWRlbmNlTGV2ZWwsXG4gICAgQ29udGV4dEVudmVsb3BlLFxuICAgIE1lbW9yeUVudHJ5LFxufSBmcm9tIFwiLi4vYWdlbnRzL3R5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQ29udGV4dENvbmZpZyxcbiAgICBEZWNpc2lvbixcbiAgICBTZXNzaW9uLFxuICAgIFNlc3Npb25NZXRhZGF0YSxcbiAgICBTZXNzaW9uV29ya2JlbmNoLFxuICAgIFRhc2ssXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogQXVkaXQgcmVjb3JkIGZvciBoYW5kb2ZmIG9wZXJhdGlvbnNcbiAqL1xuaW50ZXJmYWNlIEhhbmRvZmZBdWRpdFJlY29yZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjb3JyZWxhdGlvbklkOiBzdHJpbmc7XG4gICAgZnJvbUFnZW50OiBzdHJpbmc7XG4gICAgdG9BZ2VudDogc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBjb250ZXh0U2l6ZTogbnVtYmVyO1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgcmVhc29uPzogc3RyaW5nO1xuICAgIHNlc3Npb25JZDogc3RyaW5nO1xufVxuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgU2Vzc2lvbk1hbmFnZXIge1xuICAgIHByaXZhdGUgY29uZmlnOiBDb250ZXh0Q29uZmlnO1xuICAgIHByaXZhdGUgY3VycmVudFNlc3Npb246IFNlc3Npb24gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNlc3Npb25zRGlyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBjdXJyZW50U2Vzc2lvblBhdGg6IHN0cmluZztcbiAgICBwcml2YXRlIGFyY2hpdmVEaXI6IHN0cmluZztcbiAgICBwcml2YXRlIGF1ZGl0TG9nOiBIYW5kb2ZmQXVkaXRSZWNvcmRbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBQYXJ0aWFsPENvbnRleHRDb25maWc+ID0ge30pIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfQ09ORklHLCAuLi5jb25maWcgfTtcbiAgICAgICAgdGhpcy5zZXNzaW9uc0RpciA9IGpvaW4odGhpcy5jb25maWcuc3RvcmFnZVBhdGgsIFwic2Vzc2lvbnNcIik7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25QYXRoID0gam9pbih0aGlzLnNlc3Npb25zRGlyLCBcImN1cnJlbnQuanNvblwiKTtcbiAgICAgICAgdGhpcy5hcmNoaXZlRGlyID0gam9pbih0aGlzLnNlc3Npb25zRGlyLCBcImFyY2hpdmVcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB0aGUgc2Vzc2lvbiBtYW5hZ2VyIGFuZCBzdG9yYWdlIGRpcmVjdG9yaWVzXG4gICAgICovXG4gICAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgbWtkaXIodGhpcy5zZXNzaW9uc0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgIGF3YWl0IG1rZGlyKHRoaXMuYXJjaGl2ZURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgc2Vzc2lvbiBvciByZXN0b3JlIHRoZSBjdXJyZW50IG9uZVxuICAgICAqL1xuICAgIGFzeW5jIHN0YXJ0U2Vzc2lvbihcbiAgICAgICAgbWV0YWRhdGE6IFBhcnRpYWw8U2Vzc2lvbk1ldGFkYXRhPiA9IHt9LFxuICAgICk6IFByb21pc2U8U2Vzc2lvbj4ge1xuICAgICAgICAvLyBUcnkgdG8gcmVzdG9yZSBleGlzdGluZyBzZXNzaW9uXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgdGhpcy5sb2FkQ3VycmVudFNlc3Npb24oKTtcblxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBsYXN0IGFjdGl2ZSB0aW1lXG4gICAgICAgICAgICBleGlzdGluZy5sYXN0QWN0aXZlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgZXhpc3RpbmcubWV0YWRhdGEgPSB7IC4uLmV4aXN0aW5nLm1ldGFkYXRhLCAuLi5tZXRhZGF0YSB9O1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbihleGlzdGluZyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uID0gZXhpc3Rpbmc7XG4gICAgICAgICAgICByZXR1cm4gZXhpc3Rpbmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgbmV3IHNlc3Npb25cbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuY3JlYXRlU2Vzc2lvbihtZXRhZGF0YSk7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24oc2Vzc2lvbik7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24gPSBzZXNzaW9uO1xuICAgICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgYWN0aXZlIHNlc3Npb25cbiAgICAgKi9cbiAgICBnZXRTZXNzaW9uKCk6IFNlc3Npb24gfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlc3Npb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IHNlc3Npb24gb2JqZWN0XG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVTZXNzaW9uKG1ldGFkYXRhOiBQYXJ0aWFsPFNlc3Npb25NZXRhZGF0YT4gPSB7fSk6IFNlc3Npb24ge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGhpcy5nZW5lcmF0ZVNlc3Npb25JZCgpLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICAgICAgICBsYXN0QWN0aXZlOiBub3csXG4gICAgICAgICAgICB3b3JrYmVuY2g6IHtcbiAgICAgICAgICAgICAgICBhY3RpdmVGaWxlczogW10sXG4gICAgICAgICAgICAgICAgcGVuZGluZ1Rhc2tzOiBbXSxcbiAgICAgICAgICAgICAgICBkZWNpc2lvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHt9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogbWV0YWRhdGEucHJvamVjdCB8fCBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgICAgIGJyYW5jaDogbWV0YWRhdGEuYnJhbmNoLFxuICAgICAgICAgICAgICAgIG1vZGU6IG1ldGFkYXRhLm1vZGUsXG4gICAgICAgICAgICAgICAgcGxhdGZvcm06IG1ldGFkYXRhLnBsYXRmb3JtLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHVuaXF1ZSBzZXNzaW9uIElEXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgICAgICAgY29uc3QgcmFuZG9tID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpO1xuICAgICAgICByZXR1cm4gYHNlc3NfJHt0aW1lc3RhbXB9XyR7cmFuZG9tfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgY3VycmVudCBzZXNzaW9uIGZyb20gZGlza1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgbG9hZEN1cnJlbnRTZXNzaW9uKCk6IFByb21pc2U8U2Vzc2lvbiB8IG51bGw+IHtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHRoaXMuY3VycmVudFNlc3Npb25QYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHRoaXMuY3VycmVudFNlc3Npb25QYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgU2Vzc2lvbjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBzZXNzaW9uOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgc2Vzc2lvbiB0byBkaXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlU2Vzc2lvbihzZXNzaW9uOiBTZXNzaW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25QYXRoLFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbiwgbnVsbCwgMiksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gV29ya2JlbmNoIE9wZXJhdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGZpbGUgdG8gdGhlIGFjdGl2ZSBmaWxlcyBsaXN0XG4gICAgICovXG4gICAgYXN5bmMgYWRkQWN0aXZlRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5hY3RpdmVGaWxlcy5pbmNsdWRlcyhwYXRoKSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2guYWN0aXZlRmlsZXMucHVzaChwYXRoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ubGFzdEFjdGl2ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24odGhpcy5jdXJyZW50U2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBmaWxlIGZyb20gdGhlIGFjdGl2ZSBmaWxlcyBsaXN0XG4gICAgICovXG4gICAgYXN5bmMgcmVtb3ZlQWN0aXZlRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5hY3RpdmVGaWxlcy5pbmRleE9mKHBhdGgpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2guYWN0aXZlRmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ubGFzdEFjdGl2ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24odGhpcy5jdXJyZW50U2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFjdGl2ZSBmaWxlc1xuICAgICAqL1xuICAgIGdldEFjdGl2ZUZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlc3Npb24/LndvcmtiZW5jaC5hY3RpdmVGaWxlcyB8fCBbXTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUYXNrIE9wZXJhdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIEFyY2hpdmUgdGhlIGN1cnJlbnQgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGFyY2hpdmVDdXJyZW50U2Vzc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgc2Vzc2lvbiB0byBhcmNoaXZlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXJjaGl2ZVBhdGggPSBqb2luKFxuICAgICAgICAgICAgdGhpcy5hcmNoaXZlRGlyLFxuICAgICAgICAgICAgYCR7dGhpcy5jdXJyZW50U2Vzc2lvbi5pZH0uanNvbmAsXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShcbiAgICAgICAgICAgIGFyY2hpdmVQYXRoLFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50U2Vzc2lvbiwgbnVsbCwgMiksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gQ2xlYXIgY3VycmVudCBzZXNzaW9uXG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24gPSBudWxsO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyh0aGlzLmN1cnJlbnRTZXNzaW9uUGF0aCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZSh0aGlzLmN1cnJlbnRTZXNzaW9uUGF0aCwgXCJcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCBhIGNvbnRleHQgZW52ZWxvcGUgZm9yIGFnZW50IGhhbmRvZmZzXG4gICAgICovXG4gICAgYnVpbGRDb250ZXh0RW52ZWxvcGUoXG4gICAgICAgIHJlcXVlc3RJZDogc3RyaW5nLFxuICAgICAgICBkZXB0aCA9IDAsXG4gICAgICAgIHByZXZpb3VzUmVzdWx0czogQ29udGV4dEVudmVsb3BlW1wicHJldmlvdXNSZXN1bHRzXCJdID0gW10sXG4gICAgICAgIHRhc2tDb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9LFxuICAgICAgICBtZW1vcnlNYW5hZ2VyPzoge1xuICAgICAgICAgICAgc2VhcmNoTWVtb3JpZXM6IChxdWVyeTogc3RyaW5nKSA9PiBQcm9taXNlPE1lbW9yeUVudHJ5W10+O1xuICAgICAgICB9LFxuICAgICk6IENvbnRleHRFbnZlbG9wZSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYWN0aXZlIHNlc3Npb24gZm9yIGNvbnRleHQgZW52ZWxvcGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgcmVsZXZhbnQgbWVtb3JpZXMgaWYgbWVtb3J5IG1hbmFnZXIgYXZhaWxhYmxlXG4gICAgICAgIC8vIE5vdGU6IE1lbW9yeSBmaWx0ZXJpbmcgYnkgdHlwZSBub3QgeWV0IGltcGxlbWVudGVkXG4gICAgICAgIGNvbnN0IG1lbW9yaWVzID0gbWVtb3J5TWFuYWdlclxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICBkZWNsYXJhdGl2ZTogW10sXG4gICAgICAgICAgICAgICAgICBwcm9jZWR1cmFsOiBbXSxcbiAgICAgICAgICAgICAgICAgIGVwaXNvZGljOiBbXSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICBkZWNsYXJhdGl2ZTogW10sXG4gICAgICAgICAgICAgICAgICBwcm9jZWR1cmFsOiBbXSxcbiAgICAgICAgICAgICAgICAgIGVwaXNvZGljOiBbXSxcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2Vzc2lvbjoge1xuICAgICAgICAgICAgICAgIGlkOiB0aGlzLmN1cnJlbnRTZXNzaW9uLmlkLFxuICAgICAgICAgICAgICAgIHBhcmVudElEOiB0aGlzLmN1cnJlbnRTZXNzaW9uLnBhcmVudElELFxuICAgICAgICAgICAgICAgIGFjdGl2ZUZpbGVzOiB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5hY3RpdmVGaWxlcyxcbiAgICAgICAgICAgICAgICBwZW5kaW5nVGFza3M6IHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLnBlbmRpbmdUYXNrcyxcbiAgICAgICAgICAgICAgICBkZWNpc2lvbnM6IHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLmRlY2lzaW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZW1vcmllcyxcbiAgICAgICAgICAgIHByZXZpb3VzUmVzdWx0cyxcbiAgICAgICAgICAgIHRhc2tDb250ZXh0LFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY29yZCBhIGhhbmRvZmYgb3BlcmF0aW9uIGZvciBhdWRpdGluZ1xuICAgICAqL1xuICAgIHJlY29yZEhhbmRvZmYoXG4gICAgICAgIGNvcnJlbGF0aW9uSWQ6IHN0cmluZyxcbiAgICAgICAgZnJvbUFnZW50OiBzdHJpbmcsXG4gICAgICAgIHRvQWdlbnQ6IHN0cmluZyxcbiAgICAgICAgY29udGV4dFNpemU6IG51bWJlcixcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbixcbiAgICAgICAgcmVhc29uPzogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICBjb25zdCByZWNvcmQ6IEhhbmRvZmZBdWRpdFJlY29yZCA9IHtcbiAgICAgICAgICAgIGlkOiBgaGFuZG9mZi0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWAsXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkLFxuICAgICAgICAgICAgZnJvbUFnZW50LFxuICAgICAgICAgICAgdG9BZ2VudCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGNvbnRleHRTaXplLFxuICAgICAgICAgICAgc3VjY2VzcyxcbiAgICAgICAgICAgIHJlYXNvbixcbiAgICAgICAgICAgIHNlc3Npb25JZDogdGhpcy5jdXJyZW50U2Vzc2lvbi5pZCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmF1ZGl0TG9nLnB1c2gocmVjb3JkKTtcblxuICAgICAgICAvLyBLZWVwIG9ubHkgbGFzdCAxMDAgcmVjb3JkcyB0byBwcmV2ZW50IG1lbW9yeSBibG9hdFxuICAgICAgICBpZiAodGhpcy5hdWRpdExvZy5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaXRMb2cgPSB0aGlzLmF1ZGl0TG9nLnNsaWNlKC0xMDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGF1ZGl0IHRyYWlsIGZvciBjb3JyZWxhdGlvbiBJRFxuICAgICAqL1xuICAgIGdldEF1ZGl0VHJhaWwoY29ycmVsYXRpb25JZDogc3RyaW5nKTogSGFuZG9mZkF1ZGl0UmVjb3JkW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWRpdExvZy5maWx0ZXIoXG4gICAgICAgICAgICAocmVjb3JkKSA9PiByZWNvcmQuY29ycmVsYXRpb25JZCA9PT0gY29ycmVsYXRpb25JZCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGF1ZGl0IHJlY29yZHNcbiAgICAgKi9cbiAgICBnZXRBbGxBdWRpdFJlY29yZHMoKTogSGFuZG9mZkF1ZGl0UmVjb3JkW10ge1xuICAgICAgICByZXR1cm4gWy4uLnRoaXMuYXVkaXRMb2ddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGNvcnJlbGF0aW9uIElEIGZvciBoYW5kb2ZmIGNoYWluXG4gICAgICovXG4gICAgZ2VuZXJhdGVDb3JyZWxhdGlvbklkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgY29yci0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplIGNvbnRleHQgZW52ZWxvcGUgZm9yIHByb21wdCBpbmplY3Rpb25cbiAgICAgKi9cbiAgICBzZXJpYWxpemVDb250ZXh0RW52ZWxvcGUoZW52ZWxvcGU6IENvbnRleHRFbnZlbG9wZSk6IHN0cmluZyB7XG4gICAgICAgIC8vIExpbWl0IHNpemVzIHRvIHByZXZlbnQgdG9rZW4gZXhwbG9zaW9uXG4gICAgICAgIGNvbnN0IGxpbWl0ZWRFbnZlbG9wZSA9IHtcbiAgICAgICAgICAgIC4uLmVudmVsb3BlLFxuICAgICAgICAgICAgc2Vzc2lvbjoge1xuICAgICAgICAgICAgICAgIC4uLmVudmVsb3BlLnNlc3Npb24sXG4gICAgICAgICAgICAgICAgYWN0aXZlRmlsZXM6IGVudmVsb3BlLnNlc3Npb24uYWN0aXZlRmlsZXMuc2xpY2UoMCwgMTApLFxuICAgICAgICAgICAgICAgIHBlbmRpbmdUYXNrczogZW52ZWxvcGUuc2Vzc2lvbi5wZW5kaW5nVGFza3Muc2xpY2UoMCwgNSksXG4gICAgICAgICAgICAgICAgZGVjaXNpb25zOiBlbnZlbG9wZS5zZXNzaW9uLmRlY2lzaW9ucy5zbGljZSgwLCA1KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZW1vcmllczoge1xuICAgICAgICAgICAgICAgIGRlY2xhcmF0aXZlOiBlbnZlbG9wZS5tZW1vcmllcy5kZWNsYXJhdGl2ZS5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgICAgICBwcm9jZWR1cmFsOiBlbnZlbG9wZS5tZW1vcmllcy5wcm9jZWR1cmFsLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgICAgIGVwaXNvZGljOiBlbnZlbG9wZS5tZW1vcmllcy5lcGlzb2RpYy5zbGljZSgwLCAzKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91c1Jlc3VsdHM6IGVudmVsb3BlLnByZXZpb3VzUmVzdWx0cy5zbGljZSgwLCAzKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobGltaXRlZEVudmVsb3BlLCBudWxsLCAyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXJnZSBjb250ZXh0IGVudmVsb3BlcyB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb25cbiAgICAgKi9cbiAgICBtZXJnZUNvbnRleHRFbnZlbG9wZXMoXG4gICAgICAgIGVudmVsb3BlczogQ29udGV4dEVudmVsb3BlW10sXG4gICAgICAgIHN0cmF0ZWd5OiBcImxhc3Qtd2luc1wiIHwgXCJjb25zZW5zdXNcIiB8IFwicHJpb3JpdHlcIiA9IFwibGFzdC13aW5zXCIsXG4gICAgKTogQ29udGV4dEVudmVsb3BlIHtcbiAgICAgICAgaWYgKGVudmVsb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBtZXJnZSBlbXB0eSBlbnZlbG9wZSBhcnJheVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW52ZWxvcGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGVudmVsb3Blc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhc2VFbnZlbG9wZSA9IGVudmVsb3Blc1swXTtcblxuICAgICAgICAvLyBNZXJnZSBwcmV2aW91cyByZXN1bHRzXG4gICAgICAgIGNvbnN0IGFsbFByZXZpb3VzUmVzdWx0cyA9IGVudmVsb3Blcy5mbGF0TWFwKChlKSA9PiBlLnByZXZpb3VzUmVzdWx0cyk7XG4gICAgICAgIGNvbnN0IG1lcmdlZFByZXZpb3VzUmVzdWx0cyA9XG4gICAgICAgICAgICB0aGlzLmRlZHVwbGljYXRlUHJldmlvdXNSZXN1bHRzKGFsbFByZXZpb3VzUmVzdWx0cyk7XG5cbiAgICAgICAgLy8gTWVyZ2UgdGFzayBjb250ZXh0IHdpdGggY29uZmxpY3QgcmVzb2x1dGlvblxuICAgICAgICBjb25zdCBtZXJnZWRUYXNrQ29udGV4dCA9IHRoaXMubWVyZ2VUYXNrQ29udGV4dHMoXG4gICAgICAgICAgICBlbnZlbG9wZXMubWFwKChlKSA9PiBlLnRhc2tDb250ZXh0KSxcbiAgICAgICAgICAgIHN0cmF0ZWd5LFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5iYXNlRW52ZWxvcGUsXG4gICAgICAgICAgICBwcmV2aW91c1Jlc3VsdHM6IG1lcmdlZFByZXZpb3VzUmVzdWx0cyxcbiAgICAgICAgICAgIHRhc2tDb250ZXh0OiBtZXJnZWRUYXNrQ29udGV4dCxcbiAgICAgICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgICAgICAuLi5iYXNlRW52ZWxvcGUubWV0YSxcbiAgICAgICAgICAgICAgICBtZXJnZWRGcm9tOiBlbnZlbG9wZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG1lcmdlU3RyYXRlZ3k6IHN0cmF0ZWd5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZHVwbGljYXRlIHByZXZpb3VzIHJlc3VsdHMgYmFzZWQgb24gYWdlbnQgdHlwZSBhbmQgb3V0cHV0XG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWR1cGxpY2F0ZVByZXZpb3VzUmVzdWx0cyhcbiAgICAgICAgcmVzdWx0czogQ29udGV4dEVudmVsb3BlW1wicHJldmlvdXNSZXN1bHRzXCJdLFxuICAgICk6IENvbnRleHRFbnZlbG9wZVtcInByZXZpb3VzUmVzdWx0c1wiXSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHMuZmlsdGVyKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3Jlc3VsdC5hZ2VudFR5cGV9LSR7SlNPTi5zdHJpbmdpZnkocmVzdWx0Lm91dHB1dCl9YDtcbiAgICAgICAgICAgIGlmIChzZWVuLmhhcyhrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBzZWVuLmFkZChrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlIHRhc2sgY29udGV4dHMgd2l0aCBkaWZmZXJlbnQgc3RyYXRlZ2llc1xuICAgICAqL1xuICAgIHByaXZhdGUgbWVyZ2VUYXNrQ29udGV4dHMoXG4gICAgICAgIGNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdLFxuICAgICAgICBzdHJhdGVneTogc3RyaW5nLFxuICAgICk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICAgICAgY29uc3QgbWVyZ2VkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAgIC8vIENvbGxlY3QgYWxsIGtleXNcbiAgICAgICAgY29uc3QgYWxsS2V5cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb250ZXh0cy5mb3JFYWNoKChjdHgpID0+IHtcbiAgICAgICAgICAgIGlmIChjdHgpIE9iamVjdC5rZXlzKGN0eCkuZm9yRWFjaCgoa2V5KSA9PiBhbGxLZXlzLmFkZChrZXkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTWVyZ2UgZWFjaCBrZXlcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgYWxsS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gY29udGV4dHNcbiAgICAgICAgICAgICAgICAubWFwKChjdHgpID0+IGN0eD8uW2tleV0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcigodmFsKSA9PiB2YWwgIT09IHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSBjb250aW51ZTtcblxuICAgICAgICAgICAgc3dpdGNoIChzdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsYXN0LXdpbnNcIjpcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiY29uc2Vuc3VzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIG1vc3QgY29tbW9uIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50cyA9IG5ldyBNYXA8YW55LCBudW1iZXI+KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWwpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHMuc2V0KHZhbCwgKGNvdW50cy5nZXQodmFsKSB8fCAwKSArIDEpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWF4Q291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29uc2Vuc3VzVmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvdW50cy5mb3JFYWNoKChjb3VudCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+IG1heENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q291bnQgPSBjb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zZW5zdXNWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSBjb25zZW5zdXNWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgXCJwcmlvcml0eVwiOlxuICAgICAgICAgICAgICAgICAgICAvLyBBc3N1bWUgaGlnaGVyIHByaW9yaXR5IGFnZW50cyBjb21lIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFtrZXldID0gdmFsdWVzW3ZhbHVlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHRhc2sgdG8gdGhlIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBhZGRUYXNrKFxuICAgICAgICBjb250ZW50OiBzdHJpbmcsXG4gICAgICAgIHByaW9yaXR5OiBUYXNrW1wicHJpb3JpdHlcIl0gPSBcIm1lZGl1bVwiLFxuICAgICk6IFByb21pc2U8VGFzaz4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFjdGl2ZSBzZXNzaW9uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFzazogVGFzayA9IHtcbiAgICAgICAgICAgIGlkOiBgdGFza18ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWAsXG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIixcbiAgICAgICAgICAgIHByaW9yaXR5LFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2gucGVuZGluZ1Rhc2tzLnB1c2godGFzayk7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ubGFzdEFjdGl2ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbih0aGlzLmN1cnJlbnRTZXNzaW9uKTtcblxuICAgICAgICByZXR1cm4gdGFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgYSB0YXNrJ3Mgc3RhdHVzXG4gICAgICovXG4gICAgYXN5bmMgdXBkYXRlVGFza1N0YXR1cyhcbiAgICAgICAgdGFza0lkOiBzdHJpbmcsXG4gICAgICAgIHN0YXR1czogVGFza1tcInN0YXR1c1wiXSxcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLnBlbmRpbmdUYXNrcy5maW5kKFxuICAgICAgICAgICAgKHQpID0+IHQuaWQgPT09IHRhc2tJZCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgIHRhc2suc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIikge1xuICAgICAgICAgICAgICAgIHRhc2suY29tcGxldGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLmxhc3RBY3RpdmUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXNzaW9uKHRoaXMuY3VycmVudFNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCB0YXNrc1xuICAgICAqL1xuICAgIGdldFRhc2tzKCk6IFRhc2tbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZXNzaW9uPy53b3JrYmVuY2gucGVuZGluZ1Rhc2tzIHx8IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBwZW5kaW5nIHRhc2tzIG9ubHlcbiAgICAgKi9cbiAgICBnZXRQZW5kaW5nVGFza3MoKTogVGFza1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFza3MoKS5maWx0ZXIoXG4gICAgICAgICAgICAodCkgPT4gdC5zdGF0dXMgPT09IFwicGVuZGluZ1wiIHx8IHQuc3RhdHVzID09PSBcImluX3Byb2dyZXNzXCIsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRGVjaXNpb24gT3BlcmF0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogUmVjb3JkIGEgZGVjaXNpb25cbiAgICAgKi9cbiAgICBhc3luYyBhZGREZWNpc2lvbihcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcbiAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZyxcbiAgICAgICAgcmF0aW9uYWxlOiBzdHJpbmcsXG4gICAgICAgIG9wdGlvbnM/OiB7IGFsdGVybmF0aXZlcz86IHN0cmluZ1tdOyB0YWdzPzogc3RyaW5nW10gfSxcbiAgICApOiBQcm9taXNlPERlY2lzaW9uPiB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYWN0aXZlIHNlc3Npb25cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWNpc2lvbjogRGVjaXNpb24gPSB7XG4gICAgICAgICAgICBpZDogYGRlY18ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWAsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmF0aW9uYWxlLFxuICAgICAgICAgICAgYWx0ZXJuYXRpdmVzOiBvcHRpb25zPy5hbHRlcm5hdGl2ZXMsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHRhZ3M6IG9wdGlvbnM/LnRhZ3MgfHwgW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2guZGVjaXNpb25zLnB1c2goZGVjaXNpb24pO1xuICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLmxhc3RBY3RpdmUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24odGhpcy5jdXJyZW50U2Vzc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGRlY2lzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgZGVjaXNpb25zXG4gICAgICovXG4gICAgZ2V0RGVjaXNpb25zKCk6IERlY2lzaW9uW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Vzc2lvbj8ud29ya2JlbmNoLmRlY2lzaW9ucyB8fCBbXTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBDb250ZXh0IE9wZXJhdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIFNldCBhIGNvbnRleHQgdmFsdWVcbiAgICAgKi9cbiAgICBhc3luYyBzZXRDb250ZXh0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5jb250ZXh0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi5sYXN0QWN0aXZlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXNzaW9uKHRoaXMuY3VycmVudFNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGNvbnRleHQgdmFsdWVcbiAgICAgKi9cbiAgICBnZXRDb250ZXh0PFQgPSB1bmtub3duPihrZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Vzc2lvbj8ud29ya2JlbmNoLmNvbnRleHRba2V5XSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgY29udGV4dFxuICAgICAqL1xuICAgIGdldEFsbENvbnRleHQoKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Vzc2lvbj8ud29ya2JlbmNoLmNvbnRleHQgfHwge307XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gU2Vzc2lvbiBMaWZlY3ljbGVcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIEFyY2hpdmUgdGhlIGN1cnJlbnQgc2Vzc2lvbiBhbmQgc3RhcnQgZnJlc2hcbiAgICAgKi9cbiAgICBhc3luYyBhcmNoaXZlU2Vzc2lvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYXJjaGl2ZVBhdGggPSBqb2luKFxuICAgICAgICAgICAgdGhpcy5hcmNoaXZlRGlyLFxuICAgICAgICAgICAgYCR7dGhpcy5jdXJyZW50U2Vzc2lvbi5pZH0uanNvbmAsXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKFxuICAgICAgICAgICAgYXJjaGl2ZVBhdGgsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnRTZXNzaW9uLCBudWxsLCAyKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBSZW1vdmUgY3VycmVudCBzZXNzaW9uXG4gICAgICAgIGlmIChleGlzdHNTeW5jKHRoaXMuY3VycmVudFNlc3Npb25QYXRoKSkge1xuICAgICAgICAgICAgY29uc3QgeyBybSB9ID0gYXdhaXQgaW1wb3J0KFwibm9kZTpmcy9wcm9taXNlc1wiKTtcbiAgICAgICAgICAgIGF3YWl0IHJtKHRoaXMuY3VycmVudFNlc3Npb25QYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24gPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExpc3QgYXJjaGl2ZWQgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBhc3luYyBsaXN0QXJjaGl2ZWRTZXNzaW9ucygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyh0aGlzLmFyY2hpdmVEaXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWRkaXIodGhpcy5hcmNoaXZlRGlyKTtcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmVuZHNXaXRoKFwiLmpzb25cIikpXG4gICAgICAgICAgICAubWFwKChmKSA9PiBmLnJlcGxhY2UoXCIuanNvblwiLCBcIlwiKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBhbiBhcmNoaXZlZCBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgbG9hZEFyY2hpdmVkU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8U2Vzc2lvbiB8IG51bGw+IHtcbiAgICAgICAgY29uc3QgYXJjaGl2ZVBhdGggPSBqb2luKHRoaXMuYXJjaGl2ZURpciwgYCR7c2Vzc2lvbklkfS5qc29uYCk7XG5cbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGFyY2hpdmVQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGFyY2hpdmVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgU2Vzc2lvbjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBsb2FkIGFyY2hpdmVkIHNlc3Npb24gJHtzZXNzaW9uSWR9OmAsXG4gICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvbiBzdW1tYXJ5IGZvciBjb250ZXh0IGFzc2VtYmx5XG4gICAgICovXG4gICAgZ2V0U2Vzc2lvblN1bW1hcnkoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJObyBhY3RpdmUgc2Vzc2lvbi5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgd29ya2JlbmNoLCBtZXRhZGF0YSB9ID0gdGhpcy5jdXJyZW50U2Vzc2lvbjtcbiAgICAgICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gdGhpcy5nZXRQZW5kaW5nVGFza3MoKTtcblxuICAgICAgICBjb25zdCBsaW5lcyA9IFtcbiAgICAgICAgICAgIGAjIyBTZXNzaW9uOiAke3RoaXMuY3VycmVudFNlc3Npb24uaWR9YCxcbiAgICAgICAgICAgIGBQcm9qZWN0OiAke21ldGFkYXRhLnByb2plY3R9YCxcbiAgICAgICAgICAgIG1ldGFkYXRhLmJyYW5jaCA/IGBCcmFuY2g6ICR7bWV0YWRhdGEuYnJhbmNofWAgOiBudWxsLFxuICAgICAgICAgICAgbWV0YWRhdGEubW9kZSA/IGBNb2RlOiAke21ldGFkYXRhLm1vZGV9YCA6IG51bGwsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgYCMjIyBBY3RpdmUgRmlsZXMgKCR7d29ya2JlbmNoLmFjdGl2ZUZpbGVzLmxlbmd0aH0pYCxcbiAgICAgICAgICAgIC4uLndvcmtiZW5jaC5hY3RpdmVGaWxlcy5zbGljZSgwLCAxMCkubWFwKChmKSA9PiBgLSAke2Z9YCksXG4gICAgICAgICAgICB3b3JrYmVuY2guYWN0aXZlRmlsZXMubGVuZ3RoID4gMTBcbiAgICAgICAgICAgICAgICA/IGAtIC4uLiBhbmQgJHt3b3JrYmVuY2guYWN0aXZlRmlsZXMubGVuZ3RoIC0gMTB9IG1vcmVgXG4gICAgICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIGAjIyMgUGVuZGluZyBUYXNrcyAoJHtwZW5kaW5nVGFza3MubGVuZ3RofSlgLFxuICAgICAgICAgICAgLi4ucGVuZGluZ1Rhc2tzXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsIDUpXG4gICAgICAgICAgICAgICAgLm1hcCgodCkgPT4gYC0gWyR7dC5wcmlvcml0eX1dICR7dC5jb250ZW50fWApLFxuICAgICAgICAgICAgcGVuZGluZ1Rhc2tzLmxlbmd0aCA+IDVcbiAgICAgICAgICAgICAgICA/IGAtIC4uLiBhbmQgJHtwZW5kaW5nVGFza3MubGVuZ3RoIC0gNX0gbW9yZWBcbiAgICAgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgYCMjIyBSZWNlbnQgRGVjaXNpb25zICgke3dvcmtiZW5jaC5kZWNpc2lvbnMubGVuZ3RofSlgLFxuICAgICAgICAgICAgLi4ud29ya2JlbmNoLmRlY2lzaW9uc1xuICAgICAgICAgICAgICAgIC5zbGljZSgtMylcbiAgICAgICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4gYC0gJHtkLnRpdGxlfTogJHtkLnJhdGlvbmFsZS5zdWJzdHJpbmcoMCwgMTAwKX0uLi5gLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlIGZvciBjb252ZW5pZW5jZVxubGV0IGRlZmF1bHRNYW5hZ2VyOiBTZXNzaW9uTWFuYWdlciB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Vzc2lvbk1hbmFnZXIoXG4gICAgY29uZmlnPzogUGFydGlhbDxDb250ZXh0Q29uZmlnPixcbik6IFNlc3Npb25NYW5hZ2VyIHtcbiAgICBpZiAoIWRlZmF1bHRNYW5hZ2VyKSB7XG4gICAgICAgIGRlZmF1bHRNYW5hZ2VyID0gbmV3IFNlc3Npb25NYW5hZ2VyKGNvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0TWFuYWdlcjtcbn1cbiIsCiAgICAiLyoqXG4gKiBDb250ZXh0IEVuZ2luZWVyaW5nIFR5cGUgRGVmaW5pdGlvbnNcbiAqXG4gKiBDb3JlIHR5cGVzIGZvciBzZXNzaW9uIG1hbmFnZW1lbnQsIG1lbW9yeSBzeXN0ZW0sIGFuZCBwcm9ncmVzc2l2ZSBkaXNjbG9zdXJlLlxuICogQmFzZWQgb24gcmVzZWFyY2ggZnJvbSBHb29nbGUncyBDb250ZXh0IEVuZ2luZWVyaW5nIGFuZCBDbGF1ZGUgU2tpbGxzIHBhdHRlcm5zLlxuICovXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNlc3Npb24gVHlwZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHBhcmVudElEPzogc3RyaW5nOyAvLyBQYXJlbnQgc2Vzc2lvbiBJRCBmb3IgbmVzdGVkIHN1YmFnZW50IGNhbGxzXG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7IC8vIElTTyBkYXRlIHN0cmluZ1xuICAgIGxhc3RBY3RpdmU6IHN0cmluZzsgLy8gSVNPIGRhdGUgc3RyaW5nXG4gICAgd29ya2JlbmNoOiBTZXNzaW9uV29ya2JlbmNoO1xuICAgIG1ldGFkYXRhOiBTZXNzaW9uTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvbldvcmtiZW5jaCB7XG4gICAgLyoqIEN1cnJlbnRseSBhY3RpdmUvb3BlbiBmaWxlcyBpbiB0aGUgc2Vzc2lvbiAqL1xuICAgIGFjdGl2ZUZpbGVzOiBzdHJpbmdbXTtcbiAgICAvKiogUGVuZGluZyB0YXNrcyB0cmFja2VkIGluIHRoaXMgc2Vzc2lvbiAqL1xuICAgIHBlbmRpbmdUYXNrczogVGFza1tdO1xuICAgIC8qKiBBcmNoaXRlY3R1cmFsL2Rlc2lnbiBkZWNpc2lvbnMgbWFkZSAqL1xuICAgIGRlY2lzaW9uczogRGVjaXNpb25bXTtcbiAgICAvKiogQXJiaXRyYXJ5IGNvbnRleHQgZGF0YSAqL1xuICAgIGNvbnRleHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb25NZXRhZGF0YSB7XG4gICAgLyoqIFByb2plY3QgbmFtZSBvciBwYXRoICovXG4gICAgcHJvamVjdDogc3RyaW5nO1xuICAgIC8qKiBHaXQgYnJhbmNoIGlmIGFwcGxpY2FibGUgKi9cbiAgICBicmFuY2g/OiBzdHJpbmc7XG4gICAgLyoqIEN1cnJlbnQgd29ya2luZyBtb2RlICovXG4gICAgbW9kZT86IFwicGxhblwiIHwgXCJidWlsZFwiIHwgXCJyZXZpZXdcIjtcbiAgICAvKiogUGxhdGZvcm0gYmVpbmcgdXNlZCAqL1xuICAgIHBsYXRmb3JtPzogXCJjbGF1ZGUtY29kZVwiIHwgXCJvcGVuY29kZVwiO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIHN0YXR1czogXCJwZW5kaW5nXCIgfCBcImluX3Byb2dyZXNzXCIgfCBcImNvbXBsZXRlZFwiIHwgXCJjYW5jZWxsZWRcIjtcbiAgICBwcmlvcml0eTogXCJsb3dcIiB8IFwibWVkaXVtXCIgfCBcImhpZ2hcIjtcbiAgICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWNpc2lvbiB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcmF0aW9uYWxlOiBzdHJpbmc7XG4gICAgYWx0ZXJuYXRpdmVzPzogc3RyaW5nW107XG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gICAgdGFnczogc3RyaW5nW107XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1lbW9yeSBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBNZW1vcnlUeXBlID0gXCJkZWNsYXJhdGl2ZVwiIHwgXCJwcm9jZWR1cmFsXCIgfCBcImVwaXNvZGljXCI7XG5leHBvcnQgdHlwZSBNZW1vcnlTb3VyY2UgPSBcInVzZXJcIiB8IFwiYWdlbnRcIiB8IFwiaW5mZXJyZWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBNZW1vcnlFbnRyeSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBNZW1vcnlUeXBlO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwcm92ZW5hbmNlOiBNZW1vcnlQcm92ZW5hbmNlO1xuICAgIHRhZ3M6IHN0cmluZ1tdO1xuICAgIGxhc3RBY2Nlc3NlZDogc3RyaW5nO1xuICAgIGFjY2Vzc0NvdW50OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5UHJvdmVuYW5jZSB7XG4gICAgLyoqIFdoZXJlIHRoaXMgbWVtb3J5IGNhbWUgZnJvbSAqL1xuICAgIHNvdXJjZTogTWVtb3J5U291cmNlO1xuICAgIC8qKiBXaGVuIHRoaXMgd2FzIHJlY29yZGVkICovXG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgLyoqIENvbmZpZGVuY2UgbGV2ZWwgMC0xIChkZWNheXMgb3ZlciB0aW1lIGZvciBpbmZlcnJlZCkgKi9cbiAgICBjb25maWRlbmNlOiBudW1iZXI7XG4gICAgLyoqIENvbnRleHQgaW4gd2hpY2ggdGhpcyB3YXMgbGVhcm5lZCAqL1xuICAgIGNvbnRleHQ6IHN0cmluZztcbiAgICAvKiogUmVsYXRlZCBzZXNzaW9uIElEIGlmIGFwcGxpY2FibGUgKi9cbiAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5U3RvcmUge1xuICAgIC8qKiBGYWN0cywgcGF0dGVybnMsIHByZWZlcmVuY2VzICovXG4gICAgZGVjbGFyYXRpdmU6IE1lbW9yeUVudHJ5W107XG4gICAgLyoqIFdvcmtmbG93cywgcHJvY2VkdXJlcywgaGFiaXRzICovXG4gICAgcHJvY2VkdXJhbDogTWVtb3J5RW50cnlbXTtcbiAgICAvKiogQ29udmVyc2F0aW9uIHN1bW1hcmllcywgcGFzdCBldmVudHMgKi9cbiAgICBlcGlzb2RpYzogTWVtb3J5RW50cnlbXTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUHJvZ3Jlc3NpdmUgRGlzY2xvc3VyZSBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBTa2lsbFRpZXIgPSAxIHwgMiB8IDM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2tpbGxNZXRhZGF0YSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgdGllcjogU2tpbGxUaWVyO1xuICAgIGNhcGFiaWxpdGllczogc3RyaW5nW107XG4gICAgcGF0aDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNraWxsQ29udGVudCB7XG4gICAgbWV0YWRhdGE6IFNraWxsTWV0YWRhdGE7XG4gICAgLyoqIFRpZXIgMTogQWx3YXlzIGxvYWRlZCBvdmVydmlldyAqL1xuICAgIG92ZXJ2aWV3OiBzdHJpbmc7XG4gICAgLyoqIFRpZXIgMjogTG9hZGVkIG9uIGFjdGl2YXRpb24gKi9cbiAgICBpbnN0cnVjdGlvbnM/OiBzdHJpbmc7XG4gICAgLyoqIFRpZXIgMzogTG9hZGVkIG9uIHNwZWNpZmljIG5lZWQgKi9cbiAgICByZXNvdXJjZXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkU2tpbGwge1xuICAgIG1ldGFkYXRhOiBTa2lsbE1ldGFkYXRhO1xuICAgIGxvYWRlZFRpZXJzOiBTa2lsbFRpZXJbXTtcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgdG9rZW5Fc3RpbWF0ZTogbnVtYmVyO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDb250ZXh0IFJldHJpZXZhbCBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBSZXRyaWV2YWxQYXR0ZXJuID0gXCJwdXNoXCIgfCBcInB1bGxcIiB8IFwiaHlicmlkXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFRyaWdnZXIge1xuICAgIHR5cGU6XG4gICAgICAgIHwgXCJzZXNzaW9uX3N0YXJ0XCJcbiAgICAgICAgfCBcImZpbGVfb3BlblwiXG4gICAgICAgIHwgXCJjb21tYW5kXCJcbiAgICAgICAgfCBcInF1ZXJ5XCJcbiAgICAgICAgfCBcInRhc2tcIlxuICAgICAgICB8IFwiY29udmVyc2F0aW9uX3R1cm5cIlxuICAgICAgICB8IFwiZmlsZV9lZGl0XCI7XG4gICAgcGF0dGVybjogUmV0cmlldmFsUGF0dGVybjtcbiAgICBkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3NlbWJsZWRDb250ZXh0IHtcbiAgICAvKiogU2Vzc2lvbiBzdGF0ZSAqL1xuICAgIHNlc3Npb24/OiBTZXNzaW9uO1xuICAgIC8qKiBSZWxldmFudCBtZW1vcmllcyAqL1xuICAgIG1lbW9yaWVzOiBNZW1vcnlFbnRyeVtdO1xuICAgIC8qKiBMb2FkZWQgc2tpbGxzICovXG4gICAgc2tpbGxzOiBMb2FkZWRTa2lsbFtdO1xuICAgIC8qKiBUb3RhbCB0b2tlbiBlc3RpbWF0ZSAqL1xuICAgIHRva2VuRXN0aW1hdGU6IG51bWJlcjtcbiAgICAvKiogQXNzZW1ibHkgbWV0YWRhdGEgKi9cbiAgICBtZXRhOiB7XG4gICAgICAgIGFzc2VtYmxlZEF0OiBzdHJpbmc7XG4gICAgICAgIHRyaWdnZXJzOiBzdHJpbmdbXTtcbiAgICAgICAgZHVyYXRpb246IG51bWJlcjtcbiAgICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDb25maWd1cmF0aW9uIFR5cGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dEV4cG9ydENvbmZpZyB7XG4gICAgLyoqIEVuYWJsZSBleHBvcnRpbmcgaHVtYW4tcmVhZGFibGUgY29tbWFuZCBlbnZlbG9wZXMuICovXG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgLyoqIE1hcmtkb3duIGV4cG9ydCBzZXR0aW5ncyAqL1xuICAgIG1hcmtkb3duPzoge1xuICAgICAgICAvKiogT3V0cHV0IGRpcmVjdG9yeSBmb3IgbWFya2Rvd24gZXhwb3J0cyAqL1xuICAgICAgICBvdXRwdXREaXI/OiBzdHJpbmc7XG4gICAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0Q29uZmlnIHtcbiAgICAvKiogUGF0aCB0byBjb250ZXh0IHN0b3JhZ2UgZGlyZWN0b3J5ICovXG4gICAgc3RvcmFnZVBhdGg6IHN0cmluZztcbiAgICAvKiogTWF4aW11bSBtZW1vcmllcyB0byBrZWVwIHBlciB0eXBlICovXG4gICAgbWF4TWVtb3JpZXNQZXJUeXBlOiBudW1iZXI7XG4gICAgLyoqIERheXMgYmVmb3JlIGFyY2hpdmluZyBvbGQgc2Vzc2lvbnMgKi9cbiAgICBzZXNzaW9uQXJjaGl2ZURheXM6IG51bWJlcjtcbiAgICAvKiogQ29uZmlkZW5jZSBkZWNheSByYXRlIGZvciBpbmZlcnJlZCBtZW1vcmllcyAocGVyIGRheSkgKi9cbiAgICBjb25maWRlbmNlRGVjYXlSYXRlOiBudW1iZXI7XG4gICAgLyoqIEVuYWJsZSB2ZWN0b3IgZW1iZWRkaW5ncyAocmVxdWlyZXMgZXh0ZXJuYWwgQVBJKSAqL1xuICAgIGVuYWJsZUVtYmVkZGluZ3M6IGJvb2xlYW47XG4gICAgLyoqIERlZmF1bHQgc2tpbGwgdGllciB0byBsb2FkICovXG4gICAgZGVmYXVsdFNraWxsVGllcjogU2tpbGxUaWVyO1xuICAgIC8qKiBFbmFibGUgYXV0b21hdGljIGNvbnRleHQgaW5mZXJlbmNlIGZyb20gY29udmVyc2F0aW9ucyBhbmQgYWN0aW9ucyAqL1xuICAgIGVuYWJsZUF1dG9JbmZlcmVuY2U6IGJvb2xlYW47XG4gICAgLyoqIE9wdGlvbmFsIGh1bWFuLXJlYWRhYmxlIGV4cG9ydHMgKi9cbiAgICBleHBvcnQ/OiBDb250ZXh0RXhwb3J0Q29uZmlnO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IENvbnRleHRDb25maWcgPSB7XG4gICAgc3RvcmFnZVBhdGg6IFwiLmFpLWNvbnRleHRcIixcbiAgICBtYXhNZW1vcmllc1BlclR5cGU6IDEwMCxcbiAgICBzZXNzaW9uQXJjaGl2ZURheXM6IDMwLFxuICAgIGNvbmZpZGVuY2VEZWNheVJhdGU6IDAuMDUsXG4gICAgZW5hYmxlRW1iZWRkaW5nczogZmFsc2UsXG4gICAgZGVmYXVsdFNraWxsVGllcjogMSxcbiAgICBlbmFibGVBdXRvSW5mZXJlbmNlOiB0cnVlLCAvLyBFbmFibGUgYXV0b21hdGljIGluZmVyZW5jZSBieSBkZWZhdWx0XG4gICAgZXhwb3J0OiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICBtYXJrZG93bjoge1xuICAgICAgICAgICAgb3V0cHV0RGlyOiBcIi5haS1jb250ZXh0L2V4cG9ydHNcIixcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLyoqXG4gKiBMb2FkIGNvbmZpZ3VyYXRpb24gZnJvbSAuYWktY29udGV4dC9jb25maWcuanNvbiBpZiBpdCBleGlzdHNcbiAqL1xuZnVuY3Rpb24gbWVyZ2VDb250ZXh0Q29uZmlnKFxuICAgIGJhc2U6IENvbnRleHRDb25maWcsXG4gICAgb3ZlcnJpZGVzPzogUGFydGlhbDxDb250ZXh0Q29uZmlnPixcbik6IENvbnRleHRDb25maWcge1xuICAgIGNvbnN0IG1lcmdlZDogQ29udGV4dENvbmZpZyA9IHtcbiAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgLi4ub3ZlcnJpZGVzLFxuICAgICAgICBleHBvcnQ6IHtcbiAgICAgICAgICAgIC4uLmJhc2UuZXhwb3J0LFxuICAgICAgICAgICAgLi4ub3ZlcnJpZGVzPy5leHBvcnQsXG4gICAgICAgICAgICBtYXJrZG93bjoge1xuICAgICAgICAgICAgICAgIC4uLmJhc2UuZXhwb3J0Py5tYXJrZG93bixcbiAgICAgICAgICAgICAgICAuLi5vdmVycmlkZXM/LmV4cG9ydD8ubWFya2Rvd24sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICByZXR1cm4gbWVyZ2VkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZENvbmZpZyhcbiAgICBjdXN0b21Db25maWc/OiBQYXJ0aWFsPENvbnRleHRDb25maWc+LFxuKTogUHJvbWlzZTxDb250ZXh0Q29uZmlnPiB7XG4gICAgLy8gTWVyZ2UgZGVmYXVsdHMgKyBwYXNzZWQgY29uZmlnIGZpcnN0IChzbyBzdG9yYWdlUGF0aCBjYW4gaW5mbHVlbmNlIHdoZXJlIGNvbmZpZy5qc29uIGlzKS5cbiAgICBjb25zdCBiYXNlQ29uZmlnID0gbWVyZ2VDb250ZXh0Q29uZmlnKERFRkFVTFRfQ09ORklHLCBjdXN0b21Db25maWcpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gVHJ5IHRvIGxvYWQgcHJvamVjdC1zcGVjaWZpYyBjb25maWdcbiAgICAgICAgY29uc3QgeyByZWFkRmlsZSB9ID0gYXdhaXQgaW1wb3J0KFwibm9kZTpmcy9wcm9taXNlc1wiKTtcbiAgICAgICAgY29uc3QgeyBleGlzdHNTeW5jIH0gPSBhd2FpdCBpbXBvcnQoXCJub2RlOmZzXCIpO1xuICAgICAgICBjb25zdCB7IGpvaW4gfSA9IGF3YWl0IGltcG9ydChcIm5vZGU6cGF0aFwiKTtcblxuICAgICAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihiYXNlQ29uZmlnLnN0b3JhZ2VQYXRoLCBcImNvbmZpZy5qc29uXCIpO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGNvbmZpZ1BhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0Q29uZmlnID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBjb25maWdDb250ZW50LFxuICAgICAgICAgICAgKSBhcyBQYXJ0aWFsPENvbnRleHRDb25maWc+O1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlQ29udGV4dENvbmZpZyhiYXNlQ29uZmlnLCBwcm9qZWN0Q29uZmlnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIElnbm9yZSBjb25maWcgbG9hZGluZyBlcnJvcnMsIHVzZSBkZWZhdWx0c1xuICAgICAgICBjb25zdCBzaWxlbnQgPVxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQUlfRU5HX1NJTEVOVCA9PT0gXCIxXCIgfHxcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkFJX0VOR19TSUxFTlQgPT09IFwidHJ1ZVwiIHx8XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJ0ZXN0XCIgfHxcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkJVTl9URVNUID09PSBcIjFcIiB8fFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwidHJ1ZVwiO1xuXG4gICAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgXCJDb3VsZCBub3QgbG9hZCBjb250ZXh0IGNvbmZpZywgdXNpbmcgZGVmYXVsdHM6XCIsXG4gICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2VDb25maWc7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENvbW1hbmQgRW52ZWxvcGUgVHlwZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IHR5cGUgQ29tbWFuZEV4ZWN1dGlvblN0YXR1cyA9IFwic3VjY2Vzc1wiIHwgXCJmYWlsdXJlXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZENvbnRleHRFbnZlbG9wZSB7XG4gICAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhpcyBlbnZlbG9wZSAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIElTTyB0aW1lc3RhbXAgKi9cbiAgICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgICAvKiogQ0xJIGNvbW1hbmQgbmFtZSAoZS5nLiAncGxhbicsICdyZXNlYXJjaCcpICovXG4gICAgY29tbWFuZE5hbWU6IHN0cmluZztcbiAgICAvKiogU3VjY2Vzcy9mYWlsdXJlICovXG4gICAgc3RhdHVzOiBDb21tYW5kRXhlY3V0aW9uU3RhdHVzO1xuICAgIC8qKiBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKi9cbiAgICBkdXJhdGlvbk1zOiBudW1iZXI7XG5cbiAgICAvKiogQmVzdC1lZmZvcnQgaW5wdXRzL29wdGlvbnMvYXJncyBzdW1tYXJ5ICovXG4gICAgaW5wdXRzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvKiogSHVtYW4tcmVhZGFibGUgc2hvcnQgc3VtbWFyeSBvZiB3aGF0IGhhcHBlbmVkICovXG4gICAgb3V0cHV0U3VtbWFyeT86IHN0cmluZztcblxuICAgIC8qKiBCZXN0LWVmZm9ydCBsaXN0IG9mIGZpbGVzIHRoZSBjb21tYW5kIHdyb3RlL21vZGlmaWVkIChtYXkgYmUgZW1wdHkpICovXG4gICAgZmlsZXNUb3VjaGVkPzogc3RyaW5nW107XG5cbiAgICAvKiogRGVjaXNpb25zIGNhcHR1cmVkIGR1cmluZyBleGVjdXRpb24gKi9cbiAgICBkZWNpc2lvbnM/OiBzdHJpbmdbXTtcblxuICAgIC8qKiBUYWdzIGZvciByZXRyaWV2YWwgKi9cbiAgICB0YWdzOiBzdHJpbmdbXTtcblxuICAgIC8qKiBPcHRpb25hbCBzZXNzaW9uIGlkZW50aWZpZXIgKi9cbiAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG5cbiAgICAvKiogT3B0aW9uYWwgcHJvamVjdCBpZGVudGlmaWVyIChwYXRoL3JlcG8gbmFtZSkgKi9cbiAgICBwcm9qZWN0Pzogc3RyaW5nO1xuXG4gICAgLyoqIEVycm9yIGRldGFpbHMgKG9ubHkgd2hlbiBzdGF0dXMgPT09ICdmYWlsdXJlJykgKi9cbiAgICBlcnJvcj86IHtcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nO1xuICAgICAgICBuYW1lPzogc3RyaW5nO1xuICAgICAgICBzdGFjaz86IHN0cmluZztcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZEVudmVsb3BlKGlucHV0OiB7XG4gICAgY29tbWFuZE5hbWU6IHN0cmluZztcbiAgICBzdGF0dXM6IENvbW1hbmRFeGVjdXRpb25TdGF0dXM7XG4gICAgc3RhcnRUaW1lTXM6IG51bWJlcjtcbiAgICBlbmRUaW1lTXM6IG51bWJlcjtcbiAgICBpbnB1dHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBvdXRwdXRTdW1tYXJ5Pzogc3RyaW5nO1xuICAgIGZpbGVzVG91Y2hlZD86IHN0cmluZ1tdO1xuICAgIGRlY2lzaW9ucz86IHN0cmluZ1tdO1xuICAgIHRhZ3M/OiBzdHJpbmdbXTtcbiAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgcHJvamVjdD86IHN0cmluZztcbiAgICBlcnJvcj86IHVua25vd247XG59KTogQ29tbWFuZENvbnRleHRFbnZlbG9wZSB7XG4gICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IGlkID0gYGVudl8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1gO1xuXG4gICAgbGV0IGVycm9yUGF5bG9hZDogQ29tbWFuZENvbnRleHRFbnZlbG9wZVtcImVycm9yXCJdO1xuICAgIGlmIChpbnB1dC5lcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGVycm9yUGF5bG9hZCA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGlucHV0LmVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICBuYW1lOiBpbnB1dC5lcnJvci5uYW1lLFxuICAgICAgICAgICAgc3RhY2s6IGlucHV0LmVycm9yLnN0YWNrLFxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoaW5wdXQuZXJyb3IpIHtcbiAgICAgICAgZXJyb3JQYXlsb2FkID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogU3RyaW5nKGlucHV0LmVycm9yKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpZCxcbiAgICAgICAgY3JlYXRlZEF0LFxuICAgICAgICBjb21tYW5kTmFtZTogaW5wdXQuY29tbWFuZE5hbWUsXG4gICAgICAgIHN0YXR1czogaW5wdXQuc3RhdHVzLFxuICAgICAgICBkdXJhdGlvbk1zOiBNYXRoLm1heCgwLCBpbnB1dC5lbmRUaW1lTXMgLSBpbnB1dC5zdGFydFRpbWVNcyksXG4gICAgICAgIGlucHV0czogaW5wdXQuaW5wdXRzLFxuICAgICAgICBvdXRwdXRTdW1tYXJ5OiBpbnB1dC5vdXRwdXRTdW1tYXJ5LFxuICAgICAgICBmaWxlc1RvdWNoZWQ6IGlucHV0LmZpbGVzVG91Y2hlZCB8fCBbXSxcbiAgICAgICAgZGVjaXNpb25zOiBpbnB1dC5kZWNpc2lvbnMgfHwgW10sXG4gICAgICAgIHRhZ3M6IEFycmF5LmZyb20oXG4gICAgICAgICAgICBuZXcgU2V0KFtcbiAgICAgICAgICAgICAgICBcImNvbW1hbmQtZW52ZWxvcGVcIixcbiAgICAgICAgICAgICAgICBgY29tbWFuZDoke2lucHV0LmNvbW1hbmROYW1lfWAsXG4gICAgICAgICAgICAgICAgLi4uKGlucHV0LnRhZ3MgfHwgW10pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICksXG4gICAgICAgIHNlc3Npb25JZDogaW5wdXQuc2Vzc2lvbklkLFxuICAgICAgICBwcm9qZWN0OiBpbnB1dC5wcm9qZWN0LFxuICAgICAgICBlcnJvcjogaW5wdXQuc3RhdHVzID09PSBcImZhaWx1cmVcIiA/IGVycm9yUGF5bG9hZCA6IHVuZGVmaW5lZCxcbiAgICB9O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBFdmVudCBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBDb250ZXh0RXZlbnQgPVxuICAgIHwgeyB0eXBlOiBcInNlc3Npb25fY3JlYXRlZFwiOyBzZXNzaW9uOiBTZXNzaW9uIH1cbiAgICB8IHsgdHlwZTogXCJzZXNzaW9uX3Jlc3RvcmVkXCI7IHNlc3Npb246IFNlc3Npb24gfVxuICAgIHwgeyB0eXBlOiBcInNlc3Npb25fdXBkYXRlZFwiOyBzZXNzaW9uOiBTZXNzaW9uIH1cbiAgICB8IHsgdHlwZTogXCJtZW1vcnlfYWRkZWRcIjsgZW50cnk6IE1lbW9yeUVudHJ5IH1cbiAgICB8IHsgdHlwZTogXCJtZW1vcnlfYWNjZXNzZWRcIjsgZW50cnk6IE1lbW9yeUVudHJ5IH1cbiAgICB8IHsgdHlwZTogXCJza2lsbF9sb2FkZWRcIjsgc2tpbGw6IExvYWRlZFNraWxsIH1cbiAgICB8IHsgdHlwZTogXCJjb250ZXh0X2Fzc2VtYmxlZFwiOyBjb250ZXh0OiBBc3NlbWJsZWRDb250ZXh0IH07XG5cbmV4cG9ydCB0eXBlIENvbnRleHRFdmVudEhhbmRsZXIgPSAoZXZl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SUFFQSxJQUFJO0FBQUEsTUFDQSxNQUFNLFVBQVUsTUFBTSxTQUFTLGFBQWEsT0FBTztBQUFBLE1BQ25ELE9BQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxNQUMzQixPQUFPLE9BQU87QUFBQSxNQUNaLFFBQVEsTUFDSixtQ0FBbUMsY0FDbkMsS0FDSjtBQUFBLE1BQ0EsT0FBTztBQUFBO0FBQUE7QUFBQSxFQU9mLGlCQUFpQixHQUFXO0FBQUEsSUFDeEIsSUFBSSxDQUFDLEtBQUssZ0JBQWdCO0FBQUEsTUFDdEIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFFBQVEsV0FBVyxhQUFhLEtBQUs7QUFBQSxJQUNyQyxNQUFNLGVBQWUsS0FBSyxnQkFBZ0I7QUFBQSxJQUUxQyxNQUFNLFFBQVE7QUFBQSxNQUNWLGVBQWUsS0FBSyxlQUFlO0FBQUEsTUFDbkMsWUFBWSxTQUFTO0FBQUEsTUFDckIsU0FBUyxTQUFTLFdBQVcsU0FBUyxXQUFXO0FBQUEsTUFDakQsU0FBUyxPQUFPLFNBQVMsU0FBUyxTQUFTO0FBQUEsTUFDM0M7QUFBQSxNQUNBLHFCQUFxQixVQUFVLFlBQVk7QUFBQSxNQUMzQyxHQUFHLFVBQVUsWUFBWSxNQUFNLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssR0FBRztBQUFBLE1BQ3pELFVBQVUsWUFBWSxTQUFTLEtBQ3pCLGFBQWEsVUFBVSxZQUFZLFNBQVMsWUFDNUM7QUFBQSxNQUNOO0FBQUEsTUFDQSxzQkFBc0IsYUFBYTtBQUFBLE1BQ25DLEdBQUcsYUFDRSxNQUFNLEdBQUcsQ0FBQyxFQUNWLElBQUksQ0FBQyxNQUFNLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUztBQUFBLE1BQ2hELGFBQWEsU0FBUyxJQUNoQixhQUFhLGFBQWEsU0FBUyxXQUNuQztBQUFBLE1BQ047QUFBQSxNQUNBLHlCQUF5QixVQUFVLFVBQVU7QUFBQSxNQUM3QyxHQUFHLFVBQVUsVUFDUixNQUFNLEVBQUUsRUFDUixJQUNHLENBQUMsTUFBTSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsVUFBVSxHQUFHLEdBQUcsTUFDeEQ7QUFBQSxJQUNSO0FBQUEsSUFFQSxPQUFPLE1BQU0sT0FBTyxPQUFPLEVBQUUsS0FBSztBQUFBLENBQUk7QUFBQTtBQUU5QztBQUdBLElBQUksaUJBQXdDO0FBRXJDLFNBQVMsaUJBQWlCLENBQzdCLFFBQ2M7QUFBQSxFQUNkLElBQUksQ0FBQyxnQkFBZ0I7QUFBQSxJQUNqQixpQkFBaUIsSUFBSSxlQUFlLE1BQU07QUFBQSxFQUM5QztBQUFBLEVBQ0EsT0FBTztBQUFBOyIsCiAgImRlYnVnSWQiOiAiQjZENDU0NEE1QUJCNzI4NzY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
