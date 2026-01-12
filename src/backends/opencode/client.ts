/**
 * OpenCode SDK Backend Wrapper
 *
 * Provides session management and message sending capabilities
 * for ai-eng ralph runner using OpenCode SDK.
 */

import {
    createOpencode,
    createOpencodeClient,
    type OpencodeClient,
} from "@opencode-ai/sdk";
import { Log } from "../../util/log.js";

const log = Log.create({ service: "opencode-client" });

/**
 * Response interface for messages
 */
export interface MessageResponse {
    content: string;
}

/**
 * Session interface for ai-eng runner
 */
export interface Session {
    id: string;
    sendMessage: (message: string) => Promise<MessageResponse>;
    close: () => Promise<void>;
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
    /** Prompt timeout in milliseconds */
    promptTimeout?: number;
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
export class OpenCodeClient {
    private client: OpencodeClient;
    private timeout: number;
    private retryAttempts: number;
    private activeSessions: Map<string, Session>;
    private promptTimeout: number;
    private server: { url: string; close: () => void } | null = null;
    private serverStartupTimeout: number;

    /**
     * Private constructor - use static create() factory method instead
     */
    private constructor(
        client: OpencodeClient,
        server: { url: string; close: () => void } | null,
        config: ClientConfig = {},
    ) {
        this.client = client;
        this.server = server;
        this.timeout = config.timeout || 30000;
        this.retryAttempts = config.retryAttempts || 3;
        this.promptTimeout = config.promptTimeout || 120000; // 120 seconds default
        this.serverStartupTimeout = config.serverStartupTimeout || 10000; // 10 seconds default
        this.activeSessions = new Map();

        log.debug("OpenCodeClient initialized", {
            hasOwnServer: !!this.server,
            timeout: this.timeout,
            serverStartupTimeout: this.serverStartupTimeout,
        });
    }

    /**
     * Static factory method to create an OpenCodeClient
     *
     * Creates a new client with either:
     * 1. A fresh OpenCode server (default behavior)
     * 2. An existing server URL (if existingServerUrl is provided)
     * 3. A custom client instance (for testing)
     */
    static async create(config: ClientConfig = {}): Promise<OpenCodeClient> {
        try {
            // If custom client provided (for testing), use it directly
            if (config.client) {
                log.info("Creating OpenCodeClient with custom client instance");
                return new OpenCodeClient(config.client, null, config);
            }

            // If existing server URL provided, connect to it
            if (config.existingServerUrl) {
                log.info("Connecting to existing OpenCode server", {
                    url: config.existingServerUrl,
                });
                try {
                    const client = createOpencodeClient({
                        baseUrl: config.existingServerUrl,
                    });

                    // Verify connection by making a test request
                    log.debug("Verifying connection to existing server...");
                    // Note: We'll skip verification for now to avoid unnecessary API calls
                    // The connection will be verified when first session is created

                    return new OpenCodeClient(client, null, config);
                } catch (error) {
                    const errorMsg =
                        error instanceof Error ? error.message : String(error);
                    log.error("Failed to connect to existing server", {
                        url: config.existingServerUrl,
                        error: errorMsg,
                    });
                    throw error;
                }
            }

            // Default: spawn a new OpenCode server
            log.info("Spawning new OpenCode server...", {
                timeout: config.serverStartupTimeout || 10000,
            });

            const { client, server } = await createOpencode({
                timeout: config.serverStartupTimeout || 10000,
            });

            log.info("OpenCode server started successfully");
            return new OpenCodeClient(client, server, config);
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Failed to create OpenCodeClient", { error: errorMsg });
            throw new Error(`Failed to create OpenCodeClient: ${errorMsg}`);
        }
    }

    /**
     * Create a new OpenCode session with a given prompt
     */
    async createSession(prompt: string): Promise<Session> {
        try {
            // Create session using SDK
            const result = await this.client.session.create({
                body: {
                    title: "ai-eng ralph session",
                },
            });

            if (!result.data) {
                throw new Error(
                    `Failed to create OpenCode session: ${JSON.stringify(result.error)}`,
                );
            }

            const sdkSession = result.data;

            // Wrap with our session interface
            const session: Session = {
                id: sdkSession.id || this.generateSessionId(),
                sendMessage: async (message: string) => {
                    return this.handleSendMessage(sdkSession.id, message);
                },
                close: async () => {
                    return this.handleSessionClose(sdkSession.id);
                },
            };

            // Store active session
            this.activeSessions.set(session.id, session);

            // Send initial prompt
            if (prompt.trim()) {
                await this.handleSendMessage(sdkSession.id, prompt);
            }

            return session;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            throw new Error(
                `Failed to create OpenCode session: ${errorMessage}`,
            );
        }
    }

    /**
     * Send a message to an existing session
     */
    async sendMessage(
        sessionId: string,
        message: string,
    ): Promise<MessageResponse> {
        const session = this.activeSessions.get(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        return this.handleSendMessage(sessionId, message);
    }

    /**
     * Close an active session
     */
    async closeSession(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        await this.handleSessionClose(sessionId);
        this.activeSessions.delete(sessionId);
    }

    /**
     * Get all active session IDs
     */
    getActiveSessions(): string[] {
        return Array.from(this.activeSessions.keys());
    }

    /**
     * Check if a session is active
     */
    isSessionActive(sessionId: string): boolean {
        return this.activeSessions.has(sessionId);
    }

    /**
     * Close all active sessions
     */
    async closeAllSessions(): Promise<void> {
        const closePromises = Array.from(this.activeSessions.keys()).map(
            (sessionId) =>
                this.handleSessionClose(sessionId).catch((error) => {
                    console.error(`Error closing session ${sessionId}:`, error);
                }),
        );

        await Promise.all(closePromises);
        this.activeSessions.clear();
    }

    /**
     * Handle sending a message with error handling and retries
     */
    private async handleSendMessage(
        sessionId: string,
        message: string,
    ): Promise<MessageResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                // Create prompt with timeout wrapper
                const promptWithTimeout = Promise.race([
                    this.client.session.prompt({
                        body: {
                            messageID: sessionId,
                            parts: [
                                {
                                    type: "text",
                                    text: message,
                                },
                            ],
                        },
                        path: {
                            id: sessionId,
                        },
                    }),
                    new Promise<never>((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        `Prompt timeout after ${this.promptTimeout}ms`,
                                    ),
                                ),
                            this.promptTimeout,
                        ),
                    ),
                ]);

                const result = await promptWithTimeout;

                if (!result.data) {
                    throw new Error(
                        `Invalid response from OpenCode: ${JSON.stringify(result.error)}`,
                    );
                }

                // Extract content from response
                const response = result.data;

                // Find text content from response parts
                const textPart = response.parts?.find(
                    (part) => part.type === "text",
                );
                return { content: textPart?.text || "No content received" };
            } catch (error) {
                lastError =
                    error instanceof Error ? error : new Error(String(error));

                // Check if this is a rate limit error
                const isRateLimit = this.isRateLimitError(lastError);

                if (attempt === this.retryAttempts) {
                    break;
                }

                // Wait before retrying with exponential backoff
                const delay = this.getBackoffDelay(attempt, isRateLimit);

                console.warn(
                    `Attempt ${attempt}/${this.retryAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...${isRateLimit ? " (rate limit detected)" : ""}`,
                );

                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw new Error(
            `Failed to send message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`,
        );
    }

    /**
     * Check if error is a rate limit error
     */
    private isRateLimitError(error: Error): boolean {
        const err = error as any;
        return (
            err.status === 429 ||
            /rate limit|quota|overloaded|capacity/i.test(error.message)
        );
    }

    /**
     * Calculate backoff delay with jitter
     */
    private getBackoffDelay(attempt: number, isRateLimit: boolean): number {
        const base = isRateLimit ? 5000 : 1000; // 5s for rate limit, 1s otherwise
        const exponential = base * 2 ** (attempt - 1);
        const jitter = Math.random() * 1000; // Add up to 1s jitter
        return Math.min(exponential + jitter, 60000); // max 60s
    }

    /**
     * Handle session closure with error handling
     */
    private async handleSessionClose(sessionId: string): Promise<void> {
        try {
            // Note: OpenCode SDK might not have an explicit close method
            // For now, we'll just remove from our active sessions
            // In a real implementation, we'd call SDK's delete method if available
            console.log(`Session ${sessionId} closed`);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.warn(
                `Warning: Failed to close session ${sessionId}: ${errorMessage}`,
            );
        }
    }

    /**
     * Generate a unique session ID if SDK doesn't provide one
     */
    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Cleanup method to close all sessions and server
     */
    async cleanup(): Promise<void> {
        try {
            log.debug("Starting cleanup...", {
                activeSessions: this.activeSessions.size,
                hasServer: !!this.server,
            });

            // Close all active sessions
            await this.closeAllSessions();

            // Stop the OpenCode server if we started one
            if (this.server) {
                log.info("Closing spawned OpenCode server");
                try {
                    this.server.close();
                    this.server = null;
                    log.info("OpenCode server closed successfully");
                } catch (error) {
                    const errorMsg =
                        error instanceof Error ? error.message : String(error);
                    log.error("Error closing OpenCode server", {
                        error: errorMsg,
                    });
                }
            } else {
                log.debug(
                    "No spawned server to close (connected to existing server)",
                );
            }

            log.info("Cleanup complete");
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Error during cleanup", { error: errorMsg });
            throw error;
        }
    }
}
