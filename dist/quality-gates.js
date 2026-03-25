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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIiwgIi4uL3NyYy9leGVjdXRpb24vcXVhbGl0eS1nYXRlcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFRhc2sgZXhlY3V0b3IgZm9yIHRoZSBGZXJnIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEhhbmRsZXMgdGFzayBleGVjdXRpb24sIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiwgYW5kIHJlc3VsdCB0cmFja2luZy5cbiAqL1xuXG5pbXBvcnQgeyBzcGF3biwgc3Bhd25TeW5jIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcIm5vZGU6dXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBBZ2VudENvb3JkaW5hdG9yIH0gZnJvbSBcIi4uL2FnZW50cy9jb29yZGluYXRvclwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFnZW50VGFzayxcbiAgICBBZ2VudFRhc2tSZXN1bHQsXG4gICAgQWdlbnRUYXNrU3RhdHVzLFxuICAgIHR5cGUgQWdlbnRUeXBlLFxuICAgIHR5cGUgQWdncmVnYXRpb25TdHJhdGVneSxcbn0gZnJvbSBcIi4uL2FnZW50cy90eXBlc1wiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEV4ZWN1dGFibGVUYXNrLFxuICAgIHR5cGUgRXhlY3V0aW9uT3B0aW9ucyxcbiAgICB0eXBlIFBsYW4sXG4gICAgdHlwZSBUYXNrLFxuICAgIHR5cGUgVGFza1Jlc3VsdCxcbiAgICBUYXNrU3RhdHVzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgVGFza0V4ZWN1dG9yIHtcbiAgICBwcml2YXRlIG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnM7XG4gICAgcHJpdmF0ZSB0YXNrUmVzdWx0czogTWFwPHN0cmluZywgVGFza1Jlc3VsdD4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBydW5uaW5nVGFza3M6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICAgIHByaXZhdGUgYWdlbnRDb29yZGluYXRvcj86IEFnZW50Q29vcmRpbmF0b3I7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgZHJ5UnVuOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRpbnVlT25FcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBtYXhDb25jdXJyZW5jeTogMSxcbiAgICAgICAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYWdlbnQgY29vcmRpbmF0b3IgZm9yIGV4ZWN1dGluZyBhZ2VudCB0YXNrc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBZ2VudENvb3JkaW5hdG9yKGNvb3JkaW5hdG9yOiBBZ2VudENvb3JkaW5hdG9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWdlbnRDb29yZGluYXRvciA9IGNvb3JkaW5hdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIHRhc2tzIGluIGEgcGxhbiB3aXRoIGRlcGVuZGVuY3kgcmVzb2x1dGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUGxhbihwbGFuOiBQbGFuKTogUHJvbWlzZTxUYXNrUmVzdWx0W10+IHtcbiAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5jbGVhcigpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5jbGVhcigpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGlvbk9yZGVyID0gdGhpcy5yZXNvbHZlRXhlY3V0aW9uT3JkZXIocGxhbi50YXNrcyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBleGVjdXRpb25PcmRlcikge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlVGFzayh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gU3RvcCBleGVjdXRpb24gaWYgdGFzayBmYWlsZWQgYW5kIGNvbnRpbnVlT25FcnJvciBpcyBmYWxzZVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuRkFJTEVEICYmXG4gICAgICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5jb250aW51ZU9uRXJyb3JcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBTdG9wcGluZyBleGVjdXRpb24gZHVlIHRvIHRhc2sgZmFpbHVyZTogJHt0YXNrLmlkfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIHNpbmdsZSB0YXNrXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVUYXNrKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrcy5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFzayAke3Rhc2suaWR9IGlzIGFscmVhZHkgcnVubmluZ2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuYWRkKHRhc2suaWQpO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay5uYW1lfSlgKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5UmVzdWx0ID0gdGhpcy5jaGVja0RlcGVuZGVuY2llcyh0YXNrKTtcbiAgICAgICAgICAgIGlmICghZGVwZW5kZW5jeVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLlNLSVBQRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5UmVzdWx0LmVycm9yID8/IFwiVW5rbm93biBkZXBlbmRlbmN5IGVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkZXBlbmRlbmN5UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIYW5kbGUgZHJ5IHJ1biBtb2RlXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyeVJ1bikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBbRFJZIFJVTl0gV291bGQgZXhlY3V0ZTogJHt0YXNrLmNvbW1hbmR9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkNPTVBMRVRFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYFtEUlkgUlVOXSBDb21tYW5kOiAke3Rhc2suY29tbWFuZH1gLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gYWdlbnQgdGFza1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjdXRlQWdlbnRUYXNrKFxuICAgICAgICAgICAgICAgICAgICB0YXNrIGFzIEFnZW50VGFzayxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIHRhc2sgd2l0aCByZXRyeSBsb2dpY1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlV2l0aFJldHJ5KHRhc2spO1xuICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMubG9nKGBUYXNrICR7dGFzay5pZH0gY29tcGxldGVkIHdpdGggc3RhdHVzOiAke3Jlc3VsdC5zdGF0dXN9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIjtcblxuICAgICAgICAgICAgdGhpcy5sb2coYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5kZWxldGUodGFzay5pZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHJlc3VsdCBvZiBhIHByZXZpb3VzbHkgZXhlY3V0ZWQgdGFza1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUYXNrUmVzdWx0KHRhc2tJZDogc3RyaW5nKTogVGFza1Jlc3VsdCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSZXN1bHRzLmdldCh0YXNrSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFzayByZXN1bHRzXG4gICAgICovXG4gICAgcHVibGljIGdldEFsbFJlc3VsdHMoKTogVGFza1Jlc3VsdFtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50YXNrUmVzdWx0cy52YWx1ZXMoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIHRhc2sgcmVzdWx0c1xuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhclJlc3VsdHMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudGFza1Jlc3VsdHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc29sdmVFeGVjdXRpb25PcmRlcih0YXNrczogRXhlY3V0YWJsZVRhc2tbXSk6IEV4ZWN1dGFibGVUYXNrW10ge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHZpc2l0aW5nID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHNvcnRlZDogRXhlY3V0YWJsZVRhc2tbXSA9IFtdO1xuICAgICAgICBjb25zdCB0YXNrTWFwID0gbmV3IE1hcCh0YXNrcy5tYXAoKHQpID0+IFt0LmlkLCB0XSkpO1xuXG4gICAgICAgIGNvbnN0IHZpc2l0ID0gKHRhc2tJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAodmlzaXRpbmcuaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIGludm9sdmluZyB0YXNrOiAke3Rhc2tJZH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2aXNpdGVkLmhhcyh0YXNrSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5hZGQodGFza0lkKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRhc2tNYXAuZ2V0KHRhc2tJZCk7XG4gICAgICAgICAgICBpZiAodGFzaz8uZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgICAgICB2aXNpdChkZXBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5kZWxldGUodGFza0lkKTtcbiAgICAgICAgICAgIHZpc2l0ZWQuYWRkKHRhc2tJZCk7XG5cbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc29ydGVkLnB1c2godGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgdmlzaXQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc29ydGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tEZXBlbmRlbmNpZXModGFzazogRXhlY3V0YWJsZVRhc2spOiB7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgIH0ge1xuICAgICAgICBpZiAoIXRhc2suZGVwZW5kc09uIHx8IHRhc2suZGVwZW5kc09uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgY29uc3QgZGVwUmVzdWx0ID0gdGhpcy50YXNrUmVzdWx0cy5nZXQoZGVwSWQpO1xuXG4gICAgICAgICAgICBpZiAoIWRlcFJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBiZWVuIGV4ZWN1dGVkYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwUmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2RlcFJlc3VsdC5leGl0Q29kZX1gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXBSZXN1bHQuc3RhdHVzICE9PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBjb21wbGV0ZWQgKHN0YXR1czogJHtkZXBSZXN1bHQuc3RhdHVzfSlgLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlV2l0aFJldHJ5KHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIC8vIGV4ZWN1dGVXaXRoUmV0cnkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgLy8gQWdlbnRUYXNrcyBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5IGluIGV4ZWN1dGVBZ2VudFRhc2tcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZVdpdGhSZXRyeSBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNoZWxsVGFzayA9IHRhc2sgYXMgVGFzaztcbiAgICAgICAgY29uc3QgbWF4QXR0ZW1wdHMgPSBzaGVsbFRhc2sucmV0cnk/Lm1heEF0dGVtcHRzIHx8IDE7XG4gICAgICAgIGNvbnN0IGJhc2VEZWxheSA9IHNoZWxsVGFzay5yZXRyeT8uZGVsYXkgfHwgMDtcbiAgICAgICAgY29uc3QgYmFja29mZk11bHRpcGxpZXIgPSBzaGVsbFRhc2sucmV0cnk/LmJhY2tvZmZNdWx0aXBsaWVyIHx8IDE7XG5cbiAgICAgICAgbGV0IGxhc3RSZXN1bHQ6IFRhc2tSZXN1bHQgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSBtYXhBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IGJhc2VEZWxheSAqIGJhY2tvZmZNdWx0aXBsaWVyICoqIChhdHRlbXB0IC0gMik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBSZXRyeWluZyB0YXNrICR7c2hlbGxUYXNrLmlkfSBpbiAke2RlbGF5fXMgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSlgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zbGVlcChkZWxheSAqIDEwMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHNoZWxsVGFzayk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RSZXN1bHQgPSByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSk6ICR7cmVzdWx0LnN0ZGVyciB8fCByZXN1bHQuZXJyb3J9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhc3RSZXN1bHQhO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUNvbW1hbmQodGFzazogRXhlY3V0YWJsZVRhc2spOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgLy8gZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2l0aCBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVsbFRhc2sgPSB0YXNrIGFzIFRhc2s7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHNoZWxsVGFzay50aW1lb3V0XG4gICAgICAgICAgICAgICAgPyBzaGVsbFRhc2sudGltZW91dCAqIDEwMDBcbiAgICAgICAgICAgICAgICA6IDMwMDAwMDsgLy8gRGVmYXVsdCA1IG1pbnV0ZXNcblxuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBjb21tYW5kOiAke3NoZWxsVGFzay5jb21tYW5kfWApO1xuXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKHNoZWxsVGFzay5jb21tYW5kLCBbXSwge1xuICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN3ZDpcbiAgICAgICAgICAgICAgICAgICAgc2hlbGxUYXNrLndvcmtpbmdEaXJlY3RvcnkgPz8gdGhpcy5vcHRpb25zLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLm9wdGlvbnMuZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIC4uLnNoZWxsVGFzay5lbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IHN0ZGVyciA9IFwiXCI7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZG91dD8ub24oXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBzdGRvdXQgKz0gY2h1bms7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2hpbGQuc3RkZXJyPy5vbihcImRhdGFcIiwgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHN0ZGVyciArPSBjaHVuaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoY2h1bmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHtzaGVsbFRhc2suaWR9IHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXQgLyAxMDAwfXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gS2lsbCB0aGUgZW50aXJlIHByb2Nlc3MgdHJlZSB0byBlbnN1cmUgY2hpbGQgcHJvY2Vzc2VzIGFyZSB0ZXJtaW5hdGVkXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnBpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBXaW5kb3dzLCB1c2UgdGFza2tpbGwgdG8gdGVybWluYXRlIHRoZSBwcm9jZXNzIHRyZWUgc3luY2hyb25vdXNseVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGFza2tpbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiL1BJRFwiLCBjaGlsZC5waWQudG9TdHJpbmcoKSwgXCIvVFwiLCBcIi9GXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHdpbmRvd3NIaWRlOiB0cnVlLCBzdGRpbzogXCJpZ25vcmVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3Bhd25TeW5jIHdvbid0IHRocm93IG9uIG5vbi16ZXJvIGV4aXQ7IGZhbGwgYmFjayB0byBkaXJlY3Qga2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBhbHJlYWR5IGV4aXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3Bhd25pbmcgdGFza2tpbGwgaXRzZWxmIGZhaWxlZDsgZmFsbCBiYWNrIHRvIGRpcmVjdCBraWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgYWxyZWFkeSBleGl0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBQT1NJWCwga2lsbCB0aGUgZW50aXJlIHByb2Nlc3MgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5raWxsKC1jaGlsZC5waWQsIFwiU0lHS0lMTFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgZ3JvdXAgYWxyZWFkeSBleGl0ZWQ7IGZhbGwgYmFjayB0byBkaXJlY3Qga2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoXCJTSUdLSUxMXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGFscmVhZHkgZXhpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGltZW91dCk7XG5cbiAgICAgICAgICAgIGNoaWxkLm9uKFxuICAgICAgICAgICAgICAgIFwiY2xvc2VcIixcbiAgICAgICAgICAgICAgICAoY29kZTogbnVtYmVyIHwgbnVsbCwgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogc2hlbGxUYXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUYXNrU3RhdHVzLkNPTVBMRVRFRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IGNvZGUgfHwgKHNpZ25hbCA/IC0xIDogMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc2lnbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgUHJvY2VzcyB0ZXJtaW5hdGVkIGJ5IHNpZ25hbDogJHtzaWduYWx9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY2hpbGQub24oXCJlcnJvclwiLCAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBzaGVsbFRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0LFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGVlcChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFzayBpcyBhbiBhZ2VudCB0YXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0FnZW50VGFzayh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IHRhc2sgaXMgQWdlbnRUYXNrIHtcbiAgICAgICAgcmV0dXJuIFwidHlwZVwiIGluIHRhc2sgJiYgXCJpbnB1dFwiIGluIHRhc2sgJiYgXCJzdHJhdGVneVwiIGluIHRhc2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhbiBhZ2VudCB0YXNrIHVzaW5nIHRoZSBhZ2VudCBjb29yZGluYXRvclxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUFnZW50VGFzayhcbiAgICAgICAgdGFzazogQWdlbnRUYXNrLFxuICAgICAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEFnZW50IGNvb3JkaW5hdG9yIG5vdCBzZXQuIENhbm5vdCBleGVjdXRlIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIGFnZW50IHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay50eXBlfSlgKTtcblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgYWdlbnQgdGFzay5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBOT1RFOiBUYXNrRXhlY3V0b3IgYWxyZWFkeSByZXNvbHZlcyBjcm9zcy10YXNrIGRlcGVuZGVuY2llcyBhY3Jvc3Mgc2hlbGwgKyBhZ2VudCB0YXNrcy5cbiAgICAgICAgICAgIC8vIEFnZW50Q29vcmRpbmF0b3Igb25seSB1bmRlcnN0YW5kcyBhZ2VudC10by1hZ2VudCBkZXBlbmRlbmNpZXMsIHNvIHdlIHN0cmlwIGRlcGVuZHNPblxuICAgICAgICAgICAgLy8gaGVyZSB0byBhdm9pZCBmYWlsaW5nIG1peGVkIHBsYW5zIChhZ2VudCB0YXNrIGRlcGVuZGluZyBvbiBhIHNoZWxsIHRhc2spLlxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0b3JUYXNrOiBBZ2VudFRhc2sgPSB7XG4gICAgICAgICAgICAgICAgLi4udGFzayxcbiAgICAgICAgICAgICAgICBkZXBlbmRzT246IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBhZ2VudFJlc3VsdCA9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZ2VudENvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrKGNvb3JkaW5hdG9yVGFzayk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgYWdlbnQgcmVzdWx0IHRvIHRhc2sgcmVzdWx0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLmNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFJlc3VsdC5zdGF0dXMpLFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOlxuICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQgPyAwIDogMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IGFnZW50UmVzdWx0Lm91dHB1dFxuICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogYWdlbnRSZXN1bHQuZXJyb3IgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZTogYWdlbnRSZXN1bHQuZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYWdlbnRSZXN1bHQuZXJyb3IsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgJHt0YXNrLmlkfSBjb21wbGV0ZWQgd2l0aCBzdGF0dXM6ICR7cmVzdWx0LnN0YXR1c31gLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiO1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhgQWdlbnQgdGFzayAke3Rhc2suaWR9IGZhaWxlZDogJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYWdlbnQgdGFzayBzdGF0dXMgdG8gcmVndWxhciB0YXNrIHN0YXR1c1xuICAgICAqL1xuICAgIHByaXZhdGUgY29udmVydEFnZW50U3RhdHVzKGFnZW50U3RhdHVzOiBBZ2VudFRhc2tTdGF0dXMpOiBUYXNrU3RhdHVzIHtcbiAgICAgICAgc3dpdGNoIChhZ2VudFN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkNPTVBMRVRFRDtcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLlRJTUVPVVQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuRkFJTEVEO1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuU0tJUFBFRDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5TS0lQUEVEO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5GQUlMRUQ7IC8vIFNob3VsZCBub3QgaGFwcGVuIGluIGZpbmFsIHJlc3VsdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBtdWx0aXBsZSBhZ2VudCB0YXNrcyB3aXRoIGNvb3JkaW5hdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlQWdlbnRUYXNrcyhcbiAgICAgICAgdGFza3M6IEFnZW50VGFza1tdLFxuICAgICAgICBzdHJhdGVneTogQWdncmVnYXRpb25TdHJhdGVneSA9IHsgdHlwZTogXCJzZXF1ZW50aWFsXCIgfSxcbiAgICApOiBQcm9taXNlPFRhc2tSZXN1bHRbXT4ge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWdlbnQgY29vcmRpbmF0b3Igbm90IHNldFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgYEV4ZWN1dGluZyAke3Rhc2tzLmxlbmd0aH0gYWdlbnQgdGFza3Mgd2l0aCBzdHJhdGVneTogJHtzdHJhdGVneS50eXBlfWAsXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgYWdlbnQgdGFza3MgdXNpbmcgY29vcmRpbmF0b3JcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzdWx0cyA9IGF3YWl0IHRoaXMuYWdlbnRDb29yZGluYXRvci5leGVjdXRlVGFza3MoXG4gICAgICAgICAgICAgICAgdGFza3MsXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3ksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIHRhc2sgcmVzdWx0c1xuICAgICAgICAgICAgY29uc3QgdGFza1Jlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IGFnZW50UmVzdWx0cy5tYXAoXG4gICAgICAgICAgICAgICAgKGFnZW50UmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBpZDogYWdlbnRSZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5jb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRSZXN1bHQuc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IDEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYWdlbnRSZXN1bHQub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOiBhZ2VudFJlc3VsdC5lcnJvciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBhZ2VudFJlc3VsdC5zdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IGFnZW50UmVzdWx0LmVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBhZ2VudFJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHRhc2tSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQocmVzdWx0LmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGFza1Jlc3VsdHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayBleGVjdXRpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhZ2VudCBleGVjdXRpb24gcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRQcm9ncmVzcygpOiBhbnkge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudENvb3JkaW5hdG9yLmdldFByb2dyZXNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFnZW50IGV4ZWN1dGlvbiBtZXRyaWNzXG4gICAgICovXG4gICAgcHVibGljIGdldEFnZW50TWV0cmljcygpOiBNYXA8QWdlbnRUeXBlLCBhbnk+IHwgbnVsbCB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZ2V0TWV0cmljcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbVGFza0V4ZWN1dG9yXSAke21lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogUXVhbGl0eSBnYXRlcyBydW5uZXIgZm9yIHRoZSBGZXJnIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEV4ZWN1dGVzIHF1YWxpdHkgZ2F0ZXMgaW4gc2VxdWVuY2Ugd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcgYW5kIHJlcG9ydGluZy5cbiAqL1xuXG5pbXBvcnQgeyBUYXNrRXhlY3V0b3IgfSBmcm9tIFwiLi90YXNrLWV4ZWN1dG9yXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgRXhlY3V0aW9uT3B0aW9ucyxcbiAgICB0eXBlIFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgIHR5cGUgUXVhbGl0eUdhdGVSZXN1bHQsXG4gICAgUXVhbGl0eUdhdGVUeXBlLFxuICAgIHR5cGUgVGFzayxcbiAgICB0eXBlIFRhc2tSZXN1bHQsXG4gICAgVGFza1N0YXR1cyxcbiAgICBUYXNrVHlwZSxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIFF1YWxpdHlHYXRlUnVubmVyIHtcbiAgICBwcml2YXRlIHRhc2tFeGVjdXRvcjogVGFza0V4ZWN1dG9yO1xuICAgIHByaXZhdGUgb3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkcnlSdW46IGZhbHNlLFxuICAgICAgICAgICAgY29udGludWVPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRhc2tFeGVjdXRvciA9IG5ldyBUYXNrRXhlY3V0b3IodGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFsbCBxdWFsaXR5IGdhdGVzIGZvciBhIHBsYW5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZVF1YWxpdHlHYXRlcyhcbiAgICAgICAgZ2F0ZXM6IFF1YWxpdHlHYXRlQ29uZmlnW10sXG4gICAgKTogUHJvbWlzZTxRdWFsaXR5R2F0ZVJlc3VsdFtdPiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFF1YWxpdHlHYXRlUmVzdWx0W10gPSBbXTtcblxuICAgICAgICAvLyBTb3J0IGdhdGVzIGJ5IHR5cGUgdG8gZW5zdXJlIGNvbnNpc3RlbnQgZXhlY3V0aW9uIG9yZGVyXG4gICAgICAgIGNvbnN0IHNvcnRlZEdhdGVzID0gdGhpcy5zb3J0R2F0ZXNCeVByaW9yaXR5KGdhdGVzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGdhdGUgb2Ygc29ydGVkR2F0ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVF1YWxpdHlHYXRlKGdhdGUpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgZXhlY3V0aW9uIGlmIGEgcmVxdWlyZWQgZ2F0ZSBmYWlsc1xuICAgICAgICAgICAgaWYgKGdhdGUucmVxdWlyZWQgJiYgIXJlc3VsdC5wYXNzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFN0b3BwaW5nIGV4ZWN1dGlvbiBkdWUgdG8gcmVxdWlyZWQgcXVhbGl0eSBnYXRlIGZhaWx1cmU6ICR7Z2F0ZS5pZH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgc2luZ2xlIHF1YWxpdHkgZ2F0ZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUXVhbGl0eUdhdGUoXG4gICAgICAgIGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgICk6IFByb21pc2U8UXVhbGl0eUdhdGVSZXN1bHQ+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBxdWFsaXR5IGdhdGU6ICR7Z2F0ZS5pZH0gKCR7Z2F0ZS5uYW1lfSlgKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRoaXMuY3JlYXRlVGFza0Zyb21HYXRlKGdhdGUpO1xuICAgICAgICAgICAgY29uc3QgdGFza1Jlc3VsdCA9IGF3YWl0IHRoaXMudGFza0V4ZWN1dG9yLmV4ZWN1dGVUYXNrKHRhc2spO1xuXG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBwYXNzZWQgPSB0aGlzLmV2YWx1YXRlR2F0ZVJlc3VsdChnYXRlLCB0YXNrUmVzdWx0KTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBRdWFsaXR5R2F0ZVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBnYXRlSWQ6IGdhdGUuaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0YXNrUmVzdWx0LnN0YXR1cyxcbiAgICAgICAgICAgICAgICBwYXNzZWQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jcmVhdGVSZXN1bHRNZXNzYWdlKGdhdGUsIHRhc2tSZXN1bHQsIHBhc3NlZCksXG4gICAgICAgICAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgICAgICAgICB0YXNrUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnOiBnYXRlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYFF1YWxpdHkgZ2F0ZSAke2dhdGUuaWR9ICR7cGFzc2VkID8gXCJwYXNzZWRcIiA6IFwiZmFpbGVkXCJ9IGluICR7ZHVyYXRpb259bXNgLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgIGBRdWFsaXR5IGdhdGUgJHtnYXRlLmlkfSBmYWlsZWQgd2l0aCBlcnJvcjogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZ2F0ZUlkOiBnYXRlLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgUXVhbGl0eSBnYXRlIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgZGV0YWlsczogeyBlcnJvcjogZXJyb3JNZXNzYWdlIH0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBkZWZhdWx0IHF1YWxpdHkgZ2F0ZXMgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGVmYXVsdEdhdGVzKCk6IFF1YWxpdHlHYXRlQ29uZmlnW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcImxpbnRcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkNvZGUgTGludGluZ1wiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkNoZWNrIGNvZGUgc3R5bGUgYW5kIGZvcm1hdHRpbmdcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBRdWFsaXR5R2F0ZVR5cGUuTElOVCxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIGxpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNjAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwidHlwZXNcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIlR5cGUgQ2hlY2tpbmdcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUeXBlU2NyaXB0IGNvbXBpbGF0aW9uIGNoZWNrXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLlRZUEVTLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTIwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiBcInRlc3RzXCIsXG4gICAgICAgICAgICAgICAgbmFtZTogXCJVbml0IFRlc3RzXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUnVuIHVuaXQgdGVzdCBzdWl0ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5URVNUUyxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gdGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6IFwiYnVpbGRcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkJ1aWxkIFByb2Nlc3NcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJCdWlsZCB0aGUgcHJvamVjdFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5CVUlMRCxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogXCJucG0gcnVuIGJ1aWxkXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE4MCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJpbnRlZ3JhdGlvblwiLFxuICAgICAgICAgICAgICAgIG5hbWU6IFwiSW50ZWdyYXRpb24gVGVzdHNcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJSdW4gaW50ZWdyYXRpb24gdGVzdCBzdWl0ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFF1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFwibnBtIHJ1biB0ZXN0OmludGVncmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogXCJkZXBsb3lcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkRlcGxveW1lbnQgVmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlZhbGlkYXRlIGRlcGxveW1lbnQgcmVhZGluZXNzXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlLkRFUExPWSxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFwibnBtIHJ1biBkZXBsb3k6dmFsaWRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBxdWFsaXR5IGdhdGVzIGZyb20gdGFza3MgaW4gYSBwbGFuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVHYXRlc0Zyb21UYXNrcyh0YXNrczogVGFza1tdKTogUXVhbGl0eUdhdGVDb25maWdbXSB7XG4gICAgICAgIGNvbnN0IGdhdGVzOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoUXVhbGl0eUdhdGVSdW5uZXIuaXNRdWFsaXR5R2F0ZVRhc2sodGFzaykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnYXRlVHlwZSA9IFF1YWxpdHlHYXRlUnVubmVyLm1hcFRhc2tUeXBlVG9HYXRlVHlwZShcbiAgICAgICAgICAgICAgICAgICAgdGFzay50eXBlLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBnYXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhc2submFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRhc2suZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGdhdGVUeXBlLFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSwgLy8gRGVmYXVsdCB0byByZXF1aXJlZCBmb3IgZXhwbGljaXQgZ2F0ZSB0YXNrc1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IHRhc2suY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRhc2sudGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IHRhc2sud29ya2luZ0RpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiB0YXNrLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0YXNrSWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2F0ZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzb3J0R2F0ZXNCeVByaW9yaXR5KFxuICAgICAgICBnYXRlczogUXVhbGl0eUdhdGVDb25maWdbXSxcbiAgICApOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdIHtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlPcmRlciA9IFtcbiAgICAgICAgICAgIFF1YWxpdHlHYXRlVHlwZS5MSU5ULFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLlRZUEVTLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLlRFU1RTLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLkJVSUxELFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgUXVhbGl0eUdhdGVUeXBlLkRFUExPWSxcbiAgICAgICAgXTtcblxuICAgICAgICByZXR1cm4gZ2F0ZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYVByaW9yaXR5ID0gcHJpb3JpdHlPcmRlci5pbmRleE9mKGEudHlwZSk7XG4gICAgICAgICAgICBjb25zdCBiUHJpb3JpdHkgPSBwcmlvcml0eU9yZGVyLmluZGV4T2YoYi50eXBlKTtcblxuICAgICAgICAgICAgaWYgKGFQcmlvcml0eSAhPT0gYlByaW9yaXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFQcmlvcml0eSAtIGJQcmlvcml0eTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgc2FtZSB0eXBlLCBzb3J0IGJ5IHJlcXVpcmVkIHN0YXR1cyBmaXJzdFxuICAgICAgICAgICAgaWYgKGEucmVxdWlyZWQgIT09IGIucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5yZXF1aXJlZCA/IDEgOiAtMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSBzb3J0IGJ5IElEXG4gICAgICAgICAgICByZXR1cm4gYS5pZC5sb2NhbGVDb21wYXJlKGIuaWQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRhc2tGcm9tR2F0ZShnYXRlOiBRdWFsaXR5R2F0ZUNvbmZpZyk6IFRhc2sge1xuICAgICAgICBjb25zdCBjb25maWcgPSBnYXRlLmNvbmZpZyB8fCB7fTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGBnYXRlLSR7Z2F0ZS5pZH1gLFxuICAgICAgICAgICAgbmFtZTogYFF1YWxpdHkgR2F0ZTogJHtnYXRlLm5hbWV9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBnYXRlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5tYXBHYXRlVHlwZVRvVGFza1R5cGUoZ2F0ZS50eXBlKSxcbiAgICAgICAgICAgIGNvbW1hbmQ6XG4gICAgICAgICAgICAgICAgKGNvbmZpZy5jb21tYW5kIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlZmF1bHRDb21tYW5kRm9yR2F0ZShnYXRlLnR5cGUpLFxuICAgICAgICAgICAgd29ya2luZ0RpcmVjdG9yeTogY29uZmlnLndvcmtpbmdEaXJlY3RvcnkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IGNvbmZpZy5lbnZpcm9ubWVudCBhc1xuICAgICAgICAgICAgICAgIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuICAgICAgICAgICAgICAgIHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdGltZW91dDpcbiAgICAgICAgICAgICAgICAoY29uZmlnLnRpbWVvdXQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVmYXVsdFRpbWVvdXRGb3JHYXRlKGdhdGUudHlwZSksXG4gICAgICAgICAgICByZXRyeToge1xuICAgICAgICAgICAgICAgIG1heEF0dGVtcHRzOiAxLFxuICAgICAgICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hcEdhdGVUeXBlVG9UYXNrVHlwZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogVGFza1R5cGUge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0ge1xuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5MSU5UXTogVGFza1R5cGUuTElOVCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVFlQRVNdOiBUYXNrVHlwZS5UWVBFUyxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVEVTVFNdOiBUYXNrVHlwZS5URVNUUyxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuQlVJTERdOiBUYXNrVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiBUYXNrVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZXTogVGFza1R5cGUuREVQTE9ZLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtYXBwaW5nW2dhdGVUeXBlXSB8fCBUYXNrVHlwZS5TSEVMTDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBtYXBUYXNrVHlwZVRvR2F0ZVR5cGUodGFza1R5cGU6IFRhc2tUeXBlKTogUXVhbGl0eUdhdGVUeXBlIHtcbiAgICAgICAgY29uc3QgbWFwcGluZzogUGFydGlhbDxSZWNvcmQ8VGFza1R5cGUsIFF1YWxpdHlHYXRlVHlwZT4+ID0ge1xuICAgICAgICAgICAgW1Rhc2tUeXBlLkxJTlRdOiBRdWFsaXR5R2F0ZVR5cGUuTElOVCxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5UWVBFU106IFF1YWxpdHlHYXRlVHlwZS5UWVBFUyxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5URVNUU106IFF1YWxpdHlHYXRlVHlwZS5URVNUUyxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5CVUlMRF06IFF1YWxpdHlHYXRlVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFtUYXNrVHlwZS5JTlRFR1JBVElPTl06IFF1YWxpdHlHYXRlVHlwZS5JTlRFR1JBVElPTixcbiAgICAgICAgICAgIFtUYXNrVHlwZS5ERVBMT1ldOiBRdWFsaXR5R2F0ZVR5cGUuREVQTE9ZLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtYXBwaW5nW3Rhc2tUeXBlXSB8fCBRdWFsaXR5R2F0ZVR5cGUuTElOVDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlZmF1bHRDb21tYW5kRm9yR2F0ZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY29tbWFuZHMgPSB7XG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkxJTlRdOiBcIm5wbSBydW4gbGludFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5UWVBFU106IFwibnBtIHJ1biBidWlsZFwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5URVNUU106IFwibnBtIHRlc3RcIixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuQlVJTERdOiBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiBcIm5wbSBydW4gdGVzdDppbnRlZ3JhdGlvblwiLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5ERVBMT1ldOiBcIm5wbSBydW4gZGVwbG95OnZhbGlkYXRlXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzW2dhdGVUeXBlXSB8fCAnZWNobyBcIk5vIGNvbW1hbmQgY29uZmlndXJlZFwiJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlZmF1bHRUaW1lb3V0Rm9yR2F0ZShnYXRlVHlwZTogUXVhbGl0eUdhdGVUeXBlKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgdGltZW91dHMgPSB7XG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkxJTlRdOiA2MCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuVFlQRVNdOiAxMjAsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLlRFU1RTXTogMzAwLFxuICAgICAgICAgICAgW1F1YWxpdHlHYXRlVHlwZS5CVUlMRF06IDE4MCxcbiAgICAgICAgICAgIFtRdWFsaXR5R2F0ZVR5cGUuSU5URUdSQVRJT05dOiA2MDAsXG4gICAgICAgICAgICBbUXVhbGl0eUdhdGVUeXBlLkRFUExPWV06IDMwMCxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGltZW91dHNbZ2F0ZVR5cGVdIHx8IDYwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVHYXRlUmVzdWx0KFxuICAgICAgICBnYXRlOiBRdWFsaXR5R2F0ZUNvbmZpZyxcbiAgICAgICAgdGFza1Jlc3VsdDogYW55LCAvLyBVc2luZyBhbnkgdG8gc3VwcG9ydCBib3RoIFRhc2tSZXN1bHQgYW5kIFF1YWxpdHlHYXRlUmVzdWx0XG4gICAgKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIEJhc2ljIGV2YWx1YXRpb246IHRhc2sgbXVzdCBjb21wbGV0ZSBzdWNjZXNzZnVsbHlcbiAgICAgICAgaWYgKHRhc2tSZXN1bHQuc3RhdHVzICE9PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXhpdCBjb2RlIG11c3QgYmUgMCBmb3Igc3VjY2Vzc1xuICAgICAgICBpZiAodGFza1Jlc3VsdC5leGl0Q29kZSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHlwZS1zcGVjaWZpYyBldmFsdWF0aW9ucyBjYW4gYmUgYWRkZWQgaGVyZVxuICAgICAgICBzd2l0Y2ggKGdhdGUudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBRdWFsaXR5R2F0ZVR5cGUuVEVTVFM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVUZXN0R2F0ZSh0YXNrUmVzdWx0KTtcbiAgICAgICAgICAgIGNhc2UgUXVhbGl0eUdhdGVUeXBlLkJVSUxEOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlQnVpbGRHYXRlKHRhc2tSZXN1bHQpO1xuICAgICAgICAgICAgY2FzZSBRdWFsaXR5R2F0ZVR5cGUuTElOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUxpbnRHYXRlKHRhc2tSZXN1bHQpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVUZXN0R2F0ZSh0YXNrUmVzdWx0OiBUYXNrUmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBjb21tb24gdGVzdCBzdWNjZXNzIGluZGljYXRvcnNcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gKHRhc2tSZXN1bHQuc3Rkb3V0ICsgdGFza1Jlc3VsdC5zdGRlcnIpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gTG9vayBmb3IgdGVzdCBzdWNjZXNzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9wYXNzaW5nLyxcbiAgICAgICAgICAgIC9wYXNzZWQvLFxuICAgICAgICAgICAgL+Kcky8sXG4gICAgICAgICAgICAv4pyULyxcbiAgICAgICAgICAgIC9hbGwgdGVzdHMgcGFzc2VkLyxcbiAgICAgICAgICAgIC90ZXN0IHN1aXRlIHBhc3NlZC8sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTG9vayBmb3IgdGVzdCBmYWlsdXJlIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGZhaWx1cmVQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9mYWlsaW5nLyxcbiAgICAgICAgICAgIC9mYWlsZWQvLFxuICAgICAgICAgICAgL+Kcly8sXG4gICAgICAgICAgICAv4pyYLyxcbiAgICAgICAgICAgIC90ZXN0IGZhaWxlZC8sXG4gICAgICAgICAgICAvdGVzdHMgZmFpbGVkLyxcbiAgICAgICAgICAgIC9lcnJvcjovLFxuICAgICAgICAgICAgL2V4Y2VwdGlvbi8sXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaGFzU3VjY2Vzc1BhdHRlcm4gPSBzdWNjZXNzUGF0dGVybnMuc29tZSgocGF0dGVybikgPT5cbiAgICAgICAgICAgIHBhdHRlcm4udGVzdChvdXRwdXQpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBoYXNGYWlsdXJlUGF0dGVybiA9IGZhaWx1cmVQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PlxuICAgICAgICAgICAgcGF0dGVybi50ZXN0KG91dHB1dCksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGV4cGxpY2l0IHN1Y2Nlc3MgaW5kaWNhdG9ycywgdHJ1c3QgdGhvc2VcbiAgICAgICAgaWYgKGhhc1N1Y2Nlc3NQYXR0ZXJuICYmICFoYXNGYWlsdXJlUGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgZXhwbGljaXQgZmFpbHVyZSBpbmRpY2F0b3JzLCBmYWlsXG4gICAgICAgIGlmIChoYXNGYWlsdXJlUGF0dGVybikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmYXVsdCB0byBleGl0IGNvZGUgZXZhbHVhdGlvblxuICAgICAgICByZXR1cm4gdGFza1Jlc3VsdC5leGl0Q29kZSA9PT0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV2YWx1YXRlQnVpbGRHYXRlKHRhc2tSZXN1bHQ6IFRhc2tSZXN1bHQpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQnVpbGQgaXMgc3VjY2Vzc2Z1bCBpZiBleGl0IGNvZGUgaXMgMCBhbmQgbm8gb2J2aW91cyBlcnJvciBwYXR0ZXJuc1xuICAgICAgICBjb25zdCBvdXRwdXQgPSAodGFza1Jlc3VsdC5zdGRvdXQgKyB0YXNrUmVzdWx0LnN0ZGVycikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBjb25zdCBlcnJvclBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2J1aWxkIGZhaWxlZC8sXG4gICAgICAgICAgICAvY29tcGlsYXRpb24gZXJyb3IvLFxuICAgICAgICAgICAgL3N5bnRheCBlcnJvci8sXG4gICAgICAgICAgICAvdHlwZSBlcnJvci8sXG4gICAgICAgICAgICAvZXJyb3I6LyxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBoYXNFcnJvclBhdHRlcm4gPSBlcnJvclBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+XG4gICAgICAgICAgICBwYXR0ZXJuLnRlc3Qob3V0cHV0KSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gIWhhc0Vycm9yUGF0dGVybiAmJiB0YXNrUmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXZhbHVhdGVMaW50R2F0ZSh0YXNrUmVzdWx0OiBUYXNrUmVzdWx0KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIExpbnRpbmcgaXMgc3VjY2Vzc2Z1bCBpZiBleGl0IGNvZGUgaXMgMCBhbmQgbm8gZXJyb3IgcGF0dGVybnNcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gKHRhc2tSZXN1bHQuc3Rkb3V0ICsgdGFza1Jlc3VsdC5zdGRlcnIpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgY29uc3QgZXJyb3JQYXR0ZXJucyA9IFsvZXJyb3IvLCAvcHJvYmxlbS8sIC93YXJuaW5nLywgL2lzc3VlL107XG5cbiAgICAgICAgY29uc3QgaGFzRXJyb3JQYXR0ZXJuID0gZXJyb3JQYXR0ZXJucy5zb21lKChwYXR0ZXJuKSA9PlxuICAgICAgICAgICAgcGF0dGVybi50ZXN0KG91dHB1dCksXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuICFoYXNFcnJvclBhdHRlcm4gJiYgdGFza1Jlc3VsdC5leGl0Q29kZSA9PT0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVJlc3VsdE1lc3NhZ2UoXG4gICAgICAgIGdhdGU6IFF1YWxpdHlHYXRlQ29uZmlnLFxuICAgICAgICB0YXNrUmVzdWx0OiBUYXNrUmVzdWx0LFxuICAgICAgICBwYXNzZWQ6IGJvb2xlYW4sXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHBhc3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiBwYXNzZWQgc3VjY2Vzc2Z1bGx5YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXNrUmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIHJldHVybiBgUXVhbGl0eSBnYXRlIFwiJHtnYXRlLm5hbWV9XCIgZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7dGFza1Jlc3VsdC5leGl0Q29kZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhc2tSZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLlNLSVBQRUQpIHtcbiAgICAgICAgICAgIHJldHVybiBgUXVhbGl0eSBnYXRlIFwiJHtnYXRlLm5hbWV9XCIgd2FzIHNraXBwZWQ6ICR7dGFza1Jlc3VsdC5lcnJvcn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBRdWFsaXR5IGdhdGUgXCIke2dhdGUubmFtZX1cIiBkaWQgbm90IGNvbXBsZXRlIHN1Y2Nlc3NmdWxseWA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaXNRdWFsaXR5R2F0ZVRhc2sodGFzazogVGFzayk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgVGFza1R5cGUuTElOVCxcbiAgICAgICAgICAgIFRhc2tUeXBlLlRZUEVTLFxuICAgICAgICAgICAgVGFza1R5cGUuVEVTVFMsXG4gICAgICAgICAgICBUYXNrVHlwZS5CVUlMRCxcbiAgICAgICAgICAgIFRhc2tUeXBlLklOVEVHUkFUSU9OLFxuICAgICAgICAgICAgVGFza1R5cGUuREVQTE9ZLFxuICAgICAgICBdLmluY2x1ZGVzKHRhc2sudHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtRdWFsaXR5R2F0ZVJ1bm5lcl0gJHttZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQUtBO0FBbUJPLE1BQU0sYUFBYTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLGNBQXVDLElBQUk7QUFBQSxFQUMzQyxlQUE0QixJQUFJO0FBQUEsRUFDaEM7QUFBQSxFQUVSLFdBQVcsQ0FBQyxVQUE0QixDQUFDLEdBQUc7QUFBQSxJQUN4QyxLQUFLLFVBQVU7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLGlCQUFpQjtBQUFBLE1BQ2pCLGdCQUFnQjtBQUFBLE1BQ2hCLFNBQVM7QUFBQSxTQUNOO0FBQUEsSUFDUDtBQUFBO0FBQUEsRUFNRyxtQkFBbUIsQ0FBQyxhQUFxQztBQUFBLElBQzVELEtBQUssbUJBQW1CO0FBQUE7QUFBQSxPQU1mLFlBQVcsQ0FBQyxNQUFtQztBQUFBLElBQ3hELEtBQUssWUFBWSxNQUFNO0FBQUEsSUFDdkIsS0FBSyxhQUFhLE1BQU07QUFBQSxJQUV4QixNQUFNLGlCQUFpQixLQUFLLHNCQUFzQixLQUFLLEtBQUs7QUFBQSxJQUM1RCxNQUFNLFVBQXdCLENBQUM7QUFBQSxJQUUvQixXQUFXLFFBQVEsZ0JBQWdCO0FBQUEsTUFDL0IsTUFBTSxTQUFTLE1BQU0sS0FBSyxZQUFZLElBQUk7QUFBQSxN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LElBQ1g7QUFBQSxJQUdBLElBQUksbUJBQW1CO0FBQUEsTUFDbkIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUdBLE9BQU8sV0FBVyxhQUFhO0FBQUE7QUFBQSxFQUczQixpQkFBaUIsQ0FBQyxZQUFpQztBQUFBLElBRXZELE1BQU0sVUFBVSxXQUFXLFNBQVMsV0FBVyxRQUFRLFlBQVk7QUFBQSxJQUVuRSxNQUFNLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxJQUVBLE1BQU0sa0JBQWtCLGNBQWMsS0FBSyxDQUFDLFlBQ3hDLFFBQVEsS0FBSyxNQUFNLENBQ3ZCO0FBQUEsSUFFQSxPQUFPLENBQUMsbUJBQW1CLFdBQVcsYUFBYTtBQUFBO0FBQUEsRUFHL0MsZ0JBQWdCLENBQUMsWUFBaUM7QUFBQSxJQUV0RCxNQUFNLFVBQVUsV0FBVyxTQUFTLFdBQVcsUUFBUSxZQUFZO0FBQUEsSUFFbkUsTUFBTSxnQkFBZ0IsQ0FBQyxTQUFTLFdBQVcsV0FBVyxPQUFPO0FBQUEsSUFFN0QsTUFBTSxrQkFBa0IsY0FBYyxLQUFLLENBQUMsWUFDeEMsUUFBUSxLQUFLLE1BQU0sQ0FDdkI7QUFBQSxJQUVBLE9BQU8sQ0FBQyxtQkFBbUIsV0FBVyxhQUFhO0FBQUE7QUFBQSxFQUcvQyxtQkFBbUIsQ0FDdkIsTUFDQSxZQUNBLFFBQ007QUFBQSxJQUNOLElBQUksUUFBUTtBQUFBLE1BQ1IsT0FBTyxpQkFBaUIsS0FBSztBQUFBLElBQ2pDO0FBQUEsSUFFQSxJQUFJLFdBQVcsa0NBQThCO0FBQUEsTUFDekMsT0FBTyxpQkFBaUIsS0FBSywrQkFBK0IsV0FBVztBQUFBLElBQzNFO0FBQUEsSUFFQSxJQUFJLFdBQVcsb0NBQStCO0FBQUEsTUFDMUMsT0FBTyxpQkFBaUIsS0FBSyxzQkFBc0IsV0FBVztBQUFBLElBQ2xFO0FBQUEsSUFFQSxPQUFPLGlCQUFpQixLQUFLO0FBQUE7QUFBQSxTQUdsQixpQkFBaUIsQ0FBQyxNQUFxQjtBQUFBLElBQ2xELE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9QLEVBQUUsU0FBUyxLQUFLLElBQUk7QUFBQTtBQUFBLEVBR2hCLEdBQUcsQ0FBQyxTQUF1QjtBQUFBLElBQy9CLElBQUksS0FBSyxRQUFRLFNBQVM7QUFBQSxNQUN0QixRQUFRLElBQUksdUJBQXVCLFNBQVM7QUFBQSxJQUNoRDtBQUFBO0FBRVI7IiwKICAiZGVidWdJZCI6ICJENUYwQ0Q0RTU5MTNDQjU3NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
