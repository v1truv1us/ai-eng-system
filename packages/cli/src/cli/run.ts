#!/usr/bin/env node
/**
 * CLI entry point for ai-eng-system
 *
 * Dispatcher that routes to subcommands:
 *   - ai-eng ralph ...     : Iteration loop runner (default behavior)
 *   - ai-eng install      : Install OpenCode/Claude assets
 *   - ai-eng "prompt"     : Defaults to ralph (shortcut)
 */

import { parseArgs } from "node:util";
import { loadConfig } from "../config/loadConfig";
import { Log } from "../util/log";
import type { LogLevel, RalphFlags } from "./flags";
import { runCli } from "./run-cli";
import { UI } from "./ui";

// TUI is loaded dynamically to avoid bundling issues
// import { launchTui } from "./tui/App";

const TOP_HELP_TEXT = `
ai-eng - AI Engineering System CLI

USAGE:
  ai-eng <command> [options]
  ai-eng "prompt" [options]          # Shortcut: defaults to 'ralph'

COMMANDS:
  init [options]                     # Initialize .ai-eng/config.yaml with defaults
  ralph <prompt|workflow> [options]  # Iteration loop runner
  install [options]                  # Install OpenCode/Claude assets

GLOBAL OPTIONS:
  -h, --help                         Show this help message
  -v, --verbose                      Verbose output (DEBUG level logs)

EXAMPLES:
  ai-eng init                    # Initialize config with defaults
  ai-eng init --interactive       # Interactive config setup
  ai-eng "implement user authentication"
  ai-eng ralph "fix bug" --print-logs --log-level DEBUG
  ai-eng install --scope project
  ai-eng ralph feature-spec.yml --max-iters 5
  ai-eng ralph --tui --resume
  ai-eng ralph "make fleettools usable" --ship --max-cycles 30
  ai-eng ralph "make fleettools usable" --draft --max-cycles 10 --ci
`;

const INIT_HELP_TEXT = `
ai-eng init - Initialize .ai-eng/config.yaml with defaults

USAGE:
  ai-eng init [options]

OPTIONS:
  -i, --interactive    Interactive configuration setup
  --overwrite           Overwrite existing config file
  -h, --help          Show this help message
  -v, --verbose         Verbose output

EXAMPLES:
  ai-eng init                    # Create config with defaults
  ai-eng init --interactive       # Interactive setup with prompts
  ai-eng init --overwrite          # Replace existing config
`;

const INSTALL_HELP_TEXT = `
ai-eng install - Install OpenCode/Claude assets

USAGE:
  ai-eng install [options]

OPTIONS:
  --scope project|global|auto        Where to install (default: auto-detect)
  --dry-run                          Show what would be done without writing
  --yes                              Skip confirmation prompts
  -v, --verbose                      Verbose output

EXAMPLES:
  ai-eng install                          # Auto-detect project vs global
  ai-eng install --scope project          # Install to project .opencode/
  ai-eng install --scope global           # Install to ~/.config/opencode/
  ai-eng install --dry-run                # Preview operations
`;

const RALPH_HELP_TEXT = `
ai-eng ralph - Iteration loop runner for ai-eng-system

USAGE:
  ai-eng ralph <prompt|workflow> [options]

POSITIONAL:
  prompt/workflow    Task prompt or path to workflow specification

OPTIONS:
  --max-iters <n>     Maximum iterations (default: from config)
  --gates <g1,g2>     Comma-separated list of quality gates
  --review <mode>     Review mode: none|opencode|anthropic|both
  --resume            Resume previous run
  --run-id <id>       Specific run ID to resume
  --dry-run           Show what would be done without executing
  --ci                Run in CI mode (no interactive prompts)

  --print-logs        Print detailed logs to stderr
  --log-level <lvl>   Log level: DEBUG|INFO|WARN|ERROR (default: INFO)
  -v, --verbose       Verbose output (same as --log-level DEBUG)
  --tui               Use TUI mode instead of CLI
  --no-stream         Disable streaming output (buffered mode)

  --no-loop           Run single iteration only (disable loop mode)
  --completion <tok>  Loop exit token (required, e.g., --completion "<promise>DONE</promise>")
  --ship              Auto-exit when agent outputs "<promise>SHIP</promise>"
  --draft             Run for max-cycles then stop for your review (default behavior)
  --max-cycles <n>    Maximum loop cycles (default: 10)
  --stuck-threshold <n> Abort after N cycles with no progress (default: 5)
  --checkpoint <n>    Save checkpoint every N cycles (default: 1)
  --debug-work        Print every tool invocation input/output to console and logs

  --help              Show this help message

EXAMPLES:
  ai-eng ralph "implement user authentication"
  ai-eng ralph feature-spec.yml --max-iters 5
  ai-eng ralph "fix the bug" --print-logs --log-level DEBUG
  ai-eng ralph --tui --resume
  ai-eng ralph "make fleettools usable" --ship --max-cycles 30
  ai-eng ralph "make fleettools usable" --draft --max-cycles 10 --ci
  ai-eng ralph --no-loop "single-shot task"
`;

interface InstallFlags {
    scope?: "project" | "global" | "auto";
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
    help?: boolean;
}

interface InitFlags {
    interactive?: boolean;
    overwrite?: boolean;
    help?: boolean;
    verbose?: boolean;
}

/**
 * Handle the 'init' subcommand
 */
async function runInit(args: string[]): Promise<void> {
    const { values, positionals } = parseArgs({
        args,
        options: {
            interactive: { type: "boolean", short: "i" },
            overwrite: { type: "boolean" },
            help: { type: "boolean" },
            verbose: { type: "boolean", short: "v" },
        },
        allowPositionals: true,
    });

    const flags: InitFlags = {
        interactive: values.interactive,
        overwrite: values.overwrite,
        help: values.help,
        verbose: values.verbose,
    };

    if (flags.help) {
        console.log(INIT_HELP_TEXT);
        return;
    }

    await Log.init({
        print: false,
        level: flags.verbose ? "DEBUG" : "INFO",
        logDir: ".ai-eng/logs",
    });

    const { initConfig } = await import("../install/init");
    await initConfig(flags);
}

/**
 * Handle the 'install' subcommand
 */
async function runInstall(args: string[]): Promise<void> {
    const { values, positionals } = parseArgs({
        args,
        options: {
            scope: { type: "string" },
            "dry-run": { type: "boolean" },
            yes: { type: "boolean" },
            verbose: { type: "boolean", short: "v" },
            help: { type: "boolean" },
        },
        allowPositionals: true,
    });

    const flags: InstallFlags = {
        scope: values.scope as InstallFlags["scope"],
        dryRun: values["dry-run"],
        yes: values.yes,
        verbose: values.verbose,
        help: values.help,
    };

    if (flags.help) {
        console.log(INSTALL_HELP_TEXT);
        return;
    }

    // Dynamic import to avoid circular dependencies and to allow install logic to be optional
    const { runInstaller } = await import("../install/install");
    await runInstaller(flags);
}

/**
 * Parse Ralph flags from raw argv
 */
function parseRalphFlags(args: string[]): {
    flags: RalphFlags;
    remaining: string[];
} {
    const { values, positionals } = parseArgs({
        args,
        options: {
            "max-iters": { type: "string" },
            gates: { type: "string" },
            review: { type: "string" },
            resume: { type: "boolean" },
            "run-id": { type: "string" },
            "dry-run": { type: "boolean" },
            ci: { type: "boolean" },
            help: { type: "boolean" },
            "print-logs": { type: "boolean" },
            "log-level": { type: "string" },
            verbose: { type: "boolean", short: "v" },
            tui: { type: "boolean" },
            "no-stream": { type: "boolean" },
            "no-loop": { type: "boolean" },
            completion: { type: "string" },
            ship: { type: "boolean" },
            draft: { type: "boolean" },
            "max-cycles": { type: "string" },
            "stuck-threshold": { type: "string" },
            checkpoint: { type: "string" },
            "debug-work": { type: "boolean" },
        },
        allowPositionals: true,
    });

    const flags: RalphFlags = {
        workflow: positionals[0],
        maxIters: values["max-iters"]
            ? Number.parseInt(values["max-iters"])
            : undefined,
        gates: values.gates
            ? values.gates.split(",").map((g) => g.trim())
            : undefined,
        review: values.review as RalphFlags["review"],
        resume: values.resume,
        runId: values["run-id"],
        dryRun: values["dry-run"],
        ci: values.ci,
        help: values.help,
        printLogs: values["print-logs"],
        logLevel:
            (values["log-level"] as LogLevel) ??
            (values.verbose ? "DEBUG" : undefined),
        verbose: values.verbose,
        tui: values.tui,
        noStream: values["no-stream"],
        loop: !values["no-loop"],
        noLoop: values["no-loop"],
        completionPromise: values.completion,
        ship: values.ship,
        draft: values.draft,
        maxCycles: values["max-cycles"]
            ? Number.parseInt(values["max-cycles"])
            : undefined,
        stuckThreshold: values["stuck-threshold"]
            ? Number.parseInt(values["stuck-threshold"])
            : undefined,
        checkpointFrequency: values.checkpoint
            ? Number.parseInt(values.checkpoint)
            : undefined,
        debugWork: values["debug-work"],
    };

    // Return the flags plus the remaining positionals (for future extensibility)
    return { flags, remaining: positionals.slice(1) };
}

/**
 * Run the Ralph CLI
 */
async function runRalph(args: string[]): Promise<void> {
    const { flags } = parseRalphFlags(args);

    // Show help
    if (flags.help) {
        console.log(RALPH_HELP_TEXT);
        return;
    }

    // Initialize logging
    await Log.init({
        print: flags.printLogs ?? false,
        level: flags.logLevel ?? "INFO",
        logDir: ".ai-eng/logs",
    });

    Log.Default.info("ai-eng ralph starting", {
        flags: JSON.stringify(flags),
    });

    // Load config
    const config = await loadConfig(flags);

    // TUI mode requires dynamic import - for now, show info and fall back to CLI
    if (flags.tui) {
        UI.info("TUI mode requested - falling back to CLI mode");
        UI.info("(TUI requires: bun run --watch or full TUI setup)");
    }
    await runCli(config, flags);
}

async function main() {
    try {
        // Get raw args (everything after the program name)
        const rawArgs = process.argv.slice(2);

        // Handle no arguments
        if (
            rawArgs.length === 0 ||
            rawArgs[0] === "--help" ||
            rawArgs[0] === "-h"
        ) {
            console.log(TOP_HELP_TEXT);
            process.exit(0);
        }

        const subcommand = rawArgs[0];
        const subcommandArgs = rawArgs.slice(1);

        // Route to subcommand
        switch (subcommand) {
            case "init":
                await runInit(subcommandArgs);
                break;

            case "install":
            case "i":
                await runInstall(subcommandArgs);
                break;

            case "ralph":
            case "r":
                await runRalph(subcommandArgs);
                break;

            case "--help":
            case "-h":
                console.log(TOP_HELP_TEXT);
                break;

            default:
                // Default to ralph: treat the subcommand as the prompt/workflow
                // and pass the entire original args to ralph
                await runRalph(rawArgs);
                break;
        }
    } catch (error) {
        UI.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Export main for use as a module
export { main as runMain };

// Note: The CLI shim (dist/cli/run.js) handles direct execution.
// This file should only be run via import from the shim.
