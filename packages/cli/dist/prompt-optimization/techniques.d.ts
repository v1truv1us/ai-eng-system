/**
 * Optimization Techniques
 *
 * Research-backed prompting techniques for improving AI response quality.
 * Based on peer-reviewed research from MBZUAI, Google DeepMind, and ICLR 2024.
 */
import type { TechniqueConfig } from "./types";
/**
 * Expert Persona technique
 * Research: Kong et al. (2023) - 24% → 84% accuracy improvement
 */
export declare const expertPersona: TechniqueConfig;
/**
 * Reasoning Chain technique
 * Research: Yang et al. (2023, Google DeepMind OPRO) - 34% → 80% accuracy
 */
export declare const reasoningChain: TechniqueConfig;
/**
 * Stakes Language technique
 * Research: Bsharat et al. (2023, MBZUAI) - Principle #6: +45% quality improvement
 */
export declare const stakesLanguage: TechniqueConfig;
/**
 * Challenge Framing technique
 * Research: Li et al. (2023, ICLR 2024) - +115% improvement on hard tasks
 */
export declare const challengeFraming: TechniqueConfig;
/**
 * Self-Evaluation technique
 * Research: Improves response calibration and identifies uncertainties
 */
export declare const selfEvaluation: TechniqueConfig;
/**
 * Analysis step (always included as first step)
 */
export declare const analysisStep: TechniqueConfig;
/**
 * All available techniques
 */
export declare const ALL_TECHNIQUES: TechniqueConfig[];
/**
 * Get technique by ID
 */
export declare function getTechniqueById(id: string): TechniqueConfig | undefined;
/**
 * Get applicable techniques for given complexity
 */
export declare function getTechniquesForComplexity(complexity: "simple" | "medium" | "complex"): TechniqueConfig[];
