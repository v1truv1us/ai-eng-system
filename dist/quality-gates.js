// src/execution/task-executor.ts
import { spawn, spawnSync } from "node:child_process";
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
        detached: true,
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
        this.log(`Task ${shellTask.id} timed out after ${timeout / 1000}s`);
        if (child.pid) {
          if (process.platform === "win32") {
            try {
              const result = spawnSync("taskkill", ["/PID", child.pid.toString(), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
              if (result.error || result.status !== 0) {
                try {
                  child.kill("SIGKILL");
                } catch {}
              }
            } catch {
              try {
                child.kill("SIGKILL");
              } catch {}
            }
          } else {
            try {
              process.kill(-child.pid, "SIGKILL");
            } catch {
              try {
                child.kill("SIGKILL");
              } catch {}
            }
          }
        }
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

//# debugId=D5F0CD4E5913CB5764756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIiwgIi4uL3NyYy9leGVjdXRpb24vcXVhbGl0eS1nYXRlcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFRhc2sgZXhlY3V0b3IgZm9yIHRoZSBBSSBFbmdpbmVlcmluZyBTeXN0ZW0uXG4gKiBIYW5kbGVzIHRhc2sgZXhlY3V0aW9uLCBkZXBlbmRlbmN5IHJlc29sdXRpb24sIGFuZCByZXN1bHQgdHJhY2tpbmcuXG4gKi9cblxuaW1wb3J0IHsgc3Bhd24sIHNwYXduU3luYyB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJub2RlOnV0aWxcIjtcbmltcG9ydCB0eXBlIHsgQWdlbnRDb29yZGluYXRvciB9IGZyb20gXCIuLi9hZ2VudHMvY29vcmRpbmF0b3JcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBBZ2VudFRhc2ssXG4gICAgQWdlbnRUYXNrUmVzdWx0LFxuICAgIEFnZW50VGFza1N0YXR1cyxcbiAgICB0eXBlIEFnZW50VHlwZSxcbiAgICB0eXBlIEFnZ3JlZ2F0aW9uU3RyYXRlZ3ksXG59IGZyb20gXCIuLi9hZ2VudHMvdHlwZXNcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBFeGVjdXRhYmxlVGFzayxcbiAgICB0eXBlIEV4ZWN1dGlvbk9wdGlvbnMsXG4gICAgdHlwZSBQbGFuLFxuICAgIHR5cGUgVGFzayxcbiAgICB0eXBlIFRhc2tSZXN1bHQsXG4gICAgVGFza1N0YXR1cyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIFRhc2tFeGVjdXRvciB7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zO1xuICAgIHByaXZhdGUgdGFza1Jlc3VsdHM6IE1hcDxzdHJpbmcsIFRhc2tSZXN1bHQ+ID0gbmV3IE1hcCgpO1xuICAgIHByaXZhdGUgcnVubmluZ1Rhc2tzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIGFnZW50Q29vcmRpbmF0b3I/OiBBZ2VudENvb3JkaW5hdG9yO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRyeVJ1bjogZmFsc2UsXG4gICAgICAgICAgICBjb250aW51ZU9uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgbWF4Q29uY3VycmVuY3k6IDEsXG4gICAgICAgICAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGFnZW50IGNvb3JkaW5hdG9yIGZvciBleGVjdXRpbmcgYWdlbnQgdGFza3NcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0QWdlbnRDb29yZGluYXRvcihjb29yZGluYXRvcjogQWdlbnRDb29yZGluYXRvcik6IHZvaWQge1xuICAgICAgICB0aGlzLmFnZW50Q29vcmRpbmF0b3IgPSBjb29yZGluYXRvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFsbCB0YXNrcyBpbiBhIHBsYW4gd2l0aCBkZXBlbmRlbmN5IHJlc29sdXRpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZVBsYW4ocGxhbjogUGxhbik6IFByb21pc2U8VGFza1Jlc3VsdFtdPiB7XG4gICAgICAgIHRoaXMudGFza1Jlc3VsdHMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuY2xlYXIoKTtcblxuICAgICAgICBjb25zdCBleGVjdXRpb25PcmRlciA9IHRoaXMucmVzb2x2ZUV4ZWN1dGlvbk9yZGVyKHBsYW4udGFza3MpO1xuICAgICAgICBjb25zdCByZXN1bHRzOiBUYXNrUmVzdWx0W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgZXhlY3V0aW9uT3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVRhc2sodGFzayk7XG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgZXhlY3V0aW9uIGlmIHRhc2sgZmFpbGVkIGFuZCBjb250aW51ZU9uRXJyb3IgaXMgZmFsc2VcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICByZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkZBSUxFRCAmJlxuICAgICAgICAgICAgICAgICF0aGlzLm9wdGlvbnMuY29udGludWVPbkVycm9yXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhgU3RvcHBpbmcgZXhlY3V0aW9uIGR1ZSB0byB0YXNrIGZhaWx1cmU6ICR7dGFzay5pZH1gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBzaW5nbGUgdGFza1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlVGFzayh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nVGFza3MuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhc2sgJHt0YXNrLmlkfSBpcyBhbHJlYWR5IHJ1bm5pbmdgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucnVubmluZ1Rhc2tzLmFkZCh0YXNrLmlkKTtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyB0YXNrOiAke3Rhc2suaWR9ICgke3Rhc2submFtZX0pYCk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGRlcGVuZGVuY2llc1xuICAgICAgICAgICAgY29uc3QgZGVwZW5kZW5jeVJlc3VsdCA9IHRoaXMuY2hlY2tEZXBlbmRlbmNpZXModGFzayk7XG4gICAgICAgICAgICBpZiAoIWRlcGVuZGVuY3lSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5TS0lQUEVELFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jeVJlc3VsdC5lcnJvciA/PyBcIlVua25vd24gZGVwZW5kZW5jeSBlcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZGVwZW5kZW5jeVJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSGFuZGxlIGRyeSBydW4gbW9kZVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhgW0RSWSBSVU5dIFdvdWxkIGV4ZWN1dGU6ICR7dGFzay5jb21tYW5kfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5DT01QTEVURUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQ6IGBbRFJZIFJVTl0gQ29tbWFuZDogJHt0YXNrLmNvbW1hbmR9YCxcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGFnZW50IHRhc2tcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZXhlY3V0ZUFnZW50VGFzayhcbiAgICAgICAgICAgICAgICAgICAgdGFzayBhcyBBZ2VudFRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSB0YXNrIHdpdGggcmV0cnkgbG9naWNcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVdpdGhSZXRyeSh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLmxvZyhgVGFzayAke3Rhc2suaWR9IGNvbXBsZXRlZCB3aXRoIHN0YXR1czogJHtyZXN1bHQuc3RhdHVzfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBUYXNrICR7dGFzay5pZH0gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICBzdGRlcnI6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuZGVsZXRlKHRhc2suaWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZXN1bHQgb2YgYSBwcmV2aW91c2x5IGV4ZWN1dGVkIHRhc2tcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VGFza1Jlc3VsdCh0YXNrSWQ6IHN0cmluZyk6IFRhc2tSZXN1bHQgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy50YXNrUmVzdWx0cy5nZXQodGFza0lkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRhc2sgcmVzdWx0c1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBbGxSZXN1bHRzKCk6IFRhc2tSZXN1bHRbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudGFza1Jlc3VsdHMudmFsdWVzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCB0YXNrIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXJSZXN1bHRzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNvbHZlRXhlY3V0aW9uT3JkZXIodGFza3M6IEV4ZWN1dGFibGVUYXNrW10pOiBFeGVjdXRhYmxlVGFza1tdIHtcbiAgICAgICAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCB2aXNpdGluZyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBzb3J0ZWQ6IEV4ZWN1dGFibGVUYXNrW10gPSBbXTtcbiAgICAgICAgY29uc3QgdGFza01hcCA9IG5ldyBNYXAodGFza3MubWFwKCh0KSA9PiBbdC5pZCwgdF0pKTtcblxuICAgICAgICBjb25zdCB2aXNpdCA9ICh0YXNrSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKHZpc2l0aW5nLmhhcyh0YXNrSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBpbnZvbHZpbmcgdGFzazogJHt0YXNrSWR9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodmlzaXRlZC5oYXModGFza0lkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmlzaXRpbmcuYWRkKHRhc2tJZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSB0YXNrTWFwLmdldCh0YXNrSWQpO1xuICAgICAgICAgICAgaWYgKHRhc2s/LmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmlzaXQoZGVwSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmlzaXRpbmcuZGVsZXRlKHRhc2tJZCk7XG4gICAgICAgICAgICB2aXNpdGVkLmFkZCh0YXNrSWQpO1xuXG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHNvcnRlZC5wdXNoKHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiB0YXNrcykge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICAgIHZpc2l0KHRhc2suaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvcnRlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrRGVwZW5kZW5jaWVzKHRhc2s6IEV4ZWN1dGFibGVUYXNrKToge1xuICAgICAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICB9IHtcbiAgICAgICAgaWYgKCF0YXNrLmRlcGVuZHNPbiB8fCB0YXNrLmRlcGVuZHNPbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgIGNvbnN0IGRlcFJlc3VsdCA9IHRoaXMudGFza1Jlc3VsdHMuZ2V0KGRlcElkKTtcblxuICAgICAgICAgICAgaWYgKCFkZXBSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGhhcyBub3QgYmVlbiBleGVjdXRlZGAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlcFJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRGVwZW5kZW5jeSAke2RlcElkfSBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtkZXBSZXN1bHQuZXhpdENvZGV9YCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwUmVzdWx0LnN0YXR1cyAhPT0gVGFza1N0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGhhcyBub3QgY29tcGxldGVkIChzdGF0dXM6ICR7ZGVwUmVzdWx0LnN0YXR1c30pYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZVdpdGhSZXRyeSh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICAvLyBleGVjdXRlV2l0aFJldHJ5IHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoIHJlZ3VsYXIgVGFza3MsIG5vdCBBZ2VudFRhc2tzXG4gICAgICAgIC8vIEFnZW50VGFza3MgYXJlIGhhbmRsZWQgc2VwYXJhdGVseSBpbiBleGVjdXRlQWdlbnRUYXNrXG4gICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYGV4ZWN1dGVXaXRoUmV0cnkgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2l0aCBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVsbFRhc2sgPSB0YXNrIGFzIFRhc2s7XG4gICAgICAgIGNvbnN0IG1heEF0dGVtcHRzID0gc2hlbGxUYXNrLnJldHJ5Py5tYXhBdHRlbXB0cyB8fCAxO1xuICAgICAgICBjb25zdCBiYXNlRGVsYXkgPSBzaGVsbFRhc2sucmV0cnk/LmRlbGF5IHx8IDA7XG4gICAgICAgIGNvbnN0IGJhY2tvZmZNdWx0aXBsaWVyID0gc2hlbGxUYXNrLnJldHJ5Py5iYWNrb2ZmTXVsdGlwbGllciB8fCAxO1xuXG4gICAgICAgIGxldCBsYXN0UmVzdWx0OiBUYXNrUmVzdWx0IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gbWF4QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgaWYgKGF0dGVtcHQgPiAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSBiYXNlRGVsYXkgKiBiYWNrb2ZmTXVsdGlwbGllciAqKiAoYXR0ZW1wdCAtIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgICAgICBgUmV0cnlpbmcgdGFzayAke3NoZWxsVGFzay5pZH0gaW4gJHtkZWxheX1zIChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoZGVsYXkgKiAxMDAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChzaGVsbFRhc2spO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXN0UmVzdWx0ID0gcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA8IG1heEF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBUYXNrICR7dGFzay5pZH0gZmFpbGVkIChhdHRlbXB0ICR7YXR0ZW1wdH0vJHttYXhBdHRlbXB0c30pOiAke3Jlc3VsdC5zdGRlcnIgfHwgcmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYXN0UmVzdWx0ITtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVDb21tYW5kKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIC8vIGV4ZWN1dGVDb21tYW5kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoIHJlZ3VsYXIgVGFza3MsIG5vdCBBZ2VudFRhc2tzXG4gICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYGV4ZWN1dGVDb21tYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkIHdpdGggYWdlbnQgdGFzazogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hlbGxUYXNrID0gdGFzayBhcyBUYXNrO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXQgPSBzaGVsbFRhc2sudGltZW91dFxuICAgICAgICAgICAgICAgID8gc2hlbGxUYXNrLnRpbWVvdXQgKiAxMDAwXG4gICAgICAgICAgICAgICAgOiAzMDAwMDA7IC8vIERlZmF1bHQgNSBtaW51dGVzXG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBFeGVjdXRpbmcgY29tbWFuZDogJHtzaGVsbFRhc2suY29tbWFuZH1gKTtcblxuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihzaGVsbFRhc2suY29tbWFuZCwgW10sIHtcbiAgICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZXRhY2hlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjd2Q6XG4gICAgICAgICAgICAgICAgICAgIHNoZWxsVGFzay53b3JraW5nRGlyZWN0b3J5ID8/IHRoaXMub3B0aW9ucy53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgIGVudjoge1xuICAgICAgICAgICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5vcHRpb25zLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgICAgICAuLi5zaGVsbFRhc2suZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgc3Rkb3V0ID0gXCJcIjtcbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSBcIlwiO1xuXG4gICAgICAgICAgICBjaGlsZC5zdGRvdXQ/Lm9uKFwiZGF0YVwiLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgc3Rkb3V0ICs9IGNodW5rO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShjaHVuayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZGVycj8ub24oXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBzdGRlcnIgKz0gY2h1bms7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBUYXNrICR7c2hlbGxUYXNrLmlkfSB0aW1lZCBvdXQgYWZ0ZXIgJHt0aW1lb3V0IC8gMTAwMH1zYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8vIEtpbGwgdGhlIGVudGlyZSBwcm9jZXNzIHRyZWUgdG8gZW5zdXJlIGNoaWxkIHByb2Nlc3NlcyBhcmUgdGVybWluYXRlZFxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5waWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gV2luZG93cywgdXNlIHRhc2traWxsIHRvIHRlcm1pbmF0ZSB0aGUgcHJvY2VzcyB0cmVlIHN5bmNocm9ub3VzbHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRhc2traWxsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcIi9QSURcIiwgY2hpbGQucGlkLnRvU3RyaW5nKCksIFwiL1RcIiwgXCIvRlwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB3aW5kb3dzSGlkZTogdHJ1ZSwgc3RkaW86IFwiaWdub3JlXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwYXduU3luYyB3b24ndCB0aHJvdyBvbiBub24temVybyBleGl0OyBmYWxsIGJhY2sgdG8gZGlyZWN0IGtpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoXCJTSUdLSUxMXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgYWxyZWFkeSBleGl0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwYXduaW5nIHRhc2traWxsIGl0c2VsZiBmYWlsZWQ7IGZhbGwgYmFjayB0byBkaXJlY3Qga2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoXCJTSUdLSUxMXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGFscmVhZHkgZXhpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT24gUE9TSVgsIGtpbGwgdGhlIGVudGlyZSBwcm9jZXNzIGdyb3VwXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3Mua2lsbCgtY2hpbGQucGlkLCBcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGdyb3VwIGFscmVhZHkgZXhpdGVkOyBmYWxsIGJhY2sgdG8gZGlyZWN0IGtpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5raWxsKFwiU0lHS0lMTFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBhbHJlYWR5IGV4aXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuXG4gICAgICAgICAgICBjaGlsZC5vbihcbiAgICAgICAgICAgICAgICBcImNsb3NlXCIsXG4gICAgICAgICAgICAgICAgKGNvZGU6IG51bWJlciB8IG51bGwsIHNpZ25hbDogTm9kZUpTLlNpZ25hbHMgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNoZWxsVGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gVGFza1N0YXR1cy5DT01QTEVURURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiBjb2RlIHx8IChzaWduYWwgPyAtMSA6IDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Rkb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RkZXJyLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHNpZ25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYFByb2Nlc3MgdGVybWluYXRlZCBieSBzaWduYWw6ICR7c2lnbmFsfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNoaWxkLm9uKFwiZXJyb3JcIiwgKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogc2hlbGxUYXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dCxcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2xlZXAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHRhc2sgaXMgYW4gYWdlbnQgdGFza1xuICAgICAqL1xuICAgIHByaXZhdGUgaXNBZ2VudFRhc2sodGFzazogRXhlY3V0YWJsZVRhc2spOiB0YXNrIGlzIEFnZW50VGFzayB7XG4gICAgICAgIHJldHVybiBcInR5cGVcIiBpbiB0YXNrICYmIFwiaW5wdXRcIiBpbiB0YXNrICYmIFwic3RyYXRlZ3lcIiBpbiB0YXNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYW4gYWdlbnQgdGFzayB1c2luZyB0aGUgYWdlbnQgY29vcmRpbmF0b3JcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVBZ2VudFRhc2soXG4gICAgICAgIHRhc2s6IEFnZW50VGFzayxcbiAgICAgICAgc3RhcnRUaW1lOiBEYXRlLFxuICAgICk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBBZ2VudCBjb29yZGluYXRvciBub3Qgc2V0LiBDYW5ub3QgZXhlY3V0ZSBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBhZ2VudCB0YXNrOiAke3Rhc2suaWR9ICgke3Rhc2sudHlwZX0pYCk7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIGFnZW50IHRhc2suXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gTk9URTogVGFza0V4ZWN1dG9yIGFscmVhZHkgcmVzb2x2ZXMgY3Jvc3MtdGFzayBkZXBlbmRlbmNpZXMgYWNyb3NzIHNoZWxsICsgYWdlbnQgdGFza3MuXG4gICAgICAgICAgICAvLyBBZ2VudENvb3JkaW5hdG9yIG9ubHkgdW5kZXJzdGFuZHMgYWdlbnQtdG8tYWdlbnQgZGVwZW5kZW5jaWVzLCBzbyB3ZSBzdHJpcCBkZXBlbmRzT25cbiAgICAgICAgICAgIC8vIGhlcmUgdG8gYXZvaWQgZmFpbGluZyBtaXhlZCBwbGFucyAoYWdlbnQgdGFzayBkZXBlbmRpbmcgb24gYSBzaGVsbCB0YXNrKS5cbiAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdG9yVGFzazogQWdlbnRUYXNrID0ge1xuICAgICAgICAgICAgICAgIC4uLnRhc2ssXG4gICAgICAgICAgICAgICAgZGVwZW5kc09uOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgYWdlbnRSZXN1bHQgPVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWdlbnRDb29yZGluYXRvci5leGVjdXRlVGFzayhjb29yZGluYXRvclRhc2spO1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IGFnZW50IHJlc3VsdCB0byB0YXNrIHJlc3VsdFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5jb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRSZXN1bHQuc3RhdHVzKSxcbiAgICAgICAgICAgICAgICBleGl0Q29kZTpcbiAgICAgICAgICAgICAgICAgICAgYWdlbnRSZXN1bHQuc3RhdHVzID09PSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEID8gMCA6IDEsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiBhZ2VudFJlc3VsdC5vdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeShhZ2VudFJlc3VsdC5vdXRwdXQsIG51bGwsIDIpXG4gICAgICAgICAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgICAgICBzdGRlcnI6IGFnZW50UmVzdWx0LmVycm9yIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGFnZW50UmVzdWx0LmV4ZWN1dGlvblRpbWUsXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGVuZFRpbWU6IGFnZW50UmVzdWx0LmVuZFRpbWUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGFnZW50UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgIGBBZ2VudCB0YXNrICR7dGFzay5pZH0gY29tcGxldGVkIHdpdGggc3RhdHVzOiAke3Jlc3VsdC5zdGF0dXN9YCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIjtcblxuICAgICAgICAgICAgdGhpcy5sb2coYEFnZW50IHRhc2sgJHt0YXNrLmlkfSBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGFnZW50IHRhc2sgc3RhdHVzIHRvIHJlZ3VsYXIgdGFzayBzdGF0dXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFN0YXR1czogQWdlbnRUYXNrU3RhdHVzKTogVGFza1N0YXR1cyB7XG4gICAgICAgIHN3aXRjaCAoYWdlbnRTdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5DT01QTEVURUQ7XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5GQUlMRUQ6XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5USU1FT1VUOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkZBSUxFRDtcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLlNLSVBQRUQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuU0tJUFBFRDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuRkFJTEVEOyAvLyBTaG91bGQgbm90IGhhcHBlbiBpbiBmaW5hbCByZXN1bHRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgbXVsdGlwbGUgYWdlbnQgdGFza3Mgd2l0aCBjb29yZGluYXRpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZUFnZW50VGFza3MoXG4gICAgICAgIHRhc2tzOiBBZ2VudFRhc2tbXSxcbiAgICAgICAgc3RyYXRlZ3k6IEFnZ3JlZ2F0aW9uU3RyYXRlZ3kgPSB7IHR5cGU6IFwic2VxdWVudGlhbFwiIH0sXG4gICAgKTogUHJvbWlzZTxUYXNrUmVzdWx0W10+IHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFnZW50IGNvb3JkaW5hdG9yIG5vdCBzZXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgIGBFeGVjdXRpbmcgJHt0YXNrcy5sZW5ndGh9IGFnZW50IHRhc2tzIHdpdGggc3RyYXRlZ3k6ICR7c3RyYXRlZ3kudHlwZX1gLFxuICAgICAgICApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGFnZW50IHRhc2tzIHVzaW5nIGNvb3JkaW5hdG9yXG4gICAgICAgICAgICBjb25zdCBhZ2VudFJlc3VsdHMgPSBhd2FpdCB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZXhlY3V0ZVRhc2tzKFxuICAgICAgICAgICAgICAgIHRhc2tzLFxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gQ29udmVydCB0byB0YXNrIHJlc3VsdHNcbiAgICAgICAgICAgIGNvbnN0IHRhc2tSZXN1bHRzOiBUYXNrUmVzdWx0W10gPSBhZ2VudFJlc3VsdHMubWFwKFxuICAgICAgICAgICAgICAgIChhZ2VudFJlc3VsdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGFnZW50UmVzdWx0LmlkLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuY29udmVydEFnZW50U3RhdHVzKGFnZW50UmVzdWx0LnN0YXR1cyksXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnRSZXN1bHQuc3RhdHVzID09PSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAxLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQ6IGFnZW50UmVzdWx0Lm91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeShhZ2VudFJlc3VsdC5vdXRwdXQsIG51bGwsIDIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycjogYWdlbnRSZXN1bHQuZXJyb3IgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IGFnZW50UmVzdWx0LmV4ZWN1dGlvblRpbWUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogYWdlbnRSZXN1bHQuc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBhZ2VudFJlc3VsdC5lbmRUaW1lLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYWdlbnRSZXN1bHQuZXJyb3IsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBTdG9yZSByZXN1bHRzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiB0YXNrUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHJlc3VsdC5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRhc2tSZXN1bHRzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgZXhlY3V0aW9uIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWdlbnQgZXhlY3V0aW9uIHByb2dyZXNzXG4gICAgICovXG4gICAgcHVibGljIGdldEFnZW50UHJvZ3Jlc3MoKTogYW55IHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlbnRDb29yZGluYXRvci5nZXRQcm9ncmVzcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhZ2VudCBleGVjdXRpb24gbWV0cmljc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBZ2VudE1ldHJpY3MoKTogTWFwPEFnZW50VHlwZSwgYW55PiB8IG51bGwge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudENvb3JkaW5hdG9yLmdldE1ldHJpY3MoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Rhc2tFeGVjdXRvcl0gJHttZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIFF1YWxpdHkgZ2F0ZXMgcnVubmVyIGZvciB0aGUgQUkgRW5naW5lZXJpbmcgU3lzdGVtLlxuICogRXhlY3V0ZXMgcXVhbGl0eSBnYXRlcyBpbiBzZXF1ZW5jZSB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZyBhbmQgcmVwb3J0aW5nLlxuICovXG5cbmltcG9ydCB7IFRhc2tFeGVjdXRvciB9IGZyb20gXCIuL3Rhc2stZXhlY3V0b3JcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBFeGVjdXRpb25PcHRpb25zLFxuICAgIHR5cGUgUXVhbGl0eUdhdGVDb25maWcsXG4gICAgdHlwZSBRdWFsaXR5R2F0ZVJlc3VsdCxcbiAgICBRdWFsaXR5R2F0ZVR5cGUsXG4gICAgdHlwZSBUYXNrLFxuICAgIHR5cGUgVGFza1Jlc3VsdCxcbiAgICBUYXNrU3RhdHVzLFxuICAgIFRhc2tUeXBlLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgUXVhbGl0eUdhdGVSdW5uZXIge1xuICAgIHByaXZhdGUgdGFza0V4ZWN1dG9yOiBUYXNrRXhlY3V0b3I7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRyeVJ1bjogZmFsc2UsXG4gICAgICAgICAgICBjb250aW51ZU9uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgdmVyYm9zZTogZmFsc2UsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudGFza0V4ZWN1dG9yID0gbmV3IFRhc2tFeGVjdXRvcih0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIHF1YWxpdHkgZ2F0ZXMgZm9yIGEgcGxhblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUXVhbGl0eUdhdGVzKFxuICAgICAgICBnYXRlczogUXVhbGl0eUdhdGVDb25maWdbXSxcbiAgICApOiBQcm9taXNlPFF1YWxpdHlHYXRlUmVzdWx0W10+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogUXVhbGl0eUdhdGVSZXN1bHRbXSA9IFtdO1xuXG4gICAgICAgIC8vIFNvcnQgZ2F0ZXMgYnkgdHlwZSB0byBlbnN1cmUgY29uc2lzdGVudCBleGVjdXRpb24gb3JkZXJcbiAgICAgICAgY29uc3Qgc29ydGVkR2F0ZXMgPSB0aGlzLnNvcnRHYXRlc0J5UHJpb3JpdHkoZ2F0ZXMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiBzb3J0ZWRHYXRlcykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlUXVhbGl0eUdhdGUoZ2F0ZSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gU3RvcCBleGVjdXRpb24gaWYgYSByZXF1aXJlZCBnYXRlIGZhaWxzXG4gICAgICAgICAgICBpZiAoZ2F0ZS5yZXF1aXJlZCAmJiAhcmVzdWx0LnBhc3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgICAgICBgU3RvcHBpbmcgZXhlY3V0aW9uIGR1ZSB0byByZXF1aXJlZCBxdWFsaXR5IGdhdGUgZmFpbHVyZTogJHtnYXRlLmlkfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBzaW5nbGUgcXVhbGl0eSBnYXRlXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVRdWFsaXR5R2F0ZShcbiAgICAgICAgZ2F0ZTogUXVhbGl0eUdhdGVDb25maWcsXG4gICAgKTogUHJvbWlzZTxRdWFsaXR5R2F0ZVJlc3VsdD4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIHF1YWxpdHkgZ2F0ZTogJHtnYXRlLmlkfSAoJHtnYXRlLm5hbWV9KWApO1xuXG4gICAgICAgICAgICBjb25zdCB0YXNrID0gdGhpcy5jcmVhdGVUYXNrRnJvbUdhdGUoZ2F0ZSk7XG4gICAgICAgICAgICBjb25zdCB0YXNrUmVzdWx0ID0gYXdhaXQgdGhpcy50YXNrRXhlY3V0b3IuZXhlY3V0ZVRhc2sodGFzayk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhc3NlZCA9IHRoaXMuZXZhbHVhdGVHYXRlUmVzdWx0KGdhdGUsIHRhc2tSZXN1bHQpO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFF1YWxpdHlHYXRlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGdhdGVJZDogZ2F0ZS5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHRhc2tSZXN1bHQuc3RhdHVzLFxuICAgICAgICAgICAgICAgIHBhc3NlZCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNyZWF0ZVJlc3VsdE1lc3NhZ2UoZ2F0ZSwgdGFza1Jlc3VsdCwgcGFzc2VkKSxcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIGdhdGVDb25maWc6IGdhdGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgUXVhbGl0eSBnYXRlICR7Z2F0ZS5pZH0gJHtwYXNzZWQgPyBcInBhc3NlZFwiIDogXCJmYWlsZWRcIn0gaW4gJHtkdXJhdGlvbn1tc2AsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIjtcblxuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYFF1YWxpdHkgZ2F0ZSAke2dhdGUuaWR9IGZhaWxlZCB3aXRoIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBnYXRlSWQ6IGdhdGUuaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBRdWFsaXR5IGdhdGUgZXhlY3V0aW9uIGZhaWxlZDogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiB7IGVycm9yOiBlcnJvck1lc3NhZ2UgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGRlZmF1bHQgcXVhbGl0eSBnYXRlcyBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXREZWZhdWx0R2F0ZXMoKTogUXVhbGl0eUdhdGVDb25maWdbXSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwibGludFwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29kZSBMaW50aW5nXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiQ2hlY2sgY29kZSBzdHlsZSBhbmQgZm9ybWF0dGluZ1wiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5MSU5ULFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBcIm5wbSBydW4gbGludFwiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA2MCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJ0eXBlc1wiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiVHlwZSBDaGVja2luZ1wiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlR5cGVTY3JpcHQgY29tcGlsYXRpb24gY2hlY2tcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBRdWFsaXR5R2F0ZVR5cGUuVFlQRVMsXG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFwibnBtIHJ1biBidWlsZFwiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMjAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwidGVzdHNcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIlVuaXQgVGVzdHNcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSdW4gdW5pdCB0ZXN0IHN1aXRlXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLlRFU1RTLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBcIm5wbSB0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJidWlsZFwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiQnVpbGQgUHJvY2Vzc1wiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkJ1aWxkIHRoZSBwcm9qZWN0XCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLkJVSUxELFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTgwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcImludGVncmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJJbnRlZ3JhdGlvbiBUZXN0c1wiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlJ1biBpbnRlZ3JhdGlvbiB0ZXN0IHN1aXRlXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIHRlc3Q6aW50ZWdyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNjAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcImRlcGxveVwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRGVwbG95bWVudCBWYWxpZGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiVmFsaWRhdGUgZGVwbG95bWVudCByZWFkaW5lc3NcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIGRlcGxveTp2YWxpZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHF1YWxpdHkgZ2F0ZXMgZnJvbSB0YXNrcyBpbiBhIHBsYW5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUdhdGVzRnJvbVRhc2tzKHRhc2tzOiBUYXNrW10pOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdIHtcbiAgICAgICAgY29uc3QgZ2F0ZXM6IFF1YWxpdHlHYXRlQ29uZmlnW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGlmIChRdWFsaXR5R2F0ZVJ1bm5lci5pc1F1YWxpdHlHYXRlVGFzayh0YXNrKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdhdGVUeXBlID0gUXVhbGl0eUdhdGVSdW5uZXIubWFwVGFza1R5cGVUb0dhdGVUeXBlKFxuICAgICAgICAgICAgICAgICAgICB0YXNrLnR5cGUsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGdhdGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGFzay5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGFzay5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZ2F0ZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLCAvLyBEZWZhdWx0IHRvIHJlcXVpcmVkIGZvciBleHBsaWNpdCBnYXRlIHRhc2tzXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogdGFzay5jb21tYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGFzay50aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2luZ0RpcmVjdG9yeTogdGFzay53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHRhc2suZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRhc2tJZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnYXRlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvcnRHYXRlc0J5UHJpb3JpdHkoXG4gICAgICAgIGdhdGVzOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdLFxuICAgICk6IFF1YWxpdHlHYXRlQ29uZmlnW10ge1xuICAgICAgICBjb25zdCBwcmlvcml0eU9yZGVyID0gW1xuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLkxJTlQsXG4gICAgICAgICAgICBRdWFsaXR5R2F0ZVR5cGUuVFlQRVMsXG4gICAgICAgICAgICBRdWFsaXR5R2F0ZVR5cGUuVEVTVFMsXG4gICAgICAgICAgICBRdWFsaXR5R2F0ZVR5cGUuQlVJTEQsXG4gICAgICAgICAgICBRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT04sXG4gICAgICAgICAgICBRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZLFxuICAgICAgICBdO1xuXG4gICAgICAgIHJldHVybiBnYXRlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhUHJpb3JpdHkgPSBwcmlvcml0eU9yZGVyLmluZGV4T2YoYS50eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGJQcmlvcml0eSA9IHByaW9yaXR5T3JkZXIuaW5kZXhPZihiLnR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoYVByaW9yaXR5ICE9PSBiUHJpb3JpdHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYVByaW9yaXR5IC0gYlByaW9yaXR5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBzYW1lIHR5cGUsIHNvcnQgYnkgcmVxdWlyZWQgc3RhdHVzIGZpcnN0XG4gICAgICAgICAgICBpZiAoYS5yZXF1aXJlZCAhPT0gYi5yZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBiLnJlcXVpcmVkID8gMSA6IC0xO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5hbGx5IHNvcnQgYnkgSURcbiAgICAgICAgICAgIHJldHVybiBhLmlkLmxvY2FsZUNvbXBhcmUoYi5pZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVGFza0Zyb21HYXRlKGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnKTogVGFzayB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IGdhdGUuY29uZmlnIHx8IHt9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogYGdhdGUtJHtnYXRlLmlkfWAsXG4gICAgICAgICAgICBuYW1lOiBgUXVhbGl0eSBHYXRlOiAke2dhdGUubmFtZX1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGdhdGUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB0eXBlOiB0aGlzLm1hcEdhdGVUeXBlVG9UYXNrVHlwZShnYXRlLnR5cGUpLFxuICAgICAgICAgICAgY29tbWFuZDpcbiAgICAgICAgICAgICAgICAoY29uZmlnLmNvbW1hbmQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdENvbW1hbmRGb3JHYXRlKGdhdGUudHlwZSksXG4gICAgICAgICAgICB3b3JraW5nRGlyZWN0b3J5OiBjb25maWcud29ya2luZ0RpcmVjdG9yeSBhcyBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDogY29uZmlnLmVudmlyb25tZW50IGFzXG4gICAgICAgICAgICAgICAgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gICAgICAgICAgICAgICAgfCB1bmRlZmluZWQsXG4gICAgICAgICAgICB0aW1lb3V0OlxuICAgICAgICAgICAgICAgIChjb25maWcudGltZW91dCBhcyBudW1iZXIgfCB1bmRlZmluZWQpIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5nZXREZWZhdWx0VGltZW91dEZvckdhdGUoZ2F0ZS50eXBlKSxcbiAgICAgICAgICAgIHJldHJ5OiB7XG4gICAgICAgICAgICAgICAgbWF4QXR0ZW1wdHM6IDEsXG4gICAgICAgICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFwR2F0ZVR5cGVUb1Rhc2tUeXBlKGdhdGVUeXBlOiBRdWFsaXR5R2F0ZVR5cGUpOiBUYXNrVHlwZSB7XG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSB7XG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkxJTlRdOiBUYXNrVHlwZS5MSU5ULFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5UWVBFU106IFRhc2tUeXBlLlRZUEVTLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5URVNUU106IFRhc2tUeXBlLlRFU1RTLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5CVUlMRF06IFRhc2tUeXBlLkJVSUxELFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTl06IFRhc2tUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5ERVBMT1ldOiBUYXNrVHlwZS5ERVBMT1ksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1hcHBpbmdbZ2F0ZVR5cGVdIHx8IFRhc2tUeXBlLlNIRUxMO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIG1hcFRhc2tUeXBlVG9HYXRlVHlwZSh0YXNrVHlwZTogVGFza1R5cGUpOiBRdWFsaXR5R2F0ZVR5cGUge1xuICAgICAgICBjb25zdCBtYXBwaW5nOiBQYXJ0aWFsPFJlY29yZDxUYXNrVHlwZSwgUXVhbGl0eUdhdGVUeXBlPj4gPSB7XG4gICAgICAgICAgICBbVGFza1R5cGUuTElOVF06IFF1YWxpdHlHYXRlVHlwZS5MSU5ULFxuICAgICAgICAgICAgW1Rhc2tUeXBlLlRZUEVTXTogUXVhbGl0eUdhdGVUeXBlLlRZUEVTLFxuICAgICAgICAgICAgW1Rhc2tUeXBlLlRFU1RTXTogUXVhbGl0eUdhdGVUeXBlLlRFU1RTLFxuICAgICAgICAgICAgW1Rhc2tUeXBlLkJVSUxEXTogUXVhbGl0eUdhdGVUeXBlLkJVSUxELFxuICAgICAgICAgICAgW1Rhc2tUeXBlLklOVEVHUkFUSU9OXTogUXVhbGl0eUdhdGVUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgW1Rhc2tUeXBlLkRFUExPWV06IFF1YWxpdHlHYXRlVHlwZS5ERVBMT1ksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1hcHBpbmdbdGFza1R5cGVdIHx8IFF1YWxpdHlHYXRlVHlwZS5MSU5UO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdENvbW1hbmRGb3JHYXRlKGdhdGVUeXBlOiBRdWFsaXR5R2F0ZVR5cGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjb21tYW5kcyA9IHtcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuTElOVF06IFwibnBtIHJ1biBsaW50XCIsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLlRZUEVTXTogXCJucG0gcnVuIGJ1aWxkXCIsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLlRFU1RTXTogXCJucG0gdGVzdFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5CVUlMRF06IFwibnBtIHJ1biBidWlsZFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTl06IFwibnBtIHJ1biB0ZXN0OmludGVncmF0aW9uXCIsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkRFUExPWV06IFwibnBtIHJ1biBkZXBsb3k6dmFsaWRhdGVcIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gY29tbWFuZHNbZ2F0ZVR5cGVdIHx8ICdlY2hvIFwiTm8gY29tbWFuZCBjb25maWd1cmVkXCInO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RGVmYXVsdFRpbWVvdXRGb3JHYXRlKGdhdGVUeXBlOiBRdWFsaXR5R2F0ZVR5cGUpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0aW1lb3V0cyA9IHtcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuTElOVF06IDYwLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5UWVBFU106IDEyMCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVEVTVFNdOiAzMDAsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkJVSUxEXTogMTgwLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTl06IDYwMCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZXTogMzAwLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aW1lb3V0c1tnYXRlVHlwZV0gfHwgNjA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBldmFsdWF0ZUdhdGVSZXN1bHQoXG4gICAgICAgIGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgICAgICB0YXNrUmVzdWx0OiBhbnksIC8vIFVzaW5nIGFueSB0byBzdXBwb3J0IGJvdGggVGFza1Jlc3VsdCBhbmQgUXVhbGl0eUdhdGVSZXN1bHRcbiAgICApOiBib29sZWFuIHtcbiAgICAgICAgLy8gQmFzaWMgZXZhbHVhdGlvbjogdGFzayBtdXN0IGNvbXBsZXRlIHN1Y2Nlc3NmdWxseVxuICAgICAgICBpZiAodGFza1Jlc3VsdC5zdGF0dXMgIT09IFRhc2tTdGF0dXMuQ09NUExFVEVEKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeGl0IGNvZGUgbXVzdCBiZSAwIGZvciBzdWNjZXNzXG4gICAgICAgIGlmICh0YXNrUmVzdWx0LmV4aXRDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUeXBlLXNwZWNpZmljIGV2YWx1YXRpb25zIGNhbiBiZSBhZGRlZCBoZXJlXG4gICAgICAgIHN3aXRjaCAoZ2F0ZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFF1YWxpdHlHYXRlVHlwZS5URVNUUzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZVRlc3RHYXRlKHRhc2tSZXN1bHQpO1xuICAgICAgICAgICAgY2FzZSBRdWFsaXR5R2F0ZVR5cGUuQlVJTEQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVCdWlsZEdhdGUodGFza1Jlc3VsdCk7XG4gICAgICAgICAgICBjYXNlIFF1YWxpdHlHYXRlVHlwZS5MSU5UOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlTGludEdhdGUodGFza1Jlc3VsdCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBldmFsdWF0ZVRlc3RHYXRlKHRhc2tSZXN1bHQ6IFRhc2tSZXN1bHQpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbW1vbiB0ZXN0IHN1Y2Nlc3MgaW5kaWNhdG9yc1xuICAgICAgICBjb25zdCBvdXRwdXQgPSAodGFza1Jlc3VsdC5zdGRvdXQgKyB0YXNrUmVzdWx0LnN0ZGVycikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyBMb29rIGZvciB0ZXN0IHN1Y2Nlc3MgcGF0dGVybnNcbiAgICAgICAgY29uc3Qgc3VjY2Vzc1BhdHRlcm5zID0gW1xuICAgICAgICAgICAgL3Bhc3NpbmcvLFxuICAgICAgICAgICAgL3Bhc3NlZC8sXG4gICAgICAgICAgICAv4pyTLyxcbiAgICAgICAgICAgIC/inJQvLFxuICAgICAgICAgICAgL2FsbCB0ZXN0cyBwYXNzZWQvLFxuICAgICAgICAgICAgL3Rlc3Qgc3VpdGUgcGFzc2VkLyxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBMb29rIGZvciB0ZXN0IGZhaWx1cmUgcGF0dGVybnNcbiAgICAgICAgY29uc3QgZmFpbHVyZVBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2ZhaWxpbmcvLFxuICAgICAgICAgICAgL2ZhaWxlZC8sXG4gICAgICAgICAgICAv4pyXLyxcbiAgICAgICAgICAgIC/inJgvLFxuICAgICAgICAgICAgL3Rlc3QgZmFpbGVkLyxcbiAgICAgICAgICAgIC90ZXN0cyBmYWlsZWQvLFxuICAgICAgICAgICAgL2Vycm9yOi8sXG4gICAgICAgICAgICAvZXhjZXB0aW9uLyxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBoYXNTdWNjZXNzUGF0dGVybiA9IHN1Y2Nlc3NQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PlxuICAgICAgICAgICAgcGF0dGVybi50ZXN0KG91dHB1dCksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGhhc0ZhaWx1cmVQYXR0ZXJuID0gZmFpbHVyZVBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+XG4gICAgICAgICAgICBwYXR0ZXJuLnRlc3Qob3V0cHV0KSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgZXhwbGljaXQgc3VjY2VzcyBpbmRpY2F0b3JzLCB0cnVzdCB0aG9zZVxuICAgICAgICBpZiAoaGFzU3VjY2Vzc1BhdHRlcm4gJiYgIWhhc0ZhaWx1cmVQYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBleHBsaWNpdCBmYWlsdXJlIGluZGljYXRvcnMsIGZhaWxcbiAgICAgICAgaWYgKGhhc0ZhaWx1cmVQYXR0ZXJuKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZhdWx0IHRvIGV4aXQgY29kZSBldmFsdWF0aW9uXG4gICAgICAgIHJldHVybiB0YXNrUmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVCdWlsZEdhdGUodGFza1Jlc3VsdDogVGFza1Jlc3VsdCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBCdWlsZCBpcyBzdWNjZXNzZnVsIGlmIGV4aXQgY29kZSBpcyAwIGFuZCBubyBvYnZpb3VzIGVycm9yIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IG91dHB1dCA9ICh0YXNrUmVzdWx0LnN0ZG91dCArIHRhc2tSZXN1bHQuc3RkZXJyKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIGNvbnN0IGVycm9yUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvYnVpbGQgZmFpbGVkLyxcbiAgICAgICAgICAgIC9jb21waWxhdGlvbiBlcnJvci8sXG4gICAgICAgICAgICAvc3ludGF4IGVycm9yLyxcbiAgICAgICAgICAgIC90eXBlIGVycm9yLyxcbiAgICAgICAgICAgIC9lcnJvcjovLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGhhc0Vycm9yUGF0dGVybiA9IGVycm9yUGF0dGVybnMuc29tZSgocGF0dGVybikgPT5cbiAgICAgICAgICAgIHBhdHRlcm4udGVzdChvdXRwdXQpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAhaGFzRXJyb3JQYXR0ZXJuICYmIHRhc2tSZXN1bHQuZXhpdENvZGUgPT09IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBldmFsdWF0ZUxpbnRHYXRlKHRhc2tSZXN1bHQ6IFRhc2tSZXN1bHQpOiBib29sZWFuIHtcbiAgICAgICAgLy8gTGludGluZyBpcyBzdWNjZXNzZnVsIGlmIGV4aXQgY29kZSBpcyAwIGFuZCBubyBlcnJvciBwYXR0ZXJuc1xuICAgICAgICBjb25zdCBvdXRwdXQgPSAodGFza1Jlc3VsdC5zdGRvdXQgKyB0YXNrUmVzdWx0LnN0ZGVycikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCBlcnJvclBhdHRlcm5zID0gWy9lcnJvci8sIC9wcm9ibGVtLywgL3dhcm5pbmcvLCAvaXNzdWUvXTtcblxuICAgICAgICBjb25zdCBoYXNFcnJvclBhdHRlcm4gPSBlcnJvclBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+XG4gICAgICAgICAgICBwYXR0ZXJuLnRlc3Qob3V0cHV0KSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gIWhhc0Vycm9yUGF0dGVybiAmJiB0YXNrUmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlUmVzdWx0TWVzc2FnZShcbiAgICAgICAgZ2F0ZTogUXVhbGl0eUdhdGVDb25maWcsXG4gICAgICAgIHRhc2tSZXN1bHQ6IFRhc2tSZXN1bHQsXG4gICAgICAgIHBhc3NlZDogYm9vbGVhbixcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBpZiAocGFzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gYFF1YWxpdHkgZ2F0ZSBcIiR7Z2F0ZS5uYW1lfVwiIHBhc3NlZCBzdWNjZXNzZnVsbHlgO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhc2tSZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkZBSUxFRCkge1xuICAgICAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHt0YXNrUmVzdWx0LmV4aXRDb2RlfWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFza1Jlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuU0tJUFBFRCkge1xuICAgICAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiB3YXMgc2tpcHBlZDogJHt0YXNrUmVzdWx0LmVycm9yfWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFF1YWxpdHkgZ2F0ZSBcIiR7Z2F0ZS5uYW1lfVwiIGRpZCBub3QgY29tcGxldGUgc3VjY2Vzc2Z1bGx5YDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpc1F1YWxpdHlHYXRlVGFzayh0YXNrOiBUYXNrKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBUYXNrVHlwZS5MSU5ULFxuICAgICAgICAgICAgVGFza1R5cGUuVFlQRVMsXG4gICAgICAgICAgICBUYXNrVHlwZS5URVNUUyxcbiAgICAgICAgICAgIFRhc2tUeXBlLkJVSUxELFxuICAgICAgICAgICAgVGFza1R5cGUuSU5URUdSQVRJT04sXG4gICAgICAgICAgICBUYXNrVHlwZS5ERVBMT1ksXG4gICAgICAgIF0uaW5jbHVkZXModGFzay50eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1F1YWxpdHlHYXRlUnVubmVyXSAke21lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiO0FBS0E7QUFtQk8sTUFBTSxhQUFhO0FBQUEsRUFDZDtBQUFBLEVBQ0EsY0FBdUMsSUFBSTtBQUFBLEVBQzNDLGVBQTRCLElBQUk7QUFBQSxFQUNoQztBQUFBLEVBRVIsV0FBVyxDQUFDLFVBQTRCLENBQUMsR0FBRztBQUFBLElBQ3hDLEtBQUssVUFBVTtBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsaUJBQWlCO0FBQUEsTUFDakIsZ0JBQWdCO0FBQUEsTUFDaEIsU0FBUztBQUFBLFNBQ047QUFBQSxJQUNQO0FBQUE7QUFBQSxFQU1HLG1CQUFtQixDQUFDLGFBQXFDO0FBQUEsSUFDNUQsS0FBSyxtQkFBbUI7QUFBQTtBQUFBLE9BTWYsWUFBVyxDQUFDLE1BQW1DO0FBQUEsSUFDeEQsS0FBSyxZQUFZLE1BQU07QUFBQSxJQUN2QixLQUFLLGFBQWEsTUFBTTtBQUFBLElBRXhCLE1BQU0saUJBQWlCLEtBQUssc0JBQXNCLEtBQUssS0FBSztBQUFBLElBQzVELE1BQU0sVUFBd0IsQ0FBQztBQUFBLElBRS9CLFdBQVcsUUFBUSxnQkFBZ0I7QUFBQSxNQUMvQixNQUFNLFNBQVMsTUFBTSxLQUFLLFlBQVksSUFBSTtBQUFBLE1BQzFD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WDtBQUFBLElBR0EsSUFBSSxtQkFBbUI7QUFBQSxNQUNuQixPQUFPO0FBQUEsSUFDWDtBQUFBLElBR0EsT0FBTyxXQUFXLGFBQWE7QUFBQTtBQUFBLEVBRzNCLGlCQUFpQixDQUFDLFlBQWlDO0FBQUEsSUFFdkQsTUFBTSxVQUFVLFdBQVcsU0FBUyxXQUFXLFFBQVEsWUFBWTtBQUFBLElBRW5FLE1BQU0sZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLElBRUEsTUFBTSxrQkFBa0IsY0FBYyxLQUFLLENBQUMsWUFDeEMsUUFBUSxLQUFLLE1BQU0sQ0FDdkI7QUFBQSxJQUVBLE9BQU8sQ0FBQyxtQkFBbUIsV0FBVyxhQUFhO0FBQUE7QUFBQSxFQUcvQyxnQkFBZ0IsQ0FBQyxZQUFpQztBQUFBLElBRXRELE1BQU0sVUFBVSxXQUFXLFNBQVMsV0FBVyxRQUFRLFlBQVk7QUFBQSxJQUVuRSxNQUFNLGdCQUFnQixDQUFDLFNBQVMsV0FBVyxXQUFXLE9BQU87QUFBQSxJQUU3RCxNQUFNLGtCQUFrQixjQUFjLEtBQUssQ0FBQyxZQUN4QyxRQUFRLEtBQUssTUFBTSxDQUN2QjtBQUFBLElBRUEsT0FBTyxDQUFDLG1CQUFtQixXQUFXLGFBQWE7QUFBQTtBQUFBLEVBRy9DLG1CQUFtQixDQUN2QixNQUNBLFlBQ0EsUUFDTTtBQUFBLElBQ04sSUFBSSxRQUFRO0FBQUEsTUFDUixPQUFPLGlCQUFpQixLQUFLO0FBQUEsSUFDakM7QUFBQSxJQUVBLElBQUksV0FBVyxrQ0FBOEI7QUFBQSxNQUN6QyxPQUFPLGlCQUFpQixLQUFLLCtCQUErQixXQUFXO0FBQUEsSUFDM0U7QUFBQSxJQUVBLElBQUksV0FBVyxvQ0FBK0I7QUFBQSxNQUMxQyxPQUFPLGlCQUFpQixLQUFLLHNCQUFzQixXQUFXO0FBQUEsSUFDbEU7QUFBQSxJQUVBLE9BQU8saUJBQWlCLEtBQUs7QUFBQTtBQUFBLFNBR2xCLGlCQUFpQixDQUFDLE1BQXFCO0FBQUEsSUFDbEQsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT1AsRUFBRSxTQUFTLEtBQUssSUFBSTtBQUFBO0FBQUEsRUFHaEIsR0FBRyxDQUFDLFNBQXVCO0FBQUEsSUFDL0IsSUFBSSxLQUFLLFFBQVEsU0FBUztBQUFBLE1BQ3RCLFFBQVEsSUFBSSx1QkFBdUIsU0FBUztBQUFBLElBQ2hEO0FBQUE7QUFFUjsiLAogICJkZWJ1Z0lkIjogIkQ1RjBDRDRFNTkxM0NCNTc2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
