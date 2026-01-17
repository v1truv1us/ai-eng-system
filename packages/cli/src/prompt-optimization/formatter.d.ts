/**
 * Output Formatter
 *
 * Formats optimization output for different verbosity levels
 * (quiet, normal, verbose) with available actions.
 */
import type { FormattedOutput, OptimizationSession, Verbosity } from "./types";
/**
 * Format quiet mode (minimal output)
 */
export declare function formatQuiet(session: OptimizationSession): FormattedOutput;
/**
 * Format normal mode (condensed view)
 */
export declare function formatNormal(session: OptimizationSession): FormattedOutput;
/**
 * Format verbose mode (step-by-step)
 */
export declare function formatVerbose(session: OptimizationSession, currentStep?: number): FormattedOutput;
/**
 * Format final review (shows optimized prompt)
 */
export declare function formatFinalReview(session: OptimizationSession, verbosity: Verbosity): FormattedOutput;
/**
 * Main formatter - dispatches to appropriate formatter based on verbosity
 */
export declare function formatOutput(session: OptimizationSession, verbosity: Verbosity, currentStep?: number): FormattedOutput;
