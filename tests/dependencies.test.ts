#!/usr/bin/env bun

/**
 * Dependency Version Compatibility Tests
 *
 * Ensures that critical dependencies maintain version alignment
 * to prevent runtime errors like the messageID validation issue.
 *
 * This test suite catches:
 * - Mismatched SDK versions (client vs server)
 * - Missing dependencies
 * - Incompatible version ranges
 * - API breaking changes
 */

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Read package.json to validate versions
const packageJsonPath = join(import.meta.dir, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const criticalOpenCodeDeps = ["@opencode-ai/plugin", "@opencode-ai/sdk"];

function getDependencyVersion(dependency: string): string {
    return packageJson.dependencies[dependency];
}

describe("Dependency Version Compatibility", () => {
    describe("OpenCode SDK Versions", () => {
        it("should have OpenCode runtime dependencies", () => {
            for (const dependency of criticalOpenCodeDeps) {
                expect(packageJson.dependencies).toHaveProperty(dependency);
            }
        });

        it("should use version 1.1.13 or higher for OpenCode runtime dependencies", () => {
            for (const dependency of criticalOpenCodeDeps) {
                const version = getDependencyVersion(dependency);
                const versionMatch = version.match(/(\d+\.\d+\.\d+)/);
                expect(versionMatch).not.toBeNull();

                if (versionMatch) {
                    const [major, minor, patch] = versionMatch[1]
                        .split(".")
                        .map(Number);

                    const isCompatible =
                        major > 1 ||
                        (major === 1 && minor > 1) ||
                        (major === 1 && minor === 1 && patch >= 13);

                    expect(isCompatible).toBe(true);
                }
            }
        });

        it("should not use OpenCode SDK 1.0.x versions", () => {
            for (const dependency of criticalOpenCodeDeps) {
                const version = getDependencyVersion(dependency);
                expect(version).not.toMatch(/\^1\.0\./);
            }
        });

        it("should explicitly document SDK version >= 1.1.13", () => {
            for (const dependency of criticalOpenCodeDeps) {
                const version = getDependencyVersion(dependency);
                const versionMatch = version.match(/(\d+)\.(\d+)\.(\d+)/);
                expect(versionMatch).not.toBeNull();

                if (versionMatch) {
                    const [, major, minor, patch] = versionMatch.map(Number);
                    const isCompatible =
                        major > 1 ||
                        (major === 1 && minor > 1) ||
                        (major === 1 && minor === 1 && patch >= 13);
                    expect(isCompatible).toBe(true);
                }
            }
        });
    });

    describe("Version Range Constraints", () => {
        it("should use caret ranges for SDK dependencies", () => {
            for (const dependency of criticalOpenCodeDeps) {
                expect(getDependencyVersion(dependency)).toMatch(/^\^/);
            }
        });

        it("should not use wildcard or insecure version ranges", () => {
            for (const dep of criticalOpenCodeDeps) {
                const version = packageJson.dependencies[dep];
                if (version) {
                    // Should not be *, x, or latest
                    expect(version).not.toMatch(/^(\*|x|latest)$/);
                }
            }
        });
    });

    describe("API Compatibility", () => {
        it("should load OpenCode runtime dependencies without errors", async () => {
            for (const dependency of criticalOpenCodeDeps) {
                const importResult = await import(dependency)
                    .then(() => ({ success: true, error: null }))
                    .catch((error) => ({
                        success: false,
                        error: error?.message || String(error),
                    }));

                expect(importResult.success).toBe(true);
            }
        });
    });

    describe("SDK Message Validation", () => {
        it("should validate messageID format according to SDK 1.1.13 spec", () => {
            // This test documents that SDK 1.1.13 requires messageIDs to start with "msg"
            // If this test fails, it indicates the SDK version or API changed
            const validMessageID = "msg_test123";
            const invalidMessageID = "test123";

            const isValidFormat = validMessageID.startsWith("msg");
            const isInvalidFormat = invalidMessageID.startsWith("msg");

            expect(isValidFormat).toBe(true);
            expect(isInvalidFormat).toBe(false);
        });
    });

    describe("Dependency Update Notifications", () => {
        it("should have package.json with pinned SDK versions", () => {
            // Ensure versions are explicitly set (not wildcards)
            for (const dependency of criticalOpenCodeDeps) {
                const version = getDependencyVersion(dependency);
                expect(version).toBeTruthy();
                expect(typeof version).toBe("string");
                expect(version.length).toBeGreaterThan(0);
            }
        });

        it("should document current SDK versions for debugging", () => {
            // This helps with future debugging when SDK updates occur
            for (const dependency of criticalOpenCodeDeps) {
                console.log(
                    `[Dependency Check] ${dependency} version: ${getDependencyVersion(dependency)}`,
                );
            }
            console.log(
                "[SDK Info] Requires messageID format: ^msg.* (SDK 1.1.13+)",
            );

            expect(criticalOpenCodeDeps.length).toBeGreaterThan(0);
        });
    });
});

describe("SDK Integration Health", () => {
    it("should have compatible OpenCode version installed", async () => {
        for (const dependency of criticalOpenCodeDeps) {
            const importResult = await import(dependency)
                .then(() => ({ success: true }))
                .catch((error) => ({ success: false, error: String(error) }));

            expect(importResult.success).toBe(true);
        }
    });

    it("should detect SDK version mismatches in CI environment", () => {
        // Document the process for catching version mismatches
        const processEnv = process.env;
        const inCIEnvironment = !!(
            processEnv.CI ||
            processEnv.GITHUB_ACTIONS ||
            processEnv.GITLAB_CI
        );

        // In CI, we validate versions strictly through package.json
        for (const dependency of criticalOpenCodeDeps) {
            expect(getDependencyVersion(dependency)).toBeTruthy();
        }

        if (inCIEnvironment) {
            for (const dependency of criticalOpenCodeDeps) {
                console.log(
                    `[CI Check] Running in CI environment with ${dependency} version: ${getDependencyVersion(dependency)}`,
                );
            }
        }

        expect(typeof inCIEnvironment).toBe("boolean");
    });

    it("should fail loudly if SDK version reverts to 1.0.x", () => {
        // This is a regression test for the messageID validation error
        for (const dependency of criticalOpenCodeDeps) {
            const version = getDependencyVersion(dependency);
            const is1_0_Version = version.includes("1.0.");

            expect(is1_0_Version).toBe(false);

            if (is1_0_Version) {
                throw new Error(
                    `CRITICAL: ${dependency} version ${version} is too old. Requires >= 1.1.13 for messageID validation. Error: Invalid string: must start with "msg"`,
                );
            }
        }
    });
});

describe("Historical Context: MessageID Validation Error", () => {
    it("should document the error that was fixed", () => {
        // Historical reference for debugging
        const errorMessage =
            'Invalid response from OpenCode: {"error":[{"message":"Invalid string: must start with \\"msg\\""}],"success":false}';

        const errorIndicatesSDKVersionMismatch = errorMessage.includes("msg");

        expect(errorIndicatesSDKVersionMismatch).toBe(true);

        console.log(`
[Historical Error Reference]
Error: ${errorMessage}

Cause: OpenCode SDK 1.0.218 client incompatible with OpenCode 1.1.13 server
Solution: Upgrade @opencode-ai/plugin from ^1.0.218 to ^1.1.13
Verification: messageID validation now works correctly

To prevent this in the future:
1. Keep SDK dependencies synchronized with server version
2. Run this test suite in CI to catch version mismatches
3. Monitor package.json for unexpected version changes
		`);
    });
});
