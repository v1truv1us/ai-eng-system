/**
 * Path resolution utilities for ai-eng-system core package
 */
/**
 * Get the root directory of the core package
 */
export declare function getCoreRoot(): string;
/**
 * Get the content directory path
 */
export declare function getContentPath(): string;
/**
 * Get the skills directory path
 */
export declare function getSkillsPath(): string;
/**
 * Get the OpenCode-specific content path
 */
export declare function getOpenCodePath(): string;
/**
 * Get the Claude-specific content path
 */
export declare function getClaudePath(): string;
/**
 * Get the dist directory path (after build)
 */
export declare function getDistPath(): string;
/**
 * Get the built OpenCode content path (dist/.opencode)
 */
export declare function getDistOpenCodePath(): string;
/**
 * Get the built Claude content path (dist/.claude-plugin)
 */
export declare function getDistClaudePath(): string;
