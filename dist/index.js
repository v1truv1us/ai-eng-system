var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// packages/core/dist/index.js
var exports_dist = {};
__export(exports_dist, {
  version: () => version,
  getSkillsPath: () => getSkillsPath,
  getSkillNames: () => getSkillNames,
  getSkillContent: () => getSkillContent,
  getOpenCodePath: () => getOpenCodePath,
  getOpenCodeContent: () => getOpenCodeContent,
  getDistPath: () => getDistPath,
  getDistOpenCodePath: () => getDistOpenCodePath,
  getDistOpenCodeContent: () => getDistOpenCodeContent,
  getDistClaudePath: () => getDistClaudePath,
  getCoreRoot: () => getCoreRoot,
  getContentPath: () => getContentPath,
  getCommandNames: () => getCommandNames,
  getCommandContent: () => getCommandContent,
  getClaudePath: () => getClaudePath,
  getAgentNames: () => getAgentNames,
  getAgentContent: () => getAgentContent
});
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, readdir, stat } from "node:fs/promises";
import { join as join2 } from "node:path";
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
var __filename2, __dirname2, ROOT, version = "0.5.10";
var init_dist = __esm(() => {
  __filename2 = fileURLToPath(import.meta.url);
  __dirname2 = dirname(__filename2);
  ROOT = dirname(__dirname2);
});

// src/index.ts
import fs from "node:fs";
import path from "node:path";
function fileContainsPlugin(configPath) {
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return content.includes('"ai-eng-system"');
  } catch {
    return false;
  }
}
function findInstallationTarget(projectDir) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const globalConfigPath = path.join(homeDir, ".config", "opencode", "opencode.jsonc");
  if (fs.existsSync(globalConfigPath) && fileContainsPlugin(globalConfigPath)) {
    return path.join(homeDir, ".config", "opencode");
  }
  const projectConfigPath = path.join(projectDir, ".opencode", "opencode.jsonc");
  if (fs.existsSync(projectConfigPath) && fileContainsPlugin(projectConfigPath)) {
    return path.join(projectDir, ".opencode");
  }
  return null;
}
function copyRecursive(src, dest) {
  const stat2 = fs.statSync(src);
  if (stat2.isDirectory()) {
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
async function installToProject(pluginDir, targetDir) {
  try {
    const { getDistOpenCodeContent: getDistOpenCodeContent2 } = await Promise.resolve().then(() => (init_dist(), exports_dist));
    const content = await getDistOpenCodeContent2();
    const NAMESPACE_PREFIX = "ai-eng";
    const targetOpenCodeDir = targetDir;
    if (content.commands.length > 0) {
      const commandsDest = path.join(targetOpenCodeDir, "command", NAMESPACE_PREFIX);
      fs.mkdirSync(commandsDest, { recursive: true });
      for (const command of content.commands) {
        const commandPath = path.join(commandsDest, command.path);
        const commandDir = path.dirname(commandPath);
        fs.mkdirSync(commandDir, { recursive: true });
        if (command.content) {
          fs.writeFileSync(commandPath, command.content, "utf-8");
        }
      }
    }
    if (content.agents.length > 0) {
      const agentsDest = path.join(targetOpenCodeDir, "agent", NAMESPACE_PREFIX);
      fs.mkdirSync(agentsDest, { recursive: true });
      for (const agent of content.agents) {
        const agentPath = path.join(agentsDest, agent.path);
        const agentDir = path.dirname(agentPath);
        fs.mkdirSync(agentDir, { recursive: true });
        if (agent.content) {
          fs.writeFileSync(agentPath, agent.content, "utf-8");
        }
      }
    }
    if (content.skills.length > 0) {
      const skillDest = path.join(targetOpenCodeDir, "skill");
      fs.mkdirSync(skillDest, { recursive: true });
      for (const skill of content.skills) {
        const skillPath = path.join(skillDest, skill.path);
        const skillDir = path.dirname(skillPath);
        fs.mkdirSync(skillDir, { recursive: true });
        if (skill.content) {
          fs.writeFileSync(skillPath, skill.content, "utf-8");
        }
      }
    }
    if (content.tools.length > 0) {
      const toolsDest = path.join(targetOpenCodeDir, "tool");
      fs.mkdirSync(toolsDest, { recursive: true });
      for (const tool of content.tools) {
        const toolPath = path.join(toolsDest, tool.path);
        const toolDir = path.dirname(toolPath);
        fs.mkdirSync(toolDir, { recursive: true });
        if (tool.content) {
          fs.writeFileSync(toolPath, tool.content, "utf-8");
        }
      }
    }
  } catch (error) {
    console.warn("[ai-eng-system] Core package not available, using fallback installation");
    installToProjectFallback(pluginDir, targetDir);
  }
}
function installToProjectFallback(pluginDir, targetDir) {
  const isDistDir = fs.existsSync(path.join(pluginDir, ".opencode"));
  const distDir = isDistDir ? pluginDir : path.join(pluginDir, "dist");
  const distOpenCodeDir = path.join(distDir, ".opencode");
  const NAMESPACE_PREFIX = "ai-eng";
  const targetOpenCodeDir = targetDir;
  const commandsSrc = path.join(distOpenCodeDir, "command", NAMESPACE_PREFIX);
  if (fs.existsSync(commandsSrc)) {
    const commandsDest = path.join(targetOpenCodeDir, "command", NAMESPACE_PREFIX);
    copyRecursive(commandsSrc, commandsDest);
  }
  const agentsSrc = path.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);
  if (fs.existsSync(agentsSrc)) {
    const agentsDest = path.join(targetOpenCodeDir, "agent", NAMESPACE_PREFIX);
    copyRecursive(agentsSrc, agentsDest);
  }
  const distSkillDir = path.join(distDir, ".opencode", "skill");
  if (fs.existsSync(distSkillDir)) {
    const skillDest = path.join(targetOpenCodeDir, "skill");
    copyRecursive(distSkillDir, skillDest);
  }
}
var AiEngSystem = async ({
  project,
  client,
  $,
  directory,
  worktree
}) => {
  const pluginDir = path.dirname(new URL(import.meta.url).pathname);
  const targetDir = findInstallationTarget(directory);
  if (!targetDir) {
    return {
      config: async (input) => {}
    };
  }
  const isFirstRun = !fs.existsSync(path.join(targetDir, "command", "ai-eng"));
  try {
    await installToProject(pluginDir, targetDir);
    if (isFirstRun) {
      console.info(`[ai-eng-system] Installed to: ${targetDir}`);
    }
  } catch (error) {
    console.error(`[ai-eng-system] Installation warning: ${error instanceof Error ? error.message : String(error)}`);
  }
  return {
    config: async (input) => {}
  };
};
var src_default = AiEngSystem;
export {
  src_default as default,
  AiEngSystem
};
