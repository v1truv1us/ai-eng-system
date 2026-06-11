#!/usr/bin/env bun

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const CI_PATH = join(ROOT, ".github/workflows/ci.yml");
const NIGHTLY_PATH = join(ROOT, ".github/workflows/nightly.yml");

function readWorkflow(path: string): string {
    return readFileSync(path, "utf-8");
}

describe("CI workflows", () => {
    it("should define a fast PR/main quality gate workflow", () => {
        const workflow = readWorkflow(CI_PATH);
        expect(workflow).toContain("pull_request");
        expect(workflow).toContain("bun run typecheck");
        expect(workflow).toContain("bun run lint");
        expect(workflow).toContain("tests/unit.test.ts");
        expect(workflow).toContain("tests/build.test.ts");
    });

    it("should define a nightly slow-test workflow", () => {
        const workflow = readWorkflow(NIGHTLY_PATH);
        expect(workflow).toContain("schedule:");
        expect(workflow).toContain("workflow_dispatch");
        expect(workflow).toContain("tests/performance.test.ts");
        expect(workflow).toContain("tests/learning-automation.test.ts");
    });
});
