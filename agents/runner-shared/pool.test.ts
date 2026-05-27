import { describe, expect, test } from "bun:test";
import { mapLimit } from "./pool.js";

describe("mapLimit", () => {
    test("returns results in order", async () => {
        const items = ["a", "b", "c"];
        const results = await mapLimit(items, 2, async (item) =>
            item.toUpperCase(),
        );
        expect(results).toEqual(["A", "B", "C"]);
    });

    test("rejects on first error", async () => {
        const items = [1, 2, 3];
        const promise = mapLimit(items, 2, async (item) => {
            if (item === 2) throw new Error("boom");
            return item * 2;
        });
        await expect(promise).rejects.toThrow("boom");
    });

    test("concurrency of 1 runs sequentially", async () => {
        const order: number[] = [];
        const items = [1, 2, 3];
        await mapLimit(items, 1, async (item) => {
            order.push(item);
            return item;
        });
        expect(order).toEqual([1, 2, 3]);
    });

    test("handles empty array", async () => {
        const results = await mapLimit([], 3, async (item) => item);
        expect(results).toEqual([]);
    });
});
