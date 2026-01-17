/**
 * Path resolution utilities for ai-eng-system core package
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname); // Go up from src/ to packages/core/
/**
 * Get the root directory of the core package
 */
export function getCoreRoot() {
    return ROOT;
}
/**
 * Get the content directory path
 */
export function getContentPath() {
    return join(ROOT, "content");
}
/**
 * Get the skills directory path
 */
export function getSkillsPath() {
    return join(ROOT, "skills");
}
/**
 * Get the OpenCode-specific content path
 */
export function getOpenCodePath() {
    return join(ROOT, "opencode");
}
/**
 * Get the Claude-specific content path
 */
export function getClaudePath() {
    return join(ROOT, "claude");
}
/**
 * Get the dist directory path (after build)
 */
export function getDistPath() {
    return join(ROOT, "dist");
}
/**
 * Get the built OpenCode content path (dist/.opencode)
 */
export function getDistOpenCodePath() {
    return join(ROOT, "dist", ".opencode");
}
/**
 * Get the built Claude content path (dist/.claude-plugin)
 */
export function getDistClaudePath() {
    return join(ROOT, "dist", ".claude-plugin");
}
