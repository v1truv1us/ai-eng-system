/**
 * Routes a finished dream-digest to its on-disk HTML file. The hard
 * invariant: NEVER write into the auto-memory directories under
 * ~/.claude/projects/<id>/memory/. That path is reserved for factual
 * auto-memory; dream-digest is speculative synthesis and would poison
 * every future session.
 *
 * Output target: ~/.claude/cook-and-brief/dream-digest/weekly-YYYY-MM-DD.html
 *
 * Filename collisions trigger a numeric suffix (weekly-YYYY-MM-DD-2.html);
 * never overwrite an existing file.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DREAM_DIGEST_DIR } from "./paths.js";

export interface DreamDigestWriteOptions {
    /** ISO-8601 date for the filename, YYYY-MM-DD. */
    date: string;
    /** Rendered HTML content. */
    html: string;
    /** Override output dir (used by tests). */
    outputDir?: string;
}

export class DreamDigestPathError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DreamDigestPathError";
    }
}

/**
 * Refuse to write if the resolved path is inside any project's memory
 * directory. Belt-and-braces — the default outputDir already points at
 * ~/.claude/cook-and-brief/dream-digest/, but if a caller passes a
 * malicious or buggy override we want to fail loud.
 */
function assertOutsideMemory(path: string): void {
    if (/[/\\]\.claude[/\\]projects[/\\][^/\\]+[/\\]memory(?:[/\\]|$)/.test(path)) {
        throw new DreamDigestPathError(
            `dream-digest output target "${path}" lies inside an auto-memory directory; refusing to write (would poison cross-session memory).`,
        );
    }
}

/**
 * Compute the next available weekly path. If
 * `weekly-YYYY-MM-DD.html` already exists, try `-2`, `-3`, ... until a
 * fresh name is found.
 */
export function nextAvailablePath(date: string, outputDir: string): string {
    const base = join(outputDir, `weekly-${date}`);
    const candidate = `${base}.html`;
    if (!existsSync(candidate)) return candidate;
    for (let n = 2; n < 100; n++) {
        const next = `${base}-${n}.html`;
        if (!existsSync(next)) return next;
    }
    throw new Error(
        `dream-digest: too many existing files for ${date} in ${outputDir}`,
    );
}

export function writeDreamDigest(
    opts: DreamDigestWriteOptions,
): { path: string } {
    const outputDir = opts.outputDir ?? DREAM_DIGEST_DIR;
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    const path = nextAvailablePath(opts.date, outputDir);
    assertOutsideMemory(path);
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, opts.html, { encoding: "utf-8" });
    return { path };
}
