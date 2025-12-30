// src/index.ts
import fs from "node:fs";
import path from "node:path";

// src/types/common.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringRecord(value) {
  if (!isRecord(value))
    return false;
  return Object.values(value).every((v) => typeof v === "string");
}
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function hasProperty(obj, key) {
  return isRecord(obj) && key in obj;
}
function isArray(value) {
  return Array.isArray(value);
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function getProperty(obj, key, defaultValue) {
  if (!isRecord(obj))
    return defaultValue;
  return key in obj ? obj[key] : defaultValue;
}

// src/index.ts
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
function installToProject(pluginDir, projectDir) {
  const isDistDir = fs.existsSync(path.join(pluginDir, ".opencode"));
  const distDir = isDistDir ? pluginDir : path.join(pluginDir, "dist");
  const distOpenCodeDir = path.join(distDir, ".opencode");
  const distSkillsDir = path.join(distDir, "skills");
  const targetOpenCodeDir = path.join(projectDir, ".opencode");
  const NAMESPACE_PREFIX = "ai-eng";
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
var AiEngSystem = async ({ directory }) => {
  const pluginDir = path.dirname(new URL(import.meta.url).pathname);
  try {
    installToProject(pluginDir, directory);
  } catch (error) {
    console.error(`[ai-eng-system] Installation warning: ${error instanceof Error ? error.message : String(error)}`);
  }
  return {};
};
export {
  isStringRecord,
  isString,
  isRecord,
  isObject,
  isNumber,
  isBoolean,
  isArray,
  hasProperty,
  getProperty,
  AiEngSystem
};
