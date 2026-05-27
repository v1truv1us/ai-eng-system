/**
 * Driver interface for harness-neutral workflow runners.
 *
 * Each runtime (pi, cursor, anthropic, codex, opencode) implements this
 * interface so workflow scripts don't hard-code SDK specifics.
 */

export interface DriverConfig {
    apiKey?: string;
    model?: string;
    timeoutMs?: number;
    maxRetries?: number;
}

export interface Driver {
    runPrompt(prompt: string, config?: DriverConfig): Promise<string>;
    close?(): Promise<void>;
}

export type DriverName = "pi" | "cursor" | "anthropic" | "codex" | "opencode";

export class DriverError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = "DriverError";
    }
}
