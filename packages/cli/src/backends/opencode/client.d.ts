/**
 * OpenCode SDK Backend Wrapper
 *
 * Provides session management and message sending capabilities
 * for ai-eng ralph runner using OpenCode SDK.
 */
import { type OpencodeClient } from "@opencode-ai/sdk";
/**
 * Response interface for messages
 */
export interface MessageResponse {
    content: string;
}
/**
 * Streaming response interface
 */
export interface StreamingResponse {
    /** Readable stream of response chunks */
    stream: ReadableStream<Uint8Array>;
    /** Promise that resolves to complete response when stream ends */
    complete: Promise<MessageResponse>;
}
/**
 * Session interface for ai-eng runner
 */
export interface Session {
    id: string;
    sendMessage: (message: string) => Promise<MessageResponse>;
    sendMessageStream: (message: string) => Promise<StreamingResponse>;
    close: () => Promise<void>;
    /** Tool invocations captured during this session */
    _toolInvocations?: Array<{
        id: string;
        name: string;
        input?: Record<string, unknown>;
        output?: string;
        status: "ok" | "error";
        error?: string;
        startedAt?: string;
        completedAt?: string;
    }>;
}
/**
 * Client configuration options
 */
export interface ClientConfig {
    /** Custom client instance (for testing) */
    client?: OpencodeClient;
    /** Connection timeout in milliseconds (default: 10000) */
    timeout?: number;
    /** Retry attempts for failed operations */
    retryAttempts?: number;
    /** Prompt timeout in milliseconds (used as an idle timeout for streaming) */
    promptTimeout?: number;
    /** Directory/worktree context to run OpenCode in (defaults to process.cwd()) */
    directory?: string;
    /** URL of existing OpenCode server to reuse (if provided, won't spawn new server) */
    existingServerUrl?: string;
    /** Server startup timeout in milliseconds (default: 10000) */
    serverStartupTimeout?: number;
}
/**
 * OpenCode Client Wrapper
 *
 * Wraps OpenCode SDK to provide session management
 * and error handling for ralph runner.
 */
export declare class OpenCodeClient {
    private client;
    private timeout;
    private retryAttempts;
    private activeSessions;
    private promptTimeout;
    private directory;
    private server;
    private serverStartupTimeout;
    /**
     * Private constructor - use static create() factory method instead
     */
    private constructor();
    /**
     * Get an available port for OpenCode server
     *
     * IMPORTANT: Always avoid port 4096 to prevent conflicts with user's existing server
     */
    private static getAvailablePort;
    /**
     * Check if a specific port is available
     */
    private static isPortAvailable;
    /**
     * Find an available port dynamically
     */
    private static findAvailablePort;
    /**
     * Static factory method to create an OpenCodeClient
     *
     * Creates a new client with either:
     * 1. A fresh OpenCode server (default behavior)
     * 2. An existing server URL (if existingServerUrl is provided)
     * 3. A custom client instance (for testing)
     *
     * Note: Spawned OpenCode servers will use to calling directory by default (process.cwd())
     * Use OPENCODE_URL to connect to a different OpenCode instance
     */
    static create(config?: ClientConfig): Promise<OpenCodeClient>;
    /**
     * Create a new OpenCode session with a given prompt
     */
    createSession(prompt: string): Promise<Session>;
    /**
     * Send a message to an existing session
     */
    sendMessage(sessionId: string, message: string): Promise<MessageResponse>;
    /**
     * Close an active session
     */
    closeSession(sessionId: string): Promise<void>;
    /**
     * Get all active session IDs
     */
    getActiveSessions(): string[];
    /**
     * Check if a session is active
     */
    isSessionActive(sessionId: string): boolean;
    /**
     * Close all active sessions
     */
    closeAllSessions(): Promise<void>;
    /**
     * Handle sending a message with streaming support
     */
    private handleSendMessageStream;
    /**
     * Split text into chunks for streaming simulation
     */
    private splitIntoChunks;
    /**
     * Handle sending a message with error handling and retries
     */
    private handleSendMessage;
    /**
     * Check if error is a rate limit error
     */
    private isRateLimitError;
    /**
     * Calculate backoff delay with jitter
     */
    private getBackoffDelay;
    /**
     * Handle session closure with error handling
     */
    private handleSessionClose;
    /**
     * Generate a unique session ID if SDK doesn't provide one
     */
    private generateSessionId;
    /**
     * Generate a properly formatted message ID with msg_ prefix
     * Format: msg_<timestamp>_<random>
     */
    private generateMessageId;
    /**
     * Cleanup method to close all sessions and server
     */
    cleanup(): Promise<void>;
}
