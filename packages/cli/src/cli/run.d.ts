#!/usr/bin/env node
/**
 * CLI entry point for ai-eng-system
 *
 * Dispatcher that routes to subcommands:
 *   - ai-eng ralph ...     : Iteration loop runner (default behavior)
 *   - ai-eng install      : Install OpenCode/Claude assets
 *   - ai-eng "prompt"     : Defaults to ralph (shortcut)
 */
declare function main(): Promise<void>;
export { main as runMain };
