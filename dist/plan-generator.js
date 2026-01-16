// src/agents/plan-generator.ts
class PlanGenerator {
  coordinator;
  constructor(coordinator) {
    this.coordinator = coordinator;
  }
  async generatePlan(input) {
    const startTime = Date.now();
    try {
      const tasks = this.createPlanGenerationTasks(input);
      const results = await this.coordinator.executeTasks(tasks, {
        type: "parallel",
        weights: {
          ["architect-advisor" /* ARCHITECT_ADVISOR */]: 0.4,
          ["backend-architect" /* BACKEND_ARCHITECT */]: 0.3,
          ["frontend-reviewer" /* FRONTEND_REVIEWER */]: 0.3
        },
        conflictResolution: "highest_confidence"
      });
      const plan = this.aggregatePlanResults(results, input);
      const executionTime = Date.now() - startTime;
      return {
        plan,
        confidence: this.calculateOverallConfidence(results),
        reasoning: this.generateReasoning(results, input),
        suggestions: this.generateSuggestions(results)
      };
    } catch (error) {
      throw new Error(`Plan generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async generateScopedPlan(input, scope) {
    const scopedInput = {
      ...input,
      scope: scope === "full" ? input.scope : scope
    };
    return this.generatePlan(scopedInput);
  }
  async validatePlan(plan) {
    const validationTasks = [
      {
        id: "validate-architecture",
        type: "architect-advisor" /* ARCHITECT_ADVISOR */,
        name: "Architecture Validation",
        description: "Validate architectural aspects of the plan",
        input: {
          type: "architect-advisor" /* ARCHITECT_ADVISOR */,
          context: { plan, validationType: "architecture" },
          parameters: { strictMode: true }
        },
        strategy: "sequential" /* SEQUENTIAL */
      },
      {
        id: "validate-security",
        type: "security-scanner" /* SECURITY_SCANNER */,
        name: "Security Validation",
        description: "Validate security aspects of the plan",
        input: {
          type: "security-scanner" /* SECURITY_SCANNER */,
          context: { plan, validationType: "security" },
          parameters: { severity: "high" }
        },
        strategy: "sequential" /* SEQUENTIAL */
      },
      {
        id: "validate-performance",
        type: "performance-engineer" /* PERFORMANCE_ENGINEER */,
        name: "Performance Validation",
        description: "Validate performance aspects of the plan",
        input: {
          type: "performance-engineer" /* PERFORMANCE_ENGINEER */,
          context: { plan, validationType: "performance" },
          parameters: { threshold: "medium" }
        },
        strategy: "sequential" /* SEQUENTIAL */
      }
    ];
    const results = await this.coordinator.executeTasks(validationTasks, {
      type: "parallel",
      conflictResolution: "highest_confidence"
    });
    return this.aggregateValidationResults(results);
  }
  createPlanGenerationTasks(input) {
    const baseContext = {
      description: input.description,
      scope: input.scope,
      requirements: input.requirements,
      constraints: input.constraints,
      context: input.context
    };
    const tasks = [];
    tasks.push({
      id: "plan-architecture",
      type: "architect-advisor" /* ARCHITECT_ADVISOR */,
      name: "Architecture Planning",
      description: "Analyze requirements and create architectural plan",
      input: {
        type: "architect-advisor" /* ARCHITECT_ADVISOR */,
        context: {
          ...baseContext,
          focus: "architecture",
          deliverables: [
            "system-design",
            "component-structure",
            "data-flow"
          ]
        },
        parameters: {
          detailLevel: "high",
          includeDiagrams: true
        }
      },
      strategy: "sequential" /* SEQUENTIAL */,
      timeout: 15000
    });
    tasks.push({
      id: "plan-backend",
      type: "backend-architect" /* BACKEND_ARCHITECT */,
      name: "Backend Planning",
      description: "Create backend implementation plan",
      input: {
        type: "backend-architect" /* BACKEND_ARCHITECT */,
        context: {
          ...baseContext,
          focus: "backend",
          deliverables: [
            "api-design",
            "database-schema",
            "business-logic"
          ]
        },
        parameters: {
          includeTesting: true,
          includeDeployment: true
        }
      },
      strategy: "sequential" /* SEQUENTIAL */,
      timeout: 12000
    });
    tasks.push({
      id: "plan-frontend",
      type: "frontend-reviewer" /* FRONTEND_REVIEWER */,
      name: "Frontend Planning",
      description: "Create frontend implementation plan",
      input: {
        type: "frontend-reviewer" /* FRONTEND_REVIEWER */,
        context: {
          ...baseContext,
          focus: "frontend",
          deliverables: [
            "ui-components",
            "user-flows",
            "state-management"
          ]
        },
        parameters: {
          includeAccessibility: true,
          includeResponsive: true
        }
      },
      strategy: "sequential" /* SEQUENTIAL */,
      timeout: 12000
    });
    if (this.isSEORelevant(input)) {
      tasks.push({
        id: "plan-seo",
        type: "seo-specialist" /* SEO_SPECIALIST */,
        name: "SEO Planning",
        description: "Create SEO optimization plan",
        input: {
          type: "seo-specialist" /* SEO_SPECIALIST */,
          context: {
            ...baseContext,
            focus: "seo",
            deliverables: [
              "meta-tags",
              "structured-data",
              "performance-optimization"
            ]
          },
          parameters: {
            targetAudience: "general",
            priority: "medium"
          }
        },
        strategy: "sequential" /* SEQUENTIAL */,
        timeout: 8000
      });
    }
    return tasks;
  }
  aggregatePlanResults(results, input) {
    const successfulResults = results.filter((r) => r.status === "completed" /* COMPLETED */ && r.output?.success);
    if (successfulResults.length === 0) {
      return {
        name: this.generatePlanName(input.description),
        description: `Fallback plan generated without successful agent results. Original request: ${input.description}`,
        tasks: [],
        dependencies: [],
        metadata: {
          generatedBy: "PlanGenerator",
          generatedAt: new Date().toISOString(),
          agentCount: 0,
          inputScope: input.scope
        }
      };
    }
    const allTasks = [];
    const dependencies = [];
    for (const result of successfulResults) {
      if (result.output?.result?.tasks) {
        allTasks.push(...result.output.result.tasks);
      }
      if (result.output?.result?.dependencies) {
        dependencies.push(...result.output.result.dependencies);
      }
    }
    const planName = this.generatePlanName(input.description);
    const planDescription = this.generatePlanDescription(input, successfulResults);
    return {
      name: planName,
      description: planDescription,
      tasks: this.deduplicateAndOrganizeTasks(allTasks),
      dependencies: this.resolveDependencies(dependencies),
      metadata: {
        generatedBy: "PlanGenerator",
        generatedAt: new Date().toISOString(),
        agentCount: successfulResults.length,
        inputScope: input.scope
      }
    };
  }
  calculateOverallConfidence(results) {
    const successfulResults = results.filter((r) => r.status === "completed" /* COMPLETED */ && r.output?.success);
    if (successfulResults.length === 0) {
      return "low" /* LOW */;
    }
    const confidenceValues = successfulResults.map((r) => {
      const confidence = r.output?.confidence;
      switch (confidence) {
        case "very_high" /* VERY_HIGH */:
          return 1;
        case "high" /* HIGH */:
          return 0.75;
        case "medium" /* MEDIUM */:
          return 0.5;
        case "low" /* LOW */:
          return 0.25;
        default:
          return 0.5;
      }
    });
    const averageConfidence = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
    if (averageConfidence >= 0.9)
      return "very_high" /* VERY_HIGH */;
    if (averageConfidence >= 0.7)
      return "high" /* HIGH */;
    if (averageConfidence >= 0.5)
      return "medium" /* MEDIUM */;
    return "low" /* LOW */;
  }
  generateReasoning(results, input) {
    const successfulResults = results.filter((r) => r.status === "completed" /* COMPLETED */ && r.output?.success);
    const reasonings = successfulResults.map((r) => r.output?.reasoning || "").filter(Boolean);
    return `Generated comprehensive plan based on: ${input.description}. ` + `Analyzed by ${successfulResults.length} specialized agents. ` + `Key considerations: ${reasonings.join("; ")}`;
  }
  generateSuggestions(results) {
    const suggestions = [];
    const successfulResults = results.filter((r) => r.status === "completed" /* COMPLETED */ && r.output?.success);
    for (const result of successfulResults) {
      if (result.output?.result?.suggestions) {
        suggestions.push(...result.output.result.suggestions);
      }
    }
    suggestions.push("Review generated tasks for completeness and accuracy");
    suggestions.push("Consider adding testing tasks if not already included");
    suggestions.push("Validate dependencies before execution");
    return [...new Set(suggestions)];
  }
  aggregateValidationResults(results) {
    const issues = [];
    const enhancements = [];
    let isValid = true;
    for (const result of results) {
      if (result.status === "completed" /* COMPLETED */ && result.output?.success) {
        if (result.output?.result?.issues) {
          issues.push(...result.output.result.issues);
          if (result.output.result.issues.some((issue) => issue.severity === "critical")) {
            isValid = false;
          }
        }
        if (result.output?.result?.enhancements) {
          enhancements.push(...result.output.result.enhancements);
        }
      } else {
        isValid = false;
        issues.push(`Validation failed for ${result.type}`);
      }
    }
    return {
      isValid,
      issues: [...new Set(issues)],
      enhancements: [...new Set(enhancements)],
      confidence: isValid ? "high" /* HIGH */ : "medium" /* MEDIUM */
    };
  }
  isSEORelevant(input) {
    const seoKeywords = [
      "website",
      "web app",
      "frontend",
      "user-facing",
      "public",
      "marketing"
    ];
    const description = input.description.toLowerCase();
    return seoKeywords.some((keyword) => description.includes(keyword));
  }
  generatePlanName(description) {
    const words = description.split(" ").slice(0, 5).join("-");
    return `${words}-implementation-plan`;
  }
  generatePlanDescription(input, results) {
    const agentTypes = results.map((r) => r.type).join(", ");
    return `Implementation plan for: ${input.description}. ` + `Generated by: ${agentTypes}. ` + `Scope: ${input.scope || "full"}.`;
  }
  deduplicateAndOrganizeTasks(tasks) {
    const seen = new Set;
    const organized = [];
    for (const task of tasks) {
      const key = `${task.name}-${task.command || task.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        organized.push({
          id: task.id || `task-${organized.length + 1}`,
          name: task.name || "Unnamed Task",
          description: task.description || "",
          command: task.command || "",
          dependsOn: task.dependsOn || [],
          ...task
        });
      }
    }
    return organized;
  }
  resolveDependencies(dependencies) {
    const unique = new Set;
    const resolved = [];
    for (const dep of dependencies) {
      const key = dep.join("-");
      if (!unique.has(key)) {
        unique.add(key);
        resolved.push(dep);
      }
    }
    return resolved;
  }
}
export {
  PlanGenerator
};

//# debugId=1396F82B2087964664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FnZW50cy9wbGFuLWdlbmVyYXRvci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFBsYW4gZ2VuZXJhdGlvbiBmcm9tIGRlc2NyaXB0aW9ucyB1c2luZyBhZ2VudCBjb2xsYWJvcmF0aW9uLlxuICogQ29vcmRpbmF0ZXMgbXVsdGlwbGUgYWdlbnRzIHRvIGNyZWF0ZSBjb21wcmVoZW5zaXZlIGltcGxlbWVudGF0aW9uIHBsYW5zLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQWdlbnRDb29yZGluYXRvciB9IGZyb20gXCIuL2Nvb3JkaW5hdG9yXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgQWdlbnRUYXNrLFxuICAgIEFnZW50VGFza1N0YXR1cyxcbiAgICBBZ2VudFR5cGUsXG4gICAgQWdncmVnYXRpb25TdHJhdGVneSxcbiAgICBDb25maWRlbmNlTGV2ZWwsXG4gICAgRXhlY3V0aW9uU3RyYXRlZ3ksXG4gICAgdHlwZSBQbGFuR2VuZXJhdGlvbklucHV0LFxuICAgIHR5cGUgUGxhbkdlbmVyYXRpb25PdXRwdXQsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBQbGFuR2VuZXJhdG9yIHtcbiAgICBwcml2YXRlIGNvb3JkaW5hdG9yOiBBZ2VudENvb3JkaW5hdG9yO1xuXG4gICAgY29uc3RydWN0b3IoY29vcmRpbmF0b3I6IEFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgdGhpcy5jb29yZGluYXRvciA9IGNvb3JkaW5hdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgY29tcHJlaGVuc2l2ZSBwbGFuIGZyb20gYSBuYXR1cmFsIGxhbmd1YWdlIGRlc2NyaXB0aW9uXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGdlbmVyYXRlUGxhbihcbiAgICAgICAgaW5wdXQ6IFBsYW5HZW5lcmF0aW9uSW5wdXQsXG4gICAgKTogUHJvbWlzZTxQbGFuR2VuZXJhdGlvbk91dHB1dD4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYWdlbnQgdGFza3MgZm9yIHBsYW4gZ2VuZXJhdGlvblxuICAgICAgICAgICAgY29uc3QgdGFza3MgPSB0aGlzLmNyZWF0ZVBsYW5HZW5lcmF0aW9uVGFza3MoaW5wdXQpO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRhc2tzIHdpdGggcGFyYWxsZWwgc3RyYXRlZ3kgZm9yIGVmZmljaWVuY3lcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmNvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrcyh0YXNrcywge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwicGFyYWxsZWxcIixcbiAgICAgICAgICAgICAgICB3ZWlnaHRzOiB7XG4gICAgICAgICAgICAgICAgICAgIFtBZ2VudFR5cGUuQVJDSElURUNUX0FEVklTT1JdOiAwLjQsXG4gICAgICAgICAgICAgICAgICAgIFtBZ2VudFR5cGUuQkFDS0VORF9BUkNISVRFQ1RdOiAwLjMsXG4gICAgICAgICAgICAgICAgICAgIFtBZ2VudFR5cGUuRlJPTlRFTkRfUkVWSUVXRVJdOiAwLjMsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25mbGljdFJlc29sdXRpb246IFwiaGlnaGVzdF9jb25maWRlbmNlXCIsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQWdncmVnYXRlIHJlc3VsdHMgaW50byBhIGNvbXByZWhlbnNpdmUgcGxhblxuICAgICAgICAgICAgY29uc3QgcGxhbiA9IHRoaXMuYWdncmVnYXRlUGxhblJlc3VsdHMocmVzdWx0cywgaW5wdXQpO1xuXG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25UaW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwbGFuLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IHRoaXMuY2FsY3VsYXRlT3ZlcmFsbENvbmZpZGVuY2UocmVzdWx0cyksXG4gICAgICAgICAgICAgICAgcmVhc29uaW5nOiB0aGlzLmdlbmVyYXRlUmVhc29uaW5nKHJlc3VsdHMsIGlucHV0KSxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogdGhpcy5nZW5lcmF0ZVN1Z2dlc3Rpb25zKHJlc3VsdHMpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGxhbiBnZW5lcmF0aW9uIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBwbGFuIHdpdGggc3BlY2lmaWMgc2NvcGUgY29uc3RyYWludHNcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZ2VuZXJhdGVTY29wZWRQbGFuKFxuICAgICAgICBpbnB1dDogUGxhbkdlbmVyYXRpb25JbnB1dCxcbiAgICAgICAgc2NvcGU6IFwiYXJjaGl0ZWN0dXJlXCIgfCBcImltcGxlbWVudGF0aW9uXCIgfCBcInJldmlld1wiIHwgXCJmdWxsXCIsXG4gICAgKTogUHJvbWlzZTxQbGFuR2VuZXJhdGlvbk91dHB1dD4ge1xuICAgICAgICBjb25zdCBzY29wZWRJbnB1dCA9IHtcbiAgICAgICAgICAgIC4uLmlucHV0LFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlID09PSBcImZ1bGxcIiA/IGlucHV0LnNjb3BlIDogc2NvcGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVQbGFuKHNjb3BlZElucHV0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZSBhbmQgZW5oYW5jZSBhbiBleGlzdGluZyBwbGFuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHZhbGlkYXRlUGxhbihwbGFuOiBhbnkpOiBQcm9taXNlPHtcbiAgICAgICAgaXNWYWxpZDogYm9vbGVhbjtcbiAgICAgICAgaXNzdWVzOiBzdHJpbmdbXTtcbiAgICAgICAgZW5oYW5jZW1lbnRzOiBzdHJpbmdbXTtcbiAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xuICAgIH0+IHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblRhc2tzOiBBZ2VudFRhc2tbXSA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJ2YWxpZGF0ZS1hcmNoaXRlY3R1cmVcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBBZ2VudFR5cGUuQVJDSElURUNUX0FEVklTT1IsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJBcmNoaXRlY3R1cmUgVmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlZhbGlkYXRlIGFyY2hpdGVjdHVyYWwgYXNwZWN0cyBvZiB0aGUgcGxhblwiLFxuICAgICAgICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5BUkNISVRFQ1RfQURWSVNPUixcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogeyBwbGFuLCB2YWxpZGF0aW9uVHlwZTogXCJhcmNoaXRlY3R1cmVcIiB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IHN0cmljdE1vZGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBFeGVjdXRpb25TdHJhdGVneS5TRVFVRU5USUFMLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJ2YWxpZGF0ZS1zZWN1cml0eVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5TRUNVUklUWV9TQ0FOTkVSLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiU2VjdXJpdHkgVmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlZhbGlkYXRlIHNlY3VyaXR5IGFzcGVjdHMgb2YgdGhlIHBsYW5cIixcbiAgICAgICAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBBZ2VudFR5cGUuU0VDVVJJVFlfU0NBTk5FUixcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogeyBwbGFuLCB2YWxpZGF0aW9uVHlwZTogXCJzZWN1cml0eVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgc2V2ZXJpdHk6IFwiaGlnaFwiIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJhdGVneTogRXhlY3V0aW9uU3RyYXRlZ3kuU0VRVUVOVElBTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwidmFsaWRhdGUtcGVyZm9ybWFuY2VcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBBZ2VudFR5cGUuUEVSRk9STUFOQ0VfRU5HSU5FRVIsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJQZXJmb3JtYW5jZSBWYWxpZGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVmFsaWRhdGUgcGVyZm9ybWFuY2UgYXNwZWN0cyBvZiB0aGUgcGxhblwiLFxuICAgICAgICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5QRVJGT1JNQU5DRV9FTkdJTkVFUixcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogeyBwbGFuLCB2YWxpZGF0aW9uVHlwZTogXCJwZXJmb3JtYW5jZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgdGhyZXNob2xkOiBcIm1lZGl1bVwiIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdHJhdGVneTogRXhlY3V0aW9uU3RyYXRlZ3kuU0VRVUVOVElBTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuY29vcmRpbmF0b3IuZXhlY3V0ZVRhc2tzKHZhbGlkYXRpb25UYXNrcywge1xuICAgICAgICAgICAgdHlwZTogXCJwYXJhbGxlbFwiLFxuICAgICAgICAgICAgY29uZmxpY3RSZXNvbHV0aW9uOiBcImhpZ2hlc3RfY29uZmlkZW5jZVwiLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGVWYWxpZGF0aW9uUmVzdWx0cyhyZXN1bHRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYWdlbnQgdGFza3MgZm9yIHBsYW4gZ2VuZXJhdGlvblxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlUGxhbkdlbmVyYXRpb25UYXNrcyhpbnB1dDogUGxhbkdlbmVyYXRpb25JbnB1dCk6IEFnZW50VGFza1tdIHtcbiAgICAgICAgY29uc3QgYmFzZUNvbnRleHQgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogaW5wdXQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBzY29wZTogaW5wdXQuc2NvcGUsXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IGlucHV0LnJlcXVpcmVtZW50cyxcbiAgICAgICAgICAgIGNvbnN0cmFpbnRzOiBpbnB1dC5jb25zdHJhaW50cyxcbiAgICAgICAgICAgIGNvbnRleHQ6IGlucHV0LmNvbnRleHQsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdGFza3M6IEFnZW50VGFza1tdID0gW107XG5cbiAgICAgICAgLy8gQXJjaGl0ZWN0dXJlIGFuYWx5c2lzIHRhc2tcbiAgICAgICAgdGFza3MucHVzaCh7XG4gICAgICAgICAgICBpZDogXCJwbGFuLWFyY2hpdGVjdHVyZVwiLFxuICAgICAgICAgICAgdHlwZTogQWdlbnRUeXBlLkFSQ0hJVEVDVF9BRFZJU09SLFxuICAgICAgICAgICAgbmFtZTogXCJBcmNoaXRlY3R1cmUgUGxhbm5pbmdcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkFuYWx5emUgcmVxdWlyZW1lbnRzIGFuZCBjcmVhdGUgYXJjaGl0ZWN0dXJhbCBwbGFuXCIsXG4gICAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5BUkNISVRFQ1RfQURWSVNPUixcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmb2N1czogXCJhcmNoaXRlY3R1cmVcIixcbiAgICAgICAgICAgICAgICAgICAgZGVsaXZlcmFibGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN5c3RlbS1kZXNpZ25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29tcG9uZW50LXN0cnVjdHVyZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWZsb3dcIixcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsTGV2ZWw6IFwiaGlnaFwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlRGlhZ3JhbXM6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHJhdGVneTogRXhlY3V0aW9uU3RyYXRlZ3kuU0VRVUVOVElBTCxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDAwLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCYWNrZW5kIHBsYW5uaW5nIHRhc2tcbiAgICAgICAgdGFza3MucHVzaCh7XG4gICAgICAgICAgICBpZDogXCJwbGFuLWJhY2tlbmRcIixcbiAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5CQUNLRU5EX0FSQ0hJVEVDVCxcbiAgICAgICAgICAgIG5hbWU6IFwiQmFja2VuZCBQbGFubmluZ1wiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiQ3JlYXRlIGJhY2tlbmQgaW1wbGVtZW50YXRpb24gcGxhblwiLFxuICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBBZ2VudFR5cGUuQkFDS0VORF9BUkNISVRFQ1QsXG4gICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAuLi5iYXNlQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZm9jdXM6IFwiYmFja2VuZFwiLFxuICAgICAgICAgICAgICAgICAgICBkZWxpdmVyYWJsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXBpLWRlc2lnblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhYmFzZS1zY2hlbWFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnVzaW5lc3MtbG9naWNcIixcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZVRlc3Rpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVEZXBsb3ltZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RyYXRlZ3k6IEV4ZWN1dGlvblN0cmF0ZWd5LlNFUVVFTlRJQUwsXG4gICAgICAgICAgICB0aW1lb3V0OiAxMjAwMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRnJvbnRlbmQgcGxhbm5pbmcgdGFza1xuICAgICAgICB0YXNrcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiBcInBsYW4tZnJvbnRlbmRcIixcbiAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5GUk9OVEVORF9SRVZJRVdFUixcbiAgICAgICAgICAgIG5hbWU6IFwiRnJvbnRlbmQgUGxhbm5pbmdcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkNyZWF0ZSBmcm9udGVuZCBpbXBsZW1lbnRhdGlvbiBwbGFuXCIsXG4gICAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IEFnZW50VHlwZS5GUk9OVEVORF9SRVZJRVdFUixcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmJhc2VDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmb2N1czogXCJmcm9udGVuZFwiLFxuICAgICAgICAgICAgICAgICAgICBkZWxpdmVyYWJsZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidWktY29tcG9uZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2VyLWZsb3dzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0YXRlLW1hbmFnZW1lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUFjY2Vzc2liaWxpdHk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVSZXNwb25zaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RyYXRlZ3k6IEV4ZWN1dGlvblN0cmF0ZWd5LlNFUVVFTlRJQUwsXG4gICAgICAgICAgICB0aW1lb3V0OiAxMjAwMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIFNFTyBwbGFubmluZyBpZiByZWxldmFudFxuICAgICAgICBpZiAodGhpcy5pc1NFT1JlbGV2YW50KGlucHV0KSkge1xuICAgICAgICAgICAgdGFza3MucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IFwicGxhbi1zZW9cIixcbiAgICAgICAgICAgICAgICB0eXBlOiBBZ2VudFR5cGUuU0VPX1NQRUNJQUxJU1QsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJTRU8gUGxhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJDcmVhdGUgU0VPIG9wdGltaXphdGlvbiBwbGFuXCIsXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQWdlbnRUeXBlLlNFT19TUEVDSUFMSVNULFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5iYXNlQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzOiBcInNlb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsaXZlcmFibGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhLXRhZ3NcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0cnVjdHVyZWQtZGF0YVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVyZm9ybWFuY2Utb3B0aW1pemF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRBdWRpZW5jZTogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBFeGVjdXRpb25TdHJhdGVneS5TRVFVRU5USUFMLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDgwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXNrcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZ2dyZWdhdGUgcmVzdWx0cyBmcm9tIG11bHRpcGxlIGFnZW50cyBpbnRvIGEgY29tcHJlaGVuc2l2ZSBwbGFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZ2dyZWdhdGVQbGFuUmVzdWx0cyhcbiAgICAgICAgcmVzdWx0czogYW55W10sXG4gICAgICAgIGlucHV0OiBQbGFuR2VuZXJhdGlvbklucHV0LFxuICAgICk6IGFueSB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWxSZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoXG4gICAgICAgICAgICAocikgPT4gci5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQgJiYgci5vdXRwdXQ/LnN1Y2Nlc3MsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3NmdWxSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gRGVncmFkZSBncmFjZWZ1bGx5OiByZXR1cm4gYSBtaW5pbWFsIHBsYW4gcmF0aGVyIHRoYW4gdGhyb3dpbmcuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBmb3Igc2hvcnQvZm9yY2VkIHRpbWVvdXRzICh0ZXN0cykgYW5kIHJlYWwtd29ybGQgcGFydGlhbCBvdXRhZ2VzLlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmdlbmVyYXRlUGxhbk5hbWUoaW5wdXQuZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRmFsbGJhY2sgcGxhbiBnZW5lcmF0ZWQgd2l0aG91dCBzdWNjZXNzZnVsIGFnZW50IHJlc3VsdHMuIE9yaWdpbmFsIHJlcXVlc3Q6ICR7aW5wdXQuZGVzY3JpcHRpb259YCxcbiAgICAgICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWRCeTogXCJQbGFuR2VuZXJhdG9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGFnZW50Q291bnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0U2NvcGU6IGlucHV0LnNjb3BlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0YXNrcyBmcm9tIGVhY2ggYWdlbnQgcmVzdWx0XG4gICAgICAgIGNvbnN0IGFsbFRhc2tzOiBhbnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXM6IHN0cmluZ1tdW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBzdWNjZXNzZnVsUmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5vdXRwdXQ/LnJlc3VsdD8udGFza3MpIHtcbiAgICAgICAgICAgICAgICBhbGxUYXNrcy5wdXNoKC4uLnJlc3VsdC5vdXRwdXQucmVzdWx0LnRhc2tzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQub3V0cHV0Py5yZXN1bHQ/LmRlcGVuZGVuY2llcykge1xuICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llcy5wdXNoKC4uLnJlc3VsdC5vdXRwdXQucmVzdWx0LmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgYSBjb21wcmVoZW5zaXZlIHBsYW5cbiAgICAgICAgY29uc3QgcGxhbk5hbWUgPSB0aGlzLmdlbmVyYXRlUGxhbk5hbWUoaW5wdXQuZGVzY3JpcHRpb24pO1xuICAgICAgICBjb25zdCBwbGFuRGVzY3JpcHRpb24gPSB0aGlzLmdlbmVyYXRlUGxhbkRlc2NyaXB0aW9uKFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBzdWNjZXNzZnVsUmVzdWx0cyxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcGxhbk5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogcGxhbkRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgdGFza3M6IHRoaXMuZGVkdXBsaWNhdGVBbmRPcmdhbml6ZVRhc2tzKGFsbFRhc2tzKSxcbiAgICAgICAgICAgIGRlcGVuZGVuY2llczogdGhpcy5yZXNvbHZlRGVwZW5kZW5jaWVzKGRlcGVuZGVuY2llcyksXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIGdlbmVyYXRlZEJ5OiBcIlBsYW5HZW5lcmF0b3JcIixcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGFnZW50Q291bnQ6IHN1Y2Nlc3NmdWxSZXN1bHRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbnB1dFNjb3BlOiBpbnB1dC5zY29wZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIG92ZXJhbGwgY29uZmlkZW5jZSBmcm9tIG11bHRpcGxlIGFnZW50IHJlc3VsdHNcbiAgICAgKi9cbiAgICBwcml2YXRlIGNhbGN1bGF0ZU92ZXJhbGxDb25maWRlbmNlKHJlc3VsdHM6IGFueVtdKTogQ29uZmlkZW5jZUxldmVsIHtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bFJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihcbiAgICAgICAgICAgIChyKSA9PiByLnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRCAmJiByLm91dHB1dD8uc3VjY2VzcyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoc3VjY2Vzc2Z1bFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkxPVztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZGVuY2VWYWx1ZXMgPSBzdWNjZXNzZnVsUmVzdWx0cy5tYXAoKHIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZGVuY2UgPSByLm91dHB1dD8uY29uZmlkZW5jZTtcbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlkZW5jZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLlZFUllfSElHSDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDEuMDtcbiAgICAgICAgICAgICAgICBjYXNlIENvbmZpZGVuY2VMZXZlbC5ISUdIOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC43NTtcbiAgICAgICAgICAgICAgICBjYXNlIENvbmZpZGVuY2VMZXZlbC5NRURJVU06XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwLjU7XG4gICAgICAgICAgICAgICAgY2FzZSBDb25maWRlbmNlTGV2ZWwuTE9XOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC4yNTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhdmVyYWdlQ29uZmlkZW5jZSA9XG4gICAgICAgICAgICBjb25maWRlbmNlVmFsdWVzLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCkgL1xuICAgICAgICAgICAgY29uZmlkZW5jZVZhbHVlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGF2ZXJhZ2VDb25maWRlbmNlID49IDAuOSkgcmV0dXJuIENvbmZpZGVuY2VMZXZlbC5WRVJZX0hJR0g7XG4gICAgICAgIGlmIChhdmVyYWdlQ29uZmlkZW5jZSA+PSAwLjcpIHJldHVybiBDb25maWRlbmNlTGV2ZWwuSElHSDtcbiAgICAgICAgaWYgKGF2ZXJhZ2VDb25maWRlbmNlID49IDAuNSkgcmV0dXJuIENvbmZpZGVuY2VMZXZlbC5NRURJVU07XG4gICAgICAgIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTE9XO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHJlYXNvbmluZyBmb3IgdGhlIHBsYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlUmVhc29uaW5nKFxuICAgICAgICByZXN1bHRzOiBhbnlbXSxcbiAgICAgICAgaW5wdXQ6IFBsYW5HZW5lcmF0aW9uSW5wdXQsXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bFJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihcbiAgICAgICAgICAgIChyKSA9PiByLnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRCAmJiByLm91dHB1dD8uc3VjY2VzcyxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVhc29uaW5ncyA9IHN1Y2Nlc3NmdWxSZXN1bHRzXG4gICAgICAgICAgICAubWFwKChyKSA9PiByLm91dHB1dD8ucmVhc29uaW5nIHx8IFwiXCIpXG4gICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBgR2VuZXJhdGVkIGNvbXByZWhlbnNpdmUgcGxhbiBiYXNlZCBvbjogJHtpbnB1dC5kZXNjcmlwdGlvbn0uIGAgK1xuICAgICAgICAgICAgYEFuYWx5emVkIGJ5ICR7c3VjY2Vzc2Z1bFJlc3VsdHMubGVuZ3RofSBzcGVjaWFsaXplZCBhZ2VudHMuIGAgK1xuICAgICAgICAgICAgYEtleSBjb25zaWRlcmF0aW9uczogJHtyZWFzb25pbmdzLmpvaW4oXCI7IFwiKX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgc3VnZ2VzdGlvbnMgZm9yIHBsYW4gaW1wcm92ZW1lbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU3VnZ2VzdGlvbnMocmVzdWx0czogYW55W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBzdWNjZXNzZnVsUmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKFxuICAgICAgICAgICAgKHIpID0+IHIuc3RhdHVzID09PSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEICYmIHIub3V0cHV0Py5zdWNjZXNzLFxuICAgICAgICApO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHN1Y2Nlc3NmdWxSZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0Lm91dHB1dD8ucmVzdWx0Py5zdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2goLi4ucmVzdWx0Lm91dHB1dC5yZXN1bHQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGdlbmVyYWwgc3VnZ2VzdGlvbnNcbiAgICAgICAgc3VnZ2VzdGlvbnMucHVzaChcbiAgICAgICAgICAgIFwiUmV2aWV3IGdlbmVyYXRlZCB0YXNrcyBmb3IgY29tcGxldGVuZXNzIGFuZCBhY2N1cmFjeVwiLFxuICAgICAgICApO1xuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgXCJDb25zaWRlciBhZGRpbmcgdGVzdGluZyB0YXNrcyBpZiBub3QgYWxyZWFkeSBpbmNsdWRlZFwiLFxuICAgICAgICApO1xuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKFwiVmFsaWRhdGUgZGVwZW5kZW5jaWVzIGJlZm9yZSBleGVjdXRpb25cIik7XG5cbiAgICAgICAgcmV0dXJuIFsuLi5uZXcgU2V0KHN1Z2dlc3Rpb25zKV07IC8vIFJlbW92ZSBkdXBsaWNhdGVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWdncmVnYXRlIHZhbGlkYXRpb24gcmVzdWx0c1xuICAgICAqL1xuICAgIHByaXZhdGUgYWdncmVnYXRlVmFsaWRhdGlvblJlc3VsdHMocmVzdWx0czogYW55W10pOiB7XG4gICAgICAgIGlzVmFsaWQ6IGJvb2xlYW47XG4gICAgICAgIGlzc3Vlczogc3RyaW5nW107XG4gICAgICAgIGVuaGFuY2VtZW50czogc3RyaW5nW107XG4gICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbiAgICB9IHtcbiAgICAgICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBlbmhhbmNlbWVudHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcmVzdWx0LnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRCAmJlxuICAgICAgICAgICAgICAgIHJlc3VsdC5vdXRwdXQ/LnN1Y2Nlc3NcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQub3V0cHV0Py5yZXN1bHQ/Lmlzc3Vlcykge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaCguLi5yZXN1bHQub3V0cHV0LnJlc3VsdC5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQub3V0cHV0LnJlc3VsdC5pc3N1ZXMuc29tZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaXNzdWU6IGFueSkgPT4gaXNzdWUuc2V2ZXJpdHkgPT09IFwiY3JpdGljYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5vdXRwdXQ/LnJlc3VsdD8uZW5oYW5jZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuaGFuY2VtZW50cy5wdXNoKC4uLnJlc3VsdC5vdXRwdXQucmVzdWx0LmVuaGFuY2VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaXNzdWVzLnB1c2goYFZhbGlkYXRpb24gZmFpbGVkIGZvciAke3Jlc3VsdC50eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzVmFsaWQsXG4gICAgICAgICAgICBpc3N1ZXM6IFsuLi5uZXcgU2V0KGlzc3VlcyldLFxuICAgICAgICAgICAgZW5oYW5jZW1lbnRzOiBbLi4ubmV3IFNldChlbmhhbmNlbWVudHMpXSxcbiAgICAgICAgICAgIGNvbmZpZGVuY2U6IGlzVmFsaWQgPyBDb25maWRlbmNlTGV2ZWwuSElHSCA6IENvbmZpZGVuY2VMZXZlbC5NRURJVU0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgU0VPIHBsYW5uaW5nIGlzIHJlbGV2YW50IGZvciB0aGlzIGlucHV0XG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1NFT1JlbGV2YW50KGlucHV0OiBQbGFuR2VuZXJhdGlvbklucHV0KTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHNlb0tleXdvcmRzID0gW1xuICAgICAgICAgICAgXCJ3ZWJzaXRlXCIsXG4gICAgICAgICAgICBcIndlYiBhcHBcIixcbiAgICAgICAgICAgIFwiZnJvbnRlbmRcIixcbiAgICAgICAgICAgIFwidXNlci1mYWNpbmdcIixcbiAgICAgICAgICAgIFwicHVibGljXCIsXG4gICAgICAgICAgICBcIm1hcmtldGluZ1wiLFxuICAgICAgICBdO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGlucHV0LmRlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBzZW9LZXl3b3Jkcy5zb21lKChrZXl3b3JkKSA9PiBkZXNjcmlwdGlvbi5pbmNsdWRlcyhrZXl3b3JkKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBkZXNjcmlwdGl2ZSBwbGFuIG5hbWVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlUGxhbk5hbWUoZGVzY3JpcHRpb246IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gZGVzY3JpcHRpb24uc3BsaXQoXCIgXCIpLnNsaWNlKDAsIDUpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gYCR7d29yZHN9LWltcGxlbWVudGF0aW9uLXBsYW5gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgY29tcHJlaGVuc2l2ZSBwbGFuIGRlc2NyaXB0aW9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVBsYW5EZXNjcmlwdGlvbihcbiAgICAgICAgaW5wdXQ6IFBsYW5HZW5lcmF0aW9uSW5wdXQsXG4gICAgICAgIHJlc3VsdHM6IGFueVtdLFxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFnZW50VHlwZXMgPSByZXN1bHRzLm1hcCgocikgPT4gci50eXBlKS5qb2luKFwiLCBcIik7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBgSW1wbGVtZW50YXRpb24gcGxhbiBmb3I6ICR7aW5wdXQuZGVzY3JpcHRpb259LiBgICtcbiAgICAgICAgICAgIGBHZW5lcmF0ZWQgYnk6ICR7YWdlbnRUeXBlc30uIGAgK1xuICAgICAgICAgICAgYFNjb3BlOiAke2lucHV0LnNjb3BlIHx8IFwiZnVsbFwifS5gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVkdXBsaWNhdGUgYW5kIG9yZ2FuaXplIHRhc2tzIGZyb20gbXVsdGlwbGUgYWdlbnRzXG4gICAgICovXG4gICAgcHJpdmF0ZSBkZWR1cGxpY2F0ZUFuZE9yZ2FuaXplVGFza3ModGFza3M6IGFueVtdKTogYW55W10ge1xuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IG9yZ2FuaXplZDogYW55W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3Rhc2submFtZX0tJHt0YXNrLmNvbW1hbmQgfHwgdGFzay50eXBlfWA7XG4gICAgICAgICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICBzZWVuLmFkZChrZXkpO1xuICAgICAgICAgICAgICAgIG9yZ2FuaXplZC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQgfHwgYHRhc2stJHtvcmdhbml6ZWQubGVuZ3RoICsgMX1gLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YXNrLm5hbWUgfHwgXCJVbm5hbWVkIFRhc2tcIixcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRhc2suZGVzY3JpcHRpb24gfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogdGFzay5jb21tYW5kIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZHNPbjogdGFzay5kZXBlbmRzT24gfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIC4uLnRhc2ssXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3JnYW5pemVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgYW5kIG9yZ2FuaXplIGRlcGVuZGVuY2llc1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVzb2x2ZURlcGVuZGVuY2llcyhkZXBlbmRlbmNpZXM6IHN0cmluZ1tdW10pOiBzdHJpbmdbXVtdIHtcbiAgICAgICAgLy8gU2ltcGxlIGRlZHVwbGljYXRpb24gb2YgZGVwZW5kZW5jaWVzXG4gICAgICAgIGNvbnN0IHVuaXF1ZSA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCByZXNvbHZlZDogc3RyaW5nW11bXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgZGVwIG9mIGRlcGVuZGVuY2llcykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gZGVwLmpvaW4oXCItXCIpO1xuICAgICAgICAgICAgaWYgKCF1bmlxdWUuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICB1bmlxdWUuYWRkKGtleSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZWQucHVzaChkZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH1cbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7QUFpQk8sTUFBTSxjQUFjO0FBQUEsRUFDZjtBQUFBLEVBRVIsV0FBVyxDQUFDLGFBQStCO0FBQUEsSUFDdkMsS0FBSyxjQUFjO0FBQUE7QUFBQSxPQU1WLGFBQVksQ0FDckIsT0FDNkI7QUFBQSxJQUM3QixNQUFNLFlBQVksS0FBSyxJQUFJO0FBQUEsSUFFM0IsSUFBSTtBQUFBLE1BRUEsTUFBTSxRQUFRLEtBQUssMEJBQTBCLEtBQUs7QUFBQSxNQUdsRCxNQUFNLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxPQUFPO0FBQUEsUUFDdkQsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLHlEQUMwQjtBQUFBLHlEQUNBO0FBQUEseURBQ0E7QUFBQSxRQUNuQztBQUFBLFFBQ0Esb0JBQW9CO0FBQUEsTUFDeEIsQ0FBQztBQUFBLE1BR0QsTUFBTSxPQUFPLEtBQUsscUJB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LFFBQ2hCLEtBQUssSUFBSSxHQUFHO0FBQUEsUUFDWixVQUFVLEtBQUs7QUFBQSxVQUNYLElBQUksS0FBSyxNQUFNLFFBQVEsVUFBVSxTQUFTO0FBQUEsVUFDMUMsTUFBTSxLQUFLLFFBQVE7QUFBQSxVQUNuQixhQUFhLEtBQUssZUFBZTtBQUFBLFVBQ2pDLFNBQVMsS0FBSyxXQUFXO0FBQUEsVUFDekIsV0FBVyxLQUFLLGFBQWEsQ0FBQztBQUFBLGFBQzNCO0FBQUEsUUFDUCxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLEVBTUgsbUJBQW1CLENBQUMsY0FBc0M7QUFBQSxJQUU5RCxNQUFNLFNBQVMsSUFBSTtBQUFBLElBQ25CLE1BQU0sV0FBdUIsQ0FBQztBQUFBLElBRTlCLFdBQVcsT0FBTyxjQUFjO0FBQUEsTUFDNUIsTUFBTSxNQUFNLElBQUksS0FBSyxHQUFHO0FBQUEsTUFDeEIsSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLEdBQUc7QUFBQSxRQUNsQixPQUFPLElBQUksR0FBRztBQUFBLFFBQ2QsU0FBUyxLQUFLLEdBQUc7QUFBQSxNQUNyQjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUVmOyIsCiAgImRlYnVnSWQiOiAiMTM5NkY4MkIyMDg3OTY0NjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
