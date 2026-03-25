/**
 * Session Manager
 *
 * Manages persistent session state that survives conversation restarts.
 * Sessions act as "workbenches" containing active files, pending tasks,
 * decisions, and arbitrary context data.
 */
import type { ContextEnvelope, MemoryEntry } from "../agents/types";
import type { ContextConfig, Decision, Session, SessionMetadata, Task } from "./types";
/**
 * Audit record for handoff operations
 */
interface HandoffAuditRecord {
    id: string;
    correlationId: string;
    fromAgent: string;
    toAgent: string;
    timestamp: Date;
    contextSize: number;
    success: boolean;
    reason?: string;
    sessionId: string;
}
export declare class SessionManager {
    private config;
    private currentSession;
    private sessionsDir;
    private currentSessionPath;
    private archiveDir;
    private auditLog;
    constructor(config?: Partial<ContextConfig>);
    /**
     * Initialize the session manager and storage directories
     */
    initialize(): Promise<void>;
    /**
     * Start a new session or restore the current one
     */
    startSession(metadata?: Partial<SessionMetadata>): Promise<Session>;
    /**
     * Get the current active session
     */
    getSession(): Session | null;
    /**
     * Create a new session object
     */
    private createSession;
    /**
     * Generate a unique session ID
     */
    private generateSessionId;
    /**
     * Load the current session from disk
     */
    private loadCurrentSession;
    /**
     * Save session to disk
     */
    private saveSession;
    /**
     * Add a file to the active files list
     */
    addActiveFile(path: string): Promise<void>;
    /**
     * Remove a file from the active files list
     */
    removeActiveFile(path: string): Promise<void>;
    /**
     * Get all active files
     */
    getActiveFiles(): string[];
    /**
     * Archive the current session
     */
    archiveCurrentSession(): Promise<void>;
    /**
     * Build a context envelope for agent handoffs
     */
    buildContextEnvelope(requestId: string, depth?: number, previousResults?: ContextEnvelope["previousResults"], taskContext?: Record<string, unknown>, memoryManager?: {
        searchMemories: (query: string) => Promise<MemoryEntry[]>;
    }): ContextEnvelope;
    /**
     * Record a handoff operation for auditing
     */
    recordHandoff(correlationId: string, fromAgent: string, toAgent: string, contextSize: number, success: boolean, reason?: string): void;
    /**
     * Get audit trail for correlation ID
     */
    getAuditTrail(correlationId: string): HandoffAuditRecord[];
    /**
     * Get all audit records
     */
    getAllAuditRecords(): HandoffAuditRecord[];
    /**
     * Generate correlation ID for handoff chain
     */
    generateCorrelationId(): string;
    /**
     * Serialize context envelope for prompt injection
     */
    serializeContextEnvelope(envelope: ContextEnvelope): string;
    /**
     * Merge context envelopes with conflict resolution
     */
    mergeContextEnvelopes(envelopes: ContextEnvelope[], strategy?: "last-wins" | "consensus" | "priority"): ContextEnvelope;
    /**
     * Remove duplicate previous results based on agent type and output
     */
    private deduplicatePreviousResults;
    /**
     * Merge task contexts with different strategies
     */
    private mergeTaskContexts;
    /**
     * Add a task to the session
     */
    addTask(content: string, priority?: Task["priority"]): Promise<Task>;
    /**
     * Update a task's status
     */
    updateTaskStatus(taskId: string, status: Task["status"]): Promise<void>;
    /**
     * Get all tasks
     */
    getTasks(): Task[];
    /**
     * Get pending tasks only
     */
    getPendingTasks(): Task[];
    /**
     * Record a decision
     */
    addDecision(title: string, description: string, rationale: string, options?: {
        alternatives?: string[];
        tags?: string[];
    }): Promise<Decision>;
    /**
     * Get all decisions
     */
    getDecisions(): Decision[];
    /**
     * Set a context value
     */
    setContext(key: string, value: unknown): Promise<void>;
    /**
     * Get a context value
     */
    getContext<T = unknown>(key: string): T | undefined;
    /**
     * Get all context
     */
    getAllContext(): Record<string, unknown>;
    /**
     * Archive the current session and start fresh
     */
    archiveSession(): Promise<void>;
    /**
     * List archived sessions
     */
    listArchivedSessions(): Promise<string[]>;
    /**
     * Load an archived session
     */
    loadArchivedSession(sessionId: string): Promise<Session | null>;
    /**
     * Get session summary for context assembly
     */
    getSessionSummary(): string;
}
export declare function getSessionManager(config?: Partial<ContextConfig>): SessionManager;
export {};
