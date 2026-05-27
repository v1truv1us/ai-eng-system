/**
 * install subcommand — Install platform assets.
 */

import { parseArgs } from "node:util";
import { runInstaller } from "../../install/install";
import type { InstallFlags } from "../../install/types";
import type { Subcommand } from "./types";

const INSTALL_HELP_TEXT = `
ai-eng install - Install platform assets from @ai-eng-system/toolkit / core

Claude Code: use the Claude marketplace plugin (not this command).

USAGE:
  ai-eng install [options]

OPTIONS:
  --platform opencode|cursor|gemini|pi   Target harness (default: opencode)
  --scope project|global|auto            Install scope (default: auto-detect)
  --fresh                                Clean before install (default)
  --skip-clean                           Install without removing previous ai-eng files
  --dry-run                              Show what would be done without writing
  --yes                                  Skip confirmation prompts
  -v, --verbose                          Verbose output
  -h, --help                             Show this help message

EXAMPLES:
  ai-eng install                                    # OpenCode (auto scope, clean first)
  ai-eng install --platform cursor                  # project: plugin + .agents/skills/
  ai-eng install --platform cursor --scope global   # ~/.cursor/plugins/local/ai-eng-system/ + skills
  ai-eng install --platform pi --scope global       # ~/.agents/skills/ (minimal)
  ai-eng install --platform gemini                  # ./.gemini/
  ai-eng install --platform gemini --scope global   # merge into ~/.gemini/
  ai-eng install --platform pi                      # .pi/ + .agents/skills/
  ai-eng install --scope project                    # OpenCode project .opencode/
  ai-eng install --scope global                     # OpenCode ~/.config/opencode/
  ai-eng reinstall --platform cursor                # Same as clean + install
`;

interface InstallCommandFlags extends InstallFlags {
    help?: boolean;
}

export function parsePlatformArg(
    platformRaw: string | undefined,
    allowAll = false,
): InstallFlags["platform"] | "all" | undefined {
    if (!platformRaw) return undefined;
    const allowed = new Set([
        "opencode",
        "cursor",
        "gemini",
        "pi",
        "claude",
        ...(allowAll ? ["all"] : []),
    ]);
    if (!allowed.has(platformRaw)) {
        console.log(
            `❌ Unknown platform "${platformRaw}". Use opencode, cursor, gemini, pi${allowAll ? ", or all" : ""}.`,
        );
        process.exit(1);
    }
    if (platformRaw === "claude") {
        console.log(
            "Claude Code uses the marketplace plugin. Remove via Claude's plugin UI.",
        );
        console.log("  /plugin marketplace add v1truv1us/ai-eng-system");
        process.exit(0);
    }
    return platformRaw as InstallFlags["platform"] | "all";
}

async function runInstall(args: string[]): Promise<void> {
    const { values } = parseArgs({
        args,
        options: {
            scope: { type: "string" },
            platform: { type: "string" },
            "dry-run": { type: "boolean" },
            yes: { type: "boolean" },
            fresh: { type: "boolean", default: true },
            "skip-clean": { type: "boolean" },
            verbose: { type: "boolean", short: "v" },
            help: { type: "boolean" },
        },
        allowPositionals: true,
    });

    const platform = parsePlatformArg(values.platform as string | undefined);

    const flags: InstallCommandFlags = {
        scope: values.scope as InstallFlags["scope"],
        platform: (platform as InstallFlags["platform"]) ?? "opencode",
        dryRun: values["dry-run"],
        yes: values.yes,
        fresh: values.fresh,
        skipClean: values["skip-clean"],
        verbose: values.verbose,
        help: values.help,
    };

    if (flags.help) {
        console.log(INSTALL_HELP_TEXT);
        return;
    }

    await runInstaller(flags);
}

export const installCommand: Subcommand = {
    name: "install",
    aliases: ["i"],
    helpText: INSTALL_HELP_TEXT,
    run: runInstall,
};
