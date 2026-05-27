/**
 * clean subcommand — Remove ai-eng-managed artifacts.
 */

import { parseArgs } from "node:util";
import type { CleanFlags } from "../../install/types";
import { runCleaner } from "../../install/clean";
import { resolveInstallScope } from "../../install/install";
import { parsePlatformArg } from "./install";
import type { Subcommand } from "./types";

const CLEAN_HELP_TEXT = `
ai-eng clean - Remove ai-eng-managed commands, agents, skills, and bundles

Removes only artifacts installed by ai-eng (tracked in .ai-eng/install-manifest.json
or derived from the current toolkit/core package). Does not delete user-owned
skills, commands, or unrelated harness configuration.

USAGE:
  ai-eng clean [options]

OPTIONS:
  --platform opencode|cursor|gemini|pi|all   Target harness (default: opencode)
  --scope project|global|auto                Scope (default: auto-detect)
  --dry-run                                  Show what would be removed
  -v, --verbose                              Verbose output
  -h, --help                                 Show this help message

EXAMPLES:
  ai-eng clean --platform cursor --scope project
  ai-eng clean --platform opencode --scope global
  ai-eng clean --platform all --scope project
`;

interface CleanCommandFlags extends CleanFlags {
    help?: boolean;
}

async function runClean(args: string[]): Promise<void> {
    const { values } = parseArgs({
        args,
        options: {
            scope: { type: "string" },
            platform: { type: "string" },
            "dry-run": { type: "boolean" },
            verbose: { type: "boolean", short: "v" },
            help: { type: "boolean" },
        },
        allowPositionals: true,
    });

    const platform = parsePlatformArg(values.platform as string | undefined, true);

    const flags: CleanCommandFlags = {
        scope: values.scope as CleanFlags["scope"],
        platform: (platform as CleanFlags["platform"]) ?? "opencode",
        dryRun: values["dry-run"],
        verbose: values.verbose,
        help: values.help,
    };

    if (flags.help) {
        console.log(CLEAN_HELP_TEXT);
        return;
    }

    await runCleaner(flags, (projectDir) =>
        resolveInstallScope({ scope: flags.scope }, projectDir),
    );
}

export const cleanCommand: Subcommand = {
    name: "clean",
    helpText: CLEAN_HELP_TEXT,
    run: runClean,
};
