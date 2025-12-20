/**
 * OpenCode Plugin for AI Engineering System
 *
 * IMPORTANT: This file is SOURCE (checked in). The build copies it to dist/.opencode/plugin/.
 *
 * This plugin is intentionally minimal: commands and agents are provided by
 * markdown config under .opencode/command and .opencode/agent (built output),
 * and this plugin mostly exists as a stable entrypoint.
 *
 * If you want a single-file plugin that lazy-loads prompts from content/, you
 * can extend this later. For now, prefer the markdown-defined commands/agents.
 */

export const aiEngSystem = async () => {
  return {}
}
