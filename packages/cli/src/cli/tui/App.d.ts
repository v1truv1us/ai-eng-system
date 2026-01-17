/**
 * TUI for ai-eng ralph command
 *
 * Simple terminal UI using OpenTUI core API directly.
 */
import type { RalphFlags } from "../../cli/flags";
import type { AiEngConfig } from "../../config/schema";
/**
 * Launch TUI
 */
export declare function launchTui(config: AiEngConfig, flags: RalphFlags): Promise<void>;
export default launchTui;
