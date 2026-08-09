#!/usr/bin/env bun
import { describe, expect, it } from "bun:test";
import {
    formatLearningEntry,
    nextLearningId,
    parseRunHistoryLine,
    type RunHistoryEntry,
} from "../scripts/lib/skill-loop-schemas";
import {
    clusterFailures,
    clusterQualifies,
    expireStaleLearnings,
} from "../scripts/skill-improve";

function makeRun(overrides: Partial<RunHistoryEntry> = {}): RunHistoryEntry {
    return {
        schema: 1,
        ts: 1786000000,
        skill: "demo",
        session_id: "s1",
        run_id: null,
        outcome: "failure",
        signals: {
            verify_passed: false,
            eval_pass_rate: null,
            user_feedback: null,
        },
        source: "wrap-up",
        ...overrides,
    };
}

describe("parseRunHistoryLine", () => {
    it("parses a valid line", () => {
        const entry = parseRunHistoryLine(JSON.stringify(makeRun()));
        expect(entry?.skill).toBe("demo");
    });

    it("rejects malformed and wrong-schema lines", () => {
        expect(parseRunHistoryLine("not json")).toBeNull();
        expect(
            parseRunHistoryLine(JSON.stringify({ schema: 99, skill: "x" })),
        ).toBeNull();
        expect(
            parseRunHistoryLine(
                JSON.stringify({ schema: 1, skill: "", outcome: "failure" }),
            ),
        ).toBeNull();
    });
});

describe("clusterFailures", () => {
    it("groups failures by signature and ignores successes", () => {
        const runs = [
            makeRun({ failure_signature: "sig-a" }),
            makeRun({ failure_signature: "sig-a", session_id: "s2" }),
            makeRun({ failure_signature: "sig-b", session_id: "s3" }),
            makeRun({ outcome: "success", session_id: "s4" }),
        ];
        const clusters = clusterFailures(runs);
        expect(clusters).toHaveLength(2);
        const sigA = clusters.find((c) => c.signature === "sig-a");
        expect(sigA?.runs).toHaveLength(2);
    });

    it("uses run-failure as the default signature", () => {
        const clusters = clusterFailures([makeRun()]);
        expect(clusters[0].signature).toBe("run-failure");
    });

    it("marks high severity clusters", () => {
        const clusters = clusterFailures([makeRun({ severity: "high" })]);
        expect(clusters[0].highSeverity).toBe(true);
    });
});

describe("clusterQualifies", () => {
    it("requires 3 occurrences by default", () => {
        const two = clusterFailures([
            makeRun(),
            makeRun({ session_id: "s2" }),
        ])[0];
        expect(clusterQualifies(two)).toBe(false);
        const three = clusterFailures([
            makeRun(),
            makeRun({ session_id: "s2" }),
            makeRun({ session_id: "s3" }),
        ])[0];
        expect(clusterQualifies(three)).toBe(true);
    });

    it("qualifies a single high-severity incident", () => {
        const cluster = clusterFailures([makeRun({ severity: "high" })])[0];
        expect(clusterQualifies(cluster)).toBe(true);
    });
});

describe("learnings", () => {
    it("allocates sequential ids per date", () => {
        const date = new Date("2026-08-08T00:00:00Z");
        expect(nextLearningId([], date)).toBe("L-20260808-001");
        expect(nextLearningId(["L-20260808-001"], date)).toBe("L-20260808-002");
        expect(nextLearningId(["L-20260101-009"], date)).toBe("L-20260808-001");
    });

    it("expires stale active learnings only", () => {
        const active = formatLearningEntry({
            id: "L-20260101-001",
            status: "active",
            evidence: "3 runs",
            evidenceCount: 3,
            expires: "2026-02-01",
            text: "old lesson",
            promotedTo: null,
        });
        const promoted = formatLearningEntry({
            id: "L-20260101-002",
            status: "promoted",
            evidence: "3 runs",
            evidenceCount: 3,
            expires: "2026-02-01",
            text: "promoted lesson",
            promotedTo: "versions/v1",
        });
        const result = expireStaleLearnings(
            `# Learnings\n\n${active}${promoted}`,
            "2026-08-08",
        );
        expect(result).toContain("## L-20260101-001\n- status: expired");
        expect(result).toContain("## L-20260101-002\n- status: promoted");
    });
});
