/**
 * ai-eng install command
 *
 * Installs OpenCode/Claude assets to project or global location.
 * Replaces the automatic postinstall behavior.
 */
interface InstallFlags {
    scope?: "project" | "global" | "auto";
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
}
declare function runInstaller(flags: InstallFlags): Promise<void>;
export { runInstaller };
