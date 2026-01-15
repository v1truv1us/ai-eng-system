/**
 * OpenCode SDK Backend Wrapper
 *
 * Provides session management and message sending capabilities
 * for ai-eng ralph runner using OpenCode SDK.
 */

import { createServer } from "node:net";
import {
    type OpencodeClient,
    createOpencode,
    createOpencodeClient,
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
    /** NOTE: workingDir parameter is not supported by the SDK
     * Spawned OpenCode servers will use the calling directory by default (process.cwd())
     * Use OPENCODE_URL to connect to a different OpenCode instance instead
     */
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
    private directory: string = process.cwd();
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

        const envPromptTimeout = Number.parseInt(
            process.env.OPENCODE_PROMPT_TIMEOUT_MS ?? "",
            10,
        );
        const resolvedPromptTimeout = Number.isFinite(envPromptTimeout)
            ? envPromptTimeout
            : undefined;

        // For streaming, this acts as an idle timeout (reset on streamed events)
        this.promptTimeout =
            config.promptTimeout ?? resolvedPromptTimeout ?? 120000; // 120 seconds default

        this.directory =
            config.directory || process.env.OPENCODE_DIRECTORY || process.cwd();

        this.serverStartupTimeout = config.serverStartupTimeout || 10000; // 10 seconds default
        this.activeSessions = new Map();

        log.debug("OpenCodeClient initialized", {
            hasOwnServer: !!this.server,
            timeout: this.timeout,
            serverStartupTimeout: this.serverStartupTimeout,
        });
    }

    /**
     * Get an available port for OpenCode server
     *
     * IMPORTANT: Always avoid port 4096 to prevent conflicts with user's existing server
     */
    private static async getAvailablePort(): Promise<number> {
        try {
            // Check if default port is in use and log accordingly
            const defaultPort = 4096;
            const isDefaultAvailable =
                await OpenCodeClient.isPortAvailable(defaultPort);

            if (!isDefaultAvailable) {
                log.info(
                    "Existing server detected on port 4096; spawning isolated server on dynamic port",
                );
            } else {
                log.debug(
                    "Default port 4096 is available but avoiding it for isolation",
                );
            }

            // Always use dynamic port to avoid conflicts with user's existing server
            const dynamicPort = await OpenCodeClient.findAvailablePort();
            log.info(
                `Spawning isolated server on dynamic port: ${dynamicPort}`,
            );
            return dynamicPort;
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Failed to select OpenCode server port", {
                error: errorMsg,
            });
            throw new Error(
                `Failed to select OpenCode server port: ${errorMsg}`,
            );
        }
    }

    /**
     * Check if a specific port is available
     */
    private static async isPortAvailable(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const server = createServer();

            server.listen(port, () => {
                server.once("close", () => resolve(true));
                server.close();
            });

            server.on("error", () => resolve(false));
        });
    }

    /**
     * Find an available port dynamically
     */
    private static async findAvailablePort(): Promise<number> {
        return new Promise((resolve, reject) => {
            const server = createServer();

            server.listen(0, () => {
                const address = server.address();
                if (address && typeof address === "object") {
                    server.once("close", () => resolve(address.port));
                    server.close();
                } else {
                    reject(new Error("Failed to get server address"));
                }
            });

            server.on("error", reject);
        });
    }

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
            // Note: Spawned servers will use to calling directory by default
            // Use OPENCODE_URL to connect to a different OpenCode instance
            log.info("Spawning new OpenCode server...", {
                timeout: config.serverStartupTimeout || 10000,
            });

            const availablePort = await OpenCodeClient.getAvailablePort();

            const { client, server } = await createOpencode({
                timeout: config.serverStartupTimeout || 10000,
                port: availablePort,
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

            // Defer the initial prompt until the first message is sent.
            // This avoids blocking session creation and enables streaming output
            // even when the initial prompt is large or slow to process.
            let pendingInitialPrompt = prompt.trim();
            const buildFirstMessage = (message: string) => {
                if (!pendingInitialPrompt) return message;
                const combined = `${pendingInitialPrompt}\n\n---\n\n${message}`;
                pendingInitialPrompt = "";
                return combined;
            };

            // Initialize tool invocations tracker
            const toolInvocations: Session["_toolInvocations"] = [];

            // Wrap with our session interface
            const session: Session = {
                id: sdkSession.id || this.generateSessionId(),
                _toolInvocations: toolInvocations,
                sendMessage: async (message: string) => {
                    return this.handleSendMessage(
                        sdkSession.id,
                        buildFirstMessage(message),
                    );
                },
                sendMessageStream: async (message: string) => {
                    return this.handleSendMessageStream(
                        sdkSession.id,
                        buildFirstMessage(message),
                        toolInvocations,
                    );
                },
                close: async () => {
                    return this.handleSessionClose(sdkSession.id);
                },
            };

            // Store active session
            this.activeSessions.set(session.id, session);

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
                    const errorMsg =
                        error instanceof Error ? error.message : String(error);
                    log.warn("Error closing session", {
                        sessionId,
                        error: errorMsg,
                    });
                }),
        );

        await Promise.all(closePromises);
        this.activeSessions.clear();
    }

    /**
     * Handle sending a message with streaming support
     */
    private async handleSendMessageStream(
        sessionId: string,
        message: string,
        toolInvocations?: Session["_toolInvocations"],
    ): Promise<StreamingResponse> {
        let lastError: Error | null = null;

        const supportsEventStreaming =
            typeof (this.client as any)?.session?.promptAsync === "function" &&
            typeof (this.client as any)?.event?.subscribe === "function";

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                // Create a TransformStream to handle the streaming response
                const stream = new TransformStream<Uint8Array, Uint8Array>();
                const writer = stream.writable.getWriter();

                // Track finalization to prevent double-close/abort
                let finalized = false;
                const closeOnce = async () => {
                    if (finalized) return;
                    finalized = true;
                    try {
                        await writer.close();
                    } catch {
                        // Ignore errors during close
                    }
                };
                const abortOnce = async (err: unknown) => {
                    if (finalized) return;
                    finalized = true;
                    try {
                        await writer.abort(err);
                    } catch {
                        // Ignore errors during abort
                    }
                };

                // Fallback: if the client doesn't support prompt_async + SSE, keep the
                // legacy behavior (buffer then simulate streaming).
                if (!supportsEventStreaming) {
                    const promptPromise = this.client.session.prompt({
                        body: {
                            messageID: this.generateMessageId(),
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
                        query: {
                            directory: this.directory,
                        },
                    } as any);

                    const streamingTask = (async () => {
                        try {
                            const result = await promptPromise;

                            if (!result.data) {
                                throw new Error(
                                    `Invalid response from OpenCode: ${JSON.stringify(result.error)}`,
                                );
                            }

                            const response = result.data;
                            const textPart = response.parts?.find(
                                (part: any) => part.type === "text",
                            );

                            const finalContent =
                                (textPart as any)?.text ||
                                "No content received";

                            // Simulate streaming by writing chunks
                            const chunks = this.splitIntoChunks(
                                finalContent,
                                10,
                            );
                            const encoder = new TextEncoder();
                            for (const chunk of chunks) {
                                await writer.write(encoder.encode(chunk));
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 50),
                                );
                            }

                            await closeOnce();
                            return { content: finalContent };
                        } catch (error) {
                            await abortOnce(error);
                            throw error;
                        }
                    })();

                    return {
                        stream: stream.readable,
                        complete: streamingTask,
                    };
                }

                // Real streaming: use prompt_async and consume the event SSE stream.
                const encoder = new TextEncoder();
                const idleTimeoutError = new Error(
                    `Prompt idle timeout after ${this.promptTimeout}ms`,
                );
                const hardTimeoutError = new Error(
                    `Prompt hard timeout after ${this.promptTimeout * 5}ms`,
                );

                const controller = new AbortController();
                let idleTimer: ReturnType<typeof setTimeout> | undefined;
                let hardTimer: ReturnType<typeof setTimeout> | undefined;
                let bytesWritten = 0;
                let lastProgressTime = Date.now();
                let idleTimedOut = false;

                // Hard timeout - never resets
                const startHardTimer = () => {
                    if (hardTimer) clearTimeout(hardTimer);
                    hardTimer = setTimeout(() => {
                        log.warn("Hard timeout reached, aborting", {
                            sessionId,
                            timeoutMs: this.promptTimeout * 5,
                        });
                        try {
                            controller.abort(hardTimeoutError);
                        } catch {
                            // ignore
                        }
                    }, this.promptTimeout * 5); // 5x idle timeout as hard ceiling
                };

                // Idle timer - resets only on relevant progress
                const resetIdleTimer = () => {
                    if (idleTimer) clearTimeout(idleTimer);
                    idleTimer = setTimeout(() => {
                        idleTimedOut = true;
                        log.warn("Idle timeout reached, aborting", {
                            sessionId,
                            timeoutMs: this.promptTimeout,
                            bytesWritten,
                            lastProgressMsAgo: Date.now() - lastProgressTime,
                        });
                        try {
                            controller.abort(idleTimeoutError);
                        } catch {
                            // ignore
                        }
                    }, this.promptTimeout);
                };

                const streamingTask = (async () => {
                    try {
                        startHardTimer();
                        resetIdleTimer();

                        const userMessageId = this.generateMessageId();

                        log.debug("Sending prompt to OpenCode", {
                            sessionId,
                            messageLength: message.length,
                            userMessageId,
                        });

                        await (this.client as any).session.promptAsync({
                            body: {
                                messageID: userMessageId,
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
                            query: {
                                directory: this.directory,
                            },
                            signal: controller.signal,
                        });

                        log.debug("Subscribing to events", {
                            sessionId,
                            directory: this.directory,
                        });

                        const eventsResult = await (
                            this.client as any
                        ).event.subscribe({
                            query: {
                                directory: this.directory,
                            },
                            signal: controller.signal,
                        });

                        let assistantMessageId: string | null = null;
                        let content = "";
                        let emittedText = "";
                        let eventCount = 0;

                        log.debug("Starting event stream processing", {
                            sessionId,
                        });

                        for await (const event of eventsResult.stream as AsyncGenerator<any>) {
                            eventCount++;

                            // Verbose debug logging for all events
                            log.debug("Received event", {
                                sessionId,
                                eventType: event?.type,
                                eventCount,
                                hasProperties: !!event?.properties,
                                controllerAborted: controller.signal.aborted,
                            });

                            if (controller.signal.aborted) {
                                log.debug(
                                    "Controller aborted, breaking event loop",
                                    {
                                        sessionId,
                                        eventCount,
                                    },
                                );
                                break;
                            }

                            if (!event || typeof event !== "object") {
                                log.debug("Skipping non-object event", {
                                    sessionId,
                                    eventCount,
                                });
                                continue;
                            }

                            if (event.type === "message.updated") {
                                const info = (event as any).properties?.info;

                                log.debug("Message updated event", {
                                    sessionId,
                                    eventCount,
                                    infoRole: info?.role,
                                    infoSessionId: info?.sessionID,
                                    infoParentId: info?.parentID,
                                    infoId: info?.id,
                                    isRelevantSession:
                                        info?.sessionID === sessionId,
                                    isAssistant: info?.role === "assistant",
                                    isReplyToUser:
                                        info?.parentID === userMessageId,
                                });

                                // Primary identification: exact match on parentID
                                if (
                                    info?.role === "assistant" &&
                                    info?.sessionID === sessionId &&
                                    info?.parentID === userMessageId
                                ) {
                                    assistantMessageId = info.id;
                                    log.debug(
                                        "Identified assistant message (exact parentID match)",
                                        {
                                            sessionId,
                                            assistantMessageId,
                                        },
                                    );
                                }
                                // Fallback: if we haven't identified an assistant message yet,
                                // accept assistant messages in the same session even if parentID doesn't match
                                // This handles cases where parentID is undefined or has a different format
                                else if (
                                    !assistantMessageId &&
                                    info?.role === "assistant" &&
                                    info?.sessionID === sessionId
                                ) {
                                    log.debug(
                                        "Identified assistant message (fallback - no exact parentID match)",
                                        {
                                            sessionId,
                                            assistantMessageId: info.id,
                                            infoParentId: info?.parentID,
                                            userMessageId,
                                        },
                                    );
                                    assistantMessageId = info.id;
                                }

                                // Reset idle timer on ANY assistant message activity
                                // This prevents timeouts when correlation is ambiguous
                                if (
                                    info?.role === "assistant" &&
                                    info?.sessionID === sessionId
                                ) {
                                    lastProgressTime = Date.now();
                                    resetIdleTimer();
                                }

                                if (
                                    assistantMessageId &&
                                    info?.id === assistantMessageId
                                ) {
                                    if (info?.error) {
                                        const errName =
                                            info.error.name || "OpenCodeError";
                                        const errMsg =
                                            info.error.data?.message ||
                                            JSON.stringify(
                                                info.error.data || {},
                                            );
                                        log.error(
                                            "Assistant error in message",
                                            {
                                                sessionId,
                                                errorName: errName,
                                                errorMessage: errMsg,
                                            },
                                        );
                                        throw new Error(
                                            `${errName}: ${errMsg}`,
                                        );
                                    }

                                    if (info?.time?.completed) {
                                        log.debug(
                                            "Assistant message completed",
                                            {
                                                sessionId,
                                                assistantMessageId,
                                                completedAt:
                                                    info.time.completed,
                                            },
                                        );
                                        break;
                                    }
                                }

                                continue;
                            }

                            if (event.type === "message.part.updated") {
                                // Only reset timer and track progress for relevant updates
                                const part = (event as any).properties
                                    ?.part as any;

                                log.debug("Message part updated", {
                                    sessionId,
                                    eventCount,
                                    hasPart: !!part,
                                    partType: part?.type,
                                    partSessionId: part?.sessionID,
                                    partMessageId: part?.messageID,
                                    assistantMessageId,
                                    isRelevant:
                                        assistantMessageId &&
                                        part?.sessionID === sessionId &&
                                        part?.messageID === assistantMessageId,
                                });

                                if (!assistantMessageId) continue;

                                // Handle tool parts (capture tool invocations)
                                if (part?.type === "tool" && toolInvocations) {
                                    const toolId =
                                        part.toolId ||
                                        part.id ||
                                        `tool-${eventCount}`;
                                    const toolName =
                                        part.toolName || part.name || "unknown";
                                    const toolInput =
                                        part.input || part.parameters || {};

                                    // Check if this is a new tool call or an update
                                    const existingToolIndex =
                                        toolInvocations.findIndex(
                                            (t) => t.id === toolId,
                                        );
                                    const now = new Date().toISOString();

                                    if (existingToolIndex >= 0) {
                                        // Update existing tool invocation
                                        const existing =
                                            toolInvocations[existingToolIndex];
                                        existing.output =
                                            part.result ??
                                            part.output ??
                                            existing.output;
                                        existing.status =
                                            part.status === "error"
                                                ? "error"
                                                : "ok";
                                        existing.error =
                                            part.error ?? existing.error;
                                        existing.completedAt =
                                            part.completedAt ?? now;

                                        log.debug("Tool invocation updated", {
                                            sessionId,
                                            toolId,
                                            toolName,
                                            status: existing.status,
                                        });
                                    } else {
                                        // New tool invocation
                                        const toolInvocation = {
                                            id: toolId,
                                            name: toolName,
                                            input: toolInput,
                                            output: part.result ?? part.output,
                                            status:
                                                part.status === "error"
                                                    ? ("error" as const)
                                                    : ("ok" as const),
                                            error: part.error,
                                            startedAt: part.startedAt ?? now,
                                            completedAt: part.completedAt,
                                        };
                                        toolInvocations.push(toolInvocation);

                                        log.debug("Tool invocation started", {
                                            sessionId,
                                            toolId,
                                            toolName,
                                            input: JSON.stringify(
                                                toolInput,
                                            ).slice(0, 200),
                                        });
                                    }

                                    // Don't skip non-relevant tool parts - we want to capture all tool events
                                    // for the assistant message
                                    if (
                                        part.sessionID !== sessionId ||
                                        part.messageID !== assistantMessageId
                                    ) {
                                        // Still track it but don't process for output
                                    } else {
                                        // Reset idle timer on tool progress
                                        lastProgressTime = Date.now();
                                        resetIdleTimer();
                                    }

                                    continue;
                                }

                                if (!part || part.type !== "text") continue;
                                if (part.sessionID !== sessionId) continue;
                                if (part.messageID !== assistantMessageId)
                                    continue;

                                const rawDelta = (event as any).properties
                                    ?.delta;

                                let deltaText: string | undefined;

                                // Prefer diffing against the full `part.text` when present.
                                // Some OpenCode server versions emit multiple text parts or send
                                // `delta` as the *full* text, which would duplicate output.
                                if (typeof part.text === "string") {
                                    const next = part.text;

                                    if (next.startsWith(emittedText)) {
                                        deltaText = next.slice(
                                            emittedText.length,
                                        );
                                        emittedText = next;
                                    } else if (emittedText.startsWith(next)) {
                                        // Stale/duplicate update
                                        deltaText = "";
                                    } else {
                                        // Fallback: treat as additive chunk
                                        deltaText = next;
                                        emittedText += next;
                                    }
                                } else if (typeof rawDelta === "string") {
                                    deltaText = rawDelta;
                                    emittedText += rawDelta;
                                }

                                if (!deltaText) continue;

                                // Update progress tracking
                                lastProgressTime = Date.now();
                                bytesWritten += deltaText.length;
                                resetIdleTimer(); // Only reset on actual content progress

                                log.debug("Writing delta to stream", {
                                    sessionId,
                                    deltaLength: deltaText.length,
                                    totalBytesWritten: bytesWritten,
                                    contentLength: content.length,
                                });

                                content += deltaText;
                                await writer.write(encoder.encode(deltaText));
                            }
                        }

                        log.debug("Event stream ended", {
                            sessionId,
                            eventCount,
                            totalBytesWritten: bytesWritten,
                            contentLength: content.length,
                            controllerAborted: controller.signal.aborted,
                            idleTimedOut,
                            assistantMessageIdFound: !!assistantMessageId,
                        });

                        await closeOnce();
                        return {
                            content: content || "No content received",
                            diagnostics: {
                                bytesWritten,
                                contentLength: content.length,
                                idleTimedOut,
                                assistantMessageIdFound: !!assistantMessageId,
                                eventCount,
                            },
                        };
                    } catch (error) {
                        log.error("Streaming task error", {
                            sessionId,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            controllerAborted: controller.signal.aborted,
                            bytesWritten,
                            idleTimedOut,
                            assistantMessageIdFound: !!assistantMessageId,
                        });
                        // If we aborted, normalize to our timeout error AND ensure stream is finalized
                        if (controller.signal.aborted) {
                            await abortOnce(idleTimeoutError);
                            throw idleTimeoutError;
                        }
                        await abortOnce(error);
                        throw error;
                    } finally {
                        if (idleTimer) clearTimeout(idleTimer);
                        if (hardTimer) clearTimeout(hardTimer);
                        try {
                            if (!controller.signal.aborted) controller.abort();
                        } catch {
                            // ignore
                        }
                    }
                })();

                return {
                    stream: stream.readable,
                    complete: streamingTask,
                };
            } catch (error) {
                lastError =
                    error instanceof Error ? error : new Error(String(error));

                const isRateLimit = this.isRateLimitError(lastError);

                if (attempt === this.retryAttempts) {
                    break;
                }

                const delay = this.getBackoffDelay(attempt, isRateLimit);

                log.warn("OpenCode attempt failed; retrying", {
                    attempt,
                    retryAttempts: this.retryAttempts,
                    delayMs: delay,
                    isRateLimit,
                    error: lastError.message,
                });

                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw new Error(
            `Failed to stream message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`,
        );
    }

    /**
     * Split text into chunks for streaming simulation
     */
    private splitIntoChunks(text: string, chunkSize: number): string[] {
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks.length > 0 ? chunks : [text];
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
                const timeoutError = new Error(
                    `Prompt timeout after ${this.promptTimeout}ms`,
                );

                const controller = new AbortController();
                const timer = setTimeout(() => {
                    try {
                        controller.abort(timeoutError);
                    } catch {
                        // ignore
                    }
                }, this.promptTimeout);

                let result: any;
                try {
                    result = await this.client.session.prompt({
                        body: {
                            messageID: this.generateMessageId(),
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
                        query: {
                            directory: this.directory,
                        },
                        signal: controller.signal,
                    } as any);
                } catch (error) {
                    if (controller.signal.aborted) {
                        throw timeoutError;
                    }
                    throw error;
                } finally {
                    clearTimeout(timer);
                }

                if (!result.data) {
                    throw new Error(
                        `Invalid response from OpenCode: ${JSON.stringify(result.error)}`,
                    );
                }

                // Extract content from response
                const response = result.data;

                // Find text content from response parts
                const textPart = response.parts?.find(
                    (part: any) => part.type === "text",
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

                log.warn("OpenCode attempt failed; retrying", {
                    attempt,
                    retryAttempts: this.retryAttempts,
                    delayMs: delay,
                    isRateLimit,
                    error: lastError.message,
                });

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
            log.debug("Session closed", { sessionId });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            log.warn("Failed to close session", {
                sessionId,
                error: errorMessage,
            });
        }
    }

    /**
     * Generate a unique session ID if SDK doesn't provide one
     */
    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a properly formatted message ID with msg_ prefix
     * Format: msg_<timestamp>_<random>
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
            return;
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : String(error);
            log.error("Error during OpenCode client cleanup", {
                error: errorMsg,
            });
            return;
        }
    }
}
