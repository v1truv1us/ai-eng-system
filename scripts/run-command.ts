#!/usr/bin/env node
/**
 * AI-Eng System Command Runner
 *
 * This script parses command options and invokes the appropriate command.
 * It bridges OpenCode/Claude Code commands to the actual ai-eng-system CLI.
 */

import { parseArgs, type ParsedOptions } from "./parse-command-options.js";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMAND_MAP: Record<string, string> = {
    research: "ai-eng-research",
    specify: "ai-eng-specify",
    plan: "ai-eng-plan",
    work: "ai-eng-work",
    review: "ai-eng-review",
    optimize: "ai-eng-optimize",
    clean: "ai-eng-clean",
    seo: "ai-eng-seo",
    deploy: "ai-eng-deploy",
    compound: "ai-eng-compound",
    context: "ai-eng-context",
    "recursive-init": "ai-eng-recursive-init",
    "create-plugin": "ai-eng-create-plugin",
    "create-agent": "ai-eng-create-agent",
    "create-command": "ai-eng-create-command",
    "create-skill": "ai-eng-create-skill",
    "create-tool": "ai-eng-create-tool",
};

async function runResearchCommand(
    parsed: ParsedOptions,
    projectRoot: string,
): Promise<void> {
    const { options } = parsed;

    const cliArgs: string[] = [];

    if (options.scope) {
        cliArgs.push("--scope", options.scope);
    }
    if (options.depth) {
        cliArgs.push("--depth", options.depth);
    }
    if (options.output) {
        cliArgs.push("--output", options.output);
    }
    if (options.format) {
        cliArgs.push("--format", options.format);
    }
    if (options.noCache) {
        cliArgs.push("--no-cache");
    }
    if (options.verbose) {
        cliArgs.push("--verbose");
    }
    if (options.feedInto) {
        cliArgs.push("--feed-into", options.feedInto);
    }

    console.log("Running research command with options:", {
        query: parsed.query,
        options: {
            scope: options.scope,
            depth: options.depth,
            output: options.output,
            format: options.format,
            noCache: options.noCache,
            feedInto: options.feedInto,
            verbose: options.verbose,
            swarm: options.swarm,
        },
    });

    if (options.swarm) {
        console.log("Using Swarms multi-agent orchestration...");
        console.log(
            "(Swarms executor not yet implemented, using standard executor)",
        );
    }

    const quotedArgs = cliArgs.map((a) => JSON.stringify(a));
    quotedArgs.push(JSON.stringify(parsed.query));
    const command = ["run", "src/cli.ts", "research", ...quotedArgs];

    console.log(`Executing: bun ${command.join(" ")}`);

    try {
        const result = spawnSync("bun", command, {
            cwd: projectRoot,
            stdio: "inherit",
        });

        if (result.status !== 0) {
            throw new Error(
                `Research command failed with exit code ${result.status}`,
            );
        }
    } catch (error) {
        console.error("Research command failed:", error);
        throw error;
    }
}

async function handleFeedInto(
    parsed: ParsedOptions,
    projectRoot: string,
): Promise<void> {
    const feedInto = parsed.options.feedInto;

    if (!feedInto) {
        return;
    }

    console.log(
        `\nFeed-into: Running ${feedInto} command with research context...`,
    );

    const researchDir = join(projectRoot, "docs", "research");
    const latestResearch = findLatestResearchDoc(researchDir);

    if (!latestResearch) {
        console.warn("No research document found for feed-into");
        return;
    }

    console.log(`Using research document: ${latestResearch}`);

    const nextArgs = [`--from-research=${JSON.stringify(latestResearch)}`];
    const command = [
        "run",
        "scripts/run-command.ts",
        feedInto,
        "",
        ...nextArgs,
    ];
    const commandScript = `bun ${command.join(" ")}`;

    console.log(`Executing: ${commandScript}`);

    try {
        const result = spawnSync("bun", command, {
            cwd: projectRoot,
            stdio: "inherit",
        });

        if (result.status !== 0) {
            throw new Error(
                `Feed-into command failed with exit code ${result.status}`,
            );
        }
    } catch (error) {
        console.error("Feed-into command failed:", error);
        throw error;
    }
}

function findLatestResearchDoc(dir: string): string | null {
    if (!existsSync(dir)) {
        return null;
    }

    let files: string[] = [];

    try {
        const entries = readdirSync(dir, { withFileTypes: true });
        files = entries
            .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
            .map((entry) => join(dir, entry.name));
    } catch {
        return null;
    }

    if (files.length === 0) {
        return null;
    }

    files.sort((a, b) => {
        try {
            const statsA = statSync(a);
            const statsB = statSync(b);
            return statsB.mtime.getTime() - statsA.mtime.getTime();
        } catch {
            return 0;
        }
    });

    return files[0];
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
        console.log(`
AI-Eng System Command Runner

Usage: node scripts/run-command.js <command> <query> [options]

Commands:
  research       - Multi-phase research orchestration
  specify        - Create feature specifications
  plan           - Create implementation plans
  work           - Execute plans with quality gates
  review         - Multi-agent code review
  optimize       - Prompt optimization
  clean          - Cleanup AI-generated verbosity
  seo            - SEO audit and optimization
  deploy         - Deployment commands
  compound       - Document solved problems

Options:
  --swarm              Use Swarms multi-agent orchestration
  -s, --scope <scope>  Scope (codebase|documentation|external|all)
  -d, --depth <depth>  Depth (shallow|medium|deep)
  -o, --output <file>  Output file path
  -f, --format <fmt>   Format (markdown|json|html)
  --no-cache           Disable caching
  --feed-into <cmd>    Feed results into next command
  -v, --verbose        Verbose output

Examples:
  node scripts/run-command.js research "authentication patterns"
  node scripts/run-command.js research "api design" --scope codebase --depth deep
  node scripts/run-command.js research "caching" --feed-into plan --verbose
`);
        process.exit(0);
    }

    const command = args[0];
    const queryArgs = args.slice(1);

    if (!Object.prototype.hasOwnProperty.call(COMMAND_MAP, command)) {
        console.error(`Unknown command: ${command}`);
        console.error(
            `Available commands: ${Object.keys(COMMAND_MAP).join(", ")}`,
        );
        process.exit(1);
    }

    const projectRoot = process.cwd();
    const packageJsonPath = join(projectRoot, "package.json");

    if (!existsSync(packageJsonPath)) {
        console.error("Error: Not in a valid project (no package.json found)");
        process.exit(1);
    }

    console.log("\nAI-Eng System Command Runner");
    console.log(`   Command: ${command}`);
    console.log(`   Project: ${projectRoot}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log("");

    try {
        const parsed = parseArgs(queryArgs);

        switch (command) {
            case "research": {
                await runResearchCommand(parsed, projectRoot);
                await handleFeedInto(parsed, projectRoot);
                break;
            }

            default: {
                console.log(
                    `Command '${command}' is not yet implemented in the runner.`,
                );
                console.log("Using legacy CLI for now...");
                const legacyCommand = [
                    "run",
                    "src/cli.ts",
                    command,
                    JSON.stringify(parsed.query),
                ];
                const commandStr = `bun ${legacyCommand.join(" ")}`;
                console.log(`Executing: ${commandStr}`);

                const result = spawnSync("bun", legacyCommand, {
                    cwd: projectRoot,
                    stdio: "inherit",
                });

                if (result.status !== 0) {
                    throw new Error(
                        `Command failed with exit code ${result.status}`,
                    );
                }
            }
        }

        console.log("\nCommand completed successfully");
    } catch (error) {
        console.error("\nCommand failed:", error);
        process.exit(1);
    }
}

export { runResearchCommand, handleFeedInto, parseArgs };

if (process.argv[1]?.includes("run-command")) {
    main().catch(console.error);
}
