import type { Plugin } from "@opencode-ai/plugin";
/**
 * AI Engineering System OpenCode Plugin
 *
 * When loaded, this plugin automatically detects installation location and installs:
 * - Commands to ~/.config/opencode/command/ai-eng/ (global) or .opencode/command/ai-eng/ (project)
 * - Agents to ~/.config/opencode/agent/ai-eng/ (global) or .opencode/agent/ai-eng/ (project)
 * - Skills to ~/.config/opencode/skill/ (global) or .opencode/skill/ (project)
 *
 * Installation location is determined by checking which opencode.jsonc references "ai-eng-system":
 * - Global config (~/.config/opencode/opencode.jsonc) takes precedence
 * - Project config ({project}/.opencode/opencode.jsonc) is fallback
 *
 * All files are copied from core package content to the target directory.
 *
 * Plugin format follows OpenCode docs: https://opencode.ai/docs/plugins
 */
export declare const AiEngSystem: Plugin;
export default AiEngSystem;
