/**
 * Initialize ai-eng configuration file
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import type { InitFlags } from "../cli/flags";
import { UI } from "../cli/ui";
import { DEFAULT_CONFIG } from "../config/schema";

/**
 * Initialize configuration file
 */
export async function initConfig(flags: InitFlags): Promise<void> {
    const configDir = join(process.cwd(), ".ai-eng");
    const configPath = join(configDir, "config.yaml");

    // Check if config already exists
    if (existsSync(configPath) && !flags.overwrite) {
        UI.error("Configuration file already exists:");
        console.error(`  ${configPath}`);
        console.error(
            "Use --overwrite to replace it, or edit the existing file.",
        );
        process.exit(1);
    }

    if (flags.interactive) {
        console.log("⚠️  Interactive mode requires additional dependencies.");
        console.log("  npm install @clack/prompts");
        console.log("For now, creating config with defaults...\n");
    }

    // Write default configuration
    try {
        // Create .ai-eng directory if it doesn't exist
        await mkdir(configDir, { recursive: true });

        const yamlContent = YAML.stringify(DEFAULT_CONFIG, {
            indent: 2,
            lineWidth: 0,
        });

        await writeFile(configPath, yamlContent, "utf-8");
        console.log("✅ Initialized .ai-eng/config.yaml with defaults");
        console.log("\n📋 Next steps:");
        console.log("  1. Edit .ai-eng/config.yaml to customize settings");
        console.log("  2. Set up AI models and backends");
        console.log("  3. Configure quality gates for your project");
        console.log(
            "  4. Run 'ai-eng ralph \"your task\"' to start development",
        );
    } catch (error) {
        console.error(`Failed to write configuration file: ${configPath}`);
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
}
