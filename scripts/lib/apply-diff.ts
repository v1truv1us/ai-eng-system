/**
 * Minimal unified-diff applier for the self-improving skills loop.
 * Supports standard unified diffs with @@ hunks and context lines.
 * Throws on mismatch — callers treat that as a failed candidate.
 */

export interface DiffHunk {
    oldStart: number;
    oldCount: number;
    newStart: number;
    newCount: number;
    lines: string[]; // includes leading ' ', '-', '+' prefixes
}

export function parseUnifiedDiff(diff: string): DiffHunk[] {
    const lines = diff.split("\n");
    const hunks: DiffHunk[] = [];
    let current: DiffHunk | null = null;
    let oldRemaining = 0;
    let newRemaining = 0;

    for (const line of lines) {
        const header = line.match(
            /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/,
        );
        if (header) {
            current = {
                oldStart: Number.parseInt(header[1], 10),
                oldCount: header[2] ? Number.parseInt(header[2], 10) : 1,
                newStart: Number.parseInt(header[3], 10),
                newCount: header[4] ? Number.parseInt(header[4], 10) : 1,
                lines: [],
            };
            oldRemaining = current.oldCount;
            newRemaining = current.newCount;
            hunks.push(current);
            continue;
        }
        if (!current) continue;
        if (oldRemaining <= 0 && newRemaining <= 0) continue;
        if (line === "\\ No newline at end of file") {
            current.lines.push(line);
            continue;
        }
        const prefix = line === "" ? " " : line[0];
        if (prefix === " ") {
            if (oldRemaining <= 0 || newRemaining <= 0) continue;
            current.lines.push(` ${line === "" ? "" : line.slice(1)}`);
            oldRemaining--;
            newRemaining--;
        } else if (prefix === "-") {
            if (oldRemaining <= 0) continue;
            current.lines.push(line);
            oldRemaining--;
        } else if (prefix === "+") {
            if (newRemaining <= 0) continue;
            current.lines.push(line);
            newRemaining--;
        }
    }

    if (hunks.length === 0) {
        throw new Error("No hunks found in diff");
    }
    return hunks;
}

export function applyUnifiedDiff(original: string, diff: string): string {
    const hunks = parseUnifiedDiff(diff);
    const source = original.split("\n");
    const output: string[] = [];
    let cursor = 0; // index into source (0-based)

    for (const hunk of hunks) {
        const hunkStart = hunk.oldStart - 1;
        if (hunkStart < cursor) {
            throw new Error("Overlapping hunks in diff");
        }
        output.push(...source.slice(cursor, hunkStart));
        cursor = hunkStart;

        for (const line of hunk.lines) {
            if (line === "\\ No newline at end of file") continue;
            const prefix = line[0];
            const text = line.slice(1);
            if (prefix === " ") {
                if (source[cursor] !== text) {
                    throw new Error(
                        `Context mismatch at line ${cursor + 1}: expected ${JSON.stringify(text)}, got ${JSON.stringify(source[cursor])}`,
                    );
                }
                output.push(text);
                cursor++;
            } else if (prefix === "-") {
                if (source[cursor] !== text) {
                    throw new Error(
                        `Removal mismatch at line ${cursor + 1}: expected ${JSON.stringify(text)}, got ${JSON.stringify(source[cursor])}`,
                    );
                }
                cursor++;
            } else if (prefix === "+") {
                output.push(text);
            }
        }
    }

    output.push(...source.slice(cursor));
    return output.join("\n");
}
