/**
 * CLI entry point for daily-brief-sdk. Currently skeletal — the workflow
 * dispatch lands in B2 (tomorrow), B5 (Bitbucket/Grafana/calendar), and
 * B6 (morning, week-ahead, dream-digest).
 *
 * Today the CLI accepts:
 *   --version    print package version + exit
 *   --help       brief usage + exit
 *
 * Future commands (Phase B2+):
 *   tomorrow [--no-email] [--dry-run]
 *   morning [--no-email] [--dry-run]
 *   week-ahead [--no-email] [--dry-run]
 *   dream-digest [--no-email] [--dry-run]
 */

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
            "  tomorrow         (Phase B2 — not yet implemented)",
            "  morning          (Phase B6 — not yet implemented)",
            "  week-ahead       (Phase B6 — not yet implemented)",
            "  dream-digest     (Phase B6 — not yet implemented)",
            "",
            "Options:",
            "  --version    Print version and exit",
            "  --help       Print this help and exit",
            "",
        ].join("\n"),
    );
}

function main(argv: string[]): number {
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
    process.stderr.write(
        `daily-brief-sdk: command "${cmd}" not yet implemented (see Phase B2+).\n`,
    );
    return 2;
}

const code = main(process.argv);
process.exit(code);
