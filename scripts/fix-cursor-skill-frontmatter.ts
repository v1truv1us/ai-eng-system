#!/usr/bin/env bun
/** @deprecated Use `bun run format:skills:fix` instead. */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatSkillsDirectory } from "./lib/agent-skills.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main(): Promise<void> {
    const summary = await formatSkillsDirectory({
        skillsRoot: join(ROOT, "skills"),
        fix: true,
        verbose: true,
    });
    console.log(`Done. Updated ${summary.changed} skill(s).`);
    if (summary.errors > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
