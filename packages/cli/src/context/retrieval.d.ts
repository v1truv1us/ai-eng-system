/**
 * Context Retrieval Engine
 *
 * Intelligent context assembly with push/pull patterns.
 * Combines session state, memories, and skills into optimized context.
 */
import { MemoryManager } from "./memory";
import { ProgressiveSkillLoader } from "./progressive";
import { SessionManager } from "./session";
import type { AssembledContext, ContextConfig, ContextTrigger } from "./types";
export declare class ContextRetriever {
    private config;
    private sessionManager;
    private memoryManager;
    private skillLoader;
    private vectorManager;
    private contextCache;
    /**
     * Initialize vector manager
     */
    initializeVectorManager(): Promise<void>;
    constructor(sessionManager: SessionManager, memoryManager: MemoryManager, skillLoader: ProgressiveSkillLoader, config?: Partial<ContextConfig>);
    /**
     * Infer context from user queries automatically
     */
    private inferContextFromQuery;
    /**
     * Infer context from conversation patterns
     */
    private inferContextFromConversation;
    /**
     * Infer context from code changes
     */
    private inferContextFromCode;
    /**
     * Assemble context based on triggers
     */
    assemble(triggers: ContextTrigger[]): Promise<AssembledContext>;
    /**
     * Push context: proactively load context on events
     */
    pushContext(event: string, data?: Record<string, unknown>): Promise<AssembledContext>;
    /**
     * Pull context: on-demand retrieval
     */
    pullContext(query: string): Promise<AssembledContext>;
    /**
     * Get context summary for inclusion in prompts
     */
    getContextSummary(maxMemories?: number): Promise<string>;
    /**
     * Get cached context or create new one
     */
    private getCachedContext;
    /**
     * Cache context with TTL
     */
    private cacheContext;
    /**
     * Generate cache key from triggers
     */
    private generateCacheKey;
    /**
     * Estimate context size
     */
    estimateContextSize(context: AssembledContext): {
        sessions: number;
        memories: number;
        skills: number;
        total: number;
    };
}
/**
 * Create a context retriever with all managers initialized
 */
export declare function createContextRetriever(config?: Partial<ContextConfig>): Promise<ContextRetriever>;
