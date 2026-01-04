#!/usr/bin/env bun

/**
 * Unit tests for individual functions and utilities
 * Tests isolated components without full build process
 */

import { describe, expect, it } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";


describe("Global-Aware Installation", () => {
    const TEST_DIR = join(tmpdir(), `ai-eng-install-test-${Date.now()}`);
    let originalHome: string | undefined;
    beforeEach(async () => {
        // Save original HOME
        originalHome = process.env.HOME;
        await mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
        // Restore original HOME
        process.env.HOME = originalHome;
        // Cleanup
        if (existsSync(TEST_DIR)) {
            await rm(TEST_DIR, { recursive: true, force: true });
        }
    });

    describe("fileContainsPlugin", () => {
        it("should return true when config contains ai-eng-system", async () => {
            const configPath = join(TEST_DIR, "opencode.jsonc");
            await writeFile(
                configPath,
                JSON.stringify({
                    plugin: ["ai-eng-system", "other-plugin"]
                }),
            );

            expect(fileContainsPlugin(configPath)).toBe(true);
        });

        it("should return false when config does not contain ai-eng-system", async () => {
            const configPath = join(TEST_DIR, "opencode.jsonc");
            await writeFile(
                configPath,
                JSON.stringify({
                    plugin: ["other-plugin"]
                }),
            );

            expect(fileContainsPlugin(configPath)).toBe(false);
        });

        it("should return false when file does not exist", () => {
            expect(fileContainsPlugin("/nonexistent/path/opencode.jsonc")).toBe(false);
        });

        it("should handle JSONC with single-line comments", async () => {
            const configPath = join(TEST_DIR, "opencode.jsonc");
            await writeFile(
                configPath,
                `{
                // This is a comment
                "plugin": ["ai-eng-system"]
            }`,
            );

            expect(fileContainsPlugin(configPath)).toBe(true);
        });

        it("should handle JSONC with multi-line comments", async () => {
            const configPath = join(TEST_DIR, "opencode.jsonc");
            await writeFile(
                configPath,
                `{
                /*
                 * Multi-line comment
                 */
                "plugin": ["ai-eng-system"]
            }`,
            );

            expect(fileContainsPlugin(configPath)).toBe(true);
        });
    });

    describe("findInstallationTarget", () => {
        it("should return global path when global config has plugin", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const globalConfig = join(fakeHome, ".config", "opencode");
            await mkdir(globalConfig, { recursive: true });
            await writeFile(
                join(globalConfig, "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            process.env.HOME = fakeHome;

            const result = findInstallationTarget("/some/project");
            expect(result).toBe(globalConfig);
        });

        it("should return project path when only project config has plugin", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const projectDir = join(TEST_DIR, "project");
            const projectConfig = join(projectDir, ".opencode");

            // No global config
            await mkdir(join(fakeHome, ".config", "opencode"), { recursive: true });

            // Project config with plugin
            await mkdir(projectConfig, { recursive: true });
            await writeFile(
                join(projectConfig, "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            process.env.HOME = fakeHome;

            const result = findInstallationTarget(projectDir);
            expect(result).toBe(projectConfig);
        });

        it("should return global path when both configs have plugin (global wins)", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const globalConfig = join(fakeHome, ".config", "opencode");
            const projectDir = join(TEST_DIR, "project");
            const projectConfig = join(projectDir, ".opencode");

            // Both have plugin
            await mkdir(globalConfig, { recursive: true });
            await writeFile(
                join(globalConfig, "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            await mkdir(projectConfig, { recursive: true });
            await writeFile(
                join(projectConfig, "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            process.env.HOME = fakeHome;

            const result = findInstallationTarget(projectDir);
            expect(result).toBe(globalConfig);
        });

        it("should return null when plugin not referenced anywhere", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const projectDir = join(TEST_DIR, "project");

            // Neither config exists
            process.env.HOME = fakeHome;

            const result = findInstallationTarget(projectDir);
            expect(result).toBeNull();
        });

        it("should return null when configs exist but don't reference plugin", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const projectDir = join(TEST_DIR, "project");

            // Both configs exist but don't reference plugin
            await mkdir(join(fakeHome, ".config", "opencode"), { recursive: true });
            await writeFile(
                join(fakeHome, ".config", "opencode", "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["other-plugin"]
                }),
            );

            await mkdir(projectDir, ".opencode", { recursive: true });
            await writeFile(
                join(projectDir, ".opencode", "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["another-plugin"]
                }),
            );

            process.env.HOME = fakeHome;

            const result = findInstallationTarget(projectDir);
            expect(result).toBeNull();
        });

        it("should handle missing global config directory", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const projectDir = join(TEST_DIR, "project");

            // Don't create global config
            // Project config with plugin
            await mkdir(projectDir, ".opencode", { recursive: true });
            await writeFile(
                join(projectDir, ".opencode", "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            process.env.HOME = fakeHome;

            const result = findInstallationTarget(projectDir);
            expect(result).toBe(join(projectDir, ".opencode"));
        });

        it("should handle missing project config directory", async () => {
            const fakeHome = join(TEST_DIR, "home");
            const globalConfig = join(fakeHome, ".config", "opencode");

            await mkdir(globalConfig, { recursive: true });
            await writeFile(
                join(globalConfig, "opencode.jsonc"),
                JSON.stringify({
                    plugin: ["ai-eng-system"]
                }),
            );

            process.env.HOME = fakeHome;

            // Don't create project config
            const projectDir = join(TEST_DIR, "project");

            const result = findInstallationTarget(projectDir);
            expect(result).toBe(globalConfig);
        });
    });
});
