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
var __filename2, __dirname2, ROOT, version = "0.6.0";
var init_dist = __esm(() => {
  __filename2 = fileURLToPath(import.meta.url);
  __dirname2 = dirname(__filename2);
  ROOT = dirname(__dirname2);
});

// src/index.ts
import fs3 from "node:fs";
import path3 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// src/learning-automation/heuristics.ts
import fs from "node:fs";
import path from "node:path";
var DECISION_TERMS = [
  "decision",
  "tradeoff",
  "trade-off",
  "architecture",
  "architectural",
  "migration",
  "schema",
  "api",
  "contract",
  "database",
  "data model",
  "interface"
];
var QUALITY_TERMS = [
  "acceptance criteria",
  "acceptance",
  "validation",
  "validate",
  "verify",
  "checklist",
  "regression",
  "reusable",
  "repeatable",
  "risk",
  "control",
  "guardrail",
  "quality gate"
];
var FILE_TOKEN_PATTERN = /(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.[A-Za-z0-9]+/g;
function clampConfidence(value) {
  return Math.max(0, Math.min(0.99, Number(value.toFixed(2))));
}
function normalizeCommandName(name) {
  const normalized = name.trim().replace(/^\/+/, "");
  const segments = normalized.split("/");
  const command = segments[segments.length - 1]?.toLowerCase();
  return command === "plan" || command === "work" || command === "review" ? command : null;
}
function collectMatches(input, terms) {
  return terms.filter((term) => input.includes(term));
}
function hasMissingDocs(projectDir, docsPath) {
  const absolutePath = path.join(projectDir, docsPath);
  if (!fs.existsSync(absolutePath)) {
    return true;
  }
  try {
    return fs.readdirSync(absolutePath).length === 0;
  } catch {
    return true;
  }
}
function extractLikelyFiles(argumentsText) {
  const matches = argumentsText.match(FILE_TOKEN_PATTERN) ?? [];
  return Array.from(new Set(matches)).slice(0, 3);
}
function buildSuggestedArguments(commandId, sourceCommand, matchedTerms, files) {
  const focus = matchedTerms.slice(0, 2).join(" and ") || "the key outcomes";
  const fileScope = files.length > 0 ? ` for ${files.join(", ")}` : "";
  if (commandId === "decision-journal") {
    return `"Document the durable ${focus} decisions from this /ai-eng/${sourceCommand} run${fileScope}"`;
  }
  return `"Capture reusable validation and risk checks from this /ai-eng/${sourceCommand} run${fileScope}"`;
}
function buildTargetFiles(commandId, files) {
  const docTarget = commandId === "decision-journal" ? "docs/decisions/" : "docs/quality/";
  return Array.from(new Set([docTarget, ...files]));
}
function buildRecommendation(commandId, sourceCommand, matchedTerms, projectDir, argumentsText, createdAt) {
  const files = extractLikelyFiles(argumentsText);
  const missingDocs = hasMissingDocs(projectDir, commandId === "decision-journal" ? "docs/decisions" : "docs/quality");
  const baseScore = commandId === "decision-journal" ? 0.58 : 0.56;
  const confidence = clampConfidence(baseScore + matchedTerms.length * 0.08 + (missingDocs ? 0.08 : 0));
  const rationaleTail = missingDocs ? ` ${commandId === "decision-journal" ? "docs/decisions/" : "docs/quality/"} is missing or empty.` : "";
  const dedupeKey = [
    commandId,
    sourceCommand,
    matchedTerms.slice(0, 3).join(","),
    files.join(",")
  ].join("|");
  const suggestedArguments = buildSuggestedArguments(commandId, sourceCommand, matchedTerms, files);
  return {
    id: `${commandId}-${createdAt}`,
    commandId,
    commandName: `/ai-eng/${commandId}`,
    commandLine: `/ai-eng/${commandId} ${suggestedArguments}`,
    suggestedArguments,
    rationale: `This /ai-eng/${sourceCommand} run references ${matchedTerms.slice(0, 3).join(", ")} and looks like a reusable ${commandId === "decision-journal" ? "decision" : "validation"} opportunity.${rationaleTail}`,
    confidence,
    likelyTargetFiles: buildTargetFiles(commandId, files),
    dedupeKey,
    mode: "suggestion-only",
    sourceEvent: "command.executed",
    createdAt
  };
}
function buildLearningCandidates(event, projectDir, now = Date.now()) {
  const commandName = normalizeCommandName(event.properties.name);
  if (!commandName) {
    return [];
  }
  const argumentsText = event.properties.arguments.trim().toLowerCase();
  if (!argumentsText) {
    return [];
  }
  const candidates = [];
  if (commandName === "plan" || commandName === "work") {
    const decisionMatches = collectMatches(argumentsText, DECISION_TERMS);
    if (decisionMatches.length >= 2) {
      candidates.push(buildRecommendation("decision-journal", commandName, decisionMatches, projectDir, event.properties.arguments, now));
    }
  }
  if (commandName === "plan" || commandName === "work" || commandName === "review") {
    const qualityMatches = collectMatches(argumentsText, QUALITY_TERMS);
    if (qualityMatches.length >= 2) {
      candidates.push(buildRecommendation("quality-gate", commandName, qualityMatches, projectDir, event.properties.arguments, now));
    }
  }
  return candidates.sort((left, right) => right.confidence - left.confidence);
}

// src/learning-automation/state.ts
import fs2 from "node:fs";
import path2 from "node:path";
var LEARNING_DIR = [".ai-context", "learning"];
var STATE_FILE = "state.json";
var POLICY_FILE = "policy.json";
var LATEST_RECOMMENDATION_FILE = "latest-recommendation.json";
var STATE_LOCK_DIR = "state.lock";
var LOCK_METADATA_FILE = "metadata.json";
var LOCK_RETRY_MS = 25;
var LOCK_TIMEOUT_MS = 1e4;
var STALE_LOCK_TIMEOUT_MS = 30000;
var DEFAULT_POLICY = {
  mode: "suggestion-only",
  maxActiveSuggestions: 1,
  surfaceCooldownMinutes: 30,
  actionableRetentionMinutes: 24 * 60,
  defaultSnoozeMinutes: 60,
  commands: {
    "decision-journal": {
      enabled: true,
      cooldownMinutes: 120,
      minimumConfidence: 0.72
    },
    "quality-gate": {
      enabled: true,
      cooldownMinutes: 360,
      minimumConfidence: 0.72
    }
  }
};
var DEFAULT_STATE = {
  version: 2,
  commandLastSurfacedAt: {},
  dedupe: {},
  recommendationHistory: {}
};
function readJsonFile(filePath) {
  if (!fs2.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs2.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
function sanitizeNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function sanitizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function sanitizeConfidence(value, fallback) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, 0), 1);
}
function mergePolicy(input) {
  if (!input || typeof input !== "object") {
    return DEFAULT_POLICY;
  }
  const policy = input;
  const commands = policy.commands;
  return {
    mode: "suggestion-only",
    maxActiveSuggestions: sanitizeNumber(policy.maxActiveSuggestions, DEFAULT_POLICY.maxActiveSuggestions),
    surfaceCooldownMinutes: sanitizeNumber(policy.surfaceCooldownMinutes, DEFAULT_POLICY.surfaceCooldownMinutes),
    actionableRetentionMinutes: sanitizeNumber(policy.actionableRetentionMinutes, DEFAULT_POLICY.actionableRetentionMinutes),
    defaultSnoozeMinutes: sanitizeNumber(policy.defaultSnoozeMinutes, DEFAULT_POLICY.defaultSnoozeMinutes),
    commands: {
      "decision-journal": {
        enabled: sanitizeBoolean(commands?.["decision-journal"]?.enabled, DEFAULT_POLICY.commands["decision-journal"].enabled),
        cooldownMinutes: sanitizeNumber(commands?.["decision-journal"]?.cooldownMinutes, DEFAULT_POLICY.commands["decision-journal"].cooldownMinutes),
        minimumConfidence: sanitizeConfidence(commands?.["decision-journal"]?.minimumConfidence, DEFAULT_POLICY.commands["decision-journal"].minimumConfidence)
      },
      "quality-gate": {
        enabled: sanitizeBoolean(commands?.["quality-gate"]?.enabled, DEFAULT_POLICY.commands["quality-gate"].enabled),
        cooldownMinutes: sanitizeNumber(commands?.["quality-gate"]?.cooldownMinutes, DEFAULT_POLICY.commands["quality-gate"].cooldownMinutes),
        minimumConfidence: sanitizeConfidence(commands?.["quality-gate"]?.minimumConfidence, DEFAULT_POLICY.commands["quality-gate"].minimumConfidence)
      }
    }
  };
}
function getLearningDirectory(projectDir) {
  return path2.join(projectDir, ...LEARNING_DIR);
}
function ensureLearningDirectory(projectDir) {
  const learningDir = getLearningDirectory(projectDir);
  fs2.mkdirSync(learningDir, { recursive: true });
  return learningDir;
}
function loadLearningPolicy(projectDir) {
  const learningDir = ensureLearningDirectory(projectDir);
  return mergePolicy(readJsonFile(path2.join(learningDir, POLICY_FILE)));
}
function loadLearningState(projectDir) {
  const learningDir = ensureLearningDirectory(projectDir);
  const state = readJsonFile(path2.join(learningDir, STATE_FILE));
  if (!state) {
    return { ...DEFAULT_STATE };
  }
  if (state.version === 1) {
    return {
      version: 2,
      commandLastSurfacedAt: state.commandLastSurfacedAt ?? {},
      dedupe: state.dedupe ?? {},
      lastSurfacedAt: state.lastSurfacedAt,
      activeRecommendation: state.activeRecommendation,
      recommendationHistory: {}
    };
  }
  if (state.version !== 2) {
    return { ...DEFAULT_STATE };
  }
  return {
    version: 2,
    commandLastSurfacedAt: state.commandLastSurfacedAt ?? {},
    dedupe: state.dedupe ?? {},
    lastSurfacedAt: state.lastSurfacedAt,
    activeRecommendation: state.activeRecommendation,
    recommendationHistory: state.recommendationHistory ?? {}
  };
}
function saveLearningState(projectDir, state) {
  const learningDir = ensureLearningDirectory(projectDir);
  fs2.writeFileSync(path2.join(learningDir, STATE_FILE), JSON.stringify(state, null, 2), "utf-8");
}
function saveLatestRecommendation(projectDir, recommendation) {
  const learningDir = ensureLearningDirectory(projectDir);
  fs2.writeFileSync(path2.join(learningDir, LATEST_RECOMMENDATION_FILE), JSON.stringify(recommendation, null, 2), "utf-8");
}
function clearLatestRecommendation(projectDir) {
  const learningDir = ensureLearningDirectory(projectDir);
  fs2.rmSync(path2.join(learningDir, LATEST_RECOMMENDATION_FILE), {
    force: true
  });
}
function loadLatestRecommendation(projectDir) {
  const learningDir = ensureLearningDirectory(projectDir);
  return readJsonFile(path2.join(learningDir, LATEST_RECOMMENDATION_FILE));
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function readLockMetadata(lockPath) {
  return readJsonFile(path2.join(lockPath, LOCK_METADATA_FILE));
}
function writeLockMetadata(lockPath) {
  fs2.writeFileSync(path2.join(lockPath, LOCK_METADATA_FILE), JSON.stringify({
    acquiredAt: Date.now(),
    pid: typeof process.pid === "number" ? process.pid : undefined
  }, null, 2), "utf-8");
}
function maybeClearStaleLock(lockPath, now) {
  const metadata = readLockMetadata(lockPath);
  const staleAt = metadata?.acquiredAt;
  if (typeof staleAt !== "number" || now - staleAt < STALE_LOCK_TIMEOUT_MS) {
    return false;
  }
  fs2.rmSync(lockPath, { recursive: true, force: true });
  return true;
}
async function withLearningStateLock(projectDir, callback) {
  const learningDir = ensureLearningDirectory(projectDir);
  const lockPath = path2.join(learningDir, STATE_LOCK_DIR);
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  while (true) {
    try {
      fs2.mkdirSync(lockPath);
      writeLockMetadata(lockPath);
      break;
    } catch (error) {
      if (!(error instanceof Error && ("code" in error) && error.code === "EEXIST")) {
        throw error;
      }
      if (maybeClearStaleLock(lockPath, Date.now())) {
        continue;
      }
      if (Date.now() >= deadline) {
        throw new Error("Timed out waiting for learning automation state lock.");
      }
      await sleep(LOCK_RETRY_MS);
    }
  }
  try {
    return await callback();
  } finally {
    fs2.rmSync(lockPath, { recursive: true, force: true });
  }
}

// src/learning-automation/suggestions.ts
var MINUTE = 60 * 1000;
var DEDUPE_RETENTION_MS = 24 * 60 * MINUTE;
function minutesToMs(minutes) {
  return minutes * MINUTE;
}
function normalizeLearningState(state, policy, now = Date.now()) {
  const nextDedupe = Object.fromEntries(Object.entries(state.dedupe).filter(([, timestamp]) => now - timestamp < DEDUPE_RETENTION_MS));
  const activeRecommendation = state.activeRecommendation && (state.activeRecommendation.status === "execution-failed" || state.activeRecommendation.status === "approving" || now - state.activeRecommendation.surfacedAt < minutesToMs(policy.actionableRetentionMinutes)) ? state.activeRecommendation : undefined;
  return {
    ...state,
    dedupe: nextDedupe,
    activeRecommendation
  };
}
function selectSuggestion(candidates, state, policy, now = Date.now()) {
  if (policy.maxActiveSuggestions <= 0 || state.activeRecommendation) {
    return null;
  }
  if (state.lastSurfacedAt !== undefined && now - state.lastSurfacedAt < minutesToMs(policy.surfaceCooldownMinutes)) {
    return null;
  }
  const eligible = candidates.filter((candidate) => {
    const commandPolicy = policy.commands[candidate.commandId];
    if (!commandPolicy.enabled) {
      return false;
    }
    if (candidate.confidence < commandPolicy.minimumConfidence) {
      return false;
    }
    const lastCommandSurface = state.commandLastSurfacedAt[candidate.commandId];
    if (lastCommandSurface !== undefined && now - lastCommandSurface < minutesToMs(commandPolicy.cooldownMinutes)) {
      return false;
    }
    const lastDuplicateSurface = state.dedupe[candidate.dedupeKey];
    if (lastDuplicateSurface !== undefined && now - lastDuplicateSurface < minutesToMs(commandPolicy.cooldownMinutes)) {
      return false;
    }
    const historyEntry = state.recommendationHistory[candidate.dedupeKey];
    if (historyEntry?.status === "snoozed" && historyEntry.snoozedUntil !== undefined && historyEntry.snoozedUntil > now) {
      return false;
    }
    return true;
  });
  return eligible.sort((left, right) => right.confidence - left.confidence)[0] ?? null;
}
function applySurfacedSuggestion(state, recommendation, now = Date.now()) {
  return {
    ...state,
    lastSurfacedAt: now,
    commandLastSurfacedAt: {
      ...state.commandLastSurfacedAt,
      [recommendation.commandId]: now
    },
    dedupe: {
      ...state.dedupe,
      [recommendation.dedupeKey]: now
    },
    activeRecommendation: {
      id: recommendation.id,
      commandId: recommendation.commandId,
      dedupeKey: recommendation.dedupeKey,
      surfacedAt: now,
      status: "surfaced"
    },
    recommendationHistory: {
      ...state.recommendationHistory,
      [recommendation.dedupeKey]: {
        id: recommendation.id,
        commandId: recommendation.commandId,
        status: "surfaced",
        surfacedAt: now,
        updatedAt: now,
        commandLine: recommendation.commandLine
      }
    }
  };
}
function applyDismissedSuggestion(state, recommendation, now = Date.now()) {
  const previousEntry = state.recommendationHistory[recommendation.dedupeKey];
  return {
    ...state,
    activeRecommendation: undefined,
    recommendationHistory: {
      ...state.recommendationHistory,
      [recommendation.dedupeKey]: {
        id: recommendation.id,
        commandId: recommendation.commandId,
        status: "dismissed",
        surfacedAt: previousEntry?.surfacedAt,
        dismissedAt: now,
        updatedAt: now,
        commandLine: recommendation.commandLine
      }
    }
  };
}
function applySnoozedSuggestion(state, recommendation, snoozedUntil, now = Date.now()) {
  const previousEntry = state.recommendationHistory[recommendation.dedupeKey];
  return {
    ...state,
    activeRecommendation: undefined,
    recommendationHistory: {
      ...state.recommendationHistory,
      [recommendation.dedupeKey]: {
        id: recommendation.id,
        commandId: recommendation.commandId,
        status: "snoozed",
        surfacedAt: previousEntry?.surfacedAt,
        snoozedUntil,
        updatedAt: now,
        commandLine: recommendation.commandLine
      }
    }
  };
}
function applyApprovedSuggestion(state, recommendation, now = Date.now(), lastError) {
  const previousEntry = state.recommendationHistory[recommendation.dedupeKey];
  return {
    ...state,
    activeRecommendation: {
      id: recommendation.id,
      commandId: recommendation.commandId,
      dedupeKey: recommendation.dedupeKey,
      surfacedAt: state.activeRecommendation?.surfacedAt ?? now,
      status: lastError ? "execution-failed" : "approving",
      lastError
    },
    recommendationHistory: {
      ...state.recommendationHistory,
      [recommendation.dedupeKey]: {
        id: recommendation.id,
        commandId: recommendation.commandId,
        status: lastError ? "approved" : "approving",
        surfacedAt: previousEntry?.surfacedAt,
        approvedAt: now,
        updatedAt: now,
        commandLine: recommendation.commandLine,
        lastError
      }
    }
  };
}
function applyExecutedSuggestion(state, recommendation, now = Date.now()) {
  const previousEntry = state.recommendationHistory[recommendation.dedupeKey];
  return {
    ...state,
    activeRecommendation: undefined,
    recommendationHistory: {
      ...state.recommendationHistory,
      [recommendation.dedupeKey]: {
        id: recommendation.id,
        commandId: recommendation.commandId,
        status: "executed",
        surfacedAt: previousEntry?.surfacedAt,
        approvedAt: previousEntry?.approvedAt ?? now,
        executedAt: now,
        updatedAt: now,
        commandLine: recommendation.commandLine
      }
    }
  };
}

// src/learning-automation/runtime.ts
var MINUTE_MS = 60 * 1000;
var MAX_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
var ALLOWED_APPROVAL_COMMANDS = new Set([
  "decision-journal",
  "quality-gate"
]);
function normalizeControlCommandName(name) {
  const normalized = name.trim().replace(/^\/+/, "");
  const segments = normalized.split("/");
  const command = segments[segments.length - 1]?.toLowerCase();
  return command === "learning-approve" || command === "learning-dismiss" || command === "learning-snooze" ? command : null;
}
function parseSnoozeDurationMs(argumentsText, defaultSnoozeMinutes) {
  const match = argumentsText.trim().toLowerCase().match(/^(\d+)\s*([mhd])?$/);
  if (!match) {
    return defaultSnoozeMinutes * MINUTE_MS;
  }
  const value = Number.parseInt(match[1] ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) {
    return defaultSnoozeMinutes * MINUTE_MS;
  }
  const unit = match[2] ?? "m";
  const multiplier = unit === "d" ? 24 * 60 * 60 * 1000 : unit === "h" ? 60 * 60 * 1000 : 60 * 1000;
  return Math.min(value * multiplier, MAX_SNOOZE_MS);
}
function loadActionableRecommendation(projectDir, policy, now) {
  const state = normalizeLearningState(loadLearningState(projectDir), policy, now);
  const latestRecommendation = loadLatestRecommendation(projectDir);
  const activeRecommendation = state.activeRecommendation;
  if (!latestRecommendation || !activeRecommendation) {
    return null;
  }
  if (latestRecommendation.id !== activeRecommendation.id || latestRecommendation.dedupeKey !== activeRecommendation.dedupeKey || latestRecommendation.commandId !== activeRecommendation.commandId) {
    return null;
  }
  return {
    recommendation: latestRecommendation,
    state
  };
}
function buildExecutableLearningCommand(recommendation) {
  if (!ALLOWED_APPROVAL_COMMANDS.has(recommendation.commandId)) {
    return null;
  }
  const expectedCommandName = `/ai-eng/${recommendation.commandId}`;
  if (recommendation.commandName !== expectedCommandName || recommendation.mode !== "suggestion-only" || recommendation.sourceEvent !== "command.executed") {
    return null;
  }
  const trimmedArguments = recommendation.suggestedArguments.trim();
  if (!trimmedArguments || /[\r\n\0]/.test(trimmedArguments) || !trimmedArguments.startsWith('"') || !trimmedArguments.endsWith('"')) {
    return null;
  }
  return `${expectedCommandName} ${trimmedArguments}`;
}
function matchesRecommendation(recommendation, activeRecommendation) {
  return activeRecommendation?.id === recommendation.id && activeRecommendation.commandId === recommendation.commandId && activeRecommendation.dedupeKey === recommendation.dedupeKey;
}
function createLearningAutomationRuntime({
  projectDir,
  notifySuggestion,
  notifyStatus,
  executeCommand,
  now = () => Date.now()
}) {
  let eventQueue = Promise.resolve();
  async function handleControlCommand(commandId, argumentsText) {
    let statusMessage = "No active learning recommendation to act on.";
    let statusVariant = "warning";
    let pendingApproval;
    await withLearningStateLock(projectDir, async () => {
      const policy = loadLearningPolicy(projectDir);
      const currentTime = now();
      const loaded = loadActionableRecommendation(projectDir, policy, currentTime);
      if (!loaded) {
        return;
      }
      const { recommendation, state } = loaded;
      if (state.activeRecommendation?.status === "approving") {
        statusMessage = "Learning suggestion approval already in progress.";
        return;
      }
      const executableCommand = buildExecutableLearningCommand(recommendation);
      if (!executableCommand) {
        statusMessage = "Learning recommendation is invalid or no longer actionable.";
        return;
      }
      if (commandId === "learning-dismiss") {
        saveLearningState(projectDir, applyDismissedSuggestion(state, recommendation, currentTime));
        statusMessage = "Learning suggestion dismissed.";
        statusVariant = "info";
        return;
      }
      if (commandId === "learning-snooze") {
        const snoozedUntil = currentTime + parseSnoozeDurationMs(argumentsText, policy.defaultSnoozeMinutes);
        saveLearningState(projectDir, applySnoozedSuggestion(state, recommendation, snoozedUntil, currentTime));
        statusMessage = "Learning suggestion snoozed.";
        statusVariant = "info";
        return;
      }
      saveLearningState(projectDir, applyApprovedSuggestion(state, recommendation, currentTime));
      pendingApproval = {
        recommendation,
        executableCommand,
        approvedAt: currentTime
      };
    });
    if (pendingApproval) {
      const approval = pendingApproval;
      try {
        await executeCommand(approval.executableCommand);
        await withLearningStateLock(projectDir, async () => {
          const currentState = loadLearningState(projectDir);
          if (!matchesRecommendation(approval.recommendation, currentState.activeRecommendation) || currentState.activeRecommendation?.status !== "approving") {
            return;
          }
          saveLearningState(projectDir, applyExecutedSuggestion(currentState, approval.recommendation, now()));
        });
        statusMessage = `Executed ${approval.executableCommand}.`;
        statusVariant = "success";
      } catch (error) {
        await withLearningStateLock(projectDir, async () => {
          const currentState = loadLearningState(projectDir);
          if (!matchesRecommendation(approval.recommendation, currentState.activeRecommendation) || currentState.activeRecommendation?.status !== "approving") {
            return;
          }
          saveLearningState(projectDir, applyApprovedSuggestion(currentState, approval.recommendation, approval.approvedAt, error instanceof Error ? error.message : String(error)));
        });
        statusMessage = "Learning command failed. Retry with /ai-eng/learning-approve.";
        statusVariant = "error";
      }
    }
    await notifyStatus(statusMessage, statusVariant);
  }
  async function processEvent(event) {
    if (event.type === "session.created" || event.type === "session.idle") {
      return;
    }
    if (event.type !== "command.executed") {
      return;
    }
    const controlCommand = normalizeControlCommandName(event.properties.name);
    if (controlCommand) {
      await handleControlCommand(controlCommand, event.properties.arguments ?? "");
      return;
    }
    const currentTime = now();
    const candidates = buildLearningCandidates(event, projectDir, currentTime);
    let notification;
    await withLearningStateLock(projectDir, async () => {
      const policy = loadLearningPolicy(projectDir);
      const state = normalizeLearningState(loadLearningState(projectDir), policy, currentTime);
      const recommendation = selectSuggestion(candidates, state, policy, currentTime);
      if (!recommendation) {
        return;
      }
      const previousLatestRecommendation = loadLatestRecommendation(projectDir);
      const nextState = applySurfacedSuggestion(state, recommendation, currentTime);
      saveLatestRecommendation(projectDir, recommendation);
      saveLearningState(projectDir, nextState);
      notification = {
        recommendation,
        previousState: state,
        previousLatestRecommendation
      };
    });
    if (!notification) {
      return;
    }
    const surfacedNotification = notification;
    try {
      await notifySuggestion(surfacedNotification.recommendation);
    } catch {
      await withLearningStateLock(projectDir, async () => {
        const currentState = loadLearningState(projectDir);
        const currentLatestRecommendation = loadLatestRecommendation(projectDir);
        if (!matchesRecommendation(surfacedNotification.recommendation, currentState.activeRecommendation) || currentState.activeRecommendation?.status !== "surfaced" || currentLatestRecommendation?.id !== surfacedNotification.recommendation.id || currentLatestRecommendation?.dedupeKey !== surfacedNotification.recommendation.dedupeKey || currentLatestRecommendation?.commandId !== surfacedNotification.recommendation.commandId) {
          return;
        }
        saveLearningState(projectDir, surfacedNotification.previousState);
        if (surfacedNotification.previousLatestRecommendation) {
          saveLatestRecommendation(projectDir, surfacedNotification.previousLatestRecommendation);
        } else {
          clearLatestRecommendation(projectDir);
        }
      });
    }
  }
  return {
    async handleEvent(event) {
      const run = eventQueue.then(() => processEvent(event));
      eventQueue = run.catch(() => {
        return;
      });
      await run;
    }
  };
}

// src/index.ts
function fileContainsPlugin(configPath) {
  try {
    const content = fs3.readFileSync(configPath, "utf-8");
    return content.includes('"ai-eng-system"');
  } catch {
    return false;
  }
}
function findInstallationTarget(projectDir) {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const globalConfigDir = path3.join(homeDir, ".config", "opencode");
  const projectOpenCodeDir = path3.join(projectDir, ".opencode");
  const candidates = [
    {
      configPath: path3.join(globalConfigDir, "opencode.jsonc"),
      targetDir: globalConfigDir
    },
    {
      configPath: path3.join(globalConfigDir, "opencode.json"),
      targetDir: globalConfigDir
    },
    {
      configPath: path3.join(projectOpenCodeDir, "opencode.jsonc"),
      targetDir: projectOpenCodeDir
    },
    {
      configPath: path3.join(projectOpenCodeDir, "opencode.json"),
      targetDir: projectOpenCodeDir
    },
    {
      configPath: path3.join(projectDir, "opencode.jsonc"),
      targetDir: projectOpenCodeDir
    },
    {
      configPath: path3.join(projectDir, "opencode.json"),
      targetDir: projectOpenCodeDir
    }
  ];
  for (const candidate of candidates) {
    if (fs3.existsSync(candidate.configPath) && fileContainsPlugin(candidate.configPath)) {
      return candidate.targetDir;
    }
  }
  return null;
}
function copyRecursive(src, dest) {
  const stat2 = fs3.statSync(src);
  if (stat2.isDirectory()) {
    fs3.mkdirSync(dest, { recursive: true });
    const entries = fs3.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path3.join(src, entry), path3.join(dest, entry));
    }
  } else {
    fs3.mkdirSync(path3.dirname(dest), { recursive: true });
    fs3.copyFileSync(src, dest);
  }
}
async function installToProject(pluginDir, targetDir) {
  try {
    const { getDistOpenCodeContent: getDistOpenCodeContent2 } = await Promise.resolve().then(() => (init_dist(), exports_dist));
    const content = await getDistOpenCodeContent2();
    const NAMESPACE_PREFIX = "ai-eng";
    const targetOpenCodeDir = targetDir;
    if (content.commands.length > 0) {
      const commandsDest = path3.join(targetOpenCodeDir, "command", NAMESPACE_PREFIX);
      fs3.mkdirSync(commandsDest, { recursive: true });
      for (const command of content.commands) {
        const commandPath = path3.join(commandsDest, command.path);
        const commandDir = path3.dirname(commandPath);
        fs3.mkdirSync(commandDir, { recursive: true });
        if (command.content) {
          fs3.writeFileSync(commandPath, command.content, "utf-8");
        }
      }
    }
    if (content.agents.length > 0) {
      const agentsDest = path3.join(targetOpenCodeDir, "agent", NAMESPACE_PREFIX);
      fs3.mkdirSync(agentsDest, { recursive: true });
      for (const agent of content.agents) {
        const agentPath = path3.join(agentsDest, agent.path);
        const agentDir = path3.dirname(agentPath);
        fs3.mkdirSync(agentDir, { recursive: true });
        if (agent.content) {
          fs3.writeFileSync(agentPath, agent.content, "utf-8");
        }
      }
    }
    if (content.skills.length > 0) {
      const skillDest = path3.join(targetOpenCodeDir, "skill");
      fs3.mkdirSync(skillDest, { recursive: true });
      for (const skill of content.skills) {
        const skillPath = path3.join(skillDest, skill.path);
        const skillDir = path3.dirname(skillPath);
        fs3.mkdirSync(skillDir, { recursive: true });
        if (skill.content) {
          fs3.writeFileSync(skillPath, skill.content, "utf-8");
        }
      }
    }
    if (content.tools.length > 0) {
      const toolsDest = path3.join(targetOpenCodeDir, "tool");
      fs3.mkdirSync(toolsDest, { recursive: true });
      for (const tool of content.tools) {
        const toolPath = path3.join(toolsDest, tool.path);
        const toolDir = path3.dirname(toolPath);
        fs3.mkdirSync(toolDir, { recursive: true });
        if (tool.content) {
          fs3.writeFileSync(toolPath, tool.content, "utf-8");
        }
      }
    }
  } catch (error) {
    console.warn("[ai-eng-system] Core package not available, using fallback installation");
    installToProjectFallback(pluginDir, targetDir);
  }
}
function installToProjectFallback(pluginDir, targetDir) {
  const isDistDir = fs3.existsSync(path3.join(pluginDir, ".opencode"));
  const distDir = isDistDir ? pluginDir : path3.join(pluginDir, "dist");
  const distOpenCodeDir = path3.join(distDir, ".opencode");
  const NAMESPACE_PREFIX = "ai-eng";
  const targetOpenCodeDir = targetDir;
  const commandsSrc = path3.join(distOpenCodeDir, "command", NAMESPACE_PREFIX);
  if (fs3.existsSync(commandsSrc)) {
    const commandsDest = path3.join(targetOpenCodeDir, "command", NAMESPACE_PREFIX);
    copyRecursive(commandsSrc, commandsDest);
  }
  const agentsSrc = path3.join(distOpenCodeDir, "agent", NAMESPACE_PREFIX);
  if (fs3.existsSync(agentsSrc)) {
    const agentsDest = path3.join(targetOpenCodeDir, "agent", NAMESPACE_PREFIX);
    copyRecursive(agentsSrc, agentsDest);
  }
  const distSkillDir = path3.join(distDir, ".opencode", "skill");
  if (fs3.existsSync(distSkillDir)) {
    const skillDest = path3.join(targetOpenCodeDir, "skill");
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
  const projectRoot = worktree || directory;
  const pluginDir = path3.dirname(fileURLToPath2(import.meta.url));
  const targetDir = findInstallationTarget(projectRoot);
  if (!targetDir) {
    return {
      config: async (input) => {}
    };
  }
  const isFirstRun = !fs3.existsSync(path3.join(targetDir, "command", "ai-eng"));
  try {
    await installToProject(pluginDir, targetDir);
    if (isFirstRun) {
      console.info(`[ai-eng-system] Installed to: ${targetDir}`);
    }
  } catch (error) {
    console.error(`[ai-eng-system] Installation warning: ${error instanceof Error ? error.message : String(error)}`);
  }
  const learningAutomation = createLearningAutomationRuntime({
    projectDir: projectRoot,
    notifySuggestion: async (recommendation) => {
      await client.tui.showToast({
        body: {
          title: "AI Eng learning suggestion",
          message: `${recommendation.commandLine} (${Math.round(recommendation.confidence * 100)}%). Approve: /ai-eng/learning-approve · Dismiss: /ai-eng/learning-dismiss · Snooze: /ai-eng/learning-snooze [duration]`,
          variant: "info",
          duration: 8000
        }
      });
    },
    notifyStatus: async (message, variant) => {
      await client.tui.showToast({
        body: {
          title: "AI Eng learning automation",
          message,
          variant,
          duration: 8000
        }
      });
    },
    executeCommand: async (command) => {
      await client.tui.executeCommand({
        body: { command },
        query: { directory: projectRoot }
      });
    }
  });
  return {
    event: async ({ event }) => {
      try {
        await learningAutomation.handleEvent(event);
      } catch (error) {
        console.warn(`[ai-eng-system] Learning automation warning: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    config: async (input) => {}
  };
};
var src_default = AiEngSystem;
export {
  src_default as default,
  AiEngSystem
};
