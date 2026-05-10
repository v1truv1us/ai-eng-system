/**
 * ai-eng-system Core Package
 *
 * Provides access to all agents, skills, commands, and content
 * for the AI Engineering System
 */

// Export content loading utilities
export {
    type ContentItem,
    getAgentContent,
    getAgentNames,
    getCommandContent,
    getCommandNames,
    getDistOpenCodeContent,
    getOpenCodeContent,
    getSkillContent,
    getSkillNames,
    type OpenCodeContent,
} from "./content-loader.js";
// Export path utilities
export {
    getClaudePath,
    getContentPath,
    getCoreRoot,
    getDistClaudePath,
    getDistOpenCodePath,
    getDistPath,
    getOpenCodePath,
    getSkillsPath,
} from "./paths.js";

// Export version
export const version = "0.6.0";
