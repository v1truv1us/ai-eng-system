#!/usr/bin/env node

// scripts/install.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = path.dirname(__filename2);
var packageRoot = path.dirname(__dirname2);
var NAMESPACE_PREFIX = "ai-eng";
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
    const hookSourceCandidates = [
        path.join(packageRoot, "dist", ".claude-plugin", "hooks"),
        path.join(packageRoot, ".claude", "hooks"),
        path.join(packageRoot, "plugins", "ai-eng-system", "hooks"),
    ];
    const canonicalHooksDir =
        hookSourceCandidates.find((d) => fs.existsSync(d)) ?? null;
    const targetHooksDir = path.join(targetDir, ".claude", "hooks");
    if (!canonicalHooksDir) {
        if (!silent) {
            console.log(
                "  ℹ️  No hook sources found (run `bun run build`) (skip)",
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
    const NON_HOOK_PATTERNS = [/^test_/i, /\.md$/i];
    const isHookFile = (name) => !NON_HOOK_PATTERNS.some((re) => re.test(name));
    try {
        const entries = await fs.promises.readdir(canonicalHooksDir, {
            withFileTypes: true,
        });
        for (const entry of entries) {
            const src = path.join(canonicalHooksDir, entry.name);
            const dest = path.join(targetHooksDir, entry.name);
            if (entry.isDirectory()) {
                await copyDirRecursive(src, dest);
            } else if (entry.isFile() && isHookFile(entry.name)) {
                await fs.promises.copyFile(src, dest);
            }
        }
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
function countFilesRecursive(dir) {
    let n = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) n += countFilesRecursive(p);
        else if (entry.isFile()) n++;
    }
    return n;
}
async function install(targetDir, claudeRoot, silent = false) {
    if (!silent) {
        console.log(
            `\uD83D\uDD27 Installing AI Engineering System to ${targetDir}`,
        );
    }
    const distOpenCodeDir = path.join(packageRoot, "dist", ".opencode");
    if (!fs.existsSync(distOpenCodeDir)) {
        if (!silent) {
            console.error(
                '❌ Error: dist/.opencode not found. Run "bun run build" first.',
            );
        }
        process.exit(1);
    }
    for (const sub of ["agent", "agents", "command", "commands"]) {
        const stale = path.join(targetDir, sub, NAMESPACE_PREFIX);
        if (fs.existsSync(stale)) {
            fs.rmSync(stale, { recursive: true, force: true });
            if (!silent)
                console.log(
                    `  \uD83E\uDDF9 Cleaned stale ${sub}/${NAMESPACE_PREFIX}/`,
                );
        }
    }
    const surfaces = [
        { dir: "command", label: "commands", log: true },
        { dir: "commands", label: "commands", log: false },
        { dir: "agent", label: "agents", log: true },
        { dir: "agents", label: "agents", log: false },
        { dir: "skill", label: "skills", log: true },
        { dir: "skills", label: "skills", log: false },
        { dir: "tool", label: "tools", log: true },
        { dir: "tools", label: "tools", log: false },
    ];
    for (const { dir, label, log } of surfaces) {
        const src = path.join(distOpenCodeDir, dir);
        if (!fs.existsSync(src)) continue;
        copyRecursive(src, path.join(targetDir, dir));
        if (log && !silent) {
            const n = countFilesRecursive(src);
            console.log(`  ✓ ${dir}/ (${n} ${label})`);
        }
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
