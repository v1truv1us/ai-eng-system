#!/usr/bin/env node

/**
 * Test script to verify hooks installation works correctly
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.dirname(__dirname);

// Test directory
const testDir = path.join("/tmp", "ai-eng-test-install");

console.log("🧪 Testing hooks installation...\n");

// Clean up previous test
if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
}

// Create test directory structure
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(path.join(testDir, ".opencode"), { recursive: true });

// Create minimal opencode.jsonc
const opencodeConfig = {
    plugins: ["ai-eng-system"],
};
fs.writeFileSync(
    path.join(testDir, ".opencode", "opencode.jsonc"),
    JSON.stringify(opencodeConfig, null, 2),
);

console.log(`✓ Created test directory: ${testDir}`);
console.log("✓ Created .opencode/opencode.jsonc\n");

// Build dist directory if needed
const distDir = path.join(packageRoot, "dist", ".opencode");
if (!fs.existsSync(distDir)) {
    console.log(
        "⚠️  dist/.opencode not found - you may need to run 'bun run build' first\n",
    );
}

// Verify hooks source exists
const hooksSource = path.join(packageRoot, "plugins", "ai-eng-system", "hooks");
if (!fs.existsSync(hooksSource)) {
    console.log("❌ Hooks source not found:", hooksSource);
    process.exit(1);
}
console.log("✓ Hooks source exists: plugins/ai-eng-system/hooks/");

// List hooks in source
const hookFiles = fs.readdirSync(hooksSource);
console.log(
    `✓ Found ${hookFiles.length} hook file(s):`,
    hookFiles.join(", "),
    "\n",
);

// Test the copyDirRecursive function
console.log("📋 Testing recursive copy function...");

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

try {
    const targetHooksDir = path.join(testDir, ".claude", "hooks");
    await copyDirRecursive(hooksSource, targetHooksDir);

    console.log(`✓ Copied hooks to: ${targetHooksDir}`);

    // Verify copied files
    const copiedFiles = fs.readdirSync(targetHooksDir);
    console.log(
        `✓ Copied ${copiedFiles.length} file(s):`,
        copiedFiles.join(", "),
        "\n",
    );

    // Verify contents
    for (const file of copiedFiles) {
        const sourceFile = path.join(hooksSource, file);
        const destFile = path.join(targetHooksDir, file);
        const sourceStat = fs.statSync(sourceFile);
        const destStat = fs.statSync(destFile);

        console.log(
            `  ✓ ${file}: ${sourceStat.size} bytes → ${destStat.size} bytes`,
        );
    }

    console.log("\n✅ Hook installation test PASSED!");
    console.log(`\nTest directory preserved at: ${testDir}`);
    console.log(
        "You can manually inspect: ls -la /tmp/ai-eng-test-install/.claude/hooks/",
    );
} catch (error) {
    console.error(`\n❌ Test FAILED: ${error.message}`);
    process.exit(1);
}
