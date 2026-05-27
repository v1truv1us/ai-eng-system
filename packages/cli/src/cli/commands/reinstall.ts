/**
 * reinstall subcommand — Clean then install.
 */

import { parseArgs } from "node:util";
import type { CleanFlags, InstallFlags } from "../../install/types";
import { runCleaner } from "../../install/clean";
import { runInstaller, resolveInstallScope } from "../../install/install";
import { parsePlatformArg } from "./install";
import type { Subcommand } from "./types";

const REINSTALL_HELP_TEXT = `
ai-eng reinstall - Clean previous ai-eng install, then install fresh

Shortcut for: ai-eng clean && ai-eng install

USAGE:
  ai-eng reinstall [options]

OPTIONS:
  Same as ai-eng install (platform, scope, dry-run, verbose)

EXAMPLES:
  ai-eng reinstall --platform cursor
  ai-eng reinstall --platform gemini --scope global
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

    const platform = parsePlatformArg(values.platform as string | undefined);

    if (values.help) {
        console.log(REINSTALL_HELP_TEXT);
        return;
    }

    const cleanFlags: CleanCommandFlags = {
        scope: values.scope as CleanFlags["scope"],
        platform: (platform as CleanFlags["platform"]) ?? "opencode",
        dryRun: values["dry-run"],
        verbose: values.verbose,
    };

    const installFlags: InstallCommandFlags = {
        scope: values.scope as InstallFlags["scope"],
        platform: (platform as InstallFlags["platform"]) ?? "opencode",
        dryRun: values["dry-run"],
        verbose: values.verbose,
        fresh: true,
        skipClean: false,
    };

    await runCleaner(cleanFlags, (projectDir) =>
        resolveInstallScope({ scope: cleanFlags.scope }, projectDir),
    );

    if (!values["dry-run"]) {
        console.log("");
    }

    await runInstaller(installFlags);
}

export const reinstallCommand: Subcommand = {
    name: "reinstall",
    helpText: REINSTALL_HELP_TEXT,
    run: runReinstall,
};
