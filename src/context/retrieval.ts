/**
 * Context Retrieval Engine
 * 
 * Intelligent context assembly with push/pull patterns.
 * Combines session state, memories, and skills into optimized context.
 */

import type {
  ContextTrigger,
  AssembledContext,
  MemoryEntry,
  ContextConfig,
  DEFAULT_CONFIG
} from "./types"
import { SessionManager } from "./session"
import { MemoryManager } from "./memory"
import { ProgressiveSkillLoader } from "./progressive"
import { VectorMemoryManager, VectorMath, ContextRanker } from "./vector"

export class ContextRetriever {
  private config: ContextConfig
  private sessionManager: SessionManager
  private memoryManager: MemoryManager
  private skillLoader: ProgressiveSkillLoader
  private vectorManager: VectorMemoryManager
  private contextCache: Map<string, { context: AssembledContext; expires: number }> = new Map()

  /**
   * Initialize vector manager
   */
  async initializeVectorManager(): Promise<void> {
    await this.vectorManager.initialize()
  }

  constructor(
    sessionManager: SessionManager,
    memoryManager: MemoryManager,
    skillLoader: ProgressiveSkillLoader,
    config: Partial<ContextConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionManager = sessionManager
    this.memoryManager = memoryManager
    this.skillLoader = skillLoader
    this.vectorManager = new VectorMemoryManager(config)
  }

/**
   * Assemble context based on triggers
   */
  async assemble(triggers: ContextTrigger[]): Promise<AssembledContext> {
    const startTime = Date.now()
    const memories: MemoryEntry[] = []
    const skills = []
    let tokenEstimate = 0

    // Process each trigger
    for (const trigger of triggers) {
      switch (trigger.type) {
        case "session_start":
          // Load session context
          break

        case "file_open":
          // Load relevant memories for file
          const filePath = trigger.data.path as string
          
          // Use semantic search for file-related memories
          const fileMemories = await this.vectorManager.semanticSearch(filePath, {
            limit: 5,
            minScore: 0.3,
            memoryType: "procedural"
          })
          
          // Also do traditional search
          const traditionalMemories = this.memoryManager.searchMemories(filePath, {
            minConfidence: 0.6
          })
          
          memories.push(...fileMemories, ...traditionalMemories)
          break

        case "command":
          // Load memories related to command
          const command = trigger.data.command as string
          
// Semantic search for command-related memories
          const semanticMemories = await this.vectorManager.semanticSearch(command, {
            limit: 3,
            minScore: 0.4
memoryType: "procedural"
          })
          
          // Traditional search
          const commandMemories = this.memoryManager.searchMemories(command, {
            minConfidence: 0.5
          })
          
          memories.push(...semanticMemories, ...commandMemories)
          break

        case "query":
          // Search memories for query with enhanced ranking
          const query = trigger.data.query as string
          
          // Get all memories for ranking
          const allMemories = this.memoryManager.getAllMemories()
          const context = {
            query,
            activeFiles: this.sessionManager.getActiveFiles(),
            currentTask: this.sessionManager.getContext<string>("currentTask"),
            sessionType: this.sessionManager.getSession()?.metadata.mode
          }
          
          // Rank memories by relevance
          const rankedMemories = ContextRanker.rankByRelevance(allMemories, context)
          memories.push(...rankedMemories.slice(0, 10))
          break

        case "task":
          // Load memories related to task type
          const taskType = trigger.data.taskType as string
          const taskMemories = this.memoryManager.searchMemories(taskType, {
            tags: ["task"],
            minConfidence: 0.5
          })
          memories.push(...taskMemories)
          break
      }
    }

    // Deduplicate memories
    const uniqueMemories = Array.from(
      new Map(memories.map(m => [m.id, m])).values()
    )

    // Calculate token estimate
    for (const memory of uniqueMemories) {
      tokenEstimate += Math.ceil(memory.content.length / 4)
    }

    const duration = Date.now() - startTime

    return {
      session: this.sessionManager.getSession() || undefined,
      memories: uniqueMemories,
      skills,
      tokenEstimate,
      meta: {
        assembledAt: new Date().toISOString(),
        triggers: triggers.map(t => t.type),
        duration
      }
    }
  }
    }

    // Deduplicate memories
    const uniqueMemories = Array.from(
      new Map(memories.map(m => [m.id, m])).values()
    )

    // Calculate token estimate
    for (const memory of uniqueMemories) {
      tokenEstimate += Math.ceil(memory.content.length / 4)
    }

    const duration = Date.now() - startTime

    return {
      session: this.sessionManager.getSession() || undefined,
      memories: uniqueMemories,
      skills,
      tokenEstimate,
      meta: {
        assembledAt: new Date().toISOString(),
        triggers: triggers.map(t => t.type),
        duration
      }
    }
  }

  /**
   * Push context: proactively load context on events
   */
  async pushContext(event: string, data?: Record<string, unknown>): Promise<AssembledContext> {
    const triggers: ContextTrigger[] = []

    switch (event) {
      case "session_start":
        triggers.push({
          type: "session_start",
          pattern: "push",
          data: data || {}
        })
        break

      case "file_open":
        triggers.push({
          type: "file_open",
          pattern: "push",
          data: data || {}
        })
        break

      case "command_run":
        triggers.push({
          type: "command",
          pattern: "push",
          data: data || {}
        })
        break
    }

    const cacheKey = this.generateCacheKey(triggers)
    const cached = await this.getCachedContext(cacheKey)
    
    if (cached) {
      return cached
    }

    const context = await this.assemble(triggers)
    this.cacheContext(cacheKey, context)
    
    return context
  }

  /**
   * Pull context: on-demand retrieval
   */
  async pullContext(query: string): Promise<AssembledContext> {
    const triggers: ContextTrigger[] = [
      {
        type: "query",
        pattern: "pull",
        data: { query }
      }
    ]

    const cacheKey = this.generateCacheKey(triggers)
    const cached = await this.getCachedContext(cacheKey)
    
    if (cached) {
      return cached
    }

    const context = await this.assemble(triggers)
    this.cacheContext(cacheKey, context)
    
    return context
  }

  /**
   * Get context summary for inclusion in prompts
   */
  async getContextSummary(maxMemories: number = 5): Promise<string> {
    const session = this.sessionManager.getSession()
    const memories = this.memoryManager.getAllMemories().slice(0, maxMemories)

    const lines = [
      "## Context Summary",
      ""
    ]

    if (Session) {
      lines.push("### Session")
      lines.push(this.sessionManager.getSessionSummary())
      lines.push("")
    }

    if (memories.length > 0) {
      lines.push("### Relevant Memories")
      for (const mem of memories) {
        lines.push(`- [${mem.type}] ${mem.content.substring(0, 100)}...`)
      }
      lines.push("")
    }

    lines.push("### Memory Statistics")
    lines.push(this.memoryManager.getSummary(3))

    return lines.join("\n")
  }

  /**
   * Get cached context or create new one
   */
  private async getCachedContext(
    cacheKey: string,
    ttlMs: number = 300000 // 5 minutes
  ): Promise<AssembledContext | null> {
    const cached = this.contextCache.get(cacheKey)
    
    if (cached && Date.now() < cached.expires) {
      // Update access time for memories
      for (const memory of cached.context.memories) {
        await this.memoryManager.accessMemory(memory.id)
      }
      
      return cached.context
    }

    return null
  }

  /**
   * Cache context with TTL
   */
  private cacheContext(
    cacheKey: string,
    context: AssembledContext,
    ttlMs: number = 300000 // 5 minutes
  ): void {
    this.contextCache.set(cacheKey, {
      context,
      expires: Date.now() + ttlMs
    })
  }

  /**
   * Generate cache key from triggers
   */
  private generateCacheKey(triggers: ContextTrigger[]): string {
    const sorted = [...triggers].sort((a, b) => a.type.localeCompare(b.type))
    return JSON.stringify(sorted.map(t => ({
      type: t.type,
      data: t.data
    })))
  }

  /**
   * Estimate context size
   */
  estimateContextSize(context: AssembledContext): {
    sessions: number
    memories: number
    skills: number
    total: number
  } {
    return {
      sessions: context.session ? 500 : 0,
      memories: context.memories.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0),
      skills: context.skills.reduce((sum, s) => sum + s.tokenEstimate, 0),
      total: context.tokenEstimate
    }
  }
}

/**
 * Create a context retriever with all managers initialized
 */
export async function createContextRetriever(
  config?: Partial<ContextConfig>
): Promise<ContextRetriever> {
  const sessionManager = new SessionManager(config)
  const memoryManager = new MemoryManager(config)
  const skillLoader = new ProgressiveSkillLoader(config?.storagePath)

  await sessionManager.initialize()
  await memoryManager.initialize()

  const retriever = new ContextRetriever(sessionManager, memoryManager, skillLoader, config)
  
  // Initialize vector manager
  await retriever.initializeVectorManager()

  return retriever
}
