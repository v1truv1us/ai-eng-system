/**
 * Vector Search and Semantic Memory
 *
 * Implements vector embeddings and semantic search for enhanced context retrieval.
 * Uses local vector store with optional external embedding services.
 */
import type { ContextConfig, MemoryEntry } from "./types";
export interface VectorEmbedding {
    id: string;
    vector: number[];
    metadata: {
        memoryId: string;
        type: string;
        tags: string[];
        timestamp: string;
    };
}
export interface SearchResult {
    memory: MemoryEntry;
    score: number;
    relevance: string;
}
export interface VectorStore {
    embeddings: VectorEmbedding[];
    dimension: number;
    indexType: "flat" | "hnsw" | "ivf";
}
/**
 * Simple text tokenizer for creating embeddings
 */
export declare class TextTokenizer {
    /**
     * Simple word-based tokenization
     */
    tokenize(text: string): string[];
    /**
     * Create TF-IDF vectors
     */
    createTFIDFVector(texts: string[]): Map<string, number>;
    /**
     * Create simple frequency vector
     */
    createFrequencyVector(text: string): Map<string, number>;
}
/**
 * Vector similarity calculations
 */
export declare class VectorMath {
    /**
     * Cosine similarity between two vectors
     */
    static cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number;
    /**
     * Euclidean distance between two vectors
     */
    static euclideanDistance(vec1: number[], vec2: number[]): number;
    /**
     * Convert Map to array for calculations
     */
    static mapToArray(map: Map<string, number>, dimension: number): number[];
}
/**
 * Enhanced Memory Manager with Vector Search
 */
export declare class VectorMemoryManager {
    private config;
    private vectorDir;
    private store;
    private tokenizer;
    constructor(config?: Partial<ContextConfig>);
    /**
     * Initialize vector storage
     */
    initialize(): Promise<void>;
    /**
     * Load existing vector store
     */
    private loadVectorStore;
    /**
     * Save vector store
     */
    private saveVectorStore;
    /**
     * Create embedding for a memory entry
     */
    createEmbedding(memory: MemoryEntry): Promise<VectorEmbedding>;
    /**
     * Add memory with vector embedding
     */
    addMemoryWithVector(memory: MemoryEntry): Promise<void>;
    /**
     * Semantic search for memories
     */
    semanticSearch(query: string, options?: {
        limit?: number;
        minScore?: number;
        memoryType?: string;
        tags?: string[];
    }): Promise<SearchResult[]>;
    /**
     * Get relevance label for score
     */
    private getRelevanceLabel;
    /**
     * Get vector store statistics
     */
    getStats(): {
        totalEmbeddings: number;
        dimension: number;
        indexType: string;
        averageVectorNorm: number;
    };
    /**
     * Rebuild vector index (for performance optimization)
     */
    rebuildIndex(): Promise<void>;
    /**
     * Export vector data for backup
     */
    exportVectors(format?: "json" | "csv"): Promise<string>;
}
/**
 * Context Ranking Engine
 */
export declare class ContextRanker {
    /**
     * Rank memories by relevance to current context
     */
    static rankByRelevance(memories: MemoryEntry[], context: {
        query?: string;
        activeFiles?: string[];
        currentTask?: string;
        sessionType?: string;
    }): MemoryEntry[];
    /**
     * Get explanation for ranking
     */
    static getRankingExplanation(memory: MemoryEntry, score: number): string;
}
