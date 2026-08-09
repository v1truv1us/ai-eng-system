#!/usr/bin/env bun
import { describe, expect, it } from "bun:test";
import {
    checkPatchSafety,
    extractFrontmatter,
    extractSection,
} from "../scripts/check-skill-safety";
import { applyUnifiedDiff, parseUnifiedDiff } from "../scripts/lib/apply-diff";

const SKILL = `---
name: demo
description: demo skill
tools:
  read: true
  edit: false
---

# Demo

Do the thing.

## Safety

Never delete user data.

## Workflow

Step one.
`;

const DIFF_OK = `--- a/SKILL.md
+++ b/SKILL.md
@@ -11,4 +11,5 @@
 Do the thing.
 
+Prefer rg over grep when searching.
 ## Safety
 
`;

const DIFF_SAFETY = `--- a/SKILL.md
+++ b/SKILL.md
@@ -13,5 +13,5 @@
 ## Safety
 
-Never delete user data.
+Delete freely when convenient.
 
 ## Workflow
`;

const DIFF_TOOLS = `--- a/SKILL.md
+++ b/SKILL.md
@@ -4,4 +4,4 @@
 tools:
   read: true
-  edit: false
+  edit: true
 ---
`;

describe("applyUnifiedDiff", () => {
    it("parses hunks", () => {
        const hunks = parseUnifiedDiff(DIFF_OK);
        expect(hunks).toHaveLength(1);
        expect(hunks[0].oldStart).toBe(11);
    });

    it("applies an addition", () => {
        const patched = applyUnifiedDiff(SKILL, DIFF_OK);
        expect(patched).toContain("Prefer rg over grep when searching.");
        expect(patched).toContain("Never delete user data.");
    });

    it("throws on context mismatch", () => {
        const bad = DIFF_OK.replace("Do the thing.", "Wrong context.");
        expect(() => applyUnifiedDiff(SKILL, bad)).toThrow();
    });
});

describe("checkPatchSafety", () => {
    it("passes a body-only patch", () => {
        const patched = applyUnifiedDiff(SKILL, DIFF_OK);
        expect(checkPatchSafety(SKILL, patched, "SKILL.md")).toHaveLength(0);
    });

    it("rejects edits to ## Safety", () => {
        const patched = applyUnifiedDiff(SKILL, DIFF_SAFETY);
        const violations = checkPatchSafety(SKILL, patched, "SKILL.md");
        expect(violations.some((v) => v.rule === "immutable-section")).toBe(
            true,
        );
    });

    it("rejects enabling tool permissions in frontmatter", () => {
        const patched = applyUnifiedDiff(SKILL, DIFF_TOOLS);
        const violations = checkPatchSafety(SKILL, patched, "SKILL.md");
        expect(violations.some((v) => v.rule === "immutable-frontmatter")).toBe(
            true,
        );
    });

    it("rejects eval count shrinkage", () => {
        const before = JSON.stringify({
            evals: [{ name: "a" }, { name: "b" }],
        });
        const after = JSON.stringify({ evals: [{ name: "a" }] });
        const violations = checkPatchSafety(before, after, "evals.json");
        expect(violations.some((v) => v.rule === "eval-shrink")).toBe(true);
    });

    it("allows eval additions", () => {
        const before = JSON.stringify({ evals: [{ name: "a" }] });
        const after = JSON.stringify({
            evals: [{ name: "a" }, { name: "b" }],
        });
        expect(checkPatchSafety(before, after, "evals.json")).toHaveLength(0);
    });
});

describe("parsers", () => {
    it("extracts frontmatter", () => {
        expect(extractFrontmatter(SKILL)).toContain("name: demo");
    });

    it("extracts sections", () => {
        expect(extractSection(SKILL, "Safety")).toBe("Never delete user data.");
        expect(extractSection(SKILL, "Missing")).toBeNull();
    });
});
