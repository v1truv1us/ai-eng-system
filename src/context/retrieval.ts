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

export class ContextRetriever {
  private config: ContextConfig
  private sessionManager: SessionManager
  private memoryManager: MemoryManager
  private skillLoader: ProgressiveSkillLoader

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
          // Load relevant memories for the file
          const filePath = trigger.data.path as string
          const fileMemories = this.memoryManager.searchMemories(filePath, {
            minConfidence: 0.6
          })
          memories.push(...fileMemories)
          break

        case "command":
          // Load memories related to the command
          const command = trigger.data.command as string
          const commandMemories = this.memoryManager.searchMemories(command, {
            minConfidence: 0.5
          })
          memories.push(...commandMemories)
          break

        case "query":
          // Search memories for the query
          const query = trigger.data.query as string
          const queryMemories = this.memoryManager.searchMemories(query, {
            minConfidence: 0.4
          })
          memories.push(...queryMemories)
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

    return this.assemble(triggers)
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

    return this.assemble(triggers)
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

    if (session) {
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

  return new ContextRetriever(sessionManager, memoryManager, skillLoader, config)
}
