/**
 * Shared argument parser for workflow runners.
 *
 * Replaces the 10+ hand-rolled argv loops across research-runner
 * and seo-review-runner with one implementation.
 */

export interface ParsedArgs {
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Parse raw argv into positionals and known flags.
 *
 * @param argv       Raw arguments (e.g. process.argv.slice(2))
 * @param knownFlags Flag names that take a value (e.g. ["--templates", "--agent"])
 * @returns Parsed positionals and flags
 *
 * @example
 * parseArgs(["--templates", "A1,M2", "--agent", "reviewer", "my query"], ["--templates", "--agent"])
 * // => { positionals: ["my query"], flags: { "--templates": "A1,M2", "--agent": "reviewer" } }
 */
export function parseArgs(
  argv: string[],
  knownFlags: string[],
): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === undefined) continue;

    if (knownFlags.includes(arg)) {
      const next = argv[++i];
      flags[arg] = next ?? "";
    } else if (arg.startsWith("--")) {
      // Unknown boolean-style flag (no value)
      flags[arg] = true;
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags };
}
