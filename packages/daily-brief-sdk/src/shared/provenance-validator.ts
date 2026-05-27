/**
 * Cross-checks numeric metrics in a finished brief against the SDK's
 * actual tool_use stream. Zod validates shape; this validates that every
 * numeric value the agent emitted is traceable to a real tool call.
 *
 * The agent gets one chance to invent a metric. If the brief cites a
 * sourceToolCallId that never appeared in any captured tool_use block,
 * we throw ProvenanceError before write.
 *
 * Usage:
 *
 *   const validator = new ProvenanceValidator();
 *   for await (const message of stream) {
 *       validator.observe(message);
 *   }
 *   validator.assertProvenance(parsedBrief);
 *
 * The validator accepts Anthropic SDK message shapes loosely (the SDK's
 * exact types vary by version). Anything matching `{ type: "tool_use",
 * id: <string> }` somewhere in the message tree is captured.
 */

export class ProvenanceError extends Error {
    constructor(
        message: string,
        public readonly missingId: string,
        public readonly capturedIds: ReadonlySet<string>,
    ) {
        super(message);
        this.name = "ProvenanceError";
    }
}

interface ToolUseLike {
    type: string;
    id: string;
}

function isToolUse(node: unknown): node is ToolUseLike {
    return (
        typeof node === "object" &&
        node !== null &&
        "type" in node &&
        (node as { type: unknown }).type === "tool_use" &&
        "id" in node &&
        typeof (node as { id: unknown }).id === "string"
    );
}

function* walkObject(node: unknown): Generator<unknown, void, void> {
    yield node;
    if (Array.isArray(node)) {
        for (const child of node) yield* walkObject(child);
    } else if (typeof node === "object" && node !== null) {
        for (const child of Object.values(node)) yield* walkObject(child);
    }
}

function collectSourceIds(brief: unknown): string[] {
    const ids: string[] = [];
    for (const node of walkObject(brief)) {
        if (
            typeof node === "object" &&
            node !== null &&
            "sourceToolCallId" in node &&
            typeof (node as { sourceToolCallId: unknown }).sourceToolCallId ===
                "string"
        ) {
            ids.push((node as { sourceToolCallId: string }).sourceToolCallId);
        }
    }
    return ids;
}

export class ProvenanceValidator {
    private capturedIds: Set<string> = new Set();

    /**
     * Inspect a message from the SDK stream and capture every tool_use
     * id it contains. Safe to call on any message shape.
     */
    observe(message: unknown): void {
        for (const node of walkObject(message)) {
            if (isToolUse(node)) {
                this.capturedIds.add(node.id);
            }
        }
    }

    /**
     * Throws ProvenanceError if any sourceToolCallId in `brief` is not
     * present in the captured set.
     */
    assertProvenance(brief: unknown): void {
        const required = collectSourceIds(brief);
        for (const id of required) {
            if (!this.capturedIds.has(id)) {
                throw new ProvenanceError(
                    `Brief cites sourceToolCallId="${id}" but no tool_use with that id was observed in the SDK stream.`,
                    id,
                    this.capturedIds,
                );
            }
        }
    }

    /** Number of distinct tool_use ids captured so far. */
    get observedCount(): number {
        return this.capturedIds.size;
    }

    /** Read-only access to the captured set, primarily for tests. */
    get observedIds(): ReadonlySet<string> {
        return this.capturedIds;
    }
}
