/**
 * Subcommand contract for ai-eng CLI.
 */

export interface Subcommand {
    name: string;
    aliases?: string[];
    helpText: string;
    run(args: string[]): Promise<void>;
}
