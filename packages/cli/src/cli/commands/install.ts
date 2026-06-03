/**
 * install subcommand — Install platform assets.
 */

import { parseArgs } from "node:util";
import { runInstaller } from "../../install/install";
import type { InstallFlags } from "../../install/types";
import type { Subcommand } from "./types";

const INSTALL_HELP_TEXT = `
ai-eng install - Install platform assets from @ai-eng-system/toolkit / core

All platforms share skills through ~/.agents/skills/ (global) or .agents/skills/ (project).
Platform-specific assets (commands, agents, plugins) go to their native directories.
Claude Code: use the Claude marketplace plugin (not this command).

USAGE:
  ai-eng install [options]

OPTIONS:
  --platform opencode|cursor|gemini|pi|all  Target harness (default: opencode)
  --scope project|global|auto               Install scope (default: auto-detect)
  --fresh                                   Clean before install (default)
  --skip-clean                              Install without removing previous ai-eng files
  --dry-run                                 Show what would be done without writing
  --yes                                     Skip confirmation prompts
  -v, --verbose                             Verbose output
  -h, --help                                Show this help message

EXAMPLES:
  ai-eng install                                    # OpenCode (auto scope, clean first)
  ai-eng install --platform opencode --scope global # commands/agents/tools -> ~/.config/opencode/; skills -> ~/.agents/skills/
  ai-eng install --platform cursor                  # plugin -> .cursor/; skills -> .agents/skills/
  ai-eng install --platform cursor --scope global   # plugin -> ~/.cursor/; skills -> ~/.agents/skills/
  ai-eng install --platform gemini                  # commands -> .gemini/; skills -> .agents/skills/
  ai-eng install --platform gemini --scope global   # commands -> ~/.gemini/; skills -> ~/.agents/skills/
  ai-eng install --platform pi                      # skills -> .agents/skills/
  ai-eng install --platform pi --scope global       # skills -> ~/.agents/skills/
  ai-eng install --platform all --scope global      # Install all platforms globally
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

    const platform = parsePlatformArg(
        values.platform as string | undefined,
        true,
    );

    if (platform === "all") {
        const platforms: InstallFlags["platform"][] = [
            "opencode",
            "cursor",
            "gemini",
            "pi",
        ];
        for (const p of platforms) {
            const flags: InstallCommandFlags = {
                scope: values.scope as InstallFlags["scope"],
                platform: p,
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
            console.log("");
        }
        return;
    }

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
