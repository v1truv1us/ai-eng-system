// src/agents/registry.ts
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

// src/agents/types.ts
var AgentType;
((AgentType2) => {
  AgentType2["ARCHITECT_ADVISOR"] = "architect-advisor";
  AgentType2["BACKEND_ARCHITECT"] = "backend-architect";
  AgentType2["INFRASTRUCTURE_BUILDER"] = "infrastructure-builder";
  AgentType2["FRONTEND_REVIEWER"] = "frontend-reviewer";
  AgentType2["FULL_STACK_DEVELOPER"] = "full-stack-developer";
  AgentType2["API_BUILDER_ENHANCED"] = "api-builder-enhanced";
  AgentType2["DATABASE_OPTIMIZER"] = "database-optimizer";
  AgentType2["JAVA_PRO"] = "java-pro";
  AgentType2["CODE_REVIEWER"] = "code-reviewer";
  AgentType2["TEST_GENERATOR"] = "test-generator";
  AgentType2["SECURITY_SCANNER"] = "security-scanner";
  AgentType2["PERFORMANCE_ENGINEER"] = "performance-engineer";
  AgentType2["DEPLOYMENT_ENGINEER"] = "deployment-engineer";
  AgentType2["MONITORING_EXPERT"] = "monitoring-expert";
  AgentType2["COST_OPTIMIZER"] = "cost-optimizer";
  AgentType2["AI_ENGINEER"] = "ai-engineer";
  AgentType2["ML_ENGINEER"] = "ml-engineer";
  AgentType2["SEO_SPECIALIST"] = "seo-specialist";
  AgentType2["PROMPT_OPTIMIZER"] = "prompt-optimizer";
  AgentType2["AGENT_CREATOR"] = "agent-creator";
  AgentType2["COMMAND_CREATOR"] = "command-creator";
  AgentType2["SKILL_CREATOR"] = "skill-creator";
  AgentType2["TOOL_CREATOR"] = "tool-creator";
  AgentType2["PLUGIN_VALIDATOR"] = "plugin-validator";
})(AgentType ||= {});

// src/agents/registry.ts
class AgentRegistry {
  agents = new Map;
  capabilityIndex = new Map;
  handoffGraph = new Map;
  async loadFromDirectory(dir) {
    try {
      const files = await readdir(dir);
      const markdownFiles = files.filter((file) => extname(file).toLowerCase() === ".md");
      for (const file of markdownFiles) {
        const filePath = join(dir, file);
        const agentDef = await this.parseAgentMarkdown(filePath);
        if (agentDef) {
          this.agents.set(agentDef.type, agentDef);
          this.indexCapabilities(agentDef);
          this.indexHandoffs(agentDef);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load agents from directory ${dir}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async parseAgentMarkdown(filePath) {
    try {
      const content = await readFile(filePath, "utf-8");
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        throw new Error("Invalid frontmatter format");
      }
      const frontmatter = frontmatterMatch[1];
      const prompt = frontmatterMatch[2].trim();
      const metadata = this.parseFrontmatter(frontmatter);
      const agentType = this.normalizeAgentType(metadata.name || "");
      let description = metadata.description || "";
      if (Array.isArray(description)) {
        description = description.join(" ");
      }
      return {
        type: agentType,
        name: metadata.name || "",
        description,
        mode: metadata.mode || "subagent",
        temperature: metadata.temperature || 0.7,
        capabilities: this.extractCapabilities(description, metadata.tags || []),
        handoffs: this.parseHandoffs(metadata.intended_followups || ""),
        tags: metadata.tags || [],
        category: metadata.category || "general",
        tools: metadata.tools || metadata.permission || {
          read: true,
          grep: true,
          glob: true,
          list: true,
          bash: false,
          edit: false,
          write: false,
          patch: false
        },
        promptPath: filePath,
        prompt
      };
    } catch (error) {
      const silent = process.env.AI_ENG_SILENT === "1" || process.env.AI_ENG_SILENT === "true" || false || process.env.BUN_TEST === "1" || process.env.BUN_TEST === "true";
      if (!silent) {
        console.error(`Error parsing ${filePath}:`, error);
      }
      throw error;
    }
  }
  parseFrontmatter(frontmatter) {
    const lines = frontmatter.split(`
`);
    const result = {};
    let currentKey = "";
    let currentValue = "";
    let indentLevel = 0;
    let nestedObject = null;
    for (let i = 0;i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineIndent = line.length - line.trimStart().length;
      if (trimmed === "")
        continue;
      const keyValueMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
      if (keyValueMatch) {
        if (currentKey) {
          if (nestedObject) {
            nestedObject[currentKey] = this.parseValue(currentValue.trim());
          } else {
            result[currentKey] = this.parseValue(currentValue.trim());
          }
        }
        currentKey = keyValueMatch[1].trim();
        const valuePart = keyValueMatch[2].trim();
        if (lineIndent === 0) {
          nestedObject = null;
        }
        if (valuePart === "") {
          const nestedLines = [];
          let j = i + 1;
          while (j < lines.length && (lines[j].trim() === "" || lines[j].match(/^\s+/))) {
            if (lines[j].trim() !== "") {
              nestedLines.push(lines[j]);
            }
            j++;
          }
          if (nestedLines.length > 0 && nestedLines[0].match(/^\s+[^-\s]/)) {
            nestedObject = {};
            result[currentKey] = nestedObject;
            currentKey = "";
            currentValue = "";
            for (const nestedLine of nestedLines) {
              const nestedMatch = nestedLine.trim().match(/^([^:]+):\s*(.*)$/);
              if (nestedMatch) {
                const [_, nestedKey, nestedValue] = nestedMatch;
                nestedObject[nestedKey.trim()] = this.parseValue(nestedValue.trim());
              }
            }
            i = j - 1;
          } else {
            currentValue = "";
            indentLevel = lineIndent;
          }
        } else {
          currentValue = valuePart;
          indentLevel = lineIndent;
        }
      } else if (currentKey && lineIndent > indentLevel) {
        currentValue += (currentValue ? `
` : "") + line.trimStart();
      } else if (currentKey && lineIndent <= indentLevel && trimmed !== "") {
        if (nestedObject) {
          nestedObject[currentKey] = this.parseValue(currentValue.trim());
        } else {
          result[currentKey] = this.parseValue(currentValue.trim());
        }
        currentKey = "";
        currentValue = "";
      }
    }
    if (currentKey) {
      if (nestedObject) {
        nestedObject[currentKey] = this.parseValue(currentValue.trim());
      } else {
        result[currentKey] = this.parseValue(currentValue.trim());
      }
    }
    return result;
  }
  parseValue(value) {
    if (value === "true")
      return true;
    if (value === "false")
      return false;
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
      return numValue;
    }
    if (value.includes(",")) {
      return value.split(",").map((s) => s.trim()).filter((s) => s);
    }
    return value;
  }
  extractCapabilities(description, tags) {
    const capabilities = [];
    const descLower = description.toLowerCase();
    const capabilityKeywords = [
      "code-review",
      "code review",
      "security",
      "performance",
      "architecture",
      "frontend",
      "backend",
      "testing",
      "deployment",
      "monitoring",
      "optimization",
      "ai",
      "ml",
      "seo",
      "database",
      "api",
      "infrastructure",
      "devops",
      "quality",
      "analysis"
    ];
    for (const keyword of capabilityKeywords) {
      if (descLower.includes(keyword)) {
        capabilities.push(keyword.replace(" ", "-"));
      }
    }
    capabilities.push(...tags);
    return [...new Set(capabilities)];
  }
  parseHandoffs(intendedFollowups) {
    const followups = Array.isArray(intendedFollowups) ? intendedFollowups : intendedFollowups.split(",").map((s) => s.trim()).filter((s) => s);
    return followups.map((followup) => this.normalizeAgentType(followup)).filter((type) => type !== null);
  }
  normalizeAgentType(name) {
    const normalized = name.toLowerCase().replace(/_/g, "-").replace(/[^a-z-]/g, "");
    for (const value of Object.values(AgentType)) {
      if (value === normalized) {
        return value;
      }
    }
    const partialMatches = {
      fullstack: "full-stack-developer" /* FULL_STACK_DEVELOPER */,
      "full-stack": "full-stack-developer" /* FULL_STACK_DEVELOPER */,
      "api-builder": "api-builder-enhanced" /* API_BUILDER_ENHANCED */,
      java: "java-pro" /* JAVA_PRO */,
      ml: "ml-engineer" /* ML_ENGINEER */,
      "machine-learning": "ml-engineer" /* ML_ENGINEER */,
      ai: "ai-engineer" /* AI_ENGINEER */,
      monitoring: "monitoring-expert" /* MONITORING_EXPERT */,
      deployment: "deployment-engineer" /* DEPLOYMENT_ENGINEER */,
      cost: "cost-optimizer" /* COST_OPTIMIZER */,
      database: "database-optimizer" /* DATABASE_OPTIMIZER */,
      infrastructure: "infrastructure-builder" /* INFRASTRUCTURE_BUILDER */,
      seo: "seo-specialist" /* SEO_SPECIALIST */,
      prompt: "prompt-optimizer" /* PROMPT_OPTIMIZER */,
      agent: "agent-creator" /* AGENT_CREATOR */,
      command: "command-creator" /* COMMAND_CREATOR */,
      skill: "skill-creator" /* SKILL_CREATOR */,
      tool: "tool-creator" /* TOOL_CREATOR */,
      plugin: "plugin-validator" /* PLUGIN_VALIDATOR */
    };
    return partialMatches[normalized] || "code-reviewer" /* CODE_REVIEWER */;
  }
  indexCapabilities(agent) {
    for (const capability of agent.capabilities) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, []);
      }
      this.capabilityIndex.get(capability)?.push(agent.type);
    }
  }
  indexHandoffs(agent) {
    this.handoffGraph.set(agent.type, agent.handoffs);
  }
  get(type) {
    return this.agents.get(type);
  }
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  findByCapability(capability) {
    return this.capabilityIndex.get(capability) || [];
  }
  findByCapabilities(capabilities, minMatch = 1) {
    const agentScores = new Map;
    for (const capability of capabilities) {
      const agents = this.capabilityIndex.get(capability) || [];
      for (const agent of agents) {
        agentScores.set(agent, (agentScores.get(agent) || 0) + 1);
      }
    }
    return Array.from(agentScores.entries()).filter(([, score]) => score >= minMatch).sort(([, a], [, b]) => b - a).map(([agent]) => agent);
  }
  getHandoffs(type) {
    return this.handoffGraph.get(type) || [];
  }
  isHandoffAllowed(from, to) {
    const handoffs = this.handoffGraph.get(from) || [];
    return handoffs.includes(to);
  }
  getCapabilitySummary() {
    const summary = {};
    for (const [capability, agents] of this.capabilityIndex) {
      summary[capability] = agents.length;
    }
    return summary;
  }
}
export {
  AgentRegistry
};

//# debugId=903A059B3BA8003164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FnZW50cy9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWdlbnRzL3R5cGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogQWdlbnRSZWdpc3RyeSAtIExvYWRzIGFuZCBtYW5hZ2VzIGFnZW50IGRlZmluaXRpb25zIGZyb20gLmNsYXVkZS1wbHVnaW4vXG4gKlxuICogS2V5IHJlc3BvbnNpYmlsaXRpZXM6XG4gKiAxLiBQYXJzZSBhZ2VudCBtYXJrZG93biBmaWxlcyB3aXRoIGZyb250bWF0dGVyXG4gKiAyLiBFeHRyYWN0IGNhcGFiaWxpdGllcyBmcm9tIGRlc2NyaXB0aW9uIGFuZCB0YWdzXG4gKiAzLiBNYXAgaW50ZW5kZWRfZm9sbG93dXBzIHRvIGhhbmRvZmYgcmVsYXRpb25zaGlwc1xuICogNC4gUHJvdmlkZSBjYXBhYmlsaXR5LWJhc2VkIHF1ZXJpZXNcbiAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZSwgcmVhZGRpciB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBleHRuYW1lLCBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgdHlwZSBBZ2VudERlZmluaXRpb24sIEFnZW50VHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZ2VudFJlZ2lzdHJ5IHtcbiAgICBwcml2YXRlIGFnZW50czogTWFwPEFnZW50VHlwZSwgQWdlbnREZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIGNhcGFiaWxpdHlJbmRleDogTWFwPHN0cmluZywgQWdlbnRUeXBlW10+ID0gbmV3IE1hcCgpO1xuICAgIHByaXZhdGUgaGFuZG9mZkdyYXBoOiBNYXA8QWdlbnRUeXBlLCBBZ2VudFR5cGVbXT4gPSBuZXcgTWFwKCk7XG5cbiAgICBhc3luYyBsb2FkRnJvbURpcmVjdG9yeShkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKGRpcik7XG4gICAgICAgICAgICBjb25zdCBtYXJrZG93bkZpbGVzID0gZmlsZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChmaWxlKSA9PiBleHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCkgPT09IFwiLm1kXCIsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbWFya2Rvd25GaWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXIsIGZpbGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFnZW50RGVmID0gYXdhaXQgdGhpcy5wYXJzZUFnZW50TWFya2Rvd24oZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhZ2VudERlZikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zZXQoYWdlbnREZWYudHlwZSwgYWdlbnREZWYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4Q2FwYWJpbGl0aWVzKGFnZW50RGVmKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleEhhbmRvZmZzKGFnZW50RGVmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBsb2FkIGFnZW50cyBmcm9tIGRpcmVjdG9yeSAke2Rpcn06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGFyc2VBZ2VudE1hcmtkb3duKFxuICAgICAgICBmaWxlUGF0aDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8QWdlbnREZWZpbml0aW9uIHwgbnVsbD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgY29uc3QgZnJvbnRtYXR0ZXJNYXRjaCA9IGNvbnRlbnQubWF0Y2goXG4gICAgICAgICAgICAgICAgL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS1cXG4oW1xcc1xcU10qKSQvLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCFmcm9udG1hdHRlck1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmcm9udG1hdHRlciBmb3JtYXRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXJNYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHByb21wdCA9IGZyb250bWF0dGVyTWF0Y2hbMl0udHJpbSgpO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBZQU1MLWxpa2UgZnJvbnRtYXR0ZXJcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wYXJzZUZyb250bWF0dGVyKGZyb250bWF0dGVyKTtcblxuICAgICAgICAgICAgY29uc3QgYWdlbnRUeXBlID0gdGhpcy5ub3JtYWxpemVBZ2VudFR5cGUobWV0YWRhdGEubmFtZSB8fCBcIlwiKTtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIGRlc2NyaXB0aW9uIGV4aXN0cyBhbmQgaXMgYSBzdHJpbmdcbiAgICAgICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IG1ldGFkYXRhLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkZXNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6IGFnZW50VHlwZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBtZXRhZGF0YS5uYW1lIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG1vZGU6IG1ldGFkYXRhLm1vZGUgfHwgXCJzdWJhZ2VudFwiLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiBtZXRhZGF0YS50ZW1wZXJhdHVyZSB8fCAwLjcsXG4gICAgICAgICAgICAgICAgY2FwYWJpbGl0aWVzOiB0aGlzLmV4dHJhY3RDYXBhYmlsaXRpZXMoXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YS50YWdzIHx8IFtdLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgaGFuZG9mZnM6IHRoaXMucGFyc2VIYW5kb2ZmcyhtZXRhZGF0YS5pbnRlbmRlZF9mb2xsb3d1cHMgfHwgXCJcIiksXG4gICAgICAgICAgICAgICAgdGFnczogbWV0YWRhdGEudGFncyB8fCBbXSxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogbWV0YWRhdGEuY2F0ZWdvcnkgfHwgXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgdG9vbHM6IG1ldGFkYXRhLnRvb2xzIHx8XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLnBlcm1pc3Npb24gfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2g6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJvbXB0UGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgcHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gQXZvaWQgbm9pc3kgbG9ncyBkdXJpbmcgdGVzdHMgb3Igd2hlbiBleHBsaWNpdGx5IHNpbGVuY2VkLlxuICAgICAgICAgICAgY29uc3Qgc2lsZW50ID1cbiAgICAgICAgICAgICAgICBwcm9jZXNzLmVudi5BSV9FTkdfU0lMRU5UID09PSBcIjFcIiB8fFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LkFJX0VOR19TSUxFTlQgPT09IFwidHJ1ZVwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwidGVzdFwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwiMVwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwidHJ1ZVwiO1xuXG4gICAgICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHBhcnNpbmcgJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gUmUtdGhyb3cgaW5zdGVhZCBvZiByZXR1cm5pbmcgbnVsbCBmb3IgdGVzdHNcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VGcm9udG1hdHRlcihmcm9udG1hdHRlcjogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZnJvbnRtYXR0ZXIuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgICAgICBsZXQgY3VycmVudEtleSA9IFwiXCI7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWUgPSBcIlwiO1xuICAgICAgICBsZXQgaW5kZW50TGV2ZWwgPSAwO1xuICAgICAgICBsZXQgbmVzdGVkT2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgbGluZUluZGVudCA9IGxpbmUubGVuZ3RoIC0gbGluZS50cmltU3RhcnQoKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmICh0cmltbWVkID09PSBcIlwiKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGtleTogdmFsdWUgcGF0dGVyblxuICAgICAgICAgICAgY29uc3Qga2V5VmFsdWVNYXRjaCA9IHRyaW1tZWQubWF0Y2goL14oW146XSspOlxccyooLiopJC8pO1xuICAgICAgICAgICAgaWYgKGtleVZhbHVlTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHByZXZpb3VzIGtleS12YWx1ZSBpZiBleGlzdHNcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEtleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmVzdGVkT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3RbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjdXJyZW50S2V5ID0ga2V5VmFsdWVNYXRjaFsxXS50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVQYXJ0ID0ga2V5VmFsdWVNYXRjaFsyXS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBuZXN0ZWQgb2JqZWN0IGZvciB0b3AtbGV2ZWwga2V5c1xuICAgICAgICAgICAgICAgIGlmIChsaW5lSW5kZW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZE9iamVjdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBzdGFydHMgYSBuZXN0ZWQgb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlUGFydCA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb29rIGFoZWFkIHRvIHNlZSBpZiB0aGlzIGlzIGEgbmVzdGVkIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBqIDwgbGluZXMubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAobGluZXNbal0udHJpbSgpID09PSBcIlwiIHx8IGxpbmVzW2pdLm1hdGNoKC9eXFxzKy8pKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lc1tqXS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRMaW5lcy5wdXNoKGxpbmVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZExpbmVzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZExpbmVzWzBdLm1hdGNoKC9eXFxzK1teLVxcc10vKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBuZXN0ZWQgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjdXJyZW50S2V5XSA9IG5lc3RlZE9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRLZXkgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgbmVzdGVkIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5lc3RlZExpbmUgb2YgbmVzdGVkTGluZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRNYXRjaCA9IG5lc3RlZExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWF0Y2goL14oW146XSspOlxccyooLiopJC8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbXywgbmVzdGVkS2V5LCBuZXN0ZWRWYWx1ZV0gPSBuZXN0ZWRNYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkT2JqZWN0W25lc3RlZEtleS50cmltKCldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWYWx1ZShuZXN0ZWRWYWx1ZS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBqIC0gMTsgLy8gU2tpcCBwcm9jZXNzZWQgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbWlnaHQgYmUgYSBsaXN0IG9yIG11bHRpLWxpbmUgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCA9IGxpbmVJbmRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZVBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudExldmVsID0gbGluZUluZGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRLZXkgJiYgbGluZUluZGVudCA+IGluZGVudExldmVsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29udGludWF0aW9uIG9mIG11bHRpLWxpbmUgdmFsdWVcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgKz0gKGN1cnJlbnRWYWx1ZSA/IFwiXFxuXCIgOiBcIlwiKSArIGxpbmUudHJpbVN0YXJ0KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIGN1cnJlbnRLZXkgJiZcbiAgICAgICAgICAgICAgICBsaW5lSW5kZW50IDw9IGluZGVudExldmVsICYmXG4gICAgICAgICAgICAgICAgdHJpbW1lZCAhPT0gXCJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gRW5kIG9mIGN1cnJlbnQgdmFsdWUsIHNhdmUgaXRcbiAgICAgICAgICAgICAgICBpZiAobmVzdGVkT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZE9iamVjdFtjdXJyZW50S2V5XSA9IHRoaXMucGFyc2VWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZS50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2N1cnJlbnRLZXldID0gdGhpcy5wYXJzZVZhbHVlKGN1cnJlbnRWYWx1ZS50cmltKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50S2V5ID0gXCJcIjtcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSBmaW5hbCBrZXktdmFsdWVcbiAgICAgICAgaWYgKGN1cnJlbnRLZXkpIHtcbiAgICAgICAgICAgIGlmIChuZXN0ZWRPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3RbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoY3VycmVudFZhbHVlLnRyaW0oKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtjdXJyZW50S2V5XSA9IHRoaXMucGFyc2VWYWx1ZShjdXJyZW50VmFsdWUudHJpbSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyBIYW5kbGUgYm9vbGVhbiB2YWx1ZXNcbiAgICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gSGFuZGxlIG51bWJlcnNcbiAgICAgICAgY29uc3QgbnVtVmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGlmICghTnVtYmVyLmlzTmFOKG51bVZhbHVlKSAmJiBOdW1iZXIuaXNGaW5pdGUobnVtVmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtVmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgYXJyYXlzIChjb21tYS1zZXBhcmF0ZWQpXG4gICAgICAgIGlmICh2YWx1ZS5pbmNsdWRlcyhcIixcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChzKSA9PiBzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV4dHJhY3RDYXBhYmlsaXRpZXMoZGVzY3JpcHRpb246IHN0cmluZywgdGFnczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBFeHRyYWN0IGZyb20gZGVzY3JpcHRpb25cbiAgICAgICAgY29uc3QgZGVzY0xvd2VyID0gZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCBjYXBhYmlsaXR5S2V5d29yZHMgPSBbXG4gICAgICAgICAgICBcImNvZGUtcmV2aWV3XCIsXG4gICAgICAgICAgICBcImNvZGUgcmV2aWV3XCIsXG4gICAgICAgICAgICBcInNlY3VyaXR5XCIsXG4gICAgICAgICAgICBcInBlcmZvcm1hbmNlXCIsXG4gICAgICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICAgICAgXCJmcm9udGVuZFwiLFxuICAgICAgICAgICAgXCJiYWNrZW5kXCIsXG4gICAgICAgICAgICBcInRlc3RpbmdcIixcbiAgICAgICAgICAgIFwiZGVwbG95bWVudFwiLFxuICAgICAgICAgICAgXCJtb25pdG9yaW5nXCIsXG4gICAgICAgICAgICBcIm9wdGltaXphdGlvblwiLFxuICAgICAgICAgICAgXCJhaVwiLFxuICAgICAgICAgICAgXCJtbFwiLFxuICAgICAgICAgICAgXCJzZW9cIixcbiAgICAgICAgICAgIFwiZGF0YWJhc2VcIixcbiAgICAgICAgICAgIFwiYXBpXCIsXG4gICAgICAgICAgICBcImluZnJhc3RydWN0dXJlXCIsXG4gICAgICAgICAgICBcImRldm9wc1wiLFxuICAgICAgICAgICAgXCJxdWFsaXR5XCIsXG4gICAgICAgICAgICBcImFuYWx5c2lzXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGNhcGFiaWxpdHlLZXl3b3Jkcykge1xuICAgICAgICAgICAgaWYgKGRlc2NMb3dlci5pbmNsdWRlcyhrZXl3b3JkKSkge1xuICAgICAgICAgICAgICAgIGNhcGFiaWxpdGllcy5wdXNoKGtleXdvcmQucmVwbGFjZShcIiBcIiwgXCItXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBmcm9tIHRhZ3NcbiAgICAgICAgY2FwYWJpbGl0aWVzLnB1c2goLi4udGFncyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgcmV0dXJuIFsuLi5uZXcgU2V0KGNhcGFiaWxpdGllcyldO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VIYW5kb2ZmcyhpbnRlbmRlZEZvbGxvd3Vwczogc3RyaW5nIHwgc3RyaW5nW10pOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIGNvbnN0IGZvbGxvd3VwcyA9IEFycmF5LmlzQXJyYXkoaW50ZW5kZWRGb2xsb3d1cHMpXG4gICAgICAgICAgICA/IGludGVuZGVkRm9sbG93dXBzXG4gICAgICAgICAgICA6IGludGVuZGVkRm9sbG93dXBzXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHMpID0+IHMpO1xuXG4gICAgICAgIHJldHVybiBmb2xsb3d1cHNcbiAgICAgICAgICAgIC5tYXAoKGZvbGxvd3VwKSA9PiB0aGlzLm5vcm1hbGl6ZUFnZW50VHlwZShmb2xsb3d1cCkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0eXBlKSA9PiB0eXBlICE9PSBudWxsKSBhcyBBZ2VudFR5cGVbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vcm1hbGl6ZUFnZW50VHlwZShuYW1lOiBzdHJpbmcpOiBBZ2VudFR5cGUge1xuICAgICAgICAvLyBDb252ZXJ0IHZhcmlvdXMgZm9ybWF0cyB0byBBZ2VudFR5cGUgZW51bVxuICAgICAgICBjb25zdCBub3JtYWxpemVkID0gbmFtZVxuICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiLVwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teYS16LV0vZywgXCJcIik7XG5cbiAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIGFnYWluc3QgZW51bSB2YWx1ZXNcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBPYmplY3QudmFsdWVzKEFnZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbm9ybWFsaXplZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSBhcyBBZ2VudFR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcnkgcGFydGlhbCBtYXRjaGVzIGZvciBjb21tb24gdmFyaWF0aW9uc1xuICAgICAgICBjb25zdCBwYXJ0aWFsTWF0Y2hlczogUmVjb3JkPHN0cmluZywgQWdlbnRUeXBlPiA9IHtcbiAgICAgICAgICAgIGZ1bGxzdGFjazogQWdlbnRUeXBlLkZVTExfU1RBQ0tfREVWRUxPUEVSLFxuICAgICAgICAgICAgXCJmdWxsLXN0YWNrXCI6IEFnZW50VHlwZS5GVUxMX1NUQUNLX0RFVkVMT1BFUixcbiAgICAgICAgICAgIFwiYXBpLWJ1aWxkZXJcIjogQWdlbnRUeXBlLkFQSV9CVUlMREVSX0VOSEFOQ0VELFxuICAgICAgICAgICAgamF2YTogQWdlbnRUeXBlLkpBVkFfUFJPLFxuICAgICAgICAgICAgbWw6IEFnZW50VHlwZS5NTF9FTkdJTkVFUixcbiAgICAgICAgICAgIFwibWFjaGluZS1sZWFybmluZ1wiOiBBZ2VudFR5cGUuTUxfRU5HSU5FRVIsXG4gICAgICAgICAgICBhaTogQWdlbnRUeXBlLkFJX0VOR0lORUVSLFxuICAgICAgICAgICAgbW9uaXRvcmluZzogQWdlbnRUeXBlLk1PTklUT1JJTkdfRVhQRVJULFxuICAgICAgICAgICAgZGVwbG95bWVudDogQWdlbnRUeXBlLkRFUExPWU1FTlRfRU5HSU5FRVIsXG4gICAgICAgICAgICBjb3N0OiBBZ2VudFR5cGUuQ09TVF9PUFRJTUlaRVIsXG4gICAgICAgICAgICBkYXRhYmFzZTogQWdlbnRUeXBlLkRBVEFCQVNFX09QVElNSVpFUixcbiAgICAgICAgICAgIGluZnJhc3RydWN0dXJlOiBBZ2VudFR5cGUuSU5GUkFTVFJVQ1RVUkVfQlVJTERFUixcbiAgICAgICAgICAgIHNlbzogQWdlbnRUeXBlLlNFT19TUEVDSUFMSVNULFxuICAgICAgICAgICAgcHJvbXB0OiBBZ2VudFR5cGUuUFJPTVBUX09QVElNSVpFUixcbiAgICAgICAgICAgIGFnZW50OiBBZ2VudFR5cGUuQUdFTlRfQ1JFQVRPUixcbiAgICAgICAgICAgIGNvbW1hbmQ6IEFnZW50VHlwZS5DT01NQU5EX0NSRUFUT1IsXG4gICAgICAgICAgICBza2lsbDogQWdlbnRUeXBlLlNLSUxMX0NSRUFUT1IsXG4gICAgICAgICAgICB0b29sOiBBZ2VudFR5cGUuVE9PTF9DUkVBVE9SLFxuICAgICAgICAgICAgcGx1Z2luOiBBZ2VudFR5cGUuUExVR0lOX1ZBTElEQVRPUixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcGFydGlhbE1hdGNoZXNbbm9ybWFsaXplZF0gfHwgQWdlbnRUeXBlLkNPREVfUkVWSUVXRVI7IC8vIGZhbGxiYWNrXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbmRleENhcGFiaWxpdGllcyhhZ2VudDogQWdlbnREZWZpbml0aW9uKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgY2FwYWJpbGl0eSBvZiBhZ2VudC5jYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYXBhYmlsaXR5SW5kZXguaGFzKGNhcGFiaWxpdHkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXBhYmlsaXR5SW5kZXguc2V0KGNhcGFiaWxpdHksIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2FwYWJpbGl0eUluZGV4LmdldChjYXBhYmlsaXR5KT8ucHVzaChhZ2VudC50eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5kZXhIYW5kb2ZmcyhhZ2VudDogQWdlbnREZWZpbml0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGFuZG9mZkdyYXBoLnNldChhZ2VudC50eXBlLCBhZ2VudC5oYW5kb2Zmcyk7XG4gICAgfVxuXG4gICAgZ2V0KHR5cGU6IEFnZW50VHlwZSk6IEFnZW50RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50cy5nZXQodHlwZSk7XG4gICAgfVxuXG4gICAgZ2V0QWxsQWdlbnRzKCk6IEFnZW50RGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hZ2VudHMudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIGZpbmRCeUNhcGFiaWxpdHkoY2FwYWJpbGl0eTogc3RyaW5nKTogQWdlbnRUeXBlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXBhYmlsaXR5SW5kZXguZ2V0KGNhcGFiaWxpdHkpIHx8IFtdO1xuICAgIH1cblxuICAgIGZpbmRCeUNhcGFiaWxpdGllcyhjYXBhYmlsaXRpZXM6IHN0cmluZ1tdLCBtaW5NYXRjaCA9IDEpOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIGNvbnN0IGFnZW50U2NvcmVzID0gbmV3IE1hcDxBZ2VudFR5cGUsIG51bWJlcj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNhcGFiaWxpdHkgb2YgY2FwYWJpbGl0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCBhZ2VudHMgPSB0aGlzLmNhcGFiaWxpdHlJbmRleC5nZXQoY2FwYWJpbGl0eSkgfHwgW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFnZW50IG9mIGFnZW50cykge1xuICAgICAgICAgICAgICAgIGFnZW50U2NvcmVzLnNldChhZ2VudCwgKGFnZW50U2NvcmVzLmdldChhZ2VudCkgfHwgMCkgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGFnZW50U2NvcmVzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKFssIHNjb3JlXSkgPT4gc2NvcmUgPj0gbWluTWF0Y2gpXG4gICAgICAgICAgICAuc29ydCgoWywgYV0sIFssIGJdKSA9PiBiIC0gYSlcbiAgICAgICAgICAgIC5tYXAoKFthZ2VudF0pID0+IGFnZW50KTtcbiAgICB9XG5cbiAgICBnZXRIYW5kb2Zmcyh0eXBlOiBBZ2VudFR5cGUpOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRvZmZHcmFwaC5nZXQodHlwZSkgfHwgW107XG4gICAgfVxuXG4gICAgaXNIYW5kb2ZmQWxsb3dlZChmcm9tOiBBZ2VudFR5cGUsIHRvOiBBZ2VudFR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgaGFuZG9mZnMgPSB0aGlzLmhhbmRvZmZHcmFwaC5nZXQoZnJvbSkgfHwgW107XG4gICAgICAgIHJldHVybiBoYW5kb2Zmcy5pbmNsdWRlcyh0byk7XG4gICAgfVxuXG4gICAgZ2V0Q2FwYWJpbGl0eVN1bW1hcnkoKTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbY2FwYWJpbGl0eSwgYWdlbnRzXSBvZiB0aGlzLmNhcGFiaWxpdHlJbmRleCkge1xuICAgICAgICAgICAgc3VtbWFyeVtjYXBhYmlsaXR5XSA9IGFnZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bW1hcnk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIEFnZW50IG9yY2hlc3RyYXRpb24gdHlwZXMgYW5kIGludGVyZmFjZXMgZm9yIHRoZSBBSSBFbmdpbmVlcmluZyBTeXN0ZW0uXG4gKiBEZWZpbmVzIHRoZSBjb3JlIGFic3RyYWN0aW9ucyBmb3IgYWdlbnQgY29vcmRpbmF0aW9uIGFuZCBleGVjdXRpb24uXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBEZWNpc2lvbiwgVGFzayB9IGZyb20gXCIuLi9jb250ZXh0L3R5cGVzXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBkaWZmZXJlbnQgdHlwZXMgb2YgYWdlbnRzIGF2YWlsYWJsZSBpbiB0aGUgc3lzdGVtXG4gKi9cbmV4cG9ydCBlbnVtIEFnZW50VHlwZSB7XG4gICAgLy8gQXJjaGl0ZWN0dXJlICYgUGxhbm5pbmdcbiAgICBBUkNISVRFQ1RfQURWSVNPUiA9IFwiYXJjaGl0ZWN0LWFkdmlzb3JcIixcbiAgICBCQUNLRU5EX0FSQ0hJVEVDVCA9IFwiYmFja2VuZC1hcmNoaXRlY3RcIixcbiAgICBJTkZSQVNUUlVDVFVSRV9CVUlMREVSID0gXCJpbmZyYXN0cnVjdHVyZS1idWlsZGVyXCIsXG5cbiAgICAvLyBEZXZlbG9wbWVudCAmIENvZGluZ1xuICAgIEZST05URU5EX1JFVklFV0VSID0gXCJmcm9udGVuZC1yZXZpZXdlclwiLFxuICAgIEZVTExfU1RBQ0tfREVWRUxPUEVSID0gXCJmdWxsLXN0YWNrLWRldmVsb3BlclwiLFxuICAgIEFQSV9CVUlMREVSX0VOSEFOQ0VEID0gXCJhcGktYnVpbGRlci1lbmhhbmNlZFwiLFxuICAgIERBVEFCQVNFX09QVElNSVpFUiA9IFwiZGF0YWJhc2Utb3B0aW1pemVyXCIsXG4gICAgSkFWQV9QUk8gPSBcImphdmEtcHJvXCIsXG5cbiAgICAvLyBRdWFsaXR5ICYgVGVzdGluZ1xuICAgIENPREVfUkVWSUVXRVIgPSBcImNvZGUtcmV2aWV3ZXJcIixcbiAgICBURVNUX0dFTkVSQVRPUiA9IFwidGVzdC1nZW5lcmF0b3JcIixcbiAgICBTRUNVUklUWV9TQ0FOTkVSID0gXCJzZWN1cml0eS1zY2FubmVyXCIsXG4gICAgUEVSRk9STUFOQ0VfRU5HSU5FRVIgPSBcInBlcmZvcm1hbmNlLWVuZ2luZWVyXCIsXG5cbiAgICAvLyBEZXZPcHMgJiBEZXBsb3ltZW50XG4gICAgREVQTE9ZTUVOVF9FTkdJTkVFUiA9IFwiZGVwbG95bWVudC1lbmdpbmVlclwiLFxuICAgIE1PTklUT1JJTkdfRVhQRVJUID0gXCJtb25pdG9yaW5nLWV4cGVydFwiLFxuICAgIENPU1RfT1BUSU1JWkVSID0gXCJjb3N0LW9wdGltaXplclwiLFxuXG4gICAgLy8gQUkgJiBNYWNoaW5lIExlYXJuaW5nXG4gICAgQUlfRU5HSU5FRVIgPSBcImFpLWVuZ2luZWVyXCIsXG4gICAgTUxfRU5HSU5FRVIgPSBcIm1sLWVuZ2luZWVyXCIsXG5cbiAgICAvLyBDb250ZW50ICYgU0VPXG4gICAgU0VPX1NQRUNJQUxJU1QgPSBcInNlby1zcGVjaWFsaXN0XCIsXG4gICAgUFJPTVBUX09QVElNSVpFUiA9IFwicHJvbXB0LW9wdGltaXplclwiLFxuXG4gICAgLy8gUGx1Z2luIERldmVsb3BtZW50XG4gICAgQUdFTlRfQ1JFQVRPUiA9IFwiYWdlbnQtY3JlYXRvclwiLFxuICAgIENPTU1BTkRfQ1JFQVRPUiA9IFwiY29tbWFuZC1jcmVhdG9yXCIsXG4gICAgU0tJTExfQ1JFQVRPUiA9IFwic2tpbGwtY3JlYXRvclwiLFxuICAgIFRPT0xfQ1JFQVRPUiA9IFwidG9vbC1jcmVhdG9yXCIsXG4gICAgUExVR0lOX1ZBTElEQVRPUiA9IFwicGx1Z2luLXZhbGlkYXRvclwiLFxufVxuXG4vKipcbiAqIEV4ZWN1dGlvbiBzdHJhdGVnaWVzIGZvciBhZ2VudCBjb29yZGluYXRpb25cbiAqL1xuZXhwb3J0IGVudW0gRXhlY3V0aW9uU3RyYXRlZ3kge1xuICAgIFBBUkFMTEVMID0gXCJwYXJhbGxlbFwiLFxuICAgIFNFUVVFTlRJQUwgPSBcInNlcXVlbnRpYWxcIixcbiAgICBDT05ESVRJT05BTCA9IFwiY29uZGl0aW9uYWxcIixcbn1cblxuLyoqXG4gKiBDb25maWRlbmNlIGxldmVsIGZvciBhZ2VudCByZXN1bHRzXG4gKi9cbmV4cG9ydCBlbnVtIENvbmZpZGVuY2VMZXZlbCB7XG4gICAgTE9XID0gXCJsb3dcIixcbiAgICBNRURJVU0gPSBcIm1lZGl1bVwiLFxuICAgIEhJR0ggPSBcImhpZ2hcIixcbiAgICBWRVJZX0hJR0ggPSBcInZlcnlfaGlnaFwiLFxufVxuXG4vKipcbiAqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgYWdlbnQgaW5wdXRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRJbnB1dCB7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIGNvbnRleHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHBhcmFtZXRlcnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB0aW1lb3V0PzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgYWdlbnQgb3V0cHV0c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50T3V0cHV0IHtcbiAgICB0eXBlOiBBZ2VudFR5cGU7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbiAgICByZWFzb25pbmc/OiBzdHJpbmc7XG4gICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgYWdlbnQgdGFzayBpbiBhbiBleGVjdXRpb24gcGxhblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50VGFzayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBBZ2VudFR5cGU7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgaW5wdXQ6IEFnZW50SW5wdXQ7XG4gICAgc3RyYXRlZ3k6IEV4ZWN1dGlvblN0cmF0ZWd5O1xuICAgIC8qKiBPcHRpb25hbCBjb21tYW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggVGFzayBpbnRlcmZhY2UgKi9cbiAgICBjb21tYW5kPzogc3RyaW5nO1xuICAgIGRlcGVuZHNPbj86IHN0cmluZ1tdO1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG4gICAgcmV0cnk/OiB7XG4gICAgICAgIG1heEF0dGVtcHRzOiBudW1iZXI7XG4gICAgICAgIGRlbGF5OiBudW1iZXI7XG4gICAgICAgIGJhY2tvZmZNdWx0aXBsaWVyOiBudW1iZXI7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgZXhlY3V0aW5nIGFuIGFnZW50IHRhc2tcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudFRhc2tSZXN1bHQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIHN0YXR1czogQWdlbnRUYXNrU3RhdHVzO1xuICAgIG91dHB1dD86IEFnZW50T3V0cHV0O1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbiAgICBzdGFydFRpbWU6IERhdGU7XG4gICAgZW5kVGltZTogRGF0ZTtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdGF0dXMgb2YgYW4gYWdlbnQgdGFza1xuICovXG5leHBvcnQgZW51bSBBZ2VudFRhc2tTdGF0dXMge1xuICAgIFBFTkRJTkcgPSBcInBlbmRpbmdcIixcbiAgICBSVU5OSU5HID0gXCJydW5uaW5nXCIsXG4gICAgQ09NUExFVEVEID0gXCJjb21wbGV0ZWRcIixcbiAgICBGQUlMRUQgPSBcImZhaWxlZFwiLFxuICAgIFRJTUVPVVQgPSBcInRpbWVvdXRcIixcbiAgICBTS0lQUEVEID0gXCJza2lwcGVkXCIsXG59XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWdlbnQgY29vcmRpbmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRDb29yZGluYXRvckNvbmZpZyB7XG4gICAgbWF4Q29uY3VycmVuY3k6IG51bWJlcjtcbiAgICBkZWZhdWx0VGltZW91dDogbnVtYmVyO1xuICAgIHJldHJ5QXR0ZW1wdHM6IG51bWJlcjtcbiAgICByZXRyeURlbGF5OiBudW1iZXI7XG4gICAgZW5hYmxlQ2FjaGluZzogYm9vbGVhbjtcbiAgICBsb2dMZXZlbDogXCJkZWJ1Z1wiIHwgXCJpbmZvXCIgfCBcIndhcm5cIiB8IFwiZXJyb3JcIjtcbn1cblxuLyoqXG4gKiBSZXN1bHQgYWdncmVnYXRpb24gc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2dyZWdhdGlvblN0cmF0ZWd5IHtcbiAgICB0eXBlOlxuICAgICAgICB8IFwibWVyZ2VcIlxuICAgICAgICB8IFwidm90ZVwiXG4gICAgICAgIHwgXCJ3ZWlnaHRlZFwiXG4gICAgICAgIHwgXCJwcmlvcml0eVwiXG4gICAgICAgIHwgXCJwYXJhbGxlbFwiXG4gICAgICAgIHwgXCJzZXF1ZW50aWFsXCI7XG4gICAgd2VpZ2h0cz86IFBhcnRpYWw8UmVjb3JkPEFnZW50VHlwZSwgbnVtYmVyPj47XG4gICAgcHJpb3JpdHk/OiBBZ2VudFR5cGVbXTtcbiAgICBjb25mbGljdFJlc29sdXRpb24/OiBcImhpZ2hlc3RfY29uZmlkZW5jZVwiIHwgXCJtb3N0X3JlY2VudFwiIHwgXCJtYW51YWxcIjtcbn1cblxuLyoqXG4gKiBQbGFuIGdlbmVyYXRpb24gc3BlY2lmaWMgdHlwZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQbGFuR2VuZXJhdGlvbklucHV0IHtcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHNjb3BlPzogc3RyaW5nO1xuICAgIHJlcXVpcmVtZW50cz86IHN0cmluZ1tdO1xuICAgIGNvbnN0cmFpbnRzPzogc3RyaW5nW107XG4gICAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5HZW5lcmF0aW9uT3V0cHV0IHtcbiAgICBwbGFuOiB7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgICAgdGFza3M6IEFnZW50VGFza1tdO1xuICAgICAgICBkZXBlbmRlbmNpZXM6IHN0cmluZ1tdW107XG4gICAgfTtcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG4gICAgcmVhc29uaW5nOiBzdHJpbmc7XG4gICAgc3VnZ2VzdGlvbnM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIENvZGUgcmV2aWV3IHNwZWNpZmljIHR5cGVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVJldmlld0lucHV0IHtcbiAgICBmaWxlczogc3RyaW5nW107XG4gICAgcmV2aWV3VHlwZTogXCJmdWxsXCIgfCBcImluY3JlbWVudGFsXCIgfCBcInNlY3VyaXR5XCIgfCBcInBlcmZvcm1hbmNlXCI7XG4gICAgc2V2ZXJpdHk6IFwibG93XCIgfCBcIm1lZGl1bVwiIHwgXCJoaWdoXCIgfCBcImNyaXRpY2FsXCI7XG4gICAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvZGVSZXZpZXdGaW5kaW5nIHtcbiAgICBmaWxlOiBzdHJpbmc7XG4gICAgbGluZTogbnVtYmVyO1xuICAgIHNldmVyaXR5OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiIHwgXCJjcml0aWNhbFwiO1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIHN1Z2dlc3Rpb24/OiBzdHJpbmc7XG4gICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xuICAgIGFnZW50Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvZGVSZXZpZXdPdXRwdXQge1xuICAgIGZpbmRpbmdzOiBDb2RlUmV2aWV3RmluZGluZ1tdO1xuICAgIHN1bW1hcnk6IHtcbiAgICAgICAgdG90YWw6IG51bWJlcjtcbiAgICAgICAgYnlTZXZlcml0eTogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgICAgICAgYnlDYXRlZ29yeTogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgICB9O1xuICAgIHJlY29tbWVuZGF0aW9uczogc3RyaW5nW107XG4gICAgb3ZlcmFsbFNjb3JlOiBudW1iZXI7IC8vIDAtMTAwXG59XG5cbi8qKlxuICogQWdlbnQgZXhlY3V0aW9uIGNvbnRleHRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEV4ZWN1dGlvbkNvbnRleHQge1xuICAgIHBsYW5JZDogc3RyaW5nO1xuICAgIHRhc2tJZDogc3RyaW5nO1xuICAgIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZztcbiAgICBlbnZpcm9ubWVudDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICBtZXRhZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKlxuICogRXZlbnQgdHlwZXMgZm9yIGFnZW50IGNvb3JkaW5hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RXZlbnQge1xuICAgIHR5cGU6XG4gICAgICAgIHwgXCJ0YXNrX3N0YXJ0ZWRcIlxuICAgICAgICB8IFwidGFza19jb21wbGV0ZWRcIlxuICAgICAgICB8IFwidGFza19mYWlsZWRcIlxuICAgICAgICB8IFwidGFza190aW1lb3V0XCJcbiAgICAgICAgfCBcImFnZ3JlZ2F0aW9uX3N0YXJ0ZWRcIlxuICAgICAgICB8IFwiYWdncmVnYXRpb25fY29tcGxldGVkXCI7XG4gICAgdGFza0lkOiBzdHJpbmc7XG4gICAgYWdlbnRUeXBlOiBBZ2VudFR5cGU7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqXG4gKiBQcm9ncmVzcyB0cmFja2luZyBmb3IgYWdlbnQgb3JjaGVzdHJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50UHJvZ3Jlc3Mge1xuICAgIHRvdGFsVGFza3M6IG51bWJlcjtcbiAgICBjb21wbGV0ZWRUYXNrczogbnVtYmVyO1xuICAgIGZhaWxlZFRhc2tzOiBudW1iZXI7XG4gICAgcnVubmluZ1Rhc2tzOiBudW1iZXI7XG4gICAgY3VycmVudFRhc2s/OiBzdHJpbmc7XG4gICAgZXN0aW1hdGVkVGltZVJlbWFpbmluZz86IG51bWJlcjtcbiAgICBwZXJjZW50YWdlQ29tcGxldGU6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBFcnJvciBoYW5kbGluZyB0eXBlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RXJyb3Ige1xuICAgIHRhc2tJZDogc3RyaW5nO1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIGVycm9yOiBzdHJpbmc7XG4gICAgcmVjb3ZlcmFibGU6IGJvb2xlYW47XG4gICAgc3VnZ2VzdGVkQWN0aW9uPzogc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtYW5jZSBtZXRyaWNzIGZvciBhZ2VudCBleGVjdXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudE1ldHJpY3Mge1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIGV4ZWN1dGlvbkNvdW50OiBudW1iZXI7XG4gICAgYXZlcmFnZUV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbiAgICBzdWNjZXNzUmF0ZTogbnVtYmVyO1xuICAgIGF2ZXJhZ2VDb25maWRlbmNlOiBudW1iZXI7XG4gICAgbGFzdEV4ZWN1dGlvblRpbWU6IERhdGU7XG59XG5cbi8qKlxuICogQWdlbnQgZGVmaW5pdGlvbiBsb2FkZWQgZnJvbSAuY2xhdWRlLXBsdWdpbi9hZ2VudHMvXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnREZWZpbml0aW9uIHtcbiAgICB0eXBlOiBBZ2VudFR5cGU7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgbW9kZTogXCJzdWJhZ2VudFwiIHwgXCJ0b29sXCI7XG4gICAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAgICBjYXBhYmlsaXRpZXM6IHN0cmluZ1tdO1xuICAgIGhhbmRvZmZzOiBBZ2VudFR5cGVbXTtcbiAgICB0YWdzOiBzdHJpbmdbXTtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIHRvb2xzOiB7XG4gICAgICAgIHJlYWQ6IGJvb2xlYW47XG4gICAgICAgIGdyZXA6IGJvb2xlYW47XG4gICAgICAgIGdsb2I6IGJvb2xlYW47XG4gICAgICAgIGxpc3Q6IGJvb2xlYW47XG4gICAgICAgIGJhc2g6IGJvb2xlYW47XG4gICAgICAgIGVkaXQ6IGJvb2xlYW47XG4gICAgICAgIHdyaXRlOiBib29sZWFuO1xuICAgICAgICBwYXRjaDogYm9vbGVhbjtcbiAgICB9O1xuICAgIHByb21wdFBhdGg6IHN0cmluZztcbiAgICBwcm9tcHQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBZ2VudCBleGVjdXRpb24gcmVjb3JkIGZvciBwZXJzaXN0ZW5jZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RXhlY3V0aW9uIHtcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICBpbnB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIG91dHB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgY29uZmlkZW5jZT86IENvbmZpZGVuY2VMZXZlbDtcbiAgICBleGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEltcHJvdmVtZW50IHJlY29yZCBmb3Igc2VsZi1pbXByb3ZlbWVudCBzeXN0ZW1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbXByb3ZlbWVudFJlY29yZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBcImFnZW50X3Byb21wdFwiIHwgXCJjYXBhYmlsaXR5XCIgfCBcImhhbmRvZmZcIiB8IFwid29ya2Zsb3dcIjtcbiAgICB0YXJnZXQ6IEFnZW50VHlwZSB8IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGV2aWRlbmNlOiBzdHJpbmdbXTtcbiAgICBzdWdnZXN0ZWRBdDogRGF0ZTtcbiAgICBpbXBsZW1lbnRlZEF0PzogRGF0ZTtcbiAgICBlZmZlY3RpdmVuZXNzU2NvcmU/OiBudW1iZXI7XG59XG5cbi8qKlxuICogSGFuZG9mZiByZWNvcmQgZm9yIGludGVyLWFnZW50IGNvbW11bmljYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIYW5kb2ZmUmVjb3JkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGZyb21BZ2VudDogQWdlbnRUeXBlO1xuICAgIHRvQWdlbnQ6IEFnZW50VHlwZTtcbiAgICByZWFzb246IHN0cmluZztcbiAgICBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICB0aW1lc3RhbXA6IERhdGU7XG59XG5cbi8qKlxuICogRXhlY3V0aW9uIG1vZGUgZm9yIGh5YnJpZCBUYXNrIHRvb2wgKyBsb2NhbCBleGVjdXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgRXhlY3V0aW9uTW9kZSA9IFwidGFzay10b29sXCIgfCBcImxvY2FsXCIgfCBcImh5YnJpZFwiO1xuXG4vKipcbiAqIFJvdXRpbmcgZGVjaXNpb24gZm9yIGNhcGFiaWxpdHktYmFzZWQgYWdlbnQgc2VsZWN0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGluZ0RlY2lzaW9uIHtcbiAgICBwcmltYXJ5QWdlbnQ6IEFnZW50VHlwZTtcbiAgICBzdXBwb3J0aW5nQWdlbnRzOiBBZ2VudFR5cGVbXTtcbiAgICBleGVjdXRpb25TdHJhdGVneTogXCJwYXJhbGxlbFwiIHwgXCJzZXF1ZW50aWFsXCIgfCBcImNvbmRpdGlvbmFsXCI7XG4gICAgZXhlY3V0aW9uTW9kZTogRXhlY3V0aW9uTW9kZTtcbiAgICBoYW5kb2ZmUGxhbjogSGFuZG9mZlBsYW5bXTtcbn1cblxuLyoqXG4gKiBIYW5kb2ZmIHBsYW4gZm9yIGludGVyLWFnZW50IGRlbGVnYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIYW5kb2ZmUGxhbiB7XG4gICAgZnJvbUFnZW50OiBBZ2VudFR5cGU7XG4gICAgdG9BZ2VudDogQWdlbnRUeXBlO1xuICAgIGNvbmRpdGlvbjogc3RyaW5nO1xuICAgIGNvbnRleHRUcmFuc2Zlcjogc3RyaW5nW107XG59XG5cbi8qKlxuICogUmV2aWV3IHJlc3VsdCBmcm9tIHF1YWxpdHkgZmVlZGJhY2sgbG9vcFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1Jlc3VsdCB7XG4gICAgYXBwcm92ZWQ6IGJvb2xlYW47XG4gICAgZmVlZGJhY2s6IHN0cmluZztcbiAgICBzdWdnZXN0ZWRJbXByb3ZlbWVudHM6IHN0cmluZ1tdO1xuICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbn1cblxuLyoqXG4gKiBNZW1vcnkgZW50cnkgZm9yIGNvbnRleHQgZW52ZWxvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZW1vcnlFbnRyeSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBcImRlY2xhcmF0aXZlXCIgfCBcInByb2NlZHVyYWxcIiB8IFwiZXBpc29kaWNcIjtcbiAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgcHJvdmVuYW5jZToge1xuICAgICAgICBzb3VyY2U6IFwidXNlclwiIHwgXCJhZ2VudFwiIHwgXCJpbmZlcnJlZFwiO1xuICAgICAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICAgICAgY29uZmlkZW5jZTogbnVtYmVyO1xuICAgICAgICBjb250ZXh0OiBzdHJpbmc7XG4gICAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICB9O1xuICAgIHRhZ3M6IHN0cmluZ1tdO1xuICAgIGxhc3RBY2Nlc3NlZDogc3RyaW5nO1xuICAgIGFjY2Vzc0NvdW50OiBudW1iZXI7XG59XG5cbi8qKlxuICogQ29udGV4dCBlbnZlbG9wZSBmb3IgcGFzc2luZyBzdGF0ZSBiZXR3ZWVuIGFnZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHRFbnZlbG9wZSB7XG4gICAgLy8gU2Vzc2lvbiBzdGF0ZVxuICAgIHNlc3Npb246IHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgcGFyZW50SUQ/OiBzdHJpbmc7IC8vIFBhcmVudCBzZXNzaW9uIElEIGZvciBuZXN0ZWQgc3ViYWdlbnQgY2FsbHNcbiAgICAgICAgYWN0aXZlRmlsZXM6IHN0cmluZ1tdO1xuICAgICAgICBwZW5kaW5nVGFza3M6IFRhc2tbXTsgLy8gVGFzayBvYmplY3RzIGZyb20gY29udGV4dC90eXBlc1xuICAgICAgICBkZWNpc2lvbnM6IERlY2lzaW9uW107IC8vIERlY2lzaW9uIG9iamVjdHMgZnJvbSBjb250ZXh0L3R5cGVzXG4gICAgfTtcblxuICAgIC8vIFJlbGV2YW50IG1lbW9yaWVzXG4gICAgbWVtb3JpZXM6IHtcbiAgICAgICAgZGVjbGFyYXRpdmU6IE1lbW9yeUVudHJ5W107IC8vIEZhY3RzLCBwYXR0ZXJuc1xuICAgICAgICBwcm9jZWR1cmFsOiBNZW1vcnlFbnRyeVtdOyAvLyBXb3JrZmxvd3MsIHByb2NlZHVyZXNcbiAgICAgICAgZXBpc29kaWM6IE1lbW9yeUVudHJ5W107IC8vIFBhc3QgZXZlbnRzXG4gICAgfTtcblxuICAgIC8vIFByZXZpb3VzIGFnZW50IHJlc3VsdHMgKGZvciBoYW5kb2ZmcylcbiAgICBwcmV2aW91c1Jlc3VsdHM6IHtcbiAgICAgICAgYWdlbnRUeXBlOiBBZ2VudFR5cGUgfCBzdHJpbmc7XG4gICAgICAgIG91dHB1dDogdW5rbm93bjtcbiAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsIHwgc3RyaW5nO1xuICAgIH1bXTtcblxuICAgIC8vIFRhc2stc3BlY2lmaWMgY29udGV4dFxuICAgIHRhc2tDb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgIC8vIE1ldGFkYXRhXG4gICAgbWV0YToge1xuICAgICAgICByZXF1ZXN0SWQ6IHN0cmluZztcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlO1xuICAgICAgICBkZXB0aDogbnVtYmVyOyAvLyBIb3cgbWFueSBoYW5kb2ZmcyBkZWVwXG4gICAgICAgIG1lcmdlZEZyb20/OiBudW1iZXI7IC8vIE51bWJlciBvZiBlbnZlbG9wZXMgbWVyZ2VkXG4gICAgICAgIG1lcmdlU3RyYXRlZ3k/OiBzdHJpbmc7IC8vIFN0cmF0ZWd5IHVzZWQgZm9yIG1lcmdpbmdcbiAgICB9O1xufVxuXG4vKipcbiAqIExvY2FsIG9wZXJhdGlvbiBmb3IgZmlsZS1iYXNlZCB0YXNrc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsT3BlcmF0aW9uIHtcbiAgICBvcGVyYXRpb246IFwiZ2xvYlwiIHwgXCJncmVwXCIgfCBcInJlYWRcIiB8IFwic3RhdFwiO1xuICAgIHBhdHRlcm4/OiBzdHJpbmc7XG4gICAgaW5jbHVkZT86IHN0cmluZztcbiAgICBjd2Q/OiBzdHJpbmc7XG4gICAgb3B0aW9ucz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiBsb2NhbCBvcGVyYXRpb24gZXhlY3V0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxSZXN1bHQge1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgZGF0YT86IHVua25vd247XG4gICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQVVBO0FBQ0E7OztBQ0RPLElBQUs7QUFBQSxDQUFMLENBQUssZUFBTDtBQUFBLEVBRUgsa0NBQW9CO0FBQUEsRUFDcEIsa0NBQW9CO0FBQUEsRUFDcEIsdUNBQXlCO0FBQUEsRUFHekIsa0NBQW9CO0FBQUEsRUFDcEIscUNBQXVCO0FBQUEsRUFDdkIscUNBQXVCO0FBQUEsRUFDdkIsbUNBQXFCO0FBQUEsRUFDckIseUJBQVc7QUFBQSxFQUdYLDhCQUFnQjtBQUFBLEVBQ2hCLCtCQUFpQjtBQUFBLEVBQ2pCLGlDQUFtQjtBQUFBLEVBQ25CLHFDQUF1QjtBQUFBLEVBR3ZCLG9DQUFzQjtBQUFBLEVBQ3RCLGtDQUFvQjtBQUFBLEVBQ3BCLCtCQUFpQjtBQUFBLEVBR2pCLDRCQUFjO0FBQUEsRUFDZCw0QkFBYztBQUFBLEVBR2QsK0JBQWlCO0FBQUEsRUFDakIsaUNBQW1CO0FBQUEsRUFHbkIsOEJBQWdCO0FBQUEsRUFDaEIsZ0NBQWtCO0FBQUEsRUFDbEIsOEJBQWdCO0FBQUEsRUFDaEIsNkJBQWU7QUFBQSxFQUNmLGlDQUFtQjtBQUFBLEdBckNYOzs7QURJTCxNQUFNLGNBQWM7QUFBQSxFQUNmLFNBQTBDLElB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LGdCQUFnQixJQUFJLFVBQVUsR0FBRyxLQUFLLE1BQU0sSUFBSTtBQUFBLElBQ3pEO0FBQUE7QUFBQSxFQUdJLGFBQWEsQ0FBQyxPQUE4QjtBQUFBLElBQ2hELEtBQUssYUFBYSxJQUFJLE1BQU0sTUFBTSxNQUFNLFFBQVE7QUFBQTtBQUFBLEVBR3BELEdBQUcsQ0FBQyxNQUE4QztBQUFBLElBQzlDLE9BQU8sS0FBSyxPQUFPLElBQUksSUFBSTtBQUFBO0FBQUEsRUFHL0IsWUFBWSxHQUFzQjtBQUFBLElBQzlCLE9BQU8sTUFBTSxLQUFLLEtBQUssT0FBTyxPQUFPLENBQUM7QUFBQTtBQUFBLEVBRzFDLGdCQUFnQixDQUFDLFlBQWlDO0FBQUEsSUFDOUMsT0FBTyxLQUFLLGdCQUFnQixJQUFJLFVBQVUsS0FBSyxDQUFDO0FBQUE7QUFBQSxFQUdwRCxrQkFBa0IsQ0FBQyxjQUF3QixXQUFXLEdBQWdCO0FBQUEsSUFDbEUsTUFBTSxjQUFjLElBQUk7QUFBQSxJQUV4QixXQUFXLGNBQWMsY0FBYztBQUFBLE1BQ25DLE1BQU0sU0FBUyxLQUFLLGdCQUFnQixJQUFJLFVBQVUsS0FBSyxDQUFDO0FBQUEsTUFDeEQsV0FBVyxTQUFTLFFBQVE7QUFBQSxRQUN4QixZQUFZLElBQUksUUFBUSxZQUFZLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztBQUFBLE1BQzVEO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTyxNQUFNLEtBQUssWUFBWSxRQUFRLENBQUMsRUFDbEMsT0FBTyxJQUFJLFdBQVcsU0FBUyxRQUFRLEVBQ3ZDLEtBQUssSUFBSSxPQUFPLE9BQU8sSUFBSSxDQUFDLEVBQzVCLElBQUksRUFBRSxXQUFXLEtBQUs7QUFBQTtBQUFBLEVBRy9CLFdBQVcsQ0FBQyxNQUE4QjtBQUFBLElBQ3RDLE9BQU8sS0FBSyxhQUFhLElBQUksSUFBSSxLQUFLLENBQUM7QUFBQTtBQUFBLEVBRzNDLGdCQUFnQixDQUFDLE1BQWlCLElBQXdCO0FBQUEsSUFDdEQsTUFBTSxXQUFXLEtBQUssYUFBYSxJQUFJLElBQUksS0FBSyxDQUFDO0FBQUEsSUFDakQsT0FBTyxTQUFTLFNBQVMsRUFBRTtBQUFBO0FBQUEsRUFHL0Isb0JBQW9CLEdBQTJCO0FBQUEsSUFDM0MsTUFBTSxVQUFrQyxDQUFDO0FBQUEsSUFDekMsWUFBWSxZQUFZLFdBQVcsS0FBSyxpQkFBaUI7QUFBQSxNQUNyRCxRQUFRLGNBQWMsT0FBTztBQUFBLElBQ2pDO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFFZjsiLAogICJkZWJ1Z0lkIjogIjkwM0EwNTlCM0JBODAwMzE2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
