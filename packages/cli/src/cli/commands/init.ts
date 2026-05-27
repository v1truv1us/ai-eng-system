/**
 * init subcommand — Initialize .ai-eng/config.yaml with defaults.
 */

import { parseArgs } from "node:util";
import { Log } from "../../util/log";
import type { Subcommand } from "./types";

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

interface InitFlags {
    interactive?: boolean;
    overwrite?: boolean;
    help?: boolean;
    verbose?: boolean;
}

async function runInit(args: string[]): Promise<void> {
    const { values } = parseArgs({
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

    const { initConfig } = await import("../../install/init");
    await initConfig(flags);
}

export const initCommand: Subcommand = {
    name: "init",
    helpText: INIT_HELP_TEXT,
    run: runInit,
};
