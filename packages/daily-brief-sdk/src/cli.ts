/**
 * CLI entry point for daily-brief-sdk.
 *
 *   daily-brief tomorrow [--dry-run] [--no-email] [--user-nudge=<text>]
 *   daily-brief --version
 *   daily-brief --help
 *
 * For the smoke-test path (no real MCP, no real SMTP), the dispatcher
 * runs the workflow with mcpServers={} and transport=undefined. The SDK
 * itself still hits the real Claude API — that's the point.
 */

import { runTomorrow } from "./workflows/tomorrow.js";

const VERSION = "0.1.0";

function printVersion(): void {
    process.stdout.write(`daily-brief-sdk ${VERSION}\n`);
}

function printHelp(): void {
    process.stdout.write(
        [
            "Usage: daily-brief <command> [options]",
            "",
            "Commands:",
            "  tomorrow         Build a tomorrow brief",
            "  morning          (Phase B6 — not yet implemented)",
            "  week-ahead       (Phase B6 — not yet implemented)",
            "  dream-digest     (Phase B6 — not yet implemented)",
            "",
            "Options:",
            "  --dry-run        Render but don't write files or send email",
            "  --no-email       Write HTML but skip email send",
            "  --user-nudge=X   Optional free-text guidance passed to the agent",
            "  --version        Print version and exit",
            "  --help           Print this help and exit",
            "",
        ].join("\n"),
    );
}

interface ParsedFlags {
    dryRun: boolean;
    noEmail: boolean;
    userNudge?: string;
}

function parseFlags(args: string[]): ParsedFlags {
    const flags: ParsedFlags = {
        dryRun: args.includes("--dry-run"),
        noEmail: args.includes("--no-email"),
    };
    for (const arg of args) {
        if (arg.startsWith("--user-nudge=")) {
            flags.userNudge = arg.slice("--user-nudge=".length);
        }
    }
    return flags;
}

function todayIso(): string {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

async function dispatchTomorrow(flags: ParsedFlags): Promise<number> {
    process.stderr.write("daily-brief: running tomorrow workflow...\n");
    try {
        const result = await runTomorrow({
            forDate: todayIso(),
            sources: [],
            mcpServers: {},
            dryRun: flags.dryRun,
            transport: undefined,
            userNudge: flags.userNudge,
        });
        process.stdout.write(`HTML: ${result.htmlPath}\n`);
        process.stdout.write(
            `Telemetry: workflow=${result.telemetry.workflow} duration_ms=${result.telemetry.duration_ms} cost=$${result.telemetry.total_cost_usd.toFixed(4)} prompt_tokens=${result.telemetry.prompt_tokens} completion_tokens=${result.telemetry.completion_tokens}\n`,
        );
        return 0;
    } catch (error) {
        process.stderr.write(
            `daily-brief: tomorrow failed: ${error instanceof Error ? error.message : String(error)}\n`,
        );
        return 3;
    }
}

async function main(argv: string[]): Promise<number> {
    const [, , ...args] = argv;

    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        printHelp();
        return 0;
    }

    if (args.includes("--version") || args.includes("-v")) {
        printVersion();
        return 0;
    }

    const cmd = args[0];
    const flags = parseFlags(args.slice(1));

    switch (cmd) {
        case "tomorrow":
            return await dispatchTomorrow(flags);
        case "morning":
        case "week-ahead":
        case "dream-digest":
            process.stderr.write(
                `daily-brief-sdk: command "${cmd}" not yet implemented (see Phase B6).\n`,
            );
            return 2;
        default:
            process.stderr.write(`daily-brief-sdk: unknown command "${cmd}".\n`);
            return 2;
    }
}

const code = await main(process.argv);
process.exit(code);
