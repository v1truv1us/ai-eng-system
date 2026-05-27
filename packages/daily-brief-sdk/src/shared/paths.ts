import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();

/**
 * Base directory for cook-and-brief state. Override with COOK_AND_BRIEF_DIR.
 */
export const COOK_AND_BRIEF_DIR =
    process.env.COOK_AND_BRIEF_DIR ?? join(HOME, ".claude", "cook-and-brief");

export const ENV_FILE = join(COOK_AND_BRIEF_DIR, ".env");
export const TELEMETRY_FILE = join(COOK_AND_BRIEF_DIR, "telemetry.jsonl");
export const DREAM_DIGEST_DIR = join(COOK_AND_BRIEF_DIR, "dream-digest");
export const LOGS_DIR = join(COOK_AND_BRIEF_DIR, "logs");

/**
 * Where rendered HTML briefs are written. Override with BRIEFS_OUTPUT_DIR.
 */
export const BRIEFS_OUTPUT_DIR =
    process.env.BRIEFS_OUTPUT_DIR ?? join(HOME, "Documents", "daily-briefs");

export const COOKING_DIR = join(HOME, ".claude", "cooking");

export const MEMORY_GLOB = join(HOME, ".claude", "projects", "*", "memory");

export type WorkflowName =
    | "tomorrow"
    | "morning"
    | "week-ahead"
    | "dream-digest";

export function briefHtmlPath(workflow: WorkflowName, date: string): string {
    return join(BRIEFS_OUTPUT_DIR, `${workflow}-${date}.html`);
}

export function dreamDigestPath(date: string): string {
    return join(DREAM_DIGEST_DIR, `weekly-${date}.html`);
}
