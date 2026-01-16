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
export {
  TaskExecutor
};

//# debugId=A55798FFE0E11FC264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogVGFzayBleGVjdXRvciBmb3IgdGhlIEZlcmcgRW5naW5lZXJpbmcgU3lzdGVtLlxuICogSGFuZGxlcyB0YXNrIGV4ZWN1dGlvbiwgZGVwZW5kZW5jeSByZXNvbHV0aW9uLCBhbmQgcmVzdWx0IHRyYWNraW5nLlxuICovXG5cbmltcG9ydCB7IHNwYXduIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcIm5vZGU6dXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBBZ2VudENvb3JkaW5hdG9yIH0gZnJvbSBcIi4uL2FnZW50cy9jb29yZGluYXRvclwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFnZW50VGFzayxcbiAgICBBZ2VudFRhc2tSZXN1bHQsXG4gICAgQWdlbnRUYXNrU3RhdHVzLFxuICAgIHR5cGUgQWdlbnRUeXBlLFxuICAgIHR5cGUgQWdncmVnYXRpb25TdHJhdGVneSxcbn0gZnJvbSBcIi4uL2FnZW50cy90eXBlc1wiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEV4ZWN1dGFibGVUYXNrLFxuICAgIHR5cGUgRXhlY3V0aW9uT3B0aW9ucyxcbiAgICB0eXBlIFBsYW4sXG4gICAgdHlwZSBUYXNrLFxuICAgIHR5cGUgVGFza1Jlc3VsdCxcbiAgICBUYXNrU3RhdHVzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgVGFza0V4ZWN1dG9yIHtcbiAgICBwcml2YXRlIG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnM7XG4gICAgcHJpdmF0ZSB0YXNrUmVzdWx0czogTWFwPHN0cmluZywgVGFza1Jlc3VsdD4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBydW5uaW5nVGFza3M6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICAgIHByaXZhdGUgYWdlbnRDb29yZGluYXRvcj86IEFnZW50Q29vcmRpbmF0b3I7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgZHJ5UnVuOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRpbnVlT25FcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBtYXhDb25jdXJyZW5jeTogMSxcbiAgICAgICAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYWdlbnQgY29vcmRpbmF0b3IgZm9yIGV4ZWN1dGluZyBhZ2VudCB0YXNrc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBZ2VudENvb3JkaW5hdG9yKGNvb3JkaW5hdG9yOiBBZ2VudENvb3JkaW5hdG9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWdlbnRDb29yZGluYXRvciA9IGNvb3JkaW5hdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIHRhc2tzIGluIGEgcGxhbiB3aXRoIGRlcGVuZGVuY3kgcmVzb2x1dGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUGxhbihwbGFuOiBQbGFuKTogUHJvbWlzZTxUYXNrUmVzdWx0W10+IHtcbiAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5jbGVhcigpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5jbGVhcigpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGlvbk9yZGVyID0gdGhpcy5yZXNvbHZlRXhlY3V0aW9uT3JkZXIocGxhbi50YXNrcyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBleGVjdXRpb25PcmRlcikge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlVGFzayh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gU3RvcCBleGVjdXRpb24gaWYgdGFzayBmYWlsZWQgYW5kIGNvbnRpbnVlT25FcnJvciBpcyBmYWxzZVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuRkFJTEVEICYmXG4gICAgICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5jb250aW51ZU9uRXJyb3JcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBTdG9wcGluZyBleGVjdXRpb24gZHVlIHRvIHRhc2sgZmFpbHVyZTogJHt0YXNrLmlkfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIHNpbmdsZSB0YXNrXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVUYXNrKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrcy5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFzayAke3Rhc2suaWR9IGlzIGFscmVhZHkgcnVubmluZ2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuYWRkKHRhc2suaWQpO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay5uYW1lfSlgKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5UmVzdWx0ID0gdGhpcy5jaGVja0RlcGVuZGVuY2llcyh0YXNrKTtcbiAgICAgICAgICAgIGlmICghZGVwZW5kZW5jeVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLlNLSVBQRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5UmVzdWx0LmVycm9yID8/IFwiVW5rbm93biBkZXBlbmRlbmN5IGVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkZXBlbmRlbmN5UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIYW5kbGUgZHJ5IHJ1biBtb2RlXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyeVJ1bikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBbRFJZIFJVTl0gV291bGQgZXhlY3V0ZTogJHt0YXNrLmNvbW1hbmR9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkNPTVBMRVRFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYFtEUlkgUlVOXSBDb21tYW5kOiAke3Rhc2suY29tbWFuZH1gLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gYWdlbnQgdGFza1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjdXRlQWdlbnRUYXNrKFxuICAgICAgICAgICAgICAgICAgICB0YXNrIGFzIEFnZW50VGFzayxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIHRhc2sgd2l0aCByZXRyeSBsb2dpY1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlV2l0aFJldHJ5KHRhc2spO1xuICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMubG9nKGBUYXNrICR7dGFzay5pZH0gY29tcGxldGVkIHdpdGggc3RhdHVzOiAke3Jlc3VsdC5zdGF0dXN9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIjtcblxuICAgICAgICAgICAgdGhpcy5sb2coYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5kZWxldGUodGFzay5pZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHJlc3VsdCBvZiBhIHByZXZpb3VzbHkgZXhlY3V0ZWQgdGFza1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUYXNrUmVzdWx0KHRhc2tJZDogc3RyaW5nKTogVGFza1Jlc3VsdCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSZXN1bHRzLmdldCh0YXNrSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFzayByZXN1bHRzXG4gICAgICovXG4gICAgcHVibGljIGdldEFsbFJlc3VsdHMoKTogVGFza1Jlc3VsdFtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50YXNrUmVzdWx0cy52YWx1ZXMoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIHRhc2sgcmVzdWx0c1xuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhclJlc3VsdHMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudGFza1Jlc3VsdHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc29sdmVFeGVjdXRpb25PcmRlcih0YXNrczogRXhlY3V0YWJsZVRhc2tbXSk6IEV4ZWN1dGFibGVUYXNrW10ge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHZpc2l0aW5nID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHNvcnRlZDogRXhlY3V0YWJsZVRhc2tbXSA9IFtdO1xuICAgICAgICBjb25zdCB0YXNrTWFwID0gbmV3IE1hcCh0YXNrcy5tYXAoKHQpID0+IFt0LmlkLCB0XSkpO1xuXG4gICAgICAgIGNvbnN0IHZpc2l0ID0gKHRhc2tJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAodmlzaXRpbmcuaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIGludm9sdmluZyB0YXNrOiAke3Rhc2tJZH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2aXNpdGVkLmhhcyh0YXNrSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5hZGQodGFza0lkKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRhc2tNYXAuZ2V0KHRhc2tJZCk7XG4gICAgICAgICAgICBpZiAodGFzaz8uZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgICAgICB2aXNpdChkZXBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5kZWxldGUodGFza0lkKTtcbiAgICAgICAgICAgIHZpc2l0ZWQuYWRkKHRhc2tJZCk7XG5cbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc29ydGVkLnB1c2godGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgdmlzaXQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc29ydGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tEZXBlbmRlbmNpZXModGFzazogRXhlY3V0YWJsZVRhc2spOiB7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgIH0ge1xuICAgICAgICBpZiAoIXRhc2suZGVwZW5kc09uIHx8IHRhc2suZGVwZW5kc09uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgY29uc3QgZGVwUmVzdWx0ID0gdGhpcy50YXNrUmVzdWx0cy5nZXQoZGVwSWQpO1xuXG4gICAgICAgICAgICBpZiAoIWRlcFJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBiZWVuIGV4ZWN1dGVkYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwUmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2RlcFJlc3VsdC5leGl0Q29kZX1gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXBSZXN1bHQuc3RhdHVzICE9PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBjb21wbGV0ZWQgKHN0YXR1czogJHtkZXBSZXN1bHQuc3RhdHVzfSlgLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlV2l0aFJldHJ5KHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIC8vIGV4ZWN1dGVXaXRoUmV0cnkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgLy8gQWdlbnRUYXNrcyBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5IGluIGV4ZWN1dGVBZ2VudFRhc2tcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZVdpdGhSZXRyeSBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNoZWxsVGFzayA9IHRhc2sgYXMgVGFzaztcbiAgICAgICAgY29uc3QgbWF4QXR0ZW1wdHMgPSBzaGVsbFRhc2sucmV0cnk/Lm1heEF0dGVtcHRzIHx8IDE7XG4gICAgICAgIGNvbnN0IGJhc2VEZWxheSA9IHNoZWxsVGFzay5yZXRyeT8uZGVsYXkgfHwgMDtcbiAgICAgICAgY29uc3QgYmFja29mZk11bHRpcGxpZXIgPSBzaGVsbFRhc2sucmV0cnk/LmJhY2tvZmZNdWx0aXBsaWVyIHx8IDE7XG5cbiAgICAgICAgbGV0IGxhc3RSZXN1bHQ6IFRhc2tSZXN1bHQgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSBtYXhBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IGJhc2VEZWxheSAqIGJhY2tvZmZNdWx0aXBsaWVyICoqIChhdHRlbXB0IC0gMik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBSZXRyeWluZyB0YXNrICR7c2hlbGxUYXNrLmlkfSBpbiAke2RlbGF5fXMgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSlgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zbGVlcChkZWxheSAqIDEwMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHNoZWxsVGFzayk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RSZXN1bHQgPSByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSk6ICR7cmVzdWx0LnN0ZGVyciB8fCByZXN1bHQuZXJyb3J9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhc3RSZXN1bHQhO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUNvbW1hbmQodGFzazogRXhlY3V0YWJsZVRhc2spOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgLy8gZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2l0aCBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVsbFRhc2sgPSB0YXNrIGFzIFRhc2s7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHNoZWxsVGFzay50aW1lb3V0XG4gICAgICAgICAgICAgICAgPyBzaGVsbFRhc2sudGltZW91dCAqIDEwMDBcbiAgICAgICAgICAgICAgICA6IDMwMDAwMDsgLy8gRGVmYXVsdCA1IG1pbnV0ZXNcblxuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBjb21tYW5kOiAke3NoZWxsVGFzay5jb21tYW5kfWApO1xuXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKHNoZWxsVGFzay5jb21tYW5kLCBbXSwge1xuICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN3ZDpcbiAgICAgICAgICAgICAgICAgICAgc2hlbGxUYXNrLndvcmtpbmdEaXJlY3RvcnkgPz8gdGhpcy5vcHRpb25zLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLm9wdGlvbnMuZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIC4uLnNoZWxsVGFzay5lbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IHN0ZGVyciA9IFwiXCI7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZG91dD8ub24oXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBzdGRvdXQgKz0gY2h1bms7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2hpbGQuc3RkZXJyPy5vbihcImRhdGFcIiwgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHN0ZGVyciArPSBjaHVuaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoY2h1bmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjaGlsZC5raWxsKFwiU0lHVEVSTVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHtzaGVsbFRhc2suaWR9IHRpbWVkIG91dCBhZnRlciAke3NoZWxsVGFzay50aW1lb3V0fXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcblxuICAgICAgICAgICAgY2hpbGQub24oXG4gICAgICAgICAgICAgICAgXCJjbG9zZVwiLFxuICAgICAgICAgICAgICAgIChjb2RlOiBudW1iZXIgfCBudWxsLCBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzaGVsbFRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFRhc2tTdGF0dXMuQ09NUExFVEVEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogY29kZSB8fCAoc2lnbmFsID8gLTEgOiAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzaWduYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGBQcm9jZXNzIHRlcm1pbmF0ZWQgYnkgc2lnbmFsOiAke3NpZ25hbH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjaGlsZC5vbihcImVycm9yXCIsIChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHNoZWxsVGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycixcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNsZWVwKG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSB0YXNrIGlzIGFuIGFnZW50IHRhc2tcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQWdlbnRUYXNrKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogdGFzayBpcyBBZ2VudFRhc2sge1xuICAgICAgICByZXR1cm4gXCJ0eXBlXCIgaW4gdGFzayAmJiBcImlucHV0XCIgaW4gdGFzayAmJiBcInN0cmF0ZWd5XCIgaW4gdGFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFuIGFnZW50IHRhc2sgdXNpbmcgdGhlIGFnZW50IGNvb3JkaW5hdG9yXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlQWdlbnRUYXNrKFxuICAgICAgICB0YXNrOiBBZ2VudFRhc2ssXG4gICAgICAgIHN0YXJ0VGltZTogRGF0ZSxcbiAgICApOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgQWdlbnQgY29vcmRpbmF0b3Igbm90IHNldC4gQ2Fubm90IGV4ZWN1dGUgYWdlbnQgdGFzazogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMubG9nKGBFeGVjdXRpbmcgYWdlbnQgdGFzazogJHt0YXNrLmlkfSAoJHt0YXNrLnR5cGV9KWApO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSBhZ2VudCB0YXNrLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIE5PVEU6IFRhc2tFeGVjdXRvciBhbHJlYWR5IHJlc29sdmVzIGNyb3NzLXRhc2sgZGVwZW5kZW5jaWVzIGFjcm9zcyBzaGVsbCArIGFnZW50IHRhc2tzLlxuICAgICAgICAgICAgLy8gQWdlbnRDb29yZGluYXRvciBvbmx5IHVuZGVyc3RhbmRzIGFnZW50LXRvLWFnZW50IGRlcGVuZGVuY2llcywgc28gd2Ugc3RyaXAgZGVwZW5kc09uXG4gICAgICAgICAgICAvLyBoZXJlIHRvIGF2b2lkIGZhaWxpbmcgbWl4ZWQgcGxhbnMgKGFnZW50IHRhc2sgZGVwZW5kaW5nIG9uIGEgc2hlbGwgdGFzaykuXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRvclRhc2s6IEFnZW50VGFzayA9IHtcbiAgICAgICAgICAgICAgICAuLi50YXNrLFxuICAgICAgICAgICAgICAgIGRlcGVuZHNPbjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzdWx0ID1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZXhlY3V0ZVRhc2soY29vcmRpbmF0b3JUYXNrKTtcblxuICAgICAgICAgICAgLy8gQ29udmVydCBhZ2VudCByZXN1bHQgdG8gdGFzayByZXN1bHRcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuY29udmVydEFnZW50U3RhdHVzKGFnZW50UmVzdWx0LnN0YXR1cyksXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6XG4gICAgICAgICAgICAgICAgICAgIGFnZW50UmVzdWx0LnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRCA/IDAgOiAxLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogYWdlbnRSZXN1bHQub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoYWdlbnRSZXN1bHQub3V0cHV0LCBudWxsLCAyKVxuICAgICAgICAgICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBhZ2VudFJlc3VsdC5lcnJvciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhZ2VudFJlc3VsdC5leGVjdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lOiBhZ2VudFJlc3VsdC5lbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBhZ2VudFJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayAke3Rhc2suaWR9IGNvbXBsZXRlZCB3aXRoIHN0YXR1czogJHtyZXN1bHQuc3RhdHVzfWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBBZ2VudCB0YXNrICR7dGFzay5pZH0gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICBzdGRlcnI6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBhZ2VudCB0YXNrIHN0YXR1cyB0byByZWd1bGFyIHRhc2sgc3RhdHVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRTdGF0dXM6IEFnZW50VGFza1N0YXR1cyk6IFRhc2tTdGF0dXMge1xuICAgICAgICBzd2l0Y2ggKGFnZW50U3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuQ09NUExFVEVEO1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuRkFJTEVEOlxuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuVElNRU9VVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5TS0lQUEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLlNLSVBQRUQ7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkZBSUxFRDsgLy8gU2hvdWxkIG5vdCBoYXBwZW4gaW4gZmluYWwgcmVzdWx0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIG11bHRpcGxlIGFnZW50IHRhc2tzIHdpdGggY29vcmRpbmF0aW9uXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVBZ2VudFRhc2tzKFxuICAgICAgICB0YXNrczogQWdlbnRUYXNrW10sXG4gICAgICAgIHN0cmF0ZWd5OiBBZ2dyZWdhdGlvblN0cmF0ZWd5ID0geyB0eXBlOiBcInNlcXVlbnRpYWxcIiB9LFxuICAgICk6IFByb21pc2U8VGFza1Jlc3VsdFtdPiB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZ2VudCBjb29yZGluYXRvciBub3Qgc2V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICBgRXhlY3V0aW5nICR7dGFza3MubGVuZ3RofSBhZ2VudCB0YXNrcyB3aXRoIHN0cmF0ZWd5OiAke3N0cmF0ZWd5LnR5cGV9YCxcbiAgICAgICAgKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBhZ2VudCB0YXNrcyB1c2luZyBjb29yZGluYXRvclxuICAgICAgICAgICAgY29uc3QgYWdlbnRSZXN1bHRzID0gYXdhaXQgdGhpcy5hZ2VudENvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrcyhcbiAgICAgICAgICAgICAgICB0YXNrcyxcbiAgICAgICAgICAgICAgICBzdHJhdGVneSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gdGFzayByZXN1bHRzXG4gICAgICAgICAgICBjb25zdCB0YXNrUmVzdWx0czogVGFza1Jlc3VsdFtdID0gYWdlbnRSZXN1bHRzLm1hcChcbiAgICAgICAgICAgICAgICAoYWdlbnRSZXN1bHQpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBhZ2VudFJlc3VsdC5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLmNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFJlc3VsdC5zdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50UmVzdWx0LnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBhZ2VudFJlc3VsdC5vdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoYWdlbnRSZXN1bHQub3V0cHV0LCBudWxsLCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6IGFnZW50UmVzdWx0LmVycm9yIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhZ2VudFJlc3VsdC5leGVjdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IGFnZW50UmVzdWx0LnN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogYWdlbnRSZXN1bHQuZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGFnZW50UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gU3RvcmUgcmVzdWx0c1xuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgdGFza1Jlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldChyZXN1bHQuaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0YXNrUmVzdWx0cztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgIGBBZ2VudCB0YXNrIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFnZW50IGV4ZWN1dGlvbiBwcm9ncmVzc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBZ2VudFByb2dyZXNzKCk6IGFueSB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZ2V0UHJvZ3Jlc3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWdlbnQgZXhlY3V0aW9uIG1ldHJpY3NcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRNZXRyaWNzKCk6IE1hcDxBZ2VudFR5cGUsIGFueT4gfCBudWxsIHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlbnRDb29yZGluYXRvci5nZXRNZXRyaWNzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtUYXNrRXhlY3V0b3JdICR7bWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7QUFLQTtBQW1CTyxNQUFNLGFBQWE7QUFBQSxFQUNkO0FBQUEsRUFDQSxjQUF1QyxJQUFJO0FBQUEsRUFDM0MsZUFBNEIsSUFBSTtBQUFBLEVBQ2hDO0FBQUEsRUFFUixXQUFXLENBQUMsVUFBNEIsQ0FBQyxHQUFHO0FBQUEsSUFDeEMsS0FBSyxVQUFVO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixpQkFBaUI7QUFBQSxNQUNqQixnQkFBZ0I7QUFBQSxNQUNoQixTQUFTO0FBQUEsU0FDTjtBQUFBLElBQ1A7QUFBQTtBQUFBLEVBTUcsbUJBQW1CLENBQUMsYUFBcUM7QUFBQSxJQUM1RCxLQUFLLG1CQUFtQjtBQUFBO0FBQUEsT0FNZixZQUFXLENBQUMsTUFBbUM7QUFBQSxJQUN4RCxLQUFLLFlBQVksTUFBTTtBQUFBLElBQ3ZCLEtBQUssYUFBYSxNQUFNO0FBQUEsSUFFeEIsTUFBTSxpQkFBaUIsS0FBSyxzQkFBc0IsS0FBSyxLQUFLO0FBQUEsSUFDNUQsTUFBTSxVQUF3QixDQUFDO0FBQUEsSUFFL0IsV0FBVyxRQUFRLGdCQUFnQjtBQUFBLE1BQy9CLE1BQU0sU0FBUyxNQUFNLEtBQUssWUFBWSxJQUFJO0FBQUEsTUFDMUMsS0FBSyxZQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNwQyxRQUFRLEtBQUssTUFBTTtBQUFBLE1BR25CLElBQ0ksT0FBTyxvQ0FDUCxDQUFDLEtBQUssUUFBUSxpQkFDaEI7QUFBQSxRQUNFLEtBQUssSUFBSSwyQ0FBMkMsS0FBSyxJQUFJO0FBQUEsUUFDN0Q7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsT0FNRSxZQUFXLENBQUMsTUFBMkM7QUFBQSxJQUNoRSxJQUFJLEtBQUssYUFBYSxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQUEsTUFDaEMsTUFBTSxJQUFJLE1BQU0sUUFBUSxLQUFLLHVCQUF1QjtBQUFBLElBQ3hEO0FBQUEsSUFFQSxLQUFLLGFBQWEsSUFBSSxLQUFLLEVBQUU7QUFBQSxJQUM3QixNQUFNLFlBQVksSUFBSTtBQUFBLElBRXRCLElBQUk7QUFBQSxNQUNBLEtBQUssSUFBSSxtQkFBbUIsS0FBSyxPQUFPLEtBQUssT0FBTztBQUFBLE1BR3BELE1BQU0sbUJBQW1CLEtBQUssa0JBQWtCLElBQUk7QUFBQSxNQUNwRCxJQUFJLENBQUMsaUJBQWlCLFNBQVM7QUFBQSxRQUMzQixNQUFNLFVBQXFCO0FBQUEsVUFDdkIsSUFBSSxLQUFLO0FBQUEsVUFDVDtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFVBQ1IsUUFDSSxpQkFBaUIsU0FBUztBQUFBLFVBQzlCLFVBQVU7QUFBQSxVQUNWO0FBQUEsVUFDQSxTQUFTLElBQUk7QUFBQSxVQUNiLE9BQU8saUJBQWlCO0FBQUEsUUFDNUI7QUFBQSxRQUNBLEtBQUssWUFBWSxJQUFJLEtBQUssSUFBSSxPQUFNO0FBQUEsUUFDcEMsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUdBLElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxRQUNyQixLQUFLLElBQUksNEJBQTRCLEtBQUssU0FBUztBQUFBLFFBQ25ELE1BQU0sVUFBcUI7QUFBQSxVQUN2QixJQUFJLEtBQUs7QUFBQSxVQUNUO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVixRQUFRLHNCQUFzQixLQUFLO0FBQUEsVUFDbkMsUUFBUTtBQUFBLFVBQ1IsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBLFNBQVMsSUFBSTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxLQUFLLFlBQVksSUFBSSxLQUFLLElBQUksT0FBTTtBQUFBLFFBQ3BDLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFHQSxJQUFJLEtBQUssWUFBWSxJQUFJLEdBQUc7QUFBQSxRQUN4QixPQUFPLE1BQU0sS0FBSyxpQkFDZCxNQUNBLFNBQ0o7QUFBQSxNQUNKO0FBQUEsTUFHQSxNQUFNLFNBQVMsTUFBTSxLQUFLLGlCQUFpQixJQUFJO0FBQUEsTUFDL0MsS0FBSyxZQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNwQyxLQUFLLElBQUksUUFBUSxLQUFLLDZCQUE2QixPQUFPLFFBQVE7QUFBQSxNQUVsRSxPQUFPO0FBQUEsTUFDVCxPQUFPLE9BQU87QUFBQSxNQUNaLE1BQU0sVUFBVSxJQUFJO0FBQUEsTUFDcEIsTUFBTSxlQUNGLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUFBLE1BRTdDLEtBQUssSUFBSSxRQUFRLEtBQUssY0FBYyxjQUFjO0FBQUEsTUFFbEQsTUFBTSxTQUFxQjtBQUFBLFFBQ3ZCLElBQUksS0FBSztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFVBQVUsUUFBUSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQUEsUUFDaEQ7QUFBQSxRQUNBO0FBQUEsUUFDQSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BRUEsT0FBTztBQUFBLGNBQ1Q7QUFBQSxNQUNFLEtBQUssYUFBYSxPQUFPLEtBQUssRUFBRTtBQUFBO0FBQUE7QUFBQSxFQU9qQyxhQUFhLENBQUMsUUFBd0M7QUFBQSxJQUN6RCxPQUFPLEtBQUssWUFBWSxJQUFJLE1BQU07QUFBQTtBQUFBLEVBTS9CLGFBQWEsR0FBaUI7QUFBQSxJQUNqQyxPQUFPLE1BQU0sS0FBSyxLQUFLLFlBQVksT0FBTyxDQUFDO0FBQUE7QUFBQSxFQU14QyxZQUFZLEdBQVM7QUFBQSxJQUN4QixLQUFLLFlBQVksTUFBTTtBQUFBO0FBQUEsRUFHbkIscUJBQXFCLENBQUMsT0FBMkM7QUFBQSxJQUNyRSxNQUFNLFVBQVUsSUFBSTtBQUFBLElBQ3BCLE1BQU0sV0FBVyxJQUFJO0FBQUEsSUFDckIsTUFBTSxTQUEyQixDQUFDO0FBQUEsSUFDbEMsTUFBTSxVQUFVLElBQUksSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQUEsSUFFbkQsTUFBTSxRQUFRLENBQUMsV0FBeUI7QUFBQSxNQUNwQyxJQUFJLFNBQVMsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUN0QixNQUFNLElBQUksTUFDTixnREFBZ0QsUUFDcEQ7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUNyQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLFNBQVMsSUFBSSxNQUFNO0FBQUEsTUFFbkIsTUFBTSxPQUFPLFFBQVEsSUFBSSxNQUFNO0FBQUEsTUFDL0IsSUFBSSxNQUFNLFdBQVc7QUFBQSxRQUNqQixXQUFXLFNBQVMsS0FBSyxXQUFXO0FBQUEsVUFDaEMsTUFBTSxLQUFLO0FBQUEsUUFDZjtBQUFBLE1BQ0o7QUFBQSxNQUVBLFNBQVMsT0FBTyxNQUFNO0FBQUEsTUFDdEIsUUFBUSxJQUFJLE1BQU07QUFBQSxNQUVsQixJQUFJLE1BQU07QUFBQSxRQUNOLE9BQU8sS0FBSyxJQUFJO0FBQUEsTUFDcEI7QUFBQTtBQUFBLElBR0osV0FBVyxRQUFRLE9BQU87QUFBQSxNQUN0QixJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQUEsUUFDdkIsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLEVBR0gsaUJBQWlCLENBQUMsTUFHeEI7QUFBQSxJQUNFLElBQUksQ0FBQyxLQUFLLGFBQWEsS0FBSyxVQUFVLFdBQVcsR0FBRztBQUFBLE1BQ2hELE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFBQSxJQUMzQjtBQUFBLElBRUEsV0FBVyxTQUFTLEtBQUssV0FBVztBQUFBLE1BQ2hDLE1BQU0sWUFBWSxLQUFLLFlBQVksSUFBSSxLQUFLO0FBQUEsTUFFNUMsSUFBSSxDQUFDLFdBQVc7QUFBQSxRQUNaLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYztBQUFBLFFBQ3pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxVQUFVLGtDQUE4QjtBQUFBLFFBQ3hDLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYywrQkFBK0IsVUFBVTtBQUFBLFFBQ2xFO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxVQUFVLHdDQUFpQztBQUFBLFFBQzNDLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYyxvQ0FBb0MsVUFBVTtBQUFBLFFBQ3ZFO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFBQTtBQUFBLE9BR2IsaUJBQWdCLENBQUMsTUFBMkM7QUFBQSxJQUd0RSxJQUFJLEtBQUssWUFBWSxJQUFJLEdBQUc7QUFBQSxNQUN4QixNQUFNLElBQUksTUFDTiwwREFBMEQsS0FBSyxJQUNuRTtBQUFBLElBQ0o7QUFBQSxJQUVBLE1BQU0sWUFBWTtBQUFBLElBQ2xCLE1BQU0sY0FBYyxVQUFVLE9BQU8sZUFBZTtBQUFBLElBQ3BELE1BQU0sWUFBWSxVQUFVLE9BQU8sU0FBUztBQUFBLElBQzVDLE1BQU0sb0JBQW9CLFVBQVUsT0FBTyxxQkFBcUI7QUFBQSxJQUVoRSxJQUFJLGFBQWdDO0FBQUEsSUFFcEMsU0FBUyxVQUFVLEVBQUcsV0FBVyxhQUFhLFdBQVc7QUFBQSxNQUNyRCxJQUFJLFVBQVUsR0FBRztBQUFBLFFBQ2IsTUFBTSxRQUFRLFlBQVksc0JBQXNCLFVBQVU7QUFBQSxRQUMxRCxLQUFLLElBQ0QsaUJBQWlCLFVBQVUsU0FBUyxtQkFBbUIsV0FBVyxjQUN0RTtBQUFBLFFBQ0EsTUFBTSxLQUFLLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDakM7QUFBQSxNQUVBLE1BQU0sU0FBUyxNQUFNLEtBQUssZUFBZSxTQUFTO0FBQUEsTUFFbEQsSUFBSSxPQUFPLHdDQUFpQztBQUFBLFFBQ3hDLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFFQSxhQUFhO0FBQUEsTUFFYixJQUFJLFVBQVUsYUFBYTtBQUFBLFFBQ3ZCLEtBQUssSUFDRCxRQUFRLEtBQUssc0JBQXNCLFdBQVcsaUJBQWlCLE9BQU8sVUFBVSxPQUFPLE9BQzNGO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLE9BR0csZUFBYyxDQUFDLE1BQTJDO0FBQUEsSUFFcEUsSUFBSSxLQUFLLFlBQVksSUFBSSxHQUFHO0FBQUEsTUFDeEIsTUFBTSxJQUFJLE1BQ04sd0RBQXdELEtBQUssSUFDakU7QUFBQSxJQUNKO0FBQUEsSUFFQSxNQUFNLFlBQVk7QUFBQSxJQUVsQixPQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFBQSxNQUM1QixNQUFNLFlBQVksSUFBSTtBQUFBLE1BQ3RCLE1BQU0sVUFBVSxVQUFVLFVBQ3BCLFVBQVUsVUFBVSxPQUNwQjtBQUFBLE1BRU4sS0FBSyxJQUFJLHNCQUFzQixVQUFVLFNBQVM7QUFBQSxNQUVsRCxNQUFNLFFBQVEsTUFBTSxVQUFVLFNBQVMsQ0FBQyxHQUFHO0FBQUEsUUFDdkMsT0FBTztBQUFBLFFBQ1AsS0FDSSxVQUFVLG9CQUFvQixLQUFLLFFBQVE7QUFBQSxRQUMvQyxLQUFLO0FBQUEsYUFDRSxRQUFRO0FBQUEsYUFDUixLQUFLLFFBQVE7QUFBQSxhQUNiLFVBQVU7QUFBQSxRQUNqQjtBQUFBLE1BQ0osQ0FBQztBQUFBLE1BRUQsSUFBSSxTQUFTO0FBQUEsTUFDYixJQUFJLFNBQVM7QUFBQSxNQUViLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFpQjtBQUFBLFFBQ3ZDLE1BQU0sUUFBUSxLQUFLLFNBQVM7QUFBQSxRQUM1QixVQUFVO0FBQUEsUUFDVixJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsVUFDdEIsUUFBUSxPQUFPLE1BQU0sS0FBSztBQUFBLFFBQzlCO0FBQUEsT0FDSDtBQUFBLE1BRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQWlCO0FBQUEsUUFDdkMsTUFBTSxRQUFRLEtBQUssU0FBUztBQUFBLFFBQzVCLFVBQVU7QUFBQSxRQUNWLElBQUksS0FBSyxRQUFRLFNBQVM7QUFBQSxVQUN0QixRQUFRLE9BQU8sTUFBTSxLQUFLO0FBQUEsUUFDOUI7QUFBQSxPQUNIO0FBQUEsTUFFRCxNQUFNLFlBQVksV0FBVyxNQUFNO0FBQUEsUUFDL0IsTUFBTSxLQUFLLFNBQVM7QUFBQSxRQUNwQixLQUFLLElBQ0QsUUFBUSxVQUFVLHNCQUFzQixVQUFVLFVBQ3REO0FBQUEsU0FDRCxPQUFPO0FBQUEsTUFFVixNQUFNLEdBQ0YsU0FDQSxDQUFDLE1BQXFCLFdBQWtDO0FBQUEsUUFDcEQsYUFBYSxTQUFTO0FBQUEsUUFDdEIsTUFBTSxVQUFVLElBQUk7QUFBQSxRQUNwQixNQUFNLFdBQVcsUUFBUSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQUEsUUFFdkQsTUFBTSxTQUFxQjtBQUFBLFVBQ3ZCLElBQUksVUFBVTtBQUFBLFVBQ2QsUUFDSSxTQUFTO0FBQUEsVUFHYixVQUFVLFNBQVMsU0FBUyxLQUFLO0FBQUEsVUFDakM7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQSxPQUFPLFNBQ0QsaUNBQWlDLFdBQ2pDO0FBQUEsUUFDVjtBQUFBLFFBRUEsUUFBUSxNQUFNO0FBQUEsT0FFdEI7QUFBQSxNQUVBLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBaUI7QUFBQSxRQUNoQyxhQUFhLFNBQVM7QUFBQSxRQUN0QixNQUFNLFVBQVUsSUFBSTtBQUFBLFFBQ3BCLE1BQU0sV0FBVyxRQUFRLFFBQVEsSUFBSSxVQUFVLFFBQVE7QUFBQSxRQUV2RCxNQUFNLFNBQXFCO0FBQUEsVUFDdkIsSUFBSSxVQUFVO0FBQUEsVUFDZDtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLFFBRUEsUUFBUSxNQUFNO0FBQUEsT0FDakI7QUFBQSxLQUNKO0FBQUE7QUFBQSxFQUdHLEtBQUssQ0FBQyxJQUEyQjtBQUFBLElBQ3JDLE9BQU8sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQUE7QUFBQSxFQU1uRCxXQUFXLENBQUMsTUFBeUM7QUFBQSxJQUN6RCxPQUFPLFVBQVUsUUFBUSxXQUFXLFFBQVEsY0FBYztBQUFBO0FBQUEsT0FNaEQsaUJBQWdCLENBQzFCLE1BQ0EsV0FDbUI7QUFBQSxJQUNuQixJQUFJLENBQUMsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QixNQUFNLElBQUksTUFDTix5REFBeUQsS0FBSyxJQUNsRTtBQUFBLElBQ0o7QUFBQSxJQUVBLElBQUk7QUFBQSxNQUNBLEtBQUssSUFBSSx5QkFBeUIsS0FBSyxPQUFPLEtBQUssT0FBTztBQUFBLE1BTzFELE1BQU0sa0JBQTZCO0FBQUEsV0FDNUI7QUFBQSxRQUNILFdBQVc7QUFBQSxNQUNmO0FBQUEsTUFDQSxNQUFNLGNBQ0YsTUFBTSxLQUFLLGlCQUFpQixZQUFZLGVBQWU7QUFBQSxNQUczRCxNQUFNLFNBQXFCO0FBQUEsUUFDdkIsSUFBSSxLQUFLO0FBQUEsUUFDVCxRQUFRLEtBQUssbUJBQW1CLFlBQVksTUFBTTtBQUFBLFFBQ2xELFVBQ0ksWUFBWSx5Q0FBdUMsSUFBSTtBQUFBLFFBQzNELFFBQVEsWUFBWSxTQUNkLEtBQUssVUFBVSxZQUFZLFFBQVEsTUFBTSxDQUFDLElBQzFDO0FBQUEsUUFDTixRQUFRLFlBQVksU0FBUztBQUFBLFFBQzdCLFVBQVUsWUFBWTtBQUFBLFFBQ3RCO0FBQUEsUUFDQSxTQUFTLFlBQVk7QUFBQSxRQUNyQixPQUFPLFlBQVk7QUFBQSxNQUN2QjtBQUFBLE1BRUEsS0FBSyxZQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNwQyxLQUFLLElBQ0QsY0FBYyxLQUFLLDZCQUE2QixPQUFPLFFBQzNEO0FBQUEsTUFFQSxPQUFPO0FBQUEsTUFDVCxPQUFPLE9BQU87QUFBQSxNQUNaLE1BQU0sVUFBVSxJQUFJO0FBQUEsTUFDcEIsTUFBTSxlQUNGLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUFBLE1BRTdDLEtBQUssSUFBSSxjQUFjLEtBQUssY0FBYyxjQUFjO0FBQUEsTUFFeEQsTUFBTSxTQUFxQjtBQUFBLFFBQ3ZCLElBQUksS0FBSztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFVBQVUsUUFBUSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQUEsUUFDaEQ7QUFBQSxRQUNBO0FBQUEsUUFDQSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BRUEsT0FBTztBQUFBO0FBQUE7QUFBQSxFQU9QLGtCQUFrQixDQUFDLGFBQTBDO0FBQUEsSUFDakUsUUFBUTtBQUFBO0FBQUEsUUFFQTtBQUFBO0FBQUE7QUFBQSxRQUdBO0FBQUE7QUFBQSxRQUVBO0FBQUE7QUFBQSxRQUVBO0FBQUE7QUFBQTtBQUFBLE9BT0Msa0JBQWlCLENBQzFCLE9BQ0EsV0FBZ0MsRUFBRSxNQUFNLGFBQWEsR0FDaEM7QUFBQSxJQUNyQixJQUFJLENBQUMsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QixNQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxJQUMvQztBQUFBLElBRUEsS0FBSyxJQUNELGFBQWEsTUFBTSxxQ0FBcUMsU0FBUyxNQUNyRTtBQUFBLElBRUEsSUFBSTtBQUFBLE1BRUEsTUFBTSxlQUFlLE1BQU0sS0FBSyxpQkFBaUIsYUFDN0MsT0FDQSxRQUNKO0FBQUEsTUFHQSxNQUFNLGNBQTRCLGFBQWEsSUFDM0MsQ0FBQyxpQkFBaUI7QUFBQSxRQUNkLElBQUksWUFBWTtBQUFBLFFBQ2hCLFFBQVEsS0FBSyxtQkFBbUIsWUFBWSxNQUFNO0FBQUEsUUFDbEQsVUFDSSxZQUFZLHlDQUNOLElBQ0E7QUFBQSxRQUNWLFFBQVEsWUFBWSxTQUNkLEtBQUssVUFBVSxZQUFZLFFBQVEsTUFBTSxDQUFDLElBQzFDO0FBQUEsUUFDTixRQUFRLFlBQVksU0FBUztBQUFBLFFBQzdCLFVBQVUsWUFBWTtBQUFBLFFBQ3RCLFdBQVcsWUFBWTtBQUFBLFFBQ3ZCLFNBQVMsWUFBWTtBQUFBLFFBQ3JCLE9BQU8sWUFBWTtBQUFBLE1BQ3ZCLEVBQ0o7QUFBQSxNQUdBLFdBQVcsVUFBVSxhQUFhO0FBQUEsUUFDOUIsS0FBSyxZQUFZLElBQUksT0FBTyxJQUFJLE1BQU07QUFBQSxNQUMxQztBQUFBLE1BRUEsT0FBTztBQUFBLE1BQ1QsT0FBTyxPQUFPO0FBQUEsTUFDWixLQUFLLElBQ0QsZ0NBQWdDLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxpQkFDN0U7QUFBQSxNQUNBLE1BQU07QUFBQTtBQUFBO0FBQUEsRUFPUCxnQkFBZ0IsR0FBUTtBQUFBLElBQzNCLElBQUksQ0FBQyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3hCLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLEtBQUssaUJBQWlCLFlBQVk7QUFBQTtBQUFBLEVBTXRDLGVBQWUsR0FBK0I7QUFBQSxJQUNqRCxJQUFJLENBQUMsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QixPQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxLQUFLLGlCQUFpQixXQUFXO0FBQUE7QUFBQSxFQUdwQyxHQUFHLENBQUMsU0FBdUI7QUFBQSxJQUMvQixJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFDdEIsUUFBUSxJQUFJLGtCQUFrQixTQUFTO0FBQUEsSUFDM0M7QUFBQTtBQUVSOyIsCiAgImRlYnVnSWQiOiAiQTU1Nzk4RkZFMEUxMUZDMjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
