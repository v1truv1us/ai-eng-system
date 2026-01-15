#!/usr/bin/env bun
/**
 * CLI entry point for ai-eng ralph runner
 */

import { parseArgs } from "node:util";
import { loadConfig } from "../config/loadConfig.js";
import { Log } from "../util/log.js";
import type { LogLevel, RalphFlags } from "./flags.js";
import { runCli } from "./run-cli.js";
import { launchTui } from "./tui/App.js";
import { UI } from "./ui.js";

const HELP_TEXT = `
ai-eng ralph - Iteration loop runner for ai-eng-system

USAGE:
  ai-eng [prompt] [options]
  ai-eng [workflow.yml] [options]

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
  --max-cycles <n>    Maximum loop cycles (default: 50)
  --stuck-threshold <n> Abort after N cycles with no progress (default: 5)
  --checkpoint <n>    Save checkpoint every N cycles (default: 1)
  --debug-work        Print every tool invocation input/output to console and logs

  --help              Show this help message

EXAMPLES:
  ai-eng "implement user authentication"
  ai-eng feature-spec.yml --max-iters 5
  ai-eng "fix the bug" --print-logs --log-level DEBUG
  ai-eng --tui --resume
  ai-eng "make fleettools usable" --ship --max-cycles 30
  ai-eng "make fleettools usable" --draft --max-cycles 10 --ci
  ai-eng --no-loop "single-shot task"
`;

async function main() {
    try {
        const { values, positionals } = parseArgs({
            args: process.argv.slice(2),
            options: {
                "max-iters": { type: "string" },
                gates: { type: "string" },
                review: { type: "string" },
                resume: { type: "boolean" },
                "run-id": { type: "string" },
                "dry-run": { type: "boolean" },
                ci: { type: "boolean" },
                help: { type: "boolean" },
                // NEW FLAGS
                "print-logs": { type: "boolean" },
                "log-level": { type: "string" },
                verbose: { type: "boolean", short: "v" },
                tui: { type: "boolean" },
                "no-stream": { type: "boolean" },
                // Loop mode flags
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

        // Parse flags
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
            // NEW
            printLogs: values["print-logs"],
            logLevel:
                (values["log-level"] as LogLevel) ??
                (values.verbose ? "DEBUG" : undefined),
            verbose: values.verbose,
            tui: values.tui,
            noStream: values["no-stream"],
            // Loop mode flags (default: loop enabled)
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

        // Show help
        if (flags.help) {
            console.log(HELP_TEXT);
            process.exit(0);
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

        // Choose mode: TUI or CLI
        if (flags.tui) {
            UI.info("Launching TUI mode...");
            await launchTui(config, flags);
        } else {
            await runCli(config, flags);
        }
    } catch (error) {
        UI.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
