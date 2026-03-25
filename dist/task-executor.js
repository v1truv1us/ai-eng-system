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
export {
  TaskExecutor
};

//# debugId=3ACC2866F257F4C664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogVGFzayBleGVjdXRvciBmb3IgdGhlIEZlcmcgRW5naW5lZXJpbmcgU3lzdGVtLlxuICogSGFuZGxlcyB0YXNrIGV4ZWN1dGlvbiwgZGVwZW5kZW5jeSByZXNvbHV0aW9uLCBhbmQgcmVzdWx0IHRyYWNraW5nLlxuICovXG5cbmltcG9ydCB7IHNwYXduLCBzcGF3blN5bmMgfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwibm9kZTp1dGlsXCI7XG5pbXBvcnQgdHlwZSB7IEFnZW50Q29vcmRpbmF0b3IgfSBmcm9tIFwiLi4vYWdlbnRzL2Nvb3JkaW5hdG9yXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgQWdlbnRUYXNrLFxuICAgIEFnZW50VGFza1Jlc3VsdCxcbiAgICBBZ2VudFRhc2tTdGF0dXMsXG4gICAgdHlwZSBBZ2VudFR5cGUsXG4gICAgdHlwZSBBZ2dyZWdhdGlvblN0cmF0ZWd5LFxufSBmcm9tIFwiLi4vYWdlbnRzL3R5cGVzXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgRXhlY3V0YWJsZVRhc2ssXG4gICAgdHlwZSBFeGVjdXRpb25PcHRpb25zLFxuICAgIHR5cGUgUGxhbixcbiAgICB0eXBlIFRhc2ssXG4gICAgdHlwZSBUYXNrUmVzdWx0LFxuICAgIFRhc2tTdGF0dXMsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBUYXNrRXhlY3V0b3Ige1xuICAgIHByaXZhdGUgb3B0aW9uczogRXhlY3V0aW9uT3B0aW9ucztcbiAgICBwcml2YXRlIHRhc2tSZXN1bHRzOiBNYXA8c3RyaW5nLCBUYXNrUmVzdWx0PiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIHJ1bm5pbmdUYXNrczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgcHJpdmF0ZSBhZ2VudENvb3JkaW5hdG9yPzogQWdlbnRDb29yZGluYXRvcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBkcnlSdW46IGZhbHNlLFxuICAgICAgICAgICAgY29udGludWVPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIG1heENvbmN1cnJlbmN5OiAxLFxuICAgICAgICAgICAgdmVyYm9zZTogZmFsc2UsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBhZ2VudCBjb29yZGluYXRvciBmb3IgZXhlY3V0aW5nIGFnZW50IHRhc2tzXG4gICAgICovXG4gICAgcHVibGljIHNldEFnZW50Q29vcmRpbmF0b3IoY29vcmRpbmF0b3I6IEFnZW50Q29vcmRpbmF0b3IpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hZ2VudENvb3JkaW5hdG9yID0gY29vcmRpbmF0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhbGwgdGFza3MgaW4gYSBwbGFuIHdpdGggZGVwZW5kZW5jeSByZXNvbHV0aW9uXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVQbGFuKHBsYW46IFBsYW4pOiBQcm9taXNlPFRhc2tSZXN1bHRbXT4ge1xuICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMucnVubmluZ1Rhc2tzLmNsZWFyKCk7XG5cbiAgICAgICAgY29uc3QgZXhlY3V0aW9uT3JkZXIgPSB0aGlzLnJlc29sdmVFeGVjdXRpb25PcmRlcihwbGFuLnRhc2tzKTtcbiAgICAgICAgY29uc3QgcmVzdWx0czogVGFza1Jlc3VsdFtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIGV4ZWN1dGlvbk9yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVUYXNrKHRhc2spO1xuICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIGV4ZWN1dGlvbiBpZiB0YXNrIGZhaWxlZCBhbmQgY29udGludWVPbkVycm9yIGlzIGZhbHNlXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQgJiZcbiAgICAgICAgICAgICAgICAhdGhpcy5vcHRpb25zLmNvbnRpbnVlT25FcnJvclxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coYFN0b3BwaW5nIGV4ZWN1dGlvbiBkdWUgdG8gdGFzayBmYWlsdXJlOiAke3Rhc2suaWR9YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgc2luZ2xlIHRhc2tcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXhlY3V0ZVRhc2sodGFzazogRXhlY3V0YWJsZVRhc2spOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZ1Rhc2tzLmhhcyh0YXNrLmlkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYXNrICR7dGFzay5pZH0gaXMgYWxyZWFkeSBydW5uaW5nYCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5hZGQodGFzay5pZCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMubG9nKGBFeGVjdXRpbmcgdGFzazogJHt0YXNrLmlkfSAoJHt0YXNrLm5hbWV9KWApO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgIGNvbnN0IGRlcGVuZGVuY3lSZXN1bHQgPSB0aGlzLmNoZWNrRGVwZW5kZW5jaWVzKHRhc2spO1xuICAgICAgICAgICAgaWYgKCFkZXBlbmRlbmN5UmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuU0tJUFBFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY3lSZXN1bHQuZXJyb3IgPz8gXCJVbmtub3duIGRlcGVuZGVuY3kgZXJyb3JcIixcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGRlcGVuZGVuY3lSZXN1bHQuZXJyb3IsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBkcnkgcnVuIG1vZGVcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coYFtEUlkgUlVOXSBXb3VsZCBleGVjdXRlOiAke3Rhc2suY29tbWFuZH1gKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuQ09NUExFVEVELFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogMCxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBgW0RSWSBSVU5dIENvbW1hbmQ6ICR7dGFzay5jb21tYW5kfWAsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycjogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhbiBhZ2VudCB0YXNrXG4gICAgICAgICAgICBpZiAodGhpcy5pc0FnZW50VGFzayh0YXNrKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmV4ZWN1dGVBZ2VudFRhc2soXG4gICAgICAgICAgICAgICAgICAgIHRhc2sgYXMgQWdlbnRUYXNrLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgdGFzayB3aXRoIHJldHJ5IGxvZ2ljXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVXaXRoUmV0cnkodGFzayk7XG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5sb2coYFRhc2sgJHt0YXNrLmlkfSBjb21wbGV0ZWQgd2l0aCBzdGF0dXM6ICR7cmVzdWx0LnN0YXR1c31gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiO1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhgVGFzayAke3Rhc2suaWR9IGZhaWxlZDogJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMucnVubmluZ1Rhc2tzLmRlbGV0ZSh0YXNrLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcmVzdWx0IG9mIGEgcHJldmlvdXNseSBleGVjdXRlZCB0YXNrXG4gICAgICovXG4gICAgcHVibGljIGdldFRhc2tSZXN1bHQodGFza0lkOiBzdHJpbmcpOiBUYXNrUmVzdWx0IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jlc3VsdHMuZ2V0KHRhc2tJZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCB0YXNrIHJlc3VsdHNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWxsUmVzdWx0cygpOiBUYXNrUmVzdWx0W10ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnRhc2tSZXN1bHRzLnZhbHVlcygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgdGFzayByZXN1bHRzXG4gICAgICovXG4gICAgcHVibGljIGNsZWFyUmVzdWx0cygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5jbGVhcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzb2x2ZUV4ZWN1dGlvbk9yZGVyKHRhc2tzOiBFeGVjdXRhYmxlVGFza1tdKTogRXhlY3V0YWJsZVRhc2tbXSB7XG4gICAgICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgY29uc3QgdmlzaXRpbmcgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgY29uc3Qgc29ydGVkOiBFeGVjdXRhYmxlVGFza1tdID0gW107XG4gICAgICAgIGNvbnN0IHRhc2tNYXAgPSBuZXcgTWFwKHRhc2tzLm1hcCgodCkgPT4gW3QuaWQsIHRdKSk7XG5cbiAgICAgICAgY29uc3QgdmlzaXQgPSAodGFza0lkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICh2aXNpdGluZy5oYXModGFza0lkKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgaW52b2x2aW5nIHRhc2s6ICR7dGFza0lkfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHZpc2l0ZWQuaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZpc2l0aW5nLmFkZCh0YXNrSWQpO1xuXG4gICAgICAgICAgICBjb25zdCB0YXNrID0gdGFza01hcC5nZXQodGFza0lkKTtcbiAgICAgICAgICAgIGlmICh0YXNrPy5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlcElkIG9mIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpc2l0KGRlcElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZpc2l0aW5nLmRlbGV0ZSh0YXNrSWQpO1xuICAgICAgICAgICAgdmlzaXRlZC5hZGQodGFza0lkKTtcblxuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBzb3J0ZWQucHVzaCh0YXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgICB2aXNpdCh0YXNrLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb3J0ZWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0RlcGVuZGVuY2llcyh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IHtcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgfSB7XG4gICAgICAgIGlmICghdGFzay5kZXBlbmRzT24gfHwgdGFzay5kZXBlbmRzT24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGRlcElkIG9mIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICBjb25zdCBkZXBSZXN1bHQgPSB0aGlzLnRhc2tSZXN1bHRzLmdldChkZXBJZCk7XG5cbiAgICAgICAgICAgIGlmICghZGVwUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRGVwZW5kZW5jeSAke2RlcElkfSBoYXMgbm90IGJlZW4gZXhlY3V0ZWRgLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXBSZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7ZGVwUmVzdWx0LmV4aXRDb2RlfWAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlcFJlc3VsdC5zdGF0dXMgIT09IFRhc2tTdGF0dXMuQ09NUExFVEVEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRGVwZW5kZW5jeSAke2RlcElkfSBoYXMgbm90IGNvbXBsZXRlZCAoc3RhdHVzOiAke2RlcFJlc3VsdC5zdGF0dXN9KWAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVXaXRoUmV0cnkodGFzazogRXhlY3V0YWJsZVRhc2spOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgLy8gZXhlY3V0ZVdpdGhSZXRyeSBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aCByZWd1bGFyIFRhc2tzLCBub3QgQWdlbnRUYXNrc1xuICAgICAgICAvLyBBZ2VudFRhc2tzIGFyZSBoYW5kbGVkIHNlcGFyYXRlbHkgaW4gZXhlY3V0ZUFnZW50VGFza1xuICAgICAgICBpZiAodGhpcy5pc0FnZW50VGFzayh0YXNrKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBleGVjdXRlV2l0aFJldHJ5IHNob3VsZCBub3QgYmUgY2FsbGVkIHdpdGggYWdlbnQgdGFzazogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hlbGxUYXNrID0gdGFzayBhcyBUYXNrO1xuICAgICAgICBjb25zdCBtYXhBdHRlbXB0cyA9IHNoZWxsVGFzay5yZXRyeT8ubWF4QXR0ZW1wdHMgfHwgMTtcbiAgICAgICAgY29uc3QgYmFzZURlbGF5ID0gc2hlbGxUYXNrLnJldHJ5Py5kZWxheSB8fCAwO1xuICAgICAgICBjb25zdCBiYWNrb2ZmTXVsdGlwbGllciA9IHNoZWxsVGFzay5yZXRyeT8uYmFja29mZk11bHRpcGxpZXIgfHwgMTtcblxuICAgICAgICBsZXQgbGFzdFJlc3VsdDogVGFza1Jlc3VsdCB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IG1heEF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIGlmIChhdHRlbXB0ID4gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gYmFzZURlbGF5ICogYmFja29mZk11bHRpcGxpZXIgKiogKGF0dGVtcHQgLSAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFJldHJ5aW5nIHRhc2sgJHtzaGVsbFRhc2suaWR9IGluICR7ZGVsYXl9cyAoYXR0ZW1wdCAke2F0dGVtcHR9LyR7bWF4QXR0ZW1wdHN9KWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNsZWVwKGRlbGF5ICogMTAwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQoc2hlbGxUYXNrKTtcblxuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuQ09NUExFVEVEKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFzdFJlc3VsdCA9IHJlc3VsdDtcblxuICAgICAgICAgICAgaWYgKGF0dGVtcHQgPCBtYXhBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgICAgICBgVGFzayAke3Rhc2suaWR9IGZhaWxlZCAoYXR0ZW1wdCAke2F0dGVtcHR9LyR7bWF4QXR0ZW1wdHN9KTogJHtyZXN1bHQuc3RkZXJyIHx8IHJlc3VsdC5lcnJvcn1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFzdFJlc3VsdCE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlQ29tbWFuZCh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IFByb21pc2U8VGFza1Jlc3VsdD4ge1xuICAgICAgICAvLyBleGVjdXRlQ29tbWFuZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aCByZWd1bGFyIFRhc2tzLCBub3QgQWdlbnRUYXNrc1xuICAgICAgICBpZiAodGhpcy5pc0FnZW50VGFzayh0YXNrKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBleGVjdXRlQ29tbWFuZCBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNoZWxsVGFzayA9IHRhc2sgYXMgVGFzaztcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0ID0gc2hlbGxUYXNrLnRpbWVvdXRcbiAgICAgICAgICAgICAgICA/IHNoZWxsVGFzay50aW1lb3V0ICogMTAwMFxuICAgICAgICAgICAgICAgIDogMzAwMDAwOyAvLyBEZWZhdWx0IDUgbWludXRlc1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7c2hlbGxUYXNrLmNvbW1hbmR9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oc2hlbGxUYXNrLmNvbW1hbmQsIFtdLCB7XG4gICAgICAgICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY3dkOlxuICAgICAgICAgICAgICAgICAgICBzaGVsbFRhc2sud29ya2luZ0RpcmVjdG9yeSA/PyB0aGlzLm9wdGlvbnMud29ya2luZ0RpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMub3B0aW9ucy5lbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICAgICAgLi4uc2hlbGxUYXNrLmVudmlyb25tZW50LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IHN0ZG91dCA9IFwiXCI7XG4gICAgICAgICAgICBsZXQgc3RkZXJyID0gXCJcIjtcblxuICAgICAgICAgICAgY2hpbGQuc3Rkb3V0Py5vbihcImRhdGFcIiwgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHN0ZG91dCArPSBjaHVuaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoY2h1bmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjaGlsZC5zdGRlcnI/Lm9uKFwiZGF0YVwiLCAoZGF0YTogQnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgc3RkZXJyICs9IGNodW5rO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShjaHVuayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgICAgICBgVGFzayAke3NoZWxsVGFzay5pZH0gdGltZWQgb3V0IGFmdGVyICR7dGltZW91dCAvIDEwMDB9c2AsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAvLyBLaWxsIHRoZSBlbnRpcmUgcHJvY2VzcyB0cmVlIHRvIGVuc3VyZSBjaGlsZCBwcm9jZXNzZXMgYXJlIHRlcm1pbmF0ZWRcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQucGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIFdpbmRvd3MsIHVzZSB0YXNra2lsbCB0byB0ZXJtaW5hdGUgdGhlIHByb2Nlc3MgdHJlZSBzeW5jaHJvbm91c2x5XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0YXNra2lsbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXCIvUElEXCIsIGNoaWxkLnBpZC50b1N0cmluZygpLCBcIi9UXCIsIFwiL0ZcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgd2luZG93c0hpZGU6IHRydWUsIHN0ZGlvOiBcImlnbm9yZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzcGF3blN5bmMgd29uJ3QgdGhyb3cgb24gbm9uLXplcm8gZXhpdDsgZmFsbCBiYWNrIHRvIGRpcmVjdCBraWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5lcnJvciB8fCByZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5raWxsKFwiU0lHS0lMTFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGFscmVhZHkgZXhpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzcGF3bmluZyB0YXNra2lsbCBpdHNlbGYgZmFpbGVkOyBmYWxsIGJhY2sgdG8gZGlyZWN0IGtpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5raWxsKFwiU0lHS0lMTFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBhbHJlYWR5IGV4aXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIFBPU0lYLCBraWxsIHRoZSBlbnRpcmUgcHJvY2VzcyBncm91cFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmtpbGwoLWNoaWxkLnBpZCwgXCJTSUdLSUxMXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBncm91cCBhbHJlYWR5IGV4aXRlZDsgZmFsbCBiYWNrIHRvIGRpcmVjdCBraWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgYWxyZWFkeSBleGl0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcblxuICAgICAgICAgICAgY2hpbGQub24oXG4gICAgICAgICAgICAgICAgXCJjbG9zZVwiLFxuICAgICAgICAgICAgICAgIChjb2RlOiBudW1iZXIgfCBudWxsLCBzaWduYWw6IE5vZGVKUy5TaWduYWxzIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzaGVsbFRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFRhc2tTdGF0dXMuQ09NUExFVEVEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTogY29kZSB8fCAoc2lnbmFsID8gLTEgOiAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzaWduYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGBQcm9jZXNzIHRlcm1pbmF0ZWQgYnkgc2lnbmFsOiAke3NpZ25hbH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjaGlsZC5vbihcImVycm9yXCIsIChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHNoZWxsVGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgICAgICBzdGRvdXQsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycixcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNsZWVwKG1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSB0YXNrIGlzIGFuIGFnZW50IHRhc2tcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQWdlbnRUYXNrKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogdGFzayBpcyBBZ2VudFRhc2sge1xuICAgICAgICByZXR1cm4gXCJ0eXBlXCIgaW4gdGFzayAmJiBcImlucHV0XCIgaW4gdGFzayAmJiBcInN0cmF0ZWd5XCIgaW4gdGFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFuIGFnZW50IHRhc2sgdXNpbmcgdGhlIGFnZW50IGNvb3JkaW5hdG9yXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlQWdlbnRUYXNrKFxuICAgICAgICB0YXNrOiBBZ2VudFRhc2ssXG4gICAgICAgIHN0YXJ0VGltZTogRGF0ZSxcbiAgICApOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgQWdlbnQgY29vcmRpbmF0b3Igbm90IHNldC4gQ2Fubm90IGV4ZWN1dGUgYWdlbnQgdGFzazogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMubG9nKGBFeGVjdXRpbmcgYWdlbnQgdGFzazogJHt0YXNrLmlkfSAoJHt0YXNrLnR5cGV9KWApO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSBhZ2VudCB0YXNrLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIE5PVEU6IFRhc2tFeGVjdXRvciBhbHJlYWR5IHJlc29sdmVzIGNyb3NzLXRhc2sgZGVwZW5kZW5jaWVzIGFjcm9zcyBzaGVsbCArIGFnZW50IHRhc2tzLlxuICAgICAgICAgICAgLy8gQWdlbnRDb29yZGluYXRvciBvbmx5IHVuZGVyc3RhbmRzIGFnZW50LXRvLWFnZW50IGRlcGVuZGVuY2llcywgc28gd2Ugc3RyaXAgZGVwZW5kc09uXG4gICAgICAgICAgICAvLyBoZXJlIHRvIGF2b2lkIGZhaWxpbmcgbWl4ZWQgcGxhbnMgKGFnZW50IHRhc2sgZGVwZW5kaW5nIG9uIGEgc2hlbGwgdGFzaykuXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRvclRhc2s6IEFnZW50VGFzayA9IHtcbiAgICAgICAgICAgICAgICAuLi50YXNrLFxuICAgICAgICAgICAgICAgIGRlcGVuZHNPbjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzdWx0ID1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZXhlY3V0ZVRhc2soY29vcmRpbmF0b3JUYXNrKTtcblxuICAgICAgICAgICAgLy8gQ29udmVydCBhZ2VudCByZXN1bHQgdG8gdGFzayByZXN1bHRcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHRoaXMuY29udmVydEFnZW50U3RhdHVzKGFnZW50UmVzdWx0LnN0YXR1cyksXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6XG4gICAgICAgICAgICAgICAgICAgIGFnZW50UmVzdWx0LnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRCA/IDAgOiAxLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogYWdlbnRSZXN1bHQub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoYWdlbnRSZXN1bHQub3V0cHV0LCBudWxsLCAyKVxuICAgICAgICAgICAgICAgICAgICA6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBhZ2VudFJlc3VsdC5lcnJvciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhZ2VudFJlc3VsdC5leGVjdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lOiBhZ2VudFJlc3VsdC5lbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBhZ2VudFJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayAke3Rhc2suaWR9IGNvbXBsZXRlZCB3aXRoIHN0YXR1czogJHtyZXN1bHQuc3RhdHVzfWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCI7XG5cbiAgICAgICAgICAgIHRoaXMubG9nKGBBZ2VudCB0YXNrICR7dGFzay5pZH0gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGU6IC0xLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogXCJcIixcbiAgICAgICAgICAgICAgICBzdGRlcnI6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZW5kVGltZS5nZXRUaW1lKCkgLSBzdGFydFRpbWUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBhZ2VudCB0YXNrIHN0YXR1cyB0byByZWd1bGFyIHRhc2sgc3RhdHVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRTdGF0dXM6IEFnZW50VGFza1N0YXR1cyk6IFRhc2tTdGF0dXMge1xuICAgICAgICBzd2l0Y2ggKGFnZW50U3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuQ09NUExFVEVEO1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuRkFJTEVEOlxuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuVElNRU9VVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICBjYXNlIEFnZW50VGFza1N0YXR1cy5TS0lQUEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLlNLSVBQRUQ7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkZBSUxFRDsgLy8gU2hvdWxkIG5vdCBoYXBwZW4gaW4gZmluYWwgcmVzdWx0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIG11bHRpcGxlIGFnZW50IHRhc2tzIHdpdGggY29vcmRpbmF0aW9uXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVBZ2VudFRhc2tzKFxuICAgICAgICB0YXNrczogQWdlbnRUYXNrW10sXG4gICAgICAgIHN0cmF0ZWd5OiBBZ2dyZWdhdGlvblN0cmF0ZWd5ID0geyB0eXBlOiBcInNlcXVlbnRpYWxcIiB9LFxuICAgICk6IFByb21pc2U8VGFza1Jlc3VsdFtdPiB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZ2VudCBjb29yZGluYXRvciBub3Qgc2V0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICBgRXhlY3V0aW5nICR7dGFza3MubGVuZ3RofSBhZ2VudCB0YXNrcyB3aXRoIHN0cmF0ZWd5OiAke3N0cmF0ZWd5LnR5cGV9YCxcbiAgICAgICAgKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBhZ2VudCB0YXNrcyB1c2luZyBjb29yZGluYXRvclxuICAgICAgICAgICAgY29uc3QgYWdlbnRSZXN1bHRzID0gYXdhaXQgdGhpcy5hZ2VudENvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrcyhcbiAgICAgICAgICAgICAgICB0YXNrcyxcbiAgICAgICAgICAgICAgICBzdHJhdGVneSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gdGFzayByZXN1bHRzXG4gICAgICAgICAgICBjb25zdCB0YXNrUmVzdWx0czogVGFza1Jlc3VsdFtdID0gYWdlbnRSZXN1bHRzLm1hcChcbiAgICAgICAgICAgICAgICAoYWdlbnRSZXN1bHQpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBhZ2VudFJlc3VsdC5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLmNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFJlc3VsdC5zdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgICBleGl0Q29kZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50UmVzdWx0LnN0YXR1cyA9PT0gQWdlbnRUYXNrU3RhdHVzLkNPTVBMRVRFRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBhZ2VudFJlc3VsdC5vdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoYWdlbnRSZXN1bHQub3V0cHV0LCBudWxsLCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6IGFnZW50UmVzdWx0LmVycm9yIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhZ2VudFJlc3VsdC5leGVjdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IGFnZW50UmVzdWx0LnN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogYWdlbnRSZXN1bHQuZW5kVGltZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGFnZW50UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gU3RvcmUgcmVzdWx0c1xuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgdGFza1Jlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldChyZXN1bHQuaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0YXNrUmVzdWx0cztcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgICAgIGBBZ2VudCB0YXNrIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFnZW50IGV4ZWN1dGlvbiBwcm9ncmVzc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBZ2VudFByb2dyZXNzKCk6IGFueSB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZ2V0UHJvZ3Jlc3MoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWdlbnQgZXhlY3V0aW9uIG1ldHJpY3NcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRNZXRyaWNzKCk6IE1hcDxBZ2VudFR5cGUsIGFueT4gfCBudWxsIHtcbiAgICAgICAgaWYgKCF0aGlzLmFnZW50Q29vcmRpbmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWdlbnRDb29yZGluYXRvci5nZXRNZXRyaWNzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtUYXNrRXhlY3V0b3JdICR7bWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7QUFLQTtBQW1CTyxNQUFNLGFBQWE7QUFBQSxFQUNkO0FBQUEsRUFDQSxjQUF1QyxJQUFJO0FBQUEsRUFDM0MsZUFBNEIsSUFBSTtBQUFBLEVBQ2hDO0FBQUEsRUFFUixXQUFXLENBQUMsVUFBNEIsQ0FBQyxHQUFHO0FBQUEsSUFDeEMsS0FBSyxVQUFVO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixpQkFBaUI7QUFBQSxNQUNqQixnQkFBZ0I7QUFBQSxNQUNoQixTQUFTO0FBQUEsU0FDTjtBQUFBLElBQ1A7QUFBQTtBQUFBLEVBTUcsbUJBQW1CLENBQUMsYUFBcUM7QUFBQSxJQUM1RCxLQUFLLG1CQUFtQjtBQUFBO0FBQUEsT0FNZixZQUFXLENBQUMsTUFBbUM7QUFBQSxJQUN4RCxLQUFLLFlBQVksTUFBTTtBQUFBLElBQ3ZCLEtBQUssYUFBYSxNQUFNO0FBQUEsSUFFeEIsTUFBTSxpQkFBaUIsS0FBSyxzQkFBc0IsS0FBSyxLQUFLO0FBQUEsSUFDNUQsTUFBTSxVQUF3QixDQUFDO0FBQUEsSUFFL0IsV0FBVyxRQUFRLGdCQUFnQjtBQUFBLE1BQy9CLE1BQU0sU0FBUyxNQUFNLEtBQUssWUFBWSxJQUFJO0FBQUEsTUFDMUMsS0FBSyxZQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNwQyxRQUFRLEtBQUssTUFBTTtBQUFBLE1BR25CLElBQ0ksT0FBTyxvQ0FDUCxDQUFDLEtBQUssUUFBUSxpQkFDaEI7QUFBQSxRQUNFLEtBQUssSUFBSSwyQ0FBMkMsS0FBSyxJQUFJO0FBQUEsUUFDN0Q7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsT0FNRSxZQUFXLENBQUMsTUFBMkM7QUFBQSxJQUNoRSxJQUFJLEtBQUssYUFBYSxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQUEsTUFDaEMsTUFBTSxJQUFJLE1BQU0sUUFBUSxLQUFLLHVCQUF1QjtBQUFBLElBQ3hEO0FBQUEsSUFFQSxLQUFLLGFBQWEsSUFBSSxLQUFLLEVBQUU7QUFBQSxJQUM3QixNQUFNLFlBQVksSUFBSTtBQUFBLElBRXRCLElBQUk7QUFBQSxNQUNBLEtBQUssSUFBSSxtQkFBbUIsS0FBSyxPQUFPLEtBQUssT0FBTztBQUFBLE1BR3BELE1BQU0sbUJBQW1CLEtBQUssa0JBQWtCLElBQUk7QUFBQSxNQUNwRCxJQUFJLENBQUMsaUJBQWlCLFNBQVM7QUFBQSxRQUMzQixNQUFNLFVBQXFCO0FBQUEsVUFDdkIsSUFBSSxLQUFLO0FBQUEsVUFDVDtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFVBQ1IsUUFDSSxpQkFBaUIsU0FBUztBQUFBLFVBQzlCLFVBQVU7QUFBQSxVQUNWO0FBQUEsVUFDQSxTQUFTLElBQUk7QUFBQSxVQUNiLE9BQU8saUJBQWlCO0FBQUEsUUFDNUI7QUFBQSxRQUNBLEtBQUssWUFBWSxJQUFJLEtBQUssSUFBSSxPQUFNO0FBQUEsUUFDcEMsT0FBTztBQUFBLE1BQ1g7QUFBQSxNQUdBLElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxRQUNyQixLQUFLLElBQUksNEJBQTRCLEtBQUssU0FBUztBQUFBLFFBQ25ELE1BQU0sVUFBcUI7QUFBQSxVQUN2QixJQUFJLEtBQUs7QUFBQSxVQUNUO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVixRQUFRLHNCQUFzQixLQUFLO0FBQUEsVUFDbkMsUUFBUTtBQUFBLFVBQ1IsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBLFNBQVMsSUFBSTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxLQUFLLFlBQVksSUFBSSxLQUFLLElBQUksT0FBTTtBQUFBLFFBQ3BDLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFHQSxJQUFJLEtBQUssWUFBWSxJQUFJLEdBQUc7QUFBQSxRQUN4QixPQUFPLE1BQU0sS0FBSyxpQkFDZCxNQUNBLFNBQ0o7QUFBQSxNQUNKO0FBQUEsTUFHQSxNQUFNLFNBQVMsTUFBTSxLQUFLLGlCQUFpQixJQUFJO0FBQUEsTUFDL0MsS0FBSyxZQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNwQyxLQUFLLElBQUksUUFBUSxLQUFLLDZCQUE2QixPQUFPLFFBQVE7QUFBQSxNQUVsRSxPQUFPO0FBQUEsTUFDVCxPQUFPLE9BQU87QUFBQSxNQUNaLE1BQU0sVUFBVSxJQUFJO0FBQUEsTUFDcEIsTUFBTSxlQUNGLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUFBLE1BRTdDLEtBQUssSUFBSSxRQUFRLEtBQUssY0FBYyxjQUFjO0FBQUEsTUFFbEQsTUFBTSxTQUFxQjtBQUFBLFFBQ3ZCLElBQUksS0FBSztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFVBQVUsUUFBUSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQUEsUUFDaEQ7QUFBQSxRQUNBO0FBQUEsUUFDQSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BRUEsT0FBTztBQUFBLGNBQ1Q7QUFBQSxNQUNFLEtBQUssYUFBYSxPQUFPLEtBQUssRUFBRTtBQUFBO0FBQUE7QUFBQSxFQU9qQyxhQUFhLENBQUMsUUFBd0M7QUFBQSxJQUN6RCxPQUFPLEtBQUssWUFBWSxJQUFJLE1BQU07QUFBQTtBQUFBLEVBTS9CLGFBQWEsR0FBaUI7QUFBQSxJQUNqQyxPQUFPLE1BQU0sS0FBSyxLQUFLLFlBQVksT0FBTyxDQUFDO0FBQUE7QUFBQSxFQU14QyxZQUFZLEdBQVM7QUFBQSxJQUN4QixLQUFLLFlBQVksTUFBTTtBQUFBO0FBQUEsRUFHbkIscUJBQXFCLENBQUMsT0FBMkM7QUFBQSxJQUNyRSxNQUFNLFVBQVUsSUFBSTtBQUFBLElBQ3BCLE1BQU0sV0FBVyxJQUFJO0FBQUEsSUFDckIsTUFBTSxTQUEyQixDQUFDO0FBQUEsSUFDbEMsTUFBTSxVQUFVLElBQUksSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQUEsSUFFbkQsTUFBTSxRQUFRLENBQUMsV0FBeUI7QUFBQSxNQUNwQyxJQUFJLFNBQVMsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUN0QixNQUFNLElBQUksTUFDTixnREFBZ0QsUUFDcEQ7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUNyQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLFNBQVMsSUFBSSxNQUFNO0FBQUEsTUFFbkIsTUFBTSxPQUFPLFFBQVEsSUFBSSxNQUFNO0FBQUEsTUFDL0IsSUFBSSxNQUFNLFdBQVc7QUFBQSxRQUNqQixXQUFXLFNBQVMsS0FBSyxXQUFXO0FBQUEsVUFDaEMsTUFBTSxLQUFLO0FBQUEsUUFDZjtBQUFBLE1BQ0o7QUFBQSxNQUVBLFNBQVMsT0FBTyxNQUFNO0FBQUEsTUFDdEIsUUFBUSxJQUFJLE1BQU07QUFBQSxNQUVsQixJQUFJLE1BQU07QUFBQSxRQUNOLE9BQU8sS0FBSyxJQUFJO0FBQUEsTUFDcEI7QUFBQTtBQUFBLElBR0osV0FBVyxRQUFRLE9BQU87QUFBQSxNQUN0QixJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQUEsUUFDdkIsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLEVBR0gsaUJBQWlCLENBQUMsTUFHeEI7QUFBQSxJQUNFLElBQUksQ0FBQyxLQUFLLGFBQWEsS0FBSyxVQUFVLFdBQVcsR0FBRztBQUFBLE1BQ2hELE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFBQSxJQUMzQjtBQUFBLElBRUEsV0FBVyxTQUFTLEtBQUssV0FBVztBQUFBLE1BQ2hDLE1BQU0sWUFBWSxLQUFLLFlBQVksSUFBSSxLQUFLO0FBQUEsTUFFNUMsSUFBSSxDQUFDLFdBQVc7QUFBQSxRQUNaLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYztBQUFBLFFBQ3pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxVQUFVLGtDQUE4QjtBQUFBLFFBQ3hDLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYywrQkFBK0IsVUFBVTtBQUFBLFFBQ2xFO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxVQUFVLHdDQUFpQztBQUFBLFFBQzNDLE9BQU87QUFBQSxVQUNILFNBQVM7QUFBQSxVQUNULE9BQU8sY0FBYyxvQ0FBb0MsVUFBVTtBQUFBLFFBQ3ZFO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFBQTtBQUFBLE9BR2IsaUJBQWdCLENBQUMsTUFBMkM7QUFBQSxJQUd0RSxJQUFJLEtBQUssWUFBWSxJQUFJLEdBQUc7QUFBQSxNQUN4QixNQUFNLElBQUksTUFDTiwwREFBMEQsS0FBSyxJQUNuRTtBQUFBLElBQ0o7QUFBQSxJQUVBLE1BQU0sWUFBWTtBQUFBLElBQ2xCLE1BQU0sY0FBYyxVQUFVLE9BQU8sZUFBZTtBQUFBLElBQ3BELE1BQU0sWUFBWSxVQUFVLE9BQU8sU0FBUztBQUFBLElBQzVDLE1BQU0sb0JBQW9CLFVBQVUsT0FBTyxxQkFBcUI7QUFBQSxJQUVoRSxJQUFJLGFBQWdDO0FBQUEsSUFFcEMsU0FBUyxVQUFVLEVBQUcsV0FBVyxhQUFhLFdBQVc7QUFBQSxNQUNyRCxJQUFJLFVBQVUsR0FBRztBQUFBLFFBQ2IsTUFBTSxRQUFRLFlBQVksc0JBQXNCLFVBQVU7QUFBQSxRQUMxRCxLQUFLLElBQ0QsaUJBQWlCLFVBQVUsU0FBUyxtQkFBbUIsV0FBVyxjQUN0RTtBQUFBLFFBQ0EsTUFBTSxLQUFLLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDakM7QUFBQSxNQUVBLE1BQU0sU0FBUyxNQUFNLEtBQUssZUFBZSxTQUFTO0FBQUEsTUFFbEQsSUFBSSxPQUFPLHdDQUFpQztBQUFBLFFBQ3hDLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFFQSxhQUFhO0FBQUEsTUFFYixJQUFJLFVBQVUsYUFBYTtBQUFBLFFBQ3ZCLEtBQUssSUFDRCxRQUFRLEtBQUssc0JBQXNCLFdBQVcsaUJBQWlCLE9BQU8sVUFBVSxPQUFPLE9BQzNGO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLE9BR0csZUFBYyxDQUFDLE1BQTJDO0FBQUEsSUFFcEUsSUFBSSxLQUFLLFlBQVksSUFBSSxHQUFHO0FBQUEsTUFDeEIsTUFBTSxJQUFJLE1BQ04sd0RBQXdELEtBQUssSUFDakU7QUFBQSxJQUNKO0FBQUEsSUFFQSxNQUFNLFlBQVk7QUFBQSxJQUVsQixPQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFBQSxNQUM1QixNQUFNLFlBQVksSUFBSTtBQUFBLE1BQ3RCLE1BQU0sVUFBVSxVQUFVLFVBQ3BCLFVBQVUsVUFBVSxPQUNwQjtBQUFBLE1BRU4sS0FBSyxJQUFJLHNCQUFzQixVQUFVLFNBQVM7QUFBQSxNQUVsRCxNQUFNLFFBQVEsTUFBTSxVQUFVLFNBQVMsQ0FBQyxHQUFHO0FBQUEsUUFDdkMsT0FBTztBQUFBLFFBQ1AsVUFBVTtBQUFBLFFBQ1YsS0FDSSxVQUFVLG9CQUFvQixLQUFLLFFBQVE7QUFBQSxRQUMvQyxLQUFLO0FBQUEsYUFDRSxRQUFRO0FBQUEsYUFDUixLQUFLLFFBQVE7QUFBQSxhQUNiLFVBQVU7QUFBQSxRQUNqQjtBQUFBLE1BQ0osQ0FBQztBQUFBLE1BRUQsSUFBSSxTQUFTO0FBQUEsTUFDYixJQUFJLFNBQVM7QUFBQSxNQUViLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFpQjtBQUFBLFFBQ3ZDLE1BQU0sUUFBUSxLQUFLLFNBQVM7QUFBQSxRQUM1QixVQUFVO0FBQUEsUUFDVixJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsVUFDdEIsUUFBUSxPQUFPLE1BQU0sS0FBSztBQUFBLFFBQzlCO0FBQUEsT0FDSDtBQUFBLE1BRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQWlCO0FBQUEsUUFDdkMsTUFBTSxRQUFRLEtBQUssU0FBUztBQUFBLFFBQzVCLFVBQVU7QUFBQSxRQUNWLElBQUksS0FBSyxRQUFRLFNBQVM7QUFBQSxVQUN0QixRQUFRLE9BQU8sTUFBTSxLQUFLO0FBQUEsUUFDOUI7QUFBQSxPQUNIO0FBQUEsTUFFRCxNQUFNLFlBQVksV0FBVyxNQUFNO0FBQUEsUUFDL0IsS0FBSyxJQUNELFFBQVEsVUFBVSxzQkFBc0IsVUFBVSxPQUN0RDtBQUFBLFFBRUEsSUFBSSxNQUFNLEtBQUs7QUFBQSxVQUNYLElBQUksUUFBUSxhQUFhLFNBQVM7QUFBQSxZQUU5QixJQUFJO0FBQUEsY0FDQSxNQUFNLFNBQVMsVUFDWCxZQUNBLENBQUMsUUFBUSxNQUFNLElBQUksU0FBUyxHQUFHLE1BQU0sSUFBSSxHQUN6QyxFQUFFLGFBQWEsTUFBTSxPQUFPLFNBQVMsQ0FDekM7QUFBQSxjQUVBLElBQUksT0FBTyxTQUFTLE9BQU8sV0FBVyxHQUFHO0FBQUEsZ0JBQ3JDLElBQUk7QUFBQSxrQkFDQSxNQUFNLEtBQUssU0FBUztBQUFBLGtCQUN0QixNQUFNO0FBQUEsY0FHWjtBQUFBLGNBQ0YsTUFBTTtBQUFBLGNBRUosSUFBSTtBQUFBLGdCQUNBLE1BQU0sS0FBSyxTQUFTO0FBQUEsZ0JBQ3RCLE1BQU07QUFBQTtBQUFBLFVBSWhCLEVBQU87QUFBQSxZQUVILElBQUk7QUFBQSxjQUNBLFFBQVEsS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTO0FBQUEsY0FDcEMsTUFBTTtBQUFBLGNBRUosSUFBSTtBQUFBLGdCQUNBLE1BQU0sS0FBSyxTQUFTO0FBQUEsZ0JBQ3RCLE1BQU07QUFBQTtBQUFBO0FBQUEsUUFLcEI7QUFBQSxTQUNELE9BQU87QUFBQSxNQUVWLE1BQU0sR0FDRixTQUNBLENBQUMsTUFBcUIsV0FBa0M7QUFBQSxRQUNwRCxhQUFhLFNBQVM7QUFBQSxRQUN0QixNQUFNLFVBQVUsSUFBSTtBQUFBLFFBQ3BCLE1BQU0sV0FBVyxRQUFRLFFBQVEsSUFBSSxVQUFVLFFBQVE7QUFBQSxRQUV2RCxNQUFNLFNBQXFCO0FBQUEsVUFDdkIsSUFBSSxVQUFVO0FBQUEsVUFDZCxRQUNJLFNBQVM7QUFBQSxVQUdiLFVBQVUsU0FBUyxTQUFTLEtBQUs7QUFBQSxVQUNqQztBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLE9BQU8sU0FDRCxpQ0FBaUMsV0FDakM7QUFBQSxRQUNWO0FBQUEsUUFFQSxRQUFRLE1BQU07QUFBQSxPQUV0QjtBQUFBLE1BRUEsTUFBTSxHQUFHLFNBQVMsQ0FBQyxVQUFpQjtBQUFBLFFBQ2hDLGFBQWEsU0FBUztBQUFBLFFBQ3RCLE1BQU0sVUFBVSxJQUFJO0FBQUEsUUFDcEIsTUFBTSxXQUFXLFFBQVEsUUFBUSxJQUFJLFVBQVUsUUFBUTtBQUFBLFFBRXZELE1BQU0sU0FBcUI7QUFBQSxVQUN2QixJQUFJLFVBQVU7QUFBQSxVQUNkO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLE9BQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFFQSxRQUFRLE1BQU07QUFBQSxPQUNqQjtBQUFBLEtBQ0o7QUFBQTtBQUFBLEVBR0csS0FBSyxDQUFDLElBQTJCO0FBQUEsSUFDckMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFBQTtBQUFBLEVBTW5ELFdBQVcsQ0FBQyxNQUF5QztBQUFBLElBQ3pELE9BQU8sVUFBVSxRQUFRLFdBQVcsUUFBUSxjQUFjO0FBQUE7QUFBQSxPQU1oRCxpQkFBZ0IsQ0FDMUIsTUFDQSxXQUNtQjtBQUFBLElBQ25CLElBQUksQ0FBQyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3hCLE1BQU0sSUFBSSxNQUNOLHlEQUF5RCxLQUFLLElBQ2xFO0FBQUEsSUFDSjtBQUFBLElBRUEsSUFBSTtBQUFBLE1BQ0EsS0FBSyxJQUFJLHlCQUF5QixLQUFLLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFPMUQsTUFBTSxrQkFBNkI7QUFBQSxXQUM1QjtBQUFBLFFBQ0gsV0FBVztBQUFBLE1BQ2Y7QUFBQSxNQUNBLE1BQU0sY0FDRixNQUFNLEtBQUssaUJBQWlCLFlBQVksZUFBZTtBQUFBLE1BRzNELE1BQU0sU0FBcUI7QUFBQSxRQUN2QixJQUFJLEtBQUs7QUFBQSxRQUNULFFBQVEsS0FBSyxtQkFBbUIsWUFBWSxNQUFNO0FBQUEsUUFDbEQsVUFDSSxZQUFZLHlDQUF1QyxJQUFJO0FBQUEsUUFDM0QsUUFBUSxZQUFZLFNBQ2QsS0FBSyxVQUFVLFlBQVksUUFBUSxNQUFNLENBQUMsSUFDMUM7QUFBQSxRQUNOLFFBQVEsWUFBWSxTQUFTO0FBQUEsUUFDN0IsVUFBVSxZQUFZO0FBQUEsUUFDdEI7QUFBQSxRQUNBLFNBQVMsWUFBWTtBQUFBLFFBQ3JCLE9BQU8sWUFBWTtBQUFBLE1BQ3ZCO0FBQUEsTUFFQSxLQUFLLFlBQVksSUFBSSxLQUFLLElBQUksTUFBTTtBQUFBLE1BQ3BDLEtBQUssSUFDRCxjQUFjLEtBQUssNkJBQTZCLE9BQU8sUUFDM0Q7QUFBQSxNQUVBLE9BQU87QUFBQSxNQUNULE9BQU8sT0FBTztBQUFBLE1BQ1osTUFBTSxVQUFVLElBQUk7QUFBQSxNQUNwQixNQUFNLGVBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQUEsTUFFN0MsS0FBSyxJQUFJLGNBQWMsS0FBSyxjQUFjLGNBQWM7QUFBQSxNQUV4RCxNQUFNLFNBQXFCO0FBQUEsUUFDdkIsSUFBSSxLQUFLO0FBQUEsUUFDVDtBQUFBLFFBQ0EsVUFBVTtBQUFBLFFBQ1YsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsVUFBVSxRQUFRLFFBQVEsSUFBSSxVQUFVLFFBQVE7QUFBQSxRQUNoRDtBQUFBLFFBQ0E7QUFBQSxRQUNBLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFFQSxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBT1Asa0JBQWtCLENBQUMsYUFBMEM7QUFBQSxJQUNqRSxRQUFRO0FBQUE7QUFBQSxRQUVBO0FBQUE7QUFBQTtBQUFBLFFBR0E7QUFBQTtBQUFBLFFBRUE7QUFBQTtBQUFBLFFBRUE7QUFBQTtBQUFBO0FBQUEsT0FPQyxrQkFBaUIsQ0FDMUIsT0FDQSxXQUFnQyxFQUFFLE1BQU0sYUFBYSxHQUNoQztBQUFBLElBQ3JCLElBQUksQ0FBQyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3hCLE1BQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUFBLElBQy9DO0FBQUEsSUFFQSxLQUFLLElBQ0QsYUFBYSxNQUFNLHFDQUFxQyxTQUFTLE1BQ3JFO0FBQUEsSUFFQSxJQUFJO0FBQUEsTUFFQSxNQUFNLGVBQWUsTUFBTSxLQUFLLGlCQUFpQixhQUM3QyxPQUNBLFFBQ0o7QUFBQSxNQUdBLE1BQU0sY0FBNEIsYUFBYSxJQUMzQyxDQUFDLGlCQUFpQjtBQUFBLFFBQ2QsSUFBSSxZQUFZO0FBQUEsUUFDaEIsUUFBUSxLQUFLLG1CQUFtQixZQUFZLE1BQU07QUFBQSxRQUNsRCxVQUNJLFlBQVkseUNBQ04sSUFDQTtBQUFBLFFBQ1YsUUFBUSxZQUFZLFNBQ2QsS0FBSyxVQUFVLFlBQVksUUFBUSxNQUFNLENBQUMsSUFDMUM7QUFBQSxRQUNOLFFBQVEsWUFBWSxTQUFTO0FBQUEsUUFDN0IsVUFBVSxZQUFZO0FBQUEsUUFDdEIsV0FBVyxZQUFZO0FBQUEsUUFDdkIsU0FBUyxZQUFZO0FBQUEsUUFDckIsT0FBTyxZQUFZO0FBQUEsTUFDdkIsRUFDSjtBQUFBLE1BR0EsV0FBVyxVQUFVLGFBQWE7QUFBQSxRQUM5QixLQUFLLFlBQVksSUFBSSxPQUFPLElBQUksTUFBTTtBQUFBLE1BQzFDO0FBQUEsTUFFQSxPQUFPO0FBQUEsTUFDVCxPQUFPLE9BQU87QUFBQSxNQUNaLEtBQUssSUFDRCxnQ0FBZ0MsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLGlCQUM3RTtBQUFBLE1BQ0EsTUFBTTtBQUFBO0FBQUE7QUFBQSxFQU9QLGdCQUFnQixHQUFRO0FBQUEsSUFDM0IsSUFBSSxDQUFDLEtBQUssa0JBQWtCO0FBQUEsTUFDeEIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUVBLE9BQU8sS0FBSyxpQkFBaUIsWUFBWTtBQUFBO0FBQUEsRUFNdEMsZUFBZSxHQUErQjtBQUFBLElBQ2pELElBQUksQ0FBQyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3hCLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLEtBQUssaUJBQWlCLFdBQVc7QUFBQTtBQUFBLEVBR3BDLEdBQUcsQ0FBQyxTQUF1QjtBQUFBLElBQy9CLElBQUksS0FBSyxRQUFRLFNBQVM7QUFBQSxNQUN0QixRQUFRLElBQUksa0JBQWtCLFNBQVM7QUFBQSxJQUMzQztBQUFBO0FBRVI7IiwKICAiZGVidWdJZCI6ICIzQUNDMjg2NkYyNTdGNEM2NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
