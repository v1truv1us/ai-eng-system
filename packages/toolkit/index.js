import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));

export const version = "1.7.0";

export function getToolkitRoot() {
    return packageRoot;
}

export function getClaudePluginDir() {
    return resolve(packageRoot, ".claude-plugin");
}

export function getOpenCodeDir() {
    return resolve(packageRoot, ".opencode");
}

export function getCursorPluginDir() {
    return resolve(packageRoot, ".cursor-plugin");
}

export function getGeminiDir() {
    return resolve(packageRoot, ".gemini");
}

export function getPiDir() {
    return resolve(packageRoot, ".pi");
}

export function getMarketplacePluginDir(name = "ai-eng-core") {
    return resolve(packageRoot, "plugins", name);
}
