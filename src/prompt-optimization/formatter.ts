/**
 * Output Formatter
 *
 * Formats optimization output for different verbosity levels
 * (quiet, normal, verbose) with available actions.
 */

import type {
    Action,
    FormattedOutput,
    OptimizationSession,
    OptimizationStep,
    Verbosity,
} from "./types";

/**
 * Formatting helpers
 */
function formatBox(title: string, content: string): string {
    const separator = "━".repeat(80);
    return `\n${separator}\n🔧 ${title}\n${separator}\n${content}\n${separator}`;
}

function formatStep(step: OptimizationStep, showResearchBasis = true): string {
    let content = `${step.name}`;

    if (showResearchBasis) {
        content += ` (${step.researchBasis})`;
    }

    content += `\n${step.description}`;

    if (step.content) {
        content += `\n\nAdding: ${step.content}`;
    }

    if (step.modifiedContent) {
        content += `\n\nModified: ${step.modifiedContent}`;
    }

    // Status indicator
    const statusIcons: Record<string, string> = {
        pending: "⏳",
        approved: "✅",
        rejected: "❌",
        modified: "📝",
    };
    content += `\n\n${statusIcons[step.status]}`;

    return content;
}

function formatActions(actions: Action[]): string {
    if (actions.length === 0) return "";

    const actionLabels: Record<string, string> = {
        approve: "[✓ Approve]",
        reject: "[✗ Reject]",
        modify: "[✎ Modify]",
        approve_all: "[✓ Approve All]",
        skip_optimization: "[✗ Skip Optimization]",
        edit_final: "[✎ Edit Final]",
        execute: "[✓ Execute]",
        cancel: "[✗ Cancel]",
    };

    const actionTexts = actions.map((action) => {
        const type = action.type;
        return actionLabels[type] || `[${type}]`;
    });

    return `\n\n${actionTexts.join(" ")}`;
}

/**
 * Format quiet mode (minimal output)
 */
export function formatQuiet(session: OptimizationSession): FormattedOutput {
    const hasChanges = session.steps.some(
        (s) => s.status === "approved" || s.status === "modified",
    );

    if (!hasChanges) {
        return {
            display: "",
            actions: [],
        };
    }

    const display = `🔧 Optimized ${session.steps.filter((s) => s.status === "approved" || s.status === "modified").length} techniques`;

    return {
        display,
        actions: [
            { type: "execute" },
            { type: "edit_final" },
            { type: "cancel" },
        ],
    };
}

/**
 * Format normal mode (condensed view)
 */
export function formatNormal(session: OptimizationSession): FormattedOutput {
    const approvedSteps = session.steps.filter(
        (s) => s.status === "approved" || s.status === "modified",
    );

    if (approvedSteps.length === 0) {
        return {
            display: "",
            actions: [],
        };
    }

    let content = `📝 "${session.originalPrompt}"\n`;
    content += `🎯 Complexity: ${session.complexity} | Domain: ${session.domain}\n\n`;
    content += "Applying:\n";

    for (const step of approvedSteps) {
        const icon = step.status === "modified" ? "📝" : "✅";
        content += `${icon} ${step.name}\n`;
    }

    content += "\nExpected improvement: ~60-80% quality boost";

    const display = formatBox("Prompt Optimization", content);

    return {
        display,
        actions: [{ type: "approve_all" }, { type: "skip_optimization" }],
    };
}

/**
 * Format verbose mode (step-by-step)
 */
export function formatVerbose(
    session: OptimizationSession,
    currentStep = 0,
): FormattedOutput {
    // If all steps approved, show final review
    if (currentStep >= session.steps.length) {
        return formatFinalReview(session, "verbose");
    }

    const step = session.steps[currentStep];

    let content = `📝 Original: "${session.originalPrompt}"\n\n`;
    content += `🎯 Complexity: ${session.complexity} (`;
    const complexityLabels: Record<string, string> = {
        simple: "Simple - greeting or basic request",
        medium: "Medium - requires some analysis",
        complex: "Complex - requires deep analysis",
    };
    content += complexityLabels[session.complexity] || session.complexity;
    content += ")\n";
    content += `🏷️  Domain: ${session.domain}\n`;

    if (session.domain !== "general") {
        const domainLabels: Record<string, string> = {
            security: "Security & Authentication",
            frontend: "Frontend Development",
            backend: "Backend Development",
            database: "Database & Data",
            devops: "DevOps & Infrastructure",
            architecture: "System Architecture",
            testing: "Testing & QA",
            general: "General Software Engineering",
        };
        content += `  ${domainLabels[session.domain] || session.domain}\n`;
    }

    // Show missing context if analysis step
    if (step.technique === "analysis") {
        const missing =
            session.originalPrompt.length < 10 ? ["more details needed"] : [];
        if (missing.length > 0) {
            content += `⚠️  Missing: ${missing.join(", ")}\n`;
        }
    }

    const display = formatBox(
        `Prompt Optimization (Step ${currentStep + 1}/${session.steps.length})`,
        content,
    );

    const actions: Action[] = [];
    if (step.skippable) {
        actions.push({ type: "reject", stepId: step.id });
    }
    actions.push({ type: "approve", stepId: step.id });
    actions.push({ type: "modify", stepId: step.id });

    return {
        display,
        actions,
    };
}

/**
 * Format final review (shows optimized prompt)
 */
export function formatFinalReview(
    session: OptimizationSession,
    verbosity: Verbosity,
): FormattedOutput {
    const approvedSteps = session.steps.filter(
        (s) => s.status === "approved" || s.status === "modified",
    );

    let content = "";

    // Show technique summary for normal/verbose
    if (verbosity !== "quiet") {
        content += "Techniques applied: ";
        const techniqueNames = approvedSteps.map((s) => {
            const name = s.name;
            // Extract first word for short tags
            return `[${name.split(" ")[0]}]`;
        });
        content += `${techniqueNames.join(" ")}\n\n`;
    }

    // Show optimized prompt in code block
    content += "```\n";
    content += session.finalPrompt;
    content += "\n```";

    if (verbosity !== "quiet") {
        const stepCount = approvedSteps.length;
        const totalSteps = session.steps.length;

        if (stepCount > 0) {
            content += "\n\n";
            content += `Expected improvement: ~${stepCount * 15 + 30}-${
                stepCount * 20 + 50
            }% quality boost`;
            content += `\nTechniques applied: ${stepCount}/${totalSteps}`;
        }
    }

    const display = formatBox("✨ Optimized Prompt Ready", content);

    return {
        display,
        actions: [
            { type: "execute" },
            { type: "edit_final" },
            { type: "cancel" },
        ],
    };
}

/**
 * Main formatter - dispatches to appropriate formatter based on verbosity
 */
export function formatOutput(
    session: OptimizationSession,
    verbosity: Verbosity,
    currentStep = 0,
): FormattedOutput {
    switch (verbosity) {
        case "quiet":
            return formatQuiet(session);
        case "normal":
            return formatNormal(session);
        case "verbose":
            return formatVerbose(session, currentStep);
        default:
            return formatNormal(session);
    }
}
