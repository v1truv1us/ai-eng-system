/**
 * Install platform flag and toolkit path helpers
 */

import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import { parseArgs } from "node:util";
import path from "node:path";
import {
    getAgentSkillsInstallDir,
    getInstallTargetDir,
    getHomeDirectory,
    resolveInstallBaseDir,
    resolveToolkitRoot,
    usesSkillsOnlyInstall,
} from "../../src/install/toolkit-path";
import { syncSkillsTree } from "../../src/install/sync-skills";

describe("install platform flags", () => {
    it("should parse --platform cursor", () => {
        const { values } = parseArgs({
            args: ["--platform", "cursor"],
            options: { platform: { type: "string" } },
            allowPositionals: true,
        });
        expect(values.platform).toBe("cursor");
    });

    it("should map cursor install target under .cursor/plugins", () => {
        const target = getInstallTargetDir(
            "cursor",
            "/tmp/my-project",
            "project",
        );
        expect(target).toBe(
            path.join("/tmp/my-project", ".cursor", "plugins", "ai-eng-system"),
        );
    });

    it("should map cursor global install under ~/.cursor/plugins/local", () => {
        const home = "/Users/tester";
        const target = getInstallTargetDir("cursor", home, "global");
        expect(target).toBe(
            path.join(
                home,
                ".cursor",
                "plugins",
                "local",
                "ai-eng-system",
            ),
        );
    });

    it("should map gemini project target to .gemini", () => {
        expect(getInstallTargetDir("gemini", "/repo", "project")).toBe(
            path.join("/repo", ".gemini"),
        );
    });

    it("should map gemini global target to ~/.gemini", () => {
        const home = "/Users/tester";
        expect(getInstallTargetDir("gemini", home, "global")).toBe(
            path.join(home, ".gemini"),
        );
    });

    it("should map agent skills dir for global cursor/pi", () => {
        expect(getAgentSkillsInstallDir("global", "/repo")).toBe(
            path.join(getHomeDirectory(), ".agents", "skills"),
        );
        expect(getAgentSkillsInstallDir("project", "/repo")).toBe(
            path.join("/repo", ".agents", "skills"),
        );
    });

    it("should use skills-only install for global pi only", () => {
        expect(usesSkillsOnlyInstall("cursor", "global")).toBe(false);
        expect(usesSkillsOnlyInstall("pi", "global")).toBe(true);
        expect(usesSkillsOnlyInstall("cursor", "project")).toBe(false);
        expect(usesSkillsOnlyInstall("gemini", "global")).toBe(false);
    });

    it("should sync skill directories into agent skills root", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-eng-skills-"));
        const source = path.join(tmp, "source", "skills");
        const target = path.join(tmp, "target", ".agents", "skills");
        fs.mkdirSync(path.join(source, "demo-skill"), { recursive: true });
        fs.writeFileSync(
            path.join(source, "demo-skill", "SKILL.md"),
            "---\nname: demo-skill\ndescription: test\n---\n",
        );

        const count = syncSkillsTree(source, target);
        expect(count).toBe(1);
        expect(fs.existsSync(path.join(target, "demo-skill", "SKILL.md"))).toBe(
            true,
        );

        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("should resolve install base dir from scope", () => {
        expect(resolveInstallBaseDir("project", "/repo")).toBe("/repo");
        expect(resolveInstallBaseDir("global", "/repo")).toBe(
            getHomeDirectory(),
        );
    });

    it("should resolve toolkit from workspace", () => {
        const root = resolveToolkitRoot();
        expect(root).toContain("packages/toolkit");
    });
});
