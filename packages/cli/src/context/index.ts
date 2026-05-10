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

// Exporters
export { type ContextExporter, MarkdownContextExporter } from "./exporters";
// Memory Manager
export { getMemoryManager, MemoryManager } from "./memory";
// Progressive Disclosure
export {
    createSkillLoader,
    ProgressiveSkillLoader,
    TIER_STRATEGIES,
} from "./progressive";
// Context Retrieval
export {
    ContextRetriever,
    createContextRetriever,
} from "./retrieval";
// Session Manager
export { getSessionManager, SessionManager } from "./session";
// Type exports
export type {
    AssembledContext,
    CommandContextEnvelope,
    CommandExecutionStatus,
    ContextConfig,
    ContextEvent,
    ContextEventHandler,
    ContextTrigger,
    Decision,
    LoadedSkill,
    MemoryEntry,
    MemorySource,
    MemoryStore,
    MemoryType,
    Session,
    SessionMetadata,
    SessionWorkbench,
    SkillContent,
    SkillMetadata,
    SkillTier,
    Task,
} from "./types";
export { createCommandEnvelope, DEFAULT_CONFIG, loadConfig } from "./types";
// Vector Search
export {
    ContextRanker,
    type SearchResult,
    TextTokenizer,
    type VectorEmbedding,
    VectorMath,
    VectorMemoryManager,
    type VectorStore,
} from "./vector";

/**
 * Initialize the complete context engineering system
 */
export async function initializeContextSystem(
    config?: Partial<import("./types").ContextConfig>,
) {
    const { createContextRetriever } = await import("./retrieval");
    return createContextRetriever(config);
}

/**
 * Quick access to singleton managers
 */
export function getContextManagers(
    config?: Partial<import("./types").ContextConfig>,
) {
    const { getSessionManager } = require("./session");
    const { getMemoryManager } = require("./memory");

    return {
        session: getSessionManager(config),
        memory: getMemoryManager(config),
    };
}
