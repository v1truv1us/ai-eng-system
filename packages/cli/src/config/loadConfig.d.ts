/**
 * Configuration Loader for ai-eng ralph
 */
import type { RalphFlags } from "../cli/flags";
import type { AiEngConfig } from "./schema";
/**
 * Load configuration from .ai-eng/config.yaml
 */
export declare function loadConfig(flags: RalphFlags): Promise<AiEngConfig>;
