#!/usr/bin/env bun
/**
 * CLI entry point for ai-eng ralph runner
 */

import { parseArgs } from "node:util";
import type { RalphFlags } from "./flags.js";
import { loadConfig } from "../config/loadConfig.js";
import { launchTui } from "./tui/App.js";

const HELP_TEXT = `
ai-eng ralph - Iteration loop runner for ai-eng-system

USAGE:
  ai-eng [workflow] [options]

WORKFLOW:
  Path to workflow specification file or directory

OPTIONS:
  --max-iters <number>     Maximum iterations (default: from config)
  --gates <gate1,gate2>   Comma-separated list of quality gates
  --review <mode>          Review mode: none|opencode|anthropic|both
  --resume                 Resume previous run
  --run-id <id>           Specific run ID to resume
  --dry-run               Show what would be done without executing
  --ci                     Run in CI mode (no interactive prompts)
  --help                   Show this help message

EXAMPLES:
  ai-eng feature-spec.yml
  ai-eng --max-iters 5 --review both
  ai-eng --resume --run-id abc123
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
        };

        // Show help
        if (flags.help) {
            console.log(HELP_TEXT);
            process.exit(0);
        }

        // Load config
        const config = await loadConfig(flags);

        // Log parsed information
        console.log("🚀 ai-eng ralph runner");
        console.log("=".repeat(50));
        console.log("Parsed flags:", JSON.stringify(flags, null, 2));
        console.log("Config:", JSON.stringify(config, null, 2));

        // Launch TUI
        console.log("\n🚀 Launching TUI dashboard...");
        await launchTui(config, flags);
    } catch (error) {
        console.error(
            "❌ CLI error:",
            error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
    }
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
