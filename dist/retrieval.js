import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/context/types.ts
var exports_types = {};
__export(exports_types, {
  loadConfig: () => loadConfig,
  createCommandEnvelope: () => createCommandEnvelope,
  DEFAULT_CONFIG: () => DEFAULT_CONFIG
});
function mergeContextConfig(base, overrides) {
  const merged = {
    ...base,
    ...overrides,
    export: {
      ...base.export,
      ...overrides?.export,
      markdown: {
        ...base.export?.markdown,
        ...overrides?.export?.markdown
      }
    }
  };
  return merged;
}
async function loadConfig(customConfig) {
  const baseConfig = mergeContextConfig(DEFAULT_CONFIG, customConfig);
  try {
    const { readFile } = await import("node:fs/promises");
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const configPath = join(baseConfig.storagePath, "config.json");
    if (existsSync(configPath)) {
      const configContent = await readFile(configPath, "utf-8");
      const projectConfig = JSON.parse(configContent);
      return mergeContextConfig(baseConfig, projectConfig);
    }
  } catch (error) {
    const silent = process.env.AI_ENG_SILENT === "1" || process.env.AI_ENG_SILENT === "true" || false || process.env.BUN_TEST === "1" || process.env.BUN_TEST === "true";
    if (!silent) {
      console.warn("Could not load context config, using defaults:", error);
    }
  }
  return baseConfig;
}
function createCommandEnvelope(input) {
  const createdAt = new Date().toISOString();
  const id = `env_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  let errorPayload;
  if (input.error instanceof Error) {
    errorPayload = {
      message: input.error.message,
      name: input.error.name,
      stack: input.error.stack
    };
  } else if (input.error) {
    errorPayload = {
      message: String(input.error)
    };
  }
  return {
    id,
    createdAt,
    commandName: input.commandName,
    status: input.status,
    durationMs: Math.max(0, input.endTimeMs - input.startTimeMs),
    inputs: input.inputs,
    outputSummary: input.outputSummary,
    filesTouched: input.filesTouched || [],
    decisions: input.decisions || [],
    tags: Array.from(new Set([
      "command-envelope",
      `command:${input.commandName}`,
      ...input.tags || []
    ])),
    sessionId: input.sessionId,
    project: input.project,
    error: input.status === "failure" ? errorPayload : undefined
  };
}
var DEFAULT_CONFIG;
var init_types = __esm(() => {
  DEFAULT_CONFIG = {
    storagePath: ".ai-context",
    maxMemoriesPerType: 100,
    sessionArchiveDays: 30,
    confidenceDecayRate: 0.05,
    enableEmbeddings: false,
    defaultSkillTier: 1,
    enableAutoInference: true,
    export: {
      enabled: false,
      markdown: {
        outputDir: ".ai-context/exports"
      }
    }
  };
});

// src/context/memory.ts
init_types();
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

class MemoryManager {
  config;
  memoryDir;
  store = {
    declarative: [],
    procedural: [],
    episodic: []
  };
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryDir = join(this.config.storagePath, "memory");
  }
  async initialize() {
    await mkdir(this.memoryDir, { recursive: true });
    await this.loadMemories();
  }
  async loadMemories() {
    const types = ["declarative", "procedural", "episodic"];
    for (const type of types) {
      const path = join(this.memoryDir, `${type}.json`);
      if (existsSync(path)) {
        try {
          const content = await readFile(path, "utf-8");
          this.store[type] = JSON.parse(content);
          this.store[type] = this.store[type].map((entry) => this.applyConfidenceDecay(entry));
        } catch (error) {
          console.error(`Failed to load ${type} memories:`, error);
        }
      }
    }
  }
  async saveMemories() {
    const types = ["declarative", "procedural", "episodic"];
    for (const type of types) {
      const path = join(this.memoryDir, `${type}.json`);
      await writeFile(path, JSON.stringify(this.store[type], null, 2));
    }
  }
  async addMemory(type, content, options) {
    const now = new Date().toISOString();
    const entry = {
      id: `mem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      content,
      provenance: {
        source: options?.source || "user",
        timestamp: now,
        confidence: options?.confidence ?? (options?.source === "inferred" ? 0.7 : 1),
        context: options?.context || "",
        sessionId: options?.sessionId
      },
      tags: options?.tags || [],
      lastAccessed: now,
      accessCount: 0
    };
    this.store[type].push(entry);
    if (this.store[type].length > this.config.maxMemoriesPerType) {
      this.store[type].sort((a, b) => {
        const scoreA = a.accessCount / (Date.now() - new Date(a.lastAccessed).getTime());
        const scoreB = b.accessCount / (Date.now() - new Date(b.lastAccessed).getTime());
        return scoreA - scoreB;
      });
      this.store[type] = this.store[type].slice(-this.config.maxMemoriesPerType);
    }
    await this.saveMemories();
    return entry;
  }
  async updateMemory(id, updates) {
    for (const type of Object.keys(this.store)) {
      const entry = this.store[type].find((e) => e.id === id);
      if (entry) {
        Object.assign(entry, updates);
        entry.lastAccessed = new Date().toISOString();
        await this.saveMemories();
        return entry;
      }
    }
    return null;
  }
  async accessMemory(id) {
    for (const type of Object.keys(this.store)) {
      const entry = this.store[type].find((e) => e.id === id);
      if (entry) {
        entry.lastAccessed = new Date().toISOString();
        entry.accessCount++;
        await this.saveMemories();
        return entry;
      }
    }
    return null;
  }
  async deleteMemory(id) {
    for (const type of Object.keys(this.store)) {
      const index = this.store[type].findIndex((e) => e.id === id);
      if (index > -1) {
        this.store[type].splice(index, 1);
        await this.saveMemories();
        return true;
      }
    }
    return false;
  }
  async storeCommandEnvelope(envelope, options) {
    return this.addMemory("episodic", JSON.stringify(envelope, null, 2), {
      source: options?.source ?? "agent",
      confidence: options?.confidence ?? 1,
      context: options?.context ?? `Command envelope: ${envelope.commandName}`,
      sessionId: envelope.sessionId,
      tags: envelope.tags
    });
  }
  getLatestCommandEnvelope(filter) {
    const episodic = this.getMemoriesByType("episodic");
    const candidates = episodic.filter((entry) => entry.tags.includes("command-envelope")).filter((entry) => filter?.commandName ? entry.tags.includes(`command:${filter.commandName}`) : true).filter((entry) => filter?.sessionId ? entry.provenance.sessionId === filter.sessionId : true).sort((a, b) => new Date(b.provenance.timestamp).getTime() - new Date(a.provenance.timestamp).getTime());
    const latest = candidates[0];
    if (!latest)
      return null;
    try {
      return JSON.parse(latest.content);
    } catch {
      return null;
    }
  }
  searchMemories(query, options) {
    const queryLower = query.toLowerCase();
    const results = [];
    const types = options?.type ? [options.type] : Object.keys(this.store);
    for (const type of types) {
      results.push(...this.store[type].filter((entry) => {
        if (!entry.content.toLowerCase().includes(queryLower)) {
          return false;
        }
        if (options?.tags && options.tags.length > 0) {
          if (!options.tags.some((tag) => entry.tags.includes(tag))) {
            return false;
          }
        }
        if (options?.minConfidence && entry.provenance.confidence < options.minConfidence) {
          return false;
        }
        return true;
      }));
    }
    results.sort((a, b) => {
      const scoreA = a.accessCount * a.provenance.confidence;
      const scoreB = b.accessCount * b.provenance.confidence;
      if (scoreA !== scoreB)
        return scoreB - scoreA;
      const timeA = new Date(a.lastAccessed).getTime();
      const timeB = new Date(b.lastAccessed).getTime();
      return timeB - timeA;
    });
    return results;
  }
  getMemoriesByType(type) {
    return this.store[type];
  }
  getAllMemories() {
    return [
      ...this.store.declarative,
      ...this.store.procedural,
      ...this.store.episodic
    ];
  }
  getStats() {
    const all = this.getAllMemories();
    const byType = {
      declarative: this.store.declarative.length,
      procedural: this.store.procedural.length,
      episodic: this.store.episodic.length
    };
    const avgConfidence = all.length > 0 ? all.reduce((sum, m) => sum + m.provenance.confidence, 0) / all.length : 0;
    const sorted = [...all].sort((a, b) => new Date(a.provenance.timestamp).getTime() - new Date(b.provenance.timestamp).getTime());
    return {
      total: all.length,
      byType,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      oldestMemory: sorted[0]?.id || null,
      newestMemory: sorted[sorted.length - 1]?.id || null
    };
  }
  applyConfidenceDecay(entry) {
    const now = new Date;
    const created = new Date(entry.provenance.timestamp);
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (entry.provenance.source === "inferred") {
      const decayFactor = (1 - this.config.confidenceDecayRate) ** daysSinceCreation;
      entry.provenance.confidence *= decayFactor;
    } else if (entry.provenance.source === "agent") {
      const decayFactor = (1 - this.config.confidenceDecayRate * 0.5) ** daysSinceCreation;
      entry.provenance.confidence *= decayFactor;
    }
    return entry;
  }
  async archiveOldMemories(daysThreshold = 30) {
    const now = new Date;
    let archived = 0;
    for (const type of ["declarative", "procedural"]) {
      const toArchive = this.store[type].filter((entry) => {
        const created = new Date(entry.provenance.timestamp);
        const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > daysThreshold && entry.accessCount < 3;
      });
      for (const entry of toArchive) {
        const summary = `[${type}] ${entry.content.substring(0, 100)}... (archived from ${entry.provenance.timestamp})`;
        await this.addMemory("episodic", summary, {
          source: "inferred",
          context: `Archived from ${type}`,
          tags: ["archived", type]
        });
        const index = this.store[type].indexOf(entry);
        if (index > -1) {
          this.store[type].splice(index, 1);
          archived++;
        }
      }
    }
    if (archived > 0) {
      await this.saveMemories();
    }
    return archived;
  }
  getSummary(maxItems = 5) {
    const stats = this.getStats();
    const lines = [
      "## Memory System",
      `Total memories: ${stats.total}`,
      `- Declarative: ${stats.byType.declarative}`,
      `- Procedural: ${stats.byType.procedural}`,
      `- Episodic: ${stats.byType.episodic}`,
      `Average confidence: ${stats.avgConfidence}`,
      ""
    ];
    const recent = this.getAllMemories().sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()).filter((m) => m.provenance.confidence > 0.7).slice(0, maxItems);
    if (recent.length > 0) {
      lines.push("### Recent High-Confidence Memories");
      for (const mem of recent) {
        lines.push(`- [${mem.type}] ${mem.content.substring(0, 80)}...`);
      }
    }
    return lines.join(`
`);
  }
}

// src/context/progressive.ts
import { existsSync as existsSync2 } from "node:fs";
import { readFile as readFile2, readdir } from "node:fs/promises";
import { join as join2 } from "node:path";

class ProgressiveSkillLoader {
  skillsDir;
  loadedCache = new Map;
  constructor(skillsDir = "./skills") {
    this.skillsDir = skillsDir;
  }
  parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      return { meta: {}, body: content };
    }
    const [, frontmatter, body] = match;
    const meta = {};
    for (const line of frontmatter.split(`
`)) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        if (value === "true")
          value = true;
        else if (value === "false")
          value = false;
        else if (!Number.isNaN(Number(value)))
          value = Number(value);
        meta[key] = value;
      }
    }
    return { meta, body: body.trim() };
  }
  extractTierContent(body) {
    const tier2Match = body.match(/<!--\s*tier:2\s*-->([\s\S]*?)(?=<!--\s*tier:3\s*-->|$)/);
    const tier3Match = body.match(/<!--\s*tier:3\s*-->([\s\S]*)$/);
    const overviewEnd = body.indexOf("<!-- tier:2 -->");
    const overview = overviewEnd > -1 ? body.substring(0, overviewEnd).trim() : body.trim();
    return {
      overview,
      instructions: tier2Match ? tier2Match[1].trim() : undefined,
      resources: tier3Match ? tier3Match[1].trim() : undefined
    };
  }
  estimateTokens(content) {
    return Math.ceil(content.length / 4);
  }
  async loadSkillMetadata(skillPath) {
    if (!existsSync2(skillPath)) {
      return null;
    }
    try {
      const content = await readFile2(skillPath, "utf-8");
      const { meta } = this.parseFrontmatter(content);
      return {
        name: meta.name || "unknown",
        description: meta.description || "",
        tier: meta.tier || 1,
        capabilities: meta.capabilities || [],
        path: skillPath
      };
    } catch (error) {
      console.error(`Failed to load skill metadata from ${skillPath}:`, error);
      return null;
    }
  }
  async loadSkill(skillPath, tiers = [1]) {
    const cacheKey = `${skillPath}:${tiers.join(",")}`;
    if (this.loadedCache.has(cacheKey)) {
      return this.loadedCache.get(cacheKey);
    }
    if (!existsSync2(skillPath)) {
      return null;
    }
    try {
      const content = await readFile2(skillPath, "utf-8");
      const { meta, body } = this.parseFrontmatter(content);
      const tierContent = this.extractTierContent(body);
      const metadata = {
        name: meta.name || "unknown",
        description: meta.description || "",
        tier: meta.tier || 1,
        capabilities: meta.capabilities || [],
        path: skillPath
      };
      const contentParts = [];
      let tokenEstimate = 0;
      if (tiers.includes(1)) {
        contentParts.push(tierContent.overview);
        tokenEstimate += this.estimateTokens(tierContent.overview);
      }
      if (tiers.includes(2) && tierContent.instructions) {
        contentParts.push(tierContent.instructions);
        tokenEstimate += this.estimateTokens(tierContent.instructions);
      }
      if (tiers.includes(3) && tierContent.resources) {
        contentParts.push(tierContent.resources);
        tokenEstimate += this.estimateTokens(tierContent.resources);
      }
      const loaded = {
        metadata,
        loadedTiers: tiers,
        content: contentParts.join(`

`),
        tokenEstimate
      };
      this.loadedCache.set(cacheKey, loaded);
      return loaded;
    } catch (error) {
      console.error(`Failed to load skill from ${skillPath}:`, error);
      return null;
    }
  }
  async loadSkillsInDirectory(dir, tiers = [1]) {
    if (!existsSync2(dir)) {
      return [];
    }
    const skills = [];
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join2(dir, entry.name);
        if (entry.isDirectory()) {
          const skillPath = join2(fullPath, "SKILL.md");
          if (existsSync2(skillPath)) {
            const skill = await this.loadSkill(skillPath, tiers);
            if (skill)
              skills.push(skill);
          }
        } else if (entry.name.endsWith(".md")) {
          const skill = await this.loadSkill(fullPath, tiers);
          if (skill)
            skills.push(skill);
        }
      }
    } catch (error) {
      console.error(`Failed to load skills from ${dir}:`, error);
    }
    return skills;
  }
  async loadSkillsByCapability(dir, capability, tiers = [1]) {
    const allSkills = await this.loadSkillsInDirectory(dir, [1]);
    const matching = [];
    for (const skill of allSkills) {
      if (skill.metadata.capabilities.includes(capability)) {
        const fullSkill = await this.loadSkill(skill.metadata.path, tiers);
        if (fullSkill)
          matching.push(fullSkill);
      }
    }
    return matching;
  }
  estimateTokenSavings(skills) {
    const tier1Only = skills.reduce((sum, s) => {
      const t1Skill = { ...s, loadedTiers: [1] };
      return sum + this.estimateTokens(s.metadata.description);
    }, 0);
    const allTiers = skills.reduce((sum, s) => sum + s.tokenEstimate, 0);
    const savings = allTiers - tier1Only;
    const savingsPercent = Math.round(savings / allTiers * 100);
    return {
      tier1Only,
      allTiers,
      savings,
      savingsPercent
    };
  }
  clearCache() {
    this.loadedCache.clear();
  }
  getCacheStats() {
    return {
      size: this.loadedCache.size,
      entries: Array.from(this.loadedCache.keys())
    };
  }
}

// src/context/session.ts
init_types();
import { existsSync as existsSync3 } from "node:fs";
import { mkdir as mkdir2, readFile as readFile3, readdir as readdir2, writeFile as writeFile2 } from "node:fs/promises";
import { join as join3 } from "node:path";

class SessionManager {
  config;
  currentSession = null;
  sessionsDir;
  currentSessionPath;
  archiveDir;
  auditLog = [];
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionsDir = join3(this.config.storagePath, "sessions");
    this.currentSessionPath = join3(this.sessionsDir, "current.json");
    this.archiveDir = join3(this.sessionsDir, "archive");
  }
  async initialize() {
    await mkdir2(this.sessionsDir, { recursive: true });
    await mkdir2(this.archiveDir, { recursive: true });
  }
  async startSession(metadata = {}) {
    const existing = await this.loadCurrentSession();
    if (existing) {
      existing.lastActive = new Date().toISOString();
      existing.metadata = { ...existing.metadata, ...metadata };
      await this.saveSession(existing);
      this.currentSession = existing;
      return existing;
    }
    const session = this.createSession(metadata);
    await this.saveSession(session);
    this.currentSession = session;
    return session;
  }
  getSession() {
    return this.currentSession;
  }
  createSession(metadata = {}) {
    const now = new Date().toISOString();
    return {
      id: this.generateSessionId(),
      createdAt: now,
      lastActive: now,
      workbench: {
        activeFiles: [],
        pendingTasks: [],
        decisions: [],
        context: {}
      },
      metadata: {
        project: metadata.project || process.cwd(),
        branch: metadata.branch,
        mode: metadata.mode,
        platform: metadata.platform
      }
    };
  }
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess_${timestamp}_${random}`;
  }
  async loadCurrentSession() {
    if (!existsSync3(this.currentSessionPath)) {
      return null;
    }
    try {
      const content = await readFile3(this.currentSessionPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to load session:", error);
      return null;
    }
  }
  async saveSession(session) {
    await writeFile2(this.currentSessionPath, JSON.stringify(session, null, 2));
  }
  async addActiveFile(path) {
    if (!this.currentSession)
      return;
    if (!this.currentSession.workbench.activeFiles.includes(path)) {
      this.currentSession.workbench.activeFiles.push(path);
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  async removeActiveFile(path) {
    if (!this.currentSession)
      return;
    const index = this.currentSession.workbench.activeFiles.indexOf(path);
    if (index > -1) {
      this.currentSession.workbench.activeFiles.splice(index, 1);
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  getActiveFiles() {
    return this.currentSession?.workbench.activeFiles || [];
  }
  async archiveCurrentSession() {
    if (!this.currentSession) {
      throw new Error("No active session to archive");
    }
    const archivePath = join3(this.archiveDir, `${this.currentSession.id}.json`);
    await writeFile2(archivePath, JSON.stringify(this.currentSession, null, 2));
    this.currentSession = null;
    if (existsSync3(this.currentSessionPath)) {
      await writeFile2(this.currentSessionPath, "");
    }
  }
  buildContextEnvelope(requestId, depth = 0, previousResults = [], taskContext = {}, memoryManager) {
    if (!this.currentSession) {
      throw new Error("No active session for context envelope");
    }
    const memories = memoryManager ? {
      declarative: [],
      procedural: [],
      episodic: []
    } : {
      declarative: [],
      procedural: [],
      episodic: []
    };
    return {
      session: {
        id: this.currentSession.id,
        parentID: this.currentSession.parentID,
        activeFiles: this.currentSession.workbench.activeFiles,
        pendingTasks: this.currentSession.workbench.pendingTasks,
        decisions: this.currentSession.workbench.decisions
      },
      memories,
      previousResults,
      taskContext,
      meta: {
        requestId,
        timestamp: new Date,
        depth
      }
    };
  }
  recordHandoff(correlationId, fromAgent, toAgent, contextSize, success, reason) {
    if (!this.currentSession)
      return;
    const record = {
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      correlationId,
      fromAgent,
      toAgent,
      timestamp: new Date,
      contextSize,
      success,
      reason,
      sessionId: this.currentSession.id
    };
    this.auditLog.push(record);
    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(-100);
    }
  }
  getAuditTrail(correlationId) {
    return this.auditLog.filter((record) => record.correlationId === correlationId);
  }
  getAllAuditRecords() {
    return [...this.auditLog];
  }
  generateCorrelationId() {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  serializeContextEnvelope(envelope) {
    const limitedEnvelope = {
      ...envelope,
      session: {
        ...envelope.session,
        activeFiles: envelope.session.activeFiles.slice(0, 10),
        pendingTasks: envelope.session.pendingTasks.slice(0, 5),
        decisions: envelope.session.decisions.slice(0, 5)
      },
      memories: {
        declarative: envelope.memories.declarative.slice(0, 3),
        procedural: envelope.memories.procedural.slice(0, 3),
        episodic: envelope.memories.episodic.slice(0, 3)
      },
      previousResults: envelope.previousResults.slice(0, 3)
    };
    return JSON.stringify(limitedEnvelope, null, 2);
  }
  mergeContextEnvelopes(envelopes, strategy = "last-wins") {
    if (envelopes.length === 0) {
      throw new Error("Cannot merge empty envelope array");
    }
    if (envelopes.length === 1) {
      return envelopes[0];
    }
    const baseEnvelope = envelopes[0];
    const allPreviousResults = envelopes.flatMap((e) => e.previousResults);
    const mergedPreviousResults = this.deduplicatePreviousResults(allPreviousResults);
    const mergedTaskContext = this.mergeTaskContexts(envelopes.map((e) => e.taskContext), strategy);
    return {
      ...baseEnvelope,
      previousResults: mergedPreviousResults,
      taskContext: mergedTaskContext,
      meta: {
        ...baseEnvelope.meta,
        mergedFrom: envelopes.length,
        mergeStrategy: strategy
      }
    };
  }
  deduplicatePreviousResults(results) {
    const seen = new Set;
    return results.filter((result) => {
      const key = `${result.agentType}-${JSON.stringify(result.output)}`;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    });
  }
  mergeTaskContexts(contexts, strategy) {
    const merged = {};
    const allKeys = new Set;
    contexts.forEach((ctx) => {
      if (ctx)
        Object.keys(ctx).forEach((key) => allKeys.add(key));
    });
    for (const key of allKeys) {
      const values = contexts.map((ctx) => ctx?.[key]).filter((val) => val !== undefined);
      if (values.length === 0)
        continue;
      switch (strategy) {
        case "last-wins":
          merged[key] = values[values.length - 1];
          break;
        case "consensus": {
          const counts = new Map;
          values.forEach((val) => counts.set(val, (counts.get(val) || 0) + 1));
          let maxCount = 0;
          let consensusValue = values[0];
          counts.forEach((count, value) => {
            if (count > maxCount) {
              maxCount = count;
              consensusValue = value;
            }
          });
          merged[key] = consensusValue;
          break;
        }
        case "priority":
          merged[key] = values[values.length - 1];
          break;
        default:
          merged[key] = values[0];
      }
    }
    return merged;
  }
  async addTask(content, priority = "medium") {
    if (!this.currentSession) {
      throw new Error("No active session");
    }
    const task = {
      id: `task_${Date.now().toString(36)}`,
      content,
      status: "pending",
      priority,
      createdAt: new Date().toISOString()
    };
    this.currentSession.workbench.pendingTasks.push(task);
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
    return task;
  }
  async updateTaskStatus(taskId, status) {
    if (!this.currentSession)
      return;
    const task = this.currentSession.workbench.pendingTasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === "completed") {
        task.completedAt = new Date().toISOString();
      }
      this.currentSession.lastActive = new Date().toISOString();
      await this.saveSession(this.currentSession);
    }
  }
  getTasks() {
    return this.currentSession?.workbench.pendingTasks || [];
  }
  getPendingTasks() {
    return this.getTasks().filter((t) => t.status === "pending" || t.status === "in_progress");
  }
  async addDecision(title, description, rationale, options) {
    if (!this.currentSession) {
      throw new Error("No active session");
    }
    const decision = {
      id: `dec_${Date.now().toString(36)}`,
      title,
      description,
      rationale,
      alternatives: options?.alternatives,
      createdAt: new Date().toISOString(),
      tags: options?.tags || []
    };
    this.currentSession.workbench.decisions.push(decision);
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
    return decision;
  }
  getDecisions() {
    return this.currentSession?.workbench.decisions || [];
  }
  async setContext(key, value) {
    if (!this.currentSession)
      return;
    this.currentSession.workbench.context[key] = value;
    this.currentSession.lastActive = new Date().toISOString();
    await this.saveSession(this.currentSession);
  }
  getContext(key) {
    return this.currentSession?.workbench.context[key];
  }
  getAllContext() {
    return this.currentSession?.workbench.context || {};
  }
  async archiveSession() {
    if (!this.currentSession)
      return;
    const archivePath = join3(this.archiveDir, `${this.currentSession.id}.json`);
    await writeFile2(archivePath, JSON.stringify(this.currentSession, null, 2));
    if (existsSync3(this.currentSessionPath)) {
      const { rm } = await import("node:fs/promises");
      await rm(this.currentSessionPath);
    }
    this.currentSession = null;
  }
  async listArchivedSessions() {
    if (!existsSync3(this.archiveDir)) {
      return [];
    }
    const files = await readdir2(this.archiveDir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  }
  async loadArchivedSession(sessionId) {
    const archivePath = join3(this.archiveDir, `${sessionId}.json`);
    if (!existsSync3(archivePath)) {
      return null;
    }
    try {
      const content = await readFile3(archivePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load archived session ${sessionId}:`, error);
      return null;
    }
  }
  getSessionSummary() {
    if (!this.currentSession) {
      return "No active session.";
    }
    const { workbench, metadata } = this.currentSession;
    const pendingTasks = this.getPendingTasks();
    const lines = [
      `## Session: ${this.currentSession.id}`,
      `Project: ${metadata.project}`,
      metadata.branch ? `Branch: ${metadata.branch}` : null,
      metadata.mode ? `Mode: ${metadata.mode}` : null,
      "",
      `### Active Files (${workbench.activeFiles.length})`,
      ...workbench.activeFiles.slice(0, 10).map((f) => `- ${f}`),
      workbench.activeFiles.length > 10 ? `- ... and ${workbench.activeFiles.length - 10} more` : null,
      "",
      `### Pending Tasks (${pendingTasks.length})`,
      ...pendingTasks.slice(0, 5).map((t) => `- [${t.priority}] ${t.content}`),
      pendingTasks.length > 5 ? `- ... and ${pendingTasks.length - 5} more` : null,
      "",
      `### Recent Decisions (${workbench.decisions.length})`,
      ...workbench.decisions.slice(-3).map((d) => `- ${d.title}: ${d.rationale.substring(0, 100)}...`)
    ];
    return lines.filter(Boolean).join(`
`);
  }
}

// src/context/retrieval.ts
init_types();

// src/context/vector.ts
init_types();
import { existsSync as existsSync4 } from "node:fs";
import { mkdir as mkdir3, readFile as readFile4, writeFile as writeFile3 } from "node:fs/promises";
import { join as join4 } from "node:path";

class TextTokenizer {
  tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 0);
  }
  createTFIDFVector(texts) {
    const allWords = new Set;
    const documents = [];
    for (const text of texts) {
      const words2 = this.tokenize(text);
      documents.push(words2);
      words2.forEach((word) => allWords.add(word));
    }
    const wordList = Array.from(allWords);
    const docFrequency = new Map;
    for (const word of wordList) {
      const docCount = documents.filter((doc) => doc.includes(word)).length;
      const idf = Math.log(texts.length / (docCount + 1));
      docFrequency.set(word, idf);
    }
    const vector = new Map;
    const words = this.tokenize(texts[0]);
    const wordCount = words.length;
    for (const word of words) {
      const tf = words.filter((w) => w === word).length / wordCount;
      const tfidf = tf * (docFrequency.get(word) || 0);
      vector.set(word, tfidf);
    }
    return vector;
  }
  createFrequencyVector(text) {
    const words = this.tokenize(text);
    const vector = new Map;
    const totalWords = words.length;
    for (const word of words) {
      const count = (vector.get(word) || 0) + 1;
      vector.set(word, count / totalWords);
    }
    return vector;
  }
}

class VectorMath {
  static cosineSimilarity(vec1, vec2) {
    const intersection = new Set([...vec1.keys()].filter((x) => vec2.has(x)));
    if (intersection.size === 0)
      return 0;
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (const word of intersection) {
      dotProduct += (vec1.get(word) || 0) * (vec2.get(word) || 0);
    }
    for (const value of vec1.values()) {
      mag1 += value * value;
    }
    for (const value of vec2.values()) {
      mag2 += value * value;
    }
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    return mag1 === 0 || mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
  }
  static euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length)
      return Number.POSITIVE_INFINITY;
    let sum = 0;
    for (let i = 0;i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
  static mapToArray(map, dimension) {
    const array = new Array(dimension).fill(0);
    let i = 0;
    for (const [word, value] of map.entries()) {
      if (i >= dimension)
        break;
      array[i] = value;
      i++;
    }
    return array;
  }
}

class VectorMemoryManager {
  config;
  vectorDir;
  store;
  tokenizer;
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.vectorDir = join4(this.config.storagePath, "vectors");
    this.store = { embeddings: [], dimension: 0, indexType: "flat" };
    this.tokenizer = new TextTokenizer;
  }
  async initialize() {
    await mkdir3(this.vectorDir, { recursive: true });
    await this.loadVectorStore();
  }
  async loadVectorStore() {
    const storePath = join4(this.vectorDir, "store.json");
    if (existsSync4(storePath)) {
      try {
        const content = await readFile4(storePath, "utf-8");
        this.store = JSON.parse(content);
      } catch (error) {
        console.error("Failed to load vector store:", error);
      }
    }
  }
  async saveVectorStore() {
    const storePath = join4(this.vectorDir, "store.json");
    await writeFile3(storePath, JSON.stringify(this.store, null, 2));
  }
  async createEmbedding(memory) {
    const vector = this.tokenizer.createFrequencyVector(memory.content);
    const vectorArray = VectorMath.mapToArray(vector, this.store.dimension || 100);
    const embedding = {
      id: `vec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      vector: vectorArray,
      metadata: {
        memoryId: memory.id,
        type: memory.type,
        tags: memory.tags,
        timestamp: memory.provenance.timestamp
      }
    };
    if (this.store.dimension === 0) {
      this.store.dimension = vectorArray.length;
    }
    return embedding;
  }
  async addMemoryWithVector(memory) {
    const embedding = await this.createEmbedding(memory);
    this.store.embeddings.push(embedding);
    await this.saveVectorStore();
  }
  async semanticSearch(query, options = {}) {
    const queryVector = this.tokenizer.createFrequencyVector(query);
    const queryArray = VectorMath.mapToArray(queryVector, this.store.dimension);
    const results = [];
    for (const embedding of this.store.embeddings) {
      if (options.memoryType && embedding.metadata.type !== options.memoryType) {
        continue;
      }
      if (options.tags && options.tags.length > 0) {
        const hasTag = options.tags.some((tag) => embedding.metadata.tags.includes(tag));
        if (!hasTag)
          continue;
      }
      const similarity = VectorMath.cosineSimilarity(new Map(Object.entries(queryVector)), new Map(Object.entries(this.tokenizer.createFrequencyVector(embedding.metadata.memoryId || ""))));
      if (similarity >= (options.minScore || 0.1)) {
        results.push({
          score: similarity,
          relevance: this.getRelevanceLabel(similarity),
          memory: {
            id: embedding.metadata.memoryId,
            type: embedding.metadata.type,
            content: "",
            provenance: {
              source: "user",
              timestamp: embedding.metadata.timestamp,
              confidence: 1,
              context: ""
            },
            tags: embedding.metadata.tags,
            lastAccessed: new Date().toISOString(),
            accessCount: 0
          }
        });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options.limit || 10);
  }
  getRelevanceLabel(score) {
    if (score >= 0.8)
      return "Very High";
    if (score >= 0.6)
      return "High";
    if (score >= 0.4)
      return "Medium";
    if (score >= 0.2)
      return "Low";
    return "Very Low";
  }
  getStats() {
    const norms = this.store.embeddings.map((e) => Math.sqrt(e.vector.reduce((sum, val) => sum + val * val, 0)));
    return {
      totalEmbeddings: this.store.embeddings.length,
      dimension: this.store.dimension,
      indexType: this.store.indexType,
      averageVectorNorm: norms.reduce((sum, norm) => sum + norm, 0) / norms.length
    };
  }
  async rebuildIndex() {
    console.log("Rebuilding vector index...");
    this.store.embeddings.sort((a, b) => a.metadata.memoryId.localeCompare(b.metadata.memoryId));
    await this.saveVectorStore();
    console.log(`Rebuilt index with ${this.store.embeddings.length} embeddings`);
  }
  async exportVectors(format = "json") {
    if (format === "json") {
      return JSON.stringify(this.store, null, 2);
    }
    const headers = [
      "id",
      "memoryId",
      "type",
      "tags",
      "timestamp",
      "dimension"
    ];
    const rows = this.store.embeddings.map((e) => [
      e.id,
      e.metadata.memoryId,
      e.metadata.type,
      e.metadata.tags.join(";"),
      e.metadata.timestamp,
      e.vector.length
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join(`
`);
  }
}

class ContextRanker {
  static rankByRelevance(memories, context) {
    const scored = memories.map((memory) => {
      let score = 0;
      if (context.query) {
        const queryWords = context.query.toLowerCase().split(/\s+/);
        const contentWords = memory.content.toLowerCase().split(/\s+/);
        const overlap = queryWords.filter((word) => contentWords.includes(word)).length;
        score += overlap / queryWords.length * 0.4;
      }
      if (context.activeFiles && context.activeFiles.length > 0) {
        const fileMention = context.activeFiles.some((file) => memory.content.toLowerCase().includes(file.toLowerCase()));
        if (fileMention)
          score += 0.3;
      }
      if (context.currentTask) {
        const taskRelevance = memory.content.toLowerCase().includes(context.currentTask.toLowerCase());
        if (taskRelevance)
          score += 0.2;
      }
      const daysSinceAccess = (Date.now() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - daysSinceAccess / 30);
      score += recencyScore * 0.1;
      score += memory.provenance.confidence * 0.1;
      return { memory, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.memory);
  }
  static getRankingExplanation(memory, score) {
    const factors = [];
    if (score > 0.5)
      factors.push("High relevance to query");
    if (memory.provenance.confidence > 0.8)
      factors.push("High confidence");
    if (memory.tags.includes("recent"))
      factors.push("Recently accessed");
    if (memory.accessCount > 5)
      factors.push("Frequently accessed");
    return factors.length > 0 ? factors.join(", ") : "Base relevance";
  }
}

// src/context/retrieval.ts
class ContextRetriever {
  config;
  sessionManager;
  memoryManager;
  skillLoader;
  vectorManager;
  contextCache = new Map;
  async initializeVectorManager() {
    await this.vectorManager.initialize();
  }
  constructor(sessionManager, memoryManager, skillLoader, config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionManager = sessionManager;
    this.memoryManager = memoryManager;
    this.skillLoader = skillLoader;
    this.vectorManager = new VectorMemoryManager(config);
  }
  async inferContextFromQuery(query) {
    if (!this.config.enableAutoInference)
      return;
    const preferencePatterns = [
      /(?:should I|do you recommend|what about) ([\w\s]+) (?:or|vs|versus) ([\w\s]+)\?/i,
      /I (?:prefer|like|want to use) ([\w\s]+)/i,
      /(?:never|always|usually) ([\w\s]+)/i
    ];
    for (const pattern of preferencePatterns) {
      const match = query.match(pattern);
      if (match) {
        const preference = match[1] || match[0];
        await this.memoryManager.addMemory("declarative", `User preference: ${preference}`, {
          source: "inferred",
          context: `Inferred from query: "${query}"`,
          tags: ["preference", "inferred"]
        });
        break;
      }
    }
  }
  async inferContextFromConversation(message, response) {
    if (!this.config.enableAutoInference)
      return;
    const decisionPatterns = [
      /(?:we decided|let's use|we're going with|chosen) ([\w\s]+(?:framework|library|tool|approach|pattern))/i,
      /(?:implementing|building|creating) ([\w\s]+) using ([\w\s]+)/i
    ];
    for (const pattern of decisionPatterns) {
      const match = message.match(pattern) || response.match(pattern);
      if (match) {
        const technology = match[1];
        await this.memoryManager.addMemory("procedural", `Using ${technology} for implementation`, {
          source: "inferred",
          context: `Conversation context: "${message.substring(0, 100)}..."`,
          tags: ["technology", "decision", "inferred"]
        });
        break;
      }
    }
    if (message.includes("error") || message.includes("bug") || message.includes("issue")) {
      await this.memoryManager.addMemory("episodic", `Encountered issue: ${message.substring(0, 200)}...`, {
        source: "inferred",
        context: "Problem-solving conversation",
        tags: ["debugging", "issue", "inferred"]
      });
    }
  }
  async inferContextFromCode(filePath, changes) {
    if (!this.config.enableAutoInference)
      return;
    const frameworkPatterns = {
      react: /import.*from ['"]react['"]/i,
      vue: /import.*from ['"]vue['"]/i,
      angular: /import.*from ['"]@angular['"]/i,
      express: /const.*=.*require\(['"]express['"]\)/i,
      fastify: /const.*=.*require\(['"]fastify['"]\)/i,
      typescript: /interface|type.*=.*\{/
    };
    for (const [framework, pattern] of Object.entries(frameworkPatterns)) {
      if (pattern.test(changes)) {
        await this.memoryManager.addMemory("declarative", `Project uses ${framework}`, {
          source: "inferred",
          context: `Detected in ${filePath}`,
          tags: ["framework", "technology", "inferred"]
        });
      }
    }
    if (changes.includes("middleware") || changes.includes("router")) {
      await this.memoryManager.addMemory("procedural", "Using middleware/router pattern", {
        source: "inferred",
        context: `Code pattern in ${filePath}`,
        tags: ["architecture", "pattern", "inferred"]
      });
    }
  }
  async assemble(triggers) {
    const startTime = Date.now();
    const memories = [];
    const skills = [];
    let tokenEstimate = 0;
    let lastQuery;
    for (const trigger of triggers) {
      switch (trigger.type) {
        case "session_start": {
          break;
        }
        case "file_open": {
          const openedFilePath = trigger.data.path;
          const fileSemanticResults = await this.vectorManager.semanticSearch(openedFilePath, {
            limit: 5,
            minScore: 0.3,
            memoryType: "procedural"
          });
          const traditionalMemories = this.memoryManager.searchMemories(openedFilePath, {
            minConfidence: 0.6
          });
          memories.push(...fileSemanticResults.map((r) => r.memory), ...traditionalMemories);
          break;
        }
        case "command": {
          const commandName = trigger.data.command;
          const semanticResults = await this.vectorManager.semanticSearch(commandName, {
            limit: 3,
            minScore: 0.4,
            memoryType: "procedural"
          });
          const commandMemories = this.memoryManager.searchMemories(commandName, {
            minConfidence: 0.5
          });
          memories.push(...semanticResults.map((r) => r.memory), ...commandMemories);
          break;
        }
        case "query": {
          const userQuery = trigger.data.query;
          lastQuery = userQuery;
          await this.inferContextFromQuery(userQuery);
          const semanticQueryResults = await this.vectorManager.semanticSearch(userQuery, {
            limit: 5,
            minScore: 0.35,
            memoryType: "procedural"
          });
          const traditionalQueryMemories = this.memoryManager.searchMemories(userQuery, {
            minConfidence: 0.5
          });
          memories.push(...semanticQueryResults.map((r) => r.memory), ...traditionalQueryMemories);
          break;
        }
        case "conversation_turn": {
          const message = trigger.data.message;
          const response = trigger.data.response;
          await this.inferContextFromConversation(message, response);
          break;
        }
        case "file_edit": {
          const editedFilePath = trigger.data.filePath;
          const codeChanges = trigger.data.changes;
          await this.inferContextFromCode(editedFilePath, codeChanges);
          const allMemories = this.memoryManager.getAllMemories();
          const context = {
            query: lastQuery || "",
            activeFiles: this.sessionManager.getActiveFiles(),
            currentTask: this.sessionManager.getContext("currentTask"),
            sessionType: this.sessionManager.getSession()?.metadata.mode
          };
          const rankedMemories = ContextRanker.rankByRelevance(allMemories, context);
          memories.push(...rankedMemories.slice(0, 10));
          break;
        }
        case "task": {
          const taskType = trigger.data.taskType;
          const taskMemories = this.memoryManager.searchMemories(taskType, {
            tags: ["task"],
            minConfidence: 0.5
          });
          memories.push(...taskMemories);
          break;
        }
      }
    }
    const uniqueMemories = Array.from(new Map(memories.map((m) => [m.id, m])).values());
    for (const memory of uniqueMemories) {
      tokenEstimate += Math.ceil(memory.content.length / 4);
    }
    const duration = Date.now() - startTime;
    return {
      session: this.sessionManager.getSession() || undefined,
      memories: uniqueMemories,
      skills,
      tokenEstimate,
      meta: {
        assembledAt: new Date().toISOString(),
        triggers: triggers.map((t) => t.type),
        duration
      }
    };
  }
  async pushContext(event, data) {
    const triggers = [];
    switch (event) {
      case "session_start":
        triggers.push({
          type: "session_start",
          pattern: "push",
          data: data || {}
        });
        break;
      case "file_open":
        triggers.push({
          type: "file_open",
          pattern: "push",
          data: data || {}
        });
        break;
      case "command_run":
        triggers.push({
          type: "command",
          pattern: "push",
          data: data || {}
        });
        break;
    }
    const cacheKey = this.generateCacheKey(triggers);
    const cached = await this.getCachedContext(cacheKey);
    if (cached) {
      return cached;
    }
    const context = await this.assemble(triggers);
    this.cacheContext(cacheKey, context);
    return context;
  }
  async pullContext(query) {
    const triggers = [
      {
        type: "query",
        pattern: "pull",
        data: { query }
      }
    ];
    const cacheKey = this.generateCacheKey(triggers);
    const cached = await this.getCachedContext(cacheKey);
    if (cached) {
      return cached;
    }
    const context = await this.assemble(triggers);
    this.cacheContext(cacheKey, context);
    return context;
  }
  async getContextSummary(maxMemories = 5) {
    const session = this.sessionManager.getSession();
    const memories = this.memoryManager.getAllMemories().slice(0, maxMemories);
    const lines = ["## Context Summary", ""];
    if (session) {
      lines.push("### Session");
      lines.push(this.sessionManager.getSessionSummary());
      lines.push("");
    }
    if (memories.length > 0) {
      lines.push("### Relevant Memories");
      for (const mem of memories) {
        lines.push(`- [${mem.type}] ${mem.content.substring(0, 100)}...`);
      }
      lines.push("");
    }
    lines.push("### Memory Statistics");
    lines.push(this.memoryManager.getSummary(3));
    return lines.join(`
`);
  }
  async getCachedContext(cacheKey, ttlMs = 300000) {
    const cached = this.contextCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      for (const memory of cached.context.memories) {
        await this.memoryManager.accessMemory(memory.id);
      }
      return cached.context;
    }
    return null;
  }
  cacheContext(cacheKey, context, ttlMs = 300000) {
    this.contextCache.set(cacheKey, {
      context,
      expires: Date.now() + ttlMs
    });
  }
  generateCacheKey(triggers) {
    const sorted = [...triggers].sort((a, b) => a.type.localeCompare(b.type));
    return JSON.stringify(sorted.map((t) => ({
      type: t.type,
      data: t.data
    })));
  }
  estimateContextSize(context) {
    return {
      sessions: context.session ? 500 : 0,
      memories: context.memories.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0),
      skills: context.skills.reduce((sum, s) => sum + s.tokenEstimate, 0),
      total: context.tokenEstimate
    };
  }
}
async function createContextRetriever(config) {
  const { loadConfig: loadConfig2 } = await Promise.resolve().then(() => (init_types(), exports_types));
  const finalConfig = await loadConfig2(config);
  const sessionManager = new SessionManager(finalConfig);
  const memoryManager = new MemoryManager(finalConfig);
  const skillLoader = new ProgressiveSkillLoader(finalConfig.storagePath);
  await sessionManager.initialize();
  await memoryManager.initialize();
  const retriever = new ContextRetriever(sessionManager, memoryManager, skillLoader, finalConfig);
  await retriever.initializeVectorManager();
  return retriever;
}
export {
  createContextRetriever,
  ContextRetriever
};

//# debugId=97AF8BD58F3E73CC64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbnRleHQvdHlwZXMudHMiLCAiLi4vc3JjL2NvbnRleHQvbWVtb3J5LnRzIiwgIi4uL3NyYy9jb250ZXh0L3Byb2dyZXNzaXZlLnRzIiwgIi4uL3NyYy9jb250ZXh0L3Nlc3Npb24udHMiLCAiLi4vc3JjL2NvbnRleHQvcmV0cmlldmFsLnRzIiwgIi4uL3NyYy9jb250ZXh0L3ZlY3Rvci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIENvbnRleHQgRW5naW5lZXJpbmcgVHlwZSBEZWZpbml0aW9uc1xuICpcbiAqIENvcmUgdHlwZXMgZm9yIHNlc3Npb24gbWFuYWdlbWVudCwgbWVtb3J5IHN5c3RlbSwgYW5kIHByb2dyZXNzaXZlIGRpc2Nsb3N1cmUuXG4gKiBCYXNlZCBvbiByZXNlYXJjaCBmcm9tIEdvb2dsZSdzIENvbnRleHQgRW5naW5lZXJpbmcgYW5kIENsYXVkZSBTa2lsbHMgcGF0dGVybnMuXG4gKi9cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2Vzc2lvbiBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgcGFyZW50SUQ/OiBzdHJpbmc7IC8vIFBhcmVudCBzZXNzaW9uIElEIGZvciBuZXN0ZWQgc3ViYWdlbnQgY2FsbHNcbiAgICBjcmVhdGVkQXQ6IHN0cmluZzsgLy8gSVNPIGRhdGUgc3RyaW5nXG4gICAgbGFzdEFjdGl2ZTogc3RyaW5nOyAvLyBJU08gZGF0ZSBzdHJpbmdcbiAgICB3b3JrYmVuY2g6IFNlc3Npb25Xb3JrYmVuY2g7XG4gICAgbWV0YWRhdGE6IFNlc3Npb25NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uV29ya2JlbmNoIHtcbiAgICAvKiogQ3VycmVudGx5IGFjdGl2ZS9vcGVuIGZpbGVzIGluIHRoZSBzZXNzaW9uICovXG4gICAgYWN0aXZlRmlsZXM6IHN0cmluZ1tdO1xuICAgIC8qKiBQZW5kaW5nIHRhc2tzIHRyYWNrZWQgaW4gdGhpcyBzZXNzaW9uICovXG4gICAgcGVuZGluZ1Rhc2tzOiBUYXNrW107XG4gICAgLyoqIEFyY2hpdGVjdHVyYWwvZGVzaWduIGRlY2lzaW9ucyBtYWRlICovXG4gICAgZGVjaXNpb25zOiBEZWNpc2lvbltdO1xuICAgIC8qKiBBcmJpdHJhcnkgY29udGV4dCBkYXRhICovXG4gICAgY29udGV4dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvbk1ldGFkYXRhIHtcbiAgICAvKiogUHJvamVjdCBuYW1lIG9yIHBhdGggKi9cbiAgICBwcm9qZWN0OiBzdHJpbmc7XG4gICAgLyoqIEdpdCBicmFuY2ggaWYgYXBwbGljYWJsZSAqL1xuICAgIGJyYW5jaD86IHN0cmluZztcbiAgICAvKiogQ3VycmVudCB3b3JraW5nIG1vZGUgKi9cbiAgICBtb2RlPzogXCJwbGFuXCIgfCBcImJ1aWxkXCIgfCBcInJldmlld1wiO1xuICAgIC8qKiBQbGF0Zm9ybSBiZWluZyB1c2VkICovXG4gICAgcGxhdGZvcm0/OiBcImNsYXVkZS1jb2RlXCIgfCBcIm9wZW5jb2RlXCI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFzayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgc3RhdHVzOiBcInBlbmRpbmdcIiB8IFwiaW5fcHJvZ3Jlc3NcIiB8IFwiY29tcGxldGVkXCIgfCBcImNhbmNlbGxlZFwiO1xuICAgIHByaW9yaXR5OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiO1xuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xuICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlY2lzaW9uIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICByYXRpb25hbGU6IHN0cmluZztcbiAgICBhbHRlcm5hdGl2ZXM/OiBzdHJpbmdbXTtcbiAgICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgICB0YWdzOiBzdHJpbmdbXTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTWVtb3J5IFR5cGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIE1lbW9yeVR5cGUgPSBcImRlY2xhcmF0aXZlXCIgfCBcInByb2NlZHVyYWxcIiB8IFwiZXBpc29kaWNcIjtcbmV4cG9ydCB0eXBlIE1lbW9yeVNvdXJjZSA9IFwidXNlclwiIHwgXCJhZ2VudFwiIHwgXCJpbmZlcnJlZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW9yeUVudHJ5IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IE1lbW9yeVR5cGU7XG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIHByb3ZlbmFuY2U6IE1lbW9yeVByb3ZlbmFuY2U7XG4gICAgdGFnczogc3RyaW5nW107XG4gICAgbGFzdEFjY2Vzc2VkOiBzdHJpbmc7XG4gICAgYWNjZXNzQ291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZW1vcnlQcm92ZW5hbmNlIHtcbiAgICAvKiogV2hlcmUgdGhpcyBtZW1vcnkgY2FtZSBmcm9tICovXG4gICAgc291cmNlOiBNZW1vcnlTb3VyY2U7XG4gICAgLyoqIFdoZW4gdGhpcyB3YXMgcmVjb3JkZWQgKi9cbiAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICAvKiogQ29uZmlkZW5jZSBsZXZlbCAwLTEgKGRlY2F5cyBvdmVyIHRpbWUgZm9yIGluZmVycmVkKSAqL1xuICAgIGNvbmZpZGVuY2U6IG51bWJlcjtcbiAgICAvKiogQ29udGV4dCBpbiB3aGljaCB0aGlzIHdhcyBsZWFybmVkICovXG4gICAgY29udGV4dDogc3RyaW5nO1xuICAgIC8qKiBSZWxhdGVkIHNlc3Npb24gSUQgaWYgYXBwbGljYWJsZSAqL1xuICAgIHNlc3Npb25JZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZW1vcnlTdG9yZSB7XG4gICAgLyoqIEZhY3RzLCBwYXR0ZXJucywgcHJlZmVyZW5jZXMgKi9cbiAgICBkZWNsYXJhdGl2ZTogTWVtb3J5RW50cnlbXTtcbiAgICAvKiogV29ya2Zsb3dzLCBwcm9jZWR1cmVzLCBoYWJpdHMgKi9cbiAgICBwcm9jZWR1cmFsOiBNZW1vcnlFbnRyeVtdO1xuICAgIC8qKiBDb252ZXJzYXRpb24gc3VtbWFyaWVzLCBwYXN0IGV2ZW50cyAqL1xuICAgIGVwaXNvZGljOiBNZW1vcnlFbnRyeVtdO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlIFR5cGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIFNraWxsVGllciA9IDEgfCAyIHwgMztcblxuZXhwb3J0IGludGVyZmFjZSBTa2lsbE1ldGFkYXRhIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICB0aWVyOiBTa2lsbFRpZXI7XG4gICAgY2FwYWJpbGl0aWVzOiBzdHJpbmdbXTtcbiAgICBwYXRoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2tpbGxDb250ZW50IHtcbiAgICBtZXRhZGF0YTogU2tpbGxNZXRhZGF0YTtcbiAgICAvKiogVGllciAxOiBBbHdheXMgbG9hZGVkIG92ZXJ2aWV3ICovXG4gICAgb3ZlcnZpZXc6IHN0cmluZztcbiAgICAvKiogVGllciAyOiBMb2FkZWQgb24gYWN0aXZhdGlvbiAqL1xuICAgIGluc3RydWN0aW9ucz86IHN0cmluZztcbiAgICAvKiogVGllciAzOiBMb2FkZWQgb24gc3BlY2lmaWMgbmVlZCAqL1xuICAgIHJlc291cmNlcz86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2FkZWRTa2lsbCB7XG4gICAgbWV0YWRhdGE6IFNraWxsTWV0YWRhdGE7XG4gICAgbG9hZGVkVGllcnM6IFNraWxsVGllcltdO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICB0b2tlbkVzdGltYXRlOiBudW1iZXI7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENvbnRleHQgUmV0cmlldmFsIFR5cGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIFJldHJpZXZhbFBhdHRlcm4gPSBcInB1c2hcIiB8IFwicHVsbFwiIHwgXCJoeWJyaWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0VHJpZ2dlciB7XG4gICAgdHlwZTpcbiAgICAgICAgfCBcInNlc3Npb25fc3RhcnRcIlxuICAgICAgICB8IFwiZmlsZV9vcGVuXCJcbiAgICAgICAgfCBcImNvbW1hbmRcIlxuICAgICAgICB8IFwicXVlcnlcIlxuICAgICAgICB8IFwidGFza1wiXG4gICAgICAgIHwgXCJjb252ZXJzYXRpb25fdHVyblwiXG4gICAgICAgIHwgXCJmaWxlX2VkaXRcIjtcbiAgICBwYXR0ZXJuOiBSZXRyaWV2YWxQYXR0ZXJuO1xuICAgIGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFzc2VtYmxlZENvbnRleHQge1xuICAgIC8qKiBTZXNzaW9uIHN0YXRlICovXG4gICAgc2Vzc2lvbj86IFNlc3Npb247XG4gICAgLyoqIFJlbGV2YW50IG1lbW9yaWVzICovXG4gICAgbWVtb3JpZXM6IE1lbW9yeUVudHJ5W107XG4gICAgLyoqIExvYWRlZCBza2lsbHMgKi9cbiAgICBza2lsbHM6IExvYWRlZFNraWxsW107XG4gICAgLyoqIFRvdGFsIHRva2VuIGVzdGltYXRlICovXG4gICAgdG9rZW5Fc3RpbWF0ZTogbnVtYmVyO1xuICAgIC8qKiBBc3NlbWJseSBtZXRhZGF0YSAqL1xuICAgIG1ldGE6IHtcbiAgICAgICAgYXNzZW1ibGVkQXQ6IHN0cmluZztcbiAgICAgICAgdHJpZ2dlcnM6IHN0cmluZ1tdO1xuICAgICAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENvbmZpZ3VyYXRpb24gVHlwZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0RXhwb3J0Q29uZmlnIHtcbiAgICAvKiogRW5hYmxlIGV4cG9ydGluZyBodW1hbi1yZWFkYWJsZSBjb21tYW5kIGVudmVsb3Blcy4gKi9cbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICAvKiogTWFya2Rvd24gZXhwb3J0IHNldHRpbmdzICovXG4gICAgbWFya2Rvd24/OiB7XG4gICAgICAgIC8qKiBPdXRwdXQgZGlyZWN0b3J5IGZvciBtYXJrZG93biBleHBvcnRzICovXG4gICAgICAgIG91dHB1dERpcj86IHN0cmluZztcbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHRDb25maWcge1xuICAgIC8qKiBQYXRoIHRvIGNvbnRleHQgc3RvcmFnZSBkaXJlY3RvcnkgKi9cbiAgICBzdG9yYWdlUGF0aDogc3RyaW5nO1xuICAgIC8qKiBNYXhpbXVtIG1lbW9yaWVzIHRvIGtlZXAgcGVyIHR5cGUgKi9cbiAgICBtYXhNZW1vcmllc1BlclR5cGU6IG51bWJlcjtcbiAgICAvKiogRGF5cyBiZWZvcmUgYXJjaGl2aW5nIG9sZCBzZXNzaW9ucyAqL1xuICAgIHNlc3Npb25BcmNoaXZlRGF5czogbnVtYmVyO1xuICAgIC8qKiBDb25maWRlbmNlIGRlY2F5IHJhdGUgZm9yIGluZmVycmVkIG1lbW9yaWVzIChwZXIgZGF5KSAqL1xuICAgIGNvbmZpZGVuY2VEZWNheVJhdGU6IG51bWJlcjtcbiAgICAvKiogRW5hYmxlIHZlY3RvciBlbWJlZGRpbmdzIChyZXF1aXJlcyBleHRlcm5hbCBBUEkpICovXG4gICAgZW5hYmxlRW1iZWRkaW5nczogYm9vbGVhbjtcbiAgICAvKiogRGVmYXVsdCBza2lsbCB0aWVyIHRvIGxvYWQgKi9cbiAgICBkZWZhdWx0U2tpbGxUaWVyOiBTa2lsbFRpZXI7XG4gICAgLyoqIEVuYWJsZSBhdXRvbWF0aWMgY29udGV4dCBpbmZlcmVuY2UgZnJvbSBjb252ZXJzYXRpb25zIGFuZCBhY3Rpb25zICovXG4gICAgZW5hYmxlQXV0b0luZmVyZW5jZTogYm9vbGVhbjtcbiAgICAvKiogT3B0aW9uYWwgaHVtYW4tcmVhZGFibGUgZXhwb3J0cyAqL1xuICAgIGV4cG9ydD86IENvbnRleHRFeHBvcnRDb25maWc7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogQ29udGV4dENvbmZpZyA9IHtcbiAgICBzdG9yYWdlUGF0aDogXCIuYWktY29udGV4dFwiLFxuICAgIG1heE1lbW9yaWVzUGVyVHlwZTogMTAwLFxuICAgIHNlc3Npb25BcmNoaXZlRGF5czogMzAsXG4gICAgY29uZmlkZW5jZURlY2F5UmF0ZTogMC4wNSxcbiAgICBlbmFibGVFbWJlZGRpbmdzOiBmYWxzZSxcbiAgICBkZWZhdWx0U2tpbGxUaWVyOiAxLFxuICAgIGVuYWJsZUF1dG9JbmZlcmVuY2U6IHRydWUsIC8vIEVuYWJsZSBhdXRvbWF0aWMgaW5mZXJlbmNlIGJ5IGRlZmF1bHRcbiAgICBleHBvcnQ6IHtcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgIG1hcmtkb3duOiB7XG4gICAgICAgICAgICBvdXRwdXREaXI6IFwiLmFpLWNvbnRleHQvZXhwb3J0c1wiLFxuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG4vKipcbiAqIExvYWQgY29uZmlndXJhdGlvbiBmcm9tIC5haS1jb250ZXh0L2NvbmZpZy5qc29uIGlmIGl0IGV4aXN0c1xuICovXG5mdW5jdGlvbiBtZXJnZUNvbnRleHRDb25maWcoXG4gICAgYmFzZTogQ29udGV4dENvbmZpZyxcbiAgICBvdmVycmlkZXM/OiBQYXJ0aWFsPENvbnRleHRDb25maWc+LFxuKTogQ29udGV4dENvbmZpZyB7XG4gICAgY29uc3QgbWVyZ2VkOiBDb250ZXh0Q29uZmlnID0ge1xuICAgICAgICAuLi5iYXNlLFxuICAgICAgICAuLi5vdmVycmlkZXMsXG4gICAgICAgIGV4cG9ydDoge1xuICAgICAgICAgICAgLi4uYmFzZS5leHBvcnQsXG4gICAgICAgICAgICAuLi5vdmVycmlkZXM/LmV4cG9ydCxcbiAgICAgICAgICAgIG1hcmtkb3duOiB7XG4gICAgICAgICAgICAgICAgLi4uYmFzZS5leHBvcnQ/Lm1hcmtkb3duLFxuICAgICAgICAgICAgICAgIC4uLm92ZXJyaWRlcz8uZXhwb3J0Py5tYXJrZG93bixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHJldHVybiBtZXJnZWQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQ29uZmlnKFxuICAgIGN1c3RvbUNvbmZpZz86IFBhcnRpYWw8Q29udGV4dENvbmZpZz4sXG4pOiBQcm9taXNlPENvbnRleHRDb25maWc+IHtcbiAgICAvLyBNZXJnZSBkZWZhdWx0cyArIHBhc3NlZCBjb25maWcgZmlyc3QgKHNvIHN0b3JhZ2VQYXRoIGNhbiBpbmZsdWVuY2Ugd2hlcmUgY29uZmlnLmpzb24gaXMpLlxuICAgIGNvbnN0IGJhc2VDb25maWcgPSBtZXJnZUNvbnRleHRDb25maWcoREVGQVVMVF9DT05GSUcsIGN1c3RvbUNvbmZpZyk7XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBUcnkgdG8gbG9hZCBwcm9qZWN0LXNwZWNpZmljIGNvbmZpZ1xuICAgICAgICBjb25zdCB7IHJlYWRGaWxlIH0gPSBhd2FpdCBpbXBvcnQoXCJub2RlOmZzL3Byb21pc2VzXCIpO1xuICAgICAgICBjb25zdCB7IGV4aXN0c1N5bmMgfSA9IGF3YWl0IGltcG9ydChcIm5vZGU6ZnNcIik7XG4gICAgICAgIGNvbnN0IHsgam9pbiB9ID0gYXdhaXQgaW1wb3J0KFwibm9kZTpwYXRoXCIpO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGJhc2VDb25maWcuc3RvcmFnZVBhdGgsIFwiY29uZmlnLmpzb25cIik7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWdDb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoY29uZmlnUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RDb25maWcgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ0NvbnRlbnQsXG4gICAgICAgICAgICApIGFzIFBhcnRpYWw8Q29udGV4dENvbmZpZz47XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VDb250ZXh0Q29uZmlnKGJhc2VDb25maWcsIHByb2plY3RDb25maWcpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gSWdub3JlIGNvbmZpZyBsb2FkaW5nIGVycm9ycywgdXNlIGRlZmF1bHRzXG4gICAgICAgIGNvbnN0IHNpbGVudCA9XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5BSV9FTkdfU0lMRU5UID09PSBcIjFcIiB8fFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQUlfRU5HX1NJTEVOVCA9PT0gXCJ0cnVlXCIgfHxcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInRlc3RcIiB8fFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwiMVwiIHx8XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5CVU5fVEVTVCA9PT0gXCJ0cnVlXCI7XG5cbiAgICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICBcIkNvdWxkIG5vdCBsb2FkIGNvbnRleHQgY29uZmlnLCB1c2luZyBkZWZhdWx0czpcIixcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmFzZUNvbmZpZztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ29tbWFuZCBFbnZlbG9wZSBUeXBlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBDb21tYW5kRXhlY3V0aW9uU3RhdHVzID0gXCJzdWNjZXNzXCIgfCBcImZhaWx1cmVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kQ29udGV4dEVudmVsb3BlIHtcbiAgICAvKiogVW5pcXVlIGlkIGZvciB0aGlzIGVudmVsb3BlICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogSVNPIHRpbWVzdGFtcCAqL1xuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xuICAgIC8qKiBDTEkgY29tbWFuZCBuYW1lIChlLmcuICdwbGFuJywgJ3Jlc2VhcmNoJykgKi9cbiAgICBjb21tYW5kTmFtZTogc3RyaW5nO1xuICAgIC8qKiBTdWNjZXNzL2ZhaWx1cmUgKi9cbiAgICBzdGF0dXM6IENvbW1hbmRFeGVjdXRpb25TdGF0dXM7XG4gICAgLyoqIER1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIGR1cmF0aW9uTXM6IG51bWJlcjtcblxuICAgIC8qKiBCZXN0LWVmZm9ydCBpbnB1dHMvb3B0aW9ucy9hcmdzIHN1bW1hcnkgKi9cbiAgICBpbnB1dHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSBzaG9ydCBzdW1tYXJ5IG9mIHdoYXQgaGFwcGVuZWQgKi9cbiAgICBvdXRwdXRTdW1tYXJ5Pzogc3RyaW5nO1xuXG4gICAgLyoqIEJlc3QtZWZmb3J0IGxpc3Qgb2YgZmlsZXMgdGhlIGNvbW1hbmQgd3JvdGUvbW9kaWZpZWQgKG1heSBiZSBlbXB0eSkgKi9cbiAgICBmaWxlc1RvdWNoZWQ/OiBzdHJpbmdbXTtcblxuICAgIC8qKiBEZWNpc2lvbnMgY2FwdHVyZWQgZHVyaW5nIGV4ZWN1dGlvbiAqL1xuICAgIGRlY2lzaW9ucz86IHN0cmluZ1tdO1xuXG4gICAgLyoqIFRhZ3MgZm9yIHJldHJpZXZhbCAqL1xuICAgIHRhZ3M6IHN0cmluZ1tdO1xuXG4gICAgLyoqIE9wdGlvbmFsIHNlc3Npb24gaWRlbnRpZmllciAqL1xuICAgIHNlc3Npb25JZD86IHN0cmluZztcblxuICAgIC8qKiBPcHRpb25hbCBwcm9qZWN0IGlkZW50aWZpZXIgKHBhdGgvcmVwbyBuYW1lKSAqL1xuICAgIHByb2plY3Q/OiBzdHJpbmc7XG5cbiAgICAvKiogRXJyb3IgZGV0YWlscyAob25seSB3aGVuIHN0YXR1cyA9PT0gJ2ZhaWx1cmUnKSAqL1xuICAgIGVycm9yPzoge1xuICAgICAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgICAgIHN0YWNrPzogc3RyaW5nO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21tYW5kRW52ZWxvcGUoaW5wdXQ6IHtcbiAgICBjb21tYW5kTmFtZTogc3RyaW5nO1xuICAgIHN0YXR1czogQ29tbWFuZEV4ZWN1dGlvblN0YXR1cztcbiAgICBzdGFydFRpbWVNczogbnVtYmVyO1xuICAgIGVuZFRpbWVNczogbnVtYmVyO1xuICAgIGlucHV0cz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIG91dHB1dFN1bW1hcnk/OiBzdHJpbmc7XG4gICAgZmlsZXNUb3VjaGVkPzogc3RyaW5nW107XG4gICAgZGVjaXNpb25zPzogc3RyaW5nW107XG4gICAgdGFncz86IHN0cmluZ1tdO1xuICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICBwcm9qZWN0Pzogc3RyaW5nO1xuICAgIGVycm9yPzogdW5rbm93bjtcbn0pOiBDb21tYW5kQ29udGV4dEVudmVsb3BlIHtcbiAgICBjb25zdCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgaWQgPSBgZW52XyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpfWA7XG5cbiAgICBsZXQgZXJyb3JQYXlsb2FkOiBDb21tYW5kQ29udGV4dEVudmVsb3BlW1wiZXJyb3JcIl07XG4gICAgaWYgKGlucHV0LmVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgZXJyb3JQYXlsb2FkID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogaW5wdXQuZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIG5hbWU6IGlucHV0LmVycm9yLm5hbWUsXG4gICAgICAgICAgICBzdGFjazogaW5wdXQuZXJyb3Iuc3RhY2ssXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChpbnB1dC5lcnJvcikge1xuICAgICAgICBlcnJvclBheWxvYWQgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBTdHJpbmcoaW5wdXQuZXJyb3IpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGlkLFxuICAgICAgICBjcmVhdGVkQXQsXG4gICAgICAgIGNvbW1hbmROYW1lOiBpbnB1dC5jb21tYW5kTmFtZSxcbiAgICAgICAgc3RhdHVzOiBpbnB1dC5zdGF0dXMsXG4gICAgICAgIGR1cmF0aW9uTXM6IE1hdGgubWF4KDAsIGlucHV0LmVuZFRpbWVNcyAtIGlucHV0LnN0YXJ0VGltZU1zKSxcbiAgICAgICAgaW5wdXRzOiBpbnB1dC5pbnB1dHMsXG4gICAgICAgIG91dHB1dFN1bW1hcnk6IGlucHV0Lm91dHB1dFN1bW1hcnksXG4gICAgICAgIGZpbGVzVG91Y2hlZDogaW5wdXQuZmlsZXNUb3VjaGVkIHx8IFtdLFxuICAgICAgICBkZWNpc2lvbnM6IGlucHV0LmRlY2lzaW9ucyB8fCBbXSxcbiAgICAgICAgdGFnczogQXJyYXkuZnJvbShcbiAgICAgICAgICAgIG5ldyBTZXQoW1xuICAgICAgICAgICAgICAgIFwiY29tbWFuZC1lbnZlbG9wZVwiLFxuICAgICAgICAgICAgICAgIGBjb21tYW5kOiR7aW5wdXQuY29tbWFuZE5hbWV9YCxcbiAgICAgICAgICAgICAgICAuLi4oaW5wdXQudGFncyB8fCBbXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgKSxcbiAgICAgICAgc2Vzc2lvbklkOiBpbnB1dC5zZXNzaW9uSWQsXG4gICAgICAgIHByb2plY3Q6IGlucHV0LnByb2plY3QsXG4gICAgICAgIGVycm9yOiBpbnB1dC5zdGF0dXMgPT09IFwiZmFpbHVyZVwiID8gZXJyb3JQYXlsb2FkIDogdW5kZWZpbmVkLFxuICAgIH07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IFR5cGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIENvbnRleHRFdmVudCA9XG4gICAgfCB7IHR5cGU6IFwic2Vzc2lvbl9jcmVhdGVkXCI7IHNlc3Npb246IFNlc3Npb24gfVxuICAgIHwgeyB0eXBlOiBcInNlc3Npb25fcmVzdG9yZWRcIjsgc2Vzc2lvbjogU2Vzc2lvbiB9XG4gICAgfCB7IHR5cGU6IFwic2Vzc2lvbl91cGRhdGVkXCI7IHNlc3Npb246IFNlc3Npb24gfVxuICAgIHwgeyB0eXBlOiBcIm1lbW9yeV9hZGRlZFwiOyBlbnRyeTogTWVtb3J5RW50cnkgfVxuICAgIHwgeyB0eXBlOiBcIm1lbW9yeV9hY2Nlc3NlZFwiOyBlbnRyeTogTWVtb3J5RW50cnkgfVxuICAgIHwgeyB0eXBlOiBcInNraWxsX2xvYWRlZFwiOyBza2lsbDogTG9hZGVkU2tpbGwgfVxuICAgIHwgeyB0eXBlOiBcImNvbnRleHRfYXNzZW1ibGVkXCI7IGNvbnRleHQ6IEFzc2VtYmxlZENvbnRleHQgfTtcblxuZXhwb3J0IHR5cGUgQ29udGV4dEV2ZW50SGFuZGxlciA9IChldmVudDogQ29udGV4dEV2ZW50KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbiIsCiAgICAiLyoqXG4gKiBNZW1vcnkgU3lzdGVtXG4gKlxuICogSW1wbGVtZW50cyBkZWNsYXJhdGl2ZSwgcHJvY2VkdXJhbCwgYW5kIGVwaXNvZGljIG1lbW9yeSB3aXRoIHByb3ZlbmFuY2UgdHJhY2tpbmcuXG4gKiBNZW1vcmllcyBwZXJzaXN0IGFjcm9zcyBzZXNzaW9ucyBhbmQgaW5jbHVkZSBjb25maWRlbmNlIHNjb3JlcyB0aGF0IGRlY2F5IG92ZXIgdGltZS5cbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IG1rZGlyLCByZWFkRmlsZSwgd3JpdGVGaWxlIH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQ29tbWFuZENvbnRleHRFbnZlbG9wZSxcbiAgICBDb250ZXh0Q29uZmlnLFxuICAgIE1lbW9yeUVudHJ5LFxuICAgIE1lbW9yeVNvdXJjZSxcbiAgICBNZW1vcnlTdG9yZSxcbiAgICBNZW1vcnlUeXBlLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgTWVtb3J5TWFuYWdlciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IENvbnRleHRDb25maWc7XG4gICAgcHJpdmF0ZSBtZW1vcnlEaXI6IHN0cmluZztcbiAgICBwcml2YXRlIHN0b3JlOiBNZW1vcnlTdG9yZSA9IHtcbiAgICAgICAgZGVjbGFyYXRpdmU6IFtdLFxuICAgICAgICBwcm9jZWR1cmFsOiBbXSxcbiAgICAgICAgZXBpc29kaWM6IFtdLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29udGV4dENvbmZpZz4gPSB7fSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLm1lbW9yeURpciA9IGpvaW4odGhpcy5jb25maWcuc3RvcmFnZVBhdGgsIFwibWVtb3J5XCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIG1lbW9yeSBtYW5hZ2VyIGFuZCBsb2FkIGV4aXN0aW5nIG1lbW9yaWVzXG4gICAgICovXG4gICAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgbWtkaXIodGhpcy5tZW1vcnlEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRNZW1vcmllcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYWxsIG1lbW9yaWVzIGZyb20gZGlza1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgbG9hZE1lbW9yaWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0eXBlczogTWVtb3J5VHlwZVtdID0gW1wiZGVjbGFyYXRpdmVcIiwgXCJwcm9jZWR1cmFsXCIsIFwiZXBpc29kaWNcIl07XG5cbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gam9pbih0aGlzLm1lbW9yeURpciwgYCR7dHlwZX0uanNvbmApO1xuICAgICAgICAgICAgaWYgKGV4aXN0c1N5bmMocGF0aCkpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUocGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZVt0eXBlXSA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgTWVtb3J5RW50cnlbXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwbHkgY29uZmlkZW5jZSBkZWNheVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JlW3R5cGVdID0gdGhpcy5zdG9yZVt0eXBlXS5tYXAoKGVudHJ5KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZGVuY2VEZWNheShlbnRyeSksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGxvYWQgJHt0eXBlfSBtZW1vcmllczpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBhbGwgbWVtb3JpZXMgdG8gZGlza1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgc2F2ZU1lbW9yaWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0eXBlczogTWVtb3J5VHlwZVtdID0gW1wiZGVjbGFyYXRpdmVcIiwgXCJwcm9jZWR1cmFsXCIsIFwiZXBpc29kaWNcIl07XG5cbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gam9pbih0aGlzLm1lbW9yeURpciwgYCR7dHlwZX0uanNvbmApO1xuICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlKHBhdGgsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RvcmVbdHlwZV0sIG51bGwsIDIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG1lbW9yeSBlbnRyeVxuICAgICAqL1xuICAgIGFzeW5jIGFkZE1lbW9yeShcbiAgICAgICAgdHlwZTogTWVtb3J5VHlwZSxcbiAgICAgICAgY29udGVudDogc3RyaW5nLFxuICAgICAgICBvcHRpb25zPzoge1xuICAgICAgICAgICAgc291cmNlPzogTWVtb3J5U291cmNlO1xuICAgICAgICAgICAgY29udGV4dD86IHN0cmluZztcbiAgICAgICAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICAgICAgICAgIHRhZ3M/OiBzdHJpbmdbXTtcbiAgICAgICAgICAgIGNvbmZpZGVuY2U/OiBudW1iZXI7XG4gICAgICAgIH0sXG4gICAgKTogUHJvbWlzZTxNZW1vcnlFbnRyeT4ge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGVudHJ5OiBNZW1vcnlFbnRyeSA9IHtcbiAgICAgICAgICAgIGlkOiBgbWVtXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpfWAsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHByb3ZlbmFuY2U6IHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IG9wdGlvbnM/LnNvdXJjZSB8fCBcInVzZXJcIixcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5vdyxcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlOlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zPy5jb25maWRlbmNlID8/XG4gICAgICAgICAgICAgICAgICAgIChvcHRpb25zPy5zb3VyY2UgPT09IFwiaW5mZXJyZWRcIiA/IDAuNyA6IDEuMCksXG4gICAgICAgICAgICAgICAgY29udGV4dDogb3B0aW9ucz8uY29udGV4dCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIHNlc3Npb25JZDogb3B0aW9ucz8uc2Vzc2lvbklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRhZ3M6IG9wdGlvbnM/LnRhZ3MgfHwgW10sXG4gICAgICAgICAgICBsYXN0QWNjZXNzZWQ6IG5vdyxcbiAgICAgICAgICAgIGFjY2Vzc0NvdW50OiAwLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc3RvcmVbdHlwZV0ucHVzaChlbnRyeSk7XG5cbiAgICAgICAgLy8gRW5mb3JjZSBtYXggbWVtb3JpZXMgcGVyIHR5cGVcbiAgICAgICAgaWYgKHRoaXMuc3RvcmVbdHlwZV0ubGVuZ3RoID4gdGhpcy5jb25maWcubWF4TWVtb3JpZXNQZXJUeXBlKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgb2xkZXN0LCBsZWFzdCBhY2Nlc3NlZCBlbnRyaWVzXG4gICAgICAgICAgICB0aGlzLnN0b3JlW3R5cGVdLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzY29yZUEgPVxuICAgICAgICAgICAgICAgICAgICBhLmFjY2Vzc0NvdW50IC9cbiAgICAgICAgICAgICAgICAgICAgKERhdGUubm93KCkgLSBuZXcgRGF0ZShhLmxhc3RBY2Nlc3NlZCkuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY29yZUIgPVxuICAgICAgICAgICAgICAgICAgICBiLmFjY2Vzc0NvdW50IC9cbiAgICAgICAgICAgICAgICAgICAgKERhdGUubm93KCkgLSBuZXcgRGF0ZShiLmxhc3RBY2Nlc3NlZCkuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NvcmVBIC0gc2NvcmVCO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnN0b3JlW3R5cGVdID0gdGhpcy5zdG9yZVt0eXBlXS5zbGljZShcbiAgICAgICAgICAgICAgICAtdGhpcy5jb25maWcubWF4TWVtb3JpZXNQZXJUeXBlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZU1lbW9yaWVzKCk7XG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgYSBtZW1vcnkgZW50cnlcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVNZW1vcnkoXG4gICAgICAgIGlkOiBzdHJpbmcsXG4gICAgICAgIHVwZGF0ZXM6IFBhcnRpYWw8T21pdDxNZW1vcnlFbnRyeSwgXCJpZFwiIHwgXCJwcm92ZW5hbmNlXCI+PixcbiAgICApOiBQcm9taXNlPE1lbW9yeUVudHJ5IHwgbnVsbD4ge1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgT2JqZWN0LmtleXModGhpcy5zdG9yZSkgYXMgTWVtb3J5VHlwZVtdKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuc3RvcmVbdHlwZV0uZmluZCgoZSkgPT4gZS5pZCA9PT0gaWQpO1xuICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihlbnRyeSwgdXBkYXRlcyk7XG4gICAgICAgICAgICAgICAgZW50cnkubGFzdEFjY2Vzc2VkID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZU1lbW9yaWVzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2VzcyBhIG1lbW9yeSAodXBkYXRlcyBhY2Nlc3MgY291bnQgYW5kIHRpbWVzdGFtcClcbiAgICAgKi9cbiAgICBhc3luYyBhY2Nlc3NNZW1vcnkoaWQ6IHN0cmluZyk6IFByb21pc2U8TWVtb3J5RW50cnkgfCBudWxsPiB7XG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBPYmplY3Qua2V5cyh0aGlzLnN0b3JlKSBhcyBNZW1vcnlUeXBlW10pIHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5zdG9yZVt0eXBlXS5maW5kKChlKSA9PiBlLmlkID09PSBpZCk7XG4gICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICBlbnRyeS5sYXN0QWNjZXNzZWQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgZW50cnkuYWNjZXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVNZW1vcmllcygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBtZW1vcnkgZW50cnlcbiAgICAgKi9cbiAgICBhc3luYyBkZWxldGVNZW1vcnkoaWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgT2JqZWN0LmtleXModGhpcy5zdG9yZSkgYXMgTWVtb3J5VHlwZVtdKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RvcmVbdHlwZV0uZmluZEluZGV4KChlKSA9PiBlLmlkID09PSBpZCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVbdHlwZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVNZW1vcmllcygpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBhIGNvbW1hbmQgZXhlY3V0aW9uIGVudmVsb3BlIGFzIGVwaXNvZGljIG1lbW9yeS5cbiAgICAgKi9cbiAgICBhc3luYyBzdG9yZUNvbW1hbmRFbnZlbG9wZShcbiAgICAgICAgZW52ZWxvcGU6IENvbW1hbmRDb250ZXh0RW52ZWxvcGUsXG4gICAgICAgIG9wdGlvbnM/OiB7XG4gICAgICAgICAgICBzb3VyY2U/OiBNZW1vcnlTb3VyY2U7XG4gICAgICAgICAgICBjb25maWRlbmNlPzogbnVtYmVyO1xuICAgICAgICAgICAgY29udGV4dD86IHN0cmluZztcbiAgICAgICAgfSxcbiAgICApOiBQcm9taXNlPE1lbW9yeUVudHJ5PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZE1lbW9yeShcImVwaXNvZGljXCIsIEpTT04uc3RyaW5naWZ5KGVudmVsb3BlLCBudWxsLCAyKSwge1xuICAgICAgICAgICAgc291cmNlOiBvcHRpb25zPy5zb3VyY2UgPz8gXCJhZ2VudFwiLFxuICAgICAgICAgICAgY29uZmlkZW5jZTogb3B0aW9ucz8uY29uZmlkZW5jZSA/PyAxLjAsXG4gICAgICAgICAgICBjb250ZXh0OlxuICAgICAgICAgICAgICAgIG9wdGlvbnM/LmNvbnRleHQgPz8gYENvbW1hbmQgZW52ZWxvcGU6ICR7ZW52ZWxvcGUuY29tbWFuZE5hbWV9YCxcbiAgICAgICAgICAgIHNlc3Npb25JZDogZW52ZWxvcGUuc2Vzc2lvbklkLFxuICAgICAgICAgICAgdGFnczogZW52ZWxvcGUudGFncyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGNvbW1hbmQgZW52ZWxvcGUuXG4gICAgICovXG4gICAgZ2V0TGF0ZXN0Q29tbWFuZEVudmVsb3BlKGZpbHRlcj86IHtcbiAgICAgICAgY29tbWFuZE5hbWU/OiBzdHJpbmc7XG4gICAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICB9KTogQ29tbWFuZENvbnRleHRFbnZlbG9wZSB8IG51bGwge1xuICAgICAgICBjb25zdCBlcGlzb2RpYyA9IHRoaXMuZ2V0TWVtb3JpZXNCeVR5cGUoXCJlcGlzb2RpY1wiKTtcblxuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gZXBpc29kaWNcbiAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS50YWdzLmluY2x1ZGVzKFwiY29tbWFuZC1lbnZlbG9wZVwiKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KSA9PlxuICAgICAgICAgICAgICAgIGZpbHRlcj8uY29tbWFuZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgPyBlbnRyeS50YWdzLmluY2x1ZGVzKGBjb21tYW5kOiR7ZmlsdGVyLmNvbW1hbmROYW1lfWApXG4gICAgICAgICAgICAgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5maWx0ZXIoKGVudHJ5KSA9PlxuICAgICAgICAgICAgICAgIGZpbHRlcj8uc2Vzc2lvbklkXG4gICAgICAgICAgICAgICAgICAgID8gZW50cnkucHJvdmVuYW5jZS5zZXNzaW9uSWQgPT09IGZpbHRlci5zZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgOiB0cnVlLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnNvcnQoXG4gICAgICAgICAgICAgICAgKGEsIGIpID0+XG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGIucHJvdmVuYW5jZS50aW1lc3RhbXApLmdldFRpbWUoKSAtXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGEucHJvdmVuYW5jZS50aW1lc3RhbXApLmdldFRpbWUoKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgbGF0ZXN0ID0gY2FuZGlkYXRlc1swXTtcbiAgICAgICAgaWYgKCFsYXRlc3QpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsYXRlc3QuY29udGVudCkgYXMgQ29tbWFuZENvbnRleHRFbnZlbG9wZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCBtZW1vcmllcyBieSBjb250ZW50IG9yIHRhZ3NcbiAgICAgKi9cbiAgICBzZWFyY2hNZW1vcmllcyhcbiAgICAgICAgcXVlcnk6IHN0cmluZyxcbiAgICAgICAgb3B0aW9ucz86IHtcbiAgICAgICAgICAgIHR5cGU/OiBNZW1vcnlUeXBlO1xuICAgICAgICAgICAgdGFncz86IHN0cmluZ1tdO1xuICAgICAgICAgICAgbWluQ29uZmlkZW5jZT86IG51bWJlcjtcbiAgICAgICAgfSxcbiAgICApOiBNZW1vcnlFbnRyeVtdIHtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IE1lbW9yeUVudHJ5W10gPSBbXTtcblxuICAgICAgICBjb25zdCB0eXBlcyA9IG9wdGlvbnM/LnR5cGVcbiAgICAgICAgICAgID8gW29wdGlvbnMudHlwZV1cbiAgICAgICAgICAgIDogKE9iamVjdC5rZXlzKHRoaXMuc3RvcmUpIGFzIE1lbW9yeVR5cGVbXSk7XG5cbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVzKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICAgICAgLi4udGhpcy5zdG9yZVt0eXBlXS5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnRlbnQgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbnRyeS5jb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnlMb3dlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRhZyBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucz8udGFncyAmJiBvcHRpb25zLnRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFvcHRpb25zLnRhZ3Muc29tZSgodGFnKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS50YWdzLmluY2x1ZGVzKHRhZyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ29uZmlkZW5jZSB0aHJlc2hvbGRcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz8ubWluQ29uZmlkZW5jZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkucHJvdmVuYW5jZS5jb25maWRlbmNlIDwgb3B0aW9ucy5taW5Db25maWRlbmNlXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU29ydCBieSByZWxldmFuY2UgKGFjY2VzcyBjb3VudCwgY29uZmlkZW5jZSwgcmVjZW5jeSlcbiAgICAgICAgcmVzdWx0cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzY29yZUEgPSBhLmFjY2Vzc0NvdW50ICogYS5wcm92ZW5hbmNlLmNvbmZpZGVuY2U7XG4gICAgICAgICAgICBjb25zdCBzY29yZUIgPSBiLmFjY2Vzc0NvdW50ICogYi5wcm92ZW5hbmNlLmNvbmZpZGVuY2U7XG4gICAgICAgICAgICBpZiAoc2NvcmVBICE9PSBzY29yZUIpIHJldHVybiBzY29yZUIgLSBzY29yZUE7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVBID0gbmV3IERhdGUoYS5sYXN0QWNjZXNzZWQpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVCID0gbmV3IERhdGUoYi5sYXN0QWNjZXNzZWQpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHJldHVybiB0aW1lQiAtIHRpbWVBO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWVtb3JpZXMgYnkgdHlwZVxuICAgICAqL1xuICAgIGdldE1lbW9yaWVzQnlUeXBlKHR5cGU6IE1lbW9yeVR5cGUpOiBNZW1vcnlFbnRyeVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmVbdHlwZV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBtZW1vcmllc1xuICAgICAqL1xuICAgIGdldEFsbE1lbW9yaWVzKCk6IE1lbW9yeUVudHJ5W10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4udGhpcy5zdG9yZS5kZWNsYXJhdGl2ZSxcbiAgICAgICAgICAgIC4uLnRoaXMuc3RvcmUucHJvY2VkdXJhbCxcbiAgICAgICAgICAgIC4uLnRoaXMuc3RvcmUuZXBpc29kaWMsXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG1lbW9yeSBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgZ2V0U3RhdHMoKToge1xuICAgICAgICB0b3RhbDogbnVtYmVyO1xuICAgICAgICBieVR5cGU6IFJlY29yZDxNZW1vcnlUeXBlLCBudW1iZXI+O1xuICAgICAgICBhdmdDb25maWRlbmNlOiBudW1iZXI7XG4gICAgICAgIG9sZGVzdE1lbW9yeTogc3RyaW5nIHwgbnVsbDtcbiAgICAgICAgbmV3ZXN0TWVtb3J5OiBzdHJpbmcgfCBudWxsO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBhbGwgPSB0aGlzLmdldEFsbE1lbW9yaWVzKCk7XG4gICAgICAgIGNvbnN0IGJ5VHlwZTogUmVjb3JkPE1lbW9yeVR5cGUsIG51bWJlcj4gPSB7XG4gICAgICAgICAgICBkZWNsYXJhdGl2ZTogdGhpcy5zdG9yZS5kZWNsYXJhdGl2ZS5sZW5ndGgsXG4gICAgICAgICAgICBwcm9jZWR1cmFsOiB0aGlzLnN0b3JlLnByb2NlZHVyYWwubGVuZ3RoLFxuICAgICAgICAgICAgZXBpc29kaWM6IHRoaXMuc3RvcmUuZXBpc29kaWMubGVuZ3RoLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGF2Z0NvbmZpZGVuY2UgPVxuICAgICAgICAgICAgYWxsLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGFsbC5yZWR1Y2UoKHN1bSwgbSkgPT4gc3VtICsgbS5wcm92ZW5hbmNlLmNvbmZpZGVuY2UsIDApIC9cbiAgICAgICAgICAgICAgICAgIGFsbC5sZW5ndGhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmFsbF0uc29ydChcbiAgICAgICAgICAgIChhLCBiKSA9PlxuICAgICAgICAgICAgICAgIG5ldyBEYXRlKGEucHJvdmVuYW5jZS50aW1lc3RhbXApLmdldFRpbWUoKSAtXG4gICAgICAgICAgICAgICAgbmV3IERhdGUoYi5wcm92ZW5hbmNlLnRpbWVzdGFtcCkuZ2V0VGltZSgpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbDogYWxsLmxlbmd0aCxcbiAgICAgICAgICAgIGJ5VHlwZSxcbiAgICAgICAgICAgIGF2Z0NvbmZpZGVuY2U6IE1hdGgucm91bmQoYXZnQ29uZmlkZW5jZSAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgICBvbGRlc3RNZW1vcnk6IHNvcnRlZFswXT8uaWQgfHwgbnVsbCxcbiAgICAgICAgICAgIG5ld2VzdE1lbW9yeTogc29ydGVkW3NvcnRlZC5sZW5ndGggLSAxXT8uaWQgfHwgbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBseSBjb25maWRlbmNlIGRlY2F5IHRvIGEgbWVtb3J5IGJhc2VkIG9uIGFnZVxuICAgICAqIEluZmVycmVkIG1lbW9yaWVzIGRlY2F5IGZhc3RlciB0aGFuIHVzZXItcHJvdmlkZWQgb25lc1xuICAgICAqL1xuICAgIHByaXZhdGUgYXBwbHlDb25maWRlbmNlRGVjYXkoZW50cnk6IE1lbW9yeUVudHJ5KTogTWVtb3J5RW50cnkge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCBjcmVhdGVkID0gbmV3IERhdGUoZW50cnkucHJvdmVuYW5jZS50aW1lc3RhbXApO1xuICAgICAgICBjb25zdCBkYXlzU2luY2VDcmVhdGlvbiA9XG4gICAgICAgICAgICAobm93LmdldFRpbWUoKSAtIGNyZWF0ZWQuZ2V0VGltZSgpKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KTtcblxuICAgICAgICBpZiAoZW50cnkucHJvdmVuYW5jZS5zb3VyY2UgPT09IFwiaW5mZXJyZWRcIikge1xuICAgICAgICAgICAgLy8gSW5mZXJyZWQgbWVtb3JpZXMgZGVjYXkgZmFzdGVyXG4gICAgICAgICAgICBjb25zdCBkZWNheUZhY3RvciA9XG4gICAgICAgICAgICAgICAgKDEgLSB0aGlzLmNvbmZpZy5jb25maWRlbmNlRGVjYXlSYXRlKSAqKiBkYXlzU2luY2VDcmVhdGlvbjtcbiAgICAgICAgICAgIGVudHJ5LnByb3ZlbmFuY2UuY29uZmlkZW5jZSAqPSBkZWNheUZhY3RvcjtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5wcm92ZW5hbmNlLnNvdXJjZSA9PT0gXCJhZ2VudFwiKSB7XG4gICAgICAgICAgICAvLyBBZ2VudCBtZW1vcmllcyBkZWNheSBzbG93ZXJcbiAgICAgICAgICAgIGNvbnN0IGRlY2F5RmFjdG9yID1cbiAgICAgICAgICAgICAgICAoMSAtIHRoaXMuY29uZmlnLmNvbmZpZGVuY2VEZWNheVJhdGUgKiAwLjUpICoqXG4gICAgICAgICAgICAgICAgZGF5c1NpbmNlQ3JlYXRpb247XG4gICAgICAgICAgICBlbnRyeS5wcm92ZW5hbmNlLmNvbmZpZGVuY2UgKj0gZGVjYXlGYWN0b3I7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXNlciBtZW1vcmllcyBkb24ndCBkZWNheVxuXG4gICAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcmNoaXZlIG9sZCBtZW1vcmllcyAobW92ZSB0byBlcGlzb2RpYyBzdW1tYXJ5KVxuICAgICAqL1xuICAgIGFzeW5jIGFyY2hpdmVPbGRNZW1vcmllcyhkYXlzVGhyZXNob2xkID0gMzApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsZXQgYXJjaGl2ZWQgPSAwO1xuXG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbXCJkZWNsYXJhdGl2ZVwiLCBcInByb2NlZHVyYWxcIl0gYXMgTWVtb3J5VHlwZVtdKSB7XG4gICAgICAgICAgICBjb25zdCB0b0FyY2hpdmUgPSB0aGlzLnN0b3JlW3R5cGVdLmZpbHRlcigoZW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVkID0gbmV3IERhdGUoZW50cnkucHJvdmVuYW5jZS50aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRheXNTaW5jZUNyZWF0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgKG5vdy5nZXRUaW1lKCkgLSBjcmVhdGVkLmdldFRpbWUoKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgZGF5c1NpbmNlQ3JlYXRpb24gPiBkYXlzVGhyZXNob2xkICYmIGVudHJ5LmFjY2Vzc0NvdW50IDwgM1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0b0FyY2hpdmUpIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZXBpc29kaWMgc3VtbWFyeVxuICAgICAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBgWyR7dHlwZX1dICR7ZW50cnkuY29udGVudC5zdWJzdHJpbmcoMCwgMTAwKX0uLi4gKGFyY2hpdmVkIGZyb20gJHtlbnRyeS5wcm92ZW5hbmNlLnRpbWVzdGFtcH0pYDtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZE1lbW9yeShcImVwaXNvZGljXCIsIHN1bW1hcnksIHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBcImluZmVycmVkXCIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGBBcmNoaXZlZCBmcm9tICR7dHlwZX1gLFxuICAgICAgICAgICAgICAgICAgICB0YWdzOiBbXCJhcmNoaXZlZFwiLCB0eXBlXSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBmcm9tIG9yaWdpbmFsIHR5cGVcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RvcmVbdHlwZV0uaW5kZXhPZihlbnRyeSk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZVt0eXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBhcmNoaXZlZCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcmNoaXZlZCA+IDApIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZU1lbW9yaWVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJjaGl2ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3VtbWFyeSBvZiBtZW1vcmllcyBmb3IgY29udGV4dCBhc3NlbWJseVxuICAgICAqL1xuICAgIGdldFN1bW1hcnkobWF4SXRlbXMgPSA1KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSB0aGlzLmdldFN0YXRzKCk7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gW1xuICAgICAgICAgICAgXCIjIyBNZW1vcnkgU3lzdGVtXCIsXG4gICAgICAgICAgICBgVG90YWwgbWVtb3JpZXM6ICR7c3RhdHMudG90YWx9YCxcbiAgICAgICAgICAgIGAtIERlY2xhcmF0aXZlOiAke3N0YXRzLmJ5VHlwZS5kZWNsYXJhdGl2ZX1gLFxuICAgICAgICAgICAgYC0gUHJvY2VkdXJhbDogJHtzdGF0cy5ieVR5cGUucHJvY2VkdXJhbH1gLFxuICAgICAgICAgICAgYC0gRXBpc29kaWM6ICR7c3RhdHMuYnlUeXBlLmVwaXNvZGljfWAsXG4gICAgICAgICAgICBgQXZlcmFnZSBjb25maWRlbmNlOiAke3N0YXRzLmF2Z0NvbmZpZGVuY2V9YCxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQWRkIHJlY2VudCBoaWdoLWNvbmZpZGVuY2UgbWVtb3JpZXNcbiAgICAgICAgY29uc3QgcmVjZW50ID0gdGhpcy5nZXRBbGxNZW1vcmllcygpXG4gICAgICAgICAgICAuc29ydChcbiAgICAgICAgICAgICAgICAoYSwgYikgPT5cbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoYi5sYXN0QWNjZXNzZWQpLmdldFRpbWUoKSAtXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGEubGFzdEFjY2Vzc2VkKS5nZXRUaW1lKCksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuZmlsdGVyKChtKSA9PiBtLnByb3ZlbmFuY2UuY29uZmlkZW5jZSA+IDAuNylcbiAgICAgICAgICAgIC5zbGljZSgwLCBtYXhJdGVtcyk7XG5cbiAgICAgICAgaWYgKHJlY2VudC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiIyMjIFJlY2VudCBIaWdoLUNvbmZpZGVuY2UgTWVtb3JpZXNcIik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbSBvZiByZWNlbnQpIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBgLSBbJHttZW0udHlwZX1dICR7bWVtLmNvbnRlbnQuc3Vic3RyaW5nKDAsIDgwKX0uLi5gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbiAgICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZSBmb3IgY29udmVuaWVuY2VcbmxldCBkZWZhdWx0TWFuYWdlcjogTWVtb3J5TWFuYWdlciB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWVtb3J5TWFuYWdlcihcbiAgICBjb25maWc/OiBQYXJ0aWFsPENvbnRleHRDb25maWc+LFxuKTogTWVtb3J5TWFuYWdlciB7XG4gICAgaWYgKCFkZWZhdWx0TWFuYWdlcikge1xuICAgICAgICBkZWZhdWx0TWFuYWdlciA9IG5ldyBNZW1vcnlNYW5hZ2VyKGNvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0TWFuYWdlcjtcbn1cbiIsCiAgICAiLyoqXG4gKiBQcm9ncmVzc2l2ZSBEaXNjbG9zdXJlIEFyY2hpdGVjdHVyZSAoUERBKVxuICpcbiAqIEltcGxlbWVudHMgMy10aWVyIHNraWxsIGxvYWRpbmcgdG8gcmVkdWNlIHRva2VuIHVzYWdlIGJ5IH45MCUuXG4gKiBCYXNlZCBvbiBDbGF1ZGUgU2tpbGxzIHJlc2VhcmNoIGJ5IFJpY2sgSGlnaHRvd2VyLlxuICpcbiAqIFRpZXIgMTogTWV0YWRhdGEgKGFsd2F5cyBsb2FkZWQpIC0gfjUwIHRva2Vuc1xuICogVGllciAyOiBJbnN0cnVjdGlvbnMgKGxvYWRlZCBvbiBkZW1hbmQpIC0gfjUwMCB0b2tlbnNcbiAqIFRpZXIgMzogUmVzb3VyY2VzIChsb2FkZWQgd2hlbiBuZWVkZWQpIC0gfjIwMDArIHRva2Vuc1xuICovXG5cbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgcmVhZEZpbGUsIHJlYWRkaXIgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBMb2FkZWRTa2lsbCxcbiAgICBTa2lsbENvbnRlbnQsXG4gICAgU2tpbGxNZXRhZGF0YSxcbiAgICBTa2lsbFRpZXIsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmVzc2l2ZVNraWxsTG9hZGVyIHtcbiAgICBwcml2YXRlIHNraWxsc0Rpcjogc3RyaW5nO1xuICAgIHByaXZhdGUgbG9hZGVkQ2FjaGU6IE1hcDxzdHJpbmcsIExvYWRlZFNraWxsPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0cnVjdG9yKHNraWxsc0RpciA9IFwiLi9za2lsbHNcIikge1xuICAgICAgICB0aGlzLnNraWxsc0RpciA9IHNraWxsc0RpcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSBZQU1MIGZyb250bWF0dGVyIGZyb20gc2tpbGwgbWFya2Rvd25cbiAgICAgKi9cbiAgICBwcml2YXRlIHBhcnNlRnJvbnRtYXR0ZXIoY29udGVudDogc3RyaW5nKToge1xuICAgICAgICBtZXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgICAgICBib2R5OiBzdHJpbmc7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLVxcbihbXFxzXFxTXSopJC8pO1xuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4geyBtZXRhOiB7fSwgYm9keTogY29udGVudCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgWywgZnJvbnRtYXR0ZXIsIGJvZHldID0gbWF0Y2g7XG4gICAgICAgIGNvbnN0IG1ldGE6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZnJvbnRtYXR0ZXIuc3BsaXQoXCJcXG5cIikpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9uSW5kZXggPSBsaW5lLmluZGV4T2YoXCI6XCIpO1xuICAgICAgICAgICAgaWYgKGNvbG9uSW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gbGluZS5zbGljZSgwLCBjb2xvbkluZGV4KS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBhbnkgPSBsaW5lLnNsaWNlKGNvbG9uSW5kZXggKyAxKS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBib29sZWFucyBhbmQgbnVtYmVyc1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJ0cnVlXCIpIHZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSB2YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFOdW1iZXIuaXNOYU4oTnVtYmVyKHZhbHVlKSkpIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIG1ldGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgbWV0YSwgYm9keTogYm9keS50cmltKCkgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHRpZXIgY29udGVudCBmcm9tIG1hcmtkb3duXG4gICAgICogVGllciBtYXJrZXJzOiA8IS0tIHRpZXI6MiAtLT4gYW5kIDwhLS0gdGllcjozIC0tPlxuICAgICAqL1xuICAgIHByaXZhdGUgZXh0cmFjdFRpZXJDb250ZW50KGJvZHk6IHN0cmluZyk6IHtcbiAgICAgICAgb3ZlcnZpZXc6IHN0cmluZztcbiAgICAgICAgaW5zdHJ1Y3Rpb25zPzogc3RyaW5nO1xuICAgICAgICByZXNvdXJjZXM/OiBzdHJpbmc7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IHRpZXIyTWF0Y2ggPSBib2R5Lm1hdGNoKFxuICAgICAgICAgICAgLzwhLS1cXHMqdGllcjoyXFxzKi0tPihbXFxzXFxTXSo/KSg/PTwhLS1cXHMqdGllcjozXFxzKi0tPnwkKS8sXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHRpZXIzTWF0Y2ggPSBib2R5Lm1hdGNoKC88IS0tXFxzKnRpZXI6M1xccyotLT4oW1xcc1xcU10qKSQvKTtcblxuICAgICAgICAvLyBFdmVyeXRoaW5nIGJlZm9yZSB0aWVyOjIgbWFya2VyIGlzIG92ZXJ2aWV3XG4gICAgICAgIGNvbnN0IG92ZXJ2aWV3RW5kID0gYm9keS5pbmRleE9mKFwiPCEtLSB0aWVyOjIgLS0+XCIpO1xuICAgICAgICBjb25zdCBvdmVydmlldyA9XG4gICAgICAgICAgICBvdmVydmlld0VuZCA+IC0xXG4gICAgICAgICAgICAgICAgPyBib2R5LnN1YnN0cmluZygwLCBvdmVydmlld0VuZCkudHJpbSgpXG4gICAgICAgICAgICAgICAgOiBib2R5LnRyaW0oKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3ZlcnZpZXcsXG4gICAgICAgICAgICBpbnN0cnVjdGlvbnM6IHRpZXIyTWF0Y2ggPyB0aWVyMk1hdGNoWzFdLnRyaW0oKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHJlc291cmNlczogdGllcjNNYXRjaCA/IHRpZXIzTWF0Y2hbMV0udHJpbSgpIDogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVzdGltYXRlIHRva2VucyBmb3IgY29udGVudCAocm91Z2ggYXBwcm94aW1hdGlvbilcbiAgICAgKiB+MSB0b2tlbiBwZXIgNCBjaGFyYWN0ZXJzXG4gICAgICovXG4gICAgcHJpdmF0ZSBlc3RpbWF0ZVRva2Vucyhjb250ZW50OiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNvbnRlbnQubGVuZ3RoIC8gNCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBza2lsbCBtZXRhZGF0YSBvbmx5IChUaWVyIDEpXG4gICAgICovXG4gICAgYXN5bmMgbG9hZFNraWxsTWV0YWRhdGEoc2tpbGxQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFNraWxsTWV0YWRhdGEgfCBudWxsPiB7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhza2lsbFBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoc2tpbGxQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgY29uc3QgeyBtZXRhIH0gPSB0aGlzLnBhcnNlRnJvbnRtYXR0ZXIoY29udGVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmFtZTogbWV0YS5uYW1lIHx8IFwidW5rbm93blwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXRhLmRlc2NyaXB0aW9uIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgdGllcjogbWV0YS50aWVyIHx8IDEsXG4gICAgICAgICAgICAgICAgY2FwYWJpbGl0aWVzOiBtZXRhLmNhcGFiaWxpdGllcyB8fCBbXSxcbiAgICAgICAgICAgICAgICBwYXRoOiBza2lsbFBhdGgsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGxvYWQgc2tpbGwgbWV0YWRhdGEgZnJvbSAke3NraWxsUGF0aH06YCxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgc2tpbGwgd2l0aCBzcGVjaWZpZWQgdGllcnNcbiAgICAgKi9cbiAgICBhc3luYyBsb2FkU2tpbGwoXG4gICAgICAgIHNraWxsUGF0aDogc3RyaW5nLFxuICAgICAgICB0aWVyczogU2tpbGxUaWVyW10gPSBbMV0sXG4gICAgKTogUHJvbWlzZTxMb2FkZWRTa2lsbCB8IG51bGw+IHtcbiAgICAgICAgLy8gQ2hlY2sgY2FjaGVcbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBgJHtza2lsbFBhdGh9OiR7dGllcnMuam9pbihcIixcIil9YDtcbiAgICAgICAgaWYgKHRoaXMubG9hZGVkQ2FjaGUuaGFzKGNhY2hlS2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZGVkQ2FjaGUuZ2V0KGNhY2hlS2V5KSE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoc2tpbGxQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHNraWxsUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHsgbWV0YSwgYm9keSB9ID0gdGhpcy5wYXJzZUZyb250bWF0dGVyKGNvbnRlbnQpO1xuICAgICAgICAgICAgY29uc3QgdGllckNvbnRlbnQgPSB0aGlzLmV4dHJhY3RUaWVyQ29udGVudChib2R5KTtcblxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGE6IFNraWxsTWV0YWRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogbWV0YS5uYW1lIHx8IFwidW5rbm93blwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXRhLmRlc2NyaXB0aW9uIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgdGllcjogbWV0YS50aWVyIHx8IDEsXG4gICAgICAgICAgICAgICAgY2FwYWJpbGl0aWVzOiBtZXRhLmNhcGFiaWxpdGllcyB8fCBbXSxcbiAgICAgICAgICAgICAgICBwYXRoOiBza2lsbFBhdGgsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBCdWlsZCBjb250ZW50IGJhc2VkIG9uIHJlcXVlc3RlZCB0aWVyc1xuICAgICAgICAgICAgY29uc3QgY29udGVudFBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHRva2VuRXN0aW1hdGUgPSAwO1xuXG4gICAgICAgICAgICBpZiAodGllcnMuaW5jbHVkZXMoMSkpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50UGFydHMucHVzaCh0aWVyQ29udGVudC5vdmVydmlldyk7XG4gICAgICAgICAgICAgICAgdG9rZW5Fc3RpbWF0ZSArPSB0aGlzLmVzdGltYXRlVG9rZW5zKHRpZXJDb250ZW50Lm92ZXJ2aWV3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpZXJzLmluY2x1ZGVzKDIpICYmIHRpZXJDb250ZW50Lmluc3RydWN0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRQYXJ0cy5wdXNoKHRpZXJDb250ZW50Lmluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgdG9rZW5Fc3RpbWF0ZSArPSB0aGlzLmVzdGltYXRlVG9rZW5zKHRpZXJDb250ZW50Lmluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aWVycy5pbmNsdWRlcygzKSAmJiB0aWVyQ29udGVudC5yZXNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50UGFydHMucHVzaCh0aWVyQ29udGVudC5yZXNvdXJjZXMpO1xuICAgICAgICAgICAgICAgIHRva2VuRXN0aW1hdGUgKz0gdGhpcy5lc3RpbWF0ZVRva2Vucyh0aWVyQ29udGVudC5yZXNvdXJjZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsb2FkZWQ6IExvYWRlZFNraWxsID0ge1xuICAgICAgICAgICAgICAgIG1ldGFkYXRhLFxuICAgICAgICAgICAgICAgIGxvYWRlZFRpZXJzOiB0aWVycyxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50UGFydHMuam9pbihcIlxcblxcblwiKSxcbiAgICAgICAgICAgICAgICB0b2tlbkVzdGltYXRlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICAgICAgdGhpcy5sb2FkZWRDYWNoZS5zZXQoY2FjaGVLZXksIGxvYWRlZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2FkZWQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBza2lsbCBmcm9tICR7c2tpbGxQYXRofTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgYWxsIHNraWxscyBpbiBhIGRpcmVjdG9yeSB3aXRoIHNwZWNpZmllZCB0aWVyc1xuICAgICAqL1xuICAgIGFzeW5jIGxvYWRTa2lsbHNJbkRpcmVjdG9yeShcbiAgICAgICAgZGlyOiBzdHJpbmcsXG4gICAgICAgIHRpZXJzOiBTa2lsbFRpZXJbXSA9IFsxXSxcbiAgICApOiBQcm9taXNlPExvYWRlZFNraWxsW10+IHtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpcikpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNraWxsczogTG9hZGVkU2tpbGxbXSA9IFtdO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgcmVhZGRpcihkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBqb2luKGRpciwgZW50cnkubmFtZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb29rIGZvciBTS0lMTC5tZCBpbiBzdWJkaXJlY3Rvcmllc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBza2lsbFBhdGggPSBqb2luKGZ1bGxQYXRoLCBcIlNLSUxMLm1kXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhza2lsbFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBza2lsbCA9IGF3YWl0IHRoaXMubG9hZFNraWxsKHNraWxsUGF0aCwgdGllcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNraWxsKSBza2lsbHMucHVzaChza2lsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5Lm5hbWUuZW5kc1dpdGgoXCIubWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9hZCBtYXJrZG93biBmaWxlcyBkaXJlY3RseVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBza2lsbCA9IGF3YWl0IHRoaXMubG9hZFNraWxsKGZ1bGxQYXRoLCB0aWVycyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChza2lsbCkgc2tpbGxzLnB1c2goc2tpbGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBsb2FkIHNraWxscyBmcm9tICR7ZGlyfTpgLCBlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2tpbGxzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgc2tpbGxzIGJ5IGNhcGFiaWxpdHlcbiAgICAgKi9cbiAgICBhc3luYyBsb2FkU2tpbGxzQnlDYXBhYmlsaXR5KFxuICAgICAgICBkaXI6IHN0cmluZyxcbiAgICAgICAgY2FwYWJpbGl0eTogc3RyaW5nLFxuICAgICAgICB0aWVyczogU2tpbGxUaWVyW10gPSBbMV0sXG4gICAgKTogUHJvbWlzZTxMb2FkZWRTa2lsbFtdPiB7XG4gICAgICAgIGNvbnN0IGFsbFNraWxscyA9IGF3YWl0IHRoaXMubG9hZFNraWxsc0luRGlyZWN0b3J5KGRpciwgWzFdKTsgLy8gTG9hZCBtZXRhZGF0YSBmaXJzdFxuXG4gICAgICAgIGNvbnN0IG1hdGNoaW5nOiBMb2FkZWRTa2lsbFtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBza2lsbCBvZiBhbGxTa2lsbHMpIHtcbiAgICAgICAgICAgIGlmIChza2lsbC5tZXRhZGF0YS5jYXBhYmlsaXRpZXMuaW5jbHVkZXMoY2FwYWJpbGl0eSkpIHtcbiAgICAgICAgICAgICAgICAvLyBOb3cgbG9hZCBmdWxsIHRpZXJzIGZvciBtYXRjaGluZyBza2lsbHNcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsU2tpbGwgPSBhd2FpdCB0aGlzLmxvYWRTa2lsbChcbiAgICAgICAgICAgICAgICAgICAgc2tpbGwubWV0YWRhdGEucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdGllcnMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoZnVsbFNraWxsKSBtYXRjaGluZy5wdXNoKGZ1bGxTa2lsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF0Y2hpbmc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXN0aW1hdGUgdG9rZW4gc2F2aW5ncyBmcm9tIHByb2dyZXNzaXZlIGRpc2Nsb3N1cmVcbiAgICAgKi9cbiAgICBlc3RpbWF0ZVRva2VuU2F2aW5ncyhza2lsbHM6IExvYWRlZFNraWxsW10pOiB7XG4gICAgICAgIHRpZXIxT25seTogbnVtYmVyO1xuICAgICAgICBhbGxUaWVyczogbnVtYmVyO1xuICAgICAgICBzYXZpbmdzOiBudW1iZXI7XG4gICAgICAgIHNhdmluZ3NQZXJjZW50OiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IHRpZXIxT25seSA9IHNraWxscy5yZWR1Y2UoKHN1bSwgcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdDFTa2lsbCA9IHsgLi4ucywgbG9hZGVkVGllcnM6IFsxXSBhcyBTa2lsbFRpZXJbXSB9O1xuICAgICAgICAgICAgcmV0dXJuIHN1bSArIHRoaXMuZXN0aW1hdGVUb2tlbnMocy5tZXRhZGF0YS5kZXNjcmlwdGlvbik7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIGNvbnN0IGFsbFRpZXJzID0gc2tpbGxzLnJlZHVjZSgoc3VtLCBzKSA9PiBzdW0gKyBzLnRva2VuRXN0aW1hdGUsIDApO1xuICAgICAgICBjb25zdCBzYXZpbmdzID0gYWxsVGllcnMgLSB0aWVyMU9ubHk7XG4gICAgICAgIGNvbnN0IHNhdmluZ3NQZXJjZW50ID0gTWF0aC5yb3VuZCgoc2F2aW5ncyAvIGFsbFRpZXJzKSAqIDEwMCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpZXIxT25seSxcbiAgICAgICAgICAgIGFsbFRpZXJzLFxuICAgICAgICAgICAgc2F2aW5ncyxcbiAgICAgICAgICAgIHNhdmluZ3NQZXJjZW50LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFyIHRoZSBjYWNoZVxuICAgICAqL1xuICAgIGNsZWFyQ2FjaGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubG9hZGVkQ2FjaGUuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY2FjaGUgc3RhdGlzdGljc1xuICAgICAqL1xuICAgIGdldENhY2hlU3RhdHMoKToge1xuICAgICAgICBzaXplOiBudW1iZXI7XG4gICAgICAgIGVudHJpZXM6IHN0cmluZ1tdO1xuICAgIH0ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2l6ZTogdGhpcy5sb2FkZWRDYWNoZS5zaXplLFxuICAgICAgICAgICAgZW50cmllczogQXJyYXkuZnJvbSh0aGlzLmxvYWRlZENhY2hlLmtleXMoKSksXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYSBza2lsbCBsb2FkZXIgZm9yIHRoZSBkZWZhdWx0IHNraWxscyBkaXJlY3RvcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNraWxsTG9hZGVyKHNraWxsc0Rpcj86IHN0cmluZyk6IFByb2dyZXNzaXZlU2tpbGxMb2FkZXIge1xuICAgIHJldHVybiBuZXcgUHJvZ3Jlc3NpdmVTa2lsbExvYWRlcihza2lsbHNEaXIgfHwgXCIuL3NraWxsc1wiKTtcbn1cblxuLyoqXG4gKiBSZWNvbW1lbmRlZCB0aWVyIGxvYWRpbmcgc3RyYXRlZ2llc1xuICovXG5leHBvcnQgY29uc3QgVElFUl9TVFJBVEVHSUVTID0ge1xuICAgIC8qKiBNaW5pbWFsIGNvbnRleHQgLSBqdXN0IHNraWxsIG5hbWVzIGFuZCBkZXNjcmlwdGlvbnMgKi9cbiAgICBtaW5pbWFsOiBbMV0gYXMgU2tpbGxUaWVyW10sXG5cbiAgICAvKiogU3RhbmRhcmQgY29udGV4dCAtIG1ldGFkYXRhICsgaW5zdHJ1Y3Rpb25zICovXG4gICAgc3RhbmRhcmQ6IFsxLCAyXSBhcyBTa2lsbFRpZXJbXSxcblxuICAgIC8qKiBGdWxsIGNvbnRleHQgLSBldmVyeXRoaW5nICovXG4gICAgZnVsbDogWzEsIDIsIDNdIGFzIFNraWxsVGllcltdLFxuXG4gICAgLyoqIE9uLWRlbWFuZCAtIGxvYWQgdGllciAzIG9ubHkgd2hlbiBzcGVjaWZpY2FsbHkgcmVxdWVzdGVkICovXG4gICAgb25EZW1hbmQ6IFsxLCAyXSBhcyBTa2lsbFRpZXJbXSxcbn07XG4iLAogICAgIi8qKlxuICogU2Vzc2lvbiBNYW5hZ2VyXG4gKlxuICogTWFuYWdlcyBwZXJzaXN0ZW50IHNlc3Npb24gc3RhdGUgdGhhdCBzdXJ2aXZlcyBjb252ZXJzYXRpb24gcmVzdGFydHMuXG4gKiBTZXNzaW9ucyBhY3QgYXMgXCJ3b3JrYmVuY2hlc1wiIGNvbnRhaW5pbmcgYWN0aXZlIGZpbGVzLCBwZW5kaW5nIHRhc2tzLFxuICogZGVjaXNpb25zLCBhbmQgYXJiaXRyYXJ5IGNvbnRleHQgZGF0YS5cbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IG1rZGlyLCByZWFkRmlsZSwgcmVhZGRpciwgd3JpdGVGaWxlIH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQWdlbnRUeXBlLFxuICAgIENvbmZpZGVuY2VMZXZlbCxcbiAgICBDb250ZXh0RW52ZWxvcGUsXG4gICAgTWVtb3J5RW50cnksXG59IGZyb20gXCIuLi9hZ2VudHMvdHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBDb250ZXh0Q29uZmlnLFxuICAgIERlY2lzaW9uLFxuICAgIFNlc3Npb24sXG4gICAgU2Vzc2lvbk1ldGFkYXRhLFxuICAgIFNlc3Npb25Xb3JrYmVuY2gsXG4gICAgVGFzayxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBBdWRpdCByZWNvcmQgZm9yIGhhbmRvZmYgb3BlcmF0aW9uc1xuICovXG5pbnRlcmZhY2UgSGFuZG9mZkF1ZGl0UmVjb3JkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNvcnJlbGF0aW9uSWQ6IHN0cmluZztcbiAgICBmcm9tQWdlbnQ6IHN0cmluZztcbiAgICB0b0FnZW50OiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIGNvbnRleHRTaXplOiBudW1iZXI7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICByZWFzb24/OiBzdHJpbmc7XG4gICAgc2Vzc2lvbklkOiBzdHJpbmc7XG59XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBTZXNzaW9uTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IENvbnRleHRDb25maWc7XG4gICAgcHJpdmF0ZSBjdXJyZW50U2Vzc2lvbjogU2Vzc2lvbiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2Vzc2lvbnNEaXI6IHN0cmluZztcbiAgICBwcml2YXRlIGN1cnJlbnRTZXNzaW9uUGF0aDogc3RyaW5nO1xuICAgIHByaXZhdGUgYXJjaGl2ZURpcjogc3RyaW5nO1xuICAgIHByaXZhdGUgYXVkaXRMb2c6IEhhbmRvZmZBdWRpdFJlY29yZFtdID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29udGV4dENvbmZpZz4gPSB7fSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLnNlc3Npb25zRGlyID0gam9pbih0aGlzLmNvbmZpZy5zdG9yYWdlUGF0aCwgXCJzZXNzaW9uc1wiKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvblBhdGggPSBqb2luKHRoaXMuc2Vzc2lvbnNEaXIsIFwiY3VycmVudC5qc29uXCIpO1xuICAgICAgICB0aGlzLmFyY2hpdmVEaXIgPSBqb2luKHRoaXMuc2Vzc2lvbnNEaXIsIFwiYXJjaGl2ZVwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZXNzaW9uIG1hbmFnZXIgYW5kIHN0b3JhZ2UgZGlyZWN0b3JpZXNcbiAgICAgKi9cbiAgICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBhd2FpdCBta2Rpcih0aGlzLnNlc3Npb25zRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgYXdhaXQgbWtkaXIodGhpcy5hcmNoaXZlRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBhIG5ldyBzZXNzaW9uIG9yIHJlc3RvcmUgdGhlIGN1cnJlbnQgb25lXG4gICAgICovXG4gICAgYXN5bmMgc3RhcnRTZXNzaW9uKFxuICAgICAgICBtZXRhZGF0YTogUGFydGlhbDxTZXNzaW9uTWV0YWRhdGE+ID0ge30sXG4gICAgKTogUHJvbWlzZTxTZXNzaW9uPiB7XG4gICAgICAgIC8vIFRyeSB0byByZXN0b3JlIGV4aXN0aW5nIHNlc3Npb25cbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCB0aGlzLmxvYWRDdXJyZW50U2Vzc2lvbigpO1xuXG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgLy8gVXBkYXRlIGxhc3QgYWN0aXZlIHRpbWVcbiAgICAgICAgICAgIGV4aXN0aW5nLmxhc3RBY3RpdmUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICBleGlzdGluZy5tZXRhZGF0YSA9IHsgLi4uZXhpc3RpbmcubWV0YWRhdGEsIC4uLm1ldGFkYXRhIH07XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXNzaW9uKGV4aXN0aW5nKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24gPSBleGlzdGluZztcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBuZXcgc2Vzc2lvblxuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5jcmVhdGVTZXNzaW9uKG1ldGFkYXRhKTtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbiA9IHNlc3Npb247XG4gICAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBhY3RpdmUgc2Vzc2lvblxuICAgICAqL1xuICAgIGdldFNlc3Npb24oKTogU2Vzc2lvbiB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Vzc2lvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgc2Vzc2lvbiBvYmplY3RcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVNlc3Npb24obWV0YWRhdGE6IFBhcnRpYWw8U2Vzc2lvbk1ldGFkYXRhPiA9IHt9KTogU2Vzc2lvbiB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmdlbmVyYXRlU2Vzc2lvbklkKCksXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICAgICAgICAgIGxhc3RBY3RpdmU6IG5vdyxcbiAgICAgICAgICAgIHdvcmtiZW5jaDoge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUZpbGVzOiBbXSxcbiAgICAgICAgICAgICAgICBwZW5kaW5nVGFza3M6IFtdLFxuICAgICAgICAgICAgICAgIGRlY2lzaW9uczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dDoge30sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0OiBtZXRhZGF0YS5wcm9qZWN0IHx8IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICAgICAgYnJhbmNoOiBtZXRhZGF0YS5icmFuY2gsXG4gICAgICAgICAgICAgICAgbW9kZTogbWV0YWRhdGEubW9kZSxcbiAgICAgICAgICAgICAgICBwbGF0Zm9ybTogbWV0YWRhdGEucGxhdGZvcm0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgdW5pcXVlIHNlc3Npb24gSURcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICAgICAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCk7XG4gICAgICAgIHJldHVybiBgc2Vzc18ke3RpbWVzdGFtcH1fJHtyYW5kb219YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBjdXJyZW50IHNlc3Npb24gZnJvbSBkaXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkQ3VycmVudFNlc3Npb24oKTogUHJvbWlzZTxTZXNzaW9uIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmModGhpcy5jdXJyZW50U2Vzc2lvblBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUodGhpcy5jdXJyZW50U2Vzc2lvblBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBTZXNzaW9uO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBsb2FkIHNlc3Npb246XCIsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBzZXNzaW9uIHRvIGRpc2tcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVTZXNzaW9uKHNlc3Npb246IFNlc3Npb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKFxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvblBhdGgsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShzZXNzaW9uLCBudWxsLCAyKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBXb3JrYmVuY2ggT3BlcmF0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgZmlsZSB0byB0aGUgYWN0aXZlIGZpbGVzIGxpc3RcbiAgICAgKi9cbiAgICBhc3luYyBhZGRBY3RpdmVGaWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLmFjdGl2ZUZpbGVzLmluY2x1ZGVzKHBhdGgpKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5hY3RpdmVGaWxlcy5wdXNoKHBhdGgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi5sYXN0QWN0aXZlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbih0aGlzLmN1cnJlbnRTZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIGZpbGUgZnJvbSB0aGUgYWN0aXZlIGZpbGVzIGxpc3RcbiAgICAgKi9cbiAgICBhc3luYyByZW1vdmVBY3RpdmVGaWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLmFjdGl2ZUZpbGVzLmluZGV4T2YocGF0aCk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5hY3RpdmVGaWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi5sYXN0QWN0aXZlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbih0aGlzLmN1cnJlbnRTZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYWN0aXZlIGZpbGVzXG4gICAgICovXG4gICAgZ2V0QWN0aXZlRmlsZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Vzc2lvbj8ud29ya2JlbmNoLmFjdGl2ZUZpbGVzIHx8IFtdO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFRhc2sgT3BlcmF0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogQXJjaGl2ZSB0aGUgY3VycmVudCBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgYXJjaGl2ZUN1cnJlbnRTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGFjdGl2ZSBzZXNzaW9uIHRvIGFyY2hpdmVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhcmNoaXZlUGF0aCA9IGpvaW4oXG4gICAgICAgICAgICB0aGlzLmFyY2hpdmVEaXIsXG4gICAgICAgICAgICBgJHt0aGlzLmN1cnJlbnRTZXNzaW9uLmlkfS5qc29uYCxcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKFxuICAgICAgICAgICAgYXJjaGl2ZVBhdGgsXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnRTZXNzaW9uLCBudWxsLCAyKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDbGVhciBjdXJyZW50IHNlc3Npb25cbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbiA9IG51bGw7XG4gICAgICAgIGlmIChleGlzdHNTeW5jKHRoaXMuY3VycmVudFNlc3Npb25QYXRoKSkge1xuICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlKHRoaXMuY3VycmVudFNlc3Npb25QYXRoLCBcIlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkIGEgY29udGV4dCBlbnZlbG9wZSBmb3IgYWdlbnQgaGFuZG9mZnNcbiAgICAgKi9cbiAgICBidWlsZENvbnRleHRFbnZlbG9wZShcbiAgICAgICAgcmVxdWVzdElkOiBzdHJpbmcsXG4gICAgICAgIGRlcHRoID0gMCxcbiAgICAgICAgcHJldmlvdXNSZXN1bHRzOiBDb250ZXh0RW52ZWxvcGVbXCJwcmV2aW91c1Jlc3VsdHNcIl0gPSBbXSxcbiAgICAgICAgdGFza0NvbnRleHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge30sXG4gICAgICAgIG1lbW9yeU1hbmFnZXI/OiB7XG4gICAgICAgICAgICBzZWFyY2hNZW1vcmllczogKHF1ZXJ5OiBzdHJpbmcpID0+IFByb21pc2U8TWVtb3J5RW50cnlbXT47XG4gICAgICAgIH0sXG4gICAgKTogQ29udGV4dEVudmVsb3BlIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgc2Vzc2lvbiBmb3IgY29udGV4dCBlbnZlbG9wZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCByZWxldmFudCBtZW1vcmllcyBpZiBtZW1vcnkgbWFuYWdlciBhdmFpbGFibGVcbiAgICAgICAgLy8gTm90ZTogTWVtb3J5IGZpbHRlcmluZyBieSB0eXBlIG5vdCB5ZXQgaW1wbGVtZW50ZWRcbiAgICAgICAgY29uc3QgbWVtb3JpZXMgPSBtZW1vcnlNYW5hZ2VyXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aXZlOiBbXSxcbiAgICAgICAgICAgICAgICAgIHByb2NlZHVyYWw6IFtdLFxuICAgICAgICAgICAgICAgICAgZXBpc29kaWM6IFtdLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aXZlOiBbXSxcbiAgICAgICAgICAgICAgICAgIHByb2NlZHVyYWw6IFtdLFxuICAgICAgICAgICAgICAgICAgZXBpc29kaWM6IFtdLFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgaWQ6IHRoaXMuY3VycmVudFNlc3Npb24uaWQsXG4gICAgICAgICAgICAgICAgcGFyZW50SUQ6IHRoaXMuY3VycmVudFNlc3Npb24ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgYWN0aXZlRmlsZXM6IHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLmFjdGl2ZUZpbGVzLFxuICAgICAgICAgICAgICAgIHBlbmRpbmdUYXNrczogdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2gucGVuZGluZ1Rhc2tzLFxuICAgICAgICAgICAgICAgIGRlY2lzaW9uczogdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2guZGVjaXNpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lbW9yaWVzLFxuICAgICAgICAgICAgcHJldmlvdXNSZXN1bHRzLFxuICAgICAgICAgICAgdGFza0NvbnRleHQsXG4gICAgICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVjb3JkIGEgaGFuZG9mZiBvcGVyYXRpb24gZm9yIGF1ZGl0aW5nXG4gICAgICovXG4gICAgcmVjb3JkSGFuZG9mZihcbiAgICAgICAgY29ycmVsYXRpb25JZDogc3RyaW5nLFxuICAgICAgICBmcm9tQWdlbnQ6IHN0cmluZyxcbiAgICAgICAgdG9BZ2VudDogc3RyaW5nLFxuICAgICAgICBjb250ZXh0U2l6ZTogbnVtYmVyLFxuICAgICAgICBzdWNjZXNzOiBib29sZWFuLFxuICAgICAgICByZWFzb24/OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvbikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlY29yZDogSGFuZG9mZkF1ZGl0UmVjb3JkID0ge1xuICAgICAgICAgICAgaWQ6IGBoYW5kb2ZmLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YCxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQsXG4gICAgICAgICAgICBmcm9tQWdlbnQsXG4gICAgICAgICAgICB0b0FnZW50LFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgY29udGV4dFNpemUsXG4gICAgICAgICAgICBzdWNjZXNzLFxuICAgICAgICAgICAgcmVhc29uLFxuICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLmN1cnJlbnRTZXNzaW9uLmlkLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYXVkaXRMb2cucHVzaChyZWNvcmQpO1xuXG4gICAgICAgIC8vIEtlZXAgb25seSBsYXN0IDEwMCByZWNvcmRzIHRvIHByZXZlbnQgbWVtb3J5IGJsb2F0XG4gICAgICAgIGlmICh0aGlzLmF1ZGl0TG9nLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgdGhpcy5hdWRpdExvZyA9IHRoaXMuYXVkaXRMb2cuc2xpY2UoLTEwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXVkaXQgdHJhaWwgZm9yIGNvcnJlbGF0aW9uIElEXG4gICAgICovXG4gICAgZ2V0QXVkaXRUcmFpbChjb3JyZWxhdGlvbklkOiBzdHJpbmcpOiBIYW5kb2ZmQXVkaXRSZWNvcmRbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1ZGl0TG9nLmZpbHRlcihcbiAgICAgICAgICAgIChyZWNvcmQpID0+IHJlY29yZC5jb3JyZWxhdGlvbklkID09PSBjb3JyZWxhdGlvbklkLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYXVkaXQgcmVjb3Jkc1xuICAgICAqL1xuICAgIGdldEFsbEF1ZGl0UmVjb3JkcygpOiBIYW5kb2ZmQXVkaXRSZWNvcmRbXSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5hdWRpdExvZ107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgY29ycmVsYXRpb24gSUQgZm9yIGhhbmRvZmYgY2hhaW5cbiAgICAgKi9cbiAgICBnZW5lcmF0ZUNvcnJlbGF0aW9uSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBjb3JyLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXJpYWxpemUgY29udGV4dCBlbnZlbG9wZSBmb3IgcHJvbXB0IGluamVjdGlvblxuICAgICAqL1xuICAgIHNlcmlhbGl6ZUNvbnRleHRFbnZlbG9wZShlbnZlbG9wZTogQ29udGV4dEVudmVsb3BlKTogc3RyaW5nIHtcbiAgICAgICAgLy8gTGltaXQgc2l6ZXMgdG8gcHJldmVudCB0b2tlbiBleHBsb3Npb25cbiAgICAgICAgY29uc3QgbGltaXRlZEVudmVsb3BlID0ge1xuICAgICAgICAgICAgLi4uZW52ZWxvcGUsXG4gICAgICAgICAgICBzZXNzaW9uOiB7XG4gICAgICAgICAgICAgICAgLi4uZW52ZWxvcGUuc2Vzc2lvbixcbiAgICAgICAgICAgICAgICBhY3RpdmVGaWxlczogZW52ZWxvcGUuc2Vzc2lvbi5hY3RpdmVGaWxlcy5zbGljZSgwLCAxMCksXG4gICAgICAgICAgICAgICAgcGVuZGluZ1Rhc2tzOiBlbnZlbG9wZS5zZXNzaW9uLnBlbmRpbmdUYXNrcy5zbGljZSgwLCA1KSxcbiAgICAgICAgICAgICAgICBkZWNpc2lvbnM6IGVudmVsb3BlLnNlc3Npb24uZGVjaXNpb25zLnNsaWNlKDAsIDUpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lbW9yaWVzOiB7XG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpdmU6IGVudmVsb3BlLm1lbW9yaWVzLmRlY2xhcmF0aXZlLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgICAgIHByb2NlZHVyYWw6IGVudmVsb3BlLm1lbW9yaWVzLnByb2NlZHVyYWwuc2xpY2UoMCwgMyksXG4gICAgICAgICAgICAgICAgZXBpc29kaWM6IGVudmVsb3BlLm1lbW9yaWVzLmVwaXNvZGljLnNsaWNlKDAsIDMpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZpb3VzUmVzdWx0czogZW52ZWxvcGUucHJldmlvdXNSZXN1bHRzLnNsaWNlKDAsIDMpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShsaW1pdGVkRW52ZWxvcGUsIG51bGwsIDIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlIGNvbnRleHQgZW52ZWxvcGVzIHdpdGggY29uZmxpY3QgcmVzb2x1dGlvblxuICAgICAqL1xuICAgIG1lcmdlQ29udGV4dEVudmVsb3BlcyhcbiAgICAgICAgZW52ZWxvcGVzOiBDb250ZXh0RW52ZWxvcGVbXSxcbiAgICAgICAgc3RyYXRlZ3k6IFwibGFzdC13aW5zXCIgfCBcImNvbnNlbnN1c1wiIHwgXCJwcmlvcml0eVwiID0gXCJsYXN0LXdpbnNcIixcbiAgICApOiBDb250ZXh0RW52ZWxvcGUge1xuICAgICAgICBpZiAoZW52ZWxvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG1lcmdlIGVtcHR5IGVudmVsb3BlIGFycmF5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnZlbG9wZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZW52ZWxvcGVzWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYmFzZUVudmVsb3BlID0gZW52ZWxvcGVzWzBdO1xuXG4gICAgICAgIC8vIE1lcmdlIHByZXZpb3VzIHJlc3VsdHNcbiAgICAgICAgY29uc3QgYWxsUHJldmlvdXNSZXN1bHRzID0gZW52ZWxvcGVzLmZsYXRNYXAoKGUpID0+IGUucHJldmlvdXNSZXN1bHRzKTtcbiAgICAgICAgY29uc3QgbWVyZ2VkUHJldmlvdXNSZXN1bHRzID1cbiAgICAgICAgICAgIHRoaXMuZGVkdXBsaWNhdGVQcmV2aW91c1Jlc3VsdHMoYWxsUHJldmlvdXNSZXN1bHRzKTtcblxuICAgICAgICAvLyBNZXJnZSB0YXNrIGNvbnRleHQgd2l0aCBjb25mbGljdCByZXNvbHV0aW9uXG4gICAgICAgIGNvbnN0IG1lcmdlZFRhc2tDb250ZXh0ID0gdGhpcy5tZXJnZVRhc2tDb250ZXh0cyhcbiAgICAgICAgICAgIGVudmVsb3Blcy5tYXAoKGUpID0+IGUudGFza0NvbnRleHQpLFxuICAgICAgICAgICAgc3RyYXRlZ3ksXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmJhc2VFbnZlbG9wZSxcbiAgICAgICAgICAgIHByZXZpb3VzUmVzdWx0czogbWVyZ2VkUHJldmlvdXNSZXN1bHRzLFxuICAgICAgICAgICAgdGFza0NvbnRleHQ6IG1lcmdlZFRhc2tDb250ZXh0LFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIC4uLmJhc2VFbnZlbG9wZS5tZXRhLFxuICAgICAgICAgICAgICAgIG1lcmdlZEZyb206IGVudmVsb3Blcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbWVyZ2VTdHJhdGVneTogc3RyYXRlZ3ksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBkdXBsaWNhdGUgcHJldmlvdXMgcmVzdWx0cyBiYXNlZCBvbiBhZ2VudCB0eXBlIGFuZCBvdXRwdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIGRlZHVwbGljYXRlUHJldmlvdXNSZXN1bHRzKFxuICAgICAgICByZXN1bHRzOiBDb250ZXh0RW52ZWxvcGVbXCJwcmV2aW91c1Jlc3VsdHNcIl0sXG4gICAgKTogQ29udGV4dEVudmVsb3BlW1wicHJldmlvdXNSZXN1bHRzXCJdIHtcbiAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7cmVzdWx0LmFnZW50VHlwZX0tJHtKU09OLnN0cmluZ2lmeShyZXN1bHQub3V0cHV0KX1gO1xuICAgICAgICAgICAgaWYgKHNlZW4uaGFzKGtleSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHNlZW4uYWRkKGtleSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVyZ2UgdGFzayBjb250ZXh0cyB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBtZXJnZVRhc2tDb250ZXh0cyhcbiAgICAgICAgY29udGV4dHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+W10sXG4gICAgICAgIHN0cmF0ZWd5OiBzdHJpbmcsXG4gICAgKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCBtZXJnZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cbiAgICAgICAgLy8gQ29sbGVjdCBhbGwga2V5c1xuICAgICAgICBjb25zdCBhbGxLZXlzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnRleHRzLmZvckVhY2goKGN0eCkgPT4ge1xuICAgICAgICAgICAgaWYgKGN0eCkgT2JqZWN0LmtleXMoY3R4KS5mb3JFYWNoKChrZXkpID0+IGFsbEtleXMuYWRkKGtleSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNZXJnZSBlYWNoIGtleVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBhbGxLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSBjb250ZXh0c1xuICAgICAgICAgICAgICAgIC5tYXAoKGN0eCkgPT4gY3R4Py5ba2V5XSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKCh2YWwpID0+IHZhbCAhPT0gdW5kZWZpbmVkKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxhc3Qtd2luc1wiOlxuICAgICAgICAgICAgICAgICAgICBtZXJnZWRba2V5XSA9IHZhbHVlc1t2YWx1ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb25zZW5zdXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2UgbW9zdCBjb21tb24gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY291bnRzID0gbmV3IE1hcDxhbnksIG51bWJlcj4oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLmZvckVhY2goKHZhbCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cy5zZXQodmFsLCAoY291bnRzLmdldCh2YWwpIHx8IDApICsgMSksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXhDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25zZW5zdXNWYWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgY291bnRzLmZvckVhY2goKGNvdW50LCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID4gbWF4Q291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb3VudCA9IGNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNlbnN1c1ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRba2V5XSA9IGNvbnNlbnN1c1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSBcInByaW9yaXR5XCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIEFzc3VtZSBoaWdoZXIgcHJpb3JpdHkgYWdlbnRzIGNvbWUgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBtZXJnZWRba2V5XSA9IHZhbHVlc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgdGFzayB0byB0aGUgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGFkZFRhc2soXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgcHJpb3JpdHk6IFRhc2tbXCJwcmlvcml0eVwiXSA9IFwibWVkaXVtXCIsXG4gICAgKTogUHJvbWlzZTxUYXNrPiB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYWN0aXZlIHNlc3Npb25cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YXNrOiBUYXNrID0ge1xuICAgICAgICAgICAgaWQ6IGB0YXNrXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgcHJpb3JpdHksXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5wZW5kaW5nVGFza3MucHVzaCh0YXNrKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbi5sYXN0QWN0aXZlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVTZXNzaW9uKHRoaXMuY3VycmVudFNlc3Npb24pO1xuXG4gICAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBhIHRhc2sncyBzdGF0dXNcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVUYXNrU3RhdHVzKFxuICAgICAgICB0YXNrSWQ6IHN0cmluZyxcbiAgICAgICAgc3RhdHVzOiBUYXNrW1wic3RhdHVzXCJdLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy5jdXJyZW50U2Vzc2lvbi53b3JrYmVuY2gucGVuZGluZ1Rhc2tzLmZpbmQoXG4gICAgICAgICAgICAodCkgPT4gdC5pZCA9PT0gdGFza0lkLFxuICAgICAgICApO1xuICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgdGFzay5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSBcImNvbXBsZXRlZFwiKSB7XG4gICAgICAgICAgICAgICAgdGFzay5jb21wbGV0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ubGFzdEFjdGl2ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24odGhpcy5jdXJyZW50U2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhc2tzXG4gICAgICovXG4gICAgZ2V0VGFza3MoKTogVGFza1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNlc3Npb24/LndvcmtiZW5jaC5wZW5kaW5nVGFza3MgfHwgW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHBlbmRpbmcgdGFza3Mgb25seVxuICAgICAqL1xuICAgIGdldFBlbmRpbmdUYXNrcygpOiBUYXNrW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYXNrcygpLmZpbHRlcihcbiAgICAgICAgICAgICh0KSA9PiB0LnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgfHwgdC5zdGF0dXMgPT09IFwiaW5fcHJvZ3Jlc3NcIixcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBEZWNpc2lvbiBPcGVyYXRpb25zXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiBSZWNvcmQgYSBkZWNpc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGFkZERlY2lzaW9uKFxuICAgICAgICB0aXRsZTogc3RyaW5nLFxuICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgICAgICByYXRpb25hbGU6IHN0cmluZyxcbiAgICAgICAgb3B0aW9ucz86IHsgYWx0ZXJuYXRpdmVzPzogc3RyaW5nW107IHRhZ3M/OiBzdHJpbmdbXSB9LFxuICAgICk6IFByb21pc2U8RGVjaXNpb24+IHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgc2Vzc2lvblwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlY2lzaW9uOiBEZWNpc2lvbiA9IHtcbiAgICAgICAgICAgIGlkOiBgZGVjXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YCxcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByYXRpb25hbGUsXG4gICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IG9wdGlvbnM/LmFsdGVybmF0aXZlcyxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgdGFnczogb3B0aW9ucz8udGFncyB8fCBbXSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLndvcmtiZW5jaC5kZWNpc2lvbnMucHVzaChkZWNpc2lvbik7XG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ubGFzdEFjdGl2ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlU2Vzc2lvbih0aGlzLmN1cnJlbnRTZXNzaW9uKTtcblxuICAgICAgICByZXR1cm4gZGVjaXNpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBkZWNpc2lvbnNcbiAgICAgKi9cbiAgICBnZXREZWNpc2lvbnMoKTogRGVjaXNpb25bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZXNzaW9uPy53b3JrYmVuY2guZGVjaXNpb25zIHx8IFtdO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbnRleHQgT3BlcmF0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgY29udGV4dCB2YWx1ZVxuICAgICAqL1xuICAgIGFzeW5jIHNldENvbnRleHQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U2Vzc2lvbikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb24ud29ya2JlbmNoLmNvbnRleHRba2V5XSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmN1cnJlbnRTZXNzaW9uLmxhc3RBY3RpdmUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVNlc3Npb24odGhpcy5jdXJyZW50U2Vzc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgY29udGV4dCB2YWx1ZVxuICAgICAqL1xuICAgIGdldENvbnRleHQ8VCA9IHVua25vd24+KGtleTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZXNzaW9uPy53b3JrYmVuY2guY29udGV4dFtrZXldIGFzIFQgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBjb250ZXh0XG4gICAgICovXG4gICAgZ2V0QWxsQ29udGV4dCgpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTZXNzaW9uPy53b3JrYmVuY2guY29udGV4dCB8fCB7fTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTZXNzaW9uIExpZmVjeWNsZVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogQXJjaGl2ZSB0aGUgY3VycmVudCBzZXNzaW9uIGFuZCBzdGFydCBmcmVzaFxuICAgICAqL1xuICAgIGFzeW5jIGFyY2hpdmVTZXNzaW9uKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHJldHVybjtcblxuICAgICAgICBjb25zdCBhcmNoaXZlUGF0aCA9IGpvaW4oXG4gICAgICAgICAgICB0aGlzLmFyY2hpdmVEaXIsXG4gICAgICAgICAgICBgJHt0aGlzLmN1cnJlbnRTZXNzaW9uLmlkfS5qc29uYCxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUoXG4gICAgICAgICAgICBhcmNoaXZlUGF0aCxcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuY3VycmVudFNlc3Npb24sIG51bGwsIDIpLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFJlbW92ZSBjdXJyZW50IHNlc3Npb25cbiAgICAgICAgaWYgKGV4aXN0c1N5bmModGhpcy5jdXJyZW50U2Vzc2lvblBhdGgpKSB7XG4gICAgICAgICAgICBjb25zdCB7IHJtIH0gPSBhd2FpdCBpbXBvcnQoXCJub2RlOmZzL3Byb21pc2VzXCIpO1xuICAgICAgICAgICAgYXdhaXQgcm0odGhpcy5jdXJyZW50U2Vzc2lvblBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2Vzc2lvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGlzdCBhcmNoaXZlZCBzZXNzaW9uc1xuICAgICAqL1xuICAgIGFzeW5jIGxpc3RBcmNoaXZlZFNlc3Npb25zKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHRoaXMuYXJjaGl2ZURpcikpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVhZGRpcih0aGlzLmFyY2hpdmVEaXIpO1xuICAgICAgICByZXR1cm4gZmlsZXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGYpID0+IGYuZW5kc1dpdGgoXCIuanNvblwiKSlcbiAgICAgICAgICAgIC5tYXAoKGYpID0+IGYucmVwbGFjZShcIi5qc29uXCIsIFwiXCIpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGFuIGFyY2hpdmVkIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBsb2FkQXJjaGl2ZWRTZXNzaW9uKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTxTZXNzaW9uIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBhcmNoaXZlUGF0aCA9IGpvaW4odGhpcy5hcmNoaXZlRGlyLCBgJHtzZXNzaW9uSWR9Lmpzb25gKTtcblxuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoYXJjaGl2ZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoYXJjaGl2ZVBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBTZXNzaW9uO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGxvYWQgYXJjaGl2ZWQgc2Vzc2lvbiAke3Nlc3Npb25JZH06YCxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uIHN1bW1hcnkgZm9yIGNvbnRleHQgYXNzZW1ibHlcbiAgICAgKi9cbiAgICBnZXRTZXNzaW9uU3VtbWFyeSgpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlc3Npb24pIHtcbiAgICAgICAgICAgIHJldHVybiBcIk5vIGFjdGl2ZSBzZXNzaW9uLlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyB3b3JrYmVuY2gsIG1ldGFkYXRhIH0gPSB0aGlzLmN1cnJlbnRTZXNzaW9uO1xuICAgICAgICBjb25zdCBwZW5kaW5nVGFza3MgPSB0aGlzLmdldFBlbmRpbmdUYXNrcygpO1xuXG4gICAgICAgIGNvbnN0IGxpbmVzID0gW1xuICAgICAgICAgICAgYCMjIFNlc3Npb246ICR7dGhpcy5jdXJyZW50U2Vzc2lvbi5pZH1gLFxuICAgICAgICAgICAgYFByb2plY3Q6ICR7bWV0YWRhdGEucHJvamVjdH1gLFxuICAgICAgICAgICAgbWV0YWRhdGEuYnJhbmNoID8gYEJyYW5jaDogJHttZXRhZGF0YS5icmFuY2h9YCA6IG51bGwsXG4gICAgICAgICAgICBtZXRhZGF0YS5tb2RlID8gYE1vZGU6ICR7bWV0YWRhdGEubW9kZX1gIDogbnVsbCxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICBgIyMjIEFjdGl2ZSBGaWxlcyAoJHt3b3JrYmVuY2guYWN0aXZlRmlsZXMubGVuZ3RofSlgLFxuICAgICAgICAgICAgLi4ud29ya2JlbmNoLmFjdGl2ZUZpbGVzLnNsaWNlKDAsIDEwKS5tYXAoKGYpID0+IGAtICR7Zn1gKSxcbiAgICAgICAgICAgIHdvcmtiZW5jaC5hY3RpdmVGaWxlcy5sZW5ndGggPiAxMFxuICAgICAgICAgICAgICAgID8gYC0gLi4uIGFuZCAke3dvcmtiZW5jaC5hY3RpdmVGaWxlcy5sZW5ndGggLSAxMH0gbW9yZWBcbiAgICAgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgYCMjIyBQZW5kaW5nIFRhc2tzICgke3BlbmRpbmdUYXNrcy5sZW5ndGh9KWAsXG4gICAgICAgICAgICAuLi5wZW5kaW5nVGFza3NcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgNSlcbiAgICAgICAgICAgICAgICAubWFwKCh0KSA9PiBgLSBbJHt0LnByaW9yaXR5fV0gJHt0LmNvbnRlbnR9YCksXG4gICAgICAgICAgICBwZW5kaW5nVGFza3MubGVuZ3RoID4gNVxuICAgICAgICAgICAgICAgID8gYC0gLi4uIGFuZCAke3BlbmRpbmdUYXNrcy5sZW5ndGggLSA1fSBtb3JlYFxuICAgICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICBgIyMjIFJlY2VudCBEZWNpc2lvbnMgKCR7d29ya2JlbmNoLmRlY2lzaW9ucy5sZW5ndGh9KWAsXG4gICAgICAgICAgICAuLi53b3JrYmVuY2guZGVjaXNpb25zXG4gICAgICAgICAgICAgICAgLnNsaWNlKC0zKVxuICAgICAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiBgLSAke2QudGl0bGV9OiAke2QucmF0aW9uYWxlLnN1YnN0cmluZygwLCAxMDApfS4uLmAsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgXTtcblxuICAgICAgICByZXR1cm4gbGluZXMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cIik7XG4gICAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2UgZm9yIGNvbnZlbmllbmNlXG5sZXQgZGVmYXVsdE1hbmFnZXI6IFNlc3Npb25NYW5hZ2VyIHwgbnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXNzaW9uTWFuYWdlcihcbiAgICBjb25maWc/OiBQYXJ0aWFsPENvbnRleHRDb25maWc+LFxuKTogU2Vzc2lvbk1hbmFnZXIge1xuICAgIGlmICghZGVmYXVsdE1hbmFnZXIpIHtcbiAgICAgICAgZGVmYXVsdE1hbmFnZXIgPSBuZXcgU2Vzc2lvbk1hbmFnZXIoY29uZmlnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRNYW5hZ2VyO1xufVxuIiwKICAgICIvKipcbiAqIENvbnRleHQgUmV0cmlldmFsIEVuZ2luZVxuICpcbiAqIEludGVsbGlnZW50IGNvbnRleHQgYXNzZW1ibHkgd2l0aCBwdXNoL3B1bGwgcGF0dGVybnMuXG4gKiBDb21iaW5lcyBzZXNzaW9uIHN0YXRlLCBtZW1vcmllcywgYW5kIHNraWxscyBpbnRvIG9wdGltaXplZCBjb250ZXh0LlxuICovXG5cbmltcG9ydCB7IE1lbW9yeU1hbmFnZXIgfSBmcm9tIFwiLi9tZW1vcnlcIjtcbmltcG9ydCB7IFByb2dyZXNzaXZlU2tpbGxMb2FkZXIgfSBmcm9tIFwiLi9wcm9ncmVzc2l2ZVwiO1xuaW1wb3J0IHsgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tIFwiLi9zZXNzaW9uXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQXNzZW1ibGVkQ29udGV4dCxcbiAgICBDb250ZXh0Q29uZmlnLFxuICAgIENvbnRleHRUcmlnZ2VyLFxuICAgIE1lbW9yeUVudHJ5LFxufSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBMb2FkZWRTa2lsbCB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBDb250ZXh0UmFua2VyLCBWZWN0b3JNYXRoLCBWZWN0b3JNZW1vcnlNYW5hZ2VyIH0gZnJvbSBcIi4vdmVjdG9yXCI7XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0UmV0cmlldmVyIHtcbiAgICBwcml2YXRlIGNvbmZpZzogQ29udGV4dENvbmZpZztcbiAgICBwcml2YXRlIHNlc3Npb25NYW5hZ2VyOiBTZXNzaW9uTWFuYWdlcjtcbiAgICBwcml2YXRlIG1lbW9yeU1hbmFnZXI6IE1lbW9yeU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBza2lsbExvYWRlcjogUHJvZ3Jlc3NpdmVTa2lsbExvYWRlcjtcbiAgICBwcml2YXRlIHZlY3Rvck1hbmFnZXI6IFZlY3Rvck1lbW9yeU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBjb250ZXh0Q2FjaGU6IE1hcDxcbiAgICAgICAgc3RyaW5nLFxuICAgICAgICB7IGNvbnRleHQ6IEFzc2VtYmxlZENvbnRleHQ7IGV4cGlyZXM6IG51bWJlciB9XG4gICAgPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdmVjdG9yIG1hbmFnZXJcbiAgICAgKi9cbiAgICBhc3luYyBpbml0aWFsaXplVmVjdG9yTWFuYWdlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgdGhpcy52ZWN0b3JNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc2Vzc2lvbk1hbmFnZXI6IFNlc3Npb25NYW5hZ2VyLFxuICAgICAgICBtZW1vcnlNYW5hZ2VyOiBNZW1vcnlNYW5hZ2VyLFxuICAgICAgICBza2lsbExvYWRlcjogUHJvZ3Jlc3NpdmVTa2lsbExvYWRlcixcbiAgICAgICAgY29uZmlnOiBQYXJ0aWFsPENvbnRleHRDb25maWc+ID0ge30sXG4gICAgKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgICAgIHRoaXMuc2Vzc2lvbk1hbmFnZXIgPSBzZXNzaW9uTWFuYWdlcjtcbiAgICAgICAgdGhpcy5tZW1vcnlNYW5hZ2VyID0gbWVtb3J5TWFuYWdlcjtcbiAgICAgICAgdGhpcy5za2lsbExvYWRlciA9IHNraWxsTG9hZGVyO1xuICAgICAgICB0aGlzLnZlY3Rvck1hbmFnZXIgPSBuZXcgVmVjdG9yTWVtb3J5TWFuYWdlcihjb25maWcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZmVyIGNvbnRleHQgZnJvbSB1c2VyIHF1ZXJpZXMgYXV0b21hdGljYWxseVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaW5mZXJDb250ZXh0RnJvbVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5lbmFibGVBdXRvSW5mZXJlbmNlKSByZXR1cm47XG5cbiAgICAgICAgLy8gRXh0cmFjdCBwcmVmZXJlbmNlcyBmcm9tIHF1ZXN0aW9ucyBsaWtlIFwic2hvdWxkIEkgdXNlIFggb3IgWT9cIlxuICAgICAgICBjb25zdCBwcmVmZXJlbmNlUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvKD86c2hvdWxkIEl8ZG8geW91IHJlY29tbWVuZHx3aGF0IGFib3V0KSAoW1xcd1xcc10rKSAoPzpvcnx2c3x2ZXJzdXMpIChbXFx3XFxzXSspXFw/L2ksXG4gICAgICAgICAgICAvSSAoPzpwcmVmZXJ8bGlrZXx3YW50IHRvIHVzZSkgKFtcXHdcXHNdKykvaSxcbiAgICAgICAgICAgIC8oPzpuZXZlcnxhbHdheXN8dXN1YWxseSkgKFtcXHdcXHNdKykvaSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcHJlZmVyZW5jZVBhdHRlcm5zKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IHF1ZXJ5Lm1hdGNoKHBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmVyZW5jZSA9IG1hdGNoWzFdIHx8IG1hdGNoWzBdO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWVtb3J5TWFuYWdlci5hZGRNZW1vcnkoXG4gICAgICAgICAgICAgICAgICAgIFwiZGVjbGFyYXRpdmVcIixcbiAgICAgICAgICAgICAgICAgICAgYFVzZXIgcHJlZmVyZW5jZTogJHtwcmVmZXJlbmNlfWAsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogXCJpbmZlcnJlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogYEluZmVycmVkIGZyb20gcXVlcnk6IFwiJHtxdWVyeX1cImAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiBbXCJwcmVmZXJlbmNlXCIsIFwiaW5mZXJyZWRcIl0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZmVyIGNvbnRleHQgZnJvbSBjb252ZXJzYXRpb24gcGF0dGVybnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGluZmVyQ29udGV4dEZyb21Db252ZXJzYXRpb24oXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5lbmFibGVBdXRvSW5mZXJlbmNlKSByZXR1cm47XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0ZWNobmljYWwgZGVjaXNpb25zXG4gICAgICAgIGNvbnN0IGRlY2lzaW9uUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvKD86d2UgZGVjaWRlZHxsZXQncyB1c2V8d2UncmUgZ29pbmcgd2l0aHxjaG9zZW4pIChbXFx3XFxzXSsoPzpmcmFtZXdvcmt8bGlicmFyeXx0b29sfGFwcHJvYWNofHBhdHRlcm4pKS9pLFxuICAgICAgICAgICAgLyg/OmltcGxlbWVudGluZ3xidWlsZGluZ3xjcmVhdGluZykgKFtcXHdcXHNdKykgdXNpbmcgKFtcXHdcXHNdKykvaSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgZGVjaXNpb25QYXR0ZXJucykge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBtZXNzYWdlLm1hdGNoKHBhdHRlcm4pIHx8IHJlc3BvbnNlLm1hdGNoKHBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVjaG5vbG9neSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWVtb3J5TWFuYWdlci5hZGRNZW1vcnkoXG4gICAgICAgICAgICAgICAgICAgIFwicHJvY2VkdXJhbFwiLFxuICAgICAgICAgICAgICAgICAgICBgVXNpbmcgJHt0ZWNobm9sb2d5fSBmb3IgaW1wbGVtZW50YXRpb25gLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFwiaW5mZXJyZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGBDb252ZXJzYXRpb24gY29udGV4dDogXCIke21lc3NhZ2Uuc3Vic3RyaW5nKDAsIDEwMCl9Li4uXCJgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogW1widGVjaG5vbG9neVwiLCBcImRlY2lzaW9uXCIsIFwiaW5mZXJyZWRcIl0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dHJhY3QgcHJvYmxlbS1zb2x2aW5nIHBhdHRlcm5zXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG1lc3NhZ2UuaW5jbHVkZXMoXCJlcnJvclwiKSB8fFxuICAgICAgICAgICAgbWVzc2FnZS5pbmNsdWRlcyhcImJ1Z1wiKSB8fFxuICAgICAgICAgICAgbWVzc2FnZS5pbmNsdWRlcyhcImlzc3VlXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5tZW1vcnlNYW5hZ2VyLmFkZE1lbW9yeShcbiAgICAgICAgICAgICAgICBcImVwaXNvZGljXCIsXG4gICAgICAgICAgICAgICAgYEVuY291bnRlcmVkIGlzc3VlOiAke21lc3NhZ2Uuc3Vic3RyaW5nKDAsIDIwMCl9Li4uYCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogXCJpbmZlcnJlZFwiLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBcIlByb2JsZW0tc29sdmluZyBjb252ZXJzYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdGFnczogW1wiZGVidWdnaW5nXCIsIFwiaXNzdWVcIiwgXCJpbmZlcnJlZFwiXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZmVyIGNvbnRleHQgZnJvbSBjb2RlIGNoYW5nZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGluZmVyQ29udGV4dEZyb21Db2RlKFxuICAgICAgICBmaWxlUGF0aDogc3RyaW5nLFxuICAgICAgICBjaGFuZ2VzOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuZW5hYmxlQXV0b0luZmVyZW5jZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgZnJhbWV3b3JrL2xpYnJhcnkgdXNhZ2UgcGF0dGVybnNcbiAgICAgICAgY29uc3QgZnJhbWV3b3JrUGF0dGVybnMgPSB7XG4gICAgICAgICAgICByZWFjdDogL2ltcG9ydC4qZnJvbSBbJ1wiXXJlYWN0WydcIl0vaSxcbiAgICAgICAgICAgIHZ1ZTogL2ltcG9ydC4qZnJvbSBbJ1wiXXZ1ZVsnXCJdL2ksXG4gICAgICAgICAgICBhbmd1bGFyOiAvaW1wb3J0Lipmcm9tIFsnXCJdQGFuZ3VsYXJbJ1wiXS9pLFxuICAgICAgICAgICAgZXhwcmVzczogL2NvbnN0Lio9LipyZXF1aXJlXFwoWydcIl1leHByZXNzWydcIl1cXCkvaSxcbiAgICAgICAgICAgIGZhc3RpZnk6IC9jb25zdC4qPS4qcmVxdWlyZVxcKFsnXCJdZmFzdGlmeVsnXCJdXFwpL2ksXG4gICAgICAgICAgICB0eXBlc2NyaXB0OiAvaW50ZXJmYWNlfHR5cGUuKj0uKlxcey8sXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBbZnJhbWV3b3JrLCBwYXR0ZXJuXSBvZiBPYmplY3QuZW50cmllcyhmcmFtZXdvcmtQYXR0ZXJucykpIHtcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuLnRlc3QoY2hhbmdlcykpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1lbW9yeU1hbmFnZXIuYWRkTWVtb3J5KFxuICAgICAgICAgICAgICAgICAgICBcImRlY2xhcmF0aXZlXCIsXG4gICAgICAgICAgICAgICAgICAgIGBQcm9qZWN0IHVzZXMgJHtmcmFtZXdvcmt9YCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBcImluZmVycmVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBgRGV0ZWN0ZWQgaW4gJHtmaWxlUGF0aH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogW1wiZnJhbWV3b3JrXCIsIFwidGVjaG5vbG9neVwiLCBcImluZmVycmVkXCJdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRyYWN0IGFyY2hpdGVjdHVyYWwgcGF0dGVybnNcbiAgICAgICAgaWYgKGNoYW5nZXMuaW5jbHVkZXMoXCJtaWRkbGV3YXJlXCIpIHx8IGNoYW5nZXMuaW5jbHVkZXMoXCJyb3V0ZXJcIikpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWVtb3J5TWFuYWdlci5hZGRNZW1vcnkoXG4gICAgICAgICAgICAgICAgXCJwcm9jZWR1cmFsXCIsXG4gICAgICAgICAgICAgICAgXCJVc2luZyBtaWRkbGV3YXJlL3JvdXRlciBwYXR0ZXJuXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFwiaW5mZXJyZWRcIixcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogYENvZGUgcGF0dGVybiBpbiAke2ZpbGVQYXRofWAsXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IFtcImFyY2hpdGVjdHVyZVwiLCBcInBhdHRlcm5cIiwgXCJpbmZlcnJlZFwiXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzc2VtYmxlIGNvbnRleHQgYmFzZWQgb24gdHJpZ2dlcnNcbiAgICAgKi9cbiAgICBhc3luYyBhc3NlbWJsZSh0cmlnZ2VyczogQ29udGV4dFRyaWdnZXJbXSk6IFByb21pc2U8QXNzZW1ibGVkQ29udGV4dD4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBtZW1vcmllczogTWVtb3J5RW50cnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBza2lsbHM6IExvYWRlZFNraWxsW10gPSBbXTtcbiAgICAgICAgbGV0IHRva2VuRXN0aW1hdGUgPSAwO1xuXG4gICAgICAgIC8vIEtlZXAgbGFzdCB1c2VyIHF1ZXJ5IChpZiBhbnkpIGZvciBsYXRlciByYW5raW5nXG4gICAgICAgIGxldCBsYXN0UXVlcnk6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBQcm9jZXNzIGVhY2ggdHJpZ2dlclxuICAgICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHJpZ2dlci50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInNlc3Npb25fc3RhcnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb2FkIHNlc3Npb24gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZmlsZV9vcGVuXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9hZCByZWxldmFudCBtZW1vcmllcyBmb3IgZmlsZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuZWRGaWxlUGF0aCA9IHRyaWdnZXIuZGF0YS5wYXRoIGFzIHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2VtYW50aWMgc2VhcmNoIGZvciBmaWxlLXJlbGF0ZWQgbWVtb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVNlbWFudGljUmVzdWx0cyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnZlY3Rvck1hbmFnZXIuc2VtYW50aWNTZWFyY2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbmVkRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdDogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluU2NvcmU6IDAuMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtb3J5VHlwZTogXCJwcm9jZWR1cmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBkbyB0cmFkaXRpb25hbCBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhZGl0aW9uYWxNZW1vcmllcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbW9yeU1hbmFnZXIuc2VhcmNoTWVtb3JpZXMob3BlbmVkRmlsZVBhdGgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Db25maWRlbmNlOiAwLjYsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBtZW1vcmllcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZmlsZVNlbWFudGljUmVzdWx0cy5tYXAoKHIpID0+IHIubWVtb3J5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRyYWRpdGlvbmFsTWVtb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjb21tYW5kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9hZCBtZW1vcmllcyByZWxhdGVkIHRvIGNvbW1hbmRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSB0cmlnZ2VyLmRhdGEuY29tbWFuZCBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2VtYW50aWMgc2VhcmNoIGZvciBjb21tYW5kLXJlbGF0ZWQgbWVtb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VtYW50aWNSZXN1bHRzID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudmVjdG9yTWFuYWdlci5zZW1hbnRpY1NlYXJjaChjb21tYW5kTmFtZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlOiAwLjQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtb3J5VHlwZTogXCJwcm9jZWR1cmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUcmFkaXRpb25hbCBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZE1lbW9yaWVzID0gdGhpcy5tZW1vcnlNYW5hZ2VyLnNlYXJjaE1lbW9yaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluQ29uZmlkZW5jZTogMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBtZW1vcmllcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VtYW50aWNSZXN1bHRzLm1hcCgocikgPT4gci5tZW1vcnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY29tbWFuZE1lbW9yaWVzLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAvLyBTZWFyY2ggbWVtb3JpZXMgZm9yIHF1ZXJ5IHdpdGggZW5oYW5jZWQgcmFua2luZ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyUXVlcnkgPSB0cmlnZ2VyLmRhdGEucXVlcnkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBsYXN0UXVlcnkgPSB1c2VyUXVlcnk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQXV0by1pbmZlciBjb250ZXh0IGZyb20gcXVlcnkgcGF0dGVybnNcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5pbmZlckNvbnRleHRGcm9tUXVlcnkodXNlclF1ZXJ5KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBQdWxsIHJlbGV2YW50IG1lbW9yaWVzIGZvciB0aGUgcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VtYW50aWNRdWVyeVJlc3VsdHMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy52ZWN0b3JNYW5hZ2VyLnNlbWFudGljU2VhcmNoKHVzZXJRdWVyeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlOiAwLjM1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9yeVR5cGU6IFwicHJvY2VkdXJhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhZGl0aW9uYWxRdWVyeU1lbW9yaWVzID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVtb3J5TWFuYWdlci5zZWFyY2hNZW1vcmllcyh1c2VyUXVlcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Db25maWRlbmNlOiAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBtZW1vcmllcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc2VtYW50aWNRdWVyeVJlc3VsdHMubWFwKChyKSA9PiByLm1lbW9yeSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi50cmFkaXRpb25hbFF1ZXJ5TWVtb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhc2UgXCJjb252ZXJzYXRpb25fdHVyblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFuYWx5emUgY29udmVyc2F0aW9uIGZvciBpbXBsaWNpdCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0cmlnZ2VyLmRhdGEubWVzc2FnZSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gdHJpZ2dlci5kYXRhLnJlc3BvbnNlIGFzIHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmluZmVyQ29udGV4dEZyb21Db252ZXJzYXRpb24obWVzc2FnZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiZmlsZV9lZGl0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTGVhcm4gZnJvbSBjb2RlIHBhdHRlcm5zIGFuZCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRlZEZpbGVQYXRoID0gdHJpZ2dlci5kYXRhLmZpbGVQYXRoIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29kZUNoYW5nZXMgPSB0cmlnZ2VyLmRhdGEuY2hhbmdlcyBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5pbmZlckNvbnRleHRGcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRlZEZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZUNoYW5nZXMsXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBtZW1vcmllcyBmb3IgcmFua2luZ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGxNZW1vcmllcyA9IHRoaXMubWVtb3J5TWFuYWdlci5nZXRBbGxNZW1vcmllcygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IGxhc3RRdWVyeSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRmlsZXM6IHRoaXMuc2Vzc2lvbk1hbmFnZXIuZ2V0QWN0aXZlRmlsZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXNrOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2Vzc2lvbk1hbmFnZXIuZ2V0Q29udGV4dDxzdHJpbmc+KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnJlbnRUYXNrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25UeXBlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2Vzc2lvbk1hbmFnZXIuZ2V0U2Vzc2lvbigpPy5tZXRhZGF0YS5tb2RlLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJhbmsgbWVtb3JpZXMgYnkgcmVsZXZhbmNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmtlZE1lbW9yaWVzID0gQ29udGV4dFJhbmtlci5yYW5rQnlSZWxldmFuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxNZW1vcmllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9yaWVzLnB1c2goLi4ucmFua2VkTWVtb3JpZXMuc2xpY2UoMCwgMTApKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSBcInRhc2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb2FkIG1lbW9yaWVzIHJlbGF0ZWQgdG8gdGFzayB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhc2tUeXBlID0gdHJpZ2dlci5kYXRhLnRhc2tUeXBlIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFza01lbW9yaWVzID0gdGhpcy5tZW1vcnlNYW5hZ2VyLnNlYXJjaE1lbW9yaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFza1R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogW1widGFza1wiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5Db25maWRlbmNlOiAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBtZW1vcmllcy5wdXNoKC4uLnRhc2tNZW1vcmllcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZHVwbGljYXRlIG1lbW9yaWVzXG4gICAgICAgIGNvbnN0IHVuaXF1ZU1lbW9yaWVzID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIG5ldyBNYXAobWVtb3JpZXMubWFwKChtKSA9PiBbbS5pZCwgbV0pKS52YWx1ZXMoKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdG9rZW4gZXN0aW1hdGVcbiAgICAgICAgZm9yIChjb25zdCBtZW1vcnkgb2YgdW5pcXVlTWVtb3JpZXMpIHtcbiAgICAgICAgICAgIHRva2VuRXN0aW1hdGUgKz0gTWF0aC5jZWlsKG1lbW9yeS5jb250ZW50Lmxlbmd0aCAvIDQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXNzaW9uOiB0aGlzLnNlc3Npb25NYW5hZ2VyLmdldFNlc3Npb24oKSB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBtZW1vcmllczogdW5pcXVlTWVtb3JpZXMsXG4gICAgICAgICAgICBza2lsbHMsXG4gICAgICAgICAgICB0b2tlbkVzdGltYXRlLFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICAgIGFzc2VtYmxlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgdHJpZ2dlcnM6IHRyaWdnZXJzLm1hcCgodCkgPT4gdC50eXBlKSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVzaCBjb250ZXh0OiBwcm9hY3RpdmVseSBsb2FkIGNvbnRleHQgb24gZXZlbnRzXG4gICAgICovXG4gICAgYXN5bmMgcHVzaENvbnRleHQoXG4gICAgICAgIGV2ZW50OiBzdHJpbmcsXG4gICAgICAgIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgICApOiBQcm9taXNlPEFzc2VtYmxlZENvbnRleHQ+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlcnM6IENvbnRleHRUcmlnZ2VyW10gPSBbXTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICAgICAgICBjYXNlIFwic2Vzc2lvbl9zdGFydFwiOlxuICAgICAgICAgICAgICAgIHRyaWdnZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNlc3Npb25fc3RhcnRcIixcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogXCJwdXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEgfHwge30sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX29wZW5cIjpcbiAgICAgICAgICAgICAgICB0cmlnZ2Vycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJmaWxlX29wZW5cIixcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogXCJwdXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEgfHwge30sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJjb21tYW5kX3J1blwiOlxuICAgICAgICAgICAgICAgIHRyaWdnZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNvbW1hbmRcIixcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogXCJwdXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEgfHwge30sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjYWNoZUtleSA9IHRoaXMuZ2VuZXJhdGVDYWNoZUtleSh0cmlnZ2Vycyk7XG4gICAgICAgIGNvbnN0IGNhY2hlZCA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkQ29udGV4dChjYWNoZUtleSk7XG5cbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCB0aGlzLmFzc2VtYmxlKHRyaWdnZXJzKTtcbiAgICAgICAgdGhpcy5jYWNoZUNvbnRleHQoY2FjaGVLZXksIGNvbnRleHQpO1xuXG4gICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1bGwgY29udGV4dDogb24tZGVtYW5kIHJldHJpZXZhbFxuICAgICAqL1xuICAgIGFzeW5jIHB1bGxDb250ZXh0KHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPEFzc2VtYmxlZENvbnRleHQ+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlcnM6IENvbnRleHRUcmlnZ2VyW10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJxdWVyeVwiLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IFwicHVsbFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHsgcXVlcnkgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSB0aGlzLmdlbmVyYXRlQ2FjaGVLZXkodHJpZ2dlcnMpO1xuICAgICAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCB0aGlzLmdldENhY2hlZENvbnRleHQoY2FjaGVLZXkpO1xuXG4gICAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZXh0ID0gYXdhaXQgdGhpcy5hc3NlbWJsZSh0cmlnZ2Vycyk7XG4gICAgICAgIHRoaXMuY2FjaGVDb250ZXh0KGNhY2hlS2V5LCBjb250ZXh0KTtcblxuICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29udGV4dCBzdW1tYXJ5IGZvciBpbmNsdXNpb24gaW4gcHJvbXB0c1xuICAgICAqL1xuICAgIGFzeW5jIGdldENvbnRleHRTdW1tYXJ5KG1heE1lbW9yaWVzID0gNSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLnNlc3Npb25NYW5hZ2VyLmdldFNlc3Npb24oKTtcbiAgICAgICAgY29uc3QgbWVtb3JpZXMgPSB0aGlzLm1lbW9yeU1hbmFnZXJcbiAgICAgICAgICAgIC5nZXRBbGxNZW1vcmllcygpXG4gICAgICAgICAgICAuc2xpY2UoMCwgbWF4TWVtb3JpZXMpO1xuXG4gICAgICAgIGNvbnN0IGxpbmVzID0gW1wiIyMgQ29udGV4dCBTdW1tYXJ5XCIsIFwiXCJdO1xuXG4gICAgICAgIGlmIChzZXNzaW9uKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiIyMjIFNlc3Npb25cIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKHRoaXMuc2Vzc2lvbk1hbmFnZXIuZ2V0U2Vzc2lvblN1bW1hcnkoKSk7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lbW9yaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyMgUmVsZXZhbnQgTWVtb3JpZXNcIik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbSBvZiBtZW1vcmllcykge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIGAtIFske21lbS50eXBlfV0gJHttZW0uY29udGVudC5zdWJzdHJpbmcoMCwgMTAwKX0uLi5gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGluZXMucHVzaChcIiMjIyBNZW1vcnkgU3RhdGlzdGljc1wiKTtcbiAgICAgICAgbGluZXMucHVzaCh0aGlzLm1lbW9yeU1hbmFnZXIuZ2V0U3VtbWFyeSgzKSk7XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGNhY2hlZCBjb250ZXh0IG9yIGNyZWF0ZSBuZXcgb25lXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRDYWNoZWRDb250ZXh0KFxuICAgICAgICBjYWNoZUtleTogc3RyaW5nLFxuICAgICAgICB0dGxNcyA9IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgKTogUHJvbWlzZTxBc3NlbWJsZWRDb250ZXh0IHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmNvbnRleHRDYWNoZS5nZXQoY2FjaGVLZXkpO1xuXG4gICAgICAgIGlmIChjYWNoZWQgJiYgRGF0ZS5ub3coKSA8IGNhY2hlZC5leHBpcmVzKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgYWNjZXNzIHRpbWUgZm9yIG1lbW9yaWVzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbW9yeSBvZiBjYWNoZWQuY29udGV4dC5tZW1vcmllcykge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWVtb3J5TWFuYWdlci5hY2Nlc3NNZW1vcnkobWVtb3J5LmlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZC5jb250ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FjaGUgY29udGV4dCB3aXRoIFRUTFxuICAgICAqL1xuICAgIHByaXZhdGUgY2FjaGVDb250ZXh0KFxuICAgICAgICBjYWNoZUtleTogc3RyaW5nLFxuICAgICAgICBjb250ZXh0OiBBc3NlbWJsZWRDb250ZXh0LFxuICAgICAgICB0dGxNcyA9IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29udGV4dENhY2hlLnNldChjYWNoZUtleSwge1xuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGV4cGlyZXM6IERhdGUubm93KCkgKyB0dGxNcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgY2FjaGUga2V5IGZyb20gdHJpZ2dlcnNcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlQ2FjaGVLZXkodHJpZ2dlcnM6IENvbnRleHRUcmlnZ2VyW10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBbLi4udHJpZ2dlcnNdLnNvcnQoKGEsIGIpID0+XG4gICAgICAgICAgICBhLnR5cGUubG9jYWxlQ29tcGFyZShiLnR5cGUpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICBzb3J0ZWQubWFwKCh0KSA9PiAoe1xuICAgICAgICAgICAgICAgIHR5cGU6IHQudHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB0LmRhdGEsXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXN0aW1hdGUgY29udGV4dCBzaXplXG4gICAgICovXG4gICAgZXN0aW1hdGVDb250ZXh0U2l6ZShjb250ZXh0OiBBc3NlbWJsZWRDb250ZXh0KToge1xuICAgICAgICBzZXNzaW9uczogbnVtYmVyO1xuICAgICAgICBtZW1vcmllczogbnVtYmVyO1xuICAgICAgICBza2lsbHM6IG51bWJlcjtcbiAgICAgICAgdG90YWw6IG51bWJlcjtcbiAgICB9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlc3Npb25zOiBjb250ZXh0LnNlc3Npb24gPyA1MDAgOiAwLFxuICAgICAgICAgICAgbWVtb3JpZXM6IGNvbnRleHQubWVtb3JpZXMucmVkdWNlKFxuICAgICAgICAgICAgICAgIChzdW0sIG0pID0+IHN1bSArIE1hdGguY2VpbChtLmNvbnRlbnQubGVuZ3RoIC8gNCksXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBza2lsbHM6IGNvbnRleHQuc2tpbGxzLnJlZHVjZSgoc3VtLCBzKSA9PiBzdW0gKyBzLnRva2VuRXN0aW1hdGUsIDApLFxuICAgICAgICAgICAgdG90YWw6IGNvbnRleHQudG9rZW5Fc3RpbWF0ZSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgY29udGV4dCByZXRyaWV2ZXIgd2l0aCBhbGwgbWFuYWdlcnMgaW5pdGlhbGl6ZWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNvbnRleHRSZXRyaWV2ZXIoXG4gICAgY29uZmlnPzogUGFydGlhbDxDb250ZXh0Q29uZmlnPixcbik6IFByb21pc2U8Q29udGV4dFJldHJpZXZlcj4ge1xuICAgIC8vIExvYWQgY29uZmlndXJhdGlvbiAobWVyZ2VzIGRlZmF1bHRzICsgcHJvamVjdCBjb25maWcgKyBwYXNzZWQgY29uZmlnKVxuICAgIGNvbnN0IHsgbG9hZENvbmZpZyB9ID0gYXdhaXQgaW1wb3J0KFwiLi90eXBlc1wiKTtcbiAgICBjb25zdCBmaW5hbENvbmZpZyA9IGF3YWl0IGxvYWRDb25maWcoY29uZmlnKTtcblxuICAgIGNvbnN0IHNlc3Npb25NYW5hZ2VyID0gbmV3IFNlc3Npb25NYW5hZ2VyKGZpbmFsQ29uZmlnKTtcbiAgICBjb25zdCBtZW1vcnlNYW5hZ2VyID0gbmV3IE1lbW9yeU1hbmFnZXIoZmluYWxDb25maWcpO1xuICAgIGNvbnN0IHNraWxsTG9hZGVyID0gbmV3IFByb2dyZXNzaXZlU2tpbGxMb2FkZXIoZmluYWxDb25maWcuc3RvcmFnZVBhdGgpO1xuXG4gICAgYXdhaXQgc2Vzc2lvbk1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgIGF3YWl0IG1lbW9yeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgY29uc3QgcmV0cmlldmVyID0gbmV3IENvbnRleHRSZXRyaWV2ZXIoXG4gICAgICAgIHNlc3Npb25NYW5hZ2VyLFxuICAgICAgICBtZW1vcnlNYW5hZ2VyLFxuICAgICAgICBza2lsbExvYWRlcixcbiAgICAgICAgZmluYWxDb25maWcsXG4gICAgKTtcblxuICAgIC8vIEluaXRpYWxpemUgdmVjdG9yIG1hbmFnZXJcbiAgICBhd2FpdCByZXRyaWV2ZXIuaW5pdGlhbGl6ZVZlY3Rvck1hbmFnZXIoKTtcblxuICAgIHJldHVybiByZXRyaWV2ZXI7XG59XG4iLAogICAgIi8qKlxuICogVmVjdG9yIFNlYXJjaCBhbmQgU2VtYW50aWMgTWVtb3J5XG4gKlxuICogSW1wbGVtZW50cyB2ZWN0b3IgZW1iZWRkaW5ncyBhbmQgc2VtYW50aWMgc2VhcmNoIGZvciBlbmhhbmNlZCBjb250ZXh0IHJldHJpZXZhbC5cbiAqIFVzZXMgbG9jYWwgdmVjdG9yIHN0b3JlIHdpdGggb3B0aW9uYWwgZXh0ZXJuYWwgZW1iZWRkaW5nIHNlcnZpY2VzLlxuICovXG5cbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgbWtkaXIsIHJlYWRGaWxlLCB3cml0ZUZpbGUgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB0eXBlIHsgQ29udGV4dENvbmZpZywgTWVtb3J5RW50cnkgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZlY3RvckVtYmVkZGluZyB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB2ZWN0b3I6IG51bWJlcltdO1xuICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIG1lbW9yeUlkOiBzdHJpbmc7XG4gICAgICAgIHR5cGU6IHN0cmluZztcbiAgICAgICAgdGFnczogc3RyaW5nW107XG4gICAgICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgICBtZW1vcnk6IE1lbW9yeUVudHJ5O1xuICAgIHNjb3JlOiBudW1iZXI7XG4gICAgcmVsZXZhbmNlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmVjdG9yU3RvcmUge1xuICAgIGVtYmVkZGluZ3M6IFZlY3RvckVtYmVkZGluZ1tdO1xuICAgIGRpbWVuc2lvbjogbnVtYmVyO1xuICAgIGluZGV4VHlwZTogXCJmbGF0XCIgfCBcImhuc3dcIiB8IFwiaXZmXCI7XG59XG5cbi8qKlxuICogU2ltcGxlIHRleHQgdG9rZW5pemVyIGZvciBjcmVhdGluZyBlbWJlZGRpbmdzXG4gKi9cbmV4cG9ydCBjbGFzcyBUZXh0VG9rZW5pemVyIHtcbiAgICAvKipcbiAgICAgKiBTaW1wbGUgd29yZC1iYXNlZCB0b2tlbml6YXRpb25cbiAgICAgKi9cbiAgICB0b2tlbml6ZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0ZXh0XG4gICAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teXFx3XFxzXS9nLCBcIlwiKVxuICAgICAgICAgICAgLnNwbGl0KC9cXHMrLylcbiAgICAgICAgICAgIC5maWx0ZXIoKHdvcmQpID0+IHdvcmQubGVuZ3RoID4gMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIFRGLUlERiB2ZWN0b3JzXG4gICAgICovXG4gICAgY3JlYXRlVEZJREZWZWN0b3IodGV4dHM6IHN0cmluZ1tdKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IGFsbFdvcmRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGRvY3VtZW50czogc3RyaW5nW11bXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGV4dCBvZiB0ZXh0cykge1xuICAgICAgICAgICAgY29uc3Qgd29yZHMgPSB0aGlzLnRva2VuaXplKHRleHQpO1xuICAgICAgICAgICAgZG9jdW1lbnRzLnB1c2god29yZHMpO1xuICAgICAgICAgICAgd29yZHMuZm9yRWFjaCgod29yZCkgPT4gYWxsV29yZHMuYWRkKHdvcmQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdvcmRMaXN0ID0gQXJyYXkuZnJvbShhbGxXb3Jkcyk7XG4gICAgICAgIGNvbnN0IGRvY0ZyZXF1ZW5jeTogTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgSURGXG4gICAgICAgIGZvciAoY29uc3Qgd29yZCBvZiB3b3JkTGlzdCkge1xuICAgICAgICAgICAgY29uc3QgZG9jQ291bnQgPSBkb2N1bWVudHMuZmlsdGVyKChkb2MpID0+XG4gICAgICAgICAgICAgICAgZG9jLmluY2x1ZGVzKHdvcmQpLFxuICAgICAgICAgICAgKS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBpZGYgPSBNYXRoLmxvZyh0ZXh0cy5sZW5ndGggLyAoZG9jQ291bnQgKyAxKSk7XG4gICAgICAgICAgICBkb2NGcmVxdWVuY3kuc2V0KHdvcmQsIGlkZik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgVEYtSURGIGZvciB0aGlzIHRleHRcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICAgICAgY29uc3Qgd29yZHMgPSB0aGlzLnRva2VuaXplKHRleHRzWzBdKTsgLy8gVXNlIGZpcnN0IHRleHQgYXMgcXVlcnlcbiAgICAgICAgY29uc3Qgd29yZENvdW50ID0gd29yZHMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoY29uc3Qgd29yZCBvZiB3b3Jkcykge1xuICAgICAgICAgICAgY29uc3QgdGYgPSB3b3Jkcy5maWx0ZXIoKHcpID0+IHcgPT09IHdvcmQpLmxlbmd0aCAvIHdvcmRDb3VudDtcbiAgICAgICAgICAgIGNvbnN0IHRmaWRmID0gdGYgKiAoZG9jRnJlcXVlbmN5LmdldCh3b3JkKSB8fCAwKTtcbiAgICAgICAgICAgIHZlY3Rvci5zZXQod29yZCwgdGZpZGYpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZlY3RvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgc2ltcGxlIGZyZXF1ZW5jeSB2ZWN0b3JcbiAgICAgKi9cbiAgICBjcmVhdGVGcmVxdWVuY3lWZWN0b3IodGV4dDogc3RyaW5nKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gdGhpcy50b2tlbml6ZSh0ZXh0KTtcbiAgICAgICAgY29uc3QgdmVjdG9yID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICAgICAgY29uc3QgdG90YWxXb3JkcyA9IHdvcmRzLmxlbmd0aDtcblxuICAgICAgICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gKHZlY3Rvci5nZXQod29yZCkgfHwgMCkgKyAxO1xuICAgICAgICAgICAgdmVjdG9yLnNldCh3b3JkLCBjb3VudCAvIHRvdGFsV29yZHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZlY3RvcjtcbiAgICB9XG59XG5cbi8qKlxuICogVmVjdG9yIHNpbWlsYXJpdHkgY2FsY3VsYXRpb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBWZWN0b3JNYXRoIHtcbiAgICAvKipcbiAgICAgKiBDb3NpbmUgc2ltaWxhcml0eSBiZXR3ZWVuIHR3byB2ZWN0b3JzXG4gICAgICovXG4gICAgc3RhdGljIGNvc2luZVNpbWlsYXJpdHkoXG4gICAgICAgIHZlYzE6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgIHZlYzI6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uID0gbmV3IFNldChcbiAgICAgICAgICAgIFsuLi52ZWMxLmtleXMoKV0uZmlsdGVyKCh4KSA9PiB2ZWMyLmhhcyh4KSksXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGludGVyc2VjdGlvbi5zaXplID09PSAwKSByZXR1cm4gMDtcblxuICAgICAgICBsZXQgZG90UHJvZHVjdCA9IDA7XG4gICAgICAgIGxldCBtYWcxID0gMDtcbiAgICAgICAgbGV0IG1hZzIgPSAwO1xuXG4gICAgICAgIGZvciAoY29uc3Qgd29yZCBvZiBpbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgICAgIGRvdFByb2R1Y3QgKz0gKHZlYzEuZ2V0KHdvcmQpIHx8IDApICogKHZlYzIuZ2V0KHdvcmQpIHx8IDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2ZWMxLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBtYWcxICs9IHZhbHVlICogdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZlYzIudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIG1hZzIgKz0gdmFsdWUgKiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hZzEgPSBNYXRoLnNxcnQobWFnMSk7XG4gICAgICAgIG1hZzIgPSBNYXRoLnNxcnQobWFnMik7XG5cbiAgICAgICAgcmV0dXJuIG1hZzEgPT09IDAgfHwgbWFnMiA9PT0gMCA/IDAgOiBkb3RQcm9kdWN0IC8gKG1hZzEgKiBtYWcyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjdG9yc1xuICAgICAqL1xuICAgIHN0YXRpYyBldWNsaWRlYW5EaXN0YW5jZSh2ZWMxOiBudW1iZXJbXSwgdmVjMjogbnVtYmVyW10pOiBudW1iZXIge1xuICAgICAgICBpZiAodmVjMS5sZW5ndGggIT09IHZlYzIubGVuZ3RoKSByZXR1cm4gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlYzEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSB2ZWMxW2ldIC0gdmVjMltpXTtcbiAgICAgICAgICAgIHN1bSArPSBkaWZmICogZGlmZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IE1hcCB0byBhcnJheSBmb3IgY2FsY3VsYXRpb25zXG4gICAgICovXG4gICAgc3RhdGljIG1hcFRvQXJyYXkobWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+LCBkaW1lbnNpb246IG51bWJlcik6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSBuZXcgQXJyYXkoZGltZW5zaW9uKS5maWxsKDApO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBbd29yZCwgdmFsdWVdIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChpID49IGRpbWVuc2lvbikgYnJlYWs7XG4gICAgICAgICAgICBhcnJheVtpXSA9IHZhbHVlO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbn1cblxuLyoqXG4gKiBFbmhhbmNlZCBNZW1vcnkgTWFuYWdlciB3aXRoIFZlY3RvciBTZWFyY2hcbiAqL1xuZXhwb3J0IGNsYXNzIFZlY3Rvck1lbW9yeU1hbmFnZXIge1xuICAgIHByaXZhdGUgY29uZmlnOiBDb250ZXh0Q29uZmlnO1xuICAgIHByaXZhdGUgdmVjdG9yRGlyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzdG9yZTogVmVjdG9yU3RvcmU7XG4gICAgcHJpdmF0ZSB0b2tlbml6ZXI6IFRleHRUb2tlbml6ZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFBhcnRpYWw8Q29udGV4dENvbmZpZz4gPSB7fSkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLnZlY3RvckRpciA9IGpvaW4odGhpcy5jb25maWcuc3RvcmFnZVBhdGgsIFwidmVjdG9yc1wiKTtcbiAgICAgICAgdGhpcy5zdG9yZSA9IHsgZW1iZWRkaW5nczogW10sIGRpbWVuc2lvbjogMCwgaW5kZXhUeXBlOiBcImZsYXRcIiB9O1xuICAgICAgICB0aGlzLnRva2VuaXplciA9IG5ldyBUZXh0VG9rZW5pemVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB2ZWN0b3Igc3RvcmFnZVxuICAgICAqL1xuICAgIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IG1rZGlyKHRoaXMudmVjdG9yRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkVmVjdG9yU3RvcmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGV4aXN0aW5nIHZlY3RvciBzdG9yZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgbG9hZFZlY3RvclN0b3JlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzdG9yZVBhdGggPSBqb2luKHRoaXMudmVjdG9yRGlyLCBcInN0b3JlLmpzb25cIik7XG5cbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoc3RvcmVQYXRoKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoc3RvcmVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmUgPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIFZlY3RvclN0b3JlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgdmVjdG9yIHN0b3JlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHZlY3RvciBzdG9yZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgc2F2ZVZlY3RvclN0b3JlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzdG9yZVBhdGggPSBqb2luKHRoaXMudmVjdG9yRGlyLCBcInN0b3JlLmpzb25cIik7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShzdG9yZVBhdGgsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RvcmUsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZW1iZWRkaW5nIGZvciBhIG1lbW9yeSBlbnRyeVxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZUVtYmVkZGluZyhtZW1vcnk6IE1lbW9yeUVudHJ5KTogUHJvbWlzZTxWZWN0b3JFbWJlZGRpbmc+IHtcbiAgICAgICAgLy8gVXNlIFRGLUlERiBmb3Igbm93IChjb3VsZCBiZSB1cGdyYWRlZCB0byBleHRlcm5hbCBlbWJlZGRpbmdzKVxuICAgICAgICBjb25zdCB2ZWN0b3IgPSB0aGlzLnRva2VuaXplci5jcmVhdGVGcmVxdWVuY3lWZWN0b3IobWVtb3J5LmNvbnRlbnQpO1xuICAgICAgICBjb25zdCB2ZWN0b3JBcnJheSA9IFZlY3Rvck1hdGgubWFwVG9BcnJheShcbiAgICAgICAgICAgIHZlY3RvcixcbiAgICAgICAgICAgIHRoaXMuc3RvcmUuZGltZW5zaW9uIHx8IDEwMCxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBlbWJlZGRpbmc6IFZlY3RvckVtYmVkZGluZyA9IHtcbiAgICAgICAgICAgIGlkOiBgdmVjXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpfWAsXG4gICAgICAgICAgICB2ZWN0b3I6IHZlY3RvckFycmF5LFxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZW1vcnlJZDogbWVtb3J5LmlkLFxuICAgICAgICAgICAgICAgIHR5cGU6IG1lbW9yeS50eXBlLFxuICAgICAgICAgICAgICAgIHRhZ3M6IG1lbW9yeS50YWdzLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbWVtb3J5LnByb3ZlbmFuY2UudGltZXN0YW1wLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBVcGRhdGUgc3RvcmUgZGltZW5zaW9uIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5zdG9yZS5kaW1lbnNpb24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmUuZGltZW5zaW9uID0gdmVjdG9yQXJyYXkubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVtYmVkZGluZztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgbWVtb3J5IHdpdGggdmVjdG9yIGVtYmVkZGluZ1xuICAgICAqL1xuICAgIGFzeW5jIGFkZE1lbW9yeVdpdGhWZWN0b3IobWVtb3J5OiBNZW1vcnlFbnRyeSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBlbWJlZGRpbmcgPSBhd2FpdCB0aGlzLmNyZWF0ZUVtYmVkZGluZyhtZW1vcnkpO1xuICAgICAgICB0aGlzLnN0b3JlLmVtYmVkZGluZ3MucHVzaChlbWJlZGRpbmcpO1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVWZWN0b3JTdG9yZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbWFudGljIHNlYXJjaCBmb3IgbWVtb3JpZXNcbiAgICAgKi9cbiAgICBhc3luYyBzZW1hbnRpY1NlYXJjaChcbiAgICAgICAgcXVlcnk6IHN0cmluZyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgbGltaXQ/OiBudW1iZXI7XG4gICAgICAgICAgICBtaW5TY29yZT86IG51bWJlcjtcbiAgICAgICAgICAgIG1lbW9yeVR5cGU/OiBzdHJpbmc7XG4gICAgICAgICAgICB0YWdzPzogc3RyaW5nW107XG4gICAgICAgIH0gPSB7fSxcbiAgICApOiBQcm9taXNlPFNlYXJjaFJlc3VsdFtdPiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5VmVjdG9yID0gdGhpcy50b2tlbml6ZXIuY3JlYXRlRnJlcXVlbmN5VmVjdG9yKHF1ZXJ5KTtcbiAgICAgICAgY29uc3QgcXVlcnlBcnJheSA9IFZlY3Rvck1hdGgubWFwVG9BcnJheShcbiAgICAgICAgICAgIHF1ZXJ5VmVjdG9yLFxuICAgICAgICAgICAgdGhpcy5zdG9yZS5kaW1lbnNpb24sXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0czogU2VhcmNoUmVzdWx0W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGVtYmVkZGluZyBvZiB0aGlzLnN0b3JlLmVtYmVkZGluZ3MpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBieSBtZW1vcnkgdHlwZSBpZiBzcGVjaWZpZWRcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBvcHRpb25zLm1lbW9yeVR5cGUgJiZcbiAgICAgICAgICAgICAgICBlbWJlZGRpbmcubWV0YWRhdGEudHlwZSAhPT0gb3B0aW9ucy5tZW1vcnlUeXBlXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlsdGVyIGJ5IHRhZ3MgaWYgc3BlY2lmaWVkXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50YWdzICYmIG9wdGlvbnMudGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzVGFnID0gb3B0aW9ucy50YWdzLnNvbWUoKHRhZykgPT5cbiAgICAgICAgICAgICAgICAgICAgZW1iZWRkaW5nLm1ldGFkYXRhLnRhZ3MuaW5jbHVkZXModGFnKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICghaGFzVGFnKSBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHNpbWlsYXJpdHlcbiAgICAgICAgICAgIGNvbnN0IHNpbWlsYXJpdHkgPSBWZWN0b3JNYXRoLmNvc2luZVNpbWlsYXJpdHkoXG4gICAgICAgICAgICAgICAgbmV3IE1hcChPYmplY3QuZW50cmllcyhxdWVyeVZlY3RvcikpLFxuICAgICAgICAgICAgICAgIG5ldyBNYXAoXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2tlbml6ZXIuY3JlYXRlRnJlcXVlbmN5VmVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlY29uc3RydWN0IGNvbnRlbnQgZnJvbSBtZXRhZGF0YSAoc2ltcGxpZmllZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWJlZGRpbmcubWV0YWRhdGEubWVtb3J5SWQgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChzaW1pbGFyaXR5ID49IChvcHRpb25zLm1pblNjb3JlIHx8IDAuMSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzY29yZTogc2ltaWxhcml0eSxcbiAgICAgICAgICAgICAgICAgICAgcmVsZXZhbmNlOiB0aGlzLmdldFJlbGV2YW5jZUxhYmVsKHNpbWlsYXJpdHkpLFxuICAgICAgICAgICAgICAgICAgICBtZW1vcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBlbWJlZGRpbmcubWV0YWRhdGEubWVtb3J5SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBlbWJlZGRpbmcubWV0YWRhdGEudHlwZSBhcyBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBcIlwiLCAvLyBXb3VsZCBuZWVkIHRvIGJlIGxvYWRlZCBmcm9tIG1lbW9yeSBzdG9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmVuYW5jZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogXCJ1c2VyXCIgYXMgYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogZW1iZWRkaW5nLm1ldGFkYXRhLnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiBlbWJlZGRpbmcubWV0YWRhdGEudGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RBY2Nlc3NlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzQ291bnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IGJ5IHJlbGV2YW5jZSBzY29yZVxuICAgICAgICByZXN1bHRzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0cy5zbGljZSgwLCBvcHRpb25zLmxpbWl0IHx8IDEwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVsZXZhbmNlIGxhYmVsIGZvciBzY29yZVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0UmVsZXZhbmNlTGFiZWwoc2NvcmU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmIChzY29yZSA+PSAwLjgpIHJldHVybiBcIlZlcnkgSGlnaFwiO1xuICAgICAgICBpZiAoc2NvcmUgPj0gMC42KSByZXR1cm4gXCJIaWdoXCI7XG4gICAgICAgIGlmIChzY29yZSA+PSAwLjQpIHJldHVybiBcIk1lZGl1bVwiO1xuICAgICAgICBpZiAoc2NvcmUgPj0gMC4yKSByZXR1cm4gXCJMb3dcIjtcbiAgICAgICAgcmV0dXJuIFwiVmVyeSBMb3dcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdmVjdG9yIHN0b3JlIHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRTdGF0cygpOiB7XG4gICAgICAgIHRvdGFsRW1iZWRkaW5nczogbnVtYmVyO1xuICAgICAgICBkaW1lbnNpb246IG51bWJlcjtcbiAgICAgICAgaW5kZXhUeXBlOiBzdHJpbmc7XG4gICAgICAgIGF2ZXJhZ2VWZWN0b3JOb3JtOiBudW1iZXI7XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IG5vcm1zID0gdGhpcy5zdG9yZS5lbWJlZGRpbmdzLm1hcCgoZSkgPT5cbiAgICAgICAgICAgIE1hdGguc3FydChlLnZlY3Rvci5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwgKiB2YWwsIDApKSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxFbWJlZGRpbmdzOiB0aGlzLnN0b3JlLmVtYmVkZGluZ3MubGVuZ3RoLFxuICAgICAgICAgICAgZGltZW5zaW9uOiB0aGlzLnN0b3JlLmRpbWVuc2lvbixcbiAgICAgICAgICAgIGluZGV4VHlwZTogdGhpcy5zdG9yZS5pbmRleFR5cGUsXG4gICAgICAgICAgICBhdmVyYWdlVmVjdG9yTm9ybTpcbiAgICAgICAgICAgICAgICBub3Jtcy5yZWR1Y2UoKHN1bSwgbm9ybSkgPT4gc3VtICsgbm9ybSwgMCkgLyBub3Jtcy5sZW5ndGgsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVidWlsZCB2ZWN0b3IgaW5kZXggKGZvciBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24pXG4gICAgICovXG4gICAgYXN5bmMgcmVidWlsZEluZGV4KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlYnVpbGRpbmcgdmVjdG9yIGluZGV4Li4uXCIpO1xuXG4gICAgICAgIC8vIEZvciBub3csIGp1c3QgZW5zdXJlIGVtYmVkZGluZ3MgYXJlIHNvcnRlZFxuICAgICAgICB0aGlzLnN0b3JlLmVtYmVkZGluZ3Muc29ydCgoYSwgYikgPT5cbiAgICAgICAgICAgIGEubWV0YWRhdGEubWVtb3J5SWQubG9jYWxlQ29tcGFyZShiLm1ldGFkYXRhLm1lbW9yeUlkKSxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCB0aGlzLnNhdmVWZWN0b3JTdG9yZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGBSZWJ1aWx0IGluZGV4IHdpdGggJHt0aGlzLnN0b3JlLmVtYmVkZGluZ3MubGVuZ3RofSBlbWJlZGRpbmdzYCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgdmVjdG9yIGRhdGEgZm9yIGJhY2t1cFxuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydFZlY3RvcnMoZm9ybWF0OiBcImpzb25cIiB8IFwiY3N2XCIgPSBcImpzb25cIik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGlmIChmb3JtYXQgPT09IFwianNvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5zdG9yZSwgbnVsbCwgMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDU1YgZXhwb3J0XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbXG4gICAgICAgICAgICBcImlkXCIsXG4gICAgICAgICAgICBcIm1lbW9yeUlkXCIsXG4gICAgICAgICAgICBcInR5cGVcIixcbiAgICAgICAgICAgIFwidGFnc1wiLFxuICAgICAgICAgICAgXCJ0aW1lc3RhbXBcIixcbiAgICAgICAgICAgIFwiZGltZW5zaW9uXCIsXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IHJvd3MgPSB0aGlzLnN0b3JlLmVtYmVkZGluZ3MubWFwKChlKSA9PiBbXG4gICAgICAgICAgICBlLmlkLFxuICAgICAgICAgICAgZS5tZXRhZGF0YS5tZW1vcnlJZCxcbiAgICAgICAgICAgIGUubWV0YWRhdGEudHlwZSxcbiAgICAgICAgICAgIGUubWV0YWRhdGEudGFncy5qb2luKFwiO1wiKSxcbiAgICAgICAgICAgIGUubWV0YWRhdGEudGltZXN0YW1wLFxuICAgICAgICAgICAgZS52ZWN0b3IubGVuZ3RoLFxuICAgICAgICBdKTtcblxuICAgICAgICByZXR1cm4gW2hlYWRlcnMuam9pbihcIixcIiksIC4uLnJvd3MubWFwKChyb3cpID0+IHJvdy5qb2luKFwiLFwiKSldLmpvaW4oXG4gICAgICAgICAgICBcIlxcblwiLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDb250ZXh0IFJhbmtpbmcgRW5naW5lXG4gKi9cbmV4cG9ydCBjbGFzcyBDb250ZXh0UmFua2VyIHtcbiAgICAvKipcbiAgICAgKiBSYW5rIG1lbW9yaWVzIGJ5IHJlbGV2YW5jZSB0byBjdXJyZW50IGNvbnRleHRcbiAgICAgKi9cbiAgICBzdGF0aWMgcmFua0J5UmVsZXZhbmNlKFxuICAgICAgICBtZW1vcmllczogTWVtb3J5RW50cnlbXSxcbiAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgcXVlcnk/OiBzdHJpbmc7XG4gICAgICAgICAgICBhY3RpdmVGaWxlcz86IHN0cmluZ1tdO1xuICAgICAgICAgICAgY3VycmVudFRhc2s/OiBzdHJpbmc7XG4gICAgICAgICAgICBzZXNzaW9uVHlwZT86IHN0cmluZztcbiAgICAgICAgfSxcbiAgICApOiBNZW1vcnlFbnRyeVtdIHtcbiAgICAgICAgY29uc3Qgc2NvcmVkID0gbWVtb3JpZXMubWFwKChtZW1vcnkpID0+IHtcbiAgICAgICAgICAgIGxldCBzY29yZSA9IDA7XG5cbiAgICAgICAgICAgIC8vIFF1ZXJ5IHJlbGV2YW5jZVxuICAgICAgICAgICAgaWYgKGNvbnRleHQucXVlcnkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeVdvcmRzID0gY29udGV4dC5xdWVyeS50b0xvd2VyQ2FzZSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudFdvcmRzID0gbWVtb3J5LmNvbnRlbnQudG9Mb3dlckNhc2UoKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJsYXAgPSBxdWVyeVdvcmRzLmZpbHRlcigod29yZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgY29udGVudFdvcmRzLmluY2x1ZGVzKHdvcmQpLFxuICAgICAgICAgICAgICAgICkubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHNjb3JlICs9IChvdmVybGFwIC8gcXVlcnlXb3Jkcy5sZW5ndGgpICogMC40O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaWxlIHJlbGV2YW5jZVxuICAgICAgICAgICAgaWYgKGNvbnRleHQuYWN0aXZlRmlsZXMgJiYgY29udGV4dC5hY3RpdmVGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZU1lbnRpb24gPSBjb250ZXh0LmFjdGl2ZUZpbGVzLnNvbWUoKGZpbGUpID0+XG4gICAgICAgICAgICAgICAgICAgIG1lbW9yeS5jb250ZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsZS50b0xvd2VyQ2FzZSgpKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTWVudGlvbikgc2NvcmUgKz0gMC4zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUYXNrIHJlbGV2YW5jZVxuICAgICAgICAgICAgaWYgKGNvbnRleHQuY3VycmVudFRhc2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrUmVsZXZhbmNlID0gbWVtb3J5LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgLmluY2x1ZGVzKGNvbnRleHQuY3VycmVudFRhc2sudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tSZWxldmFuY2UpIHNjb3JlICs9IDAuMjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVjZW5jeSBib29zdFxuICAgICAgICAgICAgY29uc3QgZGF5c1NpbmNlQWNjZXNzID1cbiAgICAgICAgICAgICAgICAoRGF0ZS5ub3coKSAtIG5ldyBEYXRlKG1lbW9yeS5sYXN0QWNjZXNzZWQpLmdldFRpbWUoKSkgL1xuICAgICAgICAgICAgICAgICgxMDAwICogNjAgKiA2MCAqIDI0KTtcbiAgICAgICAgICAgIGNvbnN0IHJlY2VuY3lTY29yZSA9IE1hdGgubWF4KDAsIDEgLSBkYXlzU2luY2VBY2Nlc3MgLyAzMCk7IC8vIERlY2F5IG92ZXIgMzAgZGF5c1xuICAgICAgICAgICAgc2NvcmUgKz0gcmVjZW5jeVNjb3JlICogMC4xO1xuXG4gICAgICAgICAgICAvLyBDb25maWRlbmNlIGJvb3N0XG4gICAgICAgICAgICBzY29yZSArPSBtZW1vcnkucHJvdmVuYW5jZS5jb25maWRlbmNlICogMC4xO1xuXG4gICAgICAgICAgICByZXR1cm4geyBtZW1vcnksIHNjb3JlIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgc2NvcmVcbiAgICAgICAgc2NvcmVkLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcblxuICAgICAgICByZXR1cm4gc2NvcmVkLm1hcCgoaXRlbSkgPT4gaXRlbS5tZW1vcnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBleHBsYW5hdGlvbiBmb3IgcmFua2luZ1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRSYW5raW5nRXhwbGFuYXRpb24obWVtb3J5OiBNZW1vcnlFbnRyeSwgc2NvcmU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGZhY3RvcnMgPSBbXTtcblxuICAgICAgICBpZiAoc2NvcmUgPiAwLjUpIGZhY3RvcnMucHVzaChcIkhpZ2ggcmVsZXZhbmNlIHRvIHF1ZXJ5XCIpO1xuICAgICAgICBpZiAobWVtb3J5LnByb3ZlbmFuY2UuY29uZmlkZW5jZSA+IDAuOCkgZmFjdG9ycy5wdXNoKFwiSGlnaCBjb25maWRlbmNlXCIpO1xuICAgICAgICBpZiAobWVtb3J5LnRhZ3MuaW5jbHVkZXMoXCJyZWNlbnRcIikpIGZhY3RvcnMucHVzaChcIlJlY2VudGx5IGFjY2Vzc2VkXCIpO1xuICAgICAgICBpZiAobWVtb3J5LmFjY2Vzc0NvdW50ID4gNSkgZmFjdG9ycy5wdXNoKFwiRnJlcXVlbnRseSBhY2Nlc3NlZFwiKTtcblxuICAgICAgICByZXR1cm4gZmFjdG9ycy5sZW5ndGggPiAwID8gZmFjdG9ycy5qb2luKFwiLCBcIikgOiBcIkJhc2UgcmVsZXZhbmNlXCI7XG4gICAgfVxufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMk5BLFNBQVMsa0JBQWtCLENBQ3ZCLE1BQ0EsV0FDYTtBQUFBLEVBQ2IsTUFBTSxTQUF3QjtBQUFBLE9BQ3ZCO0FBQUEsT0FDQTtBQUFBLElBQ0gsUUFBUTtBQUFBLFNBQ0QsS0FBSztBQUFBLFNBQ0wsV0FBVztBQUFBLE1BQ2QsVUFBVTtBQUFBLFdBQ0gsS0FBSyxRQUFRO0FBQUEsV0FDYixXQUFXLFFBQVE7QUFBQSxNQUMxQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFHWCxlQUFzQixVQUFVLENBQzVCLGNBQ3NCO0FBQUEsRUFFdEIsTUFBTSxhQUFhLG1CQUFtQixnQkFBZ0IsWUFBWTtBQUFBLEVBRWxFLElBQUk7QUFBQSxJQUVBLFFBQVEsYUFBYSxNQUFhO0FBQUEsSUFDbEMsUUFBUSxlQUFlLE1BQWE7QUFBQSxJQUNwQyxRQUFRLFNBQVMsTUFBYTtBQUFBLElBRTlCLE1BQU0sYUFBYSxLQUFLLFdBQVcsYUFBYSxhQUFhO0FBQUEsSUFD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
