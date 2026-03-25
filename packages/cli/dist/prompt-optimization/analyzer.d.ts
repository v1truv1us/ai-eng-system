/**
 * Prompt Analyzer
 *
 * Analyzes user prompts to determine complexity, domain,
 * and missing context. Uses a combination of word count,
 * keyword detection, and pattern matching.
 */
import type { AnalysisResult } from "./types";
/**
 * Main analysis function
 */
export declare function analyzePrompt(prompt: string): AnalysisResult;
