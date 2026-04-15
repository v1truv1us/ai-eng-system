/**
 * Memory System
 *
 * Implements declarative, procedural, and episodic memory with provenance tracking.
 * Memories persist across sessions and include confidence scores that decay over time.
 */
import type { CommandContextEnvelope, ContextConfig, MemoryEntry, MemorySource, MemoryType } from "./types";
export declare class MemoryManager {
    private config;
    private memoryDir;
    private store;
    constructor(config?: Partial<ContextConfig>);
    /**
     * Initialize the memory manager and load existing memories
     */
    initialize(): Promise<void>;
    /**
     * Load all memories from disk
     */
    private loadMemories;
    /**
     * Save all memories to disk
     */
    private saveMemories;
    /**
     * Add a memory entry
     */
    addMemory(type: MemoryType, content: string, options?: {
        source?: MemorySource;
        context?: string;
        sessionId?: string;
        tags?: string[];
        confidence?: number;
    }): Promise<MemoryEntry>;
    /**
     * Update a memory entry
     */
    updateMemory(id: string, updates: Partial<Omit<MemoryEntry, "id" | "provenance">>): Promise<MemoryEntry | null>;
    /**
     * Access a memory (updates access count and timestamp)
     */
    accessMemory(id: string): Promise<MemoryEntry | null>;
    /**
     * Delete a memory entry
     */
    deleteMemory(id: string): Promise<boolean>;
    /**
     * Store a command execution envelope as episodic memory.
     */
    storeCommandEnvelope(envelope: CommandContextEnvelope, options?: {
        source?: MemorySource;
        confidence?: number;
        context?: string;
    }): Promise<MemoryEntry>;
    /**
     * Get the most recently added command envelope.
     */
    getLatestCommandEnvelope(filter?: {
        commandName?: string;
        sessionId?: string;
    }): CommandContextEnvelope | null;
    /**
     * Search memories by content or tags
     */
    searchMemories(query: string, options?: {
        type?: MemoryType;
        tags?: string[];
        minConfidence?: number;
    }): MemoryEntry[];
    /**
     * Get memories by type
     */
    getMemoriesByType(type: MemoryType): MemoryEntry[];
    /**
     * Get all memories
     */
    getAllMemories(): MemoryEntry[];
    /**
     * Get memory statistics
     */
    getStats(): {
        total: number;
        byType: Record<MemoryType, number>;
        avgConfidence: number;
        oldestMemory: string | null;
        newestMemory: string | null;
    };
    /**
     * Apply confidence decay to a memory based on age
     * Inferred memories decay faster than user-provided ones
     */
    private applyConfidenceDecay;
    /**
     * Archive old memories (move to episodic summary)
     */
    archiveOldMemories(daysThreshold?: number): Promise<number>;
    /**
     * Get a summary of memories for context assembly
     */
    getSummary(maxItems?: number): string;
}
export declare function getMemoryManager(config?: Partial<ContextConfig>): MemoryManager;
