// src/agents/improvement-tracker.ts
import { EventEmitter } from "node:events";

class SelfImprovementTracker extends EventEmitter {
  memoryManager;
  registry;
  coordinator;
  improvements = new Map;
  performanceHistory = new Map;
  constructor(memoryManager, registry, coordinator) {
    super();
    this.memoryManager = memoryManager;
    this.registry = registry;
    this.coordinator = coordinator;
    this.setupEventListeners();
  }
  async recordExecution(execution) {
    const agentType = execution.agentType;
    if (!this.performanceHistory.has(agentType)) {
      this.performanceHistory.set(agentType, []);
    }
    this.performanceHistory.get(agentType)?.push(execution);
    const history = this.performanceHistory.get(agentType);
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    await this.memoryManager.addMemory("episodic", `Agent execution: ${agentType} ${execution.success ? "succeeded" : "failed"} in ${execution.executionTime}ms`, {
      source: "agent",
      context: `Execution of ${agentType} for task ${execution.taskId}`,
      tags: [
        "execution",
        agentType,
        execution.success ? "success" : "failure"
      ],
      confidence: 1
    });
    await this.analyzePerformancePatterns(agentType);
  }
  async analyzePerformancePatterns(agentType) {
    const patterns = [];
    const agentsToAnalyze = agentType ? [agentType] : Array.from(this.performanceHistory.keys());
    for (const agent of agentsToAnalyze) {
      const executions = this.performanceHistory.get(agent) || [];
      if (executions.length < 5)
        continue;
      const successRatePattern = this.analyzeSuccessRate(agent, executions);
      if (successRatePattern)
        patterns.push(successRatePattern);
      const executionTimePattern = this.analyzeExecutionTime(agent, executions);
      if (executionTimePattern)
        patterns.push(executionTimePattern);
      const errorPattern = this.analyzeErrorPatterns(agent, executions);
      if (errorPattern)
        patterns.push(errorPattern);
    }
    for (const pattern of patterns) {
      if (pattern.severity === "high" || pattern.severity === "critical") {
        await this.generateImprovementSuggestion(pattern);
      }
    }
    return patterns;
  }
  async generateImprovementSuggestion(pattern) {
    const improvementId = `improve_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const improvement = {
      id: improvementId,
      type: this.mapPatternToImprovementType(pattern.pattern),
      target: pattern.agentType,
      title: `Improve ${pattern.pattern} for ${pattern.agentType}`,
      description: pattern.description,
      impact: pattern.severity === "critical" ? "high" : pattern.severity === "high" ? "medium" : "low",
      complexity: "medium",
      prerequisites: [`Access to ${pattern.agentType} configuration`],
      implementation: pattern.suggestedActions,
      successMetrics: [
        `Improve ${pattern.pattern} by ${pattern.trend === "declining" ? "reversing" : "maintaining"} trend`,
        "Monitor effectiveness for 30 days"
      ],
      status: "proposed",
      createdAt: new Date
    };
    this.improvements.set(improvementId, improvement);
    await this.memoryManager.addMemory("declarative", `Improvement suggestion: ${improvement.title} - ${improvement.description}`, {
      source: "agent",
      context: `Performance analysis for ${pattern.agentType}`,
      tags: [
        "improvement",
        "suggestion",
        pattern.agentType,
        pattern.pattern
      ],
      confidence: 0.8
    });
    this.emit("improvement_suggested", improvement);
    return improvementId;
  }
  async implementImprovement(improvementId) {
    const improvement = this.improvements.get(improvementId);
    if (!improvement || improvement.status !== "approved") {
      return false;
    }
    improvement.status = "implementing";
    this.emit("improvement_started", improvement);
    try {
      const success = await this.executeImprovement(improvement);
      if (success) {
        improvement.status = "completed";
        improvement.implementedAt = new Date;
        this.emit("improvement_completed", improvement);
      } else {
        improvement.status = "failed";
        this.emit("improvement_failed", improvement);
      }
      return success;
    } catch (error) {
      improvement.status = "failed";
      this.emit("improvement_failed", { improvement, error });
      return false;
    }
  }
  getPendingImprovements() {
    return Array.from(this.improvements.values()).filter((imp) => imp.status === "proposed" || imp.status === "approved");
  }
  getImplementedImprovements() {
    return Array.from(this.improvements.values()).filter((imp) => imp.status === "completed" && imp.effectiveness !== undefined);
  }
  async measureEffectiveness(improvementId) {
    const improvement = this.improvements.get(improvementId);
    if (!improvement || !improvement.implementedAt) {
      return 0;
    }
    const agentType = improvement.target;
    const executions = this.performanceHistory.get(agentType) || [];
    const beforeImplement = executions.filter((e) => e.timestamp < improvement.implementedAt);
    const afterImplement = executions.filter((e) => e.timestamp >= improvement.implementedAt);
    if (beforeImplement.length < 3 || afterImplement.length < 3) {
      return 0;
    }
    let effectiveness = 0;
    switch (improvement.type) {
      case "agent-prompt": {
        const beforeSuccess = beforeImplement.filter((e) => e.success).length / beforeImplement.length;
        const afterSuccess = afterImplement.filter((e) => e.success).length / afterImplement.length;
        effectiveness = Math.max(0, Math.min(1, (afterSuccess - beforeSuccess) * 2));
        break;
      }
      case "capability": {
        const beforeAvgTime = beforeImplement.reduce((sum, e) => sum + e.executionTime, 0) / beforeImplement.length;
        const afterAvgTime = afterImplement.reduce((sum, e) => sum + e.executionTime, 0) / afterImplement.length;
        const timeImprovement = (beforeAvgTime - afterAvgTime) / beforeAvgTime;
        effectiveness = Math.max(0, Math.min(1, timeImprovement));
        break;
      }
      default:
        effectiveness = 0.5;
    }
    improvement.effectiveness = effectiveness;
    return effectiveness;
  }
  analyzeSuccessRate(agentType, executions) {
    const recent = executions.slice(-20);
    if (recent.length < 10)
      return null;
    const successRate = recent.filter((e) => e.success).length / recent.length;
    const older = executions.slice(-40, -20);
    const olderSuccessRate = older.length > 0 ? older.filter((e) => e.success).length / older.length : successRate;
    const change = successRate - olderSuccessRate;
    const threshold = 0.1;
    if (Math.abs(change) < threshold) {
      return {
        agentType,
        pattern: "success-rate",
        trend: "stable",
        severity: "low",
        description: `${agentType} success rate is stable at ${(successRate * 100).toFixed(1)}%`,
        evidence: [
          `Current: ${(successRate * 100).toFixed(1)}%`,
          `Previous: ${(olderSuccessRate * 100).toFixed(1)}%`
        ],
        suggestedActions: [
          "Monitor continued stability",
          "Consider optimization if rate drops below 80%"
        ]
      };
    }
    return {
      agentType,
      pattern: "success-rate",
      trend: change > 0 ? "improving" : "declining",
      severity: Math.abs(change) > 0.2 ? "high" : "medium",
      description: `${agentType} success rate is ${change > 0 ? "improving" : "declining"} (${(change * 100).toFixed(1)}% change)`,
      evidence: [
        `Current: ${(successRate * 100).toFixed(1)}%`,
        `Change: ${(change * 100).toFixed(1)}%`
      ],
      suggestedActions: change > 0 ? [
        "Identify factors contributing to improvement",
        "Document successful patterns"
      ] : [
        "Analyze failure causes",
        "Consider prompt optimization",
        "Review error handling"
      ]
    };
  }
  analyzeExecutionTime(agentType, executions) {
    const recent = executions.slice(-15).filter((e) => e.success);
    if (recent.length < 5)
      return null;
    const avgTime = recent.reduce((sum, e) => sum + e.executionTime, 0) / recent.length;
    const older = executions.slice(-30, -15).filter((e) => e.success);
    const olderAvgTime = older.length > 0 ? older.reduce((sum, e) => sum + e.executionTime, 0) / older.length : avgTime;
    const changePercent = (avgTime - olderAvgTime) / olderAvgTime;
    const threshold = 0.2;
    if (Math.abs(changePercent) < threshold)
      return null;
    return {
      agentType,
      pattern: "execution-time",
      trend: changePercent < 0 ? "improving" : "declining",
      severity: Math.abs(changePercent) > 0.5 ? "high" : "medium",
      description: `${agentType} execution time ${changePercent < 0 ? "improved" : "increased"} by ${(Math.abs(changePercent) * 100).toFixed(1)}%`,
      evidence: [
        `Current avg: ${avgTime.toFixed(0)}ms`,
        `Previous avg: ${olderAvgTime.toFixed(0)}ms`
      ],
      suggestedActions: changePercent < 0 ? [
        "Document optimization techniques",
        "Apply to similar agents"
      ] : [
        "Profile performance bottlenecks",
        "Consider algorithm optimization",
        "Review resource usage"
      ]
    };
  }
  analyzeErrorPatterns(agentType, executions) {
    const recent = executions.slice(-20);
    const errorRate = recent.filter((e) => !e.success).length / recent.length;
    if (errorRate < 0.1)
      return null;
    const errorMessages = recent.filter((e) => !e.success && e.error).map((e) => e.error).reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {});
    const topErrors = Object.entries(errorMessages).sort(([, a], [, b]) => b - a).slice(0, 3);
    return {
      agentType,
      pattern: "error-frequency",
      trend: "declining",
      severity: errorRate > 0.3 ? "critical" : errorRate > 0.2 ? "high" : "medium",
      description: `${agentType} has ${(errorRate * 100).toFixed(1)}% error rate`,
      evidence: topErrors.map(([error, count]) => `${error}: ${count} times`),
      suggestedActions: [
        "Analyze root causes of top errors",
        "Improve error handling and recovery",
        "Consider input validation improvements",
        "Review timeout and resource limits"
      ]
    };
  }
  mapPatternToImprovementType(pattern) {
    switch (pattern) {
      case "success-rate":
        return "agent-prompt";
      case "execution-time":
        return "capability";
      case "error-frequency":
        return "workflow";
      case "quality-score":
        return "communication";
      default:
        return "agent-prompt";
    }
  }
  async executeImprovement(improvement) {
    switch (improvement.type) {
      case "agent-prompt":
        return await this.updateAgentPrompt(improvement);
      case "capability":
        return await this.addAgentCapability(improvement);
      case "workflow":
        return await this.optimizeWorkflow(improvement);
      case "coordination":
        return await this.improveCoordination(improvement);
      case "communication":
        return await this.enhanceCommunication(improvement);
      default:
        return false;
    }
  }
  async updateAgentPrompt(improvement) {
    const agentType = improvement.target;
    const agent = this.registry.get(agentType);
    if (!agent)
      return false;
    const enhancedPrompt = `${agent.prompt}

## Recent Improvements
${improvement.description}
${improvement.implementation.join(`
`)}`;
    agent.prompt = enhancedPrompt;
    return true;
  }
  async addAgentCapability(improvement) {
    const agentType = improvement.target;
    const agent = this.registry.get(agentType);
    if (!agent)
      return false;
    const newCapability = improvement.title.toLowerCase().replace(/\s+/g, "-");
    if (!agent.capabilities.includes(newCapability)) {
      agent.capabilities.push(newCapability);
    }
    return true;
  }
  async optimizeWorkflow(improvement) {
    return true;
  }
  async improveCoordination(improvement) {
    return true;
  }
  async enhanceCommunication(improvement) {
    return true;
  }
  setupEventListeners() {
    this.on("improvement_suggested", (improvement) => {
      console.log(`\uD83D\uDCA1 Improvement suggested: ${improvement.title} (${improvement.impact} impact)`);
    });
    this.on("improvement_completed", (improvement) => {
      console.log(`✅ Improvement implemented: ${improvement.title}`);
    });
    this.on("improvement_failed", (improvement) => {
      console.log(`❌ Improvement failed: ${improvement.title}`);
    });
  }
  getStats() {
    const allImprovements = Array.from(this.improvements.values());
    const completed = allImprovements.filter((i) => i.status === "completed" && i.effectiveness !== undefined);
    const avgEffectiveness = completed.length > 0 ? completed.reduce((sum, i) => sum + (i.effectiveness || 0), 0) / completed.length : 0;
    return {
      totalImprovements: allImprovements.length,
      completedImprovements: completed.length,
      averageEffectiveness: Math.round(avgEffectiveness * 100) / 100,
      pendingSuggestions: allImprovements.filter((i) => i.status === "proposed").length
    };
  }
}
var defaultTracker = null;
function getSelfImprovementTracker(memoryManager, registry, coordinator) {
  if (!defaultTracker && memoryManager && registry && coordinator) {
    defaultTracker = new SelfImprovementTracker(memoryManager, registry, coordinator);
  }
  return defaultTracker;
}
export {
  getSelfImprovementTracker,
  SelfImprovementTracker
};

//# debugId=3873857C3864F48264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FnZW50cy9pbXByb3ZlbWVudC10cmFja2VyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogU2VsZi1JbXByb3ZlbWVudCBTeXN0ZW0gZm9yIEFnZW50IENvb3JkaW5hdGlvblxuICpcbiAqIFRyYWNrcyBhZ2VudCBwZXJmb3JtYW5jZSwgaWRlbnRpZmllcyBpbXByb3ZlbWVudCBvcHBvcnR1bml0aWVzLFxuICogYW5kIGltcGxlbWVudHMgZW5oYW5jZW1lbnRzIHRvIHRoZSBzeXN0ZW0uXG4gKi9cblxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcIm5vZGU6ZXZlbnRzXCI7XG5pbXBvcnQgdHlwZSB7IE1lbW9yeU1hbmFnZXIgfSBmcm9tIFwiLi4vY29udGV4dC9tZW1vcnlcIjtcbmltcG9ydCB0eXBlIHsgQWdlbnRDb29yZGluYXRvciB9IGZyb20gXCIuL2Nvb3JkaW5hdG9yXCI7XG5pbXBvcnQgdHlwZSB7IEFnZW50UmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyeVwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFnZW50RXhlY3V0aW9uLFxuICAgIEFnZW50TWV0cmljcyxcbiAgICB0eXBlIEFnZW50VHlwZSxcbiAgICBJbXByb3ZlbWVudFJlY29yZCxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQZXJmb3JtYW5jZVBhdHRlcm4ge1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIHBhdHRlcm46XG4gICAgICAgIHwgXCJzdWNjZXNzLXJhdGVcIlxuICAgICAgICB8IFwiZXhlY3V0aW9uLXRpbWVcIlxuICAgICAgICB8IFwiZXJyb3ItZnJlcXVlbmN5XCJcbiAgICAgICAgfCBcInF1YWxpdHktc2NvcmVcIjtcbiAgICB0cmVuZDogXCJpbXByb3ZpbmdcIiB8IFwiZGVjbGluaW5nXCIgfCBcInN0YWJsZVwiO1xuICAgIHNldmVyaXR5OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiIHwgXCJjcml0aWNhbFwiO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgZXZpZGVuY2U6IHN0cmluZ1tdO1xuICAgIHN1Z2dlc3RlZEFjdGlvbnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5c3RlbUltcHJvdmVtZW50IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6XG4gICAgICAgIHwgXCJhZ2VudC1wcm9tcHRcIlxuICAgICAgICB8IFwiY2FwYWJpbGl0eVwiXG4gICAgICAgIHwgXCJ3b3JrZmxvd1wiXG4gICAgICAgIHwgXCJjb29yZGluYXRpb25cIlxuICAgICAgICB8IFwiY29tbXVuaWNhdGlvblwiO1xuICAgIHRhcmdldDogQWdlbnRUeXBlIHwgXCJzeXN0ZW1cIjtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgaW1wYWN0OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiO1xuICAgIGNvbXBsZXhpdHk6IFwibG93XCIgfCBcIm1lZGl1bVwiIHwgXCJoaWdoXCI7XG4gICAgcHJlcmVxdWlzaXRlczogc3RyaW5nW107XG4gICAgaW1wbGVtZW50YXRpb246IHN0cmluZ1tdO1xuICAgIHN1Y2Nlc3NNZXRyaWNzOiBzdHJpbmdbXTtcbiAgICBzdGF0dXM6IFwicHJvcG9zZWRcIiB8IFwiYXBwcm92ZWRcIiB8IFwiaW1wbGVtZW50aW5nXCIgfCBcImNvbXBsZXRlZFwiIHwgXCJmYWlsZWRcIjtcbiAgICBjcmVhdGVkQXQ6IERhdGU7XG4gICAgaW1wbGVtZW50ZWRBdD86IERhdGU7XG4gICAgZWZmZWN0aXZlbmVzcz86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTZWxmLUltcHJvdmVtZW50IFRyYWNrZXJcbiAqIE1vbml0b3JzIHN5c3RlbSBwZXJmb3JtYW5jZSBhbmQgaW1wbGVtZW50cyBlbmhhbmNlbWVudHNcbiAqL1xuZXhwb3J0IGNsYXNzIFNlbGZJbXByb3ZlbWVudFRyYWNrZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHByaXZhdGUgbWVtb3J5TWFuYWdlcjogTWVtb3J5TWFuYWdlcjtcbiAgICBwcml2YXRlIHJlZ2lzdHJ5OiBBZ2VudFJlZ2lzdHJ5O1xuICAgIHByaXZhdGUgY29vcmRpbmF0b3I6IEFnZW50Q29vcmRpbmF0b3I7XG4gICAgcHJpdmF0ZSBpbXByb3ZlbWVudHM6IE1hcDxzdHJpbmcsIFN5c3RlbUltcHJvdmVtZW50PiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIHBlcmZvcm1hbmNlSGlzdG9yeTogTWFwPEFnZW50VHlwZSwgQWdlbnRFeGVjdXRpb25bXT4gPSBuZXcgTWFwKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbWVtb3J5TWFuYWdlcjogTWVtb3J5TWFuYWdlcixcbiAgICAgICAgcmVnaXN0cnk6IEFnZW50UmVnaXN0cnksXG4gICAgICAgIGNvb3JkaW5hdG9yOiBBZ2VudENvb3JkaW5hdG9yLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm1lbW9yeU1hbmFnZXIgPSBtZW1vcnlNYW5hZ2VyO1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ID0gcmVnaXN0cnk7XG4gICAgICAgIHRoaXMuY29vcmRpbmF0b3IgPSBjb29yZGluYXRvcjtcbiAgICAgICAgdGhpcy5zZXR1cEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVjb3JkIGFnZW50IGV4ZWN1dGlvbiBmb3IgcGVyZm9ybWFuY2UgYW5hbHlzaXNcbiAgICAgKi9cbiAgICBhc3luYyByZWNvcmRFeGVjdXRpb24oZXhlY3V0aW9uOiBBZ2VudEV4ZWN1dGlvbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBhZ2VudFR5cGUgPSBleGVjdXRpb24uYWdlbnRUeXBlO1xuXG4gICAgICAgIGlmICghdGhpcy5wZXJmb3JtYW5jZUhpc3RvcnkuaGFzKGFnZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybWFuY2VIaXN0b3J5LnNldChhZ2VudFR5cGUsIFtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVyZm9ybWFuY2VIaXN0b3J5LmdldChhZ2VudFR5cGUpPy5wdXNoKGV4ZWN1dGlvbik7XG5cbiAgICAgICAgLy8gS2VlcCBvbmx5IHJlY2VudCBleGVjdXRpb25zIChsYXN0IDEwMCBwZXIgYWdlbnQpXG4gICAgICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLnBlcmZvcm1hbmNlSGlzdG9yeS5nZXQoYWdlbnRUeXBlKSE7XG4gICAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgaGlzdG9yeS5zcGxpY2UoMCwgaGlzdG9yeS5sZW5ndGggLSAxMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgaW4gbWVtb3J5XG4gICAgICAgIGF3YWl0IHRoaXMubWVtb3J5TWFuYWdlci5hZGRNZW1vcnkoXG4gICAgICAgICAgICBcImVwaXNvZGljXCIsXG4gICAgICAgICAgICBgQWdlbnQgZXhlY3V0aW9uOiAke2FnZW50VHlwZX0gJHtleGVjdXRpb24uc3VjY2VzcyA/IFwic3VjY2VlZGVkXCIgOiBcImZhaWxlZFwifSBpbiAke2V4ZWN1dGlvbi5leGVjdXRpb25UaW1lfW1zYCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IFwiYWdlbnRcIixcbiAgICAgICAgICAgICAgICBjb250ZXh0OiBgRXhlY3V0aW9uIG9mICR7YWdlbnRUeXBlfSBmb3IgdGFzayAke2V4ZWN1dGlvbi50YXNrSWR9YCxcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiZXhlY3V0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGFnZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uLnN1Y2Nlc3MgPyBcInN1Y2Nlc3NcIiA6IFwiZmFpbHVyZVwiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogMS4wLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBBbmFseXplIGZvciBwYXR0ZXJuc1xuICAgICAgICBhd2FpdCB0aGlzLmFuYWx5emVQZXJmb3JtYW5jZVBhdHRlcm5zKGFnZW50VHlwZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW5hbHl6ZSBwZXJmb3JtYW5jZSBwYXR0ZXJucyBhbmQgc3VnZ2VzdCBpbXByb3ZlbWVudHNcbiAgICAgKi9cbiAgICBhc3luYyBhbmFseXplUGVyZm9ybWFuY2VQYXR0ZXJucyhcbiAgICAgICAgYWdlbnRUeXBlPzogQWdlbnRUeXBlLFxuICAgICk6IFByb21pc2U8UGVyZm9ybWFuY2VQYXR0ZXJuW10+IHtcbiAgICAgICAgY29uc3QgcGF0dGVybnM6IFBlcmZvcm1hbmNlUGF0dGVybltdID0gW107XG5cbiAgICAgICAgY29uc3QgYWdlbnRzVG9BbmFseXplID0gYWdlbnRUeXBlXG4gICAgICAgICAgICA/IFthZ2VudFR5cGVdXG4gICAgICAgICAgICA6IEFycmF5LmZyb20odGhpcy5wZXJmb3JtYW5jZUhpc3Rvcnkua2V5cygpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGFnZW50IG9mIGFnZW50c1RvQW5hbHl6ZSkge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9ucyA9IHRoaXMucGVyZm9ybWFuY2VIaXN0b3J5LmdldChhZ2VudCkgfHwgW107XG4gICAgICAgICAgICBpZiAoZXhlY3V0aW9ucy5sZW5ndGggPCA1KSBjb250aW51ZTsgLy8gTmVlZCBtaW5pbXVtIGRhdGFcblxuICAgICAgICAgICAgLy8gQW5hbHl6ZSBzdWNjZXNzIHJhdGUgdHJlbmRcbiAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NSYXRlUGF0dGVybiA9IHRoaXMuYW5hbHl6ZVN1Y2Nlc3NSYXRlKFxuICAgICAgICAgICAgICAgIGFnZW50LFxuICAgICAgICAgICAgICAgIGV4ZWN1dGlvbnMsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3NSYXRlUGF0dGVybikgcGF0dGVybnMucHVzaChzdWNjZXNzUmF0ZVBhdHRlcm4pO1xuXG4gICAgICAgICAgICAvLyBBbmFseXplIGV4ZWN1dGlvbiB0aW1lIHRyZW5kXG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25UaW1lUGF0dGVybiA9IHRoaXMuYW5hbHl6ZUV4ZWN1dGlvblRpbWUoXG4gICAgICAgICAgICAgICAgYWdlbnQsXG4gICAgICAgICAgICAgICAgZXhlY3V0aW9ucyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoZXhlY3V0aW9uVGltZVBhdHRlcm4pIHBhdHRlcm5zLnB1c2goZXhlY3V0aW9uVGltZVBhdHRlcm4pO1xuXG4gICAgICAgICAgICAvLyBBbmFseXplIGVycm9yIHBhdHRlcm5zXG4gICAgICAgICAgICBjb25zdCBlcnJvclBhdHRlcm4gPSB0aGlzLmFuYWx5emVFcnJvclBhdHRlcm5zKGFnZW50LCBleGVjdXRpb25zKTtcbiAgICAgICAgICAgIGlmIChlcnJvclBhdHRlcm4pIHBhdHRlcm5zLnB1c2goZXJyb3JQYXR0ZXJuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGltcHJvdmVtZW50IHN1Z2dlc3Rpb25zXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHBhdHRlcm4uc2V2ZXJpdHkgPT09IFwiaGlnaFwiIHx8XG4gICAgICAgICAgICAgICAgcGF0dGVybi5zZXZlcml0eSA9PT0gXCJjcml0aWNhbFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlSW1wcm92ZW1lbnRTdWdnZXN0aW9uKHBhdHRlcm4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdHRlcm5zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGltcHJvdmVtZW50IHN1Z2dlc3Rpb24gYmFzZWQgb24gcGVyZm9ybWFuY2UgcGF0dGVyblxuICAgICAqL1xuICAgIGFzeW5jIGdlbmVyYXRlSW1wcm92ZW1lbnRTdWdnZXN0aW9uKFxuICAgICAgICBwYXR0ZXJuOiBQZXJmb3JtYW5jZVBhdHRlcm4sXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgaW1wcm92ZW1lbnRJZCA9IGBpbXByb3ZlXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCl9YDtcblxuICAgICAgICBjb25zdCBpbXByb3ZlbWVudDogU3lzdGVtSW1wcm92ZW1lbnQgPSB7XG4gICAgICAgICAgICBpZDogaW1wcm92ZW1lbnRJZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMubWFwUGF0dGVyblRvSW1wcm92ZW1lbnRUeXBlKHBhdHRlcm4ucGF0dGVybiksXG4gICAgICAgICAgICB0YXJnZXQ6IHBhdHRlcm4uYWdlbnRUeXBlLFxuICAgICAgICAgICAgdGl0bGU6IGBJbXByb3ZlICR7cGF0dGVybi5wYXR0ZXJufSBmb3IgJHtwYXR0ZXJuLmFnZW50VHlwZX1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHBhdHRlcm4uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBpbXBhY3Q6XG4gICAgICAgICAgICAgICAgcGF0dGVybi5zZXZlcml0eSA9PT0gXCJjcml0aWNhbFwiXG4gICAgICAgICAgICAgICAgICAgID8gXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBwYXR0ZXJuLnNldmVyaXR5ID09PSBcImhpZ2hcIlxuICAgICAgICAgICAgICAgICAgICAgID8gXCJtZWRpdW1cIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCJsb3dcIixcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICBwcmVyZXF1aXNpdGVzOiBbYEFjY2VzcyB0byAke3BhdHRlcm4uYWdlbnRUeXBlfSBjb25maWd1cmF0aW9uYF0sXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogcGF0dGVybi5zdWdnZXN0ZWRBY3Rpb25zLFxuICAgICAgICAgICAgc3VjY2Vzc01ldHJpY3M6IFtcbiAgICAgICAgICAgICAgICBgSW1wcm92ZSAke3BhdHRlcm4ucGF0dGVybn0gYnkgJHtwYXR0ZXJuLnRyZW5kID09PSBcImRlY2xpbmluZ1wiID8gXCJyZXZlcnNpbmdcIiA6IFwibWFpbnRhaW5pbmdcIn0gdHJlbmRgLFxuICAgICAgICAgICAgICAgIFwiTW9uaXRvciBlZmZlY3RpdmVuZXNzIGZvciAzMCBkYXlzXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc3RhdHVzOiBcInByb3Bvc2VkXCIsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbXByb3ZlbWVudHMuc2V0KGltcHJvdmVtZW50SWQsIGltcHJvdmVtZW50KTtcblxuICAgICAgICAvLyBTdG9yZSBpbiBtZW1vcnlcbiAgICAgICAgYXdhaXQgdGhpcy5tZW1vcnlNYW5hZ2VyLmFkZE1lbW9yeShcbiAgICAgICAgICAgIFwiZGVjbGFyYXRpdmVcIixcbiAgICAgICAgICAgIGBJbXByb3ZlbWVudCBzdWdnZXN0aW9uOiAke2ltcHJvdmVtZW50LnRpdGxlfSAtICR7aW1wcm92ZW1lbnQuZGVzY3JpcHRpb259YCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IFwiYWdlbnRcIixcbiAgICAgICAgICAgICAgICBjb250ZXh0OiBgUGVyZm9ybWFuY2UgYW5hbHlzaXMgZm9yICR7cGF0dGVybi5hZ2VudFR5cGV9YCxcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiaW1wcm92ZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzdWdnZXN0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4uYWdlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuLnBhdHRlcm4sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlOiAwLjgsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZW1pdChcImltcHJvdmVtZW50X3N1Z2dlc3RlZFwiLCBpbXByb3ZlbWVudCk7XG4gICAgICAgIHJldHVybiBpbXByb3ZlbWVudElkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEltcGxlbWVudCBhbiBhcHByb3ZlZCBpbXByb3ZlbWVudFxuICAgICAqL1xuICAgIGFzeW5jIGltcGxlbWVudEltcHJvdmVtZW50KGltcHJvdmVtZW50SWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBpbXByb3ZlbWVudCA9IHRoaXMuaW1wcm92ZW1lbnRzLmdldChpbXByb3ZlbWVudElkKTtcbiAgICAgICAgaWYgKCFpbXByb3ZlbWVudCB8fCBpbXByb3ZlbWVudC5zdGF0dXMgIT09IFwiYXBwcm92ZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1wcm92ZW1lbnQuc3RhdHVzID0gXCJpbXBsZW1lbnRpbmdcIjtcbiAgICAgICAgdGhpcy5lbWl0KFwiaW1wcm92ZW1lbnRfc3RhcnRlZFwiLCBpbXByb3ZlbWVudCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEltcGxlbWVudGF0aW9uIGxvZ2ljIGJhc2VkIG9uIHR5cGVcbiAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCB0aGlzLmV4ZWN1dGVJbXByb3ZlbWVudChpbXByb3ZlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgaW1wcm92ZW1lbnQuc3RhdHVzID0gXCJjb21wbGV0ZWRcIjtcbiAgICAgICAgICAgICAgICBpbXByb3ZlbWVudC5pbXBsZW1lbnRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJpbXByb3ZlbWVudF9jb21wbGV0ZWRcIiwgaW1wcm92ZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbXByb3ZlbWVudC5zdGF0dXMgPSBcImZhaWxlZFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImltcHJvdmVtZW50X2ZhaWxlZFwiLCBpbXByb3ZlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaW1wcm92ZW1lbnQuc3RhdHVzID0gXCJmYWlsZWRcIjtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImltcHJvdmVtZW50X2ZhaWxlZFwiLCB7IGltcHJvdmVtZW50LCBlcnJvciB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBwZW5kaW5nIGltcHJvdmVtZW50IHN1Z2dlc3Rpb25zXG4gICAgICovXG4gICAgZ2V0UGVuZGluZ0ltcHJvdmVtZW50cygpOiBTeXN0ZW1JbXByb3ZlbWVudFtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5pbXByb3ZlbWVudHMudmFsdWVzKCkpLmZpbHRlcihcbiAgICAgICAgICAgIChpbXApID0+IGltcC5zdGF0dXMgPT09IFwicHJvcG9zZWRcIiB8fCBpbXAuc3RhdHVzID09PSBcImFwcHJvdmVkXCIsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGltcGxlbWVudGVkIGltcHJvdmVtZW50cyB3aXRoIGVmZmVjdGl2ZW5lc3MgcmF0aW5nc1xuICAgICAqL1xuICAgIGdldEltcGxlbWVudGVkSW1wcm92ZW1lbnRzKCk6IFN5c3RlbUltcHJvdmVtZW50W10ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmltcHJvdmVtZW50cy52YWx1ZXMoKSkuZmlsdGVyKFxuICAgICAgICAgICAgKGltcCkgPT5cbiAgICAgICAgICAgICAgICBpbXAuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiICYmIGltcC5lZmZlY3RpdmVuZXNzICE9PSB1bmRlZmluZWQsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVhc3VyZSBlZmZlY3RpdmVuZXNzIG9mIGltcGxlbWVudGVkIGltcHJvdmVtZW50c1xuICAgICAqL1xuICAgIGFzeW5jIG1lYXN1cmVFZmZlY3RpdmVuZXNzKGltcHJvdmVtZW50SWQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IGltcHJvdmVtZW50ID0gdGhpcy5pbXByb3ZlbWVudHMuZ2V0KGltcHJvdmVtZW50SWQpO1xuICAgICAgICBpZiAoIWltcHJvdmVtZW50IHx8ICFpbXByb3ZlbWVudC5pbXBsZW1lbnRlZEF0KSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5emUgcGVyZm9ybWFuY2UgYmVmb3JlIGFuZCBhZnRlciBpbXBsZW1lbnRhdGlvblxuICAgICAgICBjb25zdCBhZ2VudFR5cGUgPSBpbXByb3ZlbWVudC50YXJnZXQgYXMgQWdlbnRUeXBlO1xuICAgICAgICBjb25zdCBleGVjdXRpb25zID0gdGhpcy5wZXJmb3JtYW5jZUhpc3RvcnkuZ2V0KGFnZW50VHlwZSkgfHwgW107XG5cbiAgICAgICAgY29uc3QgYmVmb3JlSW1wbGVtZW50ID0gZXhlY3V0aW9ucy5maWx0ZXIoXG4gICAgICAgICAgICAoZSkgPT4gZS50aW1lc3RhbXAgPCBpbXByb3ZlbWVudC5pbXBsZW1lbnRlZEF0ISxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWZ0ZXJJbXBsZW1lbnQgPSBleGVjdXRpb25zLmZpbHRlcihcbiAgICAgICAgICAgIChlKSA9PiBlLnRpbWVzdGFtcCA+PSBpbXByb3ZlbWVudC5pbXBsZW1lbnRlZEF0ISxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoYmVmb3JlSW1wbGVtZW50Lmxlbmd0aCA8IDMgfHwgYWZ0ZXJJbXBsZW1lbnQubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgcmV0dXJuIDA7IC8vIEluc3VmZmljaWVudCBkYXRhXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgZWZmZWN0aXZlbmVzcyBiYXNlZCBvbiBpbXByb3ZlbWVudCB0eXBlXG4gICAgICAgIGxldCBlZmZlY3RpdmVuZXNzID0gMDtcblxuICAgICAgICBzd2l0Y2ggKGltcHJvdmVtZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJhZ2VudC1wcm9tcHRcIjoge1xuICAgICAgICAgICAgICAgIC8vIE1lYXN1cmUgc3VjY2VzcyByYXRlIGltcHJvdmVtZW50XG4gICAgICAgICAgICAgICAgY29uc3QgYmVmb3JlU3VjY2VzcyA9XG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZUltcGxlbWVudC5maWx0ZXIoKGUpID0+IGUuc3VjY2VzcykubGVuZ3RoIC9cbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlSW1wbGVtZW50Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBhZnRlclN1Y2Nlc3MgPVxuICAgICAgICAgICAgICAgICAgICBhZnRlckltcGxlbWVudC5maWx0ZXIoKGUpID0+IGUuc3VjY2VzcykubGVuZ3RoIC9cbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXJJbXBsZW1lbnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGVmZmVjdGl2ZW5lc3MgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4oMSwgKGFmdGVyU3VjY2VzcyAtIGJlZm9yZVN1Y2Nlc3MpICogMiksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBcImNhcGFiaWxpdHlcIjoge1xuICAgICAgICAgICAgICAgIC8vIE1lYXN1cmUgZXhlY3V0aW9uIHRpbWUgaW1wcm92ZW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCBiZWZvcmVBdmdUaW1lID1cbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlSW1wbGVtZW50LnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIChzdW0sIGUpID0+IHN1bSArIGUuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICkgLyBiZWZvcmVJbXBsZW1lbnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFmdGVyQXZnVGltZSA9XG4gICAgICAgICAgICAgICAgICAgIGFmdGVySW1wbGVtZW50LnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIChzdW0sIGUpID0+IHN1bSArIGUuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICkgLyBhZnRlckltcGxlbWVudC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZUltcHJvdmVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgKGJlZm9yZUF2Z1RpbWUgLSBhZnRlckF2Z1RpbWUpIC8gYmVmb3JlQXZnVGltZTtcbiAgICAgICAgICAgICAgICBlZmZlY3RpdmVuZXNzID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGltZUltcHJvdmVtZW50KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZWZmZWN0aXZlbmVzcyA9IDAuNTsgLy8gTmV1dHJhbCBmb3Igb3RoZXIgdHlwZXNcbiAgICAgICAgfVxuXG4gICAgICAgIGltcHJvdmVtZW50LmVmZmVjdGl2ZW5lc3MgPSBlZmZlY3RpdmVuZXNzO1xuICAgICAgICByZXR1cm4gZWZmZWN0aXZlbmVzcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGFuYWx5emVTdWNjZXNzUmF0ZShcbiAgICAgICAgYWdlbnRUeXBlOiBBZ2VudFR5cGUsXG4gICAgICAgIGV4ZWN1dGlvbnM6IEFnZW50RXhlY3V0aW9uW10sXG4gICAgKTogUGVyZm9ybWFuY2VQYXR0ZXJuIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHJlY2VudCA9IGV4ZWN1dGlvbnMuc2xpY2UoLTIwKTsgLy8gTGFzdCAyMCBleGVjdXRpb25zXG4gICAgICAgIGlmIChyZWNlbnQubGVuZ3RoIDwgMTApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NSYXRlID1cbiAgICAgICAgICAgIHJlY2VudC5maWx0ZXIoKGUpID0+IGUuc3VjY2VzcykubGVuZ3RoIC8gcmVjZW50Lmxlbmd0aDtcbiAgICAgICAgY29uc3Qgb2xkZXIgPSBleGVjdXRpb25zLnNsaWNlKC00MCwgLTIwKTtcbiAgICAgICAgY29uc3Qgb2xkZXJTdWNjZXNzUmF0ZSA9XG4gICAgICAgICAgICBvbGRlci5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgPyBvbGRlci5maWx0ZXIoKGUpID0+IGUuc3VjY2VzcykubGVuZ3RoIC8gb2xkZXIubGVuZ3RoXG4gICAgICAgICAgICAgICAgOiBzdWNjZXNzUmF0ZTtcblxuICAgICAgICBjb25zdCBjaGFuZ2UgPSBzdWNjZXNzUmF0ZSAtIG9sZGVyU3VjY2Vzc1JhdGU7XG4gICAgICAgIGNvbnN0IHRocmVzaG9sZCA9IDAuMTsgLy8gMTAlIGNoYW5nZSB0aHJlc2hvbGRcblxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA8IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhZ2VudFR5cGUsXG4gICAgICAgICAgICAgICAgcGF0dGVybjogXCJzdWNjZXNzLXJhdGVcIixcbiAgICAgICAgICAgICAgICB0cmVuZDogXCJzdGFibGVcIixcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogXCJsb3dcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7YWdlbnRUeXBlfSBzdWNjZXNzIHJhdGUgaXMgc3RhYmxlIGF0ICR7KHN1Y2Nlc3NSYXRlICogMTAwKS50b0ZpeGVkKDEpfSVgLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICAgICAgICAgIGBDdXJyZW50OiAkeyhzdWNjZXNzUmF0ZSAqIDEwMCkudG9GaXhlZCgxKX0lYCxcbiAgICAgICAgICAgICAgICAgICAgYFByZXZpb3VzOiAkeyhvbGRlclN1Y2Nlc3NSYXRlICogMTAwKS50b0ZpeGVkKDEpfSVgLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGVkQWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcIk1vbml0b3IgY29udGludWVkIHN0YWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkNvbnNpZGVyIG9wdGltaXphdGlvbiBpZiByYXRlIGRyb3BzIGJlbG93IDgwJVwiLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFnZW50VHlwZSxcbiAgICAgICAgICAgIHBhdHRlcm46IFwic3VjY2Vzcy1yYXRlXCIsXG4gICAgICAgICAgICB0cmVuZDogY2hhbmdlID4gMCA/IFwiaW1wcm92aW5nXCIgOiBcImRlY2xpbmluZ1wiLFxuICAgICAgICAgICAgc2V2ZXJpdHk6IE1hdGguYWJzKGNoYW5nZSkgPiAwLjIgPyBcImhpZ2hcIiA6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7YWdlbnRUeXBlfSBzdWNjZXNzIHJhdGUgaXMgJHtjaGFuZ2UgPiAwID8gXCJpbXByb3ZpbmdcIiA6IFwiZGVjbGluaW5nXCJ9ICgkeyhjaGFuZ2UgKiAxMDApLnRvRml4ZWQoMSl9JSBjaGFuZ2UpYCxcbiAgICAgICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICAgICAgYEN1cnJlbnQ6ICR7KHN1Y2Nlc3NSYXRlICogMTAwKS50b0ZpeGVkKDEpfSVgLFxuICAgICAgICAgICAgICAgIGBDaGFuZ2U6ICR7KGNoYW5nZSAqIDEwMCkudG9GaXhlZCgxKX0lYCxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzdWdnZXN0ZWRBY3Rpb25zOlxuICAgICAgICAgICAgICAgIGNoYW5nZSA+IDBcbiAgICAgICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWRlbnRpZnkgZmFjdG9ycyBjb250cmlidXRpbmcgdG8gaW1wcm92ZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJEb2N1bWVudCBzdWNjZXNzZnVsIHBhdHRlcm5zXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBbmFseXplIGZhaWx1cmUgY2F1c2VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29uc2lkZXIgcHJvbXB0IG9wdGltaXphdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIlJldmlldyBlcnJvciBoYW5kbGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbmFseXplRXhlY3V0aW9uVGltZShcbiAgICAgICAgYWdlbnRUeXBlOiBBZ2VudFR5cGUsXG4gICAgICAgIGV4ZWN1dGlvbnM6IEFnZW50RXhlY3V0aW9uW10sXG4gICAgKTogUGVyZm9ybWFuY2VQYXR0ZXJuIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHJlY2VudCA9IGV4ZWN1dGlvbnMuc2xpY2UoLTE1KS5maWx0ZXIoKGUpID0+IGUuc3VjY2Vzcyk7XG4gICAgICAgIGlmIChyZWNlbnQubGVuZ3RoIDwgNSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgYXZnVGltZSA9XG4gICAgICAgICAgICByZWNlbnQucmVkdWNlKChzdW0sIGUpID0+IHN1bSArIGUuZXhlY3V0aW9uVGltZSwgMCkgLyByZWNlbnQubGVuZ3RoO1xuICAgICAgICBjb25zdCBvbGRlciA9IGV4ZWN1dGlvbnMuc2xpY2UoLTMwLCAtMTUpLmZpbHRlcigoZSkgPT4gZS5zdWNjZXNzKTtcbiAgICAgICAgY29uc3Qgb2xkZXJBdmdUaW1lID1cbiAgICAgICAgICAgIG9sZGVyLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IG9sZGVyLnJlZHVjZSgoc3VtLCBlKSA9PiBzdW0gKyBlLmV4ZWN1dGlvblRpbWUsIDApIC9cbiAgICAgICAgICAgICAgICAgIG9sZGVyLmxlbmd0aFxuICAgICAgICAgICAgICAgIDogYXZnVGltZTtcblxuICAgICAgICBjb25zdCBjaGFuZ2VQZXJjZW50ID0gKGF2Z1RpbWUgLSBvbGRlckF2Z1RpbWUpIC8gb2xkZXJBdmdUaW1lO1xuICAgICAgICBjb25zdCB0aHJlc2hvbGQgPSAwLjI7IC8vIDIwJSBjaGFuZ2UgdGhyZXNob2xkXG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGNoYW5nZVBlcmNlbnQpIDwgdGhyZXNob2xkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWdlbnRUeXBlLFxuICAgICAgICAgICAgcGF0dGVybjogXCJleGVjdXRpb24tdGltZVwiLFxuICAgICAgICAgICAgdHJlbmQ6IGNoYW5nZVBlcmNlbnQgPCAwID8gXCJpbXByb3ZpbmdcIiA6IFwiZGVjbGluaW5nXCIsXG4gICAgICAgICAgICBzZXZlcml0eTogTWF0aC5hYnMoY2hhbmdlUGVyY2VudCkgPiAwLjUgPyBcImhpZ2hcIiA6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7YWdlbnRUeXBlfSBleGVjdXRpb24gdGltZSAke2NoYW5nZVBlcmNlbnQgPCAwID8gXCJpbXByb3ZlZFwiIDogXCJpbmNyZWFzZWRcIn0gYnkgJHsoTWF0aC5hYnMoY2hhbmdlUGVyY2VudCkgKiAxMDApLnRvRml4ZWQoMSl9JWAsXG4gICAgICAgICAgICBldmlkZW5jZTogW1xuICAgICAgICAgICAgICAgIGBDdXJyZW50IGF2ZzogJHthdmdUaW1lLnRvRml4ZWQoMCl9bXNgLFxuICAgICAgICAgICAgICAgIGBQcmV2aW91cyBhdmc6ICR7b2xkZXJBdmdUaW1lLnRvRml4ZWQoMCl9bXNgLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHN1Z2dlc3RlZEFjdGlvbnM6XG4gICAgICAgICAgICAgICAgY2hhbmdlUGVyY2VudCA8IDBcbiAgICAgICAgICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiRG9jdW1lbnQgb3B0aW1pemF0aW9uIHRlY2huaXF1ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBcHBseSB0byBzaW1pbGFyIGFnZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiUHJvZmlsZSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnNpZGVyIGFsZ29yaXRobSBvcHRpbWl6YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJSZXZpZXcgcmVzb3VyY2UgdXNhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYW5hbHl6ZUVycm9yUGF0dGVybnMoXG4gICAgICAgIGFnZW50VHlwZTogQWdlbnRUeXBlLFxuICAgICAgICBleGVjdXRpb25zOiBBZ2VudEV4ZWN1dGlvbltdLFxuICAgICk6IFBlcmZvcm1hbmNlUGF0dGVybiB8IG51bGwge1xuICAgICAgICBjb25zdCByZWNlbnQgPSBleGVjdXRpb25zLnNsaWNlKC0yMCk7XG4gICAgICAgIGNvbnN0IGVycm9yUmF0ZSA9XG4gICAgICAgICAgICByZWNlbnQuZmlsdGVyKChlKSA9PiAhZS5zdWNjZXNzKS5sZW5ndGggLyByZWNlbnQubGVuZ3RoO1xuXG4gICAgICAgIGlmIChlcnJvclJhdGUgPCAwLjEpIHJldHVybiBudWxsOyAvLyBMb3cgZXJyb3IgcmF0ZSwgbm8gaXNzdWVcblxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2VzID0gcmVjZW50XG4gICAgICAgICAgICAuZmlsdGVyKChlKSA9PiAhZS5zdWNjZXNzICYmIGUuZXJyb3IpXG4gICAgICAgICAgICAubWFwKChlKSA9PiBlLmVycm9yISlcbiAgICAgICAgICAgIC5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgKGFjYywgZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWNjW2Vycm9yXSA9IChhY2NbZXJyb3JdIHx8IDApICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHt9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRvcEVycm9ycyA9IE9iamVjdC5lbnRyaWVzKGVycm9yTWVzc2FnZXMpXG4gICAgICAgICAgICAuc29ydCgoWywgYV0sIFssIGJdKSA9PiBiIC0gYSlcbiAgICAgICAgICAgIC5zbGljZSgwLCAzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWdlbnRUeXBlLFxuICAgICAgICAgICAgcGF0dGVybjogXCJlcnJvci1mcmVxdWVuY3lcIixcbiAgICAgICAgICAgIHRyZW5kOiBcImRlY2xpbmluZ1wiLCAvLyBIaWdoIGVycm9yIHJhdGUgaW5kaWNhdGVzIGRlY2xpbmVcbiAgICAgICAgICAgIHNldmVyaXR5OlxuICAgICAgICAgICAgICAgIGVycm9yUmF0ZSA+IDAuM1xuICAgICAgICAgICAgICAgICAgICA/IFwiY3JpdGljYWxcIlxuICAgICAgICAgICAgICAgICAgICA6IGVycm9yUmF0ZSA+IDAuMlxuICAgICAgICAgICAgICAgICAgICAgID8gXCJoaWdoXCJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7YWdlbnRUeXBlfSBoYXMgJHsoZXJyb3JSYXRlICogMTAwKS50b0ZpeGVkKDEpfSUgZXJyb3IgcmF0ZWAsXG4gICAgICAgICAgICBldmlkZW5jZTogdG9wRXJyb3JzLm1hcChcbiAgICAgICAgICAgICAgICAoW2Vycm9yLCBjb3VudF0pID0+IGAke2Vycm9yfTogJHtjb3VudH0gdGltZXNgLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHN1Z2dlc3RlZEFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICBcIkFuYWx5emUgcm9vdCBjYXVzZXMgb2YgdG9wIGVycm9yc1wiLFxuICAgICAgICAgICAgICAgIFwiSW1wcm92ZSBlcnJvciBoYW5kbGluZyBhbmQgcmVjb3ZlcnlcIixcbiAgICAgICAgICAgICAgICBcIkNvbnNpZGVyIGlucHV0IHZhbGlkYXRpb24gaW1wcm92ZW1lbnRzXCIsXG4gICAgICAgICAgICAgICAgXCJSZXZpZXcgdGltZW91dCBhbmQgcmVzb3VyY2UgbGltaXRzXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFwUGF0dGVyblRvSW1wcm92ZW1lbnRUeXBlKFxuICAgICAgICBwYXR0ZXJuOiBQZXJmb3JtYW5jZVBhdHRlcm5bXCJwYXR0ZXJuXCJdLFxuICAgICk6IFN5c3RlbUltcHJvdmVtZW50W1widHlwZVwiXSB7XG4gICAgICAgIHN3aXRjaCAocGF0dGVybikge1xuICAgICAgICAgICAgY2FzZSBcInN1Y2Nlc3MtcmF0ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImFnZW50LXByb21wdFwiO1xuICAgICAgICAgICAgY2FzZSBcImV4ZWN1dGlvbi10aW1lXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiY2FwYWJpbGl0eVwiO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yLWZyZXF1ZW5jeVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIndvcmtmbG93XCI7XG4gICAgICAgICAgICBjYXNlIFwicXVhbGl0eS1zY29yZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImNvbW11bmljYXRpb25cIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYWdlbnQtcHJvbXB0XCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVJbXByb3ZlbWVudChcbiAgICAgICAgaW1wcm92ZW1lbnQ6IFN5c3RlbUltcHJvdmVtZW50LFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBsb2dpYyBiYXNlZCBvbiBpbXByb3ZlbWVudCB0eXBlXG4gICAgICAgIHN3aXRjaCAoaW1wcm92ZW1lbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImFnZW50LXByb21wdFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZUFnZW50UHJvbXB0KGltcHJvdmVtZW50KTtcbiAgICAgICAgICAgIGNhc2UgXCJjYXBhYmlsaXR5XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYWRkQWdlbnRDYXBhYmlsaXR5KGltcHJvdmVtZW50KTtcbiAgICAgICAgICAgIGNhc2UgXCJ3b3JrZmxvd1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLm9wdGltaXplV29ya2Zsb3coaW1wcm92ZW1lbnQpO1xuICAgICAgICAgICAgY2FzZSBcImNvb3JkaW5hdGlvblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmltcHJvdmVDb29yZGluYXRpb24oaW1wcm92ZW1lbnQpO1xuICAgICAgICAgICAgY2FzZSBcImNvbW11bmljYXRpb25cIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5lbmhhbmNlQ29tbXVuaWNhdGlvbihpbXByb3ZlbWVudCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlQWdlbnRQcm9tcHQoXG4gICAgICAgIGltcHJvdmVtZW50OiBTeXN0ZW1JbXByb3ZlbWVudCxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gVXBkYXRlIGFnZW50IHByb21wdCBpbiByZWdpc3RyeSBhbmQgZmlsZXN5c3RlbVxuICAgICAgICBjb25zdCBhZ2VudFR5cGUgPSBpbXByb3ZlbWVudC50YXJnZXQgYXMgQWdlbnRUeXBlO1xuICAgICAgICBjb25zdCBhZ2VudCA9IHRoaXMucmVnaXN0cnkuZ2V0KGFnZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKCFhZ2VudCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIEVuaGFuY2VkIHByb21wdCB3aXRoIGltcHJvdmVtZW50XG4gICAgICAgIGNvbnN0IGVuaGFuY2VkUHJvbXB0ID0gYCR7YWdlbnQucHJvbXB0fVxcblxcbiMjIFJlY2VudCBJbXByb3ZlbWVudHNcXG4ke2ltcHJvdmVtZW50LmRlc2NyaXB0aW9ufVxcbiR7aW1wcm92ZW1lbnQuaW1wbGVtZW50YXRpb24uam9pbihcIlxcblwiKX1gO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBpbiByZWdpc3RyeSAoaW4gcmVhbCBpbXBsZW1lbnRhdGlvbiwgYWxzbyB1cGRhdGUgZmlsZXN5c3RlbSlcbiAgICAgICAgKGFnZW50IGFzIGFueSkucHJvbXB0ID0gZW5oYW5jZWRQcm9tcHQ7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhZGRBZ2VudENhcGFiaWxpdHkoXG4gICAgICAgIGltcHJvdmVtZW50OiBTeXN0ZW1JbXByb3ZlbWVudCxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gQWRkIGNhcGFiaWxpdHkgdG8gYWdlbnQgZGVmaW5pdGlvblxuICAgICAgICBjb25zdCBhZ2VudFR5cGUgPSBpbXByb3ZlbWVudC50YXJnZXQgYXMgQWdlbnRUeXBlO1xuICAgICAgICBjb25zdCBhZ2VudCA9IHRoaXMucmVnaXN0cnkuZ2V0KGFnZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKCFhZ2VudCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIEFkZCBuZXcgY2FwYWJpbGl0eVxuICAgICAgICBjb25zdCBuZXdDYXBhYmlsaXR5ID0gaW1wcm92ZW1lbnQudGl0bGVcbiAgICAgICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCBcIi1cIik7XG4gICAgICAgIGlmICghYWdlbnQuY2FwYWJpbGl0aWVzLmluY2x1ZGVzKG5ld0NhcGFiaWxpdHkpKSB7XG4gICAgICAgICAgICBhZ2VudC5jYXBhYmlsaXRpZXMucHVzaChuZXdDYXBhYmlsaXR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgb3B0aW1pemVXb3JrZmxvdyhcbiAgICAgICAgaW1wcm92ZW1lbnQ6IFN5c3RlbUltcHJvdmVtZW50LFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBVcGRhdGUgY29vcmRpbmF0b3IgY29uZmlndXJhdGlvbiBvciB3b3JrZmxvd1xuICAgICAgICAvLyBUaGlzIHdvdWxkIG1vZGlmeSBleGVjdXRpb24gc3RyYXRlZ2llcywgdGltZW91dHMsIGV0Yy5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBpbXByb3ZlQ29vcmRpbmF0aW9uKFxuICAgICAgICBpbXByb3ZlbWVudDogU3lzdGVtSW1wcm92ZW1lbnQsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIC8vIFVwZGF0ZSBjb29yZGluYXRpb24gbG9naWNcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBlbmhhbmNlQ29tbXVuaWNhdGlvbihcbiAgICAgICAgaW1wcm92ZW1lbnQ6IFN5c3RlbUltcHJvdmVtZW50LFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBVcGRhdGUgY29tbXVuaWNhdGlvbiBwYXR0ZXJuc1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub24oXCJpbXByb3ZlbWVudF9zdWdnZXN0ZWRcIiwgKGltcHJvdmVtZW50OiBTeXN0ZW1JbXByb3ZlbWVudCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYPCfkqEgSW1wcm92ZW1lbnQgc3VnZ2VzdGVkOiAke2ltcHJvdmVtZW50LnRpdGxlfSAoJHtpbXByb3ZlbWVudC5pbXBhY3R9IGltcGFjdClgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vbihcImltcHJvdmVtZW50X2NvbXBsZXRlZFwiLCAoaW1wcm92ZW1lbnQ6IFN5c3RlbUltcHJvdmVtZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIEltcHJvdmVtZW50IGltcGxlbWVudGVkOiAke2ltcHJvdmVtZW50LnRpdGxlfWApO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9uKFwiaW1wcm92ZW1lbnRfZmFpbGVkXCIsIChpbXByb3ZlbWVudDogU3lzdGVtSW1wcm92ZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinYwgSW1wcm92ZW1lbnQgZmFpbGVkOiAke2ltcHJvdmVtZW50LnRpdGxlfWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgc3lzdGVtIGltcHJvdmVtZW50IHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRTdGF0cygpOiB7XG4gICAgICAgIHRvdGFsSW1wcm92ZW1lbnRzOiBudW1iZXI7XG4gICAgICAgIGNvbXBsZXRlZEltcHJvdmVtZW50czogbnVtYmVyO1xuICAgICAgICBhdmVyYWdlRWZmZWN0aXZlbmVzczogbnVtYmVyO1xuICAgICAgICBwZW5kaW5nU3VnZ2VzdGlvbnM6IG51bWJlcjtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgYWxsSW1wcm92ZW1lbnRzID0gQXJyYXkuZnJvbSh0aGlzLmltcHJvdmVtZW50cy52YWx1ZXMoKSk7XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFsbEltcHJvdmVtZW50cy5maWx0ZXIoXG4gICAgICAgICAgICAoaSkgPT4gaS5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgJiYgaS5lZmZlY3RpdmVuZXNzICE9PSB1bmRlZmluZWQsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGF2Z0VmZmVjdGl2ZW5lc3MgPVxuICAgICAgICAgICAgY29tcGxldGVkLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICA/IGNvbXBsZXRlZC5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgICAgKHN1bSwgaSkgPT4gc3VtICsgKGkuZWZmZWN0aXZlbmVzcyB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgKSAvIGNvbXBsZXRlZC5sZW5ndGhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsSW1wcm92ZW1lbnRzOiBhbGxJbXByb3ZlbWVudHMubGVuZ3RoLFxuICAgICAgICAgICAgY29tcGxldGVkSW1wcm92ZW1lbnRzOiBjb21wbGV0ZWQubGVuZ3RoLFxuICAgICAgICAgICAgYXZlcmFnZUVmZmVjdGl2ZW5lc3M6IE1hdGgucm91bmQoYXZnRWZmZWN0aXZlbmVzcyAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgICBwZW5kaW5nU3VnZ2VzdGlvbnM6IGFsbEltcHJvdmVtZW50cy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgKGkpID0+IGkuc3RhdHVzID09PSBcInByb3Bvc2VkXCIsXG4gICAgICAgICAgICApLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogU2luZ2xldG9uIGluc3RhbmNlXG4gKi9cbmxldCBkZWZhdWx0VHJhY2tlcjogU2VsZkltcHJvdmVtZW50VHJhY2tlciB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZkltcHJvdmVtZW50VHJhY2tlcihcbiAgICBtZW1vcnlNYW5hZ2VyPzogTWVtb3J5TWFuYWdlcixcbiAgICByZWdpc3RyeT86IEFnZW50UmVnaXN0cnksXG4gICAgY29vcmRpbmF0b3I/OiBBZ2VudENvb3JkaW5hdG9yLFxuKTogU2VsZkltcHJvdmVtZW50VHJhY2tlciB7XG4gICAgaWYgKCFkZWZhdWx0VHJhY2tlciAmJiBtZW1vcnlNYW5hZ2VyICYmIHJlZ2lzdHJ5ICYmIGNvb3JkaW5hdG9yKSB7XG4gICAgICAgIGRlZmF1bHRUcmFja2VyID0gbmV3IFNlbGZJbXByb3ZlbWVudFRyYWNrZXIoXG4gICAgICAgICAgICBtZW1vcnlNYW5hZ2VyLFxuICAgICAgICAgICAgcmVnaXN0cnksXG4gICAgICAgICAgICBjb29yZGluYXRvcixcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRUcmFja2VyITtcbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7QUFPQTtBQUFBO0FBbURPLE1BQU0sK0JBQStCLGFBQWE7QUFBQSxFQUM3QztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxlQUErQyxJQUFJO0FBQUEsRUFDbkQscUJBQXVELElBQUk7QUFBQSxFQUVuRSxXQUFXLENBQ1AsZUFDQSxVQUNBLGFBQ0Y7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLEtBQUssZ0JBQWdCO0FBQUEsSUFDckIsS0FBSyxXQUFXO0FBQUEsSUFDaEIsS0FBSyxjQUFjO0FBQUEsSUFDbkIsS0FBSyxvQkFBb0I7QUFBQTtBQUFBLE9BTXZCLGdCQUFlLENBQUMsV0FBMEM7QUFBQSxJQUM1RCxNQUFNLFlBQVksVUFBVTtBQUFBLElBRTVCLElBQUksQ0FBQyxLQUFLLG1CQUFtQixJQUFJLFNBQVMsR0FBRztBQUFBLE1BQ3pDLEtBQUssbUJBQW1CLElBQUksV0FBVyxDQUFDLENBQUM7QUFBQSxJQUM3QztBQUFBLElBRUEsS0FBSyxtQkFBbUIsSUFBSSxTQUFTLEdBQUcsS0FBSyxTQUFTO0FBQUEsSUFHdEQsTUFBTSxVQUFVLEtBQUssbUJBQW1CLElBQUksU0FBUztBQUFBLElBQ3JELElBQUksUUFBUSxTQUFTLEtBQUs7QUFBQSxNQUN0QixRQUFRLE9BQU8sR0FBRyxRQUFRLFNBQVMsR0FBRztBQUFBLElBQzFDO0FBQUEsSUFHQSxNQUFNLEtBQUssY0FBYyxVQUNyQixZQUNBLG9CQUFvQixhQUFhLFVBQVUsVUFBVSxjQUFjLGVBQWUsVUFBVSxtQkFDNUY7QUFBQSxNQUNJLFFBQVE7QUFBQSxNQUNSLFNBQVMsZ0JBQWdCLHNCQUFzQixVQUFVO0FBQUEsTUFDekQsTUFBTTtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsUUFDQSxVQUFVLFVBQVUsWUFBWTtBQUFBLE1BQ3BDO0FBQUEsTUFDQSxZQUFZO0FBQUEsSUFDaEIsQ0FDSjtBQUFBLElBR0EsTUFBTSxLQUFLLDJCQUEyQixTQUFTO0FBQUE7QUFBQSxPQU03QywyQkFBMEIsQ0FDNUIsV0FDNkI7QUFBQSxJQUM3QixNQUFNLFdBQWlDLENBQUM7QUFBQSxJQUV4QyxNQUFNLGtCQUFrQixZQUNsQixDQUFDLFNBQVMsSUFDVixNQUFNLEtBQUssS0FBSyxtQkFBbUIsS0FBSyxDQUFDO0FBQUEsSUFFL0MsV0FBVyxTQUFTLGlCQUFpQjtBQUFBLE1BQ2pDLE1BQU0sYUFBYSxLQUFLLG1CQUFtQixJQUFJLEtBQUssS0FBSyxDQUFDO0FBQUEsTUFDMUQsSUFBSSxXQUFXLFNBQVM7QUFBQSxRQUFHO0FBQUEsTUFHM0IsTUFBTSxxQkFBcUIsS0FBSyxtQkFDNUIsT0FDQSxVQUNKO0FBQUEsTUFDQSxJQUFJO0FBQUEsUUFBb0IsU0FBUyxLQUFLLGtCQUFrQjtBQUFBLE1BR3hELE1BQU0sdUJBQXVCLEtBQUsscUJBQzlCLE9BQ0EsVUFDSjtBQUFBLE1BQ0EsSUFBSTtBQUFBLFFBQXNCLFNBQVMsS0FBSyxvQkFBb0I7QUFBQSxNQUc1RCxNQUFNLGVBQWUsS0FBSyxxQkFBcUIsT0FBTyxVQUFVO0FBQUEsTUFDaEUsSUFBSTtBQUFBLFFBQWMsU0FBUyxLQUFLLFlBQVk7QUFBQSxJQUNoRDtBQUFBLElBR0EsV0FBVyxXQUFXLFVBQVU7QUFBQSxNQUM1QixJQUNJLFFBQVEsYUFBYSxVQUNyQixRQUFRLGFBQWEsWUFDdkI7QUFBQSxRQUNFLE1BQU0sS0FBSyw4QkFBOEIsT0FBTztBQUFBLE1BQ3BEO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsT0FNTCw4QkFBNkIsQ0FDL0IsU0FDZTtBQUFBLElBQ2YsTUFBTSxnQkFBZ0IsV0FBVyxLQUFLLElBQUksS0FBSyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsQ0FBQztBQUFBLElBRXhGLE1BQU0sY0FBaUM7QUFBQSxNQUNuQyxJQUFJO0FBQUEsTUFDSixNQUFNLEtBQUssNEJBQTRCLFFBQVEsT0FBTztBQUFBLE1BQ3RELFFBQVEsUUFBUTtBQUFBLE1BQ2hCLE9BQU8sV0FBVyxRQUFRLGVBQWUsUUFBUTtBQUFBLE1BQ2pELGFBQWEsUUFBUTtBQUFBLE1BQ3JCLFFBQ0ksUUFBUSxhQUFhLGFBQ2YsU0FDQSxRQUFRLGFBQWEsU0FDbkIsV0FDQTtBQUFBLE1BQ1osWUFBWTtBQUFBLE1BQ1osZUFBZSxDQUFDLGFBQWEsUUFBUSx5QkFBeUI7QUFBQSxNQUM5RCxnQkFBZ0IsUUFBUTtBQUFBLE1BQ3hCLGdCQUFnQjtBQUFBLFFBQ1osV0FBVyxRQUFRLGNBQWMsUUFBUSxVQUFVLGNBQWMsY0FBYztBQUFBLFFBQy9FO0FBQUEsTUFDSjtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1IsV0FBVyxJQUFJO0FBQUEsSUFDbkI7QUFBQSxJQUVBLEtBQUssYUFBYSxJQUFJLGVBQWUsV0FBVztBQUFBLElBR2hELE1BQU0sS0FBSyxjQUFjLFVBQ3JCLGVBQ0EsMkJBQTJCLFlBQVksV0FBVyxZQUFZLGVBQzlEO0FBQUEsTUFDSSxRQUFRO0FBQUEsTUFDUixTQUFTLDRCQUE0QixRQUFRO0FBQUEsTUFDN0MsTUFBTTtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsUUFDQSxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsTUFDWjtBQUFBLE1BQ0EsWUFBWTtBQUFBLElBQ2hCLENBQ0o7QUFBQSxJQUVBLEtBQUssS0FBSyx5QkFBeUIsV0FBVztBQUFBLElBQzlDLE9BQU87QUFBQTtBQUFBLE9BTUwscUJBQW9CLENBQUMsZUFBeUM7QUFBQSxJQUNoRSxNQUFNLGNBQWMsS0FBSyxhQUFhLElBQUksYUFBYTtBQUFBLElBQ3ZELElBQUksQ0FBQyxlQUFlLFlBQVksV0FBVyxZQUFZO0FBQUEsTUFDbkQsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUVBLFlBQVksU0FBUztBQUFBLElBQ3JCLEtBQUssS0FBSyx1QkFBdUIsV0FBVztBQUFBLElBRTVDLElBQUk7QUFBQSxNQUVBLE1BQU0sVUFBVSxNQUFNLEtBQUssbUJBQW1CLFdBQVc7QUFBQSxNQUV6RCxJQUFJLFNBQVM7QUFBQSxRQUNULFlBQVksU0FBUztBQUFBLFFBQ3JCLFlBQVksZ0JBQWdCLElBQUk7QUFBQSxRQUNoQyxLQUFLLEtBQUsseUJBQXlCLFdBQVc7QUFBQSxNQUNsRCxFQUFPO0FBQUEsUUFDSCxZQUFZLFNBQVM7QUFBQSxRQUNyQixLQUFLLEtBQUssc0JBQXNCLFdBQVc7QUFBQTtBQUFBLE1BRy9DLE9BQU87QUFBQSxNQUNULE9BQU8sT0FBTztBQUFBLE1BQ1osWUFBWSxTQUFTO0FBQUEsTUFDckIsS0FBSyxLQUFLLHNCQUFzQixFQUFFLGFBQWEsTUFBTSxDQUFDO0FBQUEsTUFDdEQsT0FBTztBQUFBO0FBQUE7QUFBQSxFQU9mLHNCQUFzQixHQUF3QjtBQUFBLElBQzFDLE9BQU8sTUFBTSxLQUFLLEtBQUssYUFBYSxPQUFPLENBQUMsRUFBRSxPQUMxQyxDQUFDLFFBQVEsSUFBSSxXQUFXLGNBQWMsSUFBSSxXQUFXLFVBQ3pEO0FBQUE7QUFBQSxFQU1KLDBCQUEwQixHQUF3QjtBQUFBLElBQzlDLE9BQU8sTUFBTSxLQUFLLEtBQUssYUFBYSxPQUFPLENBQUMsRUFBRSxPQUMxQyxDQUFDLFFBQ0csSUFBSSxXQUFXLGVBQWUsSUFBSSxrQkFBa0IsU0FDNUQ7QUFBQTtBQUFBLE9BTUUscUJBQW9CLENBQUMsZUFBd0M7QUFBQSxJQUMvRCxNQUFNLGNBQWMsS0FBSyxhQUFhLElBQUksYUFBYTtBQUFBLElBQ3ZELElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxlQUFlO0FBQUEsTUFDNUMsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUdBLE1BQU0sWUFBWSxZQUFZO0FBQUEsSUFDOUIsTUFBTSxhQUFhLEtBQUssbUJBQW1CLElBQUksU0FBUyxLQUFLLENBQUM7QUFBQSxJQUU5RCxNQUFNLGtCQUFrQixXQUFXLE9BQy9CLENBQUMsTUFBTSxFQUFFLFlBQVksWUFBWSxhQUNyQztBQUFBLElBQ0EsTUFBTSxpQkFBaUIsV0FBVyxPQUM5QixDQUFDLE1BQU0sRUFBRSxhQUFhLFlBQVksYUFDdEM7QUFBQSxJQUVBLElBQUksZ0JBQWdCLFNBQVMsS0FBSyxlQUFlLFNBQVMsR0FBRztBQUFBLE1BQ3pELE9BQU87QUFBQSxJQUNYO0FBQUEsSUFHQSxJQUFJLGdCQUFnQjtBQUFBLElBRXBCLFFBQVEsWUFBWTtBQUFBLFdBQ1gsZ0JBQWdCO0FBQUEsUUFFakIsTUFBTSxnQkFDRixnQkFBZ0IsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FDekMsZ0JBQWdCO0FBQUEsUUFDcEIsTUFBTSxlQUNGLGVBQWUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FDeEMsZUFBZTtBQUFBLFFBQ25CLGdCQUFnQixLQUFLLElBQ2pCLEdBQ0EsS0FBSyxJQUFJLElBQUksZUFBZSxpQkFBaUIsQ0FBQyxDQUNsRDtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsV0FFSyxjQUFjO0FBQUEsUUFFZixNQUFNLGdCQUNGLGdCQUFnQixPQUNaLENBQUMsS0FBSyxNQUFNLE1BQU0sRUFBRSxlQUNwQixDQUNKLElBQUksZ0JBQWdCO0FBQUEsUUFDeEIsTUFBTSxlQUNGLGVBQWUsT0FDWCxDQUFDLEtBQUssTUFBTSxNQUFNLEVBQUUsZUFDcEIsQ0FDSixJQUFJLGVBQWU7QUFBQSxRQUN2QixNQUFNLG1CQUNELGdCQUFnQixnQkFBZ0I7QUFBQSxRQUNyQyxnQkFBZ0IsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsZUFBZSxDQUFDO0FBQUEsUUFDeEQ7QUFBQSxNQUNKO0FBQUE7QUFBQSxRQUdJLGdCQUFnQjtBQUFBO0FBQUEsSUFHeEIsWUFBWSxnQkFBZ0I7QUFBQSxJQUM1QixPQUFPO0FBQUE7QUFBQSxFQUdILGtCQUFrQixDQUN0QixXQUNBLFlBQ3lCO0FBQUEsSUFDekIsTUFBTSxTQUFTLFdBQVcsTUFBTSxHQUFHO0FBQUEsSUFDbkMsSUFBSSxPQUFPLFNBQVM7QUFBQSxNQUFJLE9BQU87QUFBQSxJQUUvQixNQUFNLGNBQ0YsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLE9BQU87QUFBQSxJQUNwRCxNQUFNLFFBQVEsV0FBVyxNQUFNLEtBQUssR0FBRztBQUFBLElBQ3ZDLE1BQU0sbUJBQ0YsTUFBTSxTQUFTLElBQ1QsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLE1BQU0sU0FDOUM7QUFBQSxJQUVWLE1BQU0sU0FBUyxjQUFjO0FBQUEsSUFDN0IsTUFBTSxZQUFZO0FBQUEsSUFFbEIsSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLFdBQVc7QUFBQSxNQUM5QixPQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLFFBQ1AsVUFBVTtBQUFBLFFBQ1YsYUFBYSxHQUFHLHdDQUF3QyxjQUFjLEtBQUssUUFBUSxDQUFDO0FBQUEsUUFDcEYsVUFBVTtBQUFBLFVBQ04sYUFBYSxjQUFjLEtBQUssUUFBUSxDQUFDO0FBQUEsVUFDekMsY0FBYyxtQkFBbUIsS0FBSyxRQUFRLENBQUM7QUFBQSxRQUNuRDtBQUFBLFFBQ0Esa0JBQWtCO0FBQUEsVUFDZDtBQUFBLFVBQ0E7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVCxPQUFPLFNBQVMsSUFBSSxjQUFjO0FBQUEsTUFDbEMsVUFBVSxLQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQzVDLGFBQWEsR0FBRyw2QkFBNkIsU0FBUyxJQUFJLGNBQWMsaUJBQWlCLFNBQVMsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUNoSCxVQUFVO0FBQUEsUUFDTixhQUFhLGNBQWMsS0FBSyxRQUFRLENBQUM7QUFBQSxRQUN6QyxZQUFZLFNBQVMsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUN2QztBQUFBLE1BQ0Esa0JBQ0ksU0FBUyxJQUNIO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUNKLElBQ0E7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDZDtBQUFBO0FBQUEsRUFHSSxvQkFBb0IsQ0FDeEIsV0FDQSxZQUN5QjtBQUFBLElBQ3pCLE1BQU0sU0FBUyxXQUFXLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTztBQUFBLElBQzVELElBQUksT0FBTyxTQUFTO0FBQUEsTUFBRyxPQUFPO0FBQUEsSUFFOUIsTUFBTSxVQUNGLE9BQU8sT0FBTyxDQUFDLEtBQUssTUFBTSxNQUFNLEVBQUUsZUFBZSxDQUFDLElBQUksT0FBTztBQUFBLElBQ2pFLE1BQU0sUUFBUSxXQUFXLE1BQU0sS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPO0FBQUEsSUFDaEUsTUFBTSxlQUNGLE1BQU0sU0FBUyxJQUNULE1BQU0sT0FBTyxDQUFDLEtBQUssTUFBTSxNQUFNLEVBQUUsZUFBZSxDQUFDLElBQ2pELE1BQU0sU0FDTjtBQUFBLElBRVYsTUFBTSxpQkFBaUIsVUFBVSxnQkFBZ0I7QUFBQSxJQUNqRCxNQUFNLFlBQVk7QUFBQSxJQUVsQixJQUFJLEtBQUssSUFBSSxhQUFhLElBQUk7QUFBQSxNQUFXLE9BQU87QUFBQSxJQUVoRCxPQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1QsT0FBTyxnQkFBZ0IsSUFBSSxjQUFjO0FBQUEsTUFDekMsVUFBVSxLQUFLLElBQUksYUFBYSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ25ELGFBQWEsR0FBRyw0QkFBNEIsZ0JBQWdCLElBQUksYUFBYSxtQkFBbUIsS0FBSyxJQUFJLGFBQWEsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQ3hJLFVBQVU7QUFBQSxRQUNOLGdCQUFnQixRQUFRLFFBQVEsQ0FBQztBQUFBLFFBQ2pDLGlCQUFpQixhQUFhLFFBQVEsQ0FBQztBQUFBLE1BQzNDO0FBQUEsTUFDQSxrQkFDSSxnQkFBZ0IsSUFDVjtBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFDSixJQUNBO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ2Q7QUFBQTtBQUFBLEVBR0ksb0JBQW9CLENBQ3hCLFdBQ0EsWUFDeUI7QUFBQSxJQUN6QixNQUFNLFNBQVMsV0FBVyxNQUFNLEdBQUc7QUFBQSxJQUNuQyxNQUFNLFlBQ0YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsT0FBTztBQUFBLElBRXJELElBQUksWUFBWTtBQUFBLE1BQUssT0FBTztBQUFBLElBRTVCLE1BQU0sZ0JBQWdCLE9BQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUNuQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQU0sRUFDbkIsT0FDRyxDQUFDLEtBQUssVUFBVTtBQUFBLE1BQ1osSUFBSSxVQUFVLElBQUksVUFBVSxLQUFLO0FBQUEsTUFDakMsT0FBTztBQUFBLE9BRVgsQ0FBQyxDQUNMO0FBQUEsSUFFSixNQUFNLFlBQVksT0FBTyxRQUFRLGFBQWEsRUFDekMsS0FBSyxJQUFJLE9BQU8sT0FBTyxJQUFJLENBQUMsRUFDNUIsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUVmLE9BQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxVQUNJLFlBQVksTUFDTixhQUNBLFlBQVksTUFDVixTQUNBO0FBQUEsTUFDWixhQUFhLEdBQUcsa0JBQWtCLFlBQVksS0FBSyxRQUFRLENBQUM7QUFBQSxNQUM1RCxVQUFVLFVBQVUsSUFDaEIsRUFBRSxPQUFPLFdBQVcsR0FBRyxVQUFVLGFBQ3JDO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBR0ksMkJBQTJCLENBQy9CLFNBQ3lCO0FBQUEsSUFDekIsUUFBUTtBQUFBLFdBQ0M7QUFBQSxRQUNELE9BQU87QUFBQSxXQUNOO0FBQUEsUUFDRCxPQUFPO0FBQUEsV0FDTjtBQUFBLFFBQ0QsT0FBTztBQUFBLFdBQ047QUFBQSxRQUNELE9BQU87QUFBQTtBQUFBLFFBRVAsT0FBTztBQUFBO0FBQUE7QUFBQSxPQUlMLG1CQUFrQixDQUM1QixhQUNnQjtBQUFBLElBRWhCLFFBQVEsWUFBWTtBQUFBLFdBQ1g7QUFBQSxRQUNELE9BQU8sTUFBTSxLQUFLLGtCQUFrQixXQUFXO0FBQUEsV0FDOUM7QUFBQSxRQUNELE9BQU8sTUFBTSxLQUFLLG1CQUFtQixXQUFXO0FBQUEsV0FDL0M7QUFBQSxRQUNELE9BQU8sTUFBTSxLQUFLLGlCQUFpQixXQUFXO0FBQUEsV0FDN0M7QUFBQSxRQUNELE9BQU8sTUFBTSxLQUFLLG9CQUFvQixXQUFXO0FBQUEsV0FDaEQ7QUFBQSxRQUNELE9BQU8sTUFBTSxLQUFLLHFCQUFxQixXQUFXO0FBQUE7QUFBQSxRQUVsRCxPQUFPO0FBQUE7QUFBQTtBQUFBLE9BSUwsa0JBQWlCLENBQzNCLGFBQ2dCO0FBQUEsSUFFaEIsTUFBTSxZQUFZLFlBQVk7QUFBQSxJQUM5QixNQUFNLFFBQVEsS0FBSyxTQUFTLElBQUksU0FBUztBQUFBLElBRXpDLElBQUksQ0FBQztBQUFBLE1BQU8sT0FBTztBQUFBLElBR25CLE1BQU0saUJBQWlCLEdBQUcsTUFBTTtBQUFBO0FBQUE7QUFBQSxFQUFxQyxZQUFZO0FBQUEsRUFBZ0IsWUFBWSxlQUFlLEtBQUs7QUFBQSxDQUFJO0FBQUEsSUFHcEksTUFBYyxTQUFTO0FBQUEsSUFFeEIsT0FBTztBQUFBO0FBQUEsT0FHRyxtQkFBa0IsQ0FDNUIsYUFDZ0I7QUFBQSxJQUVoQixNQUFNLFlBQVksWUFBWTtBQUFBLElBQzlCLE1BQU0sUUFBUSxLQUFLLFNBQVMsSUFBSSxTQUFTO0FBQUEsSUFFekMsSUFBSSxDQUFDO0FBQUEsTUFBTyxPQUFPO0FBQUEsSUFHbkIsTUFBTSxnQkFBZ0IsWUFBWSxNQUM3QixZQUFZLEVBQ1osUUFBUSxRQUFRLEdBQUc7QUFBQSxJQUN4QixJQUFJLENBQUMsTUFBTSxhQUFhLFNBQVMsYUFBYSxHQUFHO0FBQUEsTUFDN0MsTUFBTSxhQUFhLEtBQUssYUFBYTtBQUFBLElBQ3pDO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxPQUdHLGlCQUFnQixDQUMxQixhQUNnQjtBQUFBLElBR2hCLE9BQU87QUFBQTtBQUFBLE9BR0csb0JBQW1CLENBQzdCLGFBQ2dCO0FBQUEsSUFFaEIsT0FBTztBQUFBO0FBQUEsT0FHRyxxQkFBb0IsQ0FDOUIsYUFDZ0I7QUFBQSxJQUVoQixPQUFPO0FBQUE7QUFBQSxFQUdILG1CQUFtQixHQUFTO0FBQUEsSUFDaEMsS0FBSyxHQUFHLHlCQUF5QixDQUFDLGdCQUFtQztBQUFBLE1BQ2pFLFFBQVEsSUFDSix1Q0FBNEIsWUFBWSxVQUFVLFlBQVksZ0JBQ2xFO0FBQUEsS0FDSDtBQUFBLElBRUQsS0FBSyxHQUFHLHlCQUF5QixDQUFDLGdCQUFtQztBQUFBLE1BQ2pFLFFBQVEsSUFBSSw4QkFBNkIsWUFBWSxPQUFPO0FBQUEsS0FDL0Q7QUFBQSxJQUVELEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxnQkFBbUM7QUFBQSxNQUM5RCxRQUFRLElBQUkseUJBQXdCLFlBQVksT0FBTztBQUFBLEtBQzFEO0FBQUE7QUFBQSxFQU1MLFFBQVEsR0FLTjtBQUFBLElBQ0UsTUFBTSxrQkFBa0IsTUFBTSxLQUFLLEtBQUssYUFBYSxPQUFPLENBQUM7QUFBQSxJQUM3RCxNQUFNLFlBQVksZ0JBQWdCLE9BQzlCLENBQUMsTUFBTSxFQUFFLFdBQVcsZUFBZSxFQUFFLGtCQUFrQixTQUMzRDtBQUFBLElBQ0EsTUFBTSxtQkFDRixVQUFVLFNBQVMsSUFDYixVQUFVLE9BQ04sQ0FBQyxLQUFLLE1BQU0sT0FBTyxFQUFFLGlCQUFpQixJQUN0QyxDQUNKLElBQUksVUFBVSxTQUNkO0FBQUEsSUFFVixPQUFPO0FBQUEsTUFDSCxtQkFBbUIsZ0JBQWdCO0FBQUEsTUFDbkMsdUJBQXVCLFVBQVU7QUFBQSxNQUNqQyxzQkFBc0IsS0FBSyxNQUFNLG1CQUFtQixHQUFHLElBQUk7QUFBQSxNQUMzRCxvQkFBb0IsZ0JBQWdCLE9BQ2hDLENBQUMsTUFBTSxFQUFFLFdBQVcsVUFDeEIsRUFBRTtBQUFBLElBQ047QUFBQTtBQUVSO0FBS0EsSUFBSSxpQkFBZ0Q7QUFFN0MsU0FBUyx5QkFBeUIsQ0FDckMsZUFDQSxVQUNBLGFBQ3NCO0FBQUEsRUFDdEIsSUFBSSxDQUFDLGtCQUFrQixpQkFBaUIsWUFBWSxhQUFhO0FBQUEsSUFDN0QsaUJBQWlCLElBQUksdUJBQ2pCLGVBQ0EsVUFDQSxXQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTztBQUFBOyIsCiAgImRlYnVnSWQiOiAiMzg3Mzg1N0MzODY0RjQ4MjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
