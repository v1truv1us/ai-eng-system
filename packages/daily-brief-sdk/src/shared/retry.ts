/**
 * Retry wrapper with exponential backoff. Three attempts total at
 * 1s -> 4s -> 16s. Used to wrap MCP call sites in workflows so a flaky
 * Bitbucket/Atlassian/Grafana endpoint doesn't kill an entire brief run.
 *
 * Implemented in-house instead of pulling p-retry directly so tests can
 * inject a fake clock (`waitMs`) without mocking module internals.
 */

export interface WithRetryOptions {
    attempts?: number;
    /** Returns ms to wait before attempt N (1-indexed). */
    backoffMs?: (attempt: number) => number;
    /** Predicate; return false to stop retrying immediately. */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    /** Test seam: defaults to setTimeout-based sleep. */
    waitMs?: (ms: number) => Promise<void>;
}

const DEFAULT_BACKOFF = (attempt: number): number => {
    // 1s -> 4s -> 16s on attempts 2, 3, 4 (attempt 1 is immediate)
    if (attempt <= 1) return 0;
    return 1000 * 4 ** (attempt - 2);
};

const DEFAULT_WAIT = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
    fn: () => Promise<T>,
    opts: WithRetryOptions = {},
): Promise<T> {
    const attempts = opts.attempts ?? 3;
    const backoff = opts.backoffMs ?? DEFAULT_BACKOFF;
    const shouldRetry = opts.shouldRetry ?? (() => true);
    const wait = opts.waitMs ?? DEFAULT_WAIT;

    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt === attempts || !shouldRetry(error, attempt)) {
                throw error;
            }
            const delay = backoff(attempt + 1);
            if (delay > 0) await wait(delay);
        }
    }
    // Unreachable, but keeps TS happy.
    throw lastError;
}
