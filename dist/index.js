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
function installToProject(pluginDir, targetDir) {
  const isDistDir = fs.existsSync(path.join(pluginDir, ".opencode"));
  const distDir = isDistDir ? pluginDir : path.join(pluginDir, "dist");
  const distOpenCodeDir = path.join(distDir, ".opencode");
  const distSkillsDir = path.join(distDir, "skills");
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
    installToProject(pluginDir, targetDir);
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
