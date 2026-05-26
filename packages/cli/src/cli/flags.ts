/**
 * CLI Flag Types for ai-eng ralph
 *
 * Re-exports from types/domain.ts to maintain backward compatibility.
 * New code should import directly from "../types/domain" or "../types".
 */

export type { LogLevel, RalphFlags } from "../types/domain.js";

export interface InstallFlags {
    scope?: "project" | "global" | "auto";
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
    help?: boolean;
}

export interface InitFlags {
    interactive?: boolean;
    overwrite?: boolean;
    help?: boolean;
    verbose?: boolean;
}
