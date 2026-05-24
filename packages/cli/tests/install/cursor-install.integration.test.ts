/**
 * Integration tests: Cursor harness install (project + global full bundle).
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runCleaner } from "../../src/install/clean";
import { readInstallManifest } from "../../src/install/manifest";
import { runInstaller } from "../../src/install/install";
import { listSkillTreeEntries } from "../../src/install/sync-skills";
import {
    getAgentSkillsInstallDir,
    getInstallTargetDir,
    getToolkitHarnessSource,
} from "../../src/install/toolkit-path";

const CURSOR_COMMANDS = [
    "research.md",
    "specify.md",
    "plan.md",
    "work.md",
    "review.md",
    "ralph-wiggum.md",
];

function assertCursorBundle(bundleRoot: string): void {
    const manifestPath = path.join(
        bundleRoot,
        ".cursor-plugin",
        "plugin.json",
    );
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as {
        name?: string;
        skills?: string;
        agents?: string;
        commands?: string;
        hooks?: string;
    };

    expect(manifest.name).toBe("ai-eng-system");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.agents).toBe("./agents/");
    expect(manifest.commands).toBe("./commands/");
    expect(manifest.hooks).toBe("./hooks/cursor-hooks.json");

    for (const commandFile of CURSOR_COMMANDS) {
        expect(fs.existsSync(path.join(bundleRoot, "commands", commandFile))).toBe(
            true,
        );
    }

    expect(
        fs.existsSync(path.join(bundleRoot, "hooks", "cursor-hooks.json")),
    ).toBe(true);
    expect(fs.existsSync(path.join(bundleRoot, "hooks", "stop-hook.sh"))).toBe(
        true,
    );
    expect(
        fs.existsSync(path.join(bundleRoot, "hooks", "capture-response.sh")),
    ).toBe(true);
    expect(
        fs.existsSync(
            path.join(bundleRoot, "skills", "pstack", "architect", "SKILL.md"),
        ),
    ).toBe(true);
}

describe("cursor install integration", () => {
    let previousCwd: string;
    let previousHome: string | undefined;
    let projectDir: string;
    let fakeHome: string;

    beforeEach(() => {
        previousCwd = process.cwd();
        previousHome = process.env.HOME;
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-cursor-proj-"));
        fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-cursor-home-"));
        process.chdir(projectDir);
    });

    afterEach(() => {
        process.chdir(previousCwd);
        if (previousHome === undefined) {
            delete process.env.HOME;
        } else {
            process.env.HOME = previousHome;
        }
        fs.rmSync(projectDir, { recursive: true, force: true });
        fs.rmSync(fakeHome, { recursive: true, force: true });
    });

    it("installs full Cursor plugin bundle for project scope", async () => {
        await runInstaller({
            platform: "cursor",
            scope: "project",
            fresh: true,
        });

        const bundleRoot = getInstallTargetDir("cursor", projectDir, "project");
        const agentSkillsDir = getAgentSkillsInstallDir("project", projectDir);
        const sourceSkills = path.join(getToolkitHarnessSource("cursor"), "skills");

        assertCursorBundle(bundleRoot);

        const expectedSkillTrees = listSkillTreeEntries(sourceSkills);
        expect(expectedSkillTrees.length).toBeGreaterThan(0);
        for (const entry of expectedSkillTrees) {
            expect(fs.existsSync(path.join(agentSkillsDir, entry))).toBe(true);
        }

        const manifest = readInstallManifest("project", projectDir);
        const entry = manifest.entries.find(
            (item) => item.platform === "cursor" && item.scope === "project",
        );
        expect(entry?.bundlePath).toBe(
            path.join(".cursor", "plugins", "ai-eng-system"),
        );
        expect(entry?.agentSkillEntries.length).toBe(expectedSkillTrees.length);
    });

    it("installs full Cursor plugin bundle for global scope", async () => {
        process.env.HOME = fakeHome;

        await runInstaller({
            platform: "cursor",
            scope: "global",
            fresh: true,
        });

        const bundleRoot = getInstallTargetDir("cursor", fakeHome, "global");
        const agentSkillsDir = getAgentSkillsInstallDir("global", projectDir);

        assertCursorBundle(bundleRoot);
        expect(agentSkillsDir).toBe(
            path.join(fakeHome, ".agents", "skills"),
        );
        expect(fs.existsSync(path.join(agentSkillsDir, "pstack"))).toBe(true);

        const manifest = readInstallManifest("global", projectDir);
        const entry = manifest.entries.find(
            (item) => item.platform === "cursor" && item.scope === "global",
        );
        expect(entry?.bundlePath).toBe(
            path.join(
                ".cursor",
                "plugins",
                "local",
                "ai-eng-system",
            ),
        );
    });

    it("cleans project Cursor install without touching unrelated skills", async () => {
        await runInstaller({
            platform: "cursor",
            scope: "project",
            fresh: true,
        });

        const agentSkillsDir = getAgentSkillsInstallDir("project", projectDir);
        fs.mkdirSync(path.join(agentSkillsDir, "user-owned-skill"), {
            recursive: true,
        });
        fs.writeFileSync(
            path.join(agentSkillsDir, "user-owned-skill", "SKILL.md"),
            "keep",
        );

        await runCleaner(
            { platform: "cursor", scope: "project" },
            () => "project",
        );

        expect(
            fs.existsSync(
                getInstallTargetDir("cursor", projectDir, "project"),
            ),
        ).toBe(false);
        expect(
            fs.existsSync(path.join(agentSkillsDir, "user-owned-skill", "SKILL.md")),
        ).toBe(true);

        const manifest = readInstallManifest("project", projectDir);
        expect(
            manifest.entries.some(
                (item) => item.platform === "cursor" && item.scope === "project",
            ),
        ).toBe(false);
    });
});
