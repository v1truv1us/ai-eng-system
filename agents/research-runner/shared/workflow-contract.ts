/**
 * Target contract for harness workflow runners under agents/research-runner/.
 *
 * Existing runners use CLI args (`runner.ts "goal"`, `--templates`) and write
 * vault briefs via shared/output.ts. New workflows should implement this shape
 * in code when they need structured status, artifacts, and resume.
 */

export type WorkflowStatus = "success" | "blocked" | "failed";

export interface WorkflowInput {
  goal: string;
  cwd?: string;
  model?: string;
  maxTurns?: number;
  maxIterations?: number;
  templates?: string[];
  gates?: string[];
  statePath?: string;
}

export interface WorkflowResult {
  status: WorkflowStatus;
  summary: string;
  artifacts: string[];
  nextSteps?: string[];
  handoffs?: unknown[];
  verification?: string[];
  piSession?: string;
  safetyNotes?: string[];
}
