/**
 * Context Engineering Type Definitions
 * 
 * Core types for session management, memory system, and progressive disclosure.
 * Based on research from Google's Context Engineering and Claude Skills patterns.
 */

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  id: string
  createdAt: string  // ISO date string
  lastActive: string // ISO date string
  workbench: SessionWorkbench
  metadata: SessionMetadata
}

export interface SessionWorkbench {
  /** Currently active/open files in the session */
  activeFiles: string[]
  /** Pending tasks tracked in this session */
  pendingTasks: Task[]
  /** Architectural/design decisions made */
  decisions: Decision[]
  /** Arbitrary context data */
  context: Record<string, unknown>
}

export interface SessionMetadata {
  /** Project name or path */
  project: string
  /** Git branch if applicable */
  branch?: string
  /** Current working mode */
  mode?: 'plan' | 'build' | 'review'
  /** Platform being used */
  platform?: 'claude-code' | 'opencode'
}

export interface Task {
  id: string
  content: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
}

export interface Decision {
  id: string
  title: string
  description: string
  rationale: string
  alternatives?: string[]
  createdAt: string
  tags: string[]
}

// ============================================================================
// Memory Types
// ============================================================================

export type MemoryType = 'declarative' | 'procedural' | 'episodic'
export type MemorySource = 'user' | 'agent' | 'inferred'

export interface MemoryEntry {
  id: string
  type: MemoryType
  content: string
  provenance: MemoryProvenance
  tags: string[]
  lastAccessed: string
  accessCount: number
}

export interface MemoryProvenance {
  /** Where this memory came from */
  source: MemorySource
  /** When this was recorded */
  timestamp: string
  /** Confidence level 0-1 (decays over time for inferred) */
  confidence: number
  /** Context in which this was learned */
  context: string
  /** Related session ID if applicable */
  sessionId?: string
}

export interface MemoryStore {
  /** Facts, patterns, preferences */
  declarative: MemoryEntry[]
  /** Workflows, procedures, habits */
  procedural: MemoryEntry[]
  /** Conversation summaries, past events */
  episodic: MemoryEntry[]
}

// ============================================================================
// Progressive Disclosure Types
// ============================================================================

export type SkillTier = 1 | 2 | 3

export interface SkillMetadata {
  name: string
  description: string
  tier: SkillTier
  capabilities: string[]
  path: string
}

export interface SkillContent {
  metadata: SkillMetadata
  /** Tier 1: Always loaded overview */
  overview: string
  /** Tier 2: Loaded on activation */
  instructions?: string
  /** Tier 3: Loaded on specific need */
  resources?: string
}

export interface LoadedSkill {
  metadata: SkillMetadata
  loadedTiers: SkillTier[]
  content: string
  tokenEstimate: number
}

// ============================================================================
// Context Retrieval Types
// ============================================================================

export type RetrievalPattern = 'push' | 'pull' | 'hybrid'

export interface ContextTrigger {
  type: 'session_start' | 'file_open' | 'command' | 'query' | 'task'
  pattern: RetrievalPattern
  data: Record<string, unknown>
}

export interface AssembledContext {
  /** Session state */
  session?: Session
  /** Relevant memories */
  memories: MemoryEntry[]
  /** Loaded skills */
  skills: LoadedSkill[]
  /** Total token estimate */
  tokenEstimate: number
  /** Assembly metadata */
  meta: {
    assembledAt: string
    triggers: string[]
    duration: number
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ContextConfig {
  /** Path to context storage directory */
  storagePath: string
  /** Maximum memories to keep per type */
  maxMemoriesPerType: number
  /** Days before archiving old sessions */
  sessionArchiveDays: number
  /** Confidence decay rate for inferred memories (per day) */
  confidenceDecayRate: number
  /** Enable vector embeddings (requires external API) */
  enableEmbeddings: boolean
  /** Default skill tier to load */
  defaultSkillTier: SkillTier
}

export const DEFAULT_CONFIG: ContextConfig = {
  storagePath: '.ferg-context',
  maxMemoriesPerType: 100,
  sessionArchiveDays: 30,
  confidenceDecayRate: 0.05,
  enableEmbeddings: false,
  defaultSkillTier: 1
}

// ============================================================================
// Event Types
// ============================================================================

export type ContextEvent = 
  | { type: 'session_created'; session: Session }
  | { type: 'session_restored'; session: Session }
  | { type: 'session_updated'; session: Session }
  | { type: 'memory_added'; entry: MemoryEntry }
  | { type: 'memory_accessed'; entry: MemoryEntry }
  | { type: 'skill_loaded'; skill: LoadedSkill }
  | { type: 'context_assembled'; context: AssembledContext }

export interface ContextEventHandler {
  (event: ContextEvent): void | Promise<void>
}
