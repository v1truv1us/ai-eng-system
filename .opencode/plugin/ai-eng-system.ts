/**
 * OpenCode Plugin for AI Engineering System
 * Minimal plugin for fast startup - delegates to command/agent files
 */

export const aiEngSystem = async ({ project, client, $, directory, worktree }) => {
  return {
    // Plugin is loaded - commands and agents are auto-discovered
    // from .opencode/command/ai-eng/ and .opencode/agent/ai-eng/
  };
};