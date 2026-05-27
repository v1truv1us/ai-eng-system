#!/usr/bin/env node
/**
 * CLI entry point for ai-eng-system
 *
 * Dispatcher that routes to subcommands:
 *   - ai-eng ralph ...     : Iteration loop runner (default behavior)
 *   - ai-eng install      : Install OpenCode/Claude assets
 *   - ai-eng "prompt"     : Defaults to ralph (shortcut)
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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
  ai-eng workflow run research --runtime pi --agent reviewer "question"
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

Cursor and Pi load Agent Skills from .agents/skills/ (project) and
~/.agents/skills/ (global). Global Cursor installs the full plugin under
~/.cursor/plugins/local/ai-eng-system/. Global pi installs skills only.

Requires @ai-eng-system/toolkit for cursor, gemini, and pi.
`;

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

const WORKFLOW_HELP_TEXT = `
ai-eng workflow - Run portable agent workflows

USAGE:
  ai-eng workflow list
  ai-eng workflow run <workflow> [options] "goal"

WORKFLOWS:
  research            Run the research template workflow
  seo-review          Review a URL for SEO, performance, and accessibility issues

OPTIONS:
  --runtime <name>    Runtime: anthropic|codex|cursor|opencode|pi (default: pi)
  --agent <name>      Optional agent/persona/instruction passed to the runner
  --templates <ids>   Research template IDs, comma-separated (for research)
  --dry-run           Print the runner command without executing
  -h, --help          Show this help message

EXAMPLES:
  ai-eng workflow list
  ai-eng workflow run research --runtime cursor "How should we expose runners?"
  ai-eng workflow run research --runtime pi --agent reviewer --templates A1,M2 "SDK runner design"
  ai-eng workflow run seo-review --runtime anthropic "https://example.com"
  ai-eng workflow run seo-review --runtime pi --agent technical-seo "https://example.com"
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

import type { InstallFlags } from "../install/types";
import type { CleanFlags } from "../install/types";

interface InitFlags {
    interactive?: boolean;
    overwrite?: boolean;
    help?: boolean;
    verbose?: boolean;
}

type WorkflowRuntime = "anthropic" | "codex" | "cursor" | "opencode" | "pi";

const WORKFLOWS = {
    research: {
        description: "Run research templates and write a dated brief",
        runnerDir: "research-runner",
        runtimes: ["anthropic", "codex", "cursor", "opencode", "pi"] as WorkflowRuntime[],
    },
    "seo-review": {
        description: "Review a URL for SEO, performance, and accessibility issues",
        runnerDir: "seo-review-runner",
        runtimes: ["anthropic", "codex", "cursor", "opencode", "pi"] as WorkflowRuntime[],
    },
} as const;

function findRepoRoot(startDir: string): string {
    let dir = startDir;
    for (let i = 0; i < 8; i++) {
        if (existsSync(join(dir, "agents", "research-runner"))) return dir;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return process.cwd();
}

function printWorkflowList(): void {
    console.log("Available workflows:");
    for (const [name, workflow] of Object.entries(WORKFLOWS)) {
        console.log(`  ${name.padEnd(12)} ${workflow.description}`);
        console.log(`              runtimes: ${workflow.runtimes.join(", ")}`);
    }
}

async function runWorkflow(args: string[]): Promise<void> {
    const action = args[0];
    if (!action || action === "--help" || action === "-h") {
        console.log(WORKFLOW_HELP_TEXT);
        return;
    }

    if (action === "list") {
        printWorkflowList();
        return;
    }

    if (action !== "run") {
        throw new Error(`Unknown workflow command "${action}". Use: ai-eng workflow list|run`);
    }

    const { values, positionals } = parseArgs({
        args: args.slice(1),
        options: {
            runtime: { type: "string" },
            agent: { type: "string" },
            templates: { type: "string" },
            "dry-run": { type: "boolean" },
            help: { type: "boolean", short: "h" },
        },
        allowPositionals: true,
    });

    if (values.help) {
        console.log(WORKFLOW_HELP_TEXT);
        return;
    }

    const workflowName = positionals[0] as keyof typeof WORKFLOWS | undefined;
    if (!workflowName || !(workflowName in WORKFLOWS)) {
        throw new Error(`Unknown workflow "${workflowName ?? ""}". Use: ai-eng workflow list`);
    }

    const runtime = (values.runtime ?? "pi") as WorkflowRuntime;
    if (!WORKFLOWS[workflowName].runtimes.includes(runtime)) {
        throw new Error(
            `Runtime "${runtime}" is not available for ${workflowName}. Use: ${WORKFLOWS[workflowName].runtimes.join(", ")}`,
        );
    }

    const goal = positionals.slice(1).join(" ").trim();
    if (!goal) {
        throw new Error(`Missing workflow goal. Example: ai-eng workflow run ${workflowName} --runtime ${runtime} "question"`);
    }

    const repoRoot = findRepoRoot(process.cwd());
    const runnerDir = join(repoRoot, "agents", WORKFLOWS[workflowName].runnerDir, runtime);
    const runnerPath = join(runnerDir, "runner.ts");
    if (!existsSync(runnerPath)) {
        throw new Error(`Missing runner: ${runnerPath}`);
    }

    const runnerArgs = ["tsx", "runner.ts"];
    if (values.templates) runnerArgs.push("--templates", values.templates);
    if (values.agent) runnerArgs.push("--agent", values.agent);
    runnerArgs.push(goal);

    if (values["dry-run"]) {
        console.log(`cd ${runnerDir}`);
        console.log(`npx ${runnerArgs.map((arg) => JSON.stringify(arg)).join(" ")}`);
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const child = spawn("npx", runnerArgs, {
            cwd: runnerDir,
            stdio: "inherit",
            env: {
                ...process.env,
                AI_ENG_WORKFLOW: workflowName,
                AI_ENG_RUNTIME: runtime,
                ...(values.agent ? { AI_ENG_AGENT: values.agent } : {}),
            },
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Workflow ${workflowName} failed with exit code ${code ?? "unknown"}`));
        });
    });
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

interface InstallCommandFlags extends InstallFlags {
    help?: boolean;
}

interface CleanCommandFlags extends CleanFlags {
    help?: boolean;
}

function parsePlatformArg(
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

/**
 * Handle the 'install' subcommand
 */
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

    const { runInstaller } = await import("../install/install");
    await runInstaller(flags);
}

/**
 * Handle the 'clean' subcommand
 */
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

    const { runCleaner } = await import("../install/clean");
    const { resolveInstallScope } = await import("../install/install");
    await runCleaner(flags, (projectDir) =>
        resolveInstallScope({ scope: flags.scope }, projectDir),
    );
}

/**
 * Handle the 'reinstall' subcommand
 */
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

    const { runCleaner } = await import("../install/clean");
    const { runInstaller, resolveInstallScope } = await import("../install/install");

    await runCleaner(cleanFlags, (projectDir) =>
        resolveInstallScope({ scope: cleanFlags.scope }, projectDir),
    );

    if (!values["dry-run"]) {
        console.log("");
    }

    await runInstaller(installFlags);
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

        // Handle --version/-V at top level (before subcommand routing)
        if (subcommand === "version" || rawArgs.includes("--version") || rawArgs.includes("-V")) {
            let version: string | undefined;
            let dir = dirname(process.argv[1]);
            for (let i = 0; i < 5; i++) {
                try {
                    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
                    if (pkg.name === "@ai-eng-system/cli" && pkg.version) {
                        version = pkg.version;
                        break;
                    }
                } catch (e) {
                    // Only ignore ENOENT (file not found) — re-throw EACCES, EMFILE, etc.
                    if (!(e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT")) {
                        throw e;
                    }
                }
                const parent = dirname(dir);
                if (parent === dir) break;
                dir = parent;
            }
            console.log(version ? `ai-eng v${version}` : "ai-eng (version unknown)");
            process.exit(0);
        }

        // Route to subcommand
        switch (subcommand) {

            case "init":
                await runInit(subcommandArgs);
                break;

            case "install":
            case "i":
                await runInstall(subcommandArgs);
                break;

            case "clean":
                await runClean(subcommandArgs);
                break;

            case "reinstall":
                await runReinstall(subcommandArgs);
                break;

            case "ralph":
            case "r":
                await runRalph(subcommandArgs);
                break;

            case "workflow":
            case "wf":
                await runWorkflow(subcommandArgs);
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
