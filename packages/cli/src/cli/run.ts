#!/usr/bin/env node
/**
 * CLI entry point for ai-eng-system
 *
 * Dispatcher that routes to subcommands defined in commands/*.ts.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cleanCommand } from "./commands/clean";
import { initCommand } from "./commands/init";
import { installCommand } from "./commands/install";
import { ralphCommand } from "./commands/ralph";
import { reinstallCommand } from "./commands/reinstall";
import { workflowCommand } from "./commands/workflow";
import { UI } from "./ui";

const TOP_HELP_TEXT = `
ai-eng - AI Engineering System CLI

USAGE:
  ai-eng <command> [options]
  ai-eng "prompt" [options]          # Shortcut: defaults to 'ralph'

COMMANDS:
  version                            # Print the installed version
  init [options]                     # Initialize .ai-eng/config.yaml with defaults
  ralph <prompt|workflow> [options]  # Iteration loop runner
  workflow <command> [options]       # Run portable agent workflows
  install [options]                  # Install OpenCode, Cursor, Gemini, or Pi assets
  clean [options]                    # Remove ai-eng-managed install artifacts
  reinstall [options]                # Clean then install (upgrade shortcut)

GLOBAL OPTIONS:
  -h, --help                         Show this help message
  -v, --verbose                      Verbose output (DEBUG level logs)
  -V, --version                      Print the installed version

EXAMPLES:
  ai-eng init                    # Initialize config with defaults
  ai-eng init --interactive       # Interactive config setup
  ai-eng "implement user authentication"
  ai-eng ralph "fix bug" --print-logs --log-level DEBUG
  ai-eng install --scope project
  ai-eng reinstall --platform cursor
  ai-eng clean --platform gemini --scope global
  ai-eng ralph feature-spec.yml --max-iters 5
  ai-eng workflow list
  ai-eng workflow run research --runtime cursor "question"
  ai-eng workflow run research --runtime pi --agent reviewer --templates A1,M2 "SDK runner design"
  ai-eng ralph --tui --resume
  ai-eng ralph "make fleettools usable" --ship --max-cycles 30
  ai-eng ralph "make fleettools usable" --draft --max-cycles 10 --ci
`;

const COMMANDS = [
    initCommand,
    installCommand,
    cleanCommand,
    reinstallCommand,
    ralphCommand,
    workflowCommand,
];

function resolveCommand(name: string) {
    for (const cmd of COMMANDS) {
        if (cmd.name === name || cmd.aliases?.includes(name)) {
            return cmd;
        }
    }
    return undefined;
}

function printVersion(): void {
    let version: string | undefined;
    let dir = dirname(process.argv[1]);
    for (let i = 0; i < 5; i++) {
        try {
            const pkg = JSON.parse(
                readFileSync(join(dir, "package.json"), "utf8"),
            );
            if (pkg.name === "@ai-eng-system/cli" && pkg.version) {
                version = pkg.version;
                break;
            }
        } catch (e) {
            if (
                !(
                    e instanceof Error &&
                    (e as NodeJS.ErrnoException).code === "ENOENT"
                )
            ) {
                throw e;
            }
        }
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    console.log(version ? `ai-eng v${version}` : "ai-eng (version unknown)");
}

async function main() {
    try {
        const rawArgs = process.argv.slice(2);

        if (
            rawArgs.length === 0 ||
            rawArgs[0] === "--help" ||
            rawArgs[0] === "-h"
        ) {
            console.log(TOP_HELP_TEXT);
            process.exit(0);
        }

        // Handle --version/-V at top level
        if (
            rawArgs[0] === "version" ||
            rawArgs.includes("--version") ||
            rawArgs.includes("-V")
        ) {
            printVersion();
            process.exit(0);
        }

        const subcommand = rawArgs[0];
        const subcommandArgs = rawArgs.slice(1);

        const cmd = resolveCommand(subcommand);

        if (cmd) {
            await cmd.run(subcommandArgs);
        } else {
            // Default to ralph: treat the subcommand as the prompt/workflow
            await ralphCommand.run(rawArgs);
        }
    } catch (error) {
        UI.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

export { main as runMain };
