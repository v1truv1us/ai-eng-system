/**
 * Progressive Disclosure Architecture (PDA)
 *
 * Implements 3-tier skill loading to reduce token usage by ~90%.
 * Based on Claude Skills research by Rick Hightower.
 *
 * Tier 1: Metadata (always loaded) - ~50 tokens
 * Tier 2: Instructions (loaded on demand) - ~500 tokens
 * Tier 3: Resources (loaded when needed) - ~2000+ tokens
 */
import type { LoadedSkill, SkillMetadata, SkillTier } from "./types";
export declare class ProgressiveSkillLoader {
    private skillsDir;
    private loadedCache;
    constructor(skillsDir?: string);
    /**
     * Parse YAML frontmatter from skill markdown
     */
    private parseFrontmatter;
    /**
     * Extract tier content from markdown
     * Tier markers: <!-- tier:2 --> and <!-- tier:3 -->
     */
    private extractTierContent;
    /**
     * Estimate tokens for content (rough approximation)
     * ~1 token per 4 characters
     */
    private estimateTokens;
    /**
     * Load skill metadata only (Tier 1)
     */
    loadSkillMetadata(skillPath: string): Promise<SkillMetadata | null>;
    /**
     * Load skill with specified tiers
     */
    loadSkill(skillPath: string, tiers?: SkillTier[]): Promise<LoadedSkill | null>;
    /**
     * Load all skills in a directory with specified tiers
     */
    loadSkillsInDirectory(dir: string, tiers?: SkillTier[]): Promise<LoadedSkill[]>;
    /**
     * Load skills by capability
     */
    loadSkillsByCapability(dir: string, capability: string, tiers?: SkillTier[]): Promise<LoadedSkill[]>;
    /**
     * Estimate token savings from progressive disclosure
     */
    estimateTokenSavings(skills: LoadedSkill[]): {
        tier1Only: number;
        allTiers: number;
        savings: number;
        savingsPercent: number;
    };
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        entries: string[];
    };
}
/**
 * Helper function to create a skill loader for the default skills directory
 */
export declare function createSkillLoader(skillsDir?: string): ProgressiveSkillLoader;
/**
 * Recommended tier loading strategies
 */
export declare const TIER_STRATEGIES: {
    /** Minimal context - just skill names and descriptions */
    minimal: SkillTier[];
    /** Standard context - metadata + instructions */
    standard: SkillTier[];
    /** Full context - everything */
    full: SkillTier[];
    /** On-demand - load tier 3 only when specifically requested */
    onDemand: SkillTier[];
};
