#!/usr/bin/env node

// scripts/install.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = path.dirname(__filename2);
var packageRoot = path.dirname(__dirname2);
var NAMESPACE_PREFIX = "ai-eng";
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
    const targetSkillDir = path.join(targetOpenCodeDir, "skills");
    const distSkillDir = path.join(distOpenCodeDir, "skills");
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
async function install(targetDir, claudeRoot, silent = false) {
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
        "commands",
        NAMESPACE_PREFIX,
        silent,
    );
    const commandsSrc = path.join(
        distOpenCodeDir,
        "commands",
        NAMESPACE_PREFIX,
    );
    if (fs.existsSync(commandsSrc)) {
        const commandsDest = path.join(
            targetOpenCodeDir,
            "commands",
            NAMESPACE_PREFIX,
        );
        copyRecursive(commandsSrc, commandsDest);
        const commandCount = fs
            .readdirSync(commandsSrc)
            .filter((f) => f.endsWith(".md")).length;
        if (!silent)
            console.log(
                `  ✓ commands/${NAMESPACE_PREFIX}/ (${commandCount} commands)`,
            );
    }
    cleanNamespacedDirectory(
        targetOpenCodeDir,
        "agents",
        NAMESPACE_PREFIX,
        silent,
    );
    const agentsSrc = path.join(distOpenCodeDir, "agents", NAMESPACE_PREFIX);
    if (fs.existsSync(agentsSrc)) {
        const agentsDest = path.join(
            targetOpenCodeDir,
            "agents",
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
                `  ✓ agents/${NAMESPACE_PREFIX}/ (${agentCount} agents)`,
            );
    }
    cleanAiEngSkills(targetOpenCodeDir, distDir, silent);
    const distSkillDir = path.join(distOpenCodeDir, "skills");
    if (fs.existsSync(distSkillDir)) {
        const skillDest = path.join(targetOpenCodeDir, "skills");
        copyRecursive(distSkillDir, skillDest);
        const skillDirs = fs.readdirSync(distSkillDir);
        const skillCount = skillDirs.length;
        if (!silent) console.log(`  ✓ skills/ (${skillCount} skills)`);
    }
    const distToolsDir = path.join(distOpenCodeDir, "tools");
    if (fs.existsSync(distToolsDir)) {
        const toolsDest = path.join(targetOpenCodeDir, "tools");
        copyRecursive(distToolsDir, toolsDest);
        const toolCount = fs
            .readdirSync(distToolsDir)
            .filter((f) => f.endsWith(".ts") || f.endsWith(".js")).length;
        if (!silent && toolCount > 0)
            console.log(`  ✓ tools/ (${toolCount} tools)`);
    }
    await installClaudeHooks(claudeRoot, silent);
    if (!silent) {
        console.log(`
✅ Installation complete!`);
        console.log(`   Namespace: ${NAMESPACE_PREFIX}`);
    }
}
async function main() {
    const args = process.argv.slice(2);
    const isLocal = args.includes("--local") || args.includes("-l");
    const silent = process.env.npm_lifecycle_event === "postinstall";
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    let openCodeTarget;
    let claudeRoot;
    if (isLocal) {
        openCodeTarget = path.join(process.cwd(), ".opencode");
        claudeRoot = process.cwd();
    } else {
        openCodeTarget = path.join(homeDir, ".config", "opencode");
        claudeRoot = homeDir;
    }
    if (!silent) {
        console.log(
            `\uD83D\uDD27 Installing AI Engineering System (${isLocal ? "project-local" : "global"})`,
        );
        console.log(`   OpenCode -> ${openCodeTarget}`);
        console.log(
            `   Claude   -> ${path.join(claudeRoot, ".claude", "hooks")}`,
        );
    }
    await install(openCodeTarget, claudeRoot, silent);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`
❌ Installation failed: ${message}`);
    process.exit(1);
});
