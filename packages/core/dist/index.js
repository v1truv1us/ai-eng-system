// src/paths.ts
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename2);
var ROOT = dirname(__dirname2);
function getCoreRoot() {
  return ROOT;
}
function getContentPath() {
  return join(ROOT, "content");
}
function getSkillsPath() {
  return join(ROOT, "skills");
}
function getOpenCodePath() {
  return join(ROOT, "opencode");
}
function getClaudePath() {
  return join(ROOT, "claude");
}
function getDistPath() {
  return join(ROOT, "dist");
}
function getDistOpenCodePath() {
  return join(ROOT, "dist", ".opencode");
}
function getDistClaudePath() {
  return join(ROOT, "dist", ".claude-plugin");
}
// src/content-loader.ts
import { readFile, readdir, stat } from "node:fs/promises";
import { join as join2 } from "node:path";
async function loadContentFromDir(dirPath, baseType, baseDir = "") {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const items = [];
    for (const entry of entries) {
      const fullPath = join2(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subItems = await loadContentFromDir(fullPath, baseType, baseDir ? join2(baseDir, entry.name) : entry.name);
        items.push(...subItems);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        const relativePath = baseDir ? join2(baseDir, entry.name) : entry.name;
        items.push({
          name: entry.name.replace(".md", ""),
          path: relativePath,
          type: baseType,
          content
        });
      }
    }
    return items;
  } catch (error) {
    return [];
  }
}
async function getAgentContent() {
  const agentPath = join2(getContentPath(), "agents");
  return loadContentFromDir(agentPath, "agent");
}
async function getCommandContent() {
  const commandPath = join2(getContentPath(), "commands");
  return loadContentFromDir(commandPath, "command");
}
async function getSkillContent() {
  const skillsPath = getSkillsPath();
  return loadContentFromDir(skillsPath, "skill");
}
async function getOpenCodeContent() {
  const openCodePath = getOpenCodePath();
  const commandsPath = join2(openCodePath, "command", "ai-eng");
  const commands = await loadContentFromDir(commandsPath, "command", "ai-eng");
  const agentsPath = join2(openCodePath, "agent", "ai-eng");
  const agents = await loadContentFromDir(agentsPath, "agent", "ai-eng");
  const skillsPath = join2(openCodePath, "skill");
  const skills = await loadContentFromDir(skillsPath, "skill");
  const toolsPath = join2(openCodePath, "tool");
  const tools = await loadContentFromDir(toolsPath, "tool");
  return {
    commands,
    agents,
    skills,
    tools
  };
}
async function getDistOpenCodeContent() {
  const distOpenCodePath = getDistOpenCodePath();
  const commandsPath = join2(distOpenCodePath, "command", "ai-eng");
  const commands = await loadContentFromDist(commandsPath, "command", "ai-eng");
  const agentsPath = join2(distOpenCodePath, "agent", "ai-eng");
  const agents = await loadContentFromDist(agentsPath, "agent", "ai-eng");
  const skillsPath = join2(distOpenCodePath, "skill");
  const skills = await loadContentFromDist(skillsPath, "skill");
  const toolsPath = join2(distOpenCodePath, "tool");
  const tools = await loadContentFromDist(toolsPath, "tool");
  return {
    commands,
    agents,
    skills,
    tools
  };
}
async function loadContentFromDist(dirPath, baseType, baseDir = "") {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const items = [];
    for (const entry of entries) {
      const fullPath = join2(dirPath, entry.name);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        const subItems = await loadContentFromDist(fullPath, baseType, baseDir ? join2(baseDir, entry.name) : entry.name);
        items.push(...subItems);
      } else if (stats.isFile() && entry.name.endsWith(".md")) {
        const content = await readFile(fullPath, "utf-8");
        const relativePath = baseDir ? join2(baseDir, entry.name) : entry.name;
        items.push({
          name: entry.name.replace(".md", ""),
          path: relativePath,
          type: baseType,
          content
        });
      } else if (stats.isFile() && entry.name.endsWith(".ts")) {
        const content = await readFile(fullPath, "utf-8");
        const relativePath = baseDir ? join2(baseDir, entry.name) : entry.name;
        items.push({
          name: entry.name.replace(".ts", ""),
          path: relativePath,
          type: "tool",
          content
        });
      }
    }
    return items;
  } catch (error) {
    return [];
  }
}
async function getAgentNames() {
  const agents = await getAgentContent();
  return agents.map((agent) => agent.name);
}
async function getCommandNames() {
  const commands = await getCommandContent();
  return commands.map((command) => command.name);
}
async function getSkillNames() {
  const skills = await getSkillContent();
  return skills.map((skill) => skill.name);
}

// src/index.ts
var version = "0.4.1";
export {
  version,
  getSkillsPath,
  getSkillNames,
  getSkillContent,
  getOpenCodePath,
  getOpenCodeContent,
  getDistPath,
  getDistOpenCodePath,
  getDistOpenCodeContent,
  getDistClaudePath,
  getCoreRoot,
  getContentPath,
  getCommandNames,
  getCommandContent,
  getClaudePath,
  getAgentNames,
  getAgentContent
};
