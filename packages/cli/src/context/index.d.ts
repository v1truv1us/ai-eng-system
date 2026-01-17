/**
 * Context Engineering System
 *
 * Main entry point for the context engineering implementation.
 * Provides session management, memory system, progressive disclosure,
 * and intelligent context retrieval.
 *
 * Based on:
 * - Google's Context Engineering research (Aakash Gupta)
 * - Claude Skills Progressive Disclosure Architecture (Rick Hightower)
 * - MBZUAI Principled Prompting research
 */
export type { Session, SessionWorkbench, SessionMetadata, Task, Decision, MemoryEntry, MemoryType, MemorySource, MemoryStore, SkillMetadata, SkillContent, LoadedSkill, SkillTier, ContextTrigger, AssembledContext, ContextConfig, CommandContextEnvelope, CommandExecutionStatus, ContextEvent, ContextEventHandler, } from "./types";
export { DEFAULT_CONFIG, loadConfig, createCommandEnvelope } from "./types";
export { SessionManager, getSessionManager } from "./session";
export { MemoryManager, getMemoryManager } from "./memory";
export { ProgressiveSkillLoader, createSkillLoader, TIER_STRATEGIES, } from "./progressive";
export { ContextRetriever, createContextRetriever, } from "./retrieval";
export { VectorMemoryManager, VectorMath, TextTokenizer, ContextRanker, type VectorEmbedding, type VectorStore, type SearchResult, } from "./vector";
export { MarkdownContextExporter, type ContextExporter } from "./exporters";
/**
 * Initialize the complete context engineering system
 */
export declare function initializeContextSystem(config?: Partial<import("./types").ContextConfig>): Promise<import("./retrieval").ContextRetriever>;
/**
 * Quick access to singleton managers
 */
export declare function getContextManagers(config?: Partial<import("./types").ContextConfig>): {
    session: any;
    memory: any;
};
