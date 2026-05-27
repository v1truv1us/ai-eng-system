import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    formatSkillContent,
    formatSkillsDirectory,
    hasFormatErrors,
} from "../scripts/lib/agent-skills.ts";

describe("agent-skills formatter", () => {
    it("normalizes legacy version/tags into metadata", () => {
        const input = `---
name: demo-skill
description: Does demo things for testing and validation across harnesses.
version: 1.0.0
tags: [alpha, beta]
---

# Demo
`;
        const result = formatSkillContent(
            input,
            "/tmp/skills/demo-skill/SKILL.md",
        );

        expect(result.changed).toBe(true);
        expect(result.formatted).toContain("metadata:");
        expect(result.formatted).toContain("version: 1.0.0");
        expect(result.formatted).toContain("tags: alpha, beta");
        expect(result.formatted).not.toMatch(/^tags:/m);
        expect(result.formatted).not.toMatch(/^version:/m);
    });

    it("collapses folded descriptions to a single line", () => {
        const input = `---
name: folded
description: Line one
  continues here with more detail for discovery.
---

# Folded
`;
        const result = formatSkillContent(input, "/tmp/skills/folded/SKILL.md");

        expect(result.formatted).toContain(
            "description: Line one continues here with more detail for discovery.",
        );
    });

    it("errors when name does not match directory", () => {
        const input = `---
name: other-name
description: Valid description long enough for agent skill discovery testing.
---

# Body
`;
        const result = formatSkillContent(
            input,
            "/tmp/skills/demo-skill/SKILL.md",
        );

        expect(
            result.issues.some((issue) => issue.code === "name-dir-mismatch"),
        ).toBe(true);
        expect(result.issues.some((issue) => issue.level === "error")).toBe(
            true,
        );
    });

    it("writes formatted files with --fix", async () => {
        const root = await mkdtemp(join(tmpdir(), "skills-format-"));
        const skillDir = join(root, "sample-skill");
        await mkdir(skillDir, { recursive: true });
        const skillFile = join(skillDir, "SKILL.md");
        await writeFile(
            skillFile,
            `---
name: sample-skill
description: Sample skill used to verify formatter writes canonical Agent Skills output.
version: 2.0.0
---

# Sample
`,
        );

        const summary = await formatSkillsDirectory({
            skillsRoot: root,
            fix: true,
        });

        expect(summary.changed).toBe(1);
        const written = await readFile(skillFile, "utf-8");
        expect(written).toContain("metadata:");
        expect(written).toContain("version: 2.0.0");
        expect(written).toMatch(/^---\n[\s\S]+\n---\n\n# Sample/m);

        await rm(root, { recursive: true, force: true });
    });
});
