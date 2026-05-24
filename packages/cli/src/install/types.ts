export type InstallPlatform = "opencode" | "cursor" | "gemini" | "pi";

export interface InstallFlags {
    scope?: "project" | "global" | "auto";
    platform?: InstallPlatform;
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
    /** Run full clean before install (default). */
    fresh?: boolean;
    /** Skip pre-install clean (not recommended for upgrades). */
    skipClean?: boolean;
}

export interface CleanFlags {
    scope?: "project" | "global" | "auto";
    platform?: InstallPlatform | "all";
    dryRun?: boolean;
    verbose?: boolean;
}
