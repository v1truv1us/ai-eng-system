// src/execution/flow-store.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// src/util/log.ts
import fs from "node:fs/promises";
import path from "node:path";
var Log;
((Log) => {
  const levelPriority = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  let currentLevel = "INFO";
  let logPath = "";
  let write = (msg) => process.stderr.write(msg);
  function shouldLog(level) {
    return levelPriority[level] >= levelPriority[currentLevel];
  }
  function file() {
    return logPath;
  }
  Log.file = file;
  async function init(options) {
    if (options.level)
      currentLevel = options.level;
    const stderrWriter = (msg) => {
      process.stderr.write(msg);
    };
    if (options.logDir) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -1);
      logPath = path.join(options.logDir, `ralph-${timestamp}.log`);
      await fs.mkdir(options.logDir, { recursive: true });
      const file2 = Bun.file(logPath);
      const fileWriter = file2.writer();
      write = (msg) => {
        if (options.print) {
          stderrWriter(msg);
        }
        fileWriter.write(msg);
        fileWriter.flush();
      };
    } else if (options.print) {
      write = stderrWriter;
    }
  }
  Log.init = init;
  function formatExtra(extra) {
    if (!extra)
      return "";
    const extraStr = Object.entries(extra).map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    return extraStr ? ` ${extraStr}` : "";
  }
  function create(tags) {
    const tagStr = tags ? Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(" ") : "";
    const tagStrWithSpace = tagStr ? `${tagStr} ` : "";
    return {
      debug(message, extra) {
        if (shouldLog("DEBUG")) {
          write(`DEBUG ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      info(message, extra) {
        if (shouldLog("INFO")) {
          write(`INFO  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      warn(message, extra) {
        if (shouldLog("WARN")) {
          write(`WARN  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      error(message, extra) {
        if (shouldLog("ERROR")) {
          write(`ERROR ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      }
    };
  }
  Log.create = create;
  Log.Default = create({ service: "ralph" });
})(Log ||= {});

// src/execution/flow-types.ts
var FLOW_SCHEMA_VERSION = "1.0.0";

// src/execution/flow-store.ts
var log = Log.create({ service: "flow-store" });

class FlowStore {
  flowDir;
  runId;
  constructor(options) {
    this.flowDir = options.flowDir;
    this.runId = options.runId;
  }
  get basePath() {
    return join(this.flowDir, this.runId, ".flow");
  }
  path(relPath) {
    return join(this.basePath, relPath);
  }
  initialize() {
    const dirs = ["iterations", "contexts", "gates"];
    for (const dir of dirs) {
      const dirPath = this.path(dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        log.debug("Created directory", { path: dirPath });
      }
    }
    log.info("Flow store initialized", {
      runId: this.runId,
      basePath: this.basePath
    });
  }
  exists() {
    return existsSync(this.path("state.json"));
  }
  load() {
    const statePath = this.path("state.json");
    if (!existsSync(statePath)) {
      return null;
    }
    try {
      const content = readFileSync(statePath, "utf-8");
      const state = JSON.parse(content);
      if (state.schemaVersion !== FLOW_SCHEMA_VERSION) {
        log.warn("Flow schema version mismatch", {
          expected: FLOW_SCHEMA_VERSION,
          found: state.schemaVersion
        });
      }
      log.info("Loaded flow state", {
        runId: state.runId,
        status: state.status,
        currentCycle: state.currentCycle
      });
      return state;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error("Failed to load flow state", { error: errorMsg });
      return null;
    }
  }
  createInitialState(options) {
    const now = new Date().toISOString();
    const state = {
      schemaVersion: FLOW_SCHEMA_VERSION,
      runId: this.runId,
      prompt: options.prompt,
      status: "pending" /* PENDING */,
      completionPromise: options.completionPromise,
      maxCycles: options.maxCycles,
      stuckThreshold: options.stuckThreshold,
      gates: options.gates,
      currentCycle: 0,
      completedCycles: 0,
      failedCycles: 0,
      stuckCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.saveState(state);
    return state;
  }
  saveState(state) {
    const statePath = this.path("state.json");
    state.updatedAt = new Date().toISOString();
    writeFileSync(statePath, JSON.stringify(state, null, 2));
    log.debug("Saved flow state", { runId: state.runId });
  }
  saveCheckpoint(state, lastPhaseOutputs) {
    const checkpointPath = this.path("checkpoint.json");
    const checkpoint = {
      schemaVersion: FLOW_SCHEMA_VERSION,
      runId: state.runId,
      cycleNumber: state.currentCycle,
      timestamp: new Date().toISOString(),
      state,
      lastPhaseOutputs
    };
    writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
    log.debug("Saved checkpoint", {
      runId: state.runId,
      cycle: state.currentCycle
    });
  }
  loadCheckpoint() {
    const checkpointPath = this.path("checkpoint.json");
    if (!existsSync(checkpointPath)) {
      return null;
    }
    try {
      const content = readFileSync(checkpointPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error("Failed to load checkpoint", { error: errorMsg });
      return null;
    }
  }
  saveIteration(cycle) {
    const cyclePath = this.path(`iterations/${cycle.cycleNumber}.json`);
    writeFileSync(cyclePath, JSON.stringify(cycle, null, 2));
    const contextPath = this.path(`contexts/${cycle.cycleNumber}.md`);
    const contextContent = this.generateContextContent(cycle);
    writeFileSync(contextPath, contextContent);
    log.debug("Saved iteration", { cycle: cycle.cycleNumber });
  }
  saveGateResults(cycleNumber, results) {
    const gatePath = this.path(`gates/${cycleNumber}.json`);
    writeFileSync(gatePath, JSON.stringify(results, null, 2));
  }
  generateContextContent(cycle) {
    const lines = [
      `# Cycle ${cycle.cycleNumber} Context`,
      "",
      `**Timestamp:** ${cycle.startTime}`,
      `**Status:** ${cycle.status}`,
      `**Completion Promise Observed:** ${cycle.completionPromiseObserved}`,
      "",
      "## Phase Summaries",
      ""
    ];
    for (const [phase, output] of Object.entries(cycle.phases)) {
      if (output) {
        lines.push(`### ${phase.toUpperCase()}`);
        lines.push("");
        lines.push(output.summary || output.response.slice(0, 500));
        lines.push("");
      }
    }
    if (cycle.gateResults.length > 0) {
      lines.push("## Gate Results");
      lines.push("");
      for (const gate of cycle.gateResults) {
        const status = gate.passed ? "✅ PASS" : "❌ FAIL";
        lines.push(`- **${gate.gate}:** ${status} - ${gate.message}`);
      }
      lines.push("");
    }
    if (cycle.error) {
      lines.push("## Errors");
      lines.push("");
      lines.push(cycle.error);
      lines.push("");
    }
    return lines.join(`
`);
  }
  getIteration(cycleNumber) {
    const cyclePath = this.path(`iterations/${cycleNumber}.json`);
    if (!existsSync(cyclePath)) {
      return null;
    }
    try {
      const content = readFileSync(cyclePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  getAllIterations() {
    const iterations = [];
    let n = 1;
    while (true) {
      const cycle = this.getIteration(n);
      if (!cycle)
        break;
      iterations.push(cycle);
      n++;
    }
    return iterations;
  }
  updateStatus(status, stopReason, error) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.status = status;
    if (stopReason)
      state.stopReason = stopReason;
    if (error)
      state.error = error;
    if (status === "completed" /* COMPLETED */ || status === "failed" /* FAILED */) {
      state.completedAt = new Date().toISOString();
    }
    this.saveState(state);
  }
  incrementCycle() {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.currentCycle++;
    this.saveState(state);
    return state.currentCycle;
  }
  recordFailedCycle(cycle) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.failedCycles++;
    state.stuckCount++;
    this.saveIteration(cycle);
    this.saveState(state);
    log.info("Cycle failed", {
      runId: this.runId,
      cycle: cycle.cycleNumber,
      failedCycles: state.failedCycles,
      stuckCount: state.stuckCount
    });
  }
  recordSuccessfulCycle(cycle, summary) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.completedCycles++;
    state.stuckCount = 0;
    state.lastCheckpoint = {
      cycleNumber: cycle.cycleNumber,
      summary,
      timestamp: new Date().toISOString()
    };
    this.saveIteration(cycle);
    this.saveState(state);
    log.info("Cycle completed", {
      runId: this.runId,
      cycle: cycle.cycleNumber,
      completedCycles: state.completedCycles
    });
  }
  cleanup() {
    log.info("Flow store cleanup requested", { runId: this.runId });
  }
}
export {
  FlowStore
};

//# debugId=3E8DC8DD127CDD3A64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi9mbG93LXN0b3JlLnRzIiwgIi4uL3NyYy91dGlsL2xvZy50cyIsICIuLi9zcmMvZXhlY3V0aW9uL2Zsb3ctdHlwZXMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLyoqXG4gKiBGbG93IFN0b3JlIC0gU3RhdGUgcGVyc2lzdGVuY2UgbGF5ZXIgZm9yIFJhbHBoIExvb3AgUnVubmVyXG4gKlxuICogUGVyc2lzdHMgcnVuIHN0YXRlIHRvIGAuYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdy9gOlxuICogLSBzdGF0ZS5qc29uOiBNYWluIHJ1biBzdGF0ZVxuICogLSBjaGVja3BvaW50Lmpzb246IExhc3Qgc3VjY2Vzc2Z1bCBjaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZVxuICogLSBpdGVyYXRpb25zLzxuPi5qc29uOiBQZXItY3ljbGUgZGV0YWlsZWQgb3V0cHV0c1xuICogLSBjb250ZXh0cy88bj4ubWQ6IFJlLWFuY2hvcmluZyBjb250ZXh0IHNuYXBzaG90c1xuICogLSBnYXRlcy88bj4uanNvbjogUXVhbGl0eSBnYXRlIHJlc3VsdHNcbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jLCBta2RpclN5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgdHlwZSB7IENoZWNrcG9pbnQsIEN5Y2xlU3RhdGUsIEZsb3dTdGF0ZSB9IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcbmltcG9ydCB7IEZMT1dfU0NIRU1BX1ZFUlNJT04sIFJ1blN0YXR1cywgdHlwZSBTdG9wUmVhc29uIH0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJmbG93LXN0b3JlXCIgfSk7XG5cbi8qKiBGbG93IHN0b3JlIG9wdGlvbnMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmxvd1N0b3JlT3B0aW9ucyB7XG4gICAgZmxvd0Rpcjogc3RyaW5nO1xuICAgIHJ1bklkOiBzdHJpbmc7XG59XG5cbi8qKlxuICogRmxvdyBTdG9yZSAtIG1hbmFnZXMgcGVyc2lzdGVuY2Ugb2YgbG9vcCBydW4gc3RhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIEZsb3dTdG9yZSB7XG4gICAgcHJpdmF0ZSBmbG93RGlyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBydW5JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRmxvd1N0b3JlT3B0aW9ucykge1xuICAgICAgICB0aGlzLmZsb3dEaXIgPSBvcHRpb25zLmZsb3dEaXI7XG4gICAgICAgIHRoaXMucnVuSWQgPSBvcHRpb25zLnJ1bklkO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGJhc2UgZmxvdyBkaXJlY3RvcnkgcGF0aCAqL1xuICAgIGdldCBiYXNlUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmZsb3dEaXIsIHRoaXMucnVuSWQsIFwiLmZsb3dcIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBwYXRoIHRvIGEgc3BlY2lmaWMgZmlsZSBpbiAuZmxvdyAqL1xuICAgIHByaXZhdGUgcGF0aChyZWxQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmJhc2VQYXRoLCByZWxQYXRoKTtcbiAgICB9XG5cbiAgICAvKiogSW5pdGlhbGl6ZSBmbG93IGRpcmVjdG9yeSBzdHJ1Y3R1cmUgKi9cbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgICAgICAvLyBDcmVhdGUgLmZsb3cgZGlyZWN0b3J5IGFuZCBzdWJkaXJlY3Rvcmllc1xuICAgICAgICBjb25zdCBkaXJzID0gW1wiaXRlcmF0aW9uc1wiLCBcImNvbnRleHRzXCIsIFwiZ2F0ZXNcIl07XG5cbiAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlycykge1xuICAgICAgICAgICAgY29uc3QgZGlyUGF0aCA9IHRoaXMucGF0aChkaXIpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpclBhdGgpKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJTeW5jKGRpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkNyZWF0ZWQgZGlyZWN0b3J5XCIsIHsgcGF0aDogZGlyUGF0aCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5pbmZvKFwiRmxvdyBzdG9yZSBpbml0aWFsaXplZFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIGJhc2VQYXRoOiB0aGlzLmJhc2VQYXRoLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgaWYgZmxvdyBzdGF0ZSBleGlzdHMgKGZvciByZXN1bWUpICovXG4gICAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZXhpc3RzU3luYyh0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpKTtcbiAgICB9XG5cbiAgICAvKiogTG9hZCBleGlzdGluZyBydW4gc3RhdGUgZm9yIHJlc3VtZSAqL1xuICAgIGxvYWQoKTogRmxvd1N0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHN0YXRlUGF0aCA9IHRoaXMucGF0aChcInN0YXRlLmpzb25cIik7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhzdGF0ZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKHN0YXRlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBGbG93U3RhdGU7XG5cbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHNjaGVtYSB2ZXJzaW9uXG4gICAgICAgICAgICBpZiAoc3RhdGUuc2NoZW1hVmVyc2lvbiAhPT0gRkxPV19TQ0hFTUFfVkVSU0lPTikge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRmxvdyBzY2hlbWEgdmVyc2lvbiBtaXNtYXRjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgICAgICAgICBmb3VuZDogc3RhdGUuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oXCJMb2FkZWQgZmxvdyBzdGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRDeWNsZTogc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBmbG93IHN0YXRlXCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGluaXRpYWwgcnVuIHN0YXRlICovXG4gICAgY3JlYXRlSW5pdGlhbFN0YXRlKG9wdGlvbnM6IHtcbiAgICAgICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgICAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgICAgICBnYXRlczogc3RyaW5nW107XG4gICAgfSk6IEZsb3dTdGF0ZSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZTogRmxvd1N0YXRlID0ge1xuICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiBvcHRpb25zLnByb21wdCxcbiAgICAgICAgICAgIHN0YXR1czogUnVuU3RhdHVzLlBFTkRJTkcsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogb3B0aW9ucy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogb3B0aW9ucy5tYXhDeWNsZXMsXG4gICAgICAgICAgICBzdHVja1RocmVzaG9sZDogb3B0aW9ucy5zdHVja1RocmVzaG9sZCxcbiAgICAgICAgICAgIGdhdGVzOiBvcHRpb25zLmdhdGVzLFxuICAgICAgICAgICAgY3VycmVudEN5Y2xlOiAwLFxuICAgICAgICAgICAgY29tcGxldGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgZmFpbGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgc3R1Y2tDb3VudDogMCxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbm93LFxuICAgICAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgcnVuIHN0YXRlIHRvIHN0YXRlLmpzb24gKi9cbiAgICBzYXZlU3RhdGUoc3RhdGU6IEZsb3dTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZVBhdGggPSB0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpO1xuICAgICAgICBzdGF0ZS51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoc3RhdGVQYXRoLCBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMikpO1xuICAgICAgICBsb2cuZGVidWcoXCJTYXZlZCBmbG93IHN0YXRlXCIsIHsgcnVuSWQ6IHN0YXRlLnJ1bklkIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGEgY2hlY2twb2ludCBmb3IgZmFzdCByZXN1bWUgKi9cbiAgICBzYXZlQ2hlY2twb2ludChcbiAgICAgICAgc3RhdGU6IEZsb3dTdGF0ZSxcbiAgICAgICAgbGFzdFBoYXNlT3V0cHV0czogQ3ljbGVTdGF0ZVtcInBoYXNlc1wiXSxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2hlY2twb2ludFBhdGggPSB0aGlzLnBhdGgoXCJjaGVja3BvaW50Lmpzb25cIik7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnQ6IENoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBsYXN0UGhhc2VPdXRwdXRzLFxuICAgICAgICB9O1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNoZWNrcG9pbnRQYXRoLCBKU09OLnN0cmluZ2lmeShjaGVja3BvaW50LCBudWxsLCAyKSk7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIlNhdmVkIGNoZWNrcG9pbnRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGU6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgY2hlY2twb2ludCBmb3IgcmVzdW1lICovXG4gICAgbG9hZENoZWNrcG9pbnQoKTogQ2hlY2twb2ludCB8IG51bGwge1xuICAgICAgICBjb25zdCBjaGVja3BvaW50UGF0aCA9IHRoaXMucGF0aChcImNoZWNrcG9pbnQuanNvblwiKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGNoZWNrcG9pbnRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhjaGVja3BvaW50UGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIENoZWNrcG9pbnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgY2hlY2twb2ludFwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgaXRlcmF0aW9uIGN5Y2xlIG91dHB1dCAqL1xuICAgIHNhdmVJdGVyYXRpb24oY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3ljbGVQYXRoID0gdGhpcy5wYXRoKGBpdGVyYXRpb25zLyR7Y3ljbGUuY3ljbGVOdW1iZXJ9Lmpzb25gKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhjeWNsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGN5Y2xlLCBudWxsLCAyKSk7XG5cbiAgICAgICAgLy8gU2F2ZSByZS1hbmNob3JpbmcgY29udGV4dFxuICAgICAgICBjb25zdCBjb250ZXh0UGF0aCA9IHRoaXMucGF0aChgY29udGV4dHMvJHtjeWNsZS5jeWNsZU51bWJlcn0ubWRgKTtcbiAgICAgICAgY29uc3QgY29udGV4dENvbnRlbnQgPSB0aGlzLmdlbmVyYXRlQ29udGV4dENvbnRlbnQoY3ljbGUpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNvbnRleHRQYXRoLCBjb250ZXh0Q29udGVudCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiU2F2ZWQgaXRlcmF0aW9uXCIsIHsgY3ljbGU6IGN5Y2xlLmN5Y2xlTnVtYmVyIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGdhdGUgcmVzdWx0cyBmb3IgaXRlcmF0aW9uICovXG4gICAgc2F2ZUdhdGVSZXN1bHRzKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICByZXN1bHRzOiBDeWNsZVN0YXRlW1wiZ2F0ZVJlc3VsdHNcIl0sXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdhdGVQYXRoID0gdGhpcy5wYXRoKGBnYXRlcy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoZ2F0ZVBhdGgsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgcmUtYW5jaG9yaW5nIGNvbnRleHQgY29udGVudCBmb3IgYSBjeWNsZSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVDb250ZXh0Q29udGVudChjeWNsZTogQ3ljbGVTdGF0ZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgIGAjIEN5Y2xlICR7Y3ljbGUuY3ljbGVOdW1iZXJ9IENvbnRleHRgLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIGAqKlRpbWVzdGFtcDoqKiAke2N5Y2xlLnN0YXJ0VGltZX1gLFxuICAgICAgICAgICAgYCoqU3RhdHVzOioqICR7Y3ljbGUuc3RhdHVzfWAsXG4gICAgICAgICAgICBgKipDb21wbGV0aW9uIFByb21pc2UgT2JzZXJ2ZWQ6KiogJHtjeWNsZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkfWAsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgXCIjIyBQaGFzZSBTdW1tYXJpZXNcIixcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBbcGhhc2UsIG91dHB1dF0gb2YgT2JqZWN0LmVudHJpZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCMjIyAke3BoYXNlLnRvVXBwZXJDYXNlKCl9YCk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKG91dHB1dC5zdW1tYXJ5IHx8IG91dHB1dC5yZXNwb25zZS5zbGljZSgwLCA1MDApKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN5Y2xlLmdhdGVSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBHYXRlIFJlc3VsdHNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBnYXRlIG9mIGN5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZ2F0ZS5wYXNzZWQgPyBcIuKchSBQQVNTXCIgOiBcIuKdjCBGQUlMXCI7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLSAqKiR7Z2F0ZS5nYXRlfToqKiAke3N0YXR1c30gLSAke2dhdGUubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3ljbGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBFcnJvcnNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgbGluZXMucHVzaChjeWNsZS5lcnJvcik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBpdGVyYXRpb24gYnkgbnVtYmVyICovXG4gICAgZ2V0SXRlcmF0aW9uKGN5Y2xlTnVtYmVyOiBudW1iZXIpOiBDeWNsZVN0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGN5Y2xlUGF0aCA9IHRoaXMucGF0aChgaXRlcmF0aW9ucy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhjeWNsZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGN5Y2xlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEN5Y2xlU3RhdGU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IGFsbCBpdGVyYXRpb25zICovXG4gICAgZ2V0QWxsSXRlcmF0aW9ucygpOiBDeWNsZVN0YXRlW10ge1xuICAgICAgICBjb25zdCBpdGVyYXRpb25zOiBDeWNsZVN0YXRlW10gPSBbXTtcbiAgICAgICAgbGV0IG4gPSAxO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjeWNsZSA9IHRoaXMuZ2V0SXRlcmF0aW9uKG4pO1xuICAgICAgICAgICAgaWYgKCFjeWNsZSkgYnJlYWs7XG4gICAgICAgICAgICBpdGVyYXRpb25zLnB1c2goY3ljbGUpO1xuICAgICAgICAgICAgbisrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqIFVwZGF0ZSBzdGF0ZSBzdGF0dXMgKi9cbiAgICB1cGRhdGVTdGF0dXMoXG4gICAgICAgIHN0YXR1czogUnVuU3RhdHVzLFxuICAgICAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbixcbiAgICAgICAgZXJyb3I/OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoc3RvcFJlYXNvbikgc3RhdGUuc3RvcFJlYXNvbiA9IHN0b3BSZWFzb247XG4gICAgICAgIGlmIChlcnJvcikgc3RhdGUuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gUnVuU3RhdHVzLkNPTVBMRVRFRCB8fCBzdGF0dXMgPT09IFJ1blN0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIC8qKiBJbmNyZW1lbnQgY3ljbGUgY291bnRlciAqL1xuICAgIGluY3JlbWVudEN5Y2xlKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuY3VycmVudEN5Y2xlKys7XG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmN1cnJlbnRDeWNsZTtcbiAgICB9XG5cbiAgICAvKiogUmVjb3JkIGEgZmFpbGVkIGN5Y2xlICovXG4gICAgcmVjb3JkRmFpbGVkQ3ljbGUoY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5mYWlsZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCsrO1xuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBmYWlsZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBmYWlsZWRDeWNsZXM6IHN0YXRlLmZhaWxlZEN5Y2xlcyxcbiAgICAgICAgICAgIHN0dWNrQ291bnQ6IHN0YXRlLnN0dWNrQ291bnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBSZWNvcmQgYSBzdWNjZXNzZnVsIGN5Y2xlICovXG4gICAgcmVjb3JkU3VjY2Vzc2Z1bEN5Y2xlKGN5Y2xlOiBDeWNsZVN0YXRlLCBzdW1tYXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCA9IDA7IC8vIFJlc2V0IHN0dWNrIGNvdW50ZXIgb24gc3VjY2Vzc1xuICAgICAgICBzdGF0ZS5sYXN0Q2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBjb21wbGV0ZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IHN0YXRlLmNvbXBsZXRlZEN5Y2xlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIENsZWFuIHVwIGZsb3cgZGlyZWN0b3J5ICovXG4gICAgY2xlYW51cCgpOiB2b2lkIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gd291bGQgcmVtb3ZlIHRoZSAuZmxvdyBkaXJlY3RvcnlcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCBsb2dcbiAgICAgICAgbG9nLmluZm8oXCJGbG93IHN0b3JlIGNsZWFudXAgcmVxdWVzdGVkXCIsIHsgcnVuSWQ6IHRoaXMucnVuSWQgfSk7XG4gICAgfVxufVxuIiwKICAgICJpbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbi8qKlxuICogU3RydWN0dXJlZCBsb2dnaW5nIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBTdXBwb3J0cyBib3RoIHN0ZGVyciBvdXRwdXQgKHdpdGggLS1wcmludC1sb2dzKSBhbmQgZmlsZS1iYXNlZCBsb2dnaW5nXG4gKi9cbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBMb2cge1xuICAgIGV4cG9ydCB0eXBlIExldmVsID0gXCJERUJVR1wiIHwgXCJJTkZPXCIgfCBcIldBUk5cIiB8IFwiRVJST1JcIjtcblxuICAgIGNvbnN0IGxldmVsUHJpb3JpdHk6IFJlY29yZDxMZXZlbCwgbnVtYmVyPiA9IHtcbiAgICAgICAgREVCVUc6IDAsXG4gICAgICAgIElORk86IDEsXG4gICAgICAgIFdBUk46IDIsXG4gICAgICAgIEVSUk9SOiAzLFxuICAgIH07XG5cbiAgICBsZXQgY3VycmVudExldmVsOiBMZXZlbCA9IFwiSU5GT1wiO1xuICAgIGxldCBsb2dQYXRoID0gXCJcIjtcbiAgICBsZXQgd3JpdGU6IChtc2c6IHN0cmluZykgPT4gYW55ID0gKG1zZykgPT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZExvZyhsZXZlbDogTGV2ZWwpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGxldmVsUHJpb3JpdHlbbGV2ZWxdID49IGxldmVsUHJpb3JpdHlbY3VycmVudExldmVsXTtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgICAgICBwcmludDogYm9vbGVhbjsgLy8gV2hlbiB0cnVlLCB3cml0ZSB0byBzdGRlcnJcbiAgICAgICAgbGV2ZWw/OiBMZXZlbDtcbiAgICAgICAgbG9nRGlyPzogc3RyaW5nOyAvLyBEaXJlY3RvcnkgZm9yIGxvZyBmaWxlc1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBmaWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBsb2dQYXRoO1xuICAgIH1cblxuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KG9wdGlvbnM6IE9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMubGV2ZWwpIGN1cnJlbnRMZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHdyaXRlIGZ1bmN0aW9uIHRoYXQgb3V0cHV0cyB0byBCT1RIIHN0ZGVyciBBTkQgZmlsZVxuICAgICAgICBjb25zdCBzdGRlcnJXcml0ZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1zZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubG9nRGlyKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWzouXS9nLCBcIi1cIilcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgbG9nUGF0aCA9IHBhdGguam9pbihvcHRpb25zLmxvZ0RpciwgYHJhbHBoLSR7dGltZXN0YW1wfS5sb2dgKTtcbiAgICAgICAgICAgIGF3YWl0IGZzLm1rZGlyKG9wdGlvbnMubG9nRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IEJ1bi5maWxlKGxvZ1BhdGgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZVdyaXRlciA9IGZpbGUud3JpdGVyKCk7XG5cbiAgICAgICAgICAgIC8vIEFsd2F5cyB3cml0ZSB0byBzdGRlcnIgaWYgcHJpbnQgaXMgZW5hYmxlZFxuICAgICAgICAgICAgLy8gQWxzbyBhbHdheXMgd3JpdGUgdG8gZmlsZSBpZiBsb2dEaXIgaXMgcHJvdmlkZWRcbiAgICAgICAgICAgIHdyaXRlID0gKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycldyaXRlcihtc2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLndyaXRlKG1zZyk7XG4gICAgICAgICAgICAgICAgZmlsZVdyaXRlci5mbHVzaCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAvLyBPbmx5IHByaW50IHRvIHN0ZGVyclxuICAgICAgICAgICAgd3JpdGUgPSBzdGRlcnJXcml0ZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIHdhcm4obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0RXh0cmEoZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFleHRyYSkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGNvbnN0IGV4dHJhU3RyID0gT2JqZWN0LmVudHJpZXMoZXh0cmEpXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIChbaywgdl0pID0+XG4gICAgICAgICAgICAgICAgICAgIGAke2t9PSR7dHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBKU09OLnN0cmluZ2lmeSh2KSA6IHZ9YCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIGV4dHJhU3RyID8gYCAke2V4dHJhU3RyfWAgOiBcIlwiO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGUodGFncz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBMb2dnZXIge1xuICAgICAgICBjb25zdCB0YWdTdHIgPSB0YWdzXG4gICAgICAgICAgICA/IE9iamVjdC5lbnRyaWVzKHRhZ3MpXG4gICAgICAgICAgICAgICAgICAubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKVxuICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpXG4gICAgICAgICAgICA6IFwiXCI7XG4gICAgICAgIGNvbnN0IHRhZ1N0cldpdGhTcGFjZSA9IHRhZ1N0ciA/IGAke3RhZ1N0cn0gYCA6IFwiXCI7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIkRFQlVHXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYERFQlVHICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJJTkZPXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYElORk8gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJXQVJOXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFdBUk4gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiRVJST1JcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgRVJST1IgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZXhwb3J0IGNvbnN0IERlZmF1bHQgPSBjcmVhdGUoeyBzZXJ2aWNlOiBcInJhbHBoXCIgfSk7XG59XG4iLAogICAgIi8qKlxuICogRmxvdyBTdGF0ZSBUeXBlcyBmb3IgUmFscGggTG9vcCBSdW5uZXJcbiAqXG4gKiBTdGF0ZSBpcyBwZXJzaXN0ZWQgdG8gYC5haS1lbmcvcnVucy88cnVuSWQ+Ly5mbG93L2AgZm9yOlxuICogLSBSZXN1bWUgc3VwcG9ydCBhY3Jvc3MgcnVuc1xuICogLSBGcmVzaCBjb250ZXh0IHBlciBpdGVyYXRpb24gKHJlLWFuY2hvcmluZyBmcm9tIGRpc2spXG4gKiAtIEF1ZGl0IHRyYWlsIG9mIGFsbCBjeWNsZSBvdXRwdXRzXG4gKi9cblxuLyoqIFNjaGVtYSB2ZXJzaW9uIGZvciBmb3J3YXJkIGNvbXBhdGliaWxpdHkgKi9cbmV4cG9ydCBjb25zdCBGTE9XX1NDSEVNQV9WRVJTSU9OID0gXCIxLjAuMFwiO1xuXG4vKiogUnVuIHN0YXR1cyBlbnVtICovXG5leHBvcnQgZW51bSBSdW5TdGF0dXMge1xuICAgIFBFTkRJTkcgPSBcInBlbmRpbmdcIixcbiAgICBSVU5OSU5HID0gXCJydW5uaW5nXCIsXG4gICAgQ09NUExFVEVEID0gXCJjb21wbGV0ZWRcIixcbiAgICBGQUlMRUQgPSBcImZhaWxlZFwiLFxuICAgIEFCT1JURUQgPSBcImFib3J0ZWRcIixcbiAgICBTVFVDSyA9IFwic3R1Y2tcIixcbn1cblxuLyoqIFN0b3AgcmVhc29uIGZvciBjb21wbGV0ZWQgcnVucyAqL1xuZXhwb3J0IGVudW0gU3RvcFJlYXNvbiB7XG4gICAgQ09NUExFVElPTl9QUk9NSVNFID0gXCJjb21wbGV0aW9uX3Byb21pc2VcIixcbiAgICBNQVhfQ1lDTEVTID0gXCJtYXhfY3ljbGVzXCIsXG4gICAgR0FURV9GQUlMVVJFID0gXCJnYXRlX2ZhaWx1cmVcIixcbiAgICBTVFVDSyA9IFwic3R1Y2tcIixcbiAgICBVU0VSX0FCT1JUID0gXCJ1c2VyX2Fib3J0XCIsXG4gICAgRVJST1IgPSBcImVycm9yXCIsXG59XG5cbi8qKiBQaGFzZSBuYW1lcyBpbiB0aGUgd29ya2Zsb3cgKi9cbmV4cG9ydCBlbnVtIFBoYXNlIHtcbiAgICBSRVNFQVJDSCA9IFwicmVzZWFyY2hcIixcbiAgICBTUEVDSUZZID0gXCJzcGVjaWZ5XCIsXG4gICAgUExBTiA9IFwicGxhblwiLFxuICAgIFdPUksgPSBcIndvcmtcIixcbiAgICBSRVZJRVcgPSBcInJldmlld1wiLFxufVxuXG4vKiogR2F0ZSByZXN1bHQgdHlwZSAqL1xuZXhwb3J0IGludGVyZmFjZSBHYXRlUmVzdWx0IHtcbiAgICBnYXRlOiBzdHJpbmc7XG4gICAgcGFzc2VkOiBib29sZWFuO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG59XG5cbi8qKiBQaGFzZSBvdXRwdXQgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGhhc2VPdXRwdXQge1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBwcm9tcHQ6IHN0cmluZztcbiAgICByZXNwb25zZTogc3RyaW5nO1xuICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICAvKiogVG9vbCBpbnZvY2F0aW9ucyBjYXB0dXJlZCBkdXJpbmcgdGhpcyBwaGFzZSAqL1xuICAgIHRvb2xzPzogVG9vbEludm9jYXRpb25bXTtcbn1cblxuLyoqIFRvb2wgaW52b2NhdGlvbiBjYXB0dXJlZCBmcm9tIE9wZW5Db2RlIHN0cmVhbSAqL1xuZXhwb3J0IGludGVyZmFjZSBUb29sSW52b2NhdGlvbiB7XG4gICAgLyoqIFVuaXF1ZSB0b29sIElEICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogVG9vbCBuYW1lIChlLmcuLCBcImJhc2hcIiwgXCJyZWFkXCIsIFwid3JpdGVcIiwgXCJlZGl0XCIpICovXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIC8qKiBJbnB1dCBhcmd1bWVudHMgKG1heSBiZSB0cnVuY2F0ZWQvcmVkYWN0ZWQgZm9yIHNlY3JldHMpICovXG4gICAgaW5wdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAvKiogT3V0cHV0IHJlc3VsdCAobWF5IGJlIHRydW5jYXRlZCkgKi9cbiAgICBvdXRwdXQ/OiBzdHJpbmc7XG4gICAgLyoqIFdoZXRoZXIgdGhlIHRvb2wgY2FsbCBzdWNjZWVkZWQgKi9cbiAgICBzdGF0dXM6IFwib2tcIiB8IFwiZXJyb3JcIjtcbiAgICAvKiogRXJyb3IgbWVzc2FnZSBpZiBzdGF0dXMgaXMgZXJyb3IgKi9cbiAgICBlcnJvcj86IHN0cmluZztcbiAgICAvKiogV2hlbiB0aGUgdG9vbCBjYWxsIHN0YXJ0ZWQgKElTTyB0aW1lc3RhbXApICovXG4gICAgc3RhcnRlZEF0Pzogc3RyaW5nO1xuICAgIC8qKiBXaGVuIHRoZSB0b29sIGNhbGwgY29tcGxldGVkIChJU08gdGltZXN0YW1wKSAqL1xuICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xufVxuXG4vKiogU2luZ2xlIGl0ZXJhdGlvbiBjeWNsZSBzdGF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDeWNsZVN0YXRlIHtcbiAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgIHN0YXR1czogXCJwZW5kaW5nXCIgfCBcInJ1bm5pbmdcIiB8IFwiY29tcGxldGVkXCIgfCBcImZhaWxlZFwiO1xuICAgIHN0YXJ0VGltZTogc3RyaW5nO1xuICAgIGVuZFRpbWU/OiBzdHJpbmc7XG4gICAgZHVyYXRpb25Ncz86IG51bWJlcjtcbiAgICBwaGFzZXM6IHtcbiAgICAgICAgW2tleSBpbiBQaGFzZV0/OiBQaGFzZU91dHB1dDtcbiAgICB9O1xuICAgIGdhdGVSZXN1bHRzOiBHYXRlUmVzdWx0W107XG4gICAgY29tcGxldGlvblByb21pc2VPYnNlcnZlZDogYm9vbGVhbjtcbiAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbjtcbiAgICBlcnJvcj86IHN0cmluZztcbiAgICAvLyBGb3Igc3R1Y2sgZGV0ZWN0aW9uIC0gaGFzaCBvZiBvdXRwdXRzIHRvIGRldGVjdCBuby1wcm9ncmVzc1xuICAgIG91dHB1dEhhc2g/OiBzdHJpbmc7XG59XG5cbi8qKiBNYWluIGZsb3cgc3RhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmxvd1N0YXRlIHtcbiAgICAvKiogU2NoZW1hIHZlcnNpb24gZm9yIG1pZ3JhdGlvbnMgKi9cbiAgICBzY2hlbWFWZXJzaW9uOiBzdHJpbmc7XG5cbiAgICAvKiogUnVuIGlkZW50aWZpY2F0aW9uICovXG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBwcm9tcHQ6IHN0cmluZztcblxuICAgIC8qKiBSdW4gc3RhdHVzICovXG4gICAgc3RhdHVzOiBSdW5TdGF0dXM7XG4gICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG5cbiAgICAvKiogTG9vcCBwYXJhbWV0ZXJzICovXG4gICAgY29tcGxldGlvblByb21pc2U6IHN0cmluZztcbiAgICBtYXhDeWNsZXM6IG51bWJlcjtcbiAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgIGdhdGVzOiBzdHJpbmdbXTtcblxuICAgIC8qKiBDeWNsZSB0cmFja2luZyAqL1xuICAgIGN1cnJlbnRDeWNsZTogbnVtYmVyO1xuICAgIGNvbXBsZXRlZEN5Y2xlczogbnVtYmVyO1xuICAgIGZhaWxlZEN5Y2xlczogbnVtYmVyO1xuICAgIHN0dWNrQ291bnQ6IG51bWJlcjtcblxuICAgIC8qKiBUaW1lc3RhbXBzICovXG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gICAgdXBkYXRlZEF0OiBzdHJpbmc7XG4gICAgY29tcGxldGVkQXQ/OiBzdHJpbmc7XG5cbiAgICAvKiogTGFzdCBzdWNjZXNzZnVsIGNoZWNrcG9pbnQgZm9yIHJlLWFuY2hvcmluZyAqL1xuICAgIGxhc3RDaGVja3BvaW50Pzoge1xuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIH07XG5cbiAgICAvKiogRXJyb3IgaW5mbyBpZiBmYWlsZWQgKi9cbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqIENoZWNrcG9pbnQgZm9yIGZhc3QgcmVzdW1lICovXG5leHBvcnQgaW50ZXJmYWNlIENoZWNrcG9pbnQge1xuICAgIHNjaGVtYVZlcnNpb246IHN0cmluZztcbiAgICBydW5JZDogc3RyaW5nO1xuICAgIGN5Y2xlTnVtYmVyOiBudW1iZXI7XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgc3RhdGU6IEZsb3dTdGF0ZTtcbiAgICBsYXN0UGhhc2VPdXRwdXRzOiB7XG4gICAgICAgIFtrZXkgaW4gUGhhc2VdPzogUGhhc2VPdXRwdXQ7XG4gICAgfTtcbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBsb29wIHJ1bm5lciAqL1xuZXhwb3J0IGludGVyZmFjZSBMb29wQ29uZmlnIHtcbiAgICBydW5JZDogc3RyaW5nO1xuICAgIHByb21wdDogc3RyaW5nO1xuICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbiAgICBnYXRlczogc3RyaW5nW107XG4gICAgY2hlY2twb2ludEZyZXF1ZW5jeTogbnVtYmVyO1xuICAgIGZsb3dEaXI6IHN0cmluZztcbiAgICBkcnlSdW46IGJvb2xlYW47XG4gICAgLyoqIE51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBwZXIgY3ljbGUgb24gZmFpbHVyZSAqL1xuICAgIGN5Y2xlUmV0cmllczogbnVtYmVyO1xuICAgIC8qKiBPcGVuQ29kZSBwcm9tcHQgdGltZW91dCBpbiBtcyAodXNlZCBhcyBpZGxlIHRpbWVvdXQpICovXG4gICAgcHJvbXB0VGltZW91dD86IG51bWJlcjtcbiAgICAvKiogUGhhc2UgaGFyZCB0aW1lb3V0IGluIG1zIChydW5uZXItc2lkZSB3YXRjaGRvZykgKi9cbiAgICBwaGFzZVRpbWVvdXRNcz86IG51bWJlcjtcbiAgICAvKiogQ3ljbGUgaGFyZCB0aW1lb3V0IGluIG1zICovXG4gICAgY3ljbGVUaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIFJ1biBoYXJkIHRpbWVvdXQgaW4gbXMgKi9cbiAgICBydW5UaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIERlYnVnIG1vZGU6IHByaW50IHRvb2wgaW52b2NhdGlvbnMgdG8gY29uc29sZS9sb2dzICovXG4gICAgZGVidWdXb3JrOiBib29sZWFuO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQVdBO0FBQ0E7OztBQ1pBO0FBTUE7QUFFTyxJQUFVO0FBQUEsQ0FBVixDQUFVLFFBQVY7QUFBQSxFQUdILE1BQU0sZ0JBQXVDO0FBQUEsSUFDekMsT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLElBQUksZUFBc0I7QUFBQSxFQUMxQixJQUFJLFVBQVU7QUFBQSxFQUNkLElBQUksUUFBOEIsQ0FBQyxRQUFRLFFBQVEsT0FBTyxNQUFNLEdBQUc7QUFBQSxFQUVuRSxTQUFTLFNBQVMsQ0FBQyxPQUF1QjtBQUFBLElBQ3RDLE9BQU8sY0FBYyxVQUFVLGNBQWM7QUFBQTtBQUFBLEVBUzFDLFNBQVMsSUFBSSxHQUFXO0FBQUEsSUFDM0IsT0FBTztBQUFBO0FBQUEsRUFESixJQUFTO0FBQUEsRUFJaEIsZUFBc0IsSUFBSSxDQUFDLFNBQWlDO0FBQUEsSUFDeEQsSUFBSSxRQUFRO0FBQUEsTUFBTyxlQUFlLFFBQVE7QUFBQSxJQUcxQyxNQUFNLGVBQWUsQ0FBQyxRQUFnQjtBQUFBLE1BQ2xDLFFBQVEsT0FBTyxNQUFNLEdBQUc7QUFBQTtBQUFBLElBRzVCLElBQUksUUFBUSxRQUFRO0FBQUEsTUFDaEIsTUFBTSxZQUFZLElBQUksS0FBSyxFQUN0QixZQUFZLEVBQ1osUUFBUSxTQUFTLEdBQUcsRUFDcEIsTUFBTSxHQUFHLEVBQUU7QUFBQSxNQUNoQixVQUFVLEtBQUssS0FBSyxRQUFRLFFBQVEsU0FBUyxlQUFlO0FBQUEsTUFDNUQsTUFBTSxHQUFHLE1BQU0sUUFBUSxRQUFRLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxNQUVsRCxNQUFNLFFBQU8sSUFBSSxLQUFLLE9BQU87QUFBQSxNQUM3QixNQUFNLGFBQWEsTUFBSyxPQUFPO0FBQUEsTUFJL0IsUUFBUSxDQUFDLFFBQVE7QUFB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
