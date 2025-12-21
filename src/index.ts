import type { Plugin } from "@opencode-ai/plugin";

/**
 * AI Engineering System OpenCode Plugin
 *
 * This minimal plugin allows npm-based loading of ai-eng-system package.
 * Commands and agents are provided by installed filesystem components
 * in ~/.config/opencode/command/ai-eng/ and ~/.config/opencode/agent/ai-eng/
 */
export const AiEngSystem: Plugin = async ({
    project,
    client,
    $,
    directory,
    worktree,
}) => {
    return {
        // do we need any plugin-level hooks here? at some point? Custom compact possible?
    };
};
