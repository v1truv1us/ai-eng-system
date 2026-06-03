/**
 * reinstall subcommand — Clean then install.
 */

import { parseArgs } from "node:util";
import { runCleaner } from "../../install/clean";
import { resolveInstallScope, runInstaller } from "../../install/install";
import type { CleanFlags, InstallFlags } from "../../install/types";
import { parsePlatformArg } from "./install";
import type { Subcommand } from "./types";

const REINSTALL_HELP_TEXT = `
ai-eng reinstall - Clean previous ai-eng install, then install fresh

Shortcut for: ai-eng clean && ai-eng install
All platforms share skills through ~/.agents/skills/ (global) or .agents/skills/ (project).

USAGE:
  ai-eng reinstall [options]

OPTIONS:
  Same as ai-eng install (platform, scope, dry-run, verbose)

EXAMPLES:
  ai-eng reinstall --platform cursor
  ai-eng reinstall --platform gemini --scope global
  ai-eng reinstall --platform all --scope global
`;

interface CleanCommandFlags extends CleanFlags {
    help?: boolean;
}

interface InstallCommandFlags extends InstallFlags {
    help?: boolean;
}

async function runReinstall(args: string[]): Promise<void> {
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

    const platform = parsePlatformArg(
        values.platform as string | undefined,
        true,
    );

    if (values.help) {
        console.log(REINSTALL_HELP_TEXT);
        return;
    }

    const platforms: InstallFlags["platform"][] =
        platform === "all"
            ? ["opencode", "cursor", "gemini", "pi"]
            : [(platform as InstallFlags["platform"]) ?? "opencode"];

    const cleanFlags: CleanCommandFlags = {
        scope: values.scope as CleanFlags["scope"],
        platform: (platform as CleanFlags["platform"]) ?? "opencode",
        dryRun: values["dry-run"],
        verbose: values.verbose,
    };

    await runCleaner(cleanFlags, (projectDir) =>
        resolveInstallScope({ scope: cleanFlags.scope }, projectDir),
    );

    if (!values["dry-run"]) {
        console.log("");
    }

    for (const p of platforms) {
        const installFlags: InstallCommandFlags = {
            scope: values.scope as InstallFlags["scope"],
            platform: p,
            dryRun: values["dry-run"],
            verbose: values.verbose,
            fresh: true,
            skipClean: false,
        };
        await runInstaller(installFlags);
        if (p !== platforms[platforms.length - 1]) {
            console.log("");
        }
    }
}

export const reinstallCommand: Subcommand = {
    name: "reinstall",
    helpText: REINSTALL_HELP_TEXT,
    run: runReinstall,
};
