/**
 * ralph subcommand — Iteration loop runner.
 */

import { parseArgs as nodeParseArgs } from "node:util";
import { loadConfig } from "../../config/loadConfig";
import { Log } from "../../util/log";
import type { LogLevel, RalphFlags } from "../flags";
import { runCli } from "../run-cli";
import { UI } from "../ui";
import type { Subcommand } from "./types";

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

function parseRalphFlags(args: string[]): {
    flags: RalphFlags;
    remaining: string[];
} {
    const { values, positionals } = nodeParseArgs({
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

    return { flags, remaining: positionals.slice(1) };
}

async function runRalph(args: string[]): Promise<void> {
    const { flags } = parseRalphFlags(args);

    if (flags.help) {
        console.log(RALPH_HELP_TEXT);
        return;
    }

    await Log.init({
        print: flags.printLogs ?? false,
        level: flags.logLevel ?? "INFO",
        logDir: ".ai-eng/logs",
    });

    Log.Default.info("ai-eng ralph starting", {
        flags: JSON.stringify(flags),
    });

    const config = await loadConfig(flags);

    if (flags.tui) {
        UI.info("TUI mode requested - falling back to CLI mode");
        UI.info("(TUI requires: bun run --watch or full TUI setup)");
    }
    await runCli(config, flags);
}

export const ralphCommand: Subcommand = {
    name: "ralph",
    aliases: ["r"],
    helpText: RALPH_HELP_TEXT,
    run: runRalph,
};
