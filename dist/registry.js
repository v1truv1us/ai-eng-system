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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FnZW50cy9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWdlbnRzL3R5cGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogQWdlbnRSZWdpc3RyeSAtIExvYWRzIGFuZCBtYW5hZ2VzIGFnZW50IGRlZmluaXRpb25zIGZyb20gLmNsYXVkZS1wbHVnaW4vXG4gKlxuICogS2V5IHJlc3BvbnNpYmlsaXRpZXM6XG4gKiAxLiBQYXJzZSBhZ2VudCBtYXJrZG93biBmaWxlcyB3aXRoIGZyb250bWF0dGVyXG4gKiAyLiBFeHRyYWN0IGNhcGFiaWxpdGllcyBmcm9tIGRlc2NyaXB0aW9uIGFuZCB0YWdzXG4gKiAzLiBNYXAgaW50ZW5kZWRfZm9sbG93dXBzIHRvIGhhbmRvZmYgcmVsYXRpb25zaGlwc1xuICogNC4gUHJvdmlkZSBjYXBhYmlsaXR5LWJhc2VkIHF1ZXJpZXNcbiAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZSwgcmVhZGRpciB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBleHRuYW1lLCBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgdHlwZSBBZ2VudERlZmluaXRpb24sIEFnZW50VHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZ2VudFJlZ2lzdHJ5IHtcbiAgICBwcml2YXRlIGFnZW50czogTWFwPEFnZW50VHlwZSwgQWdlbnREZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIGNhcGFiaWxpdHlJbmRleDogTWFwPHN0cmluZywgQWdlbnRUeXBlW10+ID0gbmV3IE1hcCgpO1xuICAgIHByaXZhdGUgaGFuZG9mZkdyYXBoOiBNYXA8QWdlbnRUeXBlLCBBZ2VudFR5cGVbXT4gPSBuZXcgTWFwKCk7XG5cbiAgICBhc3luYyBsb2FkRnJvbURpcmVjdG9yeShkaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKGRpcik7XG4gICAgICAgICAgICBjb25zdCBtYXJrZG93bkZpbGVzID0gZmlsZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChmaWxlKSA9PiBleHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCkgPT09IFwiLm1kXCIsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbWFya2Rvd25GaWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihkaXIsIGZpbGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFnZW50RGVmID0gYXdhaXQgdGhpcy5wYXJzZUFnZW50TWFya2Rvd24oZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhZ2VudERlZikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFnZW50cy5zZXQoYWdlbnREZWYudHlwZSwgYWdlbnREZWYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGV4Q2FwYWJpbGl0aWVzKGFnZW50RGVmKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleEhhbmRvZmZzKGFnZW50RGVmKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBsb2FkIGFnZW50cyBmcm9tIGRpcmVjdG9yeSAke2Rpcn06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGFyc2VBZ2VudE1hcmtkb3duKFxuICAgICAgICBmaWxlUGF0aDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8QWdlbnREZWZpbml0aW9uIHwgbnVsbD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgY29uc3QgZnJvbnRtYXR0ZXJNYXRjaCA9IGNvbnRlbnQubWF0Y2goXG4gICAgICAgICAgICAgICAgL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS1cXG4oW1xcc1xcU10qKSQvLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCFmcm9udG1hdHRlck1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmcm9udG1hdHRlciBmb3JtYXRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXJNYXRjaFsxXTtcbiAgICAgICAgICAgIGNvbnN0IHByb21wdCA9IGZyb250bWF0dGVyTWF0Y2hbMl0udHJpbSgpO1xuXG4gICAgICAgICAgICAvLyBQYXJzZSBZQU1MLWxpa2UgZnJvbnRtYXR0ZXJcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wYXJzZUZyb250bWF0dGVyKGZyb250bWF0dGVyKTtcblxuICAgICAgICAgICAgY29uc3QgYWdlbnRUeXBlID0gdGhpcy5ub3JtYWxpemVBZ2VudFR5cGUobWV0YWRhdGEubmFtZSB8fCBcIlwiKTtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIGRlc2NyaXB0aW9uIGV4aXN0cyBhbmQgaXMgYSBzdHJpbmdcbiAgICAgICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IG1ldGFkYXRhLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkZXNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6IGFnZW50VHlwZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBtZXRhZGF0YS5uYW1lIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG1vZGU6IG1ldGFkYXRhLm1vZGUgfHwgXCJzdWJhZ2VudFwiLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiBtZXRhZGF0YS50ZW1wZXJhdHVyZSB8fCAwLjcsXG4gICAgICAgICAgICAgICAgY2FwYWJpbGl0aWVzOiB0aGlzLmV4dHJhY3RDYXBhYmlsaXRpZXMoXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YS50YWdzIHx8IFtdLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgaGFuZG9mZnM6IHRoaXMucGFyc2VIYW5kb2ZmcyhtZXRhZGF0YS5pbnRlbmRlZF9mb2xsb3d1cHMgfHwgXCJcIiksXG4gICAgICAgICAgICAgICAgdGFnczogbWV0YWRhdGEudGFncyB8fCBbXSxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogbWV0YWRhdGEuY2F0ZWdvcnkgfHwgXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgdG9vbHM6IG1ldGFkYXRhLnRvb2xzIHx8XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLnBlcm1pc3Npb24gfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2g6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJvbXB0UGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgcHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gQXZvaWQgbm9pc3kgbG9ncyBkdXJpbmcgdGVzdHMgb3Igd2hlbiBleHBsaWNpdGx5IHNpbGVuY2VkLlxuICAgICAgICAgICAgY29uc3Qgc2lsZW50ID1cbiAgICAgICAgICAgICAgICBwcm9jZXNzLmVudi5BSV9FTkdfU0lMRU5UID09PSBcIjFcIiB8fFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW52LkFJX0VOR19TSUxFTlQgPT09IFwidHJ1ZVwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwidGVzdFwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwiMVwiIHx8XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQlVOX1RFU1QgPT09IFwidHJ1ZVwiO1xuXG4gICAgICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHBhcnNpbmcgJHtmaWxlUGF0aH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjsgLy8gUmUtdGhyb3cgaW5zdGVhZCBvZiByZXR1cm5pbmcgbnVsbCBmb3IgdGVzdHNcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VGcm9udG1hdHRlcihmcm9udG1hdHRlcjogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZnJvbnRtYXR0ZXIuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgICAgICBsZXQgY3VycmVudEtleSA9IFwiXCI7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWUgPSBcIlwiO1xuICAgICAgICBsZXQgaW5kZW50TGV2ZWwgPSAwO1xuICAgICAgICBsZXQgbmVzdGVkT2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgbGluZUluZGVudCA9IGxpbmUubGVuZ3RoIC0gbGluZS50cmltU3RhcnQoKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmICh0cmltbWVkID09PSBcIlwiKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGtleTogdmFsdWUgcGF0dGVyblxuICAgICAgICAgICAgY29uc3Qga2V5VmFsdWVNYXRjaCA9IHRyaW1tZWQubWF0Y2goL14oW146XSspOlxccyooLiopJC8pO1xuICAgICAgICAgICAgaWYgKGtleVZhbHVlTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHByZXZpb3VzIGtleS12YWx1ZSBpZiBleGlzdHNcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEtleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmVzdGVkT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3RbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLnRyaW0oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjdXJyZW50S2V5ID0ga2V5VmFsdWVNYXRjaFsxXS50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVQYXJ0ID0ga2V5VmFsdWVNYXRjaFsyXS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBuZXN0ZWQgb2JqZWN0IGZvciB0b3AtbGV2ZWwga2V5c1xuICAgICAgICAgICAgICAgIGlmIChsaW5lSW5kZW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZE9iamVjdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBzdGFydHMgYSBuZXN0ZWQgb2JqZWN0XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlUGFydCA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb29rIGFoZWFkIHRvIHNlZSBpZiB0aGlzIGlzIGEgbmVzdGVkIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaiA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBqIDwgbGluZXMubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAobGluZXNbal0udHJpbSgpID09PSBcIlwiIHx8IGxpbmVzW2pdLm1hdGNoKC9eXFxzKy8pKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lc1tqXS50cmltKCkgIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRMaW5lcy5wdXNoKGxpbmVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZExpbmVzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZExpbmVzWzBdLm1hdGNoKC9eXFxzK1teLVxcc10vKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBuZXN0ZWQgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjdXJyZW50S2V5XSA9IG5lc3RlZE9iamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRLZXkgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgbmVzdGVkIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5lc3RlZExpbmUgb2YgbmVzdGVkTGluZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRNYXRjaCA9IG5lc3RlZExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWF0Y2goL14oW146XSspOlxccyooLiopJC8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbXywgbmVzdGVkS2V5LCBuZXN0ZWRWYWx1ZV0gPSBuZXN0ZWRNYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkT2JqZWN0W25lc3RlZEtleS50cmltKCldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWYWx1ZShuZXN0ZWRWYWx1ZS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBqIC0gMTsgLy8gU2tpcCBwcm9jZXNzZWQgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbWlnaHQgYmUgYSBsaXN0IG9yIG11bHRpLWxpbmUgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCA9IGxpbmVJbmRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZVBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudExldmVsID0gbGluZUluZGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRLZXkgJiYgbGluZUluZGVudCA+IGluZGVudExldmVsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29udGludWF0aW9uIG9mIG11bHRpLWxpbmUgdmFsdWVcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgKz0gKGN1cnJlbnRWYWx1ZSA/IFwiXFxuXCIgOiBcIlwiKSArIGxpbmUudHJpbVN0YXJ0KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIGN1cnJlbnRLZXkgJiZcbiAgICAgICAgICAgICAgICBsaW5lSW5kZW50IDw9IGluZGVudExldmVsICYmXG4gICAgICAgICAgICAgICAgdHJpbW1lZCAhPT0gXCJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gRW5kIG9mIGN1cnJlbnQgdmFsdWUsIHNhdmUgaXRcbiAgICAgICAgICAgICAgICBpZiAobmVzdGVkT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZE9iamVjdFtjdXJyZW50S2V5XSA9IHRoaXMucGFyc2VWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZS50cmltKCksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2N1cnJlbnRLZXldID0gdGhpcy5wYXJzZVZhbHVlKGN1cnJlbnRWYWx1ZS50cmltKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50S2V5ID0gXCJcIjtcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSBmaW5hbCBrZXktdmFsdWVcbiAgICAgICAgaWYgKGN1cnJlbnRLZXkpIHtcbiAgICAgICAgICAgIGlmIChuZXN0ZWRPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRPYmplY3RbY3VycmVudEtleV0gPSB0aGlzLnBhcnNlVmFsdWUoY3VycmVudFZhbHVlLnRyaW0oKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtjdXJyZW50S2V5XSA9IHRoaXMucGFyc2VWYWx1ZShjdXJyZW50VmFsdWUudHJpbSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyBIYW5kbGUgYm9vbGVhbiB2YWx1ZXNcbiAgICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gXCJmYWxzZVwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gSGFuZGxlIG51bWJlcnNcbiAgICAgICAgY29uc3QgbnVtVmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGlmICghTnVtYmVyLmlzTmFOKG51bVZhbHVlKSAmJiBOdW1iZXIuaXNGaW5pdGUobnVtVmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtVmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgYXJyYXlzIChjb21tYS1zZXBhcmF0ZWQpXG4gICAgICAgIGlmICh2YWx1ZS5pbmNsdWRlcyhcIixcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChzKSA9PiBzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV4dHJhY3RDYXBhYmlsaXRpZXMoZGVzY3JpcHRpb246IHN0cmluZywgdGFnczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNhcGFiaWxpdGllczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBFeHRyYWN0IGZyb20gZGVzY3JpcHRpb25cbiAgICAgICAgY29uc3QgZGVzY0xvd2VyID0gZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCBjYXBhYmlsaXR5S2V5d29yZHMgPSBbXG4gICAgICAgICAgICBcImNvZGUtcmV2aWV3XCIsXG4gICAgICAgICAgICBcImNvZGUgcmV2aWV3XCIsXG4gICAgICAgICAgICBcInNlY3VyaXR5XCIsXG4gICAgICAgICAgICBcInBlcmZvcm1hbmNlXCIsXG4gICAgICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICAgICAgXCJmcm9udGVuZFwiLFxuICAgICAgICAgICAgXCJiYWNrZW5kXCIsXG4gICAgICAgICAgICBcInRlc3RpbmdcIixcbiAgICAgICAgICAgIFwiZGVwbG95bWVudFwiLFxuICAgICAgICAgICAgXCJtb25pdG9yaW5nXCIsXG4gICAgICAgICAgICBcIm9wdGltaXphdGlvblwiLFxuICAgICAgICAgICAgXCJhaVwiLFxuICAgICAgICAgICAgXCJtbFwiLFxuICAgICAgICAgICAgXCJzZW9cIixcbiAgICAgICAgICAgIFwiZGF0YWJhc2VcIixcbiAgICAgICAgICAgIFwiYXBpXCIsXG4gICAgICAgICAgICBcImluZnJhc3RydWN0dXJlXCIsXG4gICAgICAgICAgICBcImRldm9wc1wiLFxuICAgICAgICAgICAgXCJxdWFsaXR5XCIsXG4gICAgICAgICAgICBcImFuYWx5c2lzXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGNhcGFiaWxpdHlLZXl3b3Jkcykge1xuICAgICAgICAgICAgaWYgKGRlc2NMb3dlci5pbmNsdWRlcyhrZXl3b3JkKSkge1xuICAgICAgICAgICAgICAgIGNhcGFiaWxpdGllcy5wdXNoKGtleXdvcmQucmVwbGFjZShcIiBcIiwgXCItXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBmcm9tIHRhZ3NcbiAgICAgICAgY2FwYWJpbGl0aWVzLnB1c2goLi4udGFncyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICAgICAgcmV0dXJuIFsuLi5uZXcgU2V0KGNhcGFiaWxpdGllcyldO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VIYW5kb2ZmcyhpbnRlbmRlZEZvbGxvd3Vwczogc3RyaW5nIHwgc3RyaW5nW10pOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIGNvbnN0IGZvbGxvd3VwcyA9IEFycmF5LmlzQXJyYXkoaW50ZW5kZWRGb2xsb3d1cHMpXG4gICAgICAgICAgICA/IGludGVuZGVkRm9sbG93dXBzXG4gICAgICAgICAgICA6IGludGVuZGVkRm9sbG93dXBzXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHMpID0+IHMpO1xuXG4gICAgICAgIHJldHVybiBmb2xsb3d1cHNcbiAgICAgICAgICAgIC5tYXAoKGZvbGxvd3VwKSA9PiB0aGlzLm5vcm1hbGl6ZUFnZW50VHlwZShmb2xsb3d1cCkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0eXBlKSA9PiB0eXBlICE9PSBudWxsKSBhcyBBZ2VudFR5cGVbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vcm1hbGl6ZUFnZW50VHlwZShuYW1lOiBzdHJpbmcpOiBBZ2VudFR5cGUge1xuICAgICAgICAvLyBDb252ZXJ0IHZhcmlvdXMgZm9ybWF0cyB0byBBZ2VudFR5cGUgZW51bVxuICAgICAgICBjb25zdCBub3JtYWxpemVkID0gbmFtZVxuICAgICAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiLVwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teYS16LV0vZywgXCJcIik7XG5cbiAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIGFnYWluc3QgZW51bSB2YWx1ZXNcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBPYmplY3QudmFsdWVzKEFnZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbm9ybWFsaXplZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSBhcyBBZ2VudFR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcnkgcGFydGlhbCBtYXRjaGVzIGZvciBjb21tb24gdmFyaWF0aW9uc1xuICAgICAgICBjb25zdCBwYXJ0aWFsTWF0Y2hlczogUmVjb3JkPHN0cmluZywgQWdlbnRUeXBlPiA9IHtcbiAgICAgICAgICAgIGZ1bGxzdGFjazogQWdlbnRUeXBlLkZVTExfU1RBQ0tfREVWRUxPUEVSLFxuICAgICAgICAgICAgXCJmdWxsLXN0YWNrXCI6IEFnZW50VHlwZS5GVUxMX1NUQUNLX0RFVkVMT1BFUixcbiAgICAgICAgICAgIFwiYXBpLWJ1aWxkZXJcIjogQWdlbnRUeXBlLkFQSV9CVUlMREVSX0VOSEFOQ0VELFxuICAgICAgICAgICAgamF2YTogQWdlbnRUeXBlLkpBVkFfUFJPLFxuICAgICAgICAgICAgbWw6IEFnZW50VHlwZS5NTF9FTkdJTkVFUixcbiAgICAgICAgICAgIFwibWFjaGluZS1sZWFybmluZ1wiOiBBZ2VudFR5cGUuTUxfRU5HSU5FRVIsXG4gICAgICAgICAgICBhaTogQWdlbnRUeXBlLkFJX0VOR0lORUVSLFxuICAgICAgICAgICAgbW9uaXRvcmluZzogQWdlbnRUeXBlLk1PTklUT1JJTkdfRVhQRVJULFxuICAgICAgICAgICAgZGVwbG95bWVudDogQWdlbnRUeXBlLkRFUExPWU1FTlRfRU5HSU5FRVIsXG4gICAgICAgICAgICBjb3N0OiBBZ2VudFR5cGUuQ09TVF9PUFRJTUlaRVIsXG4gICAgICAgICAgICBkYXRhYmFzZTogQWdlbnRUeXBlLkRBVEFCQVNFX09QVElNSVpFUixcbiAgICAgICAgICAgIGluZnJhc3RydWN0dXJlOiBBZ2VudFR5cGUuSU5GUkFTVFJVQ1RVUkVfQlVJTERFUixcbiAgICAgICAgICAgIHNlbzogQWdlbnRUeXBlLlNFT19TUEVDSUFMSVNULFxuICAgICAgICAgICAgcHJvbXB0OiBBZ2VudFR5cGUuUFJPTVBUX09QVElNSVpFUixcbiAgICAgICAgICAgIGFnZW50OiBBZ2VudFR5cGUuQUdFTlRfQ1JFQVRPUixcbiAgICAgICAgICAgIGNvbW1hbmQ6IEFnZW50VHlwZS5DT01NQU5EX0NSRUFUT1IsXG4gICAgICAgICAgICBza2lsbDogQWdlbnRUeXBlLlNLSUxMX0NSRUFUT1IsXG4gICAgICAgICAgICB0b29sOiBBZ2VudFR5cGUuVE9PTF9DUkVBVE9SLFxuICAgICAgICAgICAgcGx1Z2luOiBBZ2VudFR5cGUuUExVR0lOX1ZBTElEQVRPUixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcGFydGlhbE1hdGNoZXNbbm9ybWFsaXplZF0gfHwgQWdlbnRUeXBlLkNPREVfUkVWSUVXRVI7IC8vIGZhbGxiYWNrXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbmRleENhcGFiaWxpdGllcyhhZ2VudDogQWdlbnREZWZpbml0aW9uKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgY2FwYWJpbGl0eSBvZiBhZ2VudC5jYXBhYmlsaXRpZXMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYXBhYmlsaXR5SW5kZXguaGFzKGNhcGFiaWxpdHkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXBhYmlsaXR5SW5kZXguc2V0KGNhcGFiaWxpdHksIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2FwYWJpbGl0eUluZGV4LmdldChjYXBhYmlsaXR5KT8ucHVzaChhZ2VudC50eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5kZXhIYW5kb2ZmcyhhZ2VudDogQWdlbnREZWZpbml0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGFuZG9mZkdyYXBoLnNldChhZ2VudC50eXBlLCBhZ2VudC5oYW5kb2Zmcyk7XG4gICAgfVxuXG4gICAgZ2V0KHR5cGU6IEFnZW50VHlwZSk6IEFnZW50RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50cy5nZXQodHlwZSk7XG4gICAgfVxuXG4gICAgZ2V0QWxsQWdlbnRzKCk6IEFnZW50RGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hZ2VudHMudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIGZpbmRCeUNhcGFiaWxpdHkoY2FwYWJpbGl0eTogc3RyaW5nKTogQWdlbnRUeXBlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXBhYmlsaXR5SW5kZXguZ2V0KGNhcGFiaWxpdHkpIHx8IFtdO1xuICAgIH1cblxuICAgIGZpbmRCeUNhcGFiaWxpdGllcyhjYXBhYmlsaXRpZXM6IHN0cmluZ1tdLCBtaW5NYXRjaCA9IDEpOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIGNvbnN0IGFnZW50U2NvcmVzID0gbmV3IE1hcDxBZ2VudFR5cGUsIG51bWJlcj4oKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNhcGFiaWxpdHkgb2YgY2FwYWJpbGl0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCBhZ2VudHMgPSB0aGlzLmNhcGFiaWxpdHlJbmRleC5nZXQoY2FwYWJpbGl0eSkgfHwgW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFnZW50IG9mIGFnZW50cykge1xuICAgICAgICAgICAgICAgIGFnZW50U2NvcmVzLnNldChhZ2VudCwgKGFnZW50U2NvcmVzLmdldChhZ2VudCkgfHwgMCkgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGFnZW50U2NvcmVzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKFssIHNjb3JlXSkgPT4gc2NvcmUgPj0gbWluTWF0Y2gpXG4gICAgICAgICAgICAuc29ydCgoWywgYV0sIFssIGJdKSA9PiBiIC0gYSlcbiAgICAgICAgICAgIC5tYXAoKFthZ2VudF0pID0+IGFnZW50KTtcbiAgICB9XG5cbiAgICBnZXRIYW5kb2Zmcyh0eXBlOiBBZ2VudFR5cGUpOiBBZ2VudFR5cGVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRvZmZHcmFwaC5nZXQodHlwZSkgfHwgW107XG4gICAgfVxuXG4gICAgaXNIYW5kb2ZmQWxsb3dlZChmcm9tOiBBZ2VudFR5cGUsIHRvOiBBZ2VudFR5cGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgaGFuZG9mZnMgPSB0aGlzLmhhbmRvZmZHcmFwaC5nZXQoZnJvbSkgfHwgW107XG4gICAgICAgIHJldHVybiBoYW5kb2Zmcy5pbmNsdWRlcyh0byk7XG4gICAgfVxuXG4gICAgZ2V0Q2FwYWJpbGl0eVN1bW1hcnkoKTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IHN1bW1hcnk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbY2FwYWJpbGl0eSwgYWdlbnRzXSBvZiB0aGlzLmNhcGFiaWxpdHlJbmRleCkge1xuICAgICAgICAgICAgc3VtbWFyeVtjYXBhYmlsaXR5XSA9IGFnZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1bW1hcnk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIEFnZW50IG9yY2hlc3RyYXRpb24gdHlwZXMgYW5kIGludGVyZmFjZXMgZm9yIHRoZSBGZXJnIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIERlZmluZXMgdGhlIGNvcmUgYWJzdHJhY3Rpb25zIGZvciBhZ2VudCBjb29yZGluYXRpb24gYW5kIGV4ZWN1dGlvbi5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IERlY2lzaW9uLCBUYXNrIH0gZnJvbSBcIi4uL2NvbnRleHQvdHlwZXNcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGRpZmZlcmVudCB0eXBlcyBvZiBhZ2VudHMgYXZhaWxhYmxlIGluIHRoZSBzeXN0ZW1cbiAqL1xuZXhwb3J0IGVudW0gQWdlbnRUeXBlIHtcbiAgICAvLyBBcmNoaXRlY3R1cmUgJiBQbGFubmluZ1xuICAgIEFSQ0hJVEVDVF9BRFZJU09SID0gXCJhcmNoaXRlY3QtYWR2aXNvclwiLFxuICAgIEJBQ0tFTkRfQVJDSElURUNUID0gXCJiYWNrZW5kLWFyY2hpdGVjdFwiLFxuICAgIElORlJBU1RSVUNUVVJFX0JVSUxERVIgPSBcImluZnJhc3RydWN0dXJlLWJ1aWxkZXJcIixcblxuICAgIC8vIERldmVsb3BtZW50ICYgQ29kaW5nXG4gICAgRlJPTlRFTkRfUkVWSUVXRVIgPSBcImZyb250ZW5kLXJldmlld2VyXCIsXG4gICAgRlVMTF9TVEFDS19ERVZFTE9QRVIgPSBcImZ1bGwtc3RhY2stZGV2ZWxvcGVyXCIsXG4gICAgQVBJX0JVSUxERVJfRU5IQU5DRUQgPSBcImFwaS1idWlsZGVyLWVuaGFuY2VkXCIsXG4gICAgREFUQUJBU0VfT1BUSU1JWkVSID0gXCJkYXRhYmFzZS1vcHRpbWl6ZXJcIixcbiAgICBKQVZBX1BSTyA9IFwiamF2YS1wcm9cIixcblxuICAgIC8vIFF1YWxpdHkgJiBUZXN0aW5nXG4gICAgQ09ERV9SRVZJRVdFUiA9IFwiY29kZS1yZXZpZXdlclwiLFxuICAgIFRFU1RfR0VORVJBVE9SID0gXCJ0ZXN0LWdlbmVyYXRvclwiLFxuICAgIFNFQ1VSSVRZX1NDQU5ORVIgPSBcInNlY3VyaXR5LXNjYW5uZXJcIixcbiAgICBQRVJGT1JNQU5DRV9FTkdJTkVFUiA9IFwicGVyZm9ybWFuY2UtZW5naW5lZXJcIixcblxuICAgIC8vIERldk9wcyAmIERlcGxveW1lbnRcbiAgICBERVBMT1lNRU5UX0VOR0lORUVSID0gXCJkZXBsb3ltZW50LWVuZ2luZWVyXCIsXG4gICAgTU9OSVRPUklOR19FWFBFUlQgPSBcIm1vbml0b3JpbmctZXhwZXJ0XCIsXG4gICAgQ09TVF9PUFRJTUlaRVIgPSBcImNvc3Qtb3B0aW1pemVyXCIsXG5cbiAgICAvLyBBSSAmIE1hY2hpbmUgTGVhcm5pbmdcbiAgICBBSV9FTkdJTkVFUiA9IFwiYWktZW5naW5lZXJcIixcbiAgICBNTF9FTkdJTkVFUiA9IFwibWwtZW5naW5lZXJcIixcblxuICAgIC8vIENvbnRlbnQgJiBTRU9cbiAgICBTRU9fU1BFQ0lBTElTVCA9IFwic2VvLXNwZWNpYWxpc3RcIixcbiAgICBQUk9NUFRfT1BUSU1JWkVSID0gXCJwcm9tcHQtb3B0aW1pemVyXCIsXG5cbiAgICAvLyBQbHVnaW4gRGV2ZWxvcG1lbnRcbiAgICBBR0VOVF9DUkVBVE9SID0gXCJhZ2VudC1jcmVhdG9yXCIsXG4gICAgQ09NTUFORF9DUkVBVE9SID0gXCJjb21tYW5kLWNyZWF0b3JcIixcbiAgICBTS0lMTF9DUkVBVE9SID0gXCJza2lsbC1jcmVhdG9yXCIsXG4gICAgVE9PTF9DUkVBVE9SID0gXCJ0b29sLWNyZWF0b3JcIixcbiAgICBQTFVHSU5fVkFMSURBVE9SID0gXCJwbHVnaW4tdmFsaWRhdG9yXCIsXG59XG5cbi8qKlxuICogRXhlY3V0aW9uIHN0cmF0ZWdpZXMgZm9yIGFnZW50IGNvb3JkaW5hdGlvblxuICovXG5leHBvcnQgZW51bSBFeGVjdXRpb25TdHJhdGVneSB7XG4gICAgUEFSQUxMRUwgPSBcInBhcmFsbGVsXCIsXG4gICAgU0VRVUVOVElBTCA9IFwic2VxdWVudGlhbFwiLFxuICAgIENPTkRJVElPTkFMID0gXCJjb25kaXRpb25hbFwiLFxufVxuXG4vKipcbiAqIENvbmZpZGVuY2UgbGV2ZWwgZm9yIGFnZW50IHJlc3VsdHNcbiAqL1xuZXhwb3J0IGVudW0gQ29uZmlkZW5jZUxldmVsIHtcbiAgICBMT1cgPSBcImxvd1wiLFxuICAgIE1FRElVTSA9IFwibWVkaXVtXCIsXG4gICAgSElHSCA9IFwiaGlnaFwiLFxuICAgIFZFUllfSElHSCA9IFwidmVyeV9oaWdoXCIsXG59XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBhZ2VudCBpbnB1dHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudElucHV0IHtcbiAgICB0eXBlOiBBZ2VudFR5cGU7XG4gICAgY29udGV4dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgcGFyYW1ldGVycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG59XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBhZ2VudCBvdXRwdXRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRPdXRwdXQge1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xuICAgIHJlYXNvbmluZz86IHN0cmluZztcbiAgICBleGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNpbmdsZSBhZ2VudCB0YXNrIGluIGFuIGV4ZWN1dGlvbiBwbGFuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRUYXNrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBpbnB1dDogQWdlbnRJbnB1dDtcbiAgICBzdHJhdGVneTogRXhlY3V0aW9uU3RyYXRlZ3k7XG4gICAgLyoqIE9wdGlvbmFsIGNvbW1hbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBUYXNrIGludGVyZmFjZSAqL1xuICAgIGNvbW1hbmQ/OiBzdHJpbmc7XG4gICAgZGVwZW5kc09uPzogc3RyaW5nW107XG4gICAgdGltZW91dD86IG51bWJlcjtcbiAgICByZXRyeT86IHtcbiAgICAgICAgbWF4QXR0ZW1wdHM6IG51bWJlcjtcbiAgICAgICAgZGVsYXk6IG51bWJlcjtcbiAgICAgICAgYmFja29mZk11bHRpcGxpZXI6IG51bWJlcjtcbiAgICB9O1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiBleGVjdXRpbmcgYW4gYWdlbnQgdGFza1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50VGFza1Jlc3VsdCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBBZ2VudFR5cGU7XG4gICAgc3RhdHVzOiBBZ2VudFRhc2tTdGF0dXM7XG4gICAgb3V0cHV0PzogQWdlbnRPdXRwdXQ7XG4gICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIHN0YXJ0VGltZTogRGF0ZTtcbiAgICBlbmRUaW1lOiBEYXRlO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0YXR1cyBvZiBhbiBhZ2VudCB0YXNrXG4gKi9cbmV4cG9ydCBlbnVtIEFnZW50VGFza1N0YXR1cyB7XG4gICAgUEVORElORyA9IFwicGVuZGluZ1wiLFxuICAgIFJVTk5JTkcgPSBcInJ1bm5pbmdcIixcbiAgICBDT01QTEVURUQgPSBcImNvbXBsZXRlZFwiLFxuICAgIEZBSUxFRCA9IFwiZmFpbGVkXCIsXG4gICAgVElNRU9VVCA9IFwidGltZW91dFwiLFxuICAgIFNLSVBQRUQgPSBcInNraXBwZWRcIixcbn1cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBhZ2VudCBjb29yZGluYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudENvb3JkaW5hdG9yQ29uZmlnIHtcbiAgICBtYXhDb25jdXJyZW5jeTogbnVtYmVyO1xuICAgIGRlZmF1bHRUaW1lb3V0OiBudW1iZXI7XG4gICAgcmV0cnlBdHRlbXB0czogbnVtYmVyO1xuICAgIHJldHJ5RGVsYXk6IG51bWJlcjtcbiAgICBlbmFibGVDYWNoaW5nOiBib29sZWFuO1xuICAgIGxvZ0xldmVsOiBcImRlYnVnXCIgfCBcImluZm9cIiB8IFwid2FyblwiIHwgXCJlcnJvclwiO1xufVxuXG4vKipcbiAqIFJlc3VsdCBhZ2dyZWdhdGlvbiBzdHJhdGVneVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZ3JlZ2F0aW9uU3RyYXRlZ3kge1xuICAgIHR5cGU6XG4gICAgICAgIHwgXCJtZXJnZVwiXG4gICAgICAgIHwgXCJ2b3RlXCJcbiAgICAgICAgfCBcIndlaWdodGVkXCJcbiAgICAgICAgfCBcInByaW9yaXR5XCJcbiAgICAgICAgfCBcInBhcmFsbGVsXCJcbiAgICAgICAgfCBcInNlcXVlbnRpYWxcIjtcbiAgICB3ZWlnaHRzPzogUGFydGlhbDxSZWNvcmQ8QWdlbnRUeXBlLCBudW1iZXI+PjtcbiAgICBwcmlvcml0eT86IEFnZW50VHlwZVtdO1xuICAgIGNvbmZsaWN0UmVzb2x1dGlvbj86IFwiaGlnaGVzdF9jb25maWRlbmNlXCIgfCBcIm1vc3RfcmVjZW50XCIgfCBcIm1hbnVhbFwiO1xufVxuXG4vKipcbiAqIFBsYW4gZ2VuZXJhdGlvbiBzcGVjaWZpYyB0eXBlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5HZW5lcmF0aW9uSW5wdXQge1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgc2NvcGU/OiBzdHJpbmc7XG4gICAgcmVxdWlyZW1lbnRzPzogc3RyaW5nW107XG4gICAgY29uc3RyYWludHM/OiBzdHJpbmdbXTtcbiAgICBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbkdlbmVyYXRpb25PdXRwdXQge1xuICAgIHBsYW46IHtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgICAgICB0YXNrczogQWdlbnRUYXNrW107XG4gICAgICAgIGRlcGVuZGVuY2llczogc3RyaW5nW11bXTtcbiAgICB9O1xuICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbiAgICByZWFzb25pbmc6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uczogc3RyaW5nW107XG59XG5cbi8qKlxuICogQ29kZSByZXZpZXcgc3BlY2lmaWMgdHlwZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb2RlUmV2aWV3SW5wdXQge1xuICAgIGZpbGVzOiBzdHJpbmdbXTtcbiAgICByZXZpZXdUeXBlOiBcImZ1bGxcIiB8IFwiaW5jcmVtZW50YWxcIiB8IFwic2VjdXJpdHlcIiB8IFwicGVyZm9ybWFuY2VcIjtcbiAgICBzZXZlcml0eTogXCJsb3dcIiB8IFwibWVkaXVtXCIgfCBcImhpZ2hcIiB8IFwiY3JpdGljYWxcIjtcbiAgICBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVJldmlld0ZpbmRpbmcge1xuICAgIGZpbGU6IHN0cmluZztcbiAgICBsaW5lOiBudW1iZXI7XG4gICAgc2V2ZXJpdHk6IFwibG93XCIgfCBcIm1lZGl1bVwiIHwgXCJoaWdoXCIgfCBcImNyaXRpY2FsXCI7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgc3VnZ2VzdGlvbj86IHN0cmluZztcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG4gICAgYWdlbnQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVJldmlld091dHB1dCB7XG4gICAgZmluZGluZ3M6IENvZGVSZXZpZXdGaW5kaW5nW107XG4gICAgc3VtbWFyeToge1xuICAgICAgICB0b3RhbDogbnVtYmVyO1xuICAgICAgICBieVNldmVyaXR5OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICAgICAgICBieUNhdGVnb3J5OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICAgIH07XG4gICAgcmVjb21tZW5kYXRpb25zOiBzdHJpbmdbXTtcbiAgICBvdmVyYWxsU2NvcmU6IG51bWJlcjsgLy8gMC0xMDBcbn1cblxuLyoqXG4gKiBBZ2VudCBleGVjdXRpb24gY29udGV4dFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RXhlY3V0aW9uQ29udGV4dCB7XG4gICAgcGxhbklkOiBzdHJpbmc7XG4gICAgdGFza0lkOiBzdHJpbmc7XG4gICAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xuICAgIGVudmlyb25tZW50OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIG1ldGFkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqXG4gKiBFdmVudCB0eXBlcyBmb3IgYWdlbnQgY29vcmRpbmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRFdmVudCB7XG4gICAgdHlwZTpcbiAgICAgICAgfCBcInRhc2tfc3RhcnRlZFwiXG4gICAgICAgIHwgXCJ0YXNrX2NvbXBsZXRlZFwiXG4gICAgICAgIHwgXCJ0YXNrX2ZhaWxlZFwiXG4gICAgICAgIHwgXCJ0YXNrX3RpbWVvdXRcIlxuICAgICAgICB8IFwiYWdncmVnYXRpb25fc3RhcnRlZFwiXG4gICAgICAgIHwgXCJhZ2dyZWdhdGlvbl9jb21wbGV0ZWRcIjtcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKipcbiAqIFByb2dyZXNzIHRyYWNraW5nIGZvciBhZ2VudCBvcmNoZXN0cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRQcm9ncmVzcyB7XG4gICAgdG90YWxUYXNrczogbnVtYmVyO1xuICAgIGNvbXBsZXRlZFRhc2tzOiBudW1iZXI7XG4gICAgZmFpbGVkVGFza3M6IG51bWJlcjtcbiAgICBydW5uaW5nVGFza3M6IG51bWJlcjtcbiAgICBjdXJyZW50VGFzaz86IHN0cmluZztcbiAgICBlc3RpbWF0ZWRUaW1lUmVtYWluaW5nPzogbnVtYmVyO1xuICAgIHBlcmNlbnRhZ2VDb21wbGV0ZTogbnVtYmVyO1xufVxuXG4vKipcbiAqIEVycm9yIGhhbmRsaW5nIHR5cGVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRFcnJvciB7XG4gICAgdGFza0lkOiBzdHJpbmc7XG4gICAgYWdlbnRUeXBlOiBBZ2VudFR5cGU7XG4gICAgZXJyb3I6IHN0cmluZztcbiAgICByZWNvdmVyYWJsZTogYm9vbGVhbjtcbiAgICBzdWdnZXN0ZWRBY3Rpb24/OiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xufVxuXG4vKipcbiAqIFBlcmZvcm1hbmNlIG1ldHJpY3MgZm9yIGFnZW50IGV4ZWN1dGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50TWV0cmljcyB7XG4gICAgYWdlbnRUeXBlOiBBZ2VudFR5cGU7XG4gICAgZXhlY3V0aW9uQ291bnQ6IG51bWJlcjtcbiAgICBhdmVyYWdlRXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIHN1Y2Nlc3NSYXRlOiBudW1iZXI7XG4gICAgYXZlcmFnZUNvbmZpZGVuY2U6IG51bWJlcjtcbiAgICBsYXN0RXhlY3V0aW9uVGltZTogRGF0ZTtcbn1cblxuLyoqXG4gKiBBZ2VudCBkZWZpbml0aW9uIGxvYWRlZCBmcm9tIC5jbGF1ZGUtcGx1Z2luL2FnZW50cy9cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudERlZmluaXRpb24ge1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBtb2RlOiBcInN1YmFnZW50XCIgfCBcInRvb2xcIjtcbiAgICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xuICAgIGNhcGFiaWxpdGllczogc3RyaW5nW107XG4gICAgaGFuZG9mZnM6IEFnZW50VHlwZVtdO1xuICAgIHRhZ3M6IHN0cmluZ1tdO1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgdG9vbHM6IHtcbiAgICAgICAgcmVhZDogYm9vbGVhbjtcbiAgICAgICAgZ3JlcDogYm9vbGVhbjtcbiAgICAgICAgZ2xvYjogYm9vbGVhbjtcbiAgICAgICAgbGlzdDogYm9vbGVhbjtcbiAgICAgICAgYmFzaDogYm9vbGVhbjtcbiAgICAgICAgZWRpdDogYm9vbGVhbjtcbiAgICAgICAgd3JpdGU6IGJvb2xlYW47XG4gICAgICAgIHBhdGNoOiBib29sZWFuO1xuICAgIH07XG4gICAgcHJvbXB0UGF0aDogc3RyaW5nO1xuICAgIHByb21wdDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEFnZW50IGV4ZWN1dGlvbiByZWNvcmQgZm9yIHBlcnNpc3RlbmNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRFeGVjdXRpb24ge1xuICAgIHRhc2tJZDogc3RyaW5nO1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgb3V0cHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBjb25maWRlbmNlPzogQ29uZmlkZW5jZUxldmVsO1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogSW1wcm92ZW1lbnQgcmVjb3JkIGZvciBzZWxmLWltcHJvdmVtZW50IHN5c3RlbVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEltcHJvdmVtZW50UmVjb3JkIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IFwiYWdlbnRfcHJvbXB0XCIgfCBcImNhcGFiaWxpdHlcIiB8IFwiaGFuZG9mZlwiIHwgXCJ3b3JrZmxvd1wiO1xuICAgIHRhcmdldDogQWdlbnRUeXBlIHwgc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgZXZpZGVuY2U6IHN0cmluZ1tdO1xuICAgIHN1Z2dlc3RlZEF0OiBEYXRlO1xuICAgIGltcGxlbWVudGVkQXQ/OiBEYXRlO1xuICAgIGVmZmVjdGl2ZW5lc3NTY29yZT86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBIYW5kb2ZmIHJlY29yZCBmb3IgaW50ZXItYWdlbnQgY29tbXVuaWNhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhbmRvZmZSZWNvcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgZnJvbUFnZW50OiBBZ2VudFR5cGU7XG4gICAgdG9BZ2VudDogQWdlbnRUeXBlO1xuICAgIHJlYXNvbjogc3RyaW5nO1xuICAgIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbn1cblxuLyoqXG4gKiBFeGVjdXRpb24gbW9kZSBmb3IgaHlicmlkIFRhc2sgdG9vbCArIGxvY2FsIGV4ZWN1dGlvblxuICovXG5leHBvcnQgdHlwZSBFeGVjdXRpb25Nb2RlID0gXCJ0YXNrLXRvb2xcIiB8IFwibG9jYWxcIiB8IFwiaHlicmlkXCI7XG5cbi8qKlxuICogUm91dGluZyBkZWNpc2lvbiBmb3IgY2FwYWJpbGl0eS1iYXNlZCBhZ2VudCBzZWxlY3Rpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb3V0aW5nRGVjaXNpb24ge1xuICAgIHByaW1hcnlBZ2VudDogQWdlbnRUeXBlO1xuICAgIHN1cHBvcnRpbmdBZ2VudHM6IEFnZW50VHlwZVtdO1xuICAgIGV4ZWN1dGlvblN0cmF0ZWd5OiBcInBhcmFsbGVsXCIgfCBcInNlcXVlbnRpYWxcIiB8IFwiY29uZGl0aW9uYWxcIjtcbiAgICBleGVjdXRpb25Nb2RlOiBFeGVjdXRpb25Nb2RlO1xuICAgIGhhbmRvZmZQbGFuOiBIYW5kb2ZmUGxhbltdO1xufVxuXG4vKipcbiAqIEhhbmRvZmYgcGxhbiBmb3IgaW50ZXItYWdlbnQgZGVsZWdhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhbmRvZmZQbGFuIHtcbiAgICBmcm9tQWdlbnQ6IEFnZW50VHlwZTtcbiAgICB0b0FnZW50OiBBZ2VudFR5cGU7XG4gICAgY29uZGl0aW9uOiBzdHJpbmc7XG4gICAgY29udGV4dFRyYW5zZmVyOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBSZXZpZXcgcmVzdWx0IGZyb20gcXVhbGl0eSBmZWVkYmFjayBsb29wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmV2aWV3UmVzdWx0IHtcbiAgICBhcHByb3ZlZDogYm9vbGVhbjtcbiAgICBmZWVkYmFjazogc3RyaW5nO1xuICAgIHN1Z2dlc3RlZEltcHJvdmVtZW50czogc3RyaW5nW107XG4gICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xufVxuXG4vKipcbiAqIE1lbW9yeSBlbnRyeSBmb3IgY29udGV4dCBlbnZlbG9wZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lbW9yeUVudHJ5IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IFwiZGVjbGFyYXRpdmVcIiB8IFwicHJvY2VkdXJhbFwiIHwgXCJlcGlzb2RpY1wiO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBwcm92ZW5hbmNlOiB7XG4gICAgICAgIHNvdXJjZTogXCJ1c2VyXCIgfCBcImFnZW50XCIgfCBcImluZmVycmVkXCI7XG4gICAgICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgICAgICBjb25maWRlbmNlOiBudW1iZXI7XG4gICAgICAgIGNvbnRleHQ6IHN0cmluZztcbiAgICAgICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgIH07XG4gICAgdGFnczogc3RyaW5nW107XG4gICAgbGFzdEFjY2Vzc2VkOiBzdHJpbmc7XG4gICAgYWNjZXNzQ291bnQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBDb250ZXh0IGVudmVsb3BlIGZvciBwYXNzaW5nIHN0YXRlIGJldHdlZW4gYWdlbnRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dEVudmVsb3BlIHtcbiAgICAvLyBTZXNzaW9uIHN0YXRlXG4gICAgc2Vzc2lvbjoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBwYXJlbnRJRD86IHN0cmluZzsgLy8gUGFyZW50IHNlc3Npb24gSUQgZm9yIG5lc3RlZCBzdWJhZ2VudCBjYWxsc1xuICAgICAgICBhY3RpdmVGaWxlczogc3RyaW5nW107XG4gICAgICAgIHBlbmRpbmdUYXNrczogVGFza1tdOyAvLyBUYXNrIG9iamVjdHMgZnJvbSBjb250ZXh0L3R5cGVzXG4gICAgICAgIGRlY2lzaW9uczogRGVjaXNpb25bXTsgLy8gRGVjaXNpb24gb2JqZWN0cyBmcm9tIGNvbnRleHQvdHlwZXNcbiAgICB9O1xuXG4gICAgLy8gUmVsZXZhbnQgbWVtb3JpZXNcbiAgICBtZW1vcmllczoge1xuICAgICAgICBkZWNsYXJhdGl2ZTogTWVtb3J5RW50cnlbXTsgLy8gRmFjdHMsIHBhdHRlcm5zXG4gICAgICAgIHByb2NlZHVyYWw6IE1lbW9yeUVudHJ5W107IC8vIFdvcmtmbG93cywgcHJvY2VkdXJlc1xuICAgICAgICBlcGlzb2RpYzogTWVtb3J5RW50cnlbXTsgLy8gUGFzdCBldmVudHNcbiAgICB9O1xuXG4gICAgLy8gUHJldmlvdXMgYWdlbnQgcmVzdWx0cyAoZm9yIGhhbmRvZmZzKVxuICAgIHByZXZpb3VzUmVzdWx0czoge1xuICAgICAgICBhZ2VudFR5cGU6IEFnZW50VHlwZSB8IHN0cmluZztcbiAgICAgICAgb3V0cHV0OiB1bmtub3duO1xuICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwgfCBzdHJpbmc7XG4gICAgfVtdO1xuXG4gICAgLy8gVGFzay1zcGVjaWZpYyBjb250ZXh0XG4gICAgdGFza0NvbnRleHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gICAgLy8gTWV0YWRhdGFcbiAgICBtZXRhOiB7XG4gICAgICAgIHJlcXVlc3RJZDogc3RyaW5nO1xuICAgICAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgICAgIGRlcHRoOiBudW1iZXI7IC8vIEhvdyBtYW55IGhhbmRvZmZzIGRlZXBcbiAgICAgICAgbWVyZ2VkRnJvbT86IG51bWJlcjsgLy8gTnVtYmVyIG9mIGVudmVsb3BlcyBtZXJnZWRcbiAgICAgICAgbWVyZ2VTdHJhdGVneT86IHN0cmluZzsgLy8gU3RyYXRlZ3kgdXNlZCBmb3IgbWVyZ2luZ1xuICAgIH07XG59XG5cbi8qKlxuICogTG9jYWwgb3BlcmF0aW9uIGZvciBmaWxlLWJhc2VkIHRhc2tzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxPcGVyYXRpb24ge1xuICAgIG9wZXJhdGlvbjogXCJnbG9iXCIgfCBcImdyZXBcIiB8IFwicmVhZFwiIHwgXCJzdGF0XCI7XG4gICAgcGF0dGVybj86IHN0cmluZztcbiAgICBpbmNsdWRlPzogc3RyaW5nO1xuICAgIGN3ZD86IHN0cmluZztcbiAgICBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIGxvY2FsIG9wZXJhdGlvbiBleGVjdXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbFJlc3VsdCB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBkYXRhPzogdW5rbm93bjtcbiAgICBlcnJvcj86IHN0cmluZztcbiAgICBleGVjdXRpb25UaW1lOiBudW1iZXI7XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiO0FBVUE7QUFDQTs7O0FDRE8sSUFBSztBQUFBLENBQUwsQ0FBSyxlQUFMO0FBQUEsRUFFSCxrQ0FBb0I7QUFBQSxFQUNwQixrQ0FBb0I7QUFBQSxFQUNwQix1Q0FBeUI7QUFBQSxFQUd6QixrQ0FBb0I7QUFBQSxFQUNwQixxQ0FBdUI7QUFBQSxFQUN2QixxQ0FBdUI7QUFBQSxFQUN2QixtQ0FBcUI7QUFBQSxFQUNyQix5QkFBVztBQUFBLEVBR1gsOEJBQWdCO0FBQUEsRUFDaEIsK0JBQWlCO0FBQUEsRUFDakIsaUNBQW1CO0FBQUEsRUFDbkIscUNBQXVCO0FBQUEsRUFHdkIsb0NBQXNCO0FBQUEsRUFDdEIsa0NBQW9CO0FBQUEsRUFDcEIsK0JBQWlCO0FBQUEsRUFHakIsNEJBQWM7QUFBQSxFQUNkLDRCQUFjO0FBQUEsRUFHZCwrQkFBaUI7QUFBQSxFQUNqQixpQ0FBbUI7QUFBQSxFQUduQiw4QkFBZ0I7QUFBQSxFQUNoQixnQ0FBa0I7QUFBQSxFQUNsQiw4QkFBZ0I7QUFBQSxFQUNoQiw2QkFBZTtBQUFBLEVBQ2YsaUNBQW1CO0FBQUEsR0FyQ1g7OztBRElMLE1BQU0sY0FBYztBQUFBLEVBQ2YsU0FBMEMs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QUssZ0JBQWdCLElBQUksVUFBVSxHQUFHLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDekQ7QUFBQTtBQUFBLEVBR0ksYUFBYSxDQUFDLE9BQThCO0FBQUEsSUFDaEQsS0FBSyxhQUFhLElBQUksTUFBTSxNQUFNLE1BQU0sUUFBUTtBQUFBO0FBQUEsRUFHcEQsR0FBRyxDQUFDLE1BQThDO0FBQUEsSUFDOUMsT0FBTyxLQUFLLE9BQU8sSUFBSSxJQUFJO0FBQUE7QUFBQSxFQUcvQixZQUFZLEdBQXNCO0FBQUEsSUFDOUIsT0FBTyxNQUFNLEtBQUssS0FBSyxPQUFPLE9BQU8sQ0FBQztBQUFBO0FBQUEsRUFHMUMsZ0JBQWdCLENBQUMsWUFBaUM7QUFBQSxJQUM5QyxPQUFPLEtBQUssZ0JBQWdCLElBQUksVUFBVSxLQUFLLENBQUM7QUFBQTtBQUFBLEVBR3BELGtCQUFrQixDQUFDLGNBQXdCLFdBQVcsR0FBZ0I7QUFBQSxJQUNsRSxNQUFNLGNBQWMsSUFBSTtBQUFBLElBRXhCLFdBQVcsY0FBYyxjQUFjO0FBQUEsTUFDbkMsTUFBTSxTQUFTLEtBQUssZ0JBQWdCLElBQUksVUFBVSxLQUFLLENBQUM7QUFBQSxNQUN4RCxXQUFXLFNBQVMsUUFBUTtBQUFBLFFBQ3hCLFlBQVksSUFBSSxRQUFRLFlBQVksSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDO0FBQUEsTUFDNUQ7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFPLE1BQU0sS0FBSyxZQUFZLFFBQVEsQ0FBQyxFQUNsQyxPQUFPLElBQUksV0FBVyxTQUFTLFFBQVEsRUFDdkMsS0FBSyxJQUFJLE9BQU8sT0FBTyxJQUFJLENBQUMsRUFDNUIsSUFBSSxFQUFFLFdBQVcsS0FBSztBQUFBO0FBQUEsRUFHL0IsV0FBVyxDQUFDLE1BQThCO0FBQUEsSUFDdEMsT0FBTyxLQUFLLGFBQWEsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFHM0MsZ0JBQWdCLENBQUMsTUFBaUIsSUFBd0I7QUFBQSxJQUN0RCxNQUFNLFdBQVcsS0FBSyxhQUFhLElBQUksSUFBSSxLQUFLLENBQUM7QUFBQSxJQUNqRCxPQUFPLFNBQVMsU0FBUyxFQUFFO0FBQUE7QUFBQSxFQUcvQixvQkFBb0IsR0FBMkI7QUFBQSxJQUMzQyxNQUFNLFVBQWtDLENBQUM7QUFBQSxJQUN6QyxZQUFZLFlBQVksV0FBVyxLQUFLLGlCQUFpQjtBQUFBLE1BQ3JELFFBQVEsY0FBYyxPQUFPO0FBQUEsSUFDakM7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUVmOyIsCiAgImRlYnVnSWQiOiAiOTAzQTA1OUIzQkE4MDAzMTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
