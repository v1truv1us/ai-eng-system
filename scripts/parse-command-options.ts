#!/usr/bin/env node
/**
 * Command-line option parser for ai-eng commands.
 * Parses options from command arguments and outputs JSON for consumption.
 *
 * Usage:
 *   bun run scripts/parse-command-options.ts --swarm --scope codebase --depth deep --feed-into plan --verbose "my query"
 *
 * Output (JSON):
 *   {
 *     "query": "my query",
 *     "options": {
 *       "swarm": true,
 *       "scope": "codebase",
 *       "depth": "deep",
 *       "feedInto": "plan",
 *       "verbose": true
 *     }
 *   }
 */

interface ParsedOptions {
    query: string;
    options: {
        swarm?: boolean;
        scope?: string;
        depth?: string;
        output?: string;
        format?: string;
        noCache?: boolean;
        feedInto?: string;
        verbose?: boolean;
    };
    rawArgs: string[];
}

function parseArgs(args: string[]): ParsedOptions {
    const result: ParsedOptions = {
        query: "",
        options: {},
        rawArgs: args,
    };

    const positionalArgs: string[] = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const nextArg = args[i + 1];

            switch (key) {
                case "swarm":
                    result.options.swarm = true;
                    break;
                case "scope":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.scope = nextArg;
                        i++;
                    }
                    break;
                case "depth":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.depth = nextArg;
                        i++;
                    }
                    break;
                case "output":
                case "o":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.output = nextArg;
                        i++;
                    }
                    break;
                case "format":
                case "f":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.format = nextArg;
                        i++;
                    }
                    break;
                case "no-cache":
                case "noCache":
                    result.options.noCache = true;
                    break;
                case "feed-into":
                case "feedInto":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.feedInto = nextArg;
                        i++;
                    }
                    break;
                case "verbose":
                case "v":
                    result.options.verbose = true;
                    break;
                default:
                    // Unknown option, ignore
                    break;
            }
        } else if (arg.startsWith("-") && arg.length === 2) {
            // Short option (e.g., -s, -d)
            const nextArg = args[i + 1];
            const shortKey = arg.slice(1);

            switch (shortKey) {
                case "s":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.scope = nextArg;
                        i++;
                    }
                    break;
                case "d":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.depth = nextArg;
                        i++;
                    }
                    break;
                case "o":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.output = nextArg;
                        i++;
                    }
                    break;
                case "f":
                    if (nextArg && !nextArg.startsWith("--")) {
                        result.options.format = nextArg;
                        i++;
                    }
                    break;
                case "v":
                    result.options.verbose = true;
                    break;
                default:
                    break;
            }
        } else {
            // Positional argument (the query)
            positionalArgs.push(arg);
        }
    }

    // Join remaining positional args as the query
    result.query = positionalArgs.join(" ");

    return result;
}

// Main execution
if (process.argv[1]?.includes("parse-command-options")) {
    const args = process.argv.slice(2);

    // Handle --help
    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
ai-eng Command Option Parser

Usage: bun run scripts/parse-command-options.ts [options] <query>

Options:
  --swarm              Use Swarms multi-agent orchestration
  -s, --scope <scope>  Research scope (codebase|documentation|external|all)
  -d, --depth <depth>  Research depth (shallow|medium|deep)
  -o, --output <file>  Output file path
  -f, --format <format> Export format (markdown|json|html)
  --no-cache           Disable research caching
  --feed-into <cmd>    Feed results into specify|plan
  -v, --verbose        Enable verbose output
  --help, -h           Show this help message

Output: JSON with parsed query and options
`);
        process.exit(0);
    }

    const parsed = parseArgs(args);
    console.log(JSON.stringify(parsed, null, 2));
}

export { parseArgs, type ParsedOptions };
