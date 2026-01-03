#!/usr/bin/env node

/**
 * Integration test for complete installation flow
 *
 * Tests:
 * 1. OpenCode installation (commands, agents, skills)
 * 2. Claude Code hooks installation
 * 3. Backup creation
 * 4. File integrity verification
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.dirname(__dirname);

// Test directory
const testDir = path.join("/tmp", "ai-eng-integration-test");

console.log("🧪 Integration Test: Complete Installation Flow\n");
console.log("=".repeat(60));

// Clean up previous test
if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log("🧹 Cleaned up previous test directory");
}

// Create test directory structure
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(path.join(testDir, ".opencode"), { recursive: true });

// Create minimal opencode.jsonc
const opencodeConfig = {
    plugins: ["ai-eng-system"],
    commands: {},
    agents: {},
    skills: {},
};
fs.writeFileSync(
    path.join(testDir, ".opencode", "opencode.jsonc"),
    JSON.stringify(opencodeConfig, null, 2),
);
console.log("✓ Created test directory structure");
console.log(`  Location: ${testDir}\n`);

// Test 1: Verify dist directory exists
console.log("Test 1: Verify build artifacts");
console.log("-".repeat(60));

const distOpencodeDir = path.join(packageRoot, "dist", ".opencode");
const hooksSourceDir = path.join(
    packageRoot,
    "plugins",
    "ai-eng-system",
    "hooks",
);

if (!fs.existsSync(distOpencodeDir)) {
    console.log("⚠️  dist/.opencode not found");
    console.log("   Run 'bun run build' to create build artifacts\n");
    console.log("Skipping OpenCode installation tests...\n");
    console.log("=".repeat(60));
} else {
    console.log("✓ dist/.opencode exists");

    // Count build artifacts
    const commandsDir = path.join(distOpencodeDir, "command", "ai-eng");
    const agentsDir = path.join(distOpencodeDir, "agent", "ai-eng");
    const skillsDir = path.join(distOpencodeDir, "skill");

    let commandCount = 0;
    let agentCount = 0;
    let skillCount = 0;

    if (fs.existsSync(commandsDir)) {
        commandCount = fs
            .readdirSync(commandsDir)
            .filter((f) => f.endsWith(".md")).length;
    }
    if (fs.existsSync(agentsDir)) {
        const countFiles = (dir) => {
            let count = 0;
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                if (fs.statSync(fullPath).isDirectory()) {
                    count += countFiles(fullPath);
                } else if (entry.endsWith(".md")) {
                    count++;
                }
            }
            return count;
        };
        agentCount = countFiles(agentsDir);
    }
    if (fs.existsSync(skillsDir)) {
        skillCount = fs
            .readdirSync(skillsDir)
            .filter((d) =>
                fs.statSync(path.join(skillsDir, d)).isDirectory(),
            ).length;
    }

    console.log(`  Commands: ${commandCount}`);
    console.log(`  Agents: ${agentCount}`);
    console.log(`  Skills: ${skillCount}\n`);

    // Test 2: Copy OpenCode files
    console.log("Test 2: Install OpenCode components");
    console.log("-".repeat(60));

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

    // Copy opencode.jsonc
    const configSrc = path.join(distOpencodeDir, "opencode.jsonc");
    const configDest = path.join(testDir, "opencode.jsonc");
    if (fs.existsSync(configSrc) && !fs.existsSync(configDest)) {
        fs.copyFileSync(configSrc, configDest);
        console.log("✓ Installed opencode.jsonc");
    }

    // Copy commands
    if (fs.existsSync(commandsDir)) {
        const commandsDest = path.join(
            testDir,
            ".opencode",
            "command",
            "ai-eng",
        );
        copyRecursive(commandsDir, commandsDest);
        console.log(`✓ Installed ${commandCount} commands`);
    }

    // Copy agents
    if (fs.existsSync(agentsDir)) {
        const agentsDest = path.join(testDir, ".opencode", "agent", "ai-eng");
        copyRecursive(agentsDir, agentsDest);
        console.log(`✓ Installed ${agentCount} agents`);
    }

    // Copy skills
    if (fs.existsSync(skillsDir)) {
        const skillsDest = path.join(testDir, ".opencode", "skill");
        copyRecursive(skillsDir, skillsDest);
        console.log(`✓ Installed ${skillCount} skills`);
    }

    console.log();
}

// Test 3: Claude Code Hooks Installation
console.log("Test 3: Install Claude Code Hooks");
console.log("-".repeat(60));

if (!fs.existsSync(hooksSourceDir)) {
    console.log("⚠️  Hooks source not found");
    console.log(`  Expected: ${hooksSourceDir}`);
    console.log("  Run 'bun run build' to sync hooks\n");
} else {
    console.log("✓ Hooks source exists");

    // List source hooks
    const sourceHookFiles = fs.readdirSync(hooksSourceDir);
    console.log(
        `  Found ${sourceHookFiles.length} file(s): ${sourceHookFiles.join(", ")}\n`,
    );

    // Create existing hooks to test backup
    const existingHooksDir = path.join(testDir, ".claude", "hooks");
    fs.mkdirSync(existingHooksDir, { recursive: true });
    fs.writeFileSync(
        path.join(existingHooksDir, "old-hook.json"),
        JSON.stringify({ test: "old" }, null, 2),
    );
    console.log("✓ Created existing hooks (for backup test)");

    // Test backup function
    async function backupHooksDir(hooksDir) {
        if (!fs.existsSync(hooksDir)) return null;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = `${hooksDir}.backup-${timestamp}`;

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
                await fs.promises.mkdir(path.dirname(dest), {
                    recursive: true,
                });
                await fs.promises.copyFile(src, dest);
            }
        }

        await copyDirRecursive(hooksDir, backupDir);
        return backupDir;
    }

    const backupDir = await backupHooksDir(existingHooksDir);
    console.log(`✓ Created backup: ${path.basename(backupDir)}`);

    // Copy new hooks
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

    await copyDirRecursive(hooksSourceDir, existingHooksDir);
    console.log("✓ Copied hooks to target");

    // Verify copied files
    const copiedFiles = fs.readdirSync(existingHooksDir);
    console.log(
        `✓ Copied ${copiedFiles.length} file(s): ${copiedFiles.join(", ")}\n`,
    );
}

// Test 4: Verification
console.log("Test 4: Verify Installation");
console.log("-".repeat(60));

// Verify directory structure
const checks = [
    {
        path: path.join(testDir, ".opencode"),
        name: ".opencode directory",
    },
    {
        path: path.join(testDir, ".claude"),
        name: ".claude directory",
    },
    {
        path: path.join(testDir, ".claude", "hooks"),
        name: ".claude/hooks directory",
    },
    {
        path: path.join(testDir, ".claude", "hooks", "hooks.json"),
        name: "hooks.json",
    },
    {
        path: path.join(
            testDir,
            ".claude",
            "hooks",
            "prompt-optimizer-hook.py",
        ),
        name: "prompt-optimizer-hook.py",
    },
];

let allPassed = true;
for (const check of checks) {
    if (fs.existsSync(check.path)) {
        const stat = fs.statSync(check.path);
        if (stat.isDirectory()) {
            const files = fs.readdirSync(check.path);
            console.log(`✓ ${check.name} (${files.length} items)`);
        } else {
            console.log(`✓ ${check.name} (${stat.size} bytes)`);
        }
    } else {
        console.log(`✗ ${check.name} (MISSING)`);
        allPassed = false;
    }
}

console.log();
console.log("=".repeat(60));

if (allPassed) {
    console.log("✅ All Integration Tests PASSED!");
} else {
    console.log("❌ Some Integration Tests FAILED");
    process.exit(1);
}

console.log();
console.log(`📁 Test directory preserved: ${testDir}`);
console.log("   You can inspect: ls -la", testDir);
console.log();
console.log("To clean up:");
console.log(`  rm -rf ${testDir}`);
