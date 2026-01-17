/**
 * ai-eng-system Core Package
 *
 * Provides access to all agents, skills, commands, and content
 * for the AI Engineering System
 */

// Export path utilities
export {
    getCoreRoot,
    getContentPath,
    getSkillsPath,
    getOpenCodePath,
    getClaudePath,
    getDistPath,
    getDistOpenCodePath,
    getDistClaudePath,
} from "./paths.js";

// Export content loading utilities
export {
    type ContentItem,
    type OpenCodeContent,
    getAgentContent,
    getCommandContent,
    getSkillContent,
    getOpenCodeContent,
    getDistOpenCodeContent,
    getAgentNames,
    getCommandNames,
    getSkillNames,
} from "./content-loader.js";

// Export version
export const version = "0.4.1";
