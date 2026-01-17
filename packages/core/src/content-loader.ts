/**
 * Content loading utilities for ai-eng-system core package
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import {
    getContentPath,
    getDistOpenCodePath,
    getOpenCodePath,
    getSkillsPath,
} from "./paths.js";

/**
 * Content item metadata
 */
export interface ContentItem {
    name: string;
    path: string;
    type: "agent" | "command" | "skill" | "tool";
    content?: string;
}

/**
 * OpenCode content structure for installation
 */
export interface OpenCodeContent {
    commands: ContentItem[];
    agents: ContentItem[];
    skills: ContentItem[];
    tools: ContentItem[];
}

/**
 * Load all content files from a directory recursively
 */
async function loadContentFromDir(
    dirPath: string,
    baseType: "agent" | "command" | "skill" | "tool",
    baseDir = "",
): Promise<ContentItem[]> {
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        const items: ContentItem[] = [];

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recursively load subdirectory contents
                const subItems = await loadContentFromDir(
                    fullPath,
                    baseType,
                    baseDir ? join(baseDir, entry.name) : entry.name,
                );
                items.push(...subItems);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                // Load markdown files
                const content = await readFile(fullPath, "utf-8");
                const relativePath = baseDir
                    ? join(baseDir, entry.name)
                    : entry.name;

                items.push({
                    name: entry.name.replace(".md", ""),
                    path: relativePath,
                    type: baseType,
                    content,
                });
            }
        }

        return items;
    } catch (error) {
        // Directory doesn't exist or other error
        return [];
    }
}

/**
 * Get all agent content from the core package
 */
export async function getAgentContent(): Promise<ContentItem[]> {
    const agentPath = join(getContentPath(), "agents");
    return loadContentFromDir(agentPath, "agent");
}

/**
 * Get all command content from the core package
 */
export async function getCommandContent(): Promise<ContentItem[]> {
    const commandPath = join(getContentPath(), "commands");
    return loadContentFromDir(commandPath, "command");
}

/**
 * Get all skill content from the core package
 */
export async function getSkillContent(): Promise<ContentItem[]> {
    const skillsPath = getSkillsPath();
    return loadContentFromDir(skillsPath, "skill");
}

/**
 * Get OpenCode-specific content ready for installation
 */
export async function getOpenCodeContent(): Promise<OpenCodeContent> {
    const openCodePath = getOpenCodePath();

    // Load namespaced commands (ai-eng/)
    const commandsPath = join(openCodePath, "command", "ai-eng");
    const commands = await loadContentFromDir(
        commandsPath,
        "command",
        "ai-eng",
    );

    // Load namespaced agents (ai-eng/)
    const agentsPath = join(openCodePath, "agent", "ai-eng");
    const agents = await loadContentFromDir(agentsPath, "agent", "ai-eng");

    // Load skills (not namespaced)
    const skillsPath = join(openCodePath, "skill");
    const skills = await loadContentFromDir(skillsPath, "skill");

    // Load tools
    const toolsPath = join(openCodePath, "tool");
    const tools = await loadContentFromDir(toolsPath, "tool");

    return {
        commands,
        agents,
        skills,
        tools,
    };
}

/**
 * Get content from built dist directory (for installation)
 */
export async function getDistOpenCodeContent(): Promise<OpenCodeContent> {
    const distOpenCodePath = getDistOpenCodePath();

    // Load namespaced commands (ai-eng/)
    const commandsPath = join(distOpenCodePath, "command", "ai-eng");
    const commands = await loadContentFromDist(
        commandsPath,
        "command",
        "ai-eng",
    );

    // Load namespaced agents (ai-eng/)
    const agentsPath = join(distOpenCodePath, "agent", "ai-eng");
    const agents = await loadContentFromDist(agentsPath, "agent", "ai-eng");

    // Load skills (not namespaced)
    const skillsPath = join(distOpenCodePath, "skill");
    const skills = await loadContentFromDist(skillsPath, "skill");

    // Load tools
    const toolsPath = join(distOpenCodePath, "tool");
    const tools = await loadContentFromDist(toolsPath, "tool");

    return {
        commands,
        agents,
        skills,
        tools,
    };
}

/**
 * Load content from dist directory (handles both files and directories)
 */
async function loadContentFromDist(
    dirPath: string,
    baseType: "agent" | "command" | "skill" | "tool",
    baseDir = "",
): Promise<ContentItem[]> {
    try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        const items: ContentItem[] = [];

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                // Recursively load subdirectory contents
                const subItems = await loadContentFromDist(
                    fullPath,
                    baseType,
                    baseDir ? join(baseDir, entry.name) : entry.name,
                );
                items.push(...subItems);
            } else if (stats.isFile() && entry.name.endsWith(".md")) {
                // Load markdown files
                const content = await readFile(fullPath, "utf-8");
                const relativePath = baseDir
                    ? join(baseDir, entry.name)
                    : entry.name;

                items.push({
                    name: entry.name.replace(".md", ""),
                    path: relativePath,
                    type: baseType,
                    content,
                });
            } else if (stats.isFile() && entry.name.endsWith(".ts")) {
                // Load TypeScript tool files
                const content = await readFile(fullPath, "utf-8");
                const relativePath = baseDir
                    ? join(baseDir, entry.name)
                    : entry.name;

                items.push({
                    name: entry.name.replace(".ts", ""),
                    path: relativePath,
                    type: "tool",
                    content,
                });
            }
        }

        return items;
    } catch (error) {
        // Directory doesn't exist or other error
        return [];
    }
}

/**
 * Get list of all available agent names
 */
export async function getAgentNames(): Promise<string[]> {
    const agents = await getAgentContent();
    return agents.map((agent) => agent.name);
}

/**
 * Get list of all available command names
 */
export async function getCommandNames(): Promise<string[]> {
    const commands = await getCommandContent();
    return commands.map((command) => command.name);
}

/**
 * Get list of all available skill names
 */
export async function getSkillNames(): Promise<string[]> {
    const skills = await getSkillContent();
    return skills.map((skill) => skill.name);
}
