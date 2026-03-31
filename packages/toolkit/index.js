import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));

export const version = "0.6.0";

export function getToolkitRoot() {
    return packageRoot;
}

export function getClaudePluginDir() {
    return resolve(packageRoot, ".claude-plugin");
}

export function getOpenCodeDir() {
    return resolve(packageRoot, ".opencode");
}

export function getMarketplacePluginDir() {
    return resolve(packageRoot, "plugins", "ai-eng-system");
}
