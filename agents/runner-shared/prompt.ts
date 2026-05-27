/**
 * Shared prompt formatting for workflow runners.
 *
 * Centralises the agent-instruction concatenation pattern used across
 * research-runner and seo-review-runner.
 */

/**
 * Build a full prompt from system prompt, template text, query, and optional
 * agent instruction.
 */
export function formatPrompt(
    systemPrompt: string,
    templateText: string,
    query: string,
    agentInstruction?: string,
): string {
    const agentPart = agentInstruction
        ? `\n\nAgent instruction: ${agentInstruction}`
        : "";
    return `${systemPrompt}${agentPart}\n\n${templateText}\n\nQuery context: ${query}`;
}

/**
 * Build a single-shot prompt (no template) for workflows like seo-review.
 */
export function formatSinglePrompt(
    basePrompt: string,
    agentInstruction?: string,
): string {
    const agentPart = agentInstruction
        ? `\n\nAgent instruction: ${agentInstruction}`
        : "";
    return `${basePrompt}${agentPart}`;
}
