/**
 * ai-eng install command
 *
 * Installs OpenCode/Claude assets to project or global location.
 * Replaces the automatic postinstall behavior.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);
const NAMESPACE_PREFIX = "ai-eng";

interface InstallFlags {
    scope?: "project" | "global" | "auto";
    dryRun?: boolean;
    yes?: boolean;
    verbose?: boolean;
}

async function cleanNamespacedDirectory(
    baseDir: string,
    subdir: string,
    namespace: string,
    silent = false,
): Promise<void> {
    const dir = path.join(baseDir, subdir, namespace);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        if (!silent) {
            console.log(`  ✅ Cleaned existing ${subdir}/${namespace}/`);
        }
    }
}

async function cleanAiEngSkills(
    targetOpenCodeDir: string,
    distOpenCodeDir: string,
    silent = false,
): Promise<void> {
    const targetSkillDir = path.join(targetOpenCodeDir, "skill");
    const distSkillDir = path.join(distOpenCodeDir, "skill");
    if (!fs.existsSync(distSkillDir)) return;

    const aiEngSkillNames = fs
        .readdirSync(distSkillDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    if (aiEngSkillNames.length === 0) return;

    let cleanedCount = 0;
    for (const skillName of aiEngSkillNames) {
        const skillPath = path.join(targetSkillDir, skillName);
        if (fs.existsSync(skillPath)) {
            fs.rmSync(skillPath, { recursive: true, force: true });
            cleanedCount++;
        }
    }

    if (!silent && cleanedCount > 0) {
        console.log(`  ✅ Cleaned ${cleanedCount} existing ai-eng skills`);
    }
}

function isPluginReferenced(configPath: string): boolean {
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);
        if (Array.isArray(config.plugin)) {
            return config.plugin.includes("ai-eng-system");
        }
        return false;
    } catch {
        return false;
    }
}

function findOpenCodeConfig(
    projectDir: string,
): { path: string; isGlobal: boolean } | null {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    // Check project .opencode/
    const projectConfig = path.join(projectDir, ".opencode", "opencode.jsonc");
    if (fs.existsSync(projectConfig)) {
        return { path: projectConfig, isGlobal: false };
    }

    // Check global ~/.config/opencode/
    const globalConfig = path.join(
        homeDir,
        ".config",
        "opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(globalConfig)) {
        return { path: globalConfig, isGlobal: true };
    }

    return null;
}

function detectInstallationScope(
    projectDir: string,
): "project" | "global" | null {
    const config = findOpenCodeConfig(projectDir);
    if (config) return config.isGlobal ? "global" : "project";

    // If no config exists, check if we're in a project with package.json
    if (fs.existsSync(path.join(projectDir, "package.json"))) {
        return "project";
    }

    return "global";
}

async function runInstaller(flags: InstallFlags): Promise<void> {
    const projectDir = process.cwd();
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const distOpenCodeDir = path.join(ROOT, "dist", ".opencode");

    // Determine installation scope
    let scope = flags.scope;
    if (!scope || scope === "auto") {
        const detected = detectInstallationScope(projectDir);
        if (!detected) {
            console.log(
                "❌ Could not detect installation scope. Use --scope project|global",
            );
            process.exit(1);
        }
        scope = detected;
    }

    const targetOpenCodeDir =
        scope === "global"
            ? path.join(homeDir, ".config", "opencode")
            : path.join(projectDir, ".opencode");

    if (flags.verbose) {
        console.log(`Installing to: ${targetOpenCodeDir}`);
        console.log(`Scope: ${scope}`);
    }

    // Validate target directory
    if (scope === "project") {
        const opencodeDir = path.join(projectDir, ".opencode");
        if (!fs.existsSync(opencodeDir)) {
            console.log("❌ No .opencode/ directory found in project");
            console.log("   Run 'opencode init' first or use --scope global");
            process.exit(1);
        }
    }

    // Check for ai-eng-system plugin reference
    const config = findOpenCodeConfig(projectDir);
    if (config && !isPluginReferenced(config.path)) {
        console.log(
            "⚠️  opencode.jsonc does not reference ai-eng-system plugin",
        );
        console.log(
            "   Add 'ai-eng-system' to the plugin array in opencode.jsonc",
        );
    }

    if (flags.dryRun) {
        console.log("🔍 dry-run: Would install the following files:");
        console.log(
            `   Commands -> ${targetOpenCodeDir}/command/${NAMESPACE_PREFIX}/`,
        );
        console.log(
            `   Agents   -> ${targetOpenCodeDir}/agent/${NAMESPACE_PREFIX}/`,
        );
        console.log(`   Skills   -> ${targetOpenCodeDir}/skill/`);
        return;
    }

    // Install commands
    const commandsDir = path.join(
        targetOpenCodeDir,
        "command",
        NAMESPACE_PREFIX,
    );
    const distCommandsDir = path.join(
        distOpenCodeDir,
        "command",
        NAMESPACE_PREFIX,
    );

    if (fs.existsSync(distCommandsDir)) {
        await cleanNamespacedDirectory(
            targetOpenCodeDir,
            "command",
            NAMESPACE_PREFIX,
        );
        fs.cpSync(distCommandsDir, commandsDir, { recursive: true });
        console.log(`  ✅ Installed commands to ${commandsDir}`);
    }

    // Install agents
    const agentsDir = path.join(targetOpenCodeDir, "agent", NAMESPACE_PREFIX);
    const distAgentsDir = path.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);

    if (fs.existsSync(distAgentsDir)) {
        await cleanNamespacedDirectory(
            targetOpenCodeDir,
            "agent",
            NAMESPACE_PREFIX,
        );
        fs.cpSync(distAgentsDir, agentsDir, { recursive: true });
        console.log(`  ✅ Installed agents to ${agentsDir}`);
    }

    // Install skills
    const skillsDir = path.join(targetOpenCodeDir, "skill");
    const distSkillsDir = path.join(distOpenCodeDir, "skill");

    if (fs.existsSync(distSkillsDir)) {
        await cleanAiEngSkills(targetOpenCodeDir, distOpenCodeDir);
        fs.cpSync(distSkillsDir, skillsDir, { recursive: true });
        console.log(`  ✅ Installed skills to ${skillsDir}`);
    }

    console.log("\n✅ Installation complete!");
    console.log(
        "   Restart OpenCode or Claude Code to use new commands and agents.",
    );
}

export { runInstaller };
