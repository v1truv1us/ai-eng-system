/**
 * Content loading utilities for ai-eng-system core package
 */
/**
 * Content item metadata
 */
export interface ContentItem {
    name: string;
    path: string;
    type: "agent" | "command" | "skill" | "tool";
    content?: string;
}
/**
 * OpenCode content structure for installation
 */
export interface OpenCodeContent {
    commands: ContentItem[];
    agents: ContentItem[];
    skills: ContentItem[];
    tools: ContentItem[];
}
/**
 * Get all agent content from the core package
 */
export declare function getAgentContent(): Promise<ContentItem[]>;
/**
 * Get all command content from the core package
 */
export declare function getCommandContent(): Promise<ContentItem[]>;
/**
 * Get all skill content from the core package
 */
export declare function getSkillContent(): Promise<ContentItem[]>;
/**
 * Get OpenCode-specific content ready for installation
 */
export declare function getOpenCodeContent(): Promise<OpenCodeContent>;
/**
 * Get content from built dist directory (for installation)
 */
export declare function getDistOpenCodeContent(): Promise<OpenCodeContent>;
/**
 * Get list of all available agent names
 */
export declare function getAgentNames(): Promise<string[]>;
/**
 * Get list of all available command names
 */
export declare function getCommandNames(): Promise<string[]>;
/**
 * Get list of all available skill names
 */
export declare function getSkillNames(): Promise<string[]>;
