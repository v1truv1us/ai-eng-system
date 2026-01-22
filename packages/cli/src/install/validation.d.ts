/**
 * Installation validation module for US-001: Auto-Detect Installation Location
 * Provides comprehensive validation for installation targets
 */
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
export declare function validateInstallationTarget(targetPath: string, scope: "project" | "global"): ValidationResult;
/**
 * Validates platform compatibility for installation
 * @returns Platform compatibility information
 */
export declare function validatePlatformCompatibility(): PlatformCompatibility;
/**
 * Gets detailed information about installation target
 * @param targetPath - Target installation directory
 * @param scope - Installation scope
 * @returns Installation target information
 */
export declare function getInstallationTargetInfo(targetPath: string, scope: "project" | "global"): InstallationTarget;
/**
 * Detects potential installation conflicts before installation
 * @param targetPath - Target installation directory
 * @returns Array of detected conflicts
 */
export declare function detectInstallationConflicts(targetPath: string): InstallationConflict[];
