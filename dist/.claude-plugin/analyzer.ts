/**
 * Prompt Analyzer
 *
 * Analyzes user prompts to determine complexity, domain,
 * and missing context. Uses a combination of word count,
 * keyword detection, and pattern matching.
 */

import type { AnalysisResult, Complexity, Domain, TechniqueId } from "./types";

/**
 * Keywords for complexity detection
 */
const COMPLEXITY_KEYWORDS = {
    debug: ["debug", "fix", "error", "bug", "issue", "problem", "troubleshoot"],
    design: [
        "design",
        "architecture",
        "architect",
        "structure",
        "pattern",
        "approach",
    ],
    optimize: [
        "optimize",
        "improve",
        "performance",
        "efficient",
        "fast",
        "scale",
    ],
    implement: ["implement", "build", "create", "develop", "write", "code"],
    complex: ["complex", "challenge", "difficult", "advanced", "sophisticated"],
};

/**
 * Domain-specific keywords
 */
const DOMAIN_KEYWORDS: Record<Domain, string[]> = {
    security: [
        "auth",
        "authentication",
        "jwt",
        "oauth",
        "password",
        "encrypt",
        "decrypt",
        "security",
        "token",
        "session",
        "csrf",
        "xss",
        "injection",
        "vulnerability",
        "hack",
        "attack",
    ],
    frontend: [
        "react",
        "vue",
        "angular",
        "component",
        "css",
        "html",
        "ui",
        "ux",
        "render",
        "state",
        "hook",
        "props",
        "dom",
        "frontend",
        "client",
    ],
    backend: [
        "api",
        "server",
        "endpoint",
        "database",
        "query",
        "backend",
        "service",
        "microservice",
        "rest",
        "graphql",
        "http",
        "request",
        "response",
    ],
    database: [
        "sql",
        "postgresql",
        "mysql",
        "mongodb",
        "redis",
        "query",
        "index",
        "schema",
        "migration",
        "database",
        "db",
        "join",
        "transaction",
        "orm",
    ],
    devops: [
        "deploy",
        "ci/cd",
        "docker",
        "kubernetes",
        "k8s",
        "pipeline",
        "infrastructure",
        "aws",
        "gcp",
        "azure",
        "terraform",
        "ansible",
        "jenkins",
        "devops",
        "ops",
    ],
    architecture: [
        "architecture",
        "design",
        "pattern",
        "microservices",
        "monolith",
        "scalability",
        "system",
        "distributed",
        "architect",
        "high-level",
    ],
    testing: [
        "test",
        "spec",
        "unit test",
        "integration test",
        "e2e",
        "jest",
        "cypress",
        "playwright",
        "testing",
        "tdd",
        "coverage",
        "mock",
        "stub",
    ],
    general: [], // Fallback domain
};

/**
 * Simple prompt patterns (greetings, simple questions)
 */
const SIMPLE_PATTERNS = [
    /^(hello|hi|hey|greetings|good morning|good evening)/i,
    /^(thanks|thank you|thx)/i,
    /^(yes|no|ok|sure|alright)/i,
    /^(what|how|why|when|where|who|which)\s+\w+\??$/i, // Simple single questions
    /^(help|assist)\s*$/i,
];

/**
 * Calculate complexity score for a prompt
 */
function calculateComplexityScore(prompt: string): number {
    const words = prompt.split(/\s+/);
    const wordCount = words.length;

    let score = 0;

    // Word count contribution (0-10 points)
    if (wordCount < 5) score += 0;
    else if (wordCount < 10) score += 3;
    else if (wordCount < 20) score += 6;
    else score += 10;

    // Keyword contribution (0-10 points)
    const lowerPrompt = prompt.toLowerCase();
    for (const category of Object.values(COMPLEXITY_KEYWORDS)) {
        for (const keyword of category) {
            if (lowerPrompt.includes(keyword)) {
                score += 2;
                break; // One keyword per category
            }
        }
    }

    // Question marks reduce complexity (asking for info is simpler)
    const questionMarks = (prompt.match(/\?/g) || []).length;
    score -= Math.min(questionMarks * 2, 5);

    // Technical terms increase complexity
    const techTerms = words.filter((word) => {
        const lower = word.toLowerCase();
        return (
            /\w{4,}/.test(word) &&
            !["this", "that", "with", "from", "into"].includes(lower)
        );
    });
    score += Math.min(techTerms.length * 0.5, 5);

    return Math.max(0, Math.min(20, score));
}

/**
 * Determine complexity from score
 */
function scoreToComplexity(score: number): Complexity {
    if (score < 5) return "simple";
    if (score < 12) return "medium";
    return "complex";
}

/**
 * Check if prompt matches simple patterns
 */
function isSimplePrompt(prompt: string): boolean {
    for (const pattern of SIMPLE_PATTERNS) {
        if (pattern.test(prompt.trim())) {
            return true;
        }
    }
    return false;
}

/**
 * Detect domain from prompt keywords
 */
function detectDomain(prompt: string): Domain {
    const lowerPrompt = prompt.toLowerCase();

    // Count keyword matches per domain
    const scores: Record<Domain, number> = {
        security: 0,
        frontend: 0,
        backend: 0,
        database: 0,
        devops: 0,
        architecture: 0,
        testing: 0,
        general: 0,
    };

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerPrompt.includes(keyword)) {
                scores[domain as Domain]++;
            }
        }
    }

    // Find domain with highest score
    let bestDomain: Domain = "general";
    let bestScore = 0;

    for (const [domain, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestDomain = domain as Domain;
        }
    }

    return bestDomain;
}

/**
 * Extract keywords from prompt
 */
function extractKeywords(prompt: string): string[] {
    const keywords: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Extract from complexity keywords
    for (const [category, terms] of Object.entries(COMPLEXITY_KEYWORDS)) {
        for (const term of terms) {
            if (lowerPrompt.includes(term) && !keywords.includes(term)) {
                keywords.push(term);
            }
        }
    }

    // Extract from domain keywords
    for (const [domain, terms] of Object.entries(DOMAIN_KEYWORDS)) {
        for (const term of terms) {
            if (lowerPrompt.includes(term) && !keywords.includes(term)) {
                keywords.push(term);
            }
        }
    }

    return keywords;
}

/**
 * Identify missing context based on prompt content
 */
function identifyMissingContext(prompt: string, domain: Domain): string[] {
    const missing: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Check for debug/fix requests
    if (
        lowerPrompt.includes("fix") ||
        lowerPrompt.includes("debug") ||
        lowerPrompt.includes("error")
    ) {
        if (
            !lowerPrompt.includes("error") &&
            !lowerPrompt.includes("exception")
        ) {
            missing.push("error message or stack trace");
        }
        if (!/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
            missing.push("file or code location");
        }
    }

    // Check for tech stack
    const techKeywords = [
        "javascript",
        "typescript",
        "python",
        "go",
        "java",
        "rust",
        "react",
        "vue",
        "angular",
        "node",
        "express",
        "django",
        "flask",
    ];
    const hasTech = techKeywords.some((tech) => lowerPrompt.includes(tech));
    if (!hasTech && !/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
        missing.push("technology stack");
    }

    // Domain-specific missing context
    if (domain === "security") {
        if (
            !lowerPrompt.includes("jwt") &&
            !lowerPrompt.includes("oauth") &&
            !lowerPrompt.includes("session")
        ) {
            missing.push("authentication method (JWT, OAuth, session, etc.)");
        }
    }

    if (domain === "database") {
        if (
            !lowerPrompt.includes("sql") &&
            !lowerPrompt.includes("mysql") &&
            !lowerPrompt.includes("postgresql") &&
            !lowerPrompt.includes("mongodb")
        ) {
            missing.push("database type");
        }
        if (!lowerPrompt.includes("index")) {
            missing.push("index information");
        }
    }

    return missing;
}

/**
 * Suggest techniques based on analysis
 */
function suggestTechniques(
    complexity: Complexity,
    domain: Domain,
): TechniqueId[] {
    const techniques: TechniqueId[] = [];

    // Always start with analysis
    techniques.push("analysis");

    // Expert persona for medium and complex
    if (complexity === "medium" || complexity === "complex") {
        techniques.push("expert_persona");
    }

    // Reasoning chain for medium and complex
    if (complexity === "medium" || complexity === "complex") {
        techniques.push("reasoning_chain");
    }

    // Stakes language for medium and complex
    if (complexity === "medium" || complexity === "complex") {
        techniques.push("stakes_language");
    }

    // Challenge framing only for complex
    if (complexity === "complex") {
        techniques.push("challenge_framing");
    }

    // Self-evaluation for medium and complex
    if (complexity === "medium" || complexity === "complex") {
        techniques.push("self_evaluation");
    }

    return techniques;
}

/**
 * Main analysis function
 */
export function analyzePrompt(prompt: string): AnalysisResult {
    // Check for simple patterns first
    if (isSimplePrompt(prompt)) {
        return {
            complexity: "simple",
            domain: "general",
            keywords: [],
            missingContext: [],
            suggestedTechniques: ["analysis"],
        };
    }

    // Calculate complexity
    const complexityScore = calculateComplexityScore(prompt);
    const complexity = scoreToComplexity(complexityScore);

    // Detect domain
    const domain = detectDomain(prompt);

    // Extract keywords
    const keywords = extractKeywords(prompt);

    // Identify missing context
    const missingContext = identifyMissingContext(prompt, domain);

    // Suggest techniques
    const suggestedTechniques = suggestTechniques(complexity, domain);

    return {
        complexity,
        domain,
        keywords,
        missingContext,
        suggestedTechniques,
    };
}
