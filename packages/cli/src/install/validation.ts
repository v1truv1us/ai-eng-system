/**
 * Installation validation module for US-001: Auto-Detect Installation Location
 * Provides comprehensive validation for installation targets
 */

import fs from "node:fs";
import { constants } from "node:fs";
import path from "node:path";

/**
 * Result of installation validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    canWrite: boolean;
    conflicts: string[];
}

/**
 * Installation conflict information
 */
export interface InstallationConflict {
    type: "command" | "agent" | "skill" | "tool";
    path: string;
    action: "replace" | "merge" | "skip";
}

/**
 * Platform compatibility information
 */
export interface PlatformCompatibility {
    platform: NodeJS.Platform;
    isSupported: boolean;
    limitations: string[];
}

/**
 * Installation target information
 */
export interface InstallationTarget {
    scope: "project" | "global";
    directory: string;
    exists: boolean;
    permissions: {
        canRead: boolean;
        canWrite: boolean;
        canExecute: boolean;
    };
}

/**
 * Validates installation target directory and permissions
 * @param targetPath - Target installation directory
 * @param scope - Installation scope (project or global)
 * @returns Validation result with detailed information
 */
export function validateInstallationTarget(
    targetPath: string,
    scope: "project" | "global",
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: string[] = [];
    let canWrite = false;

    try {
        // Check if target directory exists
        const exists = fs.existsSync(targetPath);

        if (!exists && scope === "project") {
            errors.push(
                "Project .opencode directory does not exist. Run 'opencode init' first.",
            );
        } else if (!exists && scope === "global") {
            // Global directory can be created - check if parent is writable
            const parentDir = path.dirname(targetPath);
            try {
                fs.accessSync(parentDir, constants.W_OK);
                canWrite = true;
            } catch {
                errors.push(
                    "Cannot create global directory. Check permissions for ~/.config/",
                );
            }
        } else {
            // Check existing directory permissions
            try {
                fs.accessSync(
                    targetPath,
                    constants.R_OK | constants.W_OK | constants.X_OK,
                );
                canWrite = true;
            } catch (accessError) {
                const hasRead = fs.existsSync(targetPath);
                const hasWrite = hasRead
                    ? tryAccess(targetPath, constants.W_OK)
                    : false;
                const hasExecute = hasRead
                    ? tryAccess(targetPath, constants.X_OK)
                    : false;

                if (!hasRead) errors.push("Cannot read installation directory");
                if (!hasWrite)
                    errors.push("Cannot write to installation directory");
                if (!hasExecute)
                    errors.push("Cannot execute in installation directory");
                canWrite = hasWrite;
            }
        }

        // Check for existing ai-eng installations
        if (exists) {
            const aiEngCommandDir = path.join(targetPath, "command", "ai-eng");
            const aiEngAgentDir = path.join(targetPath, "agent", "ai-eng");

            if (fs.existsSync(aiEngCommandDir)) {
                const commands = fs.readdirSync(aiEngCommandDir);
                if (commands.length > 0) {
                    conflicts.push(
                        `${commands.length} existing commands will be replaced`,
                    );
                    warnings.push(
                        `Existing commands in ${aiEngCommandDir} will be overwritten`,
                    );
                }
            }

            if (fs.existsSync(aiEngAgentDir)) {
                const agents = fs.readdirSync(aiEngAgentDir);
                if (agents.length > 0) {
                    conflicts.push(
                        `${agents.length} existing agents will be replaced`,
                    );
                    warnings.push(
                        `Existing agents in ${aiEngAgentDir} will be overwritten`,
                    );
                }
            }

            // Check for skills (not namespaced)
            const skillsDir = path.join(targetPath, "skill");
            if (fs.existsSync(skillsDir)) {
                const skills = fs
                    .readdirSync(skillsDir)
                    .filter(
                        (skill) =>
                            skill.startsWith("ai-eng-") ||
                            skill.includes("ai-eng"),
                    );
                if (skills.length > 0) {
                    conflicts.push(
                        `${skills.length} existing ai-eng skills will be replaced`,
                    );
                    warnings.push(
                        `Existing ai-eng skills in ${skillsDir} will be overwritten`,
                    );
                }
            }
        }
    } catch (error) {
        errors.push(
            `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        canWrite,
        conflicts,
    };
}

/**
 * Validates platform compatibility for installation
 * @returns Platform compatibility information
 */
export function validatePlatformCompatibility(): PlatformCompatibility {
    const platform = process.platform;
    const isSupported = ["darwin", "linux", "win32"].includes(platform);
    const limitations: string[] = [];

    if (!isSupported) {
        limitations.push(`Platform ${platform} is not officially supported`);
    }

    // Platform-specific limitations
    if (platform === "win32") {
        limitations.push(
            "Windows paths may require special handling for long paths",
        );
    } else if (platform === "darwin") {
        limitations.push(
            "macOS may require additional permissions for global installation",
        );
    } else if (platform === "linux") {
        limitations.push(
            "Some Linux distributions may have different default paths",
        );
    }

    return {
        platform,
        isSupported,
        limitations,
    };
}

/**
 * Gets detailed information about installation target
 * @param targetPath - Target installation directory
 * @param scope - Installation scope
 * @returns Installation target information
 */
export function getInstallationTargetInfo(
    targetPath: string,
    scope: "project" | "global",
): InstallationTarget {
    const exists = fs.existsSync(targetPath);

    let canRead = false;
    let canWrite = false;
    let canExecute = false;

    if (exists) {
        canRead = tryAccess(targetPath, constants.R_OK);
        canWrite = tryAccess(targetPath, constants.W_OK);
        canExecute = tryAccess(targetPath, constants.X_OK);
    } else {
        // For non-existent directories, check parent permissions
        const parentDir = path.dirname(targetPath);
        if (fs.existsSync(parentDir)) {
            canWrite = tryAccess(parentDir, constants.W_OK);
            canExecute = tryAccess(parentDir, constants.X_OK);
        }
    }

    return {
        scope,
        directory: targetPath,
        exists,
        permissions: {
            canRead,
            canWrite,
            canExecute,
        },
    };
}

/**
 * Checks if a file/directory can be accessed with given permissions
 * @param path - Path to check
 * @param mode - Access mode constants
 * @returns True if access is granted
 */
function tryAccess(path: string, mode: number): boolean {
    try {
        fs.accessSync(path, mode);
        return true;
    } catch {
        return false;
    }
}

/**
 * Detects potential installation conflicts before installation
 * @param targetPath - Target installation directory
 * @returns Array of detected conflicts
 */
export function detectInstallationConflicts(
    targetPath: string,
): InstallationConflict[] {
    const conflicts: InstallationConflict[] = [];

    if (!fs.existsSync(targetPath)) {
        return conflicts;
    }

    // Check command conflicts
    const commandDir = path.join(targetPath, "command", "ai-eng");
    if (fs.existsSync(commandDir)) {
        const commands = fs
            .readdirSync(commandDir, { withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name);

        for (const command of commands) {
            conflicts.push({
                type: "command",
                path: path.join(commandDir, command),
                action: "replace",
            });
        }
    }

    // Check agent conflicts
    const agentDir = path.join(targetPath, "agent", "ai-eng");
    if (fs.existsSync(agentDir)) {
        const agents = fs
            .readdirSync(agentDir, { withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name);

        for (const agent of agents) {
            conflicts.push({
                type: "agent",
                path: path.join(agentDir, agent),
                action: "replace",
            });
        }
    }

    // Check skill conflicts
    const skillDir = path.join(targetPath, "skill");
    if (fs.existsSync(skillDir)) {
        const skills = fs
            .readdirSync(skillDir, { withFileTypes: true })
            .filter(
                (entry) =>
                    entry.isDirectory() &&
                    (entry.name.startsWith("ai-eng-") ||
                        entry.name.includes("ai-eng")),
            )
            .map((entry) => entry.name);

        for (const skill of skills) {
            conflicts.push({
                type: "skill",
                path: path.join(skillDir, skill),
                action: "replace",
            });
        }
    }

    return conflicts;
}
