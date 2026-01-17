/**
 * Optimization Techniques
 *
 * Research-backed prompting techniques for improving AI response quality.
 * Based on peer-reviewed research from MBZUAI, Google DeepMind, and ICLR 2024.
 */

import type { TechniqueConfig, TechniqueContext } from "./types";

/**
 * Expert Persona technique
 * Research: Kong et al. (2023) - 24% → 84% accuracy improvement
 */
export const expertPersona: TechniqueConfig = {
    id: "expert_persona",
    name: "Expert Persona",
    description:
        "Assigns a detailed expert role with years of experience and notable companies",
    researchBasis: "Kong et al. 2023: 24% → 84% accuracy improvement",
    appliesTo: ["medium", "complex"],
    generate: (context: TechniqueContext) => {
        // Check for custom persona
        if (context.preferences.customPersonas[context.domain]) {
            return context.preferences.customPersonas[context.domain];
        }

        // Default domain-specific personas
        const personas: Record<string, string> = {
            security:
                "You are a senior security engineer with 15+ years of authentication and cryptography experience. You have worked at Auth0, Okta, and AWS IAM, building production-grade authentication systems handling millions of users.",
            frontend:
                "You are a senior frontend architect with 12+ years of React, Vue, and TypeScript experience. You have built large-scale applications at Vercel, Stripe, and Airbnb, focusing on performance, accessibility, and developer experience.",
            backend:
                "You are a senior backend engineer with 15+ years of distributed systems and API design experience. You have built microservices architectures at Netflix, Google, and Stripe, handling billions of requests.",
            database:
                "You are a senior database architect with 15+ years of PostgreSQL, MySQL, and distributed database experience. You have optimized databases at CockroachDB, PlanetScale, and AWS, handling petabytes of data.",
            devops: "You are a senior platform engineer with 12+ years of Kubernetes, CI/CD, and infrastructure experience. You have built deployment pipelines at GitLab, CircleCI, and AWS, managing thousands of services.",
            architecture:
                "You are a principal software architect with 20+ years of system design experience. You have architected large-scale systems at Amazon, Microsoft, and Google, handling complex requirements and constraints.",
            testing:
                "You are a senior QA architect with 12+ years of test automation and quality engineering experience. You have built testing frameworks at Selenium, Cypress, and Playwright, ensuring production quality.",
            general:
                "You are a senior software engineer with 15+ years of full-stack development experience. You have built production applications at top technology companies, following best practices and industry standards.",
        };

        return personas[context.domain] || personas.general;
    },
};

/**
 * Reasoning Chain technique
 * Research: Yang et al. (2023, Google DeepMind OPRO) - 34% → 80% accuracy
 */
export const reasoningChain: TechniqueConfig = {
    id: "reasoning_chain",
    name: "Step-by-Step Reasoning",
    description:
        "Adds systematic analysis instruction for methodical problem-solving",
    researchBasis: "Yang et al. 2023 (Google DeepMind): 34% → 80% accuracy",
    appliesTo: ["medium", "complex"],
    generate: (context: TechniqueContext) => {
        const baseInstruction =
            "Take a deep breath and analyze this step by step.";

        // Domain-specific reasoning guidance
        const domainGuidance: Record<string, string> = {
            security:
                " Consider each component of the authentication/authorization flow, identify potential vulnerabilities, and ensure defense in depth.",
            frontend:
                " Consider component hierarchy, state management, performance implications, and accessibility requirements.",
            backend:
                " Consider API design, data flow, error handling, scalability, and edge cases.",
            database:
                " Consider query execution plans, indexing strategies, data consistency, and performance implications.",
            devops: " Consider infrastructure as code, deployment strategies, monitoring, and rollback procedures.",
            architecture:
                " Consider system constraints, trade-offs, scalability, reliability, and maintainability.",
            testing:
                " Consider test coverage, edge cases, integration points, and test maintainability.",
            general:
                " Consider each component systematically, identify dependencies, and ensure thorough coverage.",
        };

        return (
            baseInstruction +
            (domainGuidance[context.domain] || domainGuidance.general)
        );
    },
};

/**
 * Stakes Language technique
 * Research: Bsharat et al. (2023, MBZUAI) - Principle #6: +45% quality improvement
 */
export const stakesLanguage: TechniqueConfig = {
    id: "stakes_language",
    name: "Stakes Language",
    description:
        "Adds importance and consequence framing to encourage thorough analysis",
    researchBasis: "Bsharat et al. 2023 (MBZUAI): +45% quality improvement",
    appliesTo: ["medium", "complex"],
    generate: (context: TechniqueContext) => {
        const stakes: Record<string, string> = {
            security:
                "This is critical to production security. A thorough, secure solution is essential to protect users and data.",
            frontend:
                "This directly impacts user experience and business metrics. Quality, performance, and accessibility are essential.",
            backend:
                "This affects system reliability and scalability. A robust, performant solution is essential for production.",
            database:
                "This impacts data integrity and system performance. An optimized, reliable solution is essential.",
            devops: "This affects deployment reliability and system stability. A well-tested, safe solution is essential for production.",
            architecture:
                "This affects long-term system maintainability and scalability. A well-designed solution is essential.",
            testing:
                "This affects production quality and user experience. Comprehensive testing is essential to prevent regressions.",
            general:
                "This is important for the project's success. A thorough, complete solution is essential.",
        };

        return stakes[context.domain] || stakes.general;
    },
};

/**
 * Challenge Framing technique
 * Research: Li et al. (2023, ICLR 2024) - +115% improvement on hard tasks
 */
export const challengeFraming: TechniqueConfig = {
    id: "challenge_framing",
    name: "Challenge Framing",
    description:
        "Frames the problem as a challenge to encourage deeper thinking on hard tasks",
    researchBasis:
        "Li et al. 2023 (ICLR 2024): +115% improvement on hard tasks",
    appliesTo: ["complex"], // Only for complex tasks
    generate: (context: TechniqueContext) => {
        return "This is a challenging problem that requires careful consideration of edge cases, trade-offs, and multiple approaches. Don't settle for the first solution - explore alternatives and justify your choices.";
    },
};

/**
 * Self-Evaluation technique
 * Research: Improves response calibration and identifies uncertainties
 */
export const selfEvaluation: TechniqueConfig = {
    id: "self_evaluation",
    name: "Self-Evaluation Request",
    description:
        "Requests confidence rating and assumption identification for quality assurance",
    researchBasis: "Improves response calibration and identifies uncertainties",
    appliesTo: ["medium", "complex"],
    generate: (context: TechniqueContext) => {
        let evaluation = "After providing your solution:";

        evaluation += "\n\n1. Rate your confidence in this solution from 0-1.";
        evaluation += "\n2. Identify any assumptions you made.";
        evaluation += "\n3. Note any limitations or potential issues.";

        if (
            context.domain === "security" ||
            context.domain === "database" ||
            context.domain === "devops"
        ) {
            evaluation += "\n4. Suggest how to test or validate this solution.";
        }

        return evaluation;
    },
};

/**
 * Analysis step (always included as first step)
 */
export const analysisStep: TechniqueConfig = {
    id: "analysis",
    name: "Prompt Analysis",
    description: "Analyzes prompt complexity, domain, and missing context",
    researchBasis: "Provides context-aware optimization",
    appliesTo: ["simple", "medium", "complex"],
    generate: (context: TechniqueContext) => {
        const complexityLabels: Record<string, string> = {
            simple: "Simple (greeting or basic request)",
            medium: "Medium (requires some analysis and problem-solving)",
            complex:
                "Complex (requires deep analysis, multiple considerations)",
        };

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

        return `Analysis:\n- Complexity: ${complexityLabels[context.complexity]}\n- Domain: ${domainLabels[context.domain] || domainLabels.general}`;
    },
};

/**
 * All available techniques
 */
export const ALL_TECHNIQUES: TechniqueConfig[] = [
    analysisStep,
    expertPersona,
    reasoningChain,
    stakesLanguage,
    challengeFraming,
    selfEvaluation,
];

/**
 * Get technique by ID
 */
export function getTechniqueById(id: string): TechniqueConfig | undefined {
    return ALL_TECHNIQUES.find((t) => t.id === id);
}

/**
 * Get applicable techniques for given complexity
 */
export function getTechniquesForComplexity(
    complexity: "simple" | "medium" | "complex",
): TechniqueConfig[] {
    return ALL_TECHNIQUES.filter((t) => t.appliesTo.includes(complexity));
}
