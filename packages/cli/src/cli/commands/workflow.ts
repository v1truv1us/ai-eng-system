/**
 * workflow subcommand — Run portable agent workflows.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs as nodeParseArgs } from "node:util";
import type { Subcommand } from "./types";

const WORKFLOW_HELP_TEXT = `
ai-eng workflow - Run portable agent workflows

USAGE:
  ai-eng workflow list
  ai-eng workflow run <workflow> [options] "goal"

WORKFLOWS:
  research            Run the research template workflow
  seo-review          Review a URL for SEO, performance, and accessibility issues

OPTIONS:
  --runtime <name>    Runtime: anthropic|codex|cursor|opencode|pi (default: pi)
  --agent <name>      Optional agent/persona/instruction passed to the runner
  --templates <ids>   Research template IDs, comma-separated (for research)
  --dry-run           Print the runner command without executing
  -h, --help          Show this help message

EXAMPLES:
  ai-eng workflow list
  ai-eng workflow run research --runtime cursor "How should we expose runners?"
  ai-eng workflow run research --runtime pi --agent reviewer --templates A1,M2 "SDK runner design"
  ai-eng workflow run seo-review --runtime anthropic "https://example.com"
  ai-eng workflow run seo-review --runtime pi --agent technical-seo "https://example.com"
`;

type WorkflowRuntime = "anthropic" | "codex" | "cursor" | "opencode" | "pi";

const WORKFLOWS = {
    research: {
        description: "Run research templates and write a dated brief",
        runnerDir: "research-runner",
        runtimes: ["anthropic", "codex", "cursor", "opencode", "pi"] as WorkflowRuntime[],
    },
    "seo-review": {
        description: "Review a URL for SEO, performance, and accessibility issues",
        runnerDir: "seo-review-runner",
        runtimes: ["anthropic", "codex", "cursor", "opencode", "pi"] as WorkflowRuntime[],
    },
} as const;

function findRepoRoot(startDir: string): string {
    let dir = startDir;
    for (let i = 0; i < 8; i++) {
        if (existsSync(join(dir, "agents", "research-runner"))) return dir;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return process.cwd();
}

function printWorkflowList(): void {
    console.log("Available workflows:");
    for (const [name, workflow] of Object.entries(WORKFLOWS)) {
        console.log(`  ${name.padEnd(12)} ${workflow.description}`);
        console.log(`              runtimes: ${workflow.runtimes.join(", ")}`);
    }
}

async function runWorkflow(args: string[]): Promise<void> {
    const action = args[0];
    if (!action || action === "--help" || action === "-h") {
        console.log(WORKFLOW_HELP_TEXT);
        return;
    }

    if (action === "list") {
        printWorkflowList();
        return;
    }

    if (action !== "run") {
        throw new Error(`Unknown workflow command "${action}". Use: ai-eng workflow list|run`);
    }

    const { values, positionals } = nodeParseArgs({
        args: args.slice(1),
        options: {
            runtime: { type: "string" },
            agent: { type: "string" },
            templates: { type: "string" },
            "dry-run": { type: "boolean" },
            help: { type: "boolean", short: "h" },
        },
        allowPositionals: true,
    });

    if (values.help) {
        console.log(WORKFLOW_HELP_TEXT);
        return;
    }

    const workflowName = positionals[0] as keyof typeof WORKFLOWS | undefined;
    if (!workflowName || !(workflowName in WORKFLOWS)) {
        throw new Error(`Unknown workflow "${workflowName ?? ""}". Use: ai-eng workflow list`);
    }

    const runtime = (values.runtime ?? "pi") as WorkflowRuntime;
    if (!WORKFLOWS[workflowName].runtimes.includes(runtime)) {
        throw new Error(
            `Runtime "${runtime}" is not available for ${workflowName}. Use: ${WORKFLOWS[workflowName].runtimes.join(", ")}`,
        );
    }

    const goal = positionals.slice(1).join(" ").trim();
    if (!goal) {
        throw new Error(`Missing workflow goal. Example: ai-eng workflow run ${workflowName} --runtime ${runtime} "question"`);
    }

    const repoRoot = findRepoRoot(process.cwd());
    const runnerDir = join(repoRoot, "agents", WORKFLOWS[workflowName].runnerDir, runtime);
    const runnerPath = join(runnerDir, "runner.ts");
    if (!existsSync(runnerPath)) {
        throw new Error(`Missing runner: ${runnerPath}`);
    }

    const runnerArgs = ["tsx", "runner.ts"];
    if (values.templates) runnerArgs.push("--templates", values.templates);
    if (values.agent) runnerArgs.push("--agent", values.agent);
    runnerArgs.push(goal);

    if (values["dry-run"]) {
        console.log(`cd ${runnerDir}`);
        console.log(`npx ${runnerArgs.map((arg) => JSON.stringify(arg)).join(" ")}`);
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const child = spawn("npx", runnerArgs, {
            cwd: runnerDir,
            stdio: "inherit",
            env: {
                ...process.env,
                AI_ENG_WORKFLOW: workflowName,
                AI_ENG_RUNTIME: runtime,
                ...(values.agent ? { AI_ENG_AGENT: values.agent } : {}),
            },
        });
        child.on("error", (err) =>
            reject(new Error(`Failed to spawn workflow runner: ${err.message}. Is npx installed?`)),
        );
        child.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Workflow ${workflowName} failed with exit code ${code ?? "unknown"}`));
        });
    });
}

export const workflowCommand: Subcommand = {
    name: "workflow",
    aliases: ["wf"],
    helpText: WORKFLOW_HELP_TEXT,
    run: runWorkflow,
};
