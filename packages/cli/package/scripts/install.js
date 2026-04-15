#!/usr/bin/env node

// scripts/install.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);
const packageRoot = path.dirname(__dirname2);
const NAMESPACE_PREFIX = "ai-eng";
function cleanNamespacedDirectory(baseDir, subdir, namespace, silent = false) {
    const dir = path.join(baseDir, subdir, namespace);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        if (!silent) {
            console.log(
                `  \uD83E\uDDF9 Cleaned existing ${subdir}/${namespace}/`,
            );
        }
    }
}
function cleanAiEngSkills(targetOpenCodeDir, distOpenCodeDir, silent = false) {
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
        console.log(
            `  \uD83E\uDDF9 Cleaned ${cleanedCount} existing ai-eng skills`,
        );
    }
}
function isPluginReferenced(configPath) {
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);
        if (Array.isArray(config.plugin)) {
            return config.plugin.includes("ai-eng-system");
        }
        return false;
    } catch (error) {
        return false;
    }
}
function findOpenCodeConfig(startDir) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const projectConfigPath = path.join(
        startDir,
        ".opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(projectConfigPath)) {
        return { path: projectConfigPath, scope: "project" };
    }
    const globalConfigPath = path.join(
        homeDir,
        ".config",
        "opencode",
        "opencode.jsonc",
    );
    if (fs.existsSync(globalConfigPath)) {
        return { path: globalConfigPath, scope: "global" };
    }
    return null;
}
function isClaudeCodeProject(targetDir) {
    if (fs.existsSync(path.join(targetDir, ".claude"))) {
        return true;
    }
    const projectDir = process.env.CLAUDE_PROJECT_DIR;
    if (projectDir && path.resolve(projectDir) === path.resolve(targetDir)) {
        return true;
    }
    return true;
}
function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}
async function copyDirRecursive(src, dest) {
    const stat = await fs.promises.stat(src);
    if (stat.isDirectory()) {
        await fs.promises.mkdir(dest, { recursive: true });
        const entries = await fs.promises.readdir(src);
        for (const entry of entries) {
            await copyDirRecursive(
                path.join(src, entry),
                path.join(dest, entry),
            );
        }
    } else {
        await fs.promises.mkdir(path.dirname(dest), { recursive: true });
        await fs.promises.copyFile(src, dest);
    }
}
async function backupHooksDir(hooksDir) {
    if (!fs.existsSync(hooksDir)) {
        return null;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `${hooksDir}.backup-${timestamp}`;
    try {
        await copyDirRecursive(hooksDir, backupDir);
        return backupDir;
    } catch (error) {
        throw new Error(
            `Failed to backup existing hooks: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
async function installClaudeHooks(targetDir, silent = false) {
    const canonicalHooksDir = path.join(
        packageRoot,
        "plugins",
        "ai-eng-system",
        "hooks",
    );
    const targetHooksDir = path.join(targetDir, ".claude", "hooks");
    if (!fs.existsSync(canonicalHooksDir)) {
        if (!silent) {
            console.log(
                "  ℹ️  No hooks found in plugins/ai-eng-system/hooks/ (skip)",
            );
        }
        return;
    }
    const isClaudeProject = isClaudeCodeProject(targetDir);
    if (!isClaudeProject && !silent) {
        console.log(
            "  ℹ️  Not a Claude Code project, installing hooks anyway...",
        );
    }
    if (fs.existsSync(targetHooksDir)) {
        if (!silent) {
            console.log("  \uD83D\uDCE6 Backing up existing hooks...");
        }
        const backupDir = await backupHooksDir(targetHooksDir);
        if (backupDir && !silent) {
            console.log(`    ✓ Backed up to: ${path.basename(backupDir)}`);
        }
    }
    await fs.promises.mkdir(targetHooksDir, { recursive: true });
    try {
        await copyDirRecursive(canonicalHooksDir, targetHooksDir);
    } catch (error) {
        throw new Error(
            `Failed to copy hooks: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
    const copiedFiles = [];
    async function countFiles(dir, baseDir = dir) {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await countFiles(fullPath, baseDir);
            } else if (entry.isFile()) {
                const relPath = path.relative(baseDir, fullPath);
                copiedFiles.push(relPath);
            }
        }
    }
    await countFiles(targetHooksDir);
    if (!silent) {
        console.log(
            `  ✓ Installed ${copiedFiles.length} hook file(s) to .claude/hooks/`,
        );
        console.log(
            "    \uD83D\uDCDD Hooks enable automatic prompt optimization (+45-115% quality)",
        );
        console.log(
            "    \uD83D\uDEAB Use '!' prefix to skip optimization for specific prompts",
        );
    }
}
async function install(targetDir, silent = false) {
    if (!silent) {
        console.log(
            `\uD83D\uDD27 Installing AI Engineering System to ${targetDir}`,
        );
    }
    const distDir = path.join(packageRoot, "dist");
    const distOpenCodeDir = path.join(distDir, ".opencode");
    const targetOpenCodeDir = targetDir;
    if (!fs.existsSync(distOpenCodeDir)) {
        if (!silent) {
            console.error(
                '❌ Error: dist/.opencode not found. Run "bun run build" first.',
            );
        }
        process.exit(1);
    }
    cleanNamespacedDirectory(
        targetOpenCodeDir,
        "command",
        NAMESPACE_PREFIX,
        silent,
    );
    const commandsSrc = path.join(distOpenCodeDir, "command", NAMESPACE_PREFIX);
    if (fs.existsSync(commandsSrc)) {
        const commandsDest = path.join(
            targetOpenCodeDir,
            "command",
            NAMESPACE_PREFIX,
        );
        copyRecursive(commandsSrc, commandsDest);
        const commandCount = fs
            .readdirSync(commandsSrc)
            .filter((f) => f.endsWith(".md")).length;
        if (!silent)
            console.log(
                `  ✓ command/${NAMESPACE_PREFIX}/ (${commandCount} commands)`,
            );
    }
    cleanNamespacedDirectory(
        targetOpenCodeDir,
        "agent",
        NAMESPACE_PREFIX,
        silent,
    );
    const agentsSrc = path.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);
    if (fs.existsSync(agentsSrc)) {
        const agentsDest = path.join(
            targetOpenCodeDir,
            "agent",
            NAMESPACE_PREFIX,
        );
        copyRecursive(agentsSrc, agentsDest);
        let agentCount = 0;
        const agentEntries = fs.readdirSync(agentsSrc);
        for (const entry of agentEntries) {
            const fullPath = path.join(agentsSrc, entry);
            if (fs.statSync(fullPath).isDirectory()) {
                agentCount++;
            }
        }
        if (!silent)
            console.log(
                `  ✓ agent/${NAMESPACE_PREFIX}/ (${agentCount} agents)`,
            );
    }
    cleanAiEngSkills(targetOpenCodeDir, distDir, silent);
    const distSkillDir = path.join(distOpenCodeDir, "skill");
    if (fs.existsSync(distSkillDir)) {
        const skillDest = path.join(targetOpenCodeDir, "skill");
        copyRecursive(distSkillDir, skillDest);
        const skillDirs = fs.readdirSync(distSkillDir);
        const skillCount = skillDirs.length;
        if (!silent) console.log(`  ✓ skill/ (${skillCount} skills)`);
    }
    const projectRootDir = path.dirname(targetDir);
    await installClaudeHooks(projectRootDir, silent);
    if (!silent) {
        console.log(`
✅ Installation complete!`);
        console.log(`   Namespace: ${NAMESPACE_PREFIX}`);
    }
}
async function main() {
    const isPostInstall = process.env.npm_lifecycle_event === "postinstall";
    if (isPostInstall) {
        const cwd = process.cwd();
        const configResult = findOpenCodeConfig(cwd);
        if (!configResult) {
            return;
        }
        if (!isPluginReferenced(configResult.path)) {
            return;
        }
        const targetDir = path.dirname(configResult.path);
        await install(targetDir, true);
    } else {
        const cwd = process.cwd();
        const configResult = findOpenCodeConfig(cwd);
        if (!configResult) {
            console.error(
                "❌ Error: opencode.jsonc not found in .opencode/ or ~/.config/opencode/",
            );
            console.error(
                "   Create .opencode/opencode.jsonc in your project, or use ~/.config/opencode/opencode.jsonc for global installation",
            );
            process.exit(1);
        }
        if (!isPluginReferenced(configResult.path)) {
            console.error(
                "❌ Error: ai-eng-system is not referenced in opencode.jsonc plugin list",
            );
            console.error(
                "   Add 'ai-eng-system' to the plugin array in opencode.jsonc",
            );
            process.exit(1);
        }
        const targetDir = path.dirname(configResult.path);
        await install(targetDir, false);
    }
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`
❌ Installation failed: ${message}`);
    process.exit(1);
});
