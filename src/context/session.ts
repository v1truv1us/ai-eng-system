/**
 * Session Manager
 * 
 * Manages persistent session state that survives conversation restarts.
 * Sessions act as "workbenches" containing active files, pending tasks,
 * decisions, and arbitrary context data.
 */

import { readFile, writeFile, mkdir, readdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import type {
  Session,
  SessionWorkbench,
  SessionMetadata,
  Task,
  Decision,
  ContextConfig,
  DEFAULT_CONFIG
} from "./types"

export class SessionManager {
  private config: ContextConfig
  private currentSession: Session | null = null
  private sessionsDir: string
  private currentSessionPath: string
  private archiveDir: string

  constructor(config: Partial<ContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionsDir = join(this.config.storagePath, "sessions")
    this.currentSessionPath = join(this.sessionsDir, "current.json")
    this.archiveDir = join(this.sessionsDir, "archive")
  }

  /**
   * Initialize the session manager and storage directories
   */
  async initialize(): Promise<void> {
    await mkdir(this.sessionsDir, { recursive: true })
    await mkdir(this.archiveDir, { recursive: true })
  }

  /**
   * Start a new session or restore the current one
   */
  async startSession(metadata: Partial<SessionMetadata> = {}): Promise<Session> {
    // Try to restore existing session
    const existing = await this.loadCurrentSession()
    
    if (existing) {
      // Update last active time
      existing.lastActive = new Date().toISOString()
      existing.metadata = { ...existing.metadata, ...metadata }
      await this.saveSession(existing)
      this.currentSession = existing
      return existing
    }

    // Create new session
    const session = this.createSession(metadata)
    await this.saveSession(session)
    this.currentSession = session
    return session
  }

  /**
   * Get the current active session
   */
  getSession(): Session | null {
    return this.currentSession
  }

  /**
   * Create a new session object
   */
  private createSession(metadata: Partial<SessionMetadata> = {}): Session {
    const now = new Date().toISOString()
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
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `sess_${timestamp}_${random}`
  }

  /**
   * Load the current session from disk
   */
  private async loadCurrentSession(): Promise<Session | null> {
    if (!existsSync(this.currentSessionPath)) {
      return null
    }

    try {
      const content = await readFile(this.currentSessionPath, "utf-8")
      return JSON.parse(content) as Session
    } catch (error) {
      console.error("Failed to load session:", error)
      return null
    }
  }

  /**
   * Save session to disk
   */
  private async saveSession(session: Session): Promise<void> {
    await writeFile(
      this.currentSessionPath,
      JSON.stringify(session, null, 2)
    )
  }

  // ========================================================================
  // Workbench Operations
  // ========================================================================

  /**
   * Add a file to the active files list
   */
  async addActiveFile(path: string): Promise<void> {
    if (!this.currentSession) return
    
    if (!this.currentSession.workbench.activeFiles.includes(path)) {
      this.currentSession.workbench.activeFiles.push(path)
      this.currentSession.lastActive = new Date().toISOString()
      await this.saveSession(this.currentSession)
    }
  }

  /**
   * Remove a file from the active files list
   */
  async removeActiveFile(path: string): Promise<void> {
    if (!this.currentSession) return
    
    const index = this.currentSession.workbench.activeFiles.indexOf(path)
    if (index > -1) {
      this.currentSession.workbench.activeFiles.splice(index, 1)
      this.currentSession.lastActive = new Date().toISOString()
      await this.saveSession(this.currentSession)
    }
  }

  /**
   * Get all active files
   */
  getActiveFiles(): string[] {
    return this.currentSession?.workbench.activeFiles || []
  }

  // ========================================================================
  // Task Operations
  // ========================================================================

  /**
   * Add a task to the session
   */
  async addTask(content: string, priority: Task["priority"] = "medium"): Promise<Task> {
    if (!this.currentSession) {
      throw new Error("No active session")
    }

    const task: Task = {
      id: `task_${Date.now().toString(36)}`,
      content,
      status: "pending",
      priority,
      createdAt: new Date().toISOString()
    }

    this.currentSession.workbench.pendingTasks.push(task)
    this.currentSession.lastActive = new Date().toISOString()
    await this.saveSession(this.currentSession)
    
    return task
  }

  /**
   * Update a task's status
   */
  async updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {
    if (!this.currentSession) return

    const task = this.currentSession.workbench.pendingTasks.find(t => t.id === taskId)
    if (task) {
      task.status = status
      if (status === "completed") {
        task.completedAt = new Date().toISOString()
      }
      this.currentSession.lastActive = new Date().toISOString()
      await this.saveSession(this.currentSession)
    }
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return this.currentSession?.workbench.pendingTasks || []
  }

  /**
   * Get pending tasks only
   */
  getPendingTasks(): Task[] {
    return this.getTasks().filter(t => t.status === "pending" || t.status === "in_progress")
  }

  // ========================================================================
  // Decision Operations
  // ========================================================================

  /**
   * Record a decision
   */
  async addDecision(
    title: string,
    description: string,
    rationale: string,
    options?: { alternatives?: string[]; tags?: string[] }
  ): Promise<Decision> {
    if (!this.currentSession) {
      throw new Error("No active session")
    }

    const decision: Decision = {
      id: `dec_${Date.now().toString(36)}`,
      title,
      description,
      rationale,
      alternatives: options?.alternatives,
      createdAt: new Date().toISOString(),
      tags: options?.tags || []
    }

    this.currentSession.workbench.decisions.push(decision)
    this.currentSession.lastActive = new Date().toISOString()
    await this.saveSession(this.currentSession)

    return decision
  }

  /**
   * Get all decisions
   */
  getDecisions(): Decision[] {
    return this.currentSession?.workbench.decisions || []
  }

  // ========================================================================
  // Context Operations
  // ========================================================================

  /**
   * Set a context value
   */
  async setContext(key: string, value: unknown): Promise<void> {
    if (!this.currentSession) return

    this.currentSession.workbench.context[key] = value
    this.currentSession.lastActive = new Date().toISOString()
    await this.saveSession(this.currentSession)
  }

  /**
   * Get a context value
   */
  getContext<T = unknown>(key: string): T | undefined {
    return this.currentSession?.workbench.context[key] as T | undefined
  }

  /**
   * Get all context
   */
  getAllContext(): Record<string, unknown> {
    return this.currentSession?.workbench.context || {}
  }

  // ========================================================================
  // Session Lifecycle
  // ========================================================================

  /**
   * Archive the current session and start fresh
   */
  async archiveSession(): Promise<void> {
    if (!this.currentSession) return

    const archivePath = join(
      this.archiveDir,
      `${this.currentSession.id}.json`
    )
    
    await writeFile(archivePath, JSON.stringify(this.currentSession, null, 2))
    
    // Remove current session
    if (existsSync(this.currentSessionPath)) {
      const { rm } = await import("fs/promises")
      await rm(this.currentSessionPath)
    }
    
    this.currentSession = null
  }

  /**
   * List archived sessions
   */
  async listArchivedSessions(): Promise<string[]> {
    if (!existsSync(this.archiveDir)) {
      return []
    }

    const files = await readdir(this.archiveDir)
    return files
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(".json", ""))
  }

  /**
   * Load an archived session
   */
  async loadArchivedSession(sessionId: string): Promise<Session | null> {
    const archivePath = join(this.archiveDir, `${sessionId}.json`)
    
    if (!existsSync(archivePath)) {
      return null
    }

    try {
      const content = await readFile(archivePath, "utf-8")
      return JSON.parse(content) as Session
    } catch (error) {
      console.error(`Failed to load archived session ${sessionId}:`, error)
      return null
    }
  }

  /**
   * Get session summary for context assembly
   */
  getSessionSummary(): string {
    if (!this.currentSession) {
      return "No active session."
    }

    const { workbench, metadata } = this.currentSession
    const pendingTasks = this.getPendingTasks()
    
    const lines = [
      `## Session: ${this.currentSession.id}`,
      `Project: ${metadata.project}`,
      metadata.branch ? `Branch: ${metadata.branch}` : null,
      metadata.mode ? `Mode: ${metadata.mode}` : null,
      "",
      `### Active Files (${workbench.activeFiles.length})`,
      ...workbench.activeFiles.slice(0, 10).map(f => `- ${f}`),
      workbench.activeFiles.length > 10 ? `- ... and ${workbench.activeFiles.length - 10} more` : null,
      "",
      `### Pending Tasks (${pendingTasks.length})`,
      ...pendingTasks.slice(0, 5).map(t => `- [${t.priority}] ${t.content}`),
      pendingTasks.length > 5 ? `- ... and ${pendingTasks.length - 5} more` : null,
      "",
      `### Recent Decisions (${workbench.decisions.length})`,
      ...workbench.decisions.slice(-3).map(d => `- ${d.title}: ${d.rationale.substring(0, 100)}...`)
    ]

    return lines.filter(Boolean).join("\n")
  }
}

// Singleton instance for convenience
let defaultManager: SessionManager | null = null

export function getSessionManager(config?: Partial<ContextConfig>): SessionManager {
  if (!defaultManager) {
    defaultManager = new SessionManager(config)
  }
  return defaultManager
}
