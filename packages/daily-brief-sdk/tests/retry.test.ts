import { describe, expect, test } from "bun:test";
import { withRetry } from "../src/shared/retry.js";

describe("withRetry", () => {
    test("returns success on first attempt without retry", async () => {
        let attempts = 0;
        const result = await withRetry(async () => {
            attempts++;
            return "ok";
        });
        expect(result).toBe("ok");
        expect(attempts).toBe(1);
    });

    test("retries up to attempts limit on consecutive failures", async () => {
        let attempts = 0;
        const waited: number[] = [];
        let caught: unknown;
        try {
            await withRetry(
                async () => {
                    attempts++;
                    throw new Error(`fail ${attempts}`);
                },
                {
                    waitMs: async (ms: number) => {
                        waited.push(ms);
                    },
                },
            );
        } catch (error) {
            caught = error;
        }
        expect(attempts).toBe(3);
        expect(caught).toBeInstanceOf(Error);
        expect((caught as Error).message).toBe("fail 3");
    });

    test("uses exponential backoff: 1s -> 4s between attempts", async () => {
        const waited: number[] = [];
        try {
            await withRetry(
                async () => {
                    throw new Error("fail");
                },
                {
                    waitMs: async (ms: number) => {
                        waited.push(ms);
                    },
                },
            );
        } catch {
            // expected
        }
        // 3 attempts -> 2 waits (between attempts 1->2 and 2->3).
        expect(waited).toHaveLength(2);
        expect(waited[0]).toBe(1000);
        expect(waited[1]).toBe(4000);
    });

    test("succeeds on second attempt and skips third", async () => {
        let attempts = 0;
        const waited: number[] = [];
        const result = await withRetry(
            async () => {
                attempts++;
                if (attempts === 1) throw new Error("first");
                return "got it";
            },
            {
                waitMs: async (ms: number) => {
                    waited.push(ms);
                },
            },
        );
        expect(result).toBe("got it");
        expect(attempts).toBe(2);
        expect(waited).toHaveLength(1);
        expect(waited[0]).toBe(1000);
    });

    test("shouldRetry=false stops retry immediately", async () => {
        let attempts = 0;
        try {
            await withRetry(
                async () => {
                    attempts++;
                    throw new Error("permanent");
                },
                { shouldRetry: () => false },
            );
        } catch {
            // expected
        }
        expect(attempts).toBe(1);
    });

    test("respects custom attempts count", async () => {
        let attempts = 0;
        const waited: number[] = [];
        try {
            await withRetry(
                async () => {
                    attempts++;
                    throw new Error("x");
                },
                {
                    attempts: 5,
                    waitMs: async (ms) => {
                        waited.push(ms);
                    },
                },
            );
        } catch {
            // expected
        }
        expect(attempts).toBe(5);
        // 4 waits with default backoff: 1s, 4s, 16s, 64s
        expect(waited).toEqual([1000, 4000, 16000, 64000]);
    });
});
