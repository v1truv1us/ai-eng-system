/**
 * Clean / reinstall install helpers
 */

import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
    cleanOpenCodeInstall,
    extractOpenCodeSkillDirs,
} from "../../src/install/clean";
import {
    readInstallManifest,
    upsertManifestEntry,
} from "../../src/install/manifest";
import {
    listSkillTreeEntries,
    removeSkillTreeEntries,
} from "../../src/install/sync-skills";

describe("install clean helpers", () => {
    it("extracts top-level OpenCode skill directory names", () => {
        const dirs = extractOpenCodeSkillDirs({
            commands: [],
            agents: [],
            tools: [],
            skills: [
                {
                    name: "SKILL",
                    path: "workflow/ralph-wiggum/SKILL.md",
                    type: "skill",
                },
                {
                    name: "SKILL",
                    path: "spec-driven-development/SKILL.md",
                    type: "skill",
                },
            ],
        });

        expect(dirs).toEqual(["spec-driven-development", "workflow"]);
    });

    it("removes only managed skill tree entries", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-clean-"));
        const target = path.join(tmp, ".agents", "skills");
        fs.mkdirSync(path.join(target, "managed-skill"), { recursive: true });
        fs.mkdirSync(path.join(target, "user-skill"), { recursive: true });
        fs.writeFileSync(path.join(target, "user-skill", "SKILL.md"), "keep");

        const result = { removed: [] as string[], skipped: [] as string[] };
        removeSkillTreeEntries(target, ["managed-skill"], false, result, false);

        expect(result.removed.length).toBe(1);
        expect(fs.existsSync(path.join(target, "managed-skill"))).toBe(false);
        expect(fs.existsSync(path.join(target, "user-skill", "SKILL.md"))).toBe(
            true,
        );

        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("cleans OpenCode namespaced commands and managed skills", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-oc-clean-"));
        const openCodeDir = path.join(tmp, ".opencode");
        fs.mkdirSync(path.join(openCodeDir, "command", "ai-eng"), {
            recursive: true,
        });
        fs.writeFileSync(
            path.join(openCodeDir, "command", "ai-eng", "plan.md"),
            "# plan",
        );
        fs.mkdirSync(path.join(openCodeDir, "skill", "demo-skill"), {
            recursive: true,
        });
        fs.writeFileSync(
            path.join(openCodeDir, "skill", "demo-skill", "SKILL.md"),
            "---\nname: demo-skill\ndescription: demo\n---\n",
        );
        fs.mkdirSync(path.join(openCodeDir, "skill", "keep-skill"), {
            recursive: true,
        });

        const result = cleanOpenCodeInstall(
            openCodeDir,
            {
                commands: [],
                agents: [],
                tools: [],
                skills: [
                    {
                        name: "SKILL",
                        path: "demo-skill/SKILL.md",
                        type: "skill",
                    },
                ],
            },
            { dryRun: false, verbose: false },
        );

        expect(result.removed.length).toBeGreaterThan(0);
        expect(fs.existsSync(path.join(openCodeDir, "command", "ai-eng"))).toBe(
            false,
        );
        expect(
            fs.existsSync(path.join(openCodeDir, "skill", "demo-skill")),
        ).toBe(false);
        expect(
            fs.existsSync(path.join(openCodeDir, "skill", "keep-skill")),
        ).toBe(true);

        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("writes and reads install manifest entries", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-manifest-"));
        const prevCwd = process.cwd();
        process.chdir(tmp);

        upsertManifestEntry("project", tmp, {
            platform: "cursor",
            scope: "project",
            installedAt: new Date().toISOString(),
            agentSkillEntries: ["demo-skill"],
            bundlePath: ".cursor/plugins/ai-eng-system",
        });

        const manifest = readInstallManifest("project", tmp);
        expect(manifest.entries).toHaveLength(1);
        expect(manifest.entries[0]?.platform).toBe("cursor");
        expect(manifest.entries[0]?.agentSkillEntries).toEqual(["demo-skill"]);

        process.chdir(prevCwd);
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("lists skill tree entries for clean targeting", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-tk-clean-"));
        const skillsSource = path.join(tmp, "source", "skills");
        fs.mkdirSync(path.join(skillsSource, "demo-skill"), {
            recursive: true,
        });
        fs.mkdirSync(path.join(skillsSource, "workflow"), { recursive: true });

        expect(listSkillTreeEntries(skillsSource)).toEqual([
            "demo-skill",
            "workflow",
        ]);

        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
