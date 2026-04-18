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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi90YXNrLWV4ZWN1dG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogVGFzayBleGVjdXRvciBmb3IgdGhlIEFJIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEhhbmRsZXMgdGFzayBleGVjdXRpb24sIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiwgYW5kIHJlc3VsdCB0cmFja2luZy5cbiAqL1xuXG5pbXBvcnQgeyBzcGF3biwgc3Bhd25TeW5jIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcIm5vZGU6dXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBBZ2VudENvb3JkaW5hdG9yIH0gZnJvbSBcIi4uL2FnZW50cy9jb29yZGluYXRvclwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFnZW50VGFzayxcbiAgICBBZ2VudFRhc2tSZXN1bHQsXG4gICAgQWdlbnRUYXNrU3RhdHVzLFxuICAgIHR5cGUgQWdlbnRUeXBlLFxuICAgIHR5cGUgQWdncmVnYXRpb25TdHJhdGVneSxcbn0gZnJvbSBcIi4uL2FnZW50cy90eXBlc1wiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEV4ZWN1dGFibGVUYXNrLFxuICAgIHR5cGUgRXhlY3V0aW9uT3B0aW9ucyxcbiAgICB0eXBlIFBsYW4sXG4gICAgdHlwZSBUYXNrLFxuICAgIHR5cGUgVGFza1Jlc3VsdCxcbiAgICBUYXNrU3RhdHVzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgVGFza0V4ZWN1dG9yIHtcbiAgICBwcml2YXRlIG9wdGlvbnM6IEV4ZWN1dGlvbk9wdGlvbnM7XG4gICAgcHJpdmF0ZSB0YXNrUmVzdWx0czogTWFwPHN0cmluZywgVGFza1Jlc3VsdD4gPSBuZXcgTWFwKCk7XG4gICAgcHJpdmF0ZSBydW5uaW5nVGFza3M6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICAgIHByaXZhdGUgYWdlbnRDb29yZGluYXRvcj86IEFnZW50Q29vcmRpbmF0b3I7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBFeGVjdXRpb25PcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgZHJ5UnVuOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRpbnVlT25FcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBtYXhDb25jdXJyZW5jeTogMSxcbiAgICAgICAgICAgIHZlcmJvc2U6IGZhbHNlLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYWdlbnQgY29vcmRpbmF0b3IgZm9yIGV4ZWN1dGluZyBhZ2VudCB0YXNrc1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBZ2VudENvb3JkaW5hdG9yKGNvb3JkaW5hdG9yOiBBZ2VudENvb3JkaW5hdG9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWdlbnRDb29yZGluYXRvciA9IGNvb3JkaW5hdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIHRhc2tzIGluIGEgcGxhbiB3aXRoIGRlcGVuZGVuY3kgcmVzb2x1dGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlUGxhbihwbGFuOiBQbGFuKTogUHJvbWlzZTxUYXNrUmVzdWx0W10+IHtcbiAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5jbGVhcigpO1xuICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5jbGVhcigpO1xuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGlvbk9yZGVyID0gdGhpcy5yZXNvbHZlRXhlY3V0aW9uT3JkZXIocGxhbi50YXNrcyk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBleGVjdXRpb25PcmRlcikge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlVGFzayh0YXNrKTtcbiAgICAgICAgICAgIHRoaXMudGFza1Jlc3VsdHMuc2V0KHRhc2suaWQsIHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gU3RvcCBleGVjdXRpb24gaWYgdGFzayBmYWlsZWQgYW5kIGNvbnRpbnVlT25FcnJvciBpcyBmYWxzZVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHJlc3VsdC5zdGF0dXMgPT09IFRhc2tTdGF0dXMuRkFJTEVEICYmXG4gICAgICAgICAgICAgICAgIXRoaXMub3B0aW9ucy5jb250aW51ZU9uRXJyb3JcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBTdG9wcGluZyBleGVjdXRpb24gZHVlIHRvIHRhc2sgZmFpbHVyZTogJHt0YXNrLmlkfWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIHNpbmdsZSB0YXNrXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV4ZWN1dGVUYXNrKHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmdUYXNrcy5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFzayAke3Rhc2suaWR9IGlzIGFscmVhZHkgcnVubmluZ2ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ydW5uaW5nVGFza3MuYWRkKHRhc2suaWQpO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay5uYW1lfSlgKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5UmVzdWx0ID0gdGhpcy5jaGVja0RlcGVuZGVuY2llcyh0YXNrKTtcbiAgICAgICAgICAgIGlmICghZGVwZW5kZW5jeVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLlNLSVBQRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmN5UmVzdWx0LmVycm9yID8/IFwiVW5rbm93biBkZXBlbmRlbmN5IGVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkZXBlbmRlbmN5UmVzdWx0LmVycm9yLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIYW5kbGUgZHJ5IHJ1biBtb2RlXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyeVJ1bikge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGBbRFJZIFJVTl0gV291bGQgZXhlY3V0ZTogJHt0YXNrLmNvbW1hbmR9YCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBUYXNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkNPTVBMRVRFRCxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYFtEUlkgUlVOXSBDb21tYW5kOiAke3Rhc2suY29tbWFuZH1gLFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gYWdlbnQgdGFza1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjdXRlQWdlbnRUYXNrKFxuICAgICAgICAgICAgICAgICAgICB0YXNrIGFzIEFnZW50VGFzayxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIHRhc2sgd2l0aCByZXRyeSBsb2dpY1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlV2l0aFJldHJ5KHRhc2spO1xuICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQodGFzay5pZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMubG9nKGBUYXNrICR7dGFzay5pZH0gY29tcGxldGVkIHdpdGggc3RhdHVzOiAke3Jlc3VsdC5zdGF0dXN9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIjtcblxuICAgICAgICAgICAgdGhpcy5sb2coYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBUYXNrU3RhdHVzLkZBSUxFRCxcbiAgICAgICAgICAgICAgICBleGl0Q29kZTogLTEsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmdUYXNrcy5kZWxldGUodGFzay5pZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHJlc3VsdCBvZiBhIHByZXZpb3VzbHkgZXhlY3V0ZWQgdGFza1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUYXNrUmVzdWx0KHRhc2tJZDogc3RyaW5nKTogVGFza1Jlc3VsdCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSZXN1bHRzLmdldCh0YXNrSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdGFzayByZXN1bHRzXG4gICAgICovXG4gICAgcHVibGljIGdldEFsbFJlc3VsdHMoKTogVGFza1Jlc3VsdFtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy50YXNrUmVzdWx0cy52YWx1ZXMoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIHRhc2sgcmVzdWx0c1xuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhclJlc3VsdHMoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudGFza1Jlc3VsdHMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc29sdmVFeGVjdXRpb25PcmRlcih0YXNrczogRXhlY3V0YWJsZVRhc2tbXSk6IEV4ZWN1dGFibGVUYXNrW10ge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHZpc2l0aW5nID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHNvcnRlZDogRXhlY3V0YWJsZVRhc2tbXSA9IFtdO1xuICAgICAgICBjb25zdCB0YXNrTWFwID0gbmV3IE1hcCh0YXNrcy5tYXAoKHQpID0+IFt0LmlkLCB0XSkpO1xuXG4gICAgICAgIGNvbnN0IHZpc2l0ID0gKHRhc2tJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAodmlzaXRpbmcuaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIGludm9sdmluZyB0YXNrOiAke3Rhc2tJZH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2aXNpdGVkLmhhcyh0YXNrSWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5hZGQodGFza0lkKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRhc2tNYXAuZ2V0KHRhc2tJZCk7XG4gICAgICAgICAgICBpZiAodGFzaz8uZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgICAgICB2aXNpdChkZXBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2aXNpdGluZy5kZWxldGUodGFza0lkKTtcbiAgICAgICAgICAgIHZpc2l0ZWQuYWRkKHRhc2tJZCk7XG5cbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc29ydGVkLnB1c2godGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgdmlzaXQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc29ydGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tEZXBlbmRlbmNpZXModGFzazogRXhlY3V0YWJsZVRhc2spOiB7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgIH0ge1xuICAgICAgICBpZiAoIXRhc2suZGVwZW5kc09uIHx8IHRhc2suZGVwZW5kc09uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgY29uc3QgZGVwUmVzdWx0ID0gdGhpcy50YXNrUmVzdWx0cy5nZXQoZGVwSWQpO1xuXG4gICAgICAgICAgICBpZiAoIWRlcFJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBiZWVuIGV4ZWN1dGVkYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwUmVzdWx0LnN0YXR1cyA9PT0gVGFza1N0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBEZXBlbmRlbmN5ICR7ZGVwSWR9IGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2RlcFJlc3VsdC5leGl0Q29kZX1gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXBSZXN1bHQuc3RhdHVzICE9PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYERlcGVuZGVuY3kgJHtkZXBJZH0gaGFzIG5vdCBjb21wbGV0ZWQgKHN0YXR1czogJHtkZXBSZXN1bHQuc3RhdHVzfSlgLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlV2l0aFJldHJ5KHRhc2s6IEV4ZWN1dGFibGVUYXNrKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIC8vIGV4ZWN1dGVXaXRoUmV0cnkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgLy8gQWdlbnRUYXNrcyBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5IGluIGV4ZWN1dGVBZ2VudFRhc2tcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZVdpdGhSZXRyeSBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNoZWxsVGFzayA9IHRhc2sgYXMgVGFzaztcbiAgICAgICAgY29uc3QgbWF4QXR0ZW1wdHMgPSBzaGVsbFRhc2sucmV0cnk/Lm1heEF0dGVtcHRzIHx8IDE7XG4gICAgICAgIGNvbnN0IGJhc2VEZWxheSA9IHNoZWxsVGFzay5yZXRyeT8uZGVsYXkgfHwgMDtcbiAgICAgICAgY29uc3QgYmFja29mZk11bHRpcGxpZXIgPSBzaGVsbFRhc2sucmV0cnk/LmJhY2tvZmZNdWx0aXBsaWVyIHx8IDE7XG5cbiAgICAgICAgbGV0IGxhc3RSZXN1bHQ6IFRhc2tSZXN1bHQgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSBtYXhBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IGJhc2VEZWxheSAqIGJhY2tvZmZNdWx0aXBsaWVyICoqIChhdHRlbXB0IC0gMik7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgICAgIGBSZXRyeWluZyB0YXNrICR7c2hlbGxUYXNrLmlkfSBpbiAke2RlbGF5fXMgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSlgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zbGVlcChkZWxheSAqIDEwMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHNoZWxsVGFzayk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBUYXNrU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RSZXN1bHQgPSByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHt0YXNrLmlkfSBmYWlsZWQgKGF0dGVtcHQgJHthdHRlbXB0fS8ke21heEF0dGVtcHRzfSk6ICR7cmVzdWx0LnN0ZGVyciB8fCByZXN1bHQuZXJyb3J9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhc3RSZXN1bHQhO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUNvbW1hbmQodGFzazogRXhlY3V0YWJsZVRhc2spOiBQcm9taXNlPFRhc2tSZXN1bHQ+IHtcbiAgICAgICAgLy8gZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggcmVndWxhciBUYXNrcywgbm90IEFnZW50VGFza3NcbiAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgZXhlY3V0ZUNvbW1hbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQgd2l0aCBhZ2VudCB0YXNrOiAke3Rhc2suaWR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGVsbFRhc2sgPSB0YXNrIGFzIFRhc2s7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHNoZWxsVGFzay50aW1lb3V0XG4gICAgICAgICAgICAgICAgPyBzaGVsbFRhc2sudGltZW91dCAqIDEwMDBcbiAgICAgICAgICAgICAgICA6IDMwMDAwMDsgLy8gRGVmYXVsdCA1IG1pbnV0ZXNcblxuICAgICAgICAgICAgdGhpcy5sb2coYEV4ZWN1dGluZyBjb21tYW5kOiAke3NoZWxsVGFzay5jb21tYW5kfWApO1xuXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKHNoZWxsVGFzay5jb21tYW5kLCBbXSwge1xuICAgICAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRldGFjaGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN3ZDpcbiAgICAgICAgICAgICAgICAgICAgc2hlbGxUYXNrLndvcmtpbmdEaXJlY3RvcnkgPz8gdGhpcy5vcHRpb25zLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLm9wdGlvbnMuZW52aXJvbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIC4uLnNoZWxsVGFzay5lbnZpcm9ubWVudCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IHN0ZGVyciA9IFwiXCI7XG5cbiAgICAgICAgICAgIGNoaWxkLnN0ZG91dD8ub24oXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBzdGRvdXQgKz0gY2h1bms7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGNodW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY2hpbGQuc3RkZXJyPy5vbihcImRhdGFcIiwgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHN0ZGVyciArPSBjaHVuaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoY2h1bmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgYFRhc2sgJHtzaGVsbFRhc2suaWR9IHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXQgLyAxMDAwfXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLy8gS2lsbCB0aGUgZW50aXJlIHByb2Nlc3MgdHJlZSB0byBlbnN1cmUgY2hpbGQgcHJvY2Vzc2VzIGFyZSB0ZXJtaW5hdGVkXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnBpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBXaW5kb3dzLCB1c2UgdGFza2tpbGwgdG8gdGVybWluYXRlIHRoZSBwcm9jZXNzIHRyZWUgc3luY2hyb25vdXNseVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGFza2tpbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1wiL1BJRFwiLCBjaGlsZC5waWQudG9TdHJpbmcoKSwgXCIvVFwiLCBcIi9GXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHdpbmRvd3NIaWRlOiB0cnVlLCBzdGRpbzogXCJpZ25vcmVcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3Bhd25TeW5jIHdvbid0IHRocm93IG9uIG5vbi16ZXJvIGV4aXQ7IGZhbGwgYmFjayB0byBkaXJlY3Qga2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyBhbHJlYWR5IGV4aXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3Bhd25pbmcgdGFza2tpbGwgaXRzZWxmIGZhaWxlZDsgZmFsbCBiYWNrIHRvIGRpcmVjdCBraWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQua2lsbChcIlNJR0tJTExcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgYWxyZWFkeSBleGl0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbiBQT1NJWCwga2lsbCB0aGUgZW50aXJlIHByb2Nlc3MgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5raWxsKC1jaGlsZC5waWQsIFwiU0lHS0lMTFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgZ3JvdXAgYWxyZWFkeSBleGl0ZWQ7IGZhbGwgYmFjayB0byBkaXJlY3Qga2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoXCJTSUdLSUxMXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIGFscmVhZHkgZXhpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGltZW91dCk7XG5cbiAgICAgICAgICAgIGNoaWxkLm9uKFxuICAgICAgICAgICAgICAgIFwiY2xvc2VcIixcbiAgICAgICAgICAgICAgICAoY29kZTogbnVtYmVyIHwgbnVsbCwgc2lnbmFsOiBOb2RlSlMuU2lnbmFscyB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogc2hlbGxUYXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBUYXNrU3RhdHVzLkNPTVBMRVRFRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6IGNvZGUgfHwgKHNpZ25hbCA/IC0xIDogMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc2lnbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgUHJvY2VzcyB0ZXJtaW5hdGVkIGJ5IHNpZ25hbDogJHtzaWduYWx9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY2hpbGQub24oXCJlcnJvclwiLCAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBlbmRUaW1lLmdldFRpbWUoKSAtIHN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBzaGVsbFRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogVGFza1N0YXR1cy5GQUlMRUQsXG4gICAgICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0LFxuICAgICAgICAgICAgICAgICAgICBzdGRlcnIsXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGVlcChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFzayBpcyBhbiBhZ2VudCB0YXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0FnZW50VGFzayh0YXNrOiBFeGVjdXRhYmxlVGFzayk6IHRhc2sgaXMgQWdlbnRUYXNrIHtcbiAgICAgICAgcmV0dXJuIFwidHlwZVwiIGluIHRhc2sgJiYgXCJpbnB1dFwiIGluIHRhc2sgJiYgXCJzdHJhdGVneVwiIGluIHRhc2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhbiBhZ2VudCB0YXNrIHVzaW5nIHRoZSBhZ2VudCBjb29yZGluYXRvclxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUFnZW50VGFzayhcbiAgICAgICAgdGFzazogQWdlbnRUYXNrLFxuICAgICAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgKTogUHJvbWlzZTxUYXNrUmVzdWx0PiB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEFnZW50IGNvb3JkaW5hdG9yIG5vdCBzZXQuIENhbm5vdCBleGVjdXRlIGFnZW50IHRhc2s6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhgRXhlY3V0aW5nIGFnZW50IHRhc2s6ICR7dGFzay5pZH0gKCR7dGFzay50eXBlfSlgKTtcblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgYWdlbnQgdGFzay5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBOT1RFOiBUYXNrRXhlY3V0b3IgYWxyZWFkeSByZXNvbHZlcyBjcm9zcy10YXNrIGRlcGVuZGVuY2llcyBhY3Jvc3Mgc2hlbGwgKyBhZ2VudCB0YXNrcy5cbiAgICAgICAgICAgIC8vIEFnZW50Q29vcmRpbmF0b3Igb25seSB1bmRlcnN0YW5kcyBhZ2VudC10by1hZ2VudCBkZXBlbmRlbmNpZXMsIHNvIHdlIHN0cmlwIGRlcGVuZHNPblxuICAgICAgICAgICAgLy8gaGVyZSB0byBhdm9pZCBmYWlsaW5nIG1peGVkIHBsYW5zIChhZ2VudCB0YXNrIGRlcGVuZGluZyBvbiBhIHNoZWxsIHRhc2spLlxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0b3JUYXNrOiBBZ2VudFRhc2sgPSB7XG4gICAgICAgICAgICAgICAgLi4udGFzayxcbiAgICAgICAgICAgICAgICBkZXBlbmRzT246IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBhZ2VudFJlc3VsdCA9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hZ2VudENvb3JkaW5hdG9yLmV4ZWN1dGVUYXNrKGNvb3JkaW5hdG9yVGFzayk7XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgYWdlbnQgcmVzdWx0IHRvIHRhc2sgcmVzdWx0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IFRhc2tSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLmNvbnZlcnRBZ2VudFN0YXR1cyhhZ2VudFJlc3VsdC5zdGF0dXMpLFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOlxuICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURUQgPyAwIDogMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IGFnZW50UmVzdWx0Lm91dHB1dFxuICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgOiBcIlwiLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogYWdlbnRSZXN1bHQuZXJyb3IgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZTogYWdlbnRSZXN1bHQuZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYWdlbnRSZXN1bHQuZXJyb3IsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLnRhc2tSZXN1bHRzLnNldCh0YXNrLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgdGhpcy5sb2coXG4gICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgJHt0YXNrLmlkfSBjb21wbGV0ZWQgd2l0aCBzdGF0dXM6ICR7cmVzdWx0LnN0YXR1c31gLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiO1xuXG4gICAgICAgICAgICB0aGlzLmxvZyhgQWdlbnQgdGFzayAke3Rhc2suaWR9IGZhaWxlZDogJHtlcnJvck1lc3NhZ2V9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogVGFza1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogdGFzay5pZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFRhc2tTdGF0dXMuRkFJTEVELFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlOiAtMSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgc3RkZXJyOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGVuZFRpbWUuZ2V0VGltZSgpIC0gc3RhcnRUaW1lLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgZW5kVGltZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYWdlbnQgdGFzayBzdGF0dXMgdG8gcmVndWxhciB0YXNrIHN0YXR1c1xuICAgICAqL1xuICAgIHByaXZhdGUgY29udmVydEFnZW50U3RhdHVzKGFnZW50U3RhdHVzOiBBZ2VudFRhc2tTdGF0dXMpOiBUYXNrU3RhdHVzIHtcbiAgICAgICAgc3dpdGNoIChhZ2VudFN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgIHJldHVybiBUYXNrU3RhdHVzLkNPTVBMRVRFRDtcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgICAgIGNhc2UgQWdlbnRUYXNrU3RhdHVzLlRJTUVPVVQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRhc2tTdGF0dXMuRkFJTEVEO1xuICAgICAgICAgICAgY2FzZSBBZ2VudFRhc2tTdGF0dXMuU0tJUFBFRDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5TS0lQUEVEO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVGFza1N0YXR1cy5GQUlMRUQ7IC8vIFNob3VsZCBub3QgaGFwcGVuIGluIGZpbmFsIHJlc3VsdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBtdWx0aXBsZSBhZ2VudCB0YXNrcyB3aXRoIGNvb3JkaW5hdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBleGVjdXRlQWdlbnRUYXNrcyhcbiAgICAgICAgdGFza3M6IEFnZW50VGFza1tdLFxuICAgICAgICBzdHJhdGVneTogQWdncmVnYXRpb25TdHJhdGVneSA9IHsgdHlwZTogXCJzZXF1ZW50aWFsXCIgfSxcbiAgICApOiBQcm9taXNlPFRhc2tSZXN1bHRbXT4ge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWdlbnQgY29vcmRpbmF0b3Igbm90IHNldFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nKFxuICAgICAgICAgICAgYEV4ZWN1dGluZyAke3Rhc2tzLmxlbmd0aH0gYWdlbnQgdGFza3Mgd2l0aCBzdHJhdGVneTogJHtzdHJhdGVneS50eXBlfWAsXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgYWdlbnQgdGFza3MgdXNpbmcgY29vcmRpbmF0b3JcbiAgICAgICAgICAgIGNvbnN0IGFnZW50UmVzdWx0cyA9IGF3YWl0IHRoaXMuYWdlbnRDb29yZGluYXRvci5leGVjdXRlVGFza3MoXG4gICAgICAgICAgICAgICAgdGFza3MsXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3ksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIHRhc2sgcmVzdWx0c1xuICAgICAgICAgICAgY29uc3QgdGFza1Jlc3VsdHM6IFRhc2tSZXN1bHRbXSA9IGFnZW50UmVzdWx0cy5tYXAoXG4gICAgICAgICAgICAgICAgKGFnZW50UmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICBpZDogYWdlbnRSZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5jb252ZXJ0QWdlbnRTdGF0dXMoYWdlbnRSZXN1bHQuc3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgICAgZXhpdENvZGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2VudFJlc3VsdC5zdGF0dXMgPT09IEFnZW50VGFza1N0YXR1cy5DT01QTEVURURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IDEsXG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dDogYWdlbnRSZXN1bHQub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGFnZW50UmVzdWx0Lm91dHB1dCwgbnVsbCwgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyOiBhZ2VudFJlc3VsdC5lcnJvciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYWdlbnRSZXN1bHQuZXhlY3V0aW9uVGltZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBhZ2VudFJlc3VsdC5zdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IGFnZW50UmVzdWx0LmVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBhZ2VudFJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIHJlc3VsdHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHRhc2tSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXNrUmVzdWx0cy5zZXQocmVzdWx0LmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGFza1Jlc3VsdHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZyhcbiAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayBleGVjdXRpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhZ2VudCBleGVjdXRpb24gcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRQcm9ncmVzcygpOiBhbnkge1xuICAgICAgICBpZiAoIXRoaXMuYWdlbnRDb29yZGluYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hZ2VudENvb3JkaW5hdG9yLmdldFByb2dyZXNzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFnZW50IGV4ZWN1dGlvbiBtZXRyaWNzXG4gICAgICovXG4gICAgcHVibGljIGdldEFnZW50TWV0cmljcygpOiBNYXA8QWdlbnRUeXBlLCBhbnk+IHwgbnVsbCB7XG4gICAgICAgIGlmICghdGhpcy5hZ2VudENvb3JkaW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFnZW50Q29vcmRpbmF0b3IuZ2V0TWV0cmljcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbVGFza0V4ZWN1dG9yXSAke21lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiO0FBS0E7QUFtQk8sTUFBTSxhQUFhO0FBQUEsRUFDZDtBQUFBLEVBQ0EsY0FBdUMsSUFBSTtBQUFBLEVBQzNDLGVBQTRCLElBQUk7QUFBQSxFQUNoQztBQUFBLEVBRVIsV0FBVyxDQUFDLFVBQTRCLENBQUMsR0FBRztBQUFBLElBQ3hDLEtBQUssVUFBVTtBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsaUJBQWlCO0FBQUEsTUFDakIsZ0JBQWdCO0FBQUEsTUFDaEIsU0FBUztBQUFBLFNBQ047QUFBQSxJQUNQO0FBQUE7QUFBQSxFQU1HLG1CQUFtQixDQUFDLGFBQXFDO0FBQUEsSUFDNUQsS0FBSyxtQkFBbUI7QUFBQTtBQUFBLE9BTWYsWUFBVyxDQUFDLE1BQW1DO0FBQUEsSUFDeEQsS0FBSyxZQUFZLE1BQU07QUFBQSxJQUN2QixLQUFLLGFBQWEsTUFBTTtBQUFBLElBRXhCLE1BQU0saUJBQWlCLEtBQUssc0JBQXNCLEtBQUssS0FBSztBQUFBLElBQzVELE1BQU0sVUFBd0IsQ0FBQztBQUFBLElBRS9CLFdBQVcsUUFBUSxnQkFBZ0I7QUFBQSxNQUMvQixNQUFNLFNBQVMsTUFBTSxLQUFLLFlBQVksSUFBSTtBQUFBLE1BQzFDLEtBQUssWUFBWSxJQUFJLEtBQUssSUFBSSxNQUFNO0FBQUEsTUFDcEMsUUFBUSxLQUFLLE1BQU07QUFBQSxNQUduQixJQUNJLE9BQU8sb0NBQ1AsQ0FBQyxLQUFLLFFBQVEsaUJBQ2hCO0FBQUEsUUFDRSxLQUFLLElBQUksMkNBQTJDLEtBQUssSUFBSTtBQUFBLFFBQzdEO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLE9BTUUsWUFBVyxDQUFDLE1BQTJDO0FBQUEsSUFDaEUsSUFBSSxLQUFLLGFBQWEsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUFBLE1BQ2hD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S0FBSyxrQkFBa0I7QUFBQSxNQUN4QixNQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxJQUMvQztBQUFBLElBRUEsS0FBSyxJQUNELGFBQWEsTUFBTSxxQ0FBcUMsU0FBUyxNQUNyRTtBQUFBLElBRUEsSUFBSTtBQUFBLE1BRUEsTUFBTSxlQUFlLE1BQU0sS0FBSyxpQkFBaUIsYUFDN0MsT0FDQSxRQUNKO0FBQUEsTUFHQSxNQUFNLGNBQTRCLGFBQWEsSUFDM0MsQ0FBQyxpQkFBaUI7QUFBQSxRQUNkLElBQUksWUFBWTtBQUFBLFFBQ2hCLFFBQVEsS0FBSyxtQkFBbUIsWUFBWSxNQUFNO0FBQUEsUUFDbEQsVUFDSSxZQUFZLHlDQUNOLElBQ0E7QUFBQSxRQUNWLFFBQVEsWUFBWSxTQUNkLEtBQUssVUFBVSxZQUFZLFFBQVEsTUFBTSxDQUFDLElBQzFDO0FBQUEsUUFDTixRQUFRLFlBQVksU0FBUztBQUFBLFFBQzdCLFVBQVUsWUFBWTtBQUFBLFFBQ3RCLFdBQVcsWUFBWTtBQUFBLFFBQ3ZCLFNBQVMsWUFBWTtBQUFBLFFBQ3JCLE9BQU8sWUFBWTtBQUFBLE1BQ3ZCLEVBQ0o7QUFBQSxNQUdBLFdBQVcsVUFBVSxhQUFhO0FBQUEsUUFDOUIsS0FBSyxZQUFZLElBQUksT0FBTyxJQUFJLE1BQU07QUFBQSxNQUMxQztBQUFBLE1BRUEsT0FBTztBQUFBLE1BQ1QsT0FBTyxPQUFPO0FBQUEsTUFDWixLQUFLLElBQ0QsZ0NBQWdDLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxpQkFDN0U7QUFBQSxNQUNBLE1BQU07QUFBQTtBQUFBO0FBQUEsRUFPUCxnQkFBZ0IsR0FBUTtBQUFBLElBQzNCLElBQUksQ0FBQyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3hCLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLEtBQUssaUJBQWlCLFlBQVk7QUFBQTtBQUFBLEVBTXRDLGVBQWUsR0FBK0I7QUFBQSxJQUNqRCxJQUFJLENBQUMsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QixPQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsT0FBTyxLQUFLLGlCQUFpQixXQUFXO0FBQUE7QUFBQSxFQUdwQyxHQUFHLENBQUMsU0FBdUI7QUFBQSxJQUMvQixJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsTUFDdEIsUUFBUSxJQUFJLGtCQUFrQixTQUFTO0FBQUEsSUFDM0M7QUFBQTtBQUVSOyIsCiAgImRlYnVnSWQiOiAiM0FDQzI4NjZGMjU3RjRDNjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
