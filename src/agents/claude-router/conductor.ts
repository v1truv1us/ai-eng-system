/**
 * Conductor — the routing brain of the dynamic router.
 *
 * Uses core routing logic + a harness adapter to dispatch tasks.
 * The conductor decides *what* to run; adapters decide *how*.
 */

import { getAdapter } from "./adapters";
import { ANTHROPIC_MODEL_FAMILY } from "./adapters/anthropic";
import { buildPlan, route } from "./core/router";
import type {
    ChainedStep,
    ConductorResult,
    ExecutionPlan,
    HarnessName,
    RouterAdapter,
    RoutingDecision,
    SubagentResult,
    TaskInput,
} from "./core/types";

/**
 * Run the full conductor pipeline with a specific adapter.
 * Defaults to the Anthropic adapter for backward compatibility.
 */
export async function conduct(
    input: TaskInput,
    adapterOrName: RouterAdapter | HarnessName = "anthropic",
): Promise<ConductorResult> {
    const adapter =
        typeof adapterOrName === "string"
            ? getAdapter(adapterOrName)
            : adapterOrName;

    const startTime = Date.now();
    const plan = buildPlan(input.task, adapter.models);
    const results: SubagentResult[] = [];
    let previousOutput: string | undefined;

    for (const step of plan.steps) {
        const result = await executeStep(adapter, step, previousOutput);
        results.push(result);
        if (result.success) {
            previousOutput = result.output;
        } else {
            break;
        }
    }

    const allSucceeded = results.every((r) => r.success);
    const summary = results.map((r) => r.output).join("\n\n");

    return {
        plan,
        results,
        success: allSucceeded,
        summary,
        totalTimeMs: Date.now() - startTime,
    };
}

/**
 * Execute a single step via a harness adapter.
 */
async function executeStep(
    adapter: RouterAdapter,
    step: ChainedStep,
    previousOutput?: string,
): Promise<SubagentResult> {
    let prompt = step.prompt;
    if (previousOutput) {
        prompt = prompt.replace("{previous_output}", previousOutput);
    }
    return adapter.execute(step.decision, prompt);
}

/**
 * Quick route: get a routing decision for a task using a specific adapter's
 * model family. Defaults to Anthropic.
 */
export function routeTask(
    task: string,
    adapterOrName: RouterAdapter | HarnessName = "anthropic",
): RoutingDecision {
    const adapter =
        typeof adapterOrName === "string"
            ? getAdapter(adapterOrName)
            : adapterOrName;
    return route(task, adapter.models);
}

/**
 * Quick plan: build an execution plan for a task using a specific adapter's
 * model family. Defaults to Anthropic.
 */
export function planTask(
    task: string,
    adapterOrName: RouterAdapter | HarnessName = "anthropic",
): ExecutionPlan {
    const adapter =
        typeof adapterOrName === "string"
            ? getAdapter(adapterOrName)
            : adapterOrName;
    return buildPlan(task, adapter.models);
}

// Re-export core functions for backward compatibility.
// These default to the Anthropic model family.
export {
    assessComplexity,
    buildPlan,
    detectIntent,
    route,
    selectRole,
    shouldChain,
} from "./core/router";
