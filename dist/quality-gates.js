// src/execution/task-executor.ts
import { spawn } from "node:child_process";
class TaskExecutor {
  options;
  taskResults = new Map;
  runningTasks = new Set;
  agentCoordinator;
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      continueOnError: false,
      maxConcurrency: 1,
      verbose: false,
      ...options
    };
  }
  setAgentCoordinator(coordinator) {
    this.agentCoordinator = coordinator;
  }
  async executePlan(plan) {
    this.taskResults.clear();
    this.runningTasks.clear();
    const executionOrder = this.resolveExecutionOrder(plan.tasks);
    const results = [];
    for (const task of executionOrder) {
      const result = await this.executeTask(task);
      this.taskResults.set(task.id, result);
      results.push(result);
      if (result.status === "failed" /* FAILED */ && !this.options.continueOnError) {
        this.log(`Stopping execution due to task failure: ${task.id}`);
        break;
      }
    }
    return results;
  }
  async executeTask(task) {
    if (this.runningTasks.has(task.id)) {
      throw new Error(`Task ${task.id} is already running`);
    }
    this.runningTasks.add(task.id);
    const startTime = new Date;
    try {
      this.log(`Executing task: ${task.id} (${task.name})`);
      const dependencyResult = this.checkDependencies(task);
      if (!dependencyResult.success) {
        const result2 = {
          id: task.id,
          status: "skipped" /* SKIPPED */,
          exitCode: -1,
          stdout: "",
          stderr: dependencyResult.error ?? "Unknown dependency error",
          duration: 0,
          startTime,
          endTime: new Date,
          error: dependencyResult.error
        };
        this.taskResults.set(task.id, result2);
        return result2;
      }
      if (this.options.dryRun) {
        this.log(`[DRY RUN] Would execute: ${task.command}`);
        const result2 = {
          id: task.id,
          status: "completed" /* COMPLETED */,
          exitCode: 0,
          stdout: `[DRY RUN] Command: ${task.command}`,
          stderr: "",
          duration: 0,
          startTime,
          endTime: new Date
        };
        this.taskResults.set(task.id, result2);
        return result2;
      }
      if (this.isAgentTask(task)) {
        return await this.executeAgentTask(task, startTime);
      }
      const result = await this.executeWithRetry(task);
      this.taskResults.set(task.id, result);
      this.log(`Task ${task.id} completed with status: ${result.status}`);
      return result;
    } catch (error) {
      const endTime = new Date;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.log(`Task ${task.id} failed: ${errorMessage}`);
      const result = {
        id: task.id,
        status: "failed" /* FAILED */,
        exitCode: -1,
        stdout: "",
        stderr: errorMessage,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        error: errorMessage
      };
      return result;
    } finally {
      this.runningTasks.delete(task.id);
    }
  }
  getTaskResult(taskId) {
    return this.taskResults.get(taskId);
  }
  getAllResults() {
    return Array.from(this.taskResults.values());
  }
  clearResults() {
    this.taskResults.clear();
  }
  resolveExecutionOrder(tasks) {
    const visited = new Set;
    const visiting = new Set;
    const sorted = [];
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const visit = (taskId) => {
      if (visiting.has(taskId)) {
        throw new Error(`Circular dependency detected involving task: ${taskId}`);
      }
      if (visited.has(taskId)) {
        return;
      }
      visiting.add(taskId);
      const task = taskMap.get(taskId);
      if (task?.dependsOn) {
        for (const depId of task.dependsOn) {
          visit(depId);
        }
      }
      visiting.delete(taskId);
      visited.add(taskId);
      if (task) {
        sorted.push(task);
      }
    };
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    }
    return sorted;
  }
  checkDependencies(task) {
    if (!task.dependsOn || task.dependsOn.length === 0) {
      return { success: true };
    }
    for (const depId of task.dependsOn) {
      const depResult = this.taskResults.get(depId);
      if (!depResult) {
        return {
          success: false,
          error: `Dependency ${depId} has not been executed`
        };
      }
      if (depResult.status === "failed" /* FAILED */) {
        return {
          success: false,
          error: `Dependency ${depId} failed with exit code ${depResult.exitCode}`
        };
      }
      if (depResult.status !== "completed" /* COMPLETED */) {
        return {
          success: false,
          error: `Dependency ${depId} has not completed (status: ${depResult.status})`
        };
      }
    }
    return { success: true };
  }
  async executeWithRetry(task) {
    if (this.isAgentTask(task)) {
      throw new Error(`executeWithRetry should not be called with agent task: ${task.id}`);
    }
    const shellTask = task;
    const maxAttempts = shellTask.retry?.maxAttempts || 1;
    const baseDelay = shellTask.retry?.delay || 0;
    const backoffMultiplier = shellTask.retry?.backoffMultiplier || 1;
    let lastResult = null;
    for (let attempt = 1;attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const delay = baseDelay * backoffMultiplier ** (attempt - 2);
        this.log(`Retrying task ${shellTask.id} in ${delay}s (attempt ${attempt}/${maxAttempts})`);
        await this.sleep(delay * 1000);
      }
      const result = await this.executeCommand(shellTask);
      if (result.status === "completed" /* COMPLETED */) {
        return result;
      }
      lastResult = result;
      if (attempt < maxAttempts) {
        this.log(`Task ${task.id} failed (attempt ${attempt}/${maxAttempts}): ${result.stderr || result.error}`);
      }
    }
    return lastResult;
  }
  async executeCommand(task) {
    if (this.isAgentTask(task)) {
      throw new Error(`executeCommand should not be called with agent task: ${task.id}`);
    }
    const shellTask = task;
    return new Promise((resolve) => {
      const startTime = new Date;
      const timeout = shellTask.timeout ? shellTask.timeout * 1000 : 300000;
      this.log(`Executing command: ${shellTask.command}`);
      const child = spawn(shellTask.command, [], {
        shell: true,
        cwd: shellTask.workingDirectory ?? this.options.workingDirectory,
        env: {
          ...process.env,
          ...this.options.environment,
          ...shellTask.environment
        }
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        const chunk = data.toString();
        stdout += chunk;
        if (this.options.verbose) {
          process.stdout.write(chunk);
        }
      });
      child.stderr?.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
        if (this.options.verbose) {
          process.stderr.write(chunk);
        }
      });
      const timeoutId = setTimeout(() => {
        child.kill("SIGTERM");
        this.log(`Task ${shellTask.id} timed out after ${shellTask.timeout}s`);
      }, timeout);
      child.on("close", (code, signal) => {
        clearTimeout(timeoutId);
        const endTime = new Date;
        const duration = endTime.getTime() - startTime.getTime();
        const result = {
          id: shellTask.id,
          status: code === 0 ? "completed" /* COMPLETED */ : "failed" /* FAILED */,
          exitCode: code || (signal ? -1 : 0),
          stdout,
          stderr,
          duration,
          startTime,
          endTime,
          error: signal ? `Process terminated by signal: ${signal}` : undefined
        };
        resolve(result);
      });
      child.on("error", (error) => {
        clearTimeout(timeoutId);
        const endTime = new Date;
        const duration = endTime.getTime() - startTime.getTime();
        const result = {
          id: shellTask.id,
          status: "failed" /* FAILED */,
          exitCode: -1,
          stdout,
          stderr,
          duration,
          startTime,
          endTime,
          error: error.message
        };
        resolve(result);
      });
    });
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  isAgentTask(task) {
    return "type" in task && "input" in task && "strategy" in task;
  }
  async executeAgentTask(task, startTime) {
    if (!this.agentCoordinator) {
      throw new Error(`Agent coordinator not set. Cannot execute agent task: ${task.id}`);
    }
    try {
      this.log(`Executing agent task: ${task.id} (${task.type})`);
      const coordinatorTask = {
        ...task,
        dependsOn: undefined
      };
      const agentResult = await this.agentCoordinator.executeTask(coordinatorTask);
      const result = {
        id: task.id,
        status: this.convertAgentStatus(agentResult.status),
        exitCode: agentResult.status === "completed" /* COMPLETED */ ? 0 : 1,
        stdout: agentResult.output ? JSON.stringify(agentResult.output, null, 2) : "",
        stderr: agentResult.error || "",
        duration: agentResult.executionTime,
        startTime,
        endTime: agentResult.endTime,
        error: agentResult.error
      };
      this.taskResults.set(task.id, result);
      this.log(`Agent task ${task.id} completed with status: ${result.status}`);
      return result;
    } catch (error) {
      const endTime = new Date;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.log(`Agent task ${task.id} failed: ${errorMessage}`);
      const result = {
        id: task.id,
        status: "failed" /* FAILED */,
        exitCode: -1,
        stdout: "",
        stderr: errorMessage,
        duration: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        error: errorMessage
      };
      return result;
    }
  }
  convertAgentStatus(agentStatus) {
    switch (agentStatus) {
      case "completed" /* COMPLETED */:
        return "completed" /* COMPLETED */;
      case "failed" /* FAILED */:
      case "timeout" /* TIMEOUT */:
        return "failed" /* FAILED */;
      case "skipped" /* SKIPPED */:
        return "skipped" /* SKIPPED */;
      default:
        return "failed" /* FAILED */;
    }
  }
  async executeAgentTasks(tasks, strategy = { type: "sequential" }) {
    if (!this.agentCoordinator) {
      throw new Error("Agent coordinator not set");
    }
    this.log(`Executing ${tasks.length} agent tasks with strategy: ${strategy.type}`);
    try {
      const agentResults = await this.agentCoordinator.executeTasks(tasks, strategy);
      const taskResults = agentResults.map((agentResult) => ({
        id: agentResult.id,
        status: this.convertAgentStatus(agentResult.status),
        exitCode: agentResult.status === "completed" /* COMPLETED */ ? 0 : 1,
        stdout: agentResult.output ? JSON.stringify(agentResult.output, null, 2) : "",
        stderr: agentResult.error || "",
        duration: agentResult.executionTime,
        startTime: agentResult.startTime,
        endTime: agentResult.endTime,
        error: agentResult.error
      }));
      for (const result of taskResults) {
        this.taskResults.set(result.id, result);
      }
      return taskResults;
    } catch (error) {
      this.log(`Agent task execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }
  getAgentProgress() {
    if (!this.agentCoordinator) {
      return null;
    }
    return this.agentCoordinator.getProgress();
  }
  getAgentMetrics() {
    if (!this.agentCoordinator) {
      return null;
    }
    return this.agentCoordinator.getMetrics();
  }
  log(message) {
    if (this.options.verbose) {
      console.log(`[TaskExecutor] ${message}`);
    }
  }
}

// src/execution/quality-gates.ts
class QualityGateRunner {
  taskExecutor;
  options;
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      continueOnError: false,
      verbose: false,
      ...options
    };
    this.taskExecutor = new TaskExecutor(this.options);
  }
  async executeQualityGates(gates) {
    const results = [];
    const sortedGates = this.sortGatesByPriority(gates);
    for (const gate of sortedGates) {
      const result = await this.executeQualityGate(gate);
      results.push(result);
      if (gate.required && !result.passed) {
        this.log(`Stopping execution due to required quality gate failure: ${gate.id}`);
        break;
      }
    }
    return results;
  }
  async executeQualityGate(gate) {
    const startTime = new Date;
    try {
      this.log(`Executing quality gate: ${gate.id} (${gate.name})`);
      const task = this.createTaskFromGate(gate);
      const taskResult = await this.taskExecutor.executeTask(task);
      const endTime = new Date;
      const duration = endTime.getTime() - startTime.getTime();
      const passed = this.evaluateGateResult(gate, taskResult);
      const result = {
        gateId: gate.id,
        status: taskResult.status,
        passed,
        duration,
        message: this.createResultMessage(gate, taskResult, passed),
        details: {
          taskResult,
          gateConfig: gate
        },
        timestamp: new Date
      };
      this.log(`Quality gate ${gate.id} ${passed ? "passed" : "failed"} in ${duration}ms`);
      return result;
    } catch (error) {
      const endTime = new Date;
      const duration = endTime.getTime() - startTime.getTime();
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.log(`Quality gate ${gate.id} failed with error: ${errorMessage}`);
      return {
        gateId: gate.id,
        status: "failed" /* FAILED */,
        passed: false,
        duration,
        message: `Quality gate execution failed: ${errorMessage}`,
        details: { error: errorMessage },
        timestamp: new Date
      };
    }
  }
  static getDefaultGates() {
    return [
      {
        id: "lint",
        name: "Code Linting",
        description: "Check code style and formatting",
        type: "lint" /* LINT */,
        required: true,
        config: {
          command: "npm run lint",
          timeout: 60
        }
      },
      {
        id: "types",
        name: "Type Checking",
        description: "TypeScript compilation check",
        type: "types" /* TYPES */,
        required: true,
        config: {
          command: "npm run build",
          timeout: 120
        }
      },
      {
        id: "tests",
        name: "Unit Tests",
        description: "Run unit test suite",
        type: "tests" /* TESTS */,
        required: true,
        config: {
          command: "npm test",
          timeout: 300
        }
      },
      {
        id: "build",
        name: "Build Process",
        description: "Build the project",
        type: "build" /* BUILD */,
        required: true,
        config: {
          command: "npm run build",
          timeout: 180
        }
      },
      {
        id: "integration",
        name: "Integration Tests",
        description: "Run integration test suite",
        type: "integration" /* INTEGRATION */,
        required: false,
        config: {
          command: "npm run test:integration",
          timeout: 600
        }
      },
      {
        id: "deploy",
        name: "Deployment Validation",
        description: "Validate deployment readiness",
        type: "deploy" /* DEPLOY */,
        required: false,
        config: {
          command: "npm run deploy:validate",
          timeout: 300
        }
      }
    ];
  }
  static createGatesFromTasks(tasks) {
    const gates = [];
    for (const task of tasks) {
      if (QualityGateRunner.isQualityGateTask(task)) {
        const gateType = QualityGateRunner.mapTaskTypeToGateType(task.type);
        gates.push({
          id: task.id,
          name: task.name,
          description: task.description,
          type: gateType,
          required: true,
          config: {
            command: task.command,
            timeout: task.timeout,
            workingDirectory: task.workingDirectory,
            environment: task.environment
          },
          taskId: task.id
        });
      }
    }
    return gates;
  }
  sortGatesByPriority(gates) {
    const priorityOrder = [
      "lint" /* LINT */,
      "types" /* TYPES */,
      "tests" /* TESTS */,
      "build" /* BUILD */,
      "integration" /* INTEGRATION */,
      "deploy" /* DEPLOY */
    ];
    return gates.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.type);
      const bPriority = priorityOrder.indexOf(b.type);
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      if (a.required !== b.required) {
        return b.required ? 1 : -1;
      }
      return a.id.localeCompare(b.id);
    });
  }
  createTaskFromGate(gate) {
    const config = gate.config || {};
    return {
      id: `gate-${gate.id}`,
      name: `Quality Gate: ${gate.name}`,
      description: gate.description,
      type: this.mapGateTypeToTaskType(gate.type),
      command: config.command || this.getDefaultCommandForGate(gate.type),
      workingDirectory: config.workingDirectory,
      environment: config.environment,
      timeout: config.timeout || this.getDefaultTimeoutForGate(gate.type),
      retry: {
        maxAttempts: 1,
        delay: 0
      }
    };
  }
  mapGateTypeToTaskType(gateType) {
    const mapping = {
      ["lint" /* LINT */]: "lint" /* LINT */,
      ["types" /* TYPES */]: "types" /* TYPES */,
      ["tests" /* TESTS */]: "tests" /* TESTS */,
      ["build" /* BUILD */]: "build" /* BUILD */,
      ["integration" /* INTEGRATION */]: "integration" /* INTEGRATION */,
      ["deploy" /* DEPLOY */]: "deploy" /* DEPLOY */
    };
    return mapping[gateType] || "shell" /* SHELL */;
  }
  static mapTaskTypeToGateType(taskType) {
    const mapping = {
      ["lint" /* LINT */]: "lint" /* LINT */,
      ["types" /* TYPES */]: "types" /* TYPES */,
      ["tests" /* TESTS */]: "tests" /* TESTS */,
      ["build" /* BUILD */]: "build" /* BUILD */,
      ["integration" /* INTEGRATION */]: "integration" /* INTEGRATION */,
      ["deploy" /* DEPLOY */]: "deploy" /* DEPLOY */
    };
    return mapping[taskType] || "lint" /* LINT */;
  }
  getDefaultCommandForGate(gateType) {
    const commands = {
      ["lint" /* LINT */]: "npm run lint",
      ["types" /* TYPES */]: "npm run build",
      ["tests" /* TESTS */]: "npm test",
      ["build" /* BUILD */]: "npm run build",
      ["integration" /* INTEGRATION */]: "npm run test:integration",
      ["deploy" /* DEPLOY */]: "npm run deploy:validate"
    };
    return commands[gateType] || 'echo "No command configured"';
  }
  getDefaultTimeoutForGate(gateType) {
    const timeouts = {
      ["lint" /* LINT */]: 60,
      ["types" /* TYPES */]: 120,
      ["tests" /* TESTS */]: 300,
      ["build" /* BUILD */]: 180,
      ["integration" /* INTEGRATION */]: 600,
      ["deploy" /* DEPLOY */]: 300
    };
    return timeouts[gateType] || 60;
  }
  evaluateGateResult(gate, taskResult) {
    if (taskResult.status !== "completed" /* COMPLETED */) {
      return false;
    }
    if (taskResult.exitCode !== 0) {
      return false;
    }
    switch (gate.type) {
      case "tests" /* TESTS */:
        return this.evaluateTestGate(taskResult);
      case "build" /* BUILD */:
        return this.evaluateBuildGate(taskResult);
      case "lint" /* LINT */:
        return this.evaluateLintGate(taskResult);
      default:
        return true;
    }
  }
  evaluateTestGate(taskResult) {
    const output = (taskResult.stdout + taskResult.stderr).toLowerCase();
    const successPatterns = [
      /passing/,
      /passed/,
      /✓/,
      /✔/,
      /all tests passed/,
      /test suite passed/
    ];
    const failurePatterns = [
      /failing/,
      /failed/,
      /✗/,
      /✘/,
      /test failed/,
      /tests failed/,
      /error:/,
      /exception/
    ];
    const hasSuccessPattern = successPatterns.some((pattern) => pattern.test(output));
    const hasFailurePattern = failurePatterns.some((pattern) => pattern.test(output));
    if (hasSuccessPattern && !hasFailurePattern) {
      return true;
    }
    if (hasFailurePattern) {
      return false;
    }
    return taskResult.exitCode === 0;
  }
  evaluateBuildGate(taskResult) {
    const output = (taskResult.stdout + taskResult.stderr).toLowerCase();
    const errorPatterns = [
      /build failed/,
      /compilation error/,
      /syntax error/,
      /type error/,
      /error:/
    ];
    const hasErrorPattern = errorPatterns.some((pattern) => pattern.test(output));
    return !hasErrorPattern && taskResult.exitCode === 0;
  }
  evaluateLintGate(taskResult) {
    const output = (taskResult.stdout + taskResult.stderr).toLowerCase();
    const errorPatterns = [/error/, /problem/, /warning/, /issue/];
    const hasErrorPattern = errorPatterns.some((pattern) => pattern.test(output));
    return !hasErrorPattern && taskResult.exitCode === 0;
  }
  createResultMessage(gate, taskResult, passed) {
    if (passed) {
      return `Quality gate "${gate.name}" passed successfully`;
    }
    if (taskResult.status === "failed" /* FAILED */) {
      return `Quality gate "${gate.name}" failed with exit code ${taskResult.exitCode}`;
    }
    if (taskResult.status === "skipped" /* SKIPPED */) {
      return `Quality gate "${gate.name}" was skipped: ${taskResult.error}`;
    }
    return `Quality gate "${gate.name}" did not complete successfully`;
  }
  static isQualityGateTask(task) {
    return [
      "lint" /* LINT */,
      "types" /* TYPES */,
      "tests" /* TESTS */,
      "build" /* BUILD */,
      "integration" /* INTEGRATION */,
      "deploy" /* DEPLOY */
    ].includes(task.type);
  }
  log(message) {
    if (this.options.verbose) {
      console.log(`[QualityGateRunner] ${message}`);
    }
  }
}
export {
  QualityGateRunner
};

//# debugId=8B25EAE98678F4F364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIiwgIi4uL3NyYy9leGVjdXRpb24vcXVhbGl0eS1nYXRlcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFRhc2sgZXhlY3V0b3IgZm9yIHRoZSBGZXJnIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEhhbmRsZXMgdGFzayBleGVjdXRpb24sIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiwgYW5kIHJlc3VsdCB0cmFja2luZy5cbiAqL1xuXG5pbXBvcnQgeyBzcGF3biB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJub2RlOnV0aWxcIjtcbmltcG9ydCB0eXBlIHsgQWdlbnRDb29yZGluYXRvciB9IGZyb20gXCIuLi9hZ2VudHMvY29vcmRpbmF0b3JcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBBZ2VudFRhc2ssXG4gICAgQWdlbnRUYXNrUmVzdWx0LFxuICAgIEFnZW50VGFza1N0YXR1cyxcbiAgICB0eXBlIEFnZW50VHlwZSxcbiAgICB0eXBlIEFnZ3JlZ2F0aW9uU3RyYXRlZ3ksXG59IGZyb20gXCIuLi9hZ2VudHMvdHlwZXNcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBFeGVjdXRhYmxlVGFzayxcbiAgICB0eXBlIEV4ZWN1dGlvbk9wdGlvbnMsXG4gICAgdHlwZSBQbGFuLFxuICAgIHR5cGUgVGFzayxcbiAgICB0eXBlIFRhc2tSZXN1bHQsXG4gICAgVGFza1N0YXR1cyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIFRhc2tFeGVjdXRvciB7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zO1xuICAgIHByaXZhdGUgdGFza1Jlc3VsdHM6IE1hcDxzdHJpbmcsIFRhc2tSZXN1bHQ+ID0gbmV3IE1hcCgpO1xuICAgIHByaXZhdGUgcnVubmluZ1Rhc2tzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIGFnZW50Q29vcmRpbmF0b3I/OiBBZ2VudENvb3JkaW5hdG9yO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRyeVJ1bjogZmFsc2UsXG4gICAgICAgICAgICBjb250aW51ZU9uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgbWF4Q29uY3VycmVuY3k6IDEsXG4gICAgICAgICAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFnZW50IGNvb3JkaW5hdG9yIGZvciBleGVjdXRpbmcgYWdlbnQgdGFza3NcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0QWdlbnRDb29yZGluYXRvcihjb29yZGluYXRvcjogQWdlbnRDb29yZGluYXRvcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFnZW50Q29vcmRpbmF0b3IgPSBjb29yZGluYXRvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFsbCB0YXNrcyBpbiBhIHBsYW4gd2l0aCBkZXBlbmRlbmN5IHJlc29sdXRpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZVBsYW4ocGxhbjogUGxhbik6IFByb21pc2U8VGFza1Jlc3VsdFtdPiB7XG4gICAgICAgIHRoaXMudGFza1Jlc3VsdHMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuY2xlYXIoKTtcblxuICAgICAgICBjb25zdCBleGVjdXRpb25PcmRlciA9IHRoaXMucmVzb2x2ZUV4ZWN1dGlvbk9yZGVyKHBsYW4udGFza3MpO1xuICAgICAgICBjb25zdCByZXN1bHRzOiBUYXNrUmVzdWx0W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgZXhlY3V0aW9uT3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVRhc2sodGFzayk7XG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgZXhlY3V0aW9uIGlmIHRhc2sgZmFpbGVkIGFuZCBjb250aW51ZU9uRXJyb3IgaXMgZmFsc2VcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICByZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkZBSUxFRCAmJlxuICAgICAgICAgICAgICAgICF0aGlzLm9wdGlvbnMuY29udGludWVPbkVycm9yXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhgU3RvcHBpbmcgZXhlY3V0aW9uIGR1ZSB0byB0YXNrIGZhaWx1cmU6ICR7dGFzay5pZH1gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBzaW5nbGUgdGFza1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlVGFzayh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nVGFza3MuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhc2sgJHt0YXNrLmlkfSBpcyBhbHJlYWR5IHJ1bm5pbmdgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucnVubmluZ1Rhc2tzLmFkZCh0YXNrLmlkKTtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyB0YXNrOiAke3Rhc2suaWR9ICgke3Rhc2submFtZX0pYCk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGRlcGVuZGVuY2llc1xuICAgICAgICAgICAgY29uc3QgZGVwZW5kZW5jeVJlc3VsdCA9IHRoaXMuY2hlY2tEZXBlbmRlbmNpZXModGFzayk7XG4gICAgICAgICAgICBpZiAoIWRlcGVuZGVuY3lSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5TS0lQUEVELFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeVJlc3VsdC5lcnJvciA/PyBcIlVua25vd24gZGVwZW5kZW5jeSBlcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZGVwZW5kZW5jeVJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSGFuZGxlIGRyeSBydW4gbW9kZVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhgW0RSWSBSVU5dIFdvdWxkIGV4ZWN1dGU6ICR7dGFzay5jb21tYW5kfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5DT01QTEVURUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQ6IGBbRFJZIFJVTl0gQ29tbWFuZDogJHt0YXNrLmNvbW1hbmR9YCxcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGFnZW50IHRhc2tcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZXhlY3V0ZUFnZW50VGFzayhcbiAgICAgICAgICAgICAgICAgICAgdGFzayBhcyBBZ2VudFRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSB0YXNrIHdpdGggcmV0cnkgbG9naWNcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVdpdGhSZXRyeSh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLmxvZyhgVGFzayAke3Rhc2suaWR9IGNvbXBsZXRlZCB3aXRoIHN0YXR1czogJHtyZXN1bHQuc3RhdHVzfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBUYXNrICR7dGFzay5pZH0gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICBzdGRlcnI6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuZGVsZXRlKHRhc2suaWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZXN1bHQgb2YgYSBwcmV2aW91c2x5IGV4ZWN1dGVkIHRhc2tcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VGFza1Jlc3VsdCh0YXNrSWQ6IHN0cmluZyk6IFRhc2tSZXN1bHQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy50YXNrUmVzdWx0cy5nZXQodGFza0lkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhc2sgcmVzdWx0c1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBbGxSZXN1bHRzKCk6IFRhc2tSZXN1bHRbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudGFza1Jlc3VsdHMudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCB0YXNrIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXJSZXN1bHRzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNvbHZlRXhlY3V0aW9uT3JkZXIodGFza3M6IEV4ZWN1dGFibGVUYXNrW10pOiBFeGVjdXRhYmxlVGFza1tdIHtcbiAgICAgICAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCB2aXNpdGluZyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBzb3J0ZWQ6IEV4ZWN1dGFibGVUYXNrW10gPSBbXTtcbiAgICAgICAgY29uc3QgdGFza01hcCA9IG5ldyBNYXAodGFza3MubWFwKCh0KSA9PiBbdC5pZCwgdF0pKTtcblxuICAgICAgICBjb25zdCB2aXNpdCA9ICh0YXNrSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKHZpc2l0aW5nLmhhcyh0YXNrSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBpbnZvbHZpbmcgdGFzazogJHt0YXNrSWR9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodmlzaXRlZC5oYXModGFza0lkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmlzaXRpbmcuYWRkKHRhc2tJZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSB0YXNrTWFwLmdldCh0YXNrSWQpO1xuICAgICAgICAgICAgaWYgKHRhc2s/LmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmlzaXQoZGVwSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmlzaXRpbmcuZGVsZXRlKHRhc2tJZCk7XG4gICAgICAgICAgICB2aXNpdGVkLmFkZCh0YXNrSWQpO1xuXG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHNvcnRlZC5wdXNoKHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiB0YXNrcykge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICAgIHZpc2l0KHRhc2suaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvcnRlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRGVwZW5kZW5jaWVzKHRhc2s6IEV4ZWN1dGFibGVUYXNrKToge1xuICAgICAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICB9IHtcbiAgICAgICAgaWYgKCF0YXNrLmRlcGVuZHNPbiB8fCB0YXNrLmRlcGVuZHNPbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgIGNvbnN0IGRlcFJlc3VsdCA9IHRoaXMudGFza1Jlc3VsdHMuZ2V0KGRlcElkKTtcblxuICAgICAgICAgICAgaWYgKCFkZXBSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGhhcyBub3QgYmVlbiBleGVjdXRlZGAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlcFJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRGVwZW5kZW5jeSAke2RlcElkfSBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtkZXBSZXN1bHQuZXhpdENvZGV9YCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwUmVzdWx0LnN0YXR1cyAhPT0gVGFza1N0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGhhcyBub3QgY29tcGxldGVkIChzdGF0dXM6ICR7ZGVwUmVzdWx0LnN0YXR1c30pYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZVdpdGhSZXRyeSh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICAvLyBleGVjdXRlV2l0aFJldHJ5IHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoIHJlZ3VsYXIgVGFza3MsIG5vdCBBZ2VudFRhc2tzXG4gICAgICAgIC8vIEFnZW50VGFza3MgYXJlIGhhbmRsZWQgc2VwYXJhdGVseSBpbiBleGVjdXRlQWdlbnRUYXNrXG4gICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYGV4ZWN1dGVXaXRoUmV0cnkgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2l0aCBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVsbFRhc2sgPSB0YXNrIGFzIFRhc2s7XG4gICAgICAgIGNvbnN0IG1heEF0dGVtcHRzID0gc2hlbGxUYXNrLnJldHJ5Py5tYXhBdHRlbXB0cyB8fCAxO1xuICAgICAgICBjb25zdCBiYXNlRGVsYXkgPSBzaGVsbFRhc2sucmV0cnk/LmRlbGF5IHx8IDA7XG4gICAgICAgIGNvbnN0IGJhY2tvZmZNdWx0aXBsaWVyID0gc2hlbGxUYXNrLnJldHJ5Py5iYWNrb2ZmTXVsdGlwbGllciB8fCAxO1xuXG4gICAgICAgIGxldCBsYXN0UmVzdWx0OiBUYXNrUmVzdWx0IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgaWYgKGF0dGVtcHQgPiAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSBiYXNlRGVsYXkgKiBiYWNrb2ZmTXVsdGlwbGllciAqKiAoYXR0ZW1wdCAtIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgICAgICBgUmV0cnlpbmcgdGFzayAke3NoZWxsVGFzay5pZH0gaW4gJHtkZWxheX1zIChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoZGVsYXkgKiAxMDAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChzaGVsbFRhc2spO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXN0UmVzdWx0ID0gcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA8IG1heEF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBUYXNrICR7dGFzay5pZH0gZmFpbGVkIChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pOiAke3Jlc3VsdC5zdGRlcnIgfHwgcmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYXN0UmVzdWx0ITtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVDb21tYW5kKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIC8vIGV4ZWN1dGVDb21tYW5kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoIHJlZ3VsYXIgVGFza3MsIG5vdCBBZ2VudFRhc2tzXG4gICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYGV4ZWN1dGVDb21tYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkIHdpdGggYWdlbnQgdGFzazogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hlbGxUYXNrID0gdGFzayBhcyBUYXNrO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXQgPSBzaGVsbFRhc2sudGltZW91dFxuICAgICAgICAgICAgICAgID8gc2hlbGxUYXNrLnRpbWVvdXQgKiAxMDAwXG4gICAgICAgICAgICAgICAgOiAzMDAwMDA7IC8vIERlZmF1bHQgNSBtaW51dGVzXG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBFeGVjdXRpbmcgY29tbWFuZDogJHtzaGVsbFRhc2suY29tbWFuZH1gKTtcblxuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihzaGVsbFRhc2suY29tbWFuZCwgW10sIHtcbiAgICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjd2Q6XG4gICAgICAgICAgICAgICAgICAgIHNoZWxsVGFzay53b3JraW5nRGlyZWN0b3J5ID8/IHRoaXMub3B0aW9ucy53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5vcHRpb25zLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgICAgICAuLi5zaGVsbFRhc2suZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgc3Rkb3V0ID0gXCJcIjtcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSBcIlwiO1xuXG4gICAgICAgICAgICBjaGlsZC5zdGRvdXQ/Lm9uKFwiZGF0YVwiLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgc3Rkb3V0ICs9IGNodW5rO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjaHVuayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZGVycj8ub24oXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBzdGRlcnIgKz0gY2h1bms7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR1RFUk1cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBUYXNrICR7c2hlbGxUYXNrLmlkfSB0aW1lZCBvdXQgYWZ0ZXIgJHtzaGVsbFRhc2sudGltZW91dH1zYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG5cbiAgICAgICAgICAgIGNoaWxkLm9uKFxuICAgICAgICAgICAgICAgIFwiY2xvc2VcIixcbiAgICAgICAgICAgICAgICAoY29kZTogbnVtYmVyIHwgbnVsbCwgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogc2hlbGxUYXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUYXNrU3RhdHVzLkNPTVBMRVRFRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IGNvZGUgfHwgKHNpZ25hbCA/IC0xIDogMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc2lnbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgUHJvY2VzcyB0ZXJtaW5hdGVkIGJ5IHNpZ25hbDogJHtzaWduYWx9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY2hpbGQub24oXCJlcnJvclwiLCAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBzaGVsbFRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0LFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGVlcChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFzayBpcyBhbiBhZ2VudCB0YXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0FnZW50VGFzayh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IHRhc2sgaXMgQWdlbnRUYXNrIHtcbiAgICAgICAgcmV0dXJuIFwidHlwZVwiIGluIHRhc2sgJiYgXCJpbnB1dFwiIGluIHRhc2sgJiYgXCJzdHJhdGVneVwiIGluIHRhc2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhbiBhZ2VudCB0YXNrIHVzaW5nIHRoZSBhZ2VudCBjb29yZGluYXRvclxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUFnZW50VGFzayhcbiAgICAgICAgdGFzazogQWdlbnRUYXNrLFxuICAgICAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEFnZW50IGNvb3JkaW5hdG9yIG5vdCBzZXQuIENhbm5vdCBleGVjdXRlIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIGFnZW50IHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay50eXBlfSlgKTtcblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgYWdlbnQgdGFzay5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBOT1RFOiBUYXNrRXhlY3V0b3IgYWxyZWFkeSByZXNvbHZlcyBjcm9zcy10YXNrIGRlcGVuZGVuY2llcyBhY3Jvc3Mgc2hlbGwgKyBhZ2VudCB0YXNrcy5cbiAgICAgICAgICAgIC8vIEFnZW50Q29vcmRpbmF0b3Igb25seSB1bmRlcnN0YW5kcyBhZ2VudC10by1hZ2VudCBkZXBlbmRlbmNpZXMsIHNvIHdlIHN0cmlwIGRlcGVuZHNPblxuICAgICAgICAgICAgLy8gaGVyZSB0byBhdm9pZCBmYWlsaW5nIG1peGVkIHBsYW5zIChhZ2VudCB0YXNrIGRlcGVuZGluZyBvbiBhIHNoZWxsIHRhc2spLlxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0b3JUYXNrOiBBZ2VudFRhc2sgPSB7XG4gICAgICAgICAgICAgICAgLi4udGFzayxcbiAgICAgICAgICAgICAgICBkZXBlbmRzT246IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBhZ2VudFJlc3VsdCA9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZ2VudENvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrKGNvb3JkaW5hdG9yVGFzayk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgYWdlbnQgcmVzdWx0IHRvIHRhc2sgcmVzdWx0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLmNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFJlc3VsdC5zdGF0dXMpLFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOlxuICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQgPyAwIDogMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IGFnZW50UmVzdWx0Lm91dHB1dFxuICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogYWdlbnRSZXN1bHQuZXJyb3IgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZTogYWdlbnRSZXN1bHQuZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYWdlbnRSZXN1bHQuZXJyb3IsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgJHt0YXNrLmlkfSBjb21wbGV0ZWQgd2l0aCBzdGF0dXM6ICR7cmVzdWx0LnN0YXR1c31gLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiO1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhgQWdlbnQgdGFzayAke3Rhc2suaWR9IGZhaWxlZDogJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYWdlbnQgdGFzayBzdGF0dXMgdG8gcmVndWxhciB0YXNrIHN0YXR1c1xuICAgICAqL1xuICAgIHByaXZhdGUgY29udmVydEFnZW50U3RhdHVzKGFnZW50U3RhdHVzOiBBZ2VudFRhc2tTdGF0dXMpOiBUYXNrU3RhdHVzIHtcbiAgICAgICAgc3dpdGNoIChhZ2VudFN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkNPTVBMRVRFRDtcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLlRJTUVPVVQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuRkFJTEVEO1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuU0tJUFBFRDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5TS0lQUEVEO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5GQUlMRUQ7IC8vIFNob3VsZCBub3QgaGFwcGVuIGluIGZpbmFsIHJlc3VsdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBtdWx0aXBsZSBhZ2VudCB0YXNrcyB3aXRoIGNvb3JkaW5hdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlQWdlbnRUYXNrcyhcbiAgICAgICAgdGFza3M6IEFnZW50VGFza1tdLFxuICAgICAgICBzdHJhdGVneTogQWdncmVnYXRpb25TdHJhdGVneSA9IHsgdHlwZTogXCJzZXF1ZW50aWFsXCIgfSxcbiAgICApOiBQcm9taXNlPFRhc2tSZXN1bHRbXT4ge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWdlbnQgY29vcmRpbmF0b3Igbm90IHNldFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgYEV4ZWN1dGluZyAke3Rhc2tzLmxlbmd0aH0gYWdlbnQgdGFza3Mgd2l0aCBzdHJhdGVneTogJHtzdHJhdGVneS50eXBlfWAsXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgYWdlbnQgdGFza3MgdXNpbmcgY29vcmRpbmF0b3JcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzdWx0cyA9IGF3YWl0IHRoaXMuYWdlbnRDb29yZGluYXRvci5leGVjdXRlVGFza3MoXG4gICAgICAgICAgICAgICAgdGFza3MsXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3ksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIHRhc2sgcmVzdWx0c1xuICAgICAgICAgICAgY29uc3QgdGFza1Jlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IGFnZW50UmVzdWx0cy5tYXAoXG4gICAgICAgICAgICAgICAgKGFnZW50UmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBpZDogYWdlbnRSZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5jb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRSZXN1bHQuc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IDEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYWdlbnRSZXN1bHQub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOiBhZ2VudFJlc3VsdC5lcnJvciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBhZ2VudFJlc3VsdC5zdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IGFnZW50UmVzdWx0LmVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBhZ2VudFJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHRhc2tSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQocmVzdWx0LmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGFza1Jlc3VsdHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayBleGVjdXRpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhZ2VudCBleGVjdXRpb24gcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRQcm9ncmVzcygpOiBhbnkge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudENvb3JkaW5hdG9yLmdldFByb2dyZXNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFnZW50IGV4ZWN1dGlvbiBtZXRyaWNzXG4gICAgICovXG4gICAgcHVibGljIGdldEFnZW50TWV0cmljcygpOiBNYXA8QWdlbnRUeXBlLCBhbnk+IHwgbnVsbCB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZ2V0TWV0cmljcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbVGFza0V4ZWN1dG9yXSAke21lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogUXVhbGl0eSBnYXRlcyBydW5uZXIgZm9yIHRoZSBGZXJnIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEV4ZWN1dGVzIHF1YWxpdHkgZ2F0ZXMgaW4gc2VxdWVuY2Ugd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcgYW5kIHJlcG9ydGluZy5cbiAqL1xuXG5pbXBvcnQgeyBUYXNrRXhlY3V0b3IgfSBmcm9tIFwiLi90YXNrLWV4ZWN1dG9yXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgRXhlY3V0aW9uT3B0aW9ucyxcbiAgICB0eXBlIFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgIHR5cGUgUXVhbGl0eUdhdGVSZXN1bHQsXG4gICAgUXVhbGl0eUdhdGVUeXBlLFxuICAgIHR5cGUgVGFzayxcbiAgICB0eXBlIFRhc2tSZXN1bHQsXG4gICAgVGFza1N0YXR1cyxcbiAgICBUYXNrVHlwZSxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIFF1YWxpdHlHYXRlUnVubmVyIHtcbiAgICBwcml2YXRlIHRhc2tFeGVjdXRvcjogVGFza0V4ZWN1dG9yO1xuICAgIHByaXZhdGUgb3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkcnlSdW46IGZhbHNlLFxuICAgICAgICAgICAgY29udGludWVPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRhc2tFeGVjdXRvciA9IG5ldyBUYXNrRXhlY3V0b3IodGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFsbCBxdWFsaXR5IGdhdGVzIGZvciBhIHBsYW5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZVF1YWxpdHlHYXRlcyhcbiAgICAgICAgZ2F0ZXM6IFF1YWxpdHlHYXRlQ29uZmlnW10sXG4gICAgKTogUHJvbWlzZTxRdWFsaXR5R2F0ZVJlc3VsdFtdPiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFF1YWxpdHlHYXRlUmVzdWx0W10gPSBbXTtcblxuICAgICAgICAvLyBTb3J0IGdhdGVzIGJ5IHR5cGUgdG8gZW5zdXJlIGNvbnNpc3RlbnQgZXhlY3V0aW9uIG9yZGVyXG4gICAgICAgIGNvbnN0IHNvcnRlZEdhdGVzID0gdGhpcy5zb3J0R2F0ZXNCeVByaW9yaXR5KGdhdGVzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGdhdGUgb2Ygc29ydGVkR2F0ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVF1YWxpdHlHYXRlKGdhdGUpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgZXhlY3V0aW9uIGlmIGEgcmVxdWlyZWQgZ2F0ZSBmYWlsc1xuICAgICAgICAgICAgaWYgKGdhdGUucmVxdWlyZWQgJiYgIXJlc3VsdC5wYXNzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFN0b3BwaW5nIGV4ZWN1dGlvbiBkdWUgdG8gcmVxdWlyZWQgcXVhbGl0eSBnYXRlIGZhaWx1cmU6ICR7Z2F0ZS5pZH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgc2luZ2xlIHF1YWxpdHkgZ2F0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUXVhbGl0eUdhdGUoXG4gICAgICAgIGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgICk6IFByb21pc2U8UXVhbGl0eUdhdGVSZXN1bHQ+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBxdWFsaXR5IGdhdGU6ICR7Z2F0ZS5pZH0gKCR7Z2F0ZS5uYW1lfSlgKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRoaXMuY3JlYXRlVGFza0Zyb21HYXRlKGdhdGUpO1xuICAgICAgICAgICAgY29uc3QgdGFza1Jlc3VsdCA9IGF3YWl0IHRoaXMudGFza0V4ZWN1dG9yLmV4ZWN1dGVUYXNrKHRhc2spO1xuXG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBwYXNzZWQgPSB0aGlzLmV2YWx1YXRlR2F0ZVJlc3VsdChnYXRlLCB0YXNrUmVzdWx0KTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBRdWFsaXR5R2F0ZVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBnYXRlSWQ6IGdhdGUuaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0YXNrUmVzdWx0LnN0YXR1cyxcbiAgICAgICAgICAgICAgICBwYXNzZWQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jcmVhdGVSZXN1bHRNZXNzYWdlKGdhdGUsIHRhc2tSZXN1bHQsIHBhc3NlZCksXG4gICAgICAgICAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgICAgICAgICB0YXNrUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnOiBnYXRlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYFF1YWxpdHkgZ2F0ZSAke2dhdGUuaWR9ICR7cGFzc2VkID8gXCJwYXNzZWRcIiA6IFwiZmFpbGVkXCJ9IGluICR7ZHVyYXRpb259bXNgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgIGBRdWFsaXR5IGdhdGUgJHtnYXRlLmlkfSBmYWlsZWQgd2l0aCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZ2F0ZUlkOiBnYXRlLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgUXVhbGl0eSBnYXRlIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgZGV0YWlsczogeyBlcnJvcjogZXJyb3JNZXNzYWdlIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBkZWZhdWx0IHF1YWxpdHkgZ2F0ZXMgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGVmYXVsdEdhdGVzKCk6IFF1YWxpdHlHYXRlQ29uZmlnW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcImxpbnRcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkNvZGUgTGludGluZ1wiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkNoZWNrIGNvZGUgc3R5bGUgYW5kIGZvcm1hdHRpbmdcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBRdWFsaXR5R2F0ZVR5cGUuTElOVCxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIGxpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNjAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwidHlwZXNcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIlR5cGUgQ2hlY2tpbmdcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUeXBlU2NyaXB0IGNvbXBpbGF0aW9uIGNoZWNrXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLlRZUEVTLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTIwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcInRlc3RzXCIsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJVbml0IFRlc3RzXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUnVuIHVuaXQgdGVzdCBzdWl0ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5URVNUUyxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gdGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwiYnVpbGRcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkJ1aWxkIFByb2Nlc3NcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJCdWlsZCB0aGUgcHJvamVjdFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5CVUlMRCxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIGJ1aWxkXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE4MCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJpbnRlZ3JhdGlvblwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiSW50ZWdyYXRpb24gVGVzdHNcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSdW4gaW50ZWdyYXRpb24gdGVzdCBzdWl0ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFwibnBtIHJ1biB0ZXN0OmludGVncmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJkZXBsb3lcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkRlcGxveW1lbnQgVmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlZhbGlkYXRlIGRlcGxveW1lbnQgcmVhZGluZXNzXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLkRFUExPWSxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFwibnBtIHJ1biBkZXBsb3k6dmFsaWRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBxdWFsaXR5IGdhdGVzIGZyb20gdGFza3MgaW4gYSBwbGFuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVHYXRlc0Zyb21UYXNrcyh0YXNrczogVGFza1tdKTogUXVhbGl0eUdhdGVDb25maWdbXSB7XG4gICAgICAgIGNvbnN0IGdhdGVzOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoUXVhbGl0eUdhdGVSdW5uZXIuaXNRdWFsaXR5R2F0ZVRhc2sodGFzaykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnYXRlVHlwZSA9IFF1YWxpdHlHYXRlUnVubmVyLm1hcFRhc2tUeXBlVG9HYXRlVHlwZShcbiAgICAgICAgICAgICAgICAgICAgdGFzay50eXBlLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBnYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhc2submFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRhc2suZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGdhdGVUeXBlLFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSwgLy8gRGVmYXVsdCB0byByZXF1aXJlZCBmb3IgZXhwbGljaXQgZ2F0ZSB0YXNrc1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IHRhc2suY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRhc2sudGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IHRhc2sud29ya2luZ0RpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiB0YXNrLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0YXNrSWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2F0ZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzb3J0R2F0ZXNCeVByaW9yaXR5KFxuICAgICAgICBnYXRlczogUXVhbGl0eUdhdGVDb25maWdbXSxcbiAgICApOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdIHtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlPcmRlciA9IFtcbiAgICAgICAgICAgIFF1YWxpdHlHYXRlVHlwZS5MSU5ULFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLlRZUEVTLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLlRFU1RTLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLkJVSUxELFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLkRFUExPWSxcbiAgICAgICAgXTtcblxuICAgICAgICByZXR1cm4gZ2F0ZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYVByaW9yaXR5ID0gcHJpb3JpdHlPcmRlci5pbmRleE9mKGEudHlwZSk7XG4gICAgICAgICAgICBjb25zdCBiUHJpb3JpdHkgPSBwcmlvcml0eU9yZGVyLmluZGV4T2YoYi50eXBlKTtcblxuICAgICAgICAgICAgaWYgKGFQcmlvcml0eSAhPT0gYlByaW9yaXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFQcmlvcml0eSAtIGJQcmlvcml0eTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgc2FtZSB0eXBlLCBzb3J0IGJ5IHJlcXVpcmVkIHN0YXR1cyBmaXJzdFxuICAgICAgICAgICAgaWYgKGEucmVxdWlyZWQgIT09IGIucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5yZXF1aXJlZCA/IDEgOiAtMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSBzb3J0IGJ5IElEXG4gICAgICAgICAgICByZXR1cm4gYS5pZC5sb2NhbGVDb21wYXJlKGIuaWQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRhc2tGcm9tR2F0ZShnYXRlOiBRdWFsaXR5R2F0ZUNvbmZpZyk6IFRhc2sge1xuICAgICAgICBjb25zdCBjb25maWcgPSBnYXRlLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGBnYXRlLSR7Z2F0ZS5pZH1gLFxuICAgICAgICAgICAgbmFtZTogYFF1YWxpdHkgR2F0ZTogJHtnYXRlLm5hbWV9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBnYXRlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5tYXBHYXRlVHlwZVRvVGFza1R5cGUoZ2F0ZS50eXBlKSxcbiAgICAgICAgICAgIGNvbW1hbmQ6XG4gICAgICAgICAgICAgICAgKGNvbmZpZy5jb21tYW5kIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlZmF1bHRDb21tYW5kRm9yR2F0ZShnYXRlLnR5cGUpLFxuICAgICAgICAgICAgd29ya2luZ0RpcmVjdG9yeTogY29uZmlnLndvcmtpbmdEaXJlY3RvcnkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IGNvbmZpZy5lbnZpcm9ubWVudCBhc1xuICAgICAgICAgICAgICAgIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuICAgICAgICAgICAgICAgIHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdGltZW91dDpcbiAgICAgICAgICAgICAgICAoY29uZmlnLnRpbWVvdXQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdFRpbWVvdXRGb3JHYXRlKGdhdGUudHlwZSksXG4gICAgICAgICAgICByZXRyeToge1xuICAgICAgICAgICAgICAgIG1heEF0dGVtcHRzOiAxLFxuICAgICAgICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hcEdhdGVUeXBlVG9UYXNrVHlwZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogVGFza1R5cGUge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0ge1xuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5MSU5UXTogVGFza1R5cGUuTElOVCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVFlQRVNdOiBUYXNrVHlwZS5UWVBFUyxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVEVTVFNdOiBUYXNrVHlwZS5URVNUUyxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuQlVJTERdOiBUYXNrVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiBUYXNrVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZXTogVGFza1R5cGUuREVQTE9ZLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtYXBwaW5nW2dhdGVUeXBlXSB8fCBUYXNrVHlwZS5TSEVMTDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBtYXBUYXNrVHlwZVRvR2F0ZVR5cGUodGFza1R5cGU6IFRhc2tUeXBlKTogUXVhbGl0eUdhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgbWFwcGluZzogUGFydGlhbDxSZWNvcmQ8VGFza1R5cGUsIFF1YWxpdHlHYXRlVHlwZT4+ID0ge1xuICAgICAgICAgICAgW1Rhc2tUeXBlLkxJTlRdOiBRdWFsaXR5R2F0ZVR5cGUuTElOVCxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5UWVBFU106IFF1YWxpdHlHYXRlVHlwZS5UWVBFUyxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5URVNUU106IFF1YWxpdHlHYXRlVHlwZS5URVNUUyxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5CVUlMRF06IFF1YWxpdHlHYXRlVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5JTlRFR1JBVElPTl06IFF1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgIFtUYXNrVHlwZS5ERVBMT1ldOiBRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtYXBwaW5nW3Rhc2tUeXBlXSB8fCBRdWFsaXR5R2F0ZVR5cGUuTElOVDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlZmF1bHRDb21tYW5kRm9yR2F0ZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY29tbWFuZHMgPSB7XG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkxJTlRdOiBcIm5wbSBydW4gbGludFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5UWVBFU106IFwibnBtIHJ1biBidWlsZFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5URVNUU106IFwibnBtIHRlc3RcIixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuQlVJTERdOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiBcIm5wbSBydW4gdGVzdDppbnRlZ3JhdGlvblwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5ERVBMT1ldOiBcIm5wbSBydW4gZGVwbG95OnZhbGlkYXRlXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzW2dhdGVUeXBlXSB8fCAnZWNobyBcIk5vIGNvbW1hbmQgY29uZmlndXJlZFwiJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlZmF1bHRUaW1lb3V0Rm9yR2F0ZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgdGltZW91dHMgPSB7XG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkxJTlRdOiA2MCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVFlQRVNdOiAxMjAsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLlRFU1RTXTogMzAwLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5CVUlMRF06IDE4MCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiA2MDAsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkRFUExPWV06IDMwMCxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGltZW91dHNbZ2F0ZVR5cGVdIHx8IDYwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVHYXRlUmVzdWx0KFxuICAgICAgICBnYXRlOiBRdWFsaXR5R2F0ZUNvbmZpZyxcbiAgICAgICAgdGFza1Jlc3VsdDogYW55LCAvLyBVc2luZyBhbnkgdG8gc3VwcG9ydCBib3RoIFRhc2tSZXN1bHQgYW5kIFF1YWxpdHlHYXRlUmVzdWx0XG4gICAgKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIEJhc2ljIGV2YWx1YXRpb246IHRhc2sgbXVzdCBjb21wbGV0ZSBzdWNjZXNzZnVsbHlcbiAgICAgICAgaWYgKHRhc2tSZXN1bHQuc3RhdHVzICE9PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXhpdCBjb2RlIG11c3QgYmUgMCBmb3Igc3VjY2Vzc1xuICAgICAgICBpZiAodGFza1Jlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHlwZS1zcGVjaWZpYyBldmFsdWF0aW9ucyBjYW4gYmUgYWRkZWQgaGVyZVxuICAgICAgICBzd2l0Y2ggKGdhdGUudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBRdWFsaXR5R2F0ZVR5cGUuVEVTVFM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVUZXN0R2F0ZSh0YXNrUmVzdWx0KTtcbiAgICAgICAgICAgIGNhc2UgUXVhbGl0eUdhdGVUeXBlLkJVSUxEOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlQnVpbGRHYXRlKHRhc2tSZXN1bHQpO1xuICAgICAgICAgICAgY2FzZSBRdWFsaXR5R2F0ZVR5cGUuTElOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUxpbnRHYXRlKHRhc2tSZXN1bHQpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVUZXN0R2F0ZSh0YXNrUmVzdWx0OiBUYXNrUmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBjb21tb24gdGVzdCBzdWNjZXNzIGluZGljYXRvcnNcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gKHRhc2tSZXN1bHQuc3Rkb3V0ICsgdGFza1Jlc3VsdC5zdGRlcnIpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gTG9vayBmb3IgdGVzdCBzdWNjZXNzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9wYXNzaW5nLyxcbiAgICAgICAgICAgIC9wYXNzZWQvLFxuICAgICAgICAgICAgL+Kcky8sXG4gICAgICAgICAgICAv4pyULyxcbiAgICAgICAgICAgIC9hbGwgdGVzdHMgcGFzc2VkLyxcbiAgICAgICAgICAgIC90ZXN0IHN1aXRlIHBhc3NlZC8sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTG9vayBmb3IgdGVzdCBmYWlsdXJlIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGZhaWx1cmVQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9mYWlsaW5nLyxcbiAgICAgICAgICAgIC9mYWlsZWQvLFxuICAgICAgICAgICAgL+Kcly8sXG4gICAgICAgICAgICAv4pyYLyxcbiAgICAgICAgICAgIC90ZXN0IGZhaWxlZC8sXG4gICAgICAgICAgICAvdGVzdHMgZmFpbGVkLyxcbiAgICAgICAgICAgIC9lcnJvcjovLFxuICAgICAgICAgICAgL2V4Y2VwdGlvbi8sXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaGFzU3VjY2Vzc1BhdHRlcm4gPSBzdWNjZXNzUGF0dGVybnMuc29tZSgocGF0dGVybikgPT5cbiAgICAgICAgICAgIHBhdHRlcm4udGVzdChvdXRwdXQpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBoYXNGYWlsdXJlUGF0dGVybiA9IGZhaWx1cmVQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PlxuICAgICAgICAgICAgcGF0dGVybi50ZXN0KG91dHB1dCksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGV4cGxpY2l0IHN1Y2Nlc3MgaW5kaWNhdG9ycywgdHJ1c3QgdGhvc2VcbiAgICAgICAgaWYgKGhhc1N1Y2Nlc3NQYXR0ZXJuICYmICFoYXNGYWlsdXJlUGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgZXhwbGljaXQgZmFpbHVyZSBpbmRpY2F0b3JzLCBmYWlsXG4gICAgICAgIGlmIChoYXNGYWlsdXJlUGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmYXVsdCB0byBleGl0IGNvZGUgZXZhbHVhdGlvblxuICAgICAgICByZXR1cm4gdGFza1Jlc3VsdC5leGl0Q29kZSA9PT0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2YWx1YXRlQnVpbGRHYXRlKHRhc2tSZXN1bHQ6IFRhc2tSZXN1bHQpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQnVpbGQgaXMgc3VjY2Vzc2Z1bCBpZiBleGl0IGNvZGUgaXMgMCBhbmQgbm8gb2J2aW91cyBlcnJvciBwYXR0ZXJuc1xuICAgICAgICBjb25zdCBvdXRwdXQgPSAodGFza1Jlc3VsdC5zdGRvdXQgKyB0YXNrUmVzdWx0LnN0ZGVycikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCBlcnJvclBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2J1aWxkIGZhaWxlZC8sXG4gICAgICAgICAgICAvY29tcGlsYXRpb24gZXJyb3IvLFxuICAgICAgICAgICAgL3N5bnRheCBlcnJvci8sXG4gICAgICAgICAgICAvdHlwZSBlcnJvci8sXG4gICAgICAgICAgICAvZXJyb3I6LyxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBoYXNFcnJvclBhdHRlcm4gPSBlcnJvclBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+XG4gICAgICAgICAgICBwYXR0ZXJuLnRlc3Qob3V0cHV0KSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gIWhhc0Vycm9yUGF0dGVybiAmJiB0YXNrUmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVMaW50R2F0ZSh0YXNrUmVzdWx0OiBUYXNrUmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIExpbnRpbmcgaXMgc3VjY2Vzc2Z1bCBpZiBleGl0IGNvZGUgaXMgMCBhbmQgbm8gZXJyb3IgcGF0dGVybnNcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gKHRhc2tSZXN1bHQuc3Rkb3V0ICsgdGFza1Jlc3VsdC5zdGRlcnIpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgY29uc3QgZXJyb3JQYXR0ZXJucyA9IFsvZXJyb3IvLCAvcHJvYmxlbS8sIC93YXJuaW5nLywgL2lzc3VlL107XG5cbiAgICAgICAgY29uc3QgaGFzRXJyb3JQYXR0ZXJuID0gZXJyb3JQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PlxuICAgICAgICAgICAgcGF0dGVybi50ZXN0KG91dHB1dCksXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuICFoYXNFcnJvclBhdHRlcm4gJiYgdGFza1Jlc3VsdC5leGl0Q29kZSA9PT0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVJlc3VsdE1lc3NhZ2UoXG4gICAgICAgIGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgICAgICB0YXNrUmVzdWx0OiBUYXNrUmVzdWx0LFxuICAgICAgICBwYXNzZWQ6IGJvb2xlYW4sXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHBhc3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiBwYXNzZWQgc3VjY2Vzc2Z1bGx5YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXNrUmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIHJldHVybiBgUXVhbGl0eSBnYXRlIFwiJHtnYXRlLm5hbWV9XCIgZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7dGFza1Jlc3VsdC5leGl0Q29kZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhc2tSZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLlNLSVBQRUQpIHtcbiAgICAgICAgICAgIHJldHVybiBgUXVhbGl0eSBnYXRlIFwiJHtnYXRlLm5hbWV9XCIgd2FzIHNraXBwZWQ6ICR7dGFza1Jlc3VsdC5lcnJvcn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiBkaWQgbm90IGNvbXBsZXRlIHN1Y2Nlc3NmdWxseWA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaXNRdWFsaXR5R2F0ZVRhc2sodGFzazogVGFzayk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgVGFza1R5cGUuTElOVCxcbiAgICAgICAgICAgIFRhc2tUeXBlLlRZUEVTLFxuICAgICAgICAgICAgVGFza1R5cGUuVEVTVFMsXG4gICAgICAgICAgICBUYXNrVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFRhc2tUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgVGFza1R5cGUuREVQTE9ZLFxuICAgICAgICBdLmluY2x1ZGVzKHRhc2sudHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtRdWFsaXR5R2F0ZVJ1bm5lcl0gJHttZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQUtBO0FBbUJPLE1BQU0sYUFBYTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLGNBQXVDLElBQUk7QUFBQSxFQUMzQyxlQUE0QixJQUFJO0FBQUEsRUFDaEM7QUFBQSxFQUVSLFdBQVcsQ0FBQyxVQUE0QixDQUFDLEdBQUc7QUFBQSxJQUN4QyxLQUFLLFVBQVU7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLGlCQUFpQjtBQUFBLE1BQ2pCLGdCQUFnQjtBQUFBLE1BQ2hCLFNBQVM7QUFBQSxTQUNOO0FBQUEsSUFDUDtBQUFBO0FBQUEsRUFNRyxtQkFBbUIsQ0FBQyxhQUFxQztBQUFBLElBQzVELEtBQUssbUJBQW1CO0FBQUE7QUFBQSxPQU1mLFlBQVcsQ0FBQyxNQUFtQztBQUFBLElBQ3hELEtBQUssWUFBWSxNQUFNO0FBQUEsSUFDdkIsS0FBSyxhQUFhLE1BQU07QUFBQSxJQUV4QixNQUFNLGlCQUFpQixLQUFLLHNCQUFzQixLQUFLLEtBQUs7QUFBQSxJQUM1RCxNQUFNLFVBQXdCLENBQUM7QUFBQSxJQUUvQixXQUFXLFFBQVEsZ0JBQWdCO0FBQUEsTUFDL0IsTUFBTSxTQUFTLE1BQU0sS0FBSyxZQUFZLElBQUk7QUFBQSxNQUMxQyxLQUFLLFlBQVksSUFBSSxLQUFLLElBQUksTUFBTTtBQUFBLE1BQ3BDLFFBQVEsS0FBSyxNQUFNO0FBQUEsTUFHbkIsSUFDSSxPQUFPLG9DQUNQLENBQUMsS0FBSyxRQUFRLGlCQUNoQjtBQUFBLFFBQ0UsS0FBSyxJQUFJLDJDQUEyQyxLQUFLLElBQUk7QUFBQSxRQUM3RDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxPQU1FLFlBQVcsQ0FBQyxNQUEyQztBQUFB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QUFDLFlBQzVDLFFBQVEsS0FBSyxNQUFNLENBQ3ZCO0FBQUEsSUFDQSxNQUFNLG9CQUFvQixnQkFBZ0IsS0FBSyxDQUFDLFlBQzVDLFFBQVEsS0FBSyxNQUFNLENBQ3ZCO0FBQUEsSUFHQSxJQUFJLHFCQUFxQixDQUFDLG1CQUFtQjtBQUFBLE1BQ3pDLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFHQSxJQUFJLG1CQUFtQjtBQUFBLE1BQ25CLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFHQSxPQUFPLFdBQVcsYUFBYTtBQUFBO0FBQUEsRUFHM0IsaUJBQWlCLENBQUMsWUFBaUM7QUFBQSxJQUV2RCxNQUFNLFVBQVUsV0FBVyxTQUFTLFdBQVcsUUFBUSxZQUFZO0FBQUEsSUFFbkUsTUFBTSxnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsSUFFQSxNQUFNLGtCQUFrQixjQUFjLEtBQUssQ0FBQyxZQUN4QyxRQUFRLEtBQUssTUFBTSxDQUN2QjtBQUFBLElBRUEsT0FBTyxDQUFDLG1CQUFtQixXQUFXLGFBQWE7QUFBQTtBQUFBLEVBRy9DLGdCQUFnQixDQUFDLFlBQWlDO0FBQUEsSUFFdEQsTUFBTSxVQUFVLFdBQVcsU0FBUyxXQUFXLFFBQVEsWUFBWTtBQUFBLElBRW5FLE1BQU0sZ0JBQWdCLENBQUMsU0FBUyxXQUFXLFdBQVcsT0FBTztBQUFBLElBRTdELE1BQU0sa0JBQWtCLGNBQWMsS0FBSyxDQUFDLFlBQ3hDLFFBQVEsS0FBSyxNQUFNLENBQ3ZCO0FBQUEsSUFFQSxPQUFPLENBQUMsbUJBQW1CLFdBQVcsYUFBYTtBQUFBO0FBQUEsRUFHL0MsbUJBQW1CLENBQ3ZCLE1BQ0EsWUFDQSxRQUNNO0FBQUEsSUFDTixJQUFJLFFBQVE7QUFBQSxNQUNSLE9BQU8saUJBQWlCLEtBQUs7QUFBQSxJQUNqQztBQUFBLElBRUEsSUFBSSxXQUFXLGtDQUE4QjtBQUFBLE1BQ3pDLE9BQU8saUJBQWlCLEtBQUssK0JBQStCLFdBQVc7QUFBQSxJQUMzRTtBQUFBLElBRUEsSUFBSSxXQUFXLG9DQUErQjtBQUFBLE1BQzFDLE9BQU8saUJBQWlCLEtBQUssc0JBQXNCLFdBQVc7QUFBQSxJQUNsRTtBQUFBLElBRUEsT0FBTyxpQkFBaUIsS0FBSztBQUFBO0FBQUEsU0FHbEIsaUJBQWlCLENBQUMsTUFBcUI7QUFBQSxJQUNsRCxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPUCxFQUFFLFNBQVMsS0FBSyxJQUFJO0FBQUE7QUFBQSxFQUdoQixHQUFHLENBQUMsU0FBdUI7QUFBQSxJQUMvQixJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFDdEIsUUFBUSxJQUFJLHVCQUF1QixTQUFTO0FBQUEsSUFDaEQ7QUFBQTtBQUVSOyIsCiAgImRlYnVnSWQiOiAiOEIyNUVBRTk4Njc4RjRGMzY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
