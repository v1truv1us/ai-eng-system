import { tool } from "@opencode-ai/plugin";

interface PromptOptimizationResult {
    version: 1;
    originalPrompt: string;
    optimizedPrompt: string;
    domain: string;
    complexity: string;
    steps: Array<{
        id: string;
        title: string;
        before?: string;
        after: string;
    }>;
    skipped: boolean;
    skipReason?: string;
}

export default tool({
    description:
        "Step-by-step prompt optimization with research-backed techniques. Returns JSON with optimized prompt and steps. Use ! prefix to skip.",

    args: {
        prompt: tool.schema.string().describe("The user's prompt to optimize"),
    },

    async execute(args) {
        const { prompt } = args;

        // Escape hatch: ! prefix skips optimization
        if (prompt.startsWith("!")) {
            const result: PromptOptimizationResult = {
                version: 1,
                originalPrompt: prompt,
                optimizedPrompt: prompt.slice(1), // Remove ! prefix
                domain: "unknown",
                complexity: "unknown",
                steps: [],
                skipped: true,
                skipReason: "User requested bypass with ! prefix",
            };
            return JSON.stringify(result, null, 2);
        }

        // Simple analysis
        const lowerPrompt = prompt.toLowerCase();
        let domain = "general";

        if (
            lowerPrompt.includes("auth") ||
            lowerPrompt.includes("token") ||
            lowerPrompt.includes("jwt")
        ) {
            domain = "security";
        } else if (
            lowerPrompt.includes("react") ||
            lowerPrompt.includes("vue")
        ) {
            domain = "frontend";
        } else if (
            lowerPrompt.includes("api") ||
            lowerPrompt.includes("server")
        ) {
            domain = "backend";
        } else if (
            lowerPrompt.includes("sql") ||
            lowerPrompt.includes("database")
        ) {
            domain = "database";
        } else if (
            lowerPrompt.includes("deploy") ||
            lowerPrompt.includes("docker")
        ) {
            domain = "devops";
        }

        const wordCount = prompt.split(/\s+/).length;
        let complexity = "simple";

        if (
            wordCount > 20 ||
            lowerPrompt.includes("optimize") ||
            lowerPrompt.includes("design")
        ) {
            complexity = "complex";
        } else if (wordCount > 10) {
            complexity = "medium";
        }

        // Skip simple prompts
        if (complexity === "simple") {
            const result: PromptOptimizationResult = {
                version: 1,
                originalPrompt: prompt,
                optimizedPrompt: prompt,
                domain,
                complexity,
                steps: [],
                skipped: true,
                skipReason: "Simple prompt - optimization not beneficial",
            };
            return JSON.stringify(result, null, 2);
        }

        // Build optimization steps
        const personas: Record<string, string> = {
            security:
                "You are a senior security engineer with 15+ years of authentication experience.",
            frontend:
                "You are a senior frontend architect with 12+ years of React/Vue experience.",
            backend:
                "You are a senior backend engineer with 15+ years of distributed systems experience.",
            database:
                "You are a senior database architect with 15+ years of PostgreSQL experience.",
            devops: "You are a senior platform engineer with 12+ years of Kubernetes experience.",
            architecture:
                "You are a principal software architect with 20+ years of system design experience.",
            general:
                "You are a senior software engineer with 15+ years of full-stack development experience.",
        };

        const steps: PromptOptimizationResult["steps"] = [];
        const parts: string[] = [];

        // Step 1: Expert Persona
        const persona = personas[domain] || personas.general;
        steps.push({
            id: "persona",
            title: "Expert Persona",
            before: "",
            after: persona,
        });
        parts.push(persona);

        // Step 2: Step-by-Step Reasoning
        const reasoning = "Take a deep breath and analyze this step by step.";
        steps.push({
            id: "reasoning",
            title: "Step-by-Step Reasoning",
            before: "",
            after: reasoning,
        });
        parts.push(reasoning);

        // Step 3: Stakes Language
        const stakes =
            "This is important for the project's success. A thorough, complete solution is essential.";
        steps.push({
            id: "stakes",
            title: "Stakes Language",
            before: "",
            after: stakes,
        });
        parts.push(stakes);

        // Step 4: Self-Evaluation
        const selfEval =
            "After providing your solution, rate your confidence 0-1 and identify any assumptions you made.";
        steps.push({
            id: "selfEval",
            title: "Self-Evaluation",
            before: "",
            after: selfEval,
        });
        parts.push(selfEval);

        // Append original task
        parts.push(`\n\nTask: ${prompt}`);

        const optimizedPrompt = parts.join("\n\n");

        const result: PromptOptimizationResult = {
            version: 1,
            originalPrompt: prompt,
            optimizedPrompt,
            domain,
            complexity,
            steps,
            skipped: false,
        };

        return JSON.stringify(result, null, 2);
    },
});
