/**
 * Context Engineering Type Definitions
 *
 * Core types for session management, memory system, and progressive disclosure.
 * Based on research from Google's Context Engineering and Claude Skills patterns.
 */
export interface Session {
    id: string;
    parentID?: string;
    createdAt: string;
    lastActive: string;
    workbench: SessionWorkbench;
    metadata: SessionMetadata;
}
export interface SessionWorkbench {
    /** Currently active/open files in the session */
    activeFiles: string[];
    /** Pending tasks tracked in this session */
    pendingTasks: Task[];
    /** Architectural/design decisions made */
    decisions: Decision[];
    /** Arbitrary context data */
    context: Record<string, unknown>;
}
export interface SessionMetadata {
    /** Project name or path */
    project: string;
    /** Git branch if applicable */
    branch?: string;
    /** Current working mode */
    mode?: "plan" | "build" | "review";
    /** Platform being used */
    platform?: "claude-code" | "opencode";
}
export interface Task {
    id: string;
    content: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    createdAt: string;
    completedAt?: string;
}
export interface Decision {
    id: string;
    title: string;
    description: string;
    rationale: string;
    alternatives?: string[];
    createdAt: string;
    tags: string[];
}
export type MemoryType = "declarative" | "procedural" | "episodic";
export type MemorySource = "user" | "agent" | "inferred";
export interface MemoryEntry {
    id: string;
    type: MemoryType;
    content: string;
    provenance: MemoryProvenance;
    tags: string[];
    lastAccessed: string;
    accessCount: number;
}
export interface MemoryProvenance {
    /** Where this memory came from */
    source: MemorySource;
    /** When this was recorded */
    timestamp: string;
    /** Confidence level 0-1 (decays over time for inferred) */
    confidence: number;
    /** Context in which this was learned */
    context: string;
    /** Related session ID if applicable */
    sessionId?: string;
}
export interface MemoryStore {
    /** Facts, patterns, preferences */
    declarative: MemoryEntry[];
    /** Workflows, procedures, habits */
    procedural: MemoryEntry[];
    /** Conversation summaries, past events */
    episodic: MemoryEntry[];
}
export type SkillTier = 1 | 2 | 3;
export interface SkillMetadata {
    name: string;
    description: string;
    tier: SkillTier;
    capabilities: string[];
    path: string;
}
export interface SkillContent {
    metadata: SkillMetadata;
    /** Tier 1: Always loaded overview */
    overview: string;
    /** Tier 2: Loaded on activation */
    instructions?: string;
    /** Tier 3: Loaded on specific need */
    resources?: string;
}
export interface LoadedSkill {
    metadata: SkillMetadata;
    loadedTiers: SkillTier[];
    content: string;
    tokenEstimate: number;
}
export type RetrievalPattern = "push" | "pull" | "hybrid";
export interface ContextTrigger {
    type: "session_start" | "file_open" | "command" | "query" | "task" | "conversation_turn" | "file_edit";
    pattern: RetrievalPattern;
    data: Record<string, unknown>;
}
export interface AssembledContext {
    /** Session state */
    session?: Session;
    /** Relevant memories */
    memories: MemoryEntry[];
    /** Loaded skills */
    skills: LoadedSkill[];
    /** Total token estimate */
    tokenEstimate: number;
    /** Assembly metadata */
    meta: {
        assembledAt: string;
        triggers: string[];
        duration: number;
    };
}
export interface ContextExportConfig {
    /** Enable exporting human-readable command envelopes. */
    enabled?: boolean;
    /** Markdown export settings */
    markdown?: {
        /** Output directory for markdown exports */
        outputDir?: string;
    };
}
export interface ContextConfig {
    /** Path to context storage directory */
    storagePath: string;
    /** Maximum memories to keep per type */
    maxMemoriesPerType: number;
    /** Days before archiving old sessions */
    sessionArchiveDays: number;
    /** Confidence decay rate for inferred memories (per day) */
    confidenceDecayRate: number;
    /** Enable vector embeddings (requires external API) */
    enableEmbeddings: boolean;
    /** Default skill tier to load */
    defaultSkillTier: SkillTier;
    /** Enable automatic context inference from conversations and actions */
    enableAutoInference: boolean;
    /** Optional human-readable exports */
    export?: ContextExportConfig;
}
export declare const DEFAULT_CONFIG: ContextConfig;
export declare function loadConfig(customConfig?: Partial<ContextConfig>): Promise<ContextConfig>;
export type CommandExecutionStatus = "success" | "failure";
export interface CommandContextEnvelope {
    /** Unique id for this envelope */
    id: string;
    /** ISO timestamp */
    createdAt: string;
    /** CLI command name (e.g. 'plan', 'research') */
    commandName: string;
    /** Success/failure */
    status: CommandExecutionStatus;
    /** Duration in milliseconds */
    durationMs: number;
    /** Best-effort inputs/options/args summary */
    inputs?: Record<string, unknown>;
    /** Human-readable short summary of what happened */
    outputSummary?: string;
    /** Best-effort list of files the command wrote/modified (may be empty) */
    filesTouched?: string[];
    /** Decisions captured during execution */
    decisions?: string[];
    /** Tags for retrieval */
    tags: string[];
    /** Optional session identifier */
    sessionId?: string;
    /** Optional project identifier (path/repo name) */
    project?: string;
    /** Error details (only when status === 'failure') */
    error?: {
        message: string;
        name?: string;
        stack?: string;
    };
}
export declare function createCommandEnvelope(input: {
    commandName: string;
    status: CommandExecutionStatus;
    startTimeMs: number;
    endTimeMs: number;
    inputs?: Record<string, unknown>;
    outputSummary?: string;
    filesTouched?: string[];
    decisions?: string[];
    tags?: string[];
    sessionId?: string;
    project?: string;
    error?: unknown;
}): CommandContextEnvelope;
export type ContextEvent = {
    type: "session_created";
    session: Session;
} | {
    type: "session_restored";
    session: Session;
} | {
    type: "session_updated";
    session: Session;
} | {
    type: "memory_added";
    entry: MemoryEntry;
} | {
    type: "memory_accessed";
    entry: MemoryEntry;
} | {
    type: "skill_loaded";
    skill: LoadedSkill;
} | {
    type: "context_assembled";
    context: AssembledContext;
};
export type ContextEventHandler = (event: ContextEvent) => void | Promise<void>;
