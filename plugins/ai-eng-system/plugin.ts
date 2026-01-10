/**
 * ai-eng-system OpenCode Plugin
 * Minimal plugin that logs version information on session creation
 */

import type { Plugin } from "@opencode-ai/plugin";

// Read version from package.json
async function getVersion(): Promise<string> {
    try {
        const packageJson = await import("../../package.json");
        return packageJson.version || "unknown";
    } catch {
        return "unknown";
    }
}

const plugin: Plugin = async ({ client, project, directory, worktree, $ }) => {
    const version = await getVersion();

    return {
        // Use the event hook to listen for all events
        event: async ({ event }) => {
            // Check if this is a session.created event
            if (event.type === "session.created") {
                console.log(`ai-eng-system v${version} loaded`);
            }
        },
    };
};

export default plugin;
