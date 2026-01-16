// src/prompt-optimization/analyzer.ts
var COMPLEXITY_KEYWORDS = {
  debug: ["debug", "fix", "error", "bug", "issue", "problem", "troubleshoot"],
  design: [
    "design",
    "architecture",
    "architect",
    "structure",
    "pattern",
    "approach"
  ],
  optimize: [
    "optimize",
    "improve",
    "performance",
    "efficient",
    "fast",
    "scale"
  ],
  implement: ["implement", "build", "create", "develop", "write", "code"],
  complex: ["complex", "challenge", "difficult", "advanced", "sophisticated"]
};
var DOMAIN_KEYWORDS = {
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
    "attack"
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
    "client"
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
    "response"
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
    "orm"
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
    "ops"
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
    "high-level"
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
    "stub"
  ],
  general: []
};
var SIMPLE_PATTERNS = [
  /^(hello|hi|hey|greetings|good morning|good evening)/i,
  /^(thanks|thank you|thx)/i,
  /^(yes|no|ok|sure|alright)/i,
  /^(what|how|why|when|where|who|which)\s+\w+\??$/i,
  /^(help|assist)\s*$/i
];
function calculateComplexityScore(prompt) {
  const words = prompt.split(/\s+/);
  const wordCount = words.length;
  let score = 0;
  if (wordCount < 5)
    score += 0;
  else if (wordCount < 10)
    score += 3;
  else if (wordCount < 20)
    score += 6;
  else
    score += 10;
  const lowerPrompt = prompt.toLowerCase();
  for (const category of Object.values(COMPLEXITY_KEYWORDS)) {
    for (const keyword of category) {
      if (lowerPrompt.includes(keyword)) {
        score += 2;
        break;
      }
    }
  }
  const questionMarks = (prompt.match(/\?/g) || []).length;
  score -= Math.min(questionMarks * 2, 5);
  const techTerms = words.filter((word) => {
    const lower = word.toLowerCase();
    return /\w{4,}/.test(word) && !["this", "that", "with", "from", "into"].includes(lower);
  });
  score += Math.min(techTerms.length * 0.5, 5);
  return Math.max(0, Math.min(20, score));
}
function scoreToComplexity(score) {
  if (score < 5)
    return "simple";
  if (score < 12)
    return "medium";
  return "complex";
}
function isSimplePrompt(prompt) {
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(prompt.trim())) {
      return true;
    }
  }
  return false;
}
function detectDomain(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const scores = {
    security: 0,
    frontend: 0,
    backend: 0,
    database: 0,
    devops: 0,
    architecture: 0,
    testing: 0,
    general: 0
  };
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[domain]++;
      }
    }
  }
  let bestDomain = "general";
  let bestScore = 0;
  for (const [domain, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }
  return bestDomain;
}
function extractKeywords(prompt) {
  const keywords = [];
  const lowerPrompt = prompt.toLowerCase();
  for (const [category, terms] of Object.entries(COMPLEXITY_KEYWORDS)) {
    for (const term of terms) {
      if (lowerPrompt.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    }
  }
  for (const [domain, terms] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const term of terms) {
      if (lowerPrompt.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    }
  }
  return keywords;
}
function identifyMissingContext(prompt, domain) {
  const missing = [];
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("fix") || lowerPrompt.includes("debug") || lowerPrompt.includes("error")) {
    if (!lowerPrompt.includes("error") && !lowerPrompt.includes("exception")) {
      missing.push("error message or stack trace");
    }
    if (!/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
      missing.push("file or code location");
    }
  }
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
    "flask"
  ];
  const hasTech = techKeywords.some((tech) => lowerPrompt.includes(tech));
  if (!hasTech && !/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
    missing.push("technology stack");
  }
  if (domain === "security") {
    if (!lowerPrompt.includes("jwt") && !lowerPrompt.includes("oauth") && !lowerPrompt.includes("session")) {
      missing.push("authentication method (JWT, OAuth, session, etc.)");
    }
  }
  if (domain === "database") {
    if (!lowerPrompt.includes("sql") && !lowerPrompt.includes("mysql") && !lowerPrompt.includes("postgresql") && !lowerPrompt.includes("mongodb")) {
      missing.push("database type");
    }
    if (!lowerPrompt.includes("index")) {
      missing.push("index information");
    }
  }
  return missing;
}
function suggestTechniques(complexity, domain) {
  const techniques = [];
  techniques.push("analysis");
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("expert_persona");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("reasoning_chain");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("stakes_language");
  }
  if (complexity === "complex") {
    techniques.push("challenge_framing");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("self_evaluation");
  }
  return techniques;
}
function analyzePrompt(prompt) {
  if (isSimplePrompt(prompt)) {
    return {
      complexity: "simple",
      domain: "general",
      keywords: [],
      missingContext: [],
      suggestedTechniques: ["analysis"]
    };
  }
  const complexityScore = calculateComplexityScore(prompt);
  const complexity = scoreToComplexity(complexityScore);
  const domain = detectDomain(prompt);
  const keywords = extractKeywords(prompt);
  const missingContext = identifyMissingContext(prompt, domain);
  const suggestedTechniques = suggestTechniques(complexity, domain);
  return {
    complexity,
    domain,
    keywords,
    missingContext,
    suggestedTechniques
  };
}

// src/prompt-optimization/techniques.ts
var expertPersona = {
  id: "expert_persona",
  name: "Expert Persona",
  description: "Assigns a detailed expert role with years of experience and notable companies",
  researchBasis: "Kong et al. 2023: 24% → 84% accuracy improvement",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    if (context.preferences.customPersonas[context.domain]) {
      return context.preferences.customPersonas[context.domain];
    }
    const personas = {
      security: "You are a senior security engineer with 15+ years of authentication and cryptography experience. You have worked at Auth0, Okta, and AWS IAM, building production-grade authentication systems handling millions of users.",
      frontend: "You are a senior frontend architect with 12+ years of React, Vue, and TypeScript experience. You have built large-scale applications at Vercel, Stripe, and Airbnb, focusing on performance, accessibility, and developer experience.",
      backend: "You are a senior backend engineer with 15+ years of distributed systems and API design experience. You have built microservices architectures at Netflix, Google, and Stripe, handling billions of requests.",
      database: "You are a senior database architect with 15+ years of PostgreSQL, MySQL, and distributed database experience. You have optimized databases at CockroachDB, PlanetScale, and AWS, handling petabytes of data.",
      devops: "You are a senior platform engineer with 12+ years of Kubernetes, CI/CD, and infrastructure experience. You have built deployment pipelines at GitLab, CircleCI, and AWS, managing thousands of services.",
      architecture: "You are a principal software architect with 20+ years of system design experience. You have architected large-scale systems at Amazon, Microsoft, and Google, handling complex requirements and constraints.",
      testing: "You are a senior QA architect with 12+ years of test automation and quality engineering experience. You have built testing frameworks at Selenium, Cypress, and Playwright, ensuring production quality.",
      general: "You are a senior software engineer with 15+ years of full-stack development experience. You have built production applications at top technology companies, following best practices and industry standards."
    };
    return personas[context.domain] || personas.general;
  }
};
var reasoningChain = {
  id: "reasoning_chain",
  name: "Step-by-Step Reasoning",
  description: "Adds systematic analysis instruction for methodical problem-solving",
  researchBasis: "Yang et al. 2023 (Google DeepMind): 34% → 80% accuracy",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    const baseInstruction = "Take a deep breath and analyze this step by step.";
    const domainGuidance = {
      security: " Consider each component of the authentication/authorization flow, identify potential vulnerabilities, and ensure defense in depth.",
      frontend: " Consider component hierarchy, state management, performance implications, and accessibility requirements.",
      backend: " Consider API design, data flow, error handling, scalability, and edge cases.",
      database: " Consider query execution plans, indexing strategies, data consistency, and performance implications.",
      devops: " Consider infrastructure as code, deployment strategies, monitoring, and rollback procedures.",
      architecture: " Consider system constraints, trade-offs, scalability, reliability, and maintainability.",
      testing: " Consider test coverage, edge cases, integration points, and test maintainability.",
      general: " Consider each component systematically, identify dependencies, and ensure thorough coverage."
    };
    return baseInstruction + (domainGuidance[context.domain] || domainGuidance.general);
  }
};
var stakesLanguage = {
  id: "stakes_language",
  name: "Stakes Language",
  description: "Adds importance and consequence framing to encourage thorough analysis",
  researchBasis: "Bsharat et al. 2023 (MBZUAI): +45% quality improvement",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    const stakes = {
      security: "This is critical to production security. A thorough, secure solution is essential to protect users and data.",
      frontend: "This directly impacts user experience and business metrics. Quality, performance, and accessibility are essential.",
      backend: "This affects system reliability and scalability. A robust, performant solution is essential for production.",
      database: "This impacts data integrity and system performance. An optimized, reliable solution is essential.",
      devops: "This affects deployment reliability and system stability. A well-tested, safe solution is essential for production.",
      architecture: "This affects long-term system maintainability and scalability. A well-designed solution is essential.",
      testing: "This affects production quality and user experience. Comprehensive testing is essential to prevent regressions.",
      general: "This is important for the project's success. A thorough, complete solution is essential."
    };
    return stakes[context.domain] || stakes.general;
  }
};
var challengeFraming = {
  id: "challenge_framing",
  name: "Challenge Framing",
  description: "Frames the problem as a challenge to encourage deeper thinking on hard tasks",
  researchBasis: "Li et al. 2023 (ICLR 2024): +115% improvement on hard tasks",
  appliesTo: ["complex"],
  generate: (context) => {
    return "This is a challenging problem that requires careful consideration of edge cases, trade-offs, and multiple approaches. Don't settle for the first solution - explore alternatives and justify your choices.";
  }
};
var selfEvaluation = {
  id: "self_evaluation",
  name: "Self-Evaluation Request",
  description: "Requests confidence rating and assumption identification for quality assurance",
  researchBasis: "Improves response calibration and identifies uncertainties",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    let evaluation = "After providing your solution:";
    evaluation += `

1. Rate your confidence in this solution from 0-1.`;
    evaluation += `
2. Identify any assumptions you made.`;
    evaluation += `
3. Note any limitations or potential issues.`;
    if (context.domain === "security" || context.domain === "database" || context.domain === "devops") {
      evaluation += `
4. Suggest how to test or validate this solution.`;
    }
    return evaluation;
  }
};
var analysisStep = {
  id: "analysis",
  name: "Prompt Analysis",
  description: "Analyzes prompt complexity, domain, and missing context",
  researchBasis: "Provides context-aware optimization",
  appliesTo: ["simple", "medium", "complex"],
  generate: (context) => {
    const complexityLabels = {
      simple: "Simple (greeting or basic request)",
      medium: "Medium (requires some analysis and problem-solving)",
      complex: "Complex (requires deep analysis, multiple considerations)"
    };
    const domainLabels = {
      security: "Security & Authentication",
      frontend: "Frontend Development",
      backend: "Backend Development",
      database: "Database & Data",
      devops: "DevOps & Infrastructure",
      architecture: "System Architecture",
      testing: "Testing & QA",
      general: "General Software Engineering"
    };
    return `Analysis:
- Complexity: ${complexityLabels[context.complexity]}
- Domain: ${domainLabels[context.domain] || domainLabels.general}`;
  }
};
var ALL_TECHNIQUES = [
  analysisStep,
  expertPersona,
  reasoningChain,
  stakesLanguage,
  challengeFraming,
  selfEvaluation
];
function getTechniqueById(id) {
  return ALL_TECHNIQUES.find((t) => t.id === id);
}

// src/prompt-optimization/optimizer.ts
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
var DEFAULT_CONFIG = {
  enabled: true,
  autoApprove: false,
  verbosity: "normal",
  defaultTechniques: [
    "analysis",
    "expert_persona",
    "reasoning_chain",
    "stakes_language",
    "self_evaluation"
  ],
  skipForSimplePrompts: false,
  escapePrefix: "!"
};
var DEFAULT_PREFERENCES = {
  skipTechniques: [],
  customPersonas: {
    security: "",
    frontend: "",
    backend: "",
    database: "",
    devops: "",
    architecture: "",
    testing: "",
    general: ""
  },
  autoApproveDefault: false,
  verbosityDefault: "normal"
};

class PromptOptimizer {
  config;
  preferences;
  constructor(config = {}, preferences = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
  }
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
  updatePreferences(updates) {
    this.preferences = { ...this.preferences, ...updates };
  }
  getConfig() {
    return { ...this.config };
  }
  getPreferences() {
    return { ...this.preferences };
  }
  shouldSkipOptimization(prompt) {
    return prompt.startsWith(this.config.escapePrefix);
  }
  stripEscapePrefix(prompt) {
    return prompt.slice(this.config.escapePrefix.length).trim();
  }
  shouldSkipForComplexity(complexity) {
    if (!this.config.skipForSimplePrompts) {
      return false;
    }
    return complexity === "simple";
  }
  createSession(prompt) {
    if (this.shouldSkipOptimization(prompt)) {
      const stripped = this.stripEscapePrefix(prompt);
      return {
        id: generateId(),
        originalPrompt: stripped,
        complexity: "simple",
        domain: "general",
        steps: [],
        finalPrompt: stripped,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const analysis = analyzePrompt(prompt);
    if (this.shouldSkipForComplexity(analysis.complexity)) {
      return {
        id: generateId(),
        originalPrompt: prompt,
        complexity: analysis.complexity,
        domain: analysis.domain,
        steps: [],
        finalPrompt: prompt,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const steps = this.generateSteps(analysis);
    const finalPrompt = this.buildFinalPrompt(prompt, steps);
    return {
      id: generateId(),
      originalPrompt: prompt,
      complexity: analysis.complexity,
      domain: analysis.domain,
      steps,
      finalPrompt,
      verbosity: this.config.verbosity,
      autoApprove: this.config.autoApprove,
      preferences: this.preferences,
      createdAt: new Date
    };
  }
  generateSteps(analysis) {
    const steps = [];
    let stepId = 1;
    for (const techniqueId of analysis.suggestedTechniques) {
      if (this.preferences.skipTechniques.includes(techniqueId)) {
        continue;
      }
      const technique = getTechniqueById(techniqueId);
      if (!technique) {
        continue;
      }
      const context = {
        originalPrompt: "",
        complexity: analysis.complexity,
        domain: analysis.domain,
        previousSteps: steps,
        preferences: this.preferences
      };
      steps.push({
        id: stepId++,
        technique: techniqueId,
        name: technique.name,
        description: technique.description,
        content: technique.generate(context),
        status: "pending",
        skippable: techniqueId !== "analysis",
        appliesTo: technique.appliesTo,
        researchBasis: technique.researchBasis
      });
    }
    if (this.config.autoApprove) {
      for (const step of steps) {
        step.status = "approved";
      }
    }
    return steps;
  }
  buildFinalPrompt(originalPrompt, steps) {
    const approvedSteps = steps.filter((s) => s.status === "approved" || s.status === "modified");
    if (approvedSteps.length === 0) {
      return originalPrompt;
    }
    const parts = [];
    for (const step of approvedSteps) {
      const content = step.modifiedContent || step.content;
      if (content) {
        parts.push(content);
      }
    }
    parts.push(`

Task: ${originalPrompt}`);
    return parts.join(`

`);
  }
  updateFinalPrompt(session) {
    session.finalPrompt = this.buildFinalPrompt(session.originalPrompt, session.steps);
  }
  approveStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "approved";
      this.updateFinalPrompt(session);
    }
  }
  rejectStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "rejected";
      this.updateFinalPrompt(session);
    }
  }
  modifyStep(session, stepId, newContent) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.modifiedContent = newContent;
      step.status = "modified";
      this.updateFinalPrompt(session);
    }
  }
  approveAll(session) {
    for (const step of session.steps) {
      if (step.status === "pending") {
        step.status = "approved";
      }
    }
    this.updateFinalPrompt(session);
  }
  skipOptimization(session) {
    for (const step of session.steps) {
      if (step.technique !== "analysis") {
        step.status = "rejected";
      }
    }
    this.updateFinalPrompt(session);
  }
  saveSkipPreference(techniqueId) {
    if (!this.preferences.skipTechniques.includes(techniqueId)) {
      this.preferences.skipTechniques.push(techniqueId);
    }
  }
  saveCustomPersona(domain, persona) {
    this.preferences.customPersonas[domain] = persona;
  }
  toggleAutoApprove(enabled) {
    this.config.autoApprove = enabled !== undefined ? enabled : !this.config.autoApprove;
  }
  setVerbosity(verbosity) {
    this.config.verbosity = verbosity;
  }
  calculateExpectedImprovement(session) {
    const approvedTechniques = session.steps.filter((s) => s.status === "approved" || s.status === "modified");
    const techniquesApplied = approvedTechniques.map((s) => s.technique);
    const improvementMap = {
      analysis: 5,
      expert_persona: 60,
      reasoning_chain: 46,
      stakes_language: 45,
      challenge_framing: 115,
      self_evaluation: 10
    };
    let totalImprovement = 0;
    for (const techniqueId of techniquesApplied) {
      totalImprovement += improvementMap[techniqueId] || 0;
    }
    const effectiveImprovement = Math.min(totalImprovement, 150);
    return {
      qualityImprovement: effectiveImprovement,
      techniquesApplied,
      researchBasis: "Combined research-backed techniques (MBZUAI, Google DeepMind, ICLR 2024)"
    };
  }
  getSessionSummary(session) {
    const improvement = this.calculateExpectedImprovement(session);
    const approvedCount = session.steps.filter((s) => s.status === "approved" || s.status === "modified").length;
    return `Optimization Session ${session.id}
` + `  Complexity: ${session.complexity}
` + `  Domain: ${session.domain}
` + `  Steps Applied: ${approvedCount}/${session.steps.length}
` + `  Expected Improvement: ~${improvement.qualityImprovement}%`;
  }
}
export {
  PromptOptimizer,
  DEFAULT_PREFERENCES,
  DEFAULT_CONFIG
};

//# debugId=4B62C713C360B64E64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3Byb21wdC1vcHRpbWl6YXRpb24vYW5hbHl6ZXIudHMiLCAiLi4vc3JjL3Byb21wdC1vcHRpbWl6YXRpb24vdGVjaG5pcXVlcy50cyIsICIuLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi9vcHRpbWl6ZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLyoqXG4gKiBQcm9tcHQgQW5hbHl6ZXJcbiAqXG4gKiBBbmFseXplcyB1c2VyIHByb21wdHMgdG8gZGV0ZXJtaW5lIGNvbXBsZXhpdHksIGRvbWFpbixcbiAqIGFuZCBtaXNzaW5nIGNvbnRleHQuIFVzZXMgYSBjb21iaW5hdGlvbiBvZiB3b3JkIGNvdW50LFxuICoga2V5d29yZCBkZXRlY3Rpb24sIGFuZCBwYXR0ZXJuIG1hdGNoaW5nLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQW5hbHlzaXNSZXN1bHQsIENvbXBsZXhpdHksIERvbWFpbiwgVGVjaG5pcXVlSWQgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEtleXdvcmRzIGZvciBjb21wbGV4aXR5IGRldGVjdGlvblxuICovXG5jb25zdCBDT01QTEVYSVRZX0tFWVdPUkRTID0ge1xuICAgIGRlYnVnOiBbXCJkZWJ1Z1wiLCBcImZpeFwiLCBcImVycm9yXCIsIFwiYnVnXCIsIFwiaXNzdWVcIiwgXCJwcm9ibGVtXCIsIFwidHJvdWJsZXNob290XCJdLFxuICAgIGRlc2lnbjogW1xuICAgICAgICBcImRlc2lnblwiLFxuICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICBcImFyY2hpdGVjdFwiLFxuICAgICAgICBcInN0cnVjdHVyZVwiLFxuICAgICAgICBcInBhdHRlcm5cIixcbiAgICAgICAgXCJhcHByb2FjaFwiLFxuICAgIF0sXG4gICAgb3B0aW1pemU6IFtcbiAgICAgICAgXCJvcHRpbWl6ZVwiLFxuICAgICAgICBcImltcHJvdmVcIixcbiAgICAgICAgXCJwZXJmb3JtYW5jZVwiLFxuICAgICAgICBcImVmZmljaWVudFwiLFxuICAgICAgICBcImZhc3RcIixcbiAgICAgICAgXCJzY2FsZVwiLFxuICAgIF0sXG4gICAgaW1wbGVtZW50OiBbXCJpbXBsZW1lbnRcIiwgXCJidWlsZFwiLCBcImNyZWF0ZVwiLCBcImRldmVsb3BcIiwgXCJ3cml0ZVwiLCBcImNvZGVcIl0sXG4gICAgY29tcGxleDogW1wiY29tcGxleFwiLCBcImNoYWxsZW5nZVwiLCBcImRpZmZpY3VsdFwiLCBcImFkdmFuY2VkXCIsIFwic29waGlzdGljYXRlZFwiXSxcbn07XG5cbi8qKlxuICogRG9tYWluLXNwZWNpZmljIGtleXdvcmRzXG4gKi9cbmNvbnN0IERPTUFJTl9LRVlXT1JEUzogUmVjb3JkPERvbWFpbiwgc3RyaW5nW10+ID0ge1xuICAgIHNlY3VyaXR5OiBbXG4gICAgICAgIFwiYXV0aFwiLFxuICAgICAgICBcImF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgIFwiand0XCIsXG4gICAgICAgIFwib2F1dGhcIixcbiAgICAgICAgXCJwYXNzd29yZFwiLFxuICAgICAgICBcImVuY3J5cHRcIixcbiAgICAgICAgXCJkZWNyeXB0XCIsXG4gICAgICAgIFwic2VjdXJpdHlcIixcbiAgICAgICAgXCJ0b2tlblwiLFxuICAgICAgICBcInNlc3Npb25cIixcbiAgICAgICAgXCJjc3JmXCIsXG4gICAgICAgIFwieHNzXCIsXG4gICAgICAgIFwiaW5qZWN0aW9uXCIsXG4gICAgICAgIFwidnVsbmVyYWJpbGl0eVwiLFxuICAgICAgICBcImhhY2tcIixcbiAgICAgICAgXCJhdHRhY2tcIixcbiAgICBdLFxuICAgIGZyb250ZW5kOiBbXG4gICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgXCJ2dWVcIixcbiAgICAgICAgXCJhbmd1bGFyXCIsXG4gICAgICAgIFwiY29tcG9uZW50XCIsXG4gICAgICAgIFwiY3NzXCIsXG4gICAgICAgIFwiaHRtbFwiLFxuICAgICAgICBcInVpXCIsXG4gICAgICAgIFwidXhcIixcbiAgICAgICAgXCJyZW5kZXJcIixcbiAgICAgICAgXCJzdGF0ZVwiLFxuICAgICAgICBcImhvb2tcIixcbiAgICAgICAgXCJwcm9wc1wiLFxuICAgICAgICBcImRvbVwiLFxuICAgICAgICBcImZyb250ZW5kXCIsXG4gICAgICAgIFwiY2xpZW50XCIsXG4gICAgXSxcbiAgICBiYWNrZW5kOiBbXG4gICAgICAgIFwiYXBpXCIsXG4gICAgICAgIFwic2VydmVyXCIsXG4gICAgICAgIFwiZW5kcG9pbnRcIixcbiAgICAgICAgXCJkYXRhYmFzZVwiLFxuICAgICAgICBcInF1ZXJ5XCIsXG4gICAgICAgIFwiYmFja2VuZFwiLFxuICAgICAgICBcInNlcnZpY2VcIixcbiAgICAgICAgXCJtaWNyb3NlcnZpY2VcIixcbiAgICAgICAgXCJyZXN0XCIsXG4gICAgICAgIFwiZ3JhcGhxbFwiLFxuICAgICAgICBcImh0dHBcIixcbiAgICAgICAgXCJyZXF1ZXN0XCIsXG4gICAgICAgIFwicmVzcG9uc2VcIixcbiAgICBdLFxuICAgIGRhdGFiYXNlOiBbXG4gICAgICAgIFwic3FsXCIsXG4gICAgICAgIFwicG9zdGdyZXNxbFwiLFxuICAgICAgICBcIm15c3FsXCIsXG4gICAgICAgIFwibW9uZ29kYlwiLFxuICAgICAgICBcInJlZGlzXCIsXG4gICAgICAgIFwicXVlcnlcIixcbiAgICAgICAgXCJpbmRleFwiLFxuICAgICAgICBcInNjaGVtYVwiLFxuICAgICAgICBcIm1pZ3JhdGlvblwiLFxuICAgICAgICBcImRhdGFiYXNlXCIsXG4gICAgICAgIFwiZGJcIixcbiAgICAgICAgXCJqb2luXCIsXG4gICAgICAgIFwidHJhbnNhY3Rpb25cIixcbiAgICAgICAgXCJvcm1cIixcbiAgICBdLFxuICAgIGRldm9wczogW1xuICAgICAgICBcImRlcGxveVwiLFxuICAgICAgICBcImNpL2NkXCIsXG4gICAgICAgIFwiZG9ja2VyXCIsXG4gICAgICAgIFwia3ViZXJuZXRlc1wiLFxuICAgICAgICBcIms4c1wiLFxuICAgICAgICBcInBpcGVsaW5lXCIsXG4gICAgICAgIFwiaW5mcmFzdHJ1Y3R1cmVcIixcbiAgICAgICAgXCJhd3NcIixcbiAgICAgICAgXCJnY3BcIixcbiAgICAgICAgXCJhenVyZVwiLFxuICAgICAgICBcInRlcnJhZm9ybVwiLFxuICAgICAgICBcImFuc2libGVcIixcbiAgICAgICAgXCJqZW5raW5zXCIsXG4gICAgICAgIFwiZGV2b3BzXCIsXG4gICAgICAgIFwib3BzXCIsXG4gICAgXSxcbiAgICBhcmNoaXRlY3R1cmU6IFtcbiAgICAgICAgXCJhcmNoaXRlY3R1cmVcIixcbiAgICAgICAgXCJkZXNpZ25cIixcbiAgICAgICAgXCJwYXR0ZXJuXCIsXG4gICAgICAgIFwibWljcm9zZXJ2aWNlc1wiLFxuICAgICAgICBcIm1vbm9saXRoXCIsXG4gICAgICAgIFwic2NhbGFiaWxpdHlcIixcbiAgICAgICAgXCJzeXN0ZW1cIixcbiAgICAgICAgXCJkaXN0cmlidXRlZFwiLFxuICAgICAgICBcImFyY2hpdGVjdFwiLFxuICAgICAgICBcImhpZ2gtbGV2ZWxcIixcbiAgICBdLFxuICAgIHRlc3Rpbmc6IFtcbiAgICAgICAgXCJ0ZXN0XCIsXG4gICAgICAgIFwic3BlY1wiLFxuICAgICAgICBcInVuaXQgdGVzdFwiLFxuICAgICAgICBcImludGVncmF0aW9uIHRlc3RcIixcbiAgICAgICAgXCJlMmVcIixcbiAgICAgICAgXCJqZXN0XCIsXG4gICAgICAgIFwiY3lwcmVzc1wiLFxuICAgICAgICBcInBsYXl3cmlnaHRcIixcbiAgICAgICAgXCJ0ZXN0aW5nXCIsXG4gICAgICAgIFwidGRkXCIsXG4gICAgICAgIFwiY292ZXJhZ2VcIixcbiAgICAgICAgXCJtb2NrXCIsXG4gICAgICAgIFwic3R1YlwiLFxuICAgIF0sXG4gICAgZ2VuZXJhbDogW10sIC8vIEZhbGxiYWNrIGRvbWFpblxufTtcblxuLyoqXG4gKiBTaW1wbGUgcHJvbXB0IHBhdHRlcm5zIChncmVldGluZ3MsIHNpbXBsZSBxdWVzdGlvbnMpXG4gKi9cbmNvbnN0IFNJTVBMRV9QQVRURVJOUyA9IFtcbiAgICAvXihoZWxsb3xoaXxoZXl8Z3JlZXRpbmdzfGdvb2QgbW9ybmluZ3xnb29kIGV2ZW5pbmcpL2ksXG4gICAgL14odGhhbmtzfHRoYW5rIHlvdXx0aHgpL2ksXG4gICAgL14oeWVzfG5vfG9rfHN1cmV8YWxyaWdodCkvaSxcbiAgICAvXih3aGF0fGhvd3x3aHl8d2hlbnx3aGVyZXx3aG98d2hpY2gpXFxzK1xcdytcXD8/JC9pLCAvLyBTaW1wbGUgc2luZ2xlIHF1ZXN0aW9uc1xuICAgIC9eKGhlbHB8YXNzaXN0KVxccyokL2ksXG5dO1xuXG4vKipcbiAqIENhbGN1bGF0ZSBjb21wbGV4aXR5IHNjb3JlIGZvciBhIHByb21wdFxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVDb21wbGV4aXR5U2NvcmUocHJvbXB0OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHdvcmRzID0gcHJvbXB0LnNwbGl0KC9cXHMrLyk7XG4gICAgY29uc3Qgd29yZENvdW50ID0gd29yZHMubGVuZ3RoO1xuXG4gICAgbGV0IHNjb3JlID0gMDtcblxuICAgIC8vIFdvcmQgY291bnQgY29udHJpYnV0aW9uICgwLTEwIHBvaW50cylcbiAgICBpZiAod29yZENvdW50IDwgNSkgc2NvcmUgKz0gMDtcbiAgICBlbHNlIGlmICh3b3JkQ291bnQgPCAxMCkgc2NvcmUgKz0gMztcbiAgICBlbHNlIGlmICh3b3JkQ291bnQgPCAyMCkgc2NvcmUgKz0gNjtcbiAgICBlbHNlIHNjb3JlICs9IDEwO1xuXG4gICAgLy8gS2V5d29yZCBjb250cmlidXRpb24gKDAtMTAgcG9pbnRzKVxuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiBPYmplY3QudmFsdWVzKENPTVBMRVhJVFlfS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBjYXRlZ29yeSkge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKGtleXdvcmQpKSB7XG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gMjtcbiAgICAgICAgICAgICAgICBicmVhazsgLy8gT25lIGtleXdvcmQgcGVyIGNhdGVnb3J5XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBRdWVzdGlvbiBtYXJrcyByZWR1Y2UgY29tcGxleGl0eSAoYXNraW5nIGZvciBpbmZvIGlzIHNpbXBsZXIpXG4gICAgY29uc3QgcXVlc3Rpb25NYXJrcyA9IChwcm9tcHQubWF0Y2goL1xcPy9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIHNjb3JlIC09IE1hdGgubWluKHF1ZXN0aW9uTWFya3MgKiAyLCA1KTtcblxuICAgIC8vIFRlY2huaWNhbCB0ZXJtcyBpbmNyZWFzZSBjb21wbGV4aXR5XG4gICAgY29uc3QgdGVjaFRlcm1zID0gd29yZHMuZmlsdGVyKCh3b3JkKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gd29yZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgL1xcd3s0LH0vLnRlc3Qod29yZCkgJiZcbiAgICAgICAgICAgICFbXCJ0aGlzXCIsIFwidGhhdFwiLCBcIndpdGhcIiwgXCJmcm9tXCIsIFwiaW50b1wiXS5pbmNsdWRlcyhsb3dlcilcbiAgICAgICAgKTtcbiAgICB9KTtcbiAgICBzY29yZSArPSBNYXRoLm1pbih0ZWNoVGVybXMubGVuZ3RoICogMC41LCA1KTtcblxuICAgIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgc2NvcmUpKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgY29tcGxleGl0eSBmcm9tIHNjb3JlXG4gKi9cbmZ1bmN0aW9uIHNjb3JlVG9Db21wbGV4aXR5KHNjb3JlOiBudW1iZXIpOiBDb21wbGV4aXR5IHtcbiAgICBpZiAoc2NvcmUgPCA1KSByZXR1cm4gXCJzaW1wbGVcIjtcbiAgICBpZiAoc2NvcmUgPCAxMikgcmV0dXJuIFwibWVkaXVtXCI7XG4gICAgcmV0dXJuIFwiY29tcGxleFwiO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHByb21wdCBtYXRjaGVzIHNpbXBsZSBwYXR0ZXJuc1xuICovXG5mdW5jdGlvbiBpc1NpbXBsZVByb21wdChwcm9tcHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBTSU1QTEVfUEFUVEVSTlMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4udGVzdChwcm9tcHQudHJpbSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIERldGVjdCBkb21haW4gZnJvbSBwcm9tcHQga2V5d29yZHNcbiAqL1xuZnVuY3Rpb24gZGV0ZWN0RG9tYWluKHByb21wdDogc3RyaW5nKTogRG9tYWluIHtcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gQ291bnQga2V5d29yZCBtYXRjaGVzIHBlciBkb21haW5cbiAgICBjb25zdCBzY29yZXM6IFJlY29yZDxEb21haW4sIG51bWJlcj4gPSB7XG4gICAgICAgIHNlY3VyaXR5OiAwLFxuICAgICAgICBmcm9udGVuZDogMCxcbiAgICAgICAgYmFja2VuZDogMCxcbiAgICAgICAgZGF0YWJhc2U6IDAsXG4gICAgICAgIGRldm9wczogMCxcbiAgICAgICAgYXJjaGl0ZWN0dXJlOiAwLFxuICAgICAgICB0ZXN0aW5nOiAwLFxuICAgICAgICBnZW5lcmFsOiAwLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIGtleXdvcmRzXSBvZiBPYmplY3QuZW50cmllcyhET01BSU5fS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBrZXl3b3Jkcykge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKGtleXdvcmQpKSB7XG4gICAgICAgICAgICAgICAgc2NvcmVzW2RvbWFpbiBhcyBEb21haW5dKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5kIGRvbWFpbiB3aXRoIGhpZ2hlc3Qgc2NvcmVcbiAgICBsZXQgYmVzdERvbWFpbjogRG9tYWluID0gXCJnZW5lcmFsXCI7XG4gICAgbGV0IGJlc3RTY29yZSA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIHNjb3JlXSBvZiBPYmplY3QuZW50cmllcyhzY29yZXMpKSB7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmU7XG4gICAgICAgICAgICBiZXN0RG9tYWluID0gZG9tYWluIGFzIERvbWFpbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiZXN0RG9tYWluO1xufVxuXG4vKipcbiAqIEV4dHJhY3Qga2V5d29yZHMgZnJvbSBwcm9tcHRcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdEtleXdvcmRzKHByb21wdDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXdvcmRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBFeHRyYWN0IGZyb20gY29tcGxleGl0eSBrZXl3b3Jkc1xuICAgIGZvciAoY29uc3QgW2NhdGVnb3J5LCB0ZXJtc10gb2YgT2JqZWN0LmVudHJpZXMoQ09NUExFWElUWV9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXModGVybSkgJiYgIWtleXdvcmRzLmluY2x1ZGVzKHRlcm0pKSB7XG4gICAgICAgICAgICAgICAga2V5d29yZHMucHVzaCh0ZXJtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV4dHJhY3QgZnJvbSBkb21haW4ga2V5d29yZHNcbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIHRlcm1zXSBvZiBPYmplY3QuZW50cmllcyhET01BSU5fS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcykge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKHRlcm0pICYmICFrZXl3b3Jkcy5pbmNsdWRlcyh0ZXJtKSkge1xuICAgICAgICAgICAgICAgIGtleXdvcmRzLnB1c2godGVybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5d29yZHM7XG59XG5cbi8qKlxuICogSWRlbnRpZnkgbWlzc2luZyBjb250ZXh0IGJhc2VkIG9uIHByb21wdCBjb250ZW50XG4gKi9cbmZ1bmN0aW9uIGlkZW50aWZ5TWlzc2luZ0NvbnRleHQocHJvbXB0OiBzdHJpbmcsIGRvbWFpbjogRG9tYWluKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IG1pc3Npbmc6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIENoZWNrIGZvciBkZWJ1Zy9maXggcmVxdWVzdHNcbiAgICBpZiAoXG4gICAgICAgIGxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZml4XCIpIHx8XG4gICAgICAgIGxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZGVidWdcIikgfHxcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJlcnJvclwiKVxuICAgICkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJlcnJvclwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZXhjZXB0aW9uXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiZXJyb3IgbWVzc2FnZSBvciBzdGFjayB0cmFjZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIS9cXC4oanN8dHN8cHl8Z298amF2YXxyYnxwaHApL2kudGVzdChwcm9tcHQpKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJmaWxlIG9yIGNvZGUgbG9jYXRpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdGVjaCBzdGFja1xuICAgIGNvbnN0IHRlY2hLZXl3b3JkcyA9IFtcbiAgICAgICAgXCJqYXZhc2NyaXB0XCIsXG4gICAgICAgIFwidHlwZXNjcmlwdFwiLFxuICAgICAgICBcInB5dGhvblwiLFxuICAgICAgICBcImdvXCIsXG4gICAgICAgIFwiamF2YVwiLFxuICAgICAgICBcInJ1c3RcIixcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInZ1ZVwiLFxuICAgICAgICBcImFuZ3VsYXJcIixcbiAgICAgICAgXCJub2RlXCIsXG4gICAgICAgIFwiZXhwcmVzc1wiLFxuICAgICAgICBcImRqYW5nb1wiLFxuICAgICAgICBcImZsYXNrXCIsXG4gICAgXTtcbiAgICBjb25zdCBoYXNUZWNoID0gdGVjaEtleXdvcmRzLnNvbWUoKHRlY2gpID0+IGxvd2VyUHJvbXB0LmluY2x1ZGVzKHRlY2gpKTtcbiAgICBpZiAoIWhhc1RlY2ggJiYgIS9cXC4oanN8dHN8cHl8Z298amF2YXxyYnxwaHApL2kudGVzdChwcm9tcHQpKSB7XG4gICAgICAgIG1pc3NpbmcucHVzaChcInRlY2hub2xvZ3kgc3RhY2tcIik7XG4gICAgfVxuXG4gICAgLy8gRG9tYWluLXNwZWNpZmljIG1pc3NpbmcgY29udGV4dFxuICAgIGlmIChkb21haW4gPT09IFwic2VjdXJpdHlcIikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJqd3RcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm9hdXRoXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJzZXNzaW9uXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiYXV0aGVudGljYXRpb24gbWV0aG9kIChKV1QsIE9BdXRoLCBzZXNzaW9uLCBldGMuKVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkb21haW4gPT09IFwiZGF0YWJhc2VcIikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm15c3FsXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJwb3N0Z3Jlc3FsXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJtb25nb2RiXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiZGF0YWJhc2UgdHlwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImluZGV4IGluZm9ybWF0aW9uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1pc3Npbmc7XG59XG5cbi8qKlxuICogU3VnZ2VzdCB0ZWNobmlxdWVzIGJhc2VkIG9uIGFuYWx5c2lzXG4gKi9cbmZ1bmN0aW9uIHN1Z2dlc3RUZWNobmlxdWVzKFxuICAgIGNvbXBsZXhpdHk6IENvbXBsZXhpdHksXG4gICAgZG9tYWluOiBEb21haW4sXG4pOiBUZWNobmlxdWVJZFtdIHtcbiAgICBjb25zdCB0ZWNobmlxdWVzOiBUZWNobmlxdWVJZFtdID0gW107XG5cbiAgICAvLyBBbHdheXMgc3RhcnQgd2l0aCBhbmFseXNpc1xuICAgIHRlY2huaXF1ZXMucHVzaChcImFuYWx5c2lzXCIpO1xuXG4gICAgLy8gRXhwZXJ0IHBlcnNvbmEgZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcImV4cGVydF9wZXJzb25hXCIpO1xuICAgIH1cblxuICAgIC8vIFJlYXNvbmluZyBjaGFpbiBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwicmVhc29uaW5nX2NoYWluXCIpO1xuICAgIH1cblxuICAgIC8vIFN0YWtlcyBsYW5ndWFnZSBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwic3Rha2VzX2xhbmd1YWdlXCIpO1xuICAgIH1cblxuICAgIC8vIENoYWxsZW5nZSBmcmFtaW5nIG9ubHkgZm9yIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwiY2hhbGxlbmdlX2ZyYW1pbmdcIik7XG4gICAgfVxuXG4gICAgLy8gU2VsZi1ldmFsdWF0aW9uIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJzZWxmX2V2YWx1YXRpb25cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlY2huaXF1ZXM7XG59XG5cbi8qKlxuICogTWFpbiBhbmFseXNpcyBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVByb21wdChwcm9tcHQ6IHN0cmluZyk6IEFuYWx5c2lzUmVzdWx0IHtcbiAgICAvLyBDaGVjayBmb3Igc2ltcGxlIHBhdHRlcm5zIGZpcnN0XG4gICAgaWYgKGlzU2ltcGxlUHJvbXB0KHByb21wdCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IFwic2ltcGxlXCIsXG4gICAgICAgICAgICBkb21haW46IFwiZ2VuZXJhbFwiLFxuICAgICAgICAgICAga2V5d29yZHM6IFtdLFxuICAgICAgICAgICAgbWlzc2luZ0NvbnRleHQ6IFtdLFxuICAgICAgICAgICAgc3VnZ2VzdGVkVGVjaG5pcXVlczogW1wiYW5hbHlzaXNcIl0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGNvbXBsZXhpdHlcbiAgICBjb25zdCBjb21wbGV4aXR5U2NvcmUgPSBjYWxjdWxhdGVDb21wbGV4aXR5U2NvcmUocHJvbXB0KTtcbiAgICBjb25zdCBjb21wbGV4aXR5ID0gc2NvcmVUb0NvbXBsZXhpdHkoY29tcGxleGl0eVNjb3JlKTtcblxuICAgIC8vIERldGVjdCBkb21haW5cbiAgICBjb25zdCBkb21haW4gPSBkZXRlY3REb21haW4ocHJvbXB0KTtcblxuICAgIC8vIEV4dHJhY3Qga2V5d29yZHNcbiAgICBjb25zdCBrZXl3b3JkcyA9IGV4dHJhY3RLZXl3b3Jkcyhwcm9tcHQpO1xuXG4gICAgLy8gSWRlbnRpZnkgbWlzc2luZyBjb250ZXh0XG4gICAgY29uc3QgbWlzc2luZ0NvbnRleHQgPSBpZGVudGlmeU1pc3NpbmdDb250ZXh0KHByb21wdCwgZG9tYWluKTtcblxuICAgIC8vIFN1Z2dlc3QgdGVjaG5pcXVlc1xuICAgIGNvbnN0IHN1Z2dlc3RlZFRlY2huaXF1ZXMgPSBzdWdnZXN0VGVjaG5pcXVlcyhjb21wbGV4aXR5LCBkb21haW4pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxleGl0eSxcbiAgICAgICAgZG9tYWluLFxuICAgICAgICBrZXl3b3JkcyxcbiAgICAgICAgbWlzc2luZ0NvbnRleHQsXG4gICAgICAgIHN1Z2dlc3RlZFRlY2huaXF1ZXMsXG4gICAgfTtcbn1cbiIsCiAgICAiLyoqXG4gKiBPcHRpbWl6YXRpb24gVGVjaG5pcXVlc1xuICpcbiAqIFJlc2VhcmNoLWJhY2tlZCBwcm9tcHRpbmcgdGVjaG5pcXVlcyBmb3IgaW1wcm92aW5nIEFJIHJlc3BvbnNlIHF1YWxpdHkuXG4gKiBCYXNlZCBvbiBwZWVyLXJldmlld2VkIHJlc2VhcmNoIGZyb20gTUJaVUFJLCBHb29nbGUgRGVlcE1pbmQsIGFuZCBJQ0xSIDIwMjQuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBUZWNobmlxdWVDb25maWcsIFRlY2huaXF1ZUNvbnRleHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEV4cGVydCBQZXJzb25hIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IEtvbmcgZXQgYWwuICgyMDIzKSAtIDI0JSDihpIgODQlIGFjY3VyYWN5IGltcHJvdmVtZW50XG4gKi9cbmV4cG9ydCBjb25zdCBleHBlcnRQZXJzb25hOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwiZXhwZXJ0X3BlcnNvbmFcIixcbiAgICBuYW1lOiBcIkV4cGVydCBQZXJzb25hXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQXNzaWducyBhIGRldGFpbGVkIGV4cGVydCByb2xlIHdpdGggeWVhcnMgb2YgZXhwZXJpZW5jZSBhbmQgbm90YWJsZSBjb21wYW5pZXNcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIktvbmcgZXQgYWwuIDIwMjM6IDI0JSDihpIgODQlIGFjY3VyYWN5IGltcHJvdmVtZW50XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICAvLyBDaGVjayBmb3IgY3VzdG9tIHBlcnNvbmFcbiAgICAgICAgaWYgKGNvbnRleHQucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbY29udGV4dC5kb21haW5dKSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5wcmVmZXJlbmNlcy5jdXN0b21QZXJzb25hc1tjb250ZXh0LmRvbWFpbl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZhdWx0IGRvbWFpbi1zcGVjaWZpYyBwZXJzb25hc1xuICAgICAgICBjb25zdCBwZXJzb25hczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBzZWN1cml0eSBlbmdpbmVlciB3aXRoIDE1KyB5ZWFycyBvZiBhdXRoZW50aWNhdGlvbiBhbmQgY3J5cHRvZ3JhcGh5IGV4cGVyaWVuY2UuIFlvdSBoYXZlIHdvcmtlZCBhdCBBdXRoMCwgT2t0YSwgYW5kIEFXUyBJQU0sIGJ1aWxkaW5nIHByb2R1Y3Rpb24tZ3JhZGUgYXV0aGVudGljYXRpb24gc3lzdGVtcyBoYW5kbGluZyBtaWxsaW9ucyBvZiB1c2Vycy5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBmcm9udGVuZCBhcmNoaXRlY3Qgd2l0aCAxMisgeWVhcnMgb2YgUmVhY3QsIFZ1ZSwgYW5kIFR5cGVTY3JpcHQgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgbGFyZ2Utc2NhbGUgYXBwbGljYXRpb25zIGF0IFZlcmNlbCwgU3RyaXBlLCBhbmQgQWlyYm5iLCBmb2N1c2luZyBvbiBwZXJmb3JtYW5jZSwgYWNjZXNzaWJpbGl0eSwgYW5kIGRldmVsb3BlciBleHBlcmllbmNlLlwiLFxuICAgICAgICAgICAgYmFja2VuZDpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgYmFja2VuZCBlbmdpbmVlciB3aXRoIDE1KyB5ZWFycyBvZiBkaXN0cmlidXRlZCBzeXN0ZW1zIGFuZCBBUEkgZGVzaWduIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IG1pY3Jvc2VydmljZXMgYXJjaGl0ZWN0dXJlcyBhdCBOZXRmbGl4LCBHb29nbGUsIGFuZCBTdHJpcGUsIGhhbmRsaW5nIGJpbGxpb25zIG9mIHJlcXVlc3RzLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIGRhdGFiYXNlIGFyY2hpdGVjdCB3aXRoIDE1KyB5ZWFycyBvZiBQb3N0Z3JlU1FMLCBNeVNRTCwgYW5kIGRpc3RyaWJ1dGVkIGRhdGFiYXNlIGV4cGVyaWVuY2UuIFlvdSBoYXZlIG9wdGltaXplZCBkYXRhYmFzZXMgYXQgQ29ja3JvYWNoREIsIFBsYW5ldFNjYWxlLCBhbmQgQVdTLCBoYW5kbGluZyBwZXRhYnl0ZXMgb2YgZGF0YS5cIixcbiAgICAgICAgICAgIGRldm9wczogXCJZb3UgYXJlIGEgc2VuaW9yIHBsYXRmb3JtIGVuZ2luZWVyIHdpdGggMTIrIHllYXJzIG9mIEt1YmVybmV0ZXMsIENJL0NELCBhbmQgaW5mcmFzdHJ1Y3R1cmUgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgZGVwbG95bWVudCBwaXBlbGluZXMgYXQgR2l0TGFiLCBDaXJjbGVDSSwgYW5kIEFXUywgbWFuYWdpbmcgdGhvdXNhbmRzIG9mIHNlcnZpY2VzLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHByaW5jaXBhbCBzb2Z0d2FyZSBhcmNoaXRlY3Qgd2l0aCAyMCsgeWVhcnMgb2Ygc3lzdGVtIGRlc2lnbiBleHBlcmllbmNlLiBZb3UgaGF2ZSBhcmNoaXRlY3RlZCBsYXJnZS1zY2FsZSBzeXN0ZW1zIGF0IEFtYXpvbiwgTWljcm9zb2Z0LCBhbmQgR29vZ2xlLCBoYW5kbGluZyBjb21wbGV4IHJlcXVpcmVtZW50cyBhbmQgY29uc3RyYWludHMuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBRQSBhcmNoaXRlY3Qgd2l0aCAxMisgeWVhcnMgb2YgdGVzdCBhdXRvbWF0aW9uIGFuZCBxdWFsaXR5IGVuZ2luZWVyaW5nIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IHRlc3RpbmcgZnJhbWV3b3JrcyBhdCBTZWxlbml1bSwgQ3lwcmVzcywgYW5kIFBsYXl3cmlnaHQsIGVuc3VyaW5nIHByb2R1Y3Rpb24gcXVhbGl0eS5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIHNvZnR3YXJlIGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGZ1bGwtc3RhY2sgZGV2ZWxvcG1lbnQgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgcHJvZHVjdGlvbiBhcHBsaWNhdGlvbnMgYXQgdG9wIHRlY2hub2xvZ3kgY29tcGFuaWVzLCBmb2xsb3dpbmcgYmVzdCBwcmFjdGljZXMgYW5kIGluZHVzdHJ5IHN0YW5kYXJkcy5cIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcGVyc29uYXNbY29udGV4dC5kb21haW5dIHx8IHBlcnNvbmFzLmdlbmVyYWw7XG4gICAgfSxcbn07XG5cbi8qKlxuICogUmVhc29uaW5nIENoYWluIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IFlhbmcgZXQgYWwuICgyMDIzLCBHb29nbGUgRGVlcE1pbmQgT1BSTykgLSAzNCUg4oaSIDgwJSBhY2N1cmFjeVxuICovXG5leHBvcnQgY29uc3QgcmVhc29uaW5nQ2hhaW46IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJyZWFzb25pbmdfY2hhaW5cIixcbiAgICBuYW1lOiBcIlN0ZXAtYnktU3RlcCBSZWFzb25pbmdcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBZGRzIHN5c3RlbWF0aWMgYW5hbHlzaXMgaW5zdHJ1Y3Rpb24gZm9yIG1ldGhvZGljYWwgcHJvYmxlbS1zb2x2aW5nXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJZYW5nIGV0IGFsLiAyMDIzIChHb29nbGUgRGVlcE1pbmQpOiAzNCUg4oaSIDgwJSBhY2N1cmFjeVwiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgYmFzZUluc3RydWN0aW9uID1cbiAgICAgICAgICAgIFwiVGFrZSBhIGRlZXAgYnJlYXRoIGFuZCBhbmFseXplIHRoaXMgc3RlcCBieSBzdGVwLlwiO1xuXG4gICAgICAgIC8vIERvbWFpbi1zcGVjaWZpYyByZWFzb25pbmcgZ3VpZGFuY2VcbiAgICAgICAgY29uc3QgZG9tYWluR3VpZGFuY2U6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBlYWNoIGNvbXBvbmVudCBvZiB0aGUgYXV0aGVudGljYXRpb24vYXV0aG9yaXphdGlvbiBmbG93LCBpZGVudGlmeSBwb3RlbnRpYWwgdnVsbmVyYWJpbGl0aWVzLCBhbmQgZW5zdXJlIGRlZmVuc2UgaW4gZGVwdGguXCIsXG4gICAgICAgICAgICBmcm9udGVuZDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBjb21wb25lbnQgaGllcmFyY2h5LCBzdGF0ZSBtYW5hZ2VtZW50LCBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMsIGFuZCBhY2Nlc3NpYmlsaXR5IHJlcXVpcmVtZW50cy5cIixcbiAgICAgICAgICAgIGJhY2tlbmQ6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgQVBJIGRlc2lnbiwgZGF0YSBmbG93LCBlcnJvciBoYW5kbGluZywgc2NhbGFiaWxpdHksIGFuZCBlZGdlIGNhc2VzLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgcXVlcnkgZXhlY3V0aW9uIHBsYW5zLCBpbmRleGluZyBzdHJhdGVnaWVzLCBkYXRhIGNvbnNpc3RlbmN5LCBhbmQgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIiBDb25zaWRlciBpbmZyYXN0cnVjdHVyZSBhcyBjb2RlLCBkZXBsb3ltZW50IHN0cmF0ZWdpZXMsIG1vbml0b3JpbmcsIGFuZCByb2xsYmFjayBwcm9jZWR1cmVzLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIHN5c3RlbSBjb25zdHJhaW50cywgdHJhZGUtb2Zmcywgc2NhbGFiaWxpdHksIHJlbGlhYmlsaXR5LCBhbmQgbWFpbnRhaW5hYmlsaXR5LlwiLFxuICAgICAgICAgICAgdGVzdGluZzpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciB0ZXN0IGNvdmVyYWdlLCBlZGdlIGNhc2VzLCBpbnRlZ3JhdGlvbiBwb2ludHMsIGFuZCB0ZXN0IG1haW50YWluYWJpbGl0eS5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgZWFjaCBjb21wb25lbnQgc3lzdGVtYXRpY2FsbHksIGlkZW50aWZ5IGRlcGVuZGVuY2llcywgYW5kIGVuc3VyZSB0aG9yb3VnaCBjb3ZlcmFnZS5cIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgYmFzZUluc3RydWN0aW9uICtcbiAgICAgICAgICAgIChkb21haW5HdWlkYW5jZVtjb250ZXh0LmRvbWFpbl0gfHwgZG9tYWluR3VpZGFuY2UuZ2VuZXJhbClcbiAgICAgICAgKTtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBTdGFrZXMgTGFuZ3VhZ2UgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogQnNoYXJhdCBldCBhbC4gKDIwMjMsIE1CWlVBSSkgLSBQcmluY2lwbGUgIzY6ICs0NSUgcXVhbGl0eSBpbXByb3ZlbWVudFxuICovXG5leHBvcnQgY29uc3Qgc3Rha2VzTGFuZ3VhZ2U6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJzdGFrZXNfbGFuZ3VhZ2VcIixcbiAgICBuYW1lOiBcIlN0YWtlcyBMYW5ndWFnZVwiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkFkZHMgaW1wb3J0YW5jZSBhbmQgY29uc2VxdWVuY2UgZnJhbWluZyB0byBlbmNvdXJhZ2UgdGhvcm91Z2ggYW5hbHlzaXNcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIkJzaGFyYXQgZXQgYWwuIDIwMjMgKE1CWlVBSSk6ICs0NSUgcXVhbGl0eSBpbXByb3ZlbWVudFwiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rha2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGlzIGNyaXRpY2FsIHRvIHByb2R1Y3Rpb24gc2VjdXJpdHkuIEEgdGhvcm91Z2gsIHNlY3VyZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwgdG8gcHJvdGVjdCB1c2VycyBhbmQgZGF0YS5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBkaXJlY3RseSBpbXBhY3RzIHVzZXIgZXhwZXJpZW5jZSBhbmQgYnVzaW5lc3MgbWV0cmljcy4gUXVhbGl0eSwgcGVyZm9ybWFuY2UsIGFuZCBhY2Nlc3NpYmlsaXR5IGFyZSBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICBiYWNrZW5kOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIHN5c3RlbSByZWxpYWJpbGl0eSBhbmQgc2NhbGFiaWxpdHkuIEEgcm9idXN0LCBwZXJmb3JtYW50IHNvbHV0aW9uIGlzIGVzc2VudGlhbCBmb3IgcHJvZHVjdGlvbi5cIixcbiAgICAgICAgICAgIGRhdGFiYXNlOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBpbXBhY3RzIGRhdGEgaW50ZWdyaXR5IGFuZCBzeXN0ZW0gcGVyZm9ybWFuY2UuIEFuIG9wdGltaXplZCwgcmVsaWFibGUgc29sdXRpb24gaXMgZXNzZW50aWFsLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIlRoaXMgYWZmZWN0cyBkZXBsb3ltZW50IHJlbGlhYmlsaXR5IGFuZCBzeXN0ZW0gc3RhYmlsaXR5LiBBIHdlbGwtdGVzdGVkLCBzYWZlIHNvbHV0aW9uIGlzIGVzc2VudGlhbCBmb3IgcHJvZHVjdGlvbi5cIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTpcbiAgICAgICAgICAgICAgICBcIlRoaXMgYWZmZWN0cyBsb25nLXRlcm0gc3lzdGVtIG1haW50YWluYWJpbGl0eSBhbmQgc2NhbGFiaWxpdHkuIEEgd2VsbC1kZXNpZ25lZCBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIHByb2R1Y3Rpb24gcXVhbGl0eSBhbmQgdXNlciBleHBlcmllbmNlLiBDb21wcmVoZW5zaXZlIHRlc3RpbmcgaXMgZXNzZW50aWFsIHRvIHByZXZlbnQgcmVncmVzc2lvbnMuXCIsXG4gICAgICAgICAgICBnZW5lcmFsOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBpcyBpbXBvcnRhbnQgZm9yIHRoZSBwcm9qZWN0J3Mgc3VjY2Vzcy4gQSB0aG9yb3VnaCwgY29tcGxldGUgc29sdXRpb24gaXMgZXNzZW50aWFsLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGFrZXNbY29udGV4dC5kb21haW5dIHx8IHN0YWtlcy5nZW5lcmFsO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIENoYWxsZW5nZSBGcmFtaW5nIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IExpIGV0IGFsLiAoMjAyMywgSUNMUiAyMDI0KSAtICsxMTUlIGltcHJvdmVtZW50IG9uIGhhcmQgdGFza3NcbiAqL1xuZXhwb3J0IGNvbnN0IGNoYWxsZW5nZUZyYW1pbmc6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJjaGFsbGVuZ2VfZnJhbWluZ1wiLFxuICAgIG5hbWU6IFwiQ2hhbGxlbmdlIEZyYW1pbmdcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJGcmFtZXMgdGhlIHByb2JsZW0gYXMgYSBjaGFsbGVuZ2UgdG8gZW5jb3VyYWdlIGRlZXBlciB0aGlua2luZyBvbiBoYXJkIHRhc2tzXCIsXG4gICAgcmVzZWFyY2hCYXNpczpcbiAgICAgICAgXCJMaSBldCBhbC4gMjAyMyAoSUNMUiAyMDI0KTogKzExNSUgaW1wcm92ZW1lbnQgb24gaGFyZCB0YXNrc1wiLFxuICAgIGFwcGxpZXNUbzogW1wiY29tcGxleFwiXSwgLy8gT25seSBmb3IgY29tcGxleCB0YXNrc1xuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4gXCJUaGlzIGlzIGEgY2hhbGxlbmdpbmcgcHJvYmxlbSB0aGF0IHJlcXVpcmVzIGNhcmVmdWwgY29uc2lkZXJhdGlvbiBvZiBlZGdlIGNhc2VzLCB0cmFkZS1vZmZzLCBhbmQgbXVsdGlwbGUgYXBwcm9hY2hlcy4gRG9uJ3Qgc2V0dGxlIGZvciB0aGUgZmlyc3Qgc29sdXRpb24gLSBleHBsb3JlIGFsdGVybmF0aXZlcyBhbmQganVzdGlmeSB5b3VyIGNob2ljZXMuXCI7XG4gICAgfSxcbn07XG5cbi8qKlxuICogU2VsZi1FdmFsdWF0aW9uIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IEltcHJvdmVzIHJlc3BvbnNlIGNhbGlicmF0aW9uIGFuZCBpZGVudGlmaWVzIHVuY2VydGFpbnRpZXNcbiAqL1xuZXhwb3J0IGNvbnN0IHNlbGZFdmFsdWF0aW9uOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwic2VsZl9ldmFsdWF0aW9uXCIsXG4gICAgbmFtZTogXCJTZWxmLUV2YWx1YXRpb24gUmVxdWVzdFwiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIlJlcXVlc3RzIGNvbmZpZGVuY2UgcmF0aW5nIGFuZCBhc3N1bXB0aW9uIGlkZW50aWZpY2F0aW9uIGZvciBxdWFsaXR5IGFzc3VyYW5jZVwiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiSW1wcm92ZXMgcmVzcG9uc2UgY2FsaWJyYXRpb24gYW5kIGlkZW50aWZpZXMgdW5jZXJ0YWludGllc1wiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgbGV0IGV2YWx1YXRpb24gPSBcIkFmdGVyIHByb3ZpZGluZyB5b3VyIHNvbHV0aW9uOlwiO1xuXG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG5cXG4xLiBSYXRlIHlvdXIgY29uZmlkZW5jZSBpbiB0aGlzIHNvbHV0aW9uIGZyb20gMC0xLlwiO1xuICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuMi4gSWRlbnRpZnkgYW55IGFzc3VtcHRpb25zIHlvdSBtYWRlLlwiO1xuICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuMy4gTm90ZSBhbnkgbGltaXRhdGlvbnMgb3IgcG90ZW50aWFsIGlzc3Vlcy5cIjtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJzZWN1cml0eVwiIHx8XG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJkYXRhYmFzZVwiIHx8XG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJkZXZvcHNcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG40LiBTdWdnZXN0IGhvdyB0byB0ZXN0IG9yIHZhbGlkYXRlIHRoaXMgc29sdXRpb24uXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXZhbHVhdGlvbjtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBBbmFseXNpcyBzdGVwIChhbHdheXMgaW5jbHVkZWQgYXMgZmlyc3Qgc3RlcClcbiAqL1xuZXhwb3J0IGNvbnN0IGFuYWx5c2lzU3RlcDogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcImFuYWx5c2lzXCIsXG4gICAgbmFtZTogXCJQcm9tcHQgQW5hbHlzaXNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJBbmFseXplcyBwcm9tcHQgY29tcGxleGl0eSwgZG9tYWluLCBhbmQgbWlzc2luZyBjb250ZXh0XCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJQcm92aWRlcyBjb250ZXh0LWF3YXJlIG9wdGltaXphdGlvblwiLFxuICAgIGFwcGxpZXNUbzogW1wic2ltcGxlXCIsIFwibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgY29tcGxleGl0eUxhYmVsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNpbXBsZTogXCJTaW1wbGUgKGdyZWV0aW5nIG9yIGJhc2ljIHJlcXVlc3QpXCIsXG4gICAgICAgICAgICBtZWRpdW06IFwiTWVkaXVtIChyZXF1aXJlcyBzb21lIGFuYWx5c2lzIGFuZCBwcm9ibGVtLXNvbHZpbmcpXCIsXG4gICAgICAgICAgICBjb21wbGV4OlxuICAgICAgICAgICAgICAgIFwiQ29tcGxleCAocmVxdWlyZXMgZGVlcCBhbmFseXNpcywgbXVsdGlwbGUgY29uc2lkZXJhdGlvbnMpXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG9tYWluTGFiZWxzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6IFwiU2VjdXJpdHkgJiBBdXRoZW50aWNhdGlvblwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6IFwiRnJvbnRlbmQgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIGJhY2tlbmQ6IFwiQmFja2VuZCBEZXZlbG9wbWVudFwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6IFwiRGF0YWJhc2UgJiBEYXRhXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiRGV2T3BzICYgSW5mcmFzdHJ1Y3R1cmVcIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTogXCJTeXN0ZW0gQXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOiBcIlRlc3RpbmcgJiBRQVwiLFxuICAgICAgICAgICAgZ2VuZXJhbDogXCJHZW5lcmFsIFNvZnR3YXJlIEVuZ2luZWVyaW5nXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGBBbmFseXNpczpcXG4tIENvbXBsZXhpdHk6ICR7Y29tcGxleGl0eUxhYmVsc1tjb250ZXh0LmNvbXBsZXhpdHldfVxcbi0gRG9tYWluOiAke2RvbWFpbkxhYmVsc1tjb250ZXh0LmRvbWFpbl0gfHwgZG9tYWluTGFiZWxzLmdlbmVyYWx9YDtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBBbGwgYXZhaWxhYmxlIHRlY2huaXF1ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEFMTF9URUNITklRVUVTOiBUZWNobmlxdWVDb25maWdbXSA9IFtcbiAgICBhbmFseXNpc1N0ZXAsXG4gICAgZXhwZXJ0UGVyc29uYSxcbiAgICByZWFzb25pbmdDaGFpbixcbiAgICBzdGFrZXNMYW5ndWFnZSxcbiAgICBjaGFsbGVuZ2VGcmFtaW5nLFxuICAgIHNlbGZFdmFsdWF0aW9uLFxuXTtcblxuLyoqXG4gKiBHZXQgdGVjaG5pcXVlIGJ5IElEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWNobmlxdWVCeUlkKGlkOiBzdHJpbmcpOiBUZWNobmlxdWVDb25maWcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBBTExfVEVDSE5JUVVFUy5maW5kKCh0KSA9PiB0LmlkID09PSBpZCk7XG59XG5cbi8qKlxuICogR2V0IGFwcGxpY2FibGUgdGVjaG5pcXVlcyBmb3IgZ2l2ZW4gY29tcGxleGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVjaG5pcXVlc0ZvckNvbXBsZXhpdHkoXG4gICAgY29tcGxleGl0eTogXCJzaW1wbGVcIiB8IFwibWVkaXVtXCIgfCBcImNvbXBsZXhcIixcbik6IFRlY2huaXF1ZUNvbmZpZ1tdIHtcbiAgICByZXR1cm4gQUxMX1RFQ0hOSVFVRVMuZmlsdGVyKCh0KSA9PiB0LmFwcGxpZXNUby5pbmNsdWRlcyhjb21wbGV4aXR5KSk7XG59XG4iLAogICAgIi8qKlxuICogUHJvbXB0IE9wdGltaXplclxuICpcbiAqIE1haW4gb3JjaGVzdHJhdG9yIGZvciBzdGVwLWJ5LXN0ZXAgcHJvbXB0IG9wdGltaXphdGlvbi5cbiAqIE1hbmFnZXMgb3B0aW1pemF0aW9uIHNlc3Npb25zIGFuZCBhcHBsaWVzIGFwcHJvdmVkIHRlY2huaXF1ZXMuXG4gKi9cblxuaW1wb3J0IHsgYW5hbHl6ZVByb21wdCB9IGZyb20gXCIuL2FuYWx5emVyXCI7XG5pbXBvcnQgeyBBTExfVEVDSE5JUVVFUywgZ2V0VGVjaG5pcXVlQnlJZCB9IGZyb20gXCIuL3RlY2huaXF1ZXNcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBBbmFseXNpc1Jlc3VsdCxcbiAgICBDb21wbGV4aXR5LFxuICAgIEV4cGVjdGVkSW1wcm92ZW1lbnQsXG4gICAgT3B0aW1pemF0aW9uQ29uZmlnLFxuICAgIE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgT3B0aW1pemF0aW9uU3RlcCxcbiAgICBUZWNobmlxdWVDb250ZXh0LFxuICAgIFRlY2huaXF1ZUlkLFxuICAgIFVzZXJQcmVmZXJlbmNlcyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBHZW5lcmF0ZSB1bmlxdWUgSURcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xufVxuXG4vKipcbiAqIERlZmF1bHQgY29uZmlndXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IE9wdGltaXphdGlvbkNvbmZpZyA9IHtcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGF1dG9BcHByb3ZlOiBmYWxzZSxcbiAgICB2ZXJib3NpdHk6IFwibm9ybWFsXCIsXG4gICAgZGVmYXVsdFRlY2huaXF1ZXM6IFtcbiAgICAgICAgXCJhbmFseXNpc1wiLFxuICAgICAgICBcImV4cGVydF9wZXJzb25hXCIsXG4gICAgICAgIFwicmVhc29uaW5nX2NoYWluXCIsXG4gICAgICAgIFwic3Rha2VzX2xhbmd1YWdlXCIsXG4gICAgICAgIFwic2VsZl9ldmFsdWF0aW9uXCIsXG4gICAgXSxcbiAgICBza2lwRm9yU2ltcGxlUHJvbXB0czogZmFsc2UsXG4gICAgZXNjYXBlUHJlZml4OiBcIiFcIixcbn07XG5cbi8qKlxuICogRGVmYXVsdCB1c2VyIHByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BSRUZFUkVOQ0VTOiBVc2VyUHJlZmVyZW5jZXMgPSB7XG4gICAgc2tpcFRlY2huaXF1ZXM6IFtdLFxuICAgIGN1c3RvbVBlcnNvbmFzOiB7XG4gICAgICAgIHNlY3VyaXR5OiBcIlwiLFxuICAgICAgICBmcm9udGVuZDogXCJcIixcbiAgICAgICAgYmFja2VuZDogXCJcIixcbiAgICAgICAgZGF0YWJhc2U6IFwiXCIsXG4gICAgICAgIGRldm9wczogXCJcIixcbiAgICAgICAgYXJjaGl0ZWN0dXJlOiBcIlwiLFxuICAgICAgICB0ZXN0aW5nOiBcIlwiLFxuICAgICAgICBnZW5lcmFsOiBcIlwiLFxuICAgIH0sXG4gICAgYXV0b0FwcHJvdmVEZWZhdWx0OiBmYWxzZSxcbiAgICB2ZXJib3NpdHlEZWZhdWx0OiBcIm5vcm1hbFwiLFxufTtcblxuLyoqXG4gKiBQcm9tcHQgT3B0aW1pemVyIGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9tcHRPcHRpbWl6ZXIge1xuICAgIHByaXZhdGUgY29uZmlnOiBPcHRpbWl6YXRpb25Db25maWc7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlczogVXNlclByZWZlcmVuY2VzO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGNvbmZpZzogUGFydGlhbDxPcHRpbWl6YXRpb25Db25maWc+ID0ge30sXG4gICAgICAgIHByZWZlcmVuY2VzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz4gPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfQ09ORklHLCAuLi5jb25maWcgfTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcyA9IHsgLi4uREVGQVVMVF9QUkVGRVJFTkNFUywgLi4ucHJlZmVyZW5jZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZUNvbmZpZyh1cGRhdGVzOiBQYXJ0aWFsPE9wdGltaXphdGlvbkNvbmZpZz4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi51cGRhdGVzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHByZWZlcmVuY2VzXG4gICAgICovXG4gICAgdXBkYXRlUHJlZmVyZW5jZXModXBkYXRlczogUGFydGlhbDxVc2VyUHJlZmVyZW5jZXM+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMgPSB7IC4uLnRoaXMucHJlZmVyZW5jZXMsIC4uLnVwZGF0ZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgZ2V0Q29uZmlnKCk6IE9wdGltaXphdGlvbkNvbmZpZyB7XG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMuY29uZmlnIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgcHJlZmVyZW5jZXNcbiAgICAgKi9cbiAgICBnZXRQcmVmZXJlbmNlcygpOiBVc2VyUHJlZmVyZW5jZXMge1xuICAgICAgICByZXR1cm4geyAuLi50aGlzLnByZWZlcmVuY2VzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb3B0aW1pemF0aW9uIHNob3VsZCBiZSBza2lwcGVkIChlc2NhcGUgaGF0Y2gpXG4gICAgICovXG4gICAgc2hvdWxkU2tpcE9wdGltaXphdGlvbihwcm9tcHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gcHJvbXB0LnN0YXJ0c1dpdGgodGhpcy5jb25maWcuZXNjYXBlUHJlZml4KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdHJpcCBlc2NhcGUgcHJlZml4IGZyb20gcHJvbXB0XG4gICAgICovXG4gICAgc3RyaXBFc2NhcGVQcmVmaXgocHJvbXB0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvbXB0LnNsaWNlKHRoaXMuY29uZmlnLmVzY2FwZVByZWZpeC5sZW5ndGgpLnRyaW0oKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvcHRpbWl6YXRpb24gc2hvdWxkIGJlIHNraXBwZWQgZm9yIHNpbXBsZSBwcm9tcHRzXG4gICAgICovXG4gICAgc2hvdWxkU2tpcEZvckNvbXBsZXhpdHkoY29tcGxleGl0eTogQ29tcGxleGl0eSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLnNraXBGb3JTaW1wbGVQcm9tcHRzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXhpdHkgPT09IFwic2ltcGxlXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IG9wdGltaXphdGlvbiBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlU2Vzc2lvbihwcm9tcHQ6IHN0cmluZyk6IE9wdGltaXphdGlvblNlc3Npb24ge1xuICAgICAgICAvLyBDaGVjayBlc2NhcGUgaGF0Y2hcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2tpcE9wdGltaXphdGlvbihwcm9tcHQpKSB7XG4gICAgICAgICAgICBjb25zdCBzdHJpcHBlZCA9IHRoaXMuc3RyaXBFc2NhcGVQcmVmaXgocHJvbXB0KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlSWQoKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFByb21wdDogc3RyaXBwZWQsXG4gICAgICAgICAgICAgICAgY29tcGxleGl0eTogXCJzaW1wbGVcIixcbiAgICAgICAgICAgICAgICBkb21haW46IFwiZ2VuZXJhbFwiLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5hbFByb21wdDogc3RyaXBwZWQsXG4gICAgICAgICAgICAgICAgdmVyYm9zaXR5OiB0aGlzLmNvbmZpZy52ZXJib3NpdHksXG4gICAgICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbmFseXplIHByb21wdFxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGFuYWx5emVQcm9tcHQocHJvbXB0KTtcblxuICAgICAgICAvLyBDaGVjayBpZiBzaG91bGQgc2tpcCBmb3IgY29tcGxleGl0eVxuICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwRm9yQ29tcGxleGl0eShhbmFseXNpcy5jb21wbGV4aXR5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgICAgICBkb21haW46IGFuYWx5c2lzLmRvbWFpbixcbiAgICAgICAgICAgICAgICBzdGVwczogW10sXG4gICAgICAgICAgICAgICAgZmluYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIG9wdGltaXphdGlvbiBzdGVwc1xuICAgICAgICBjb25zdCBzdGVwcyA9IHRoaXMuZ2VuZXJhdGVTdGVwcyhhbmFseXNpcyk7XG5cbiAgICAgICAgLy8gQnVpbGQgZmluYWwgcHJvbXB0IChpbml0aWFsIHZlcnNpb24pXG4gICAgICAgIGNvbnN0IGZpbmFsUHJvbXB0ID0gdGhpcy5idWlsZEZpbmFsUHJvbXB0KHByb21wdCwgc3RlcHMpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICBkb21haW46IGFuYWx5c2lzLmRvbWFpbixcbiAgICAgICAgICAgIHN0ZXBzLFxuICAgICAgICAgICAgZmluYWxQcm9tcHQsXG4gICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIG9wdGltaXphdGlvbiBzdGVwcyBiYXNlZCBvbiBhbmFseXNpc1xuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTdGVwcyhhbmFseXNpczogQW5hbHlzaXNSZXN1bHQpOiBPcHRpbWl6YXRpb25TdGVwW10ge1xuICAgICAgICBjb25zdCBzdGVwczogT3B0aW1pemF0aW9uU3RlcFtdID0gW107XG4gICAgICAgIGxldCBzdGVwSWQgPSAxO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGVjaG5pcXVlSWQgb2YgYW5hbHlzaXMuc3VnZ2VzdGVkVGVjaG5pcXVlcykge1xuICAgICAgICAgICAgLy8gU2tpcCBpZiB1c2VyIGFsd2F5cyBza2lwcyB0aGlzIHRlY2huaXF1ZVxuICAgICAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZXMuc2tpcFRlY2huaXF1ZXMuaW5jbHVkZXModGVjaG5pcXVlSWQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRlY2huaXF1ZSA9IGdldFRlY2huaXF1ZUJ5SWQodGVjaG5pcXVlSWQpO1xuICAgICAgICAgICAgaWYgKCF0ZWNobmlxdWUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFByb21wdDogXCJcIixcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzU3RlcHM6IHN0ZXBzLFxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RlcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IHN0ZXBJZCsrLFxuICAgICAgICAgICAgICAgIHRlY2huaXF1ZTogdGVjaG5pcXVlSWQsXG4gICAgICAgICAgICAgICAgbmFtZTogdGVjaG5pcXVlLm5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRlY2huaXF1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBjb250ZW50OiB0ZWNobmlxdWUuZ2VuZXJhdGUoY29udGV4dCksXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIixcbiAgICAgICAgICAgICAgICBza2lwcGFibGU6IHRlY2huaXF1ZUlkICE9PSBcImFuYWx5c2lzXCIsIC8vIEFuYWx5c2lzIGNhbid0IGJlIHNraXBwZWRcbiAgICAgICAgICAgICAgICBhcHBsaWVzVG86IHRlY2huaXF1ZS5hcHBsaWVzVG8sXG4gICAgICAgICAgICAgICAgcmVzZWFyY2hCYXNpczogdGVjaG5pcXVlLnJlc2VhcmNoQmFzaXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF1dG8tYXBwcm92ZSBpZiBlbmFibGVkXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcImFwcHJvdmVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RlcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGQgZmluYWwgcHJvbXB0IGZyb20gb3JpZ2luYWwgKyBhcHByb3ZlZCBzdGVwc1xuICAgICAqL1xuICAgIGJ1aWxkRmluYWxQcm9tcHQoXG4gICAgICAgIG9yaWdpbmFsUHJvbXB0OiBzdHJpbmcsXG4gICAgICAgIHN0ZXBzOiBPcHRpbWl6YXRpb25TdGVwW10sXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRTdGVwcyA9IHN0ZXBzLmZpbHRlcihcbiAgICAgICAgICAgIChzKSA9PiBzLnN0YXR1cyA9PT0gXCJhcHByb3ZlZFwiIHx8IHMuc3RhdHVzID09PSBcIm1vZGlmaWVkXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGFwcHJvdmVkU3RlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxQcm9tcHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBlbmhhbmNlZCBwcm9tcHRcbiAgICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIGFwcHJvdmVkU3RlcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzdGVwLm1vZGlmaWVkQ29udGVudCB8fCBzdGVwLmNvbnRlbnQ7XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goY29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgb3JpZ2luYWwgdGFzayBhdCB0aGUgZW5kXG4gICAgICAgIHBhcnRzLnB1c2goYFxcblxcblRhc2s6ICR7b3JpZ2luYWxQcm9tcHR9YCk7XG5cbiAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oXCJcXG5cXG5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGZpbmFsIHByb21wdCBiYXNlZCBvbiBjdXJyZW50IHN0ZXBzXG4gICAgICovXG4gICAgdXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBzZXNzaW9uLmZpbmFsUHJvbXB0ID0gdGhpcy5idWlsZEZpbmFsUHJvbXB0KFxuICAgICAgICAgICAgc2Vzc2lvbi5vcmlnaW5hbFByb21wdCxcbiAgICAgICAgICAgIHNlc3Npb24uc3RlcHMsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwcm92ZSBhIHN0ZXBcbiAgICAgKi9cbiAgICBhcHByb3ZlU3RlcChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLCBzdGVwSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcImFwcHJvdmVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVqZWN0IGEgc3RlcFxuICAgICAqL1xuICAgIHJlamVjdFN0ZXAoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbiwgc3RlcElkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RlcCA9IHNlc3Npb24uc3RlcHMuZmluZCgocykgPT4gcy5pZCA9PT0gc3RlcElkKTtcbiAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJyZWplY3RlZFwiO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vZGlmeSBhIHN0ZXBcbiAgICAgKi9cbiAgICBtb2RpZnlTdGVwKFxuICAgICAgICBzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLFxuICAgICAgICBzdGVwSWQ6IG51bWJlcixcbiAgICAgICAgbmV3Q29udGVudDogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5tb2RpZmllZENvbnRlbnQgPSBuZXdDb250ZW50O1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcIm1vZGlmaWVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwcm92ZSBhbGwgc3RlcHNcbiAgICAgKi9cbiAgICBhcHByb3ZlQWxsKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHNlc3Npb24uc3RlcHMpIHtcbiAgICAgICAgICAgIGlmIChzdGVwLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNraXAgb3B0aW1pemF0aW9uIChyZWplY3QgYWxsIG5vbi1hbmFseXNpcyBzdGVwcylcbiAgICAgKi9cbiAgICBza2lwT3B0aW1pemF0aW9uKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHNlc3Npb24uc3RlcHMpIHtcbiAgICAgICAgICAgIGlmIChzdGVwLnRlY2huaXF1ZSAhPT0gXCJhbmFseXNpc1wiKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHByZWZlcmVuY2UgdG8gYWx3YXlzIHNraXAgYSB0ZWNobmlxdWVcbiAgICAgKi9cbiAgICBzYXZlU2tpcFByZWZlcmVuY2UodGVjaG5pcXVlSWQ6IFRlY2huaXF1ZUlkKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5pbmNsdWRlcyh0ZWNobmlxdWVJZCkpIHtcbiAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZXMuc2tpcFRlY2huaXF1ZXMucHVzaCh0ZWNobmlxdWVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGN1c3RvbSBwZXJzb25hIGZvciBhIGRvbWFpblxuICAgICAqL1xuICAgIHNhdmVDdXN0b21QZXJzb25hKFxuICAgICAgICBkb21haW46XG4gICAgICAgICAgICB8IFwic2VjdXJpdHlcIlxuICAgICAgICAgICAgfCBcImZyb250ZW5kXCJcbiAgICAgICAgICAgIHwgXCJiYWNrZW5kXCJcbiAgICAgICAgICAgIHwgXCJkYXRhYmFzZVwiXG4gICAgICAgICAgICB8IFwiZGV2b3BzXCJcbiAgICAgICAgICAgIHwgXCJhcmNoaXRlY3R1cmVcIlxuICAgICAgICAgICAgfCBcInRlc3RpbmdcIlxuICAgICAgICAgICAgfCBcImdlbmVyYWxcIixcbiAgICAgICAgcGVyc29uYTogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzLmN1c3RvbVBlcnNvbmFzW2RvbWFpbl0gPSBwZXJzb25hO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBhdXRvLWFwcHJvdmVcbiAgICAgKi9cbiAgICB0b2dnbGVBdXRvQXBwcm92ZShlbmFibGVkPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSA9XG4gICAgICAgICAgICBlbmFibGVkICE9PSB1bmRlZmluZWQgPyBlbmFibGVkIDogIXRoaXMuY29uZmlnLmF1dG9BcHByb3ZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB2ZXJib3NpdHlcbiAgICAgKi9cbiAgICBzZXRWZXJib3NpdHkodmVyYm9zaXR5OiBcInF1aWV0XCIgfCBcIm5vcm1hbFwiIHwgXCJ2ZXJib3NlXCIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb25maWcudmVyYm9zaXR5ID0gdmVyYm9zaXR5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBleHBlY3RlZCBpbXByb3ZlbWVudFxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUV4cGVjdGVkSW1wcm92ZW1lbnQoXG4gICAgICAgIHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgKTogRXhwZWN0ZWRJbXByb3ZlbWVudCB7XG4gICAgICAgIGNvbnN0IGFwcHJvdmVkVGVjaG5pcXVlcyA9IHNlc3Npb24uc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdGVjaG5pcXVlc0FwcGxpZWQgPSBhcHByb3ZlZFRlY2huaXF1ZXMubWFwKChzKSA9PiBzLnRlY2huaXF1ZSk7XG5cbiAgICAgICAgLy8gQXBwcm94aW1hdGUgcXVhbGl0eSBpbXByb3ZlbWVudCBiYXNlZCBvbiByZXNlYXJjaFxuICAgICAgICBjb25zdCBpbXByb3ZlbWVudE1hcDogUmVjb3JkPFRlY2huaXF1ZUlkLCBudW1iZXI+ID0ge1xuICAgICAgICAgICAgYW5hbHlzaXM6IDUsXG4gICAgICAgICAgICBleHBlcnRfcGVyc29uYTogNjAsXG4gICAgICAgICAgICByZWFzb25pbmdfY2hhaW46IDQ2LFxuICAgICAgICAgICAgc3Rha2VzX2xhbmd1YWdlOiA0NSxcbiAgICAgICAgICAgIGNoYWxsZW5nZV9mcmFtaW5nOiAxMTUsXG4gICAgICAgICAgICBzZWxmX2V2YWx1YXRpb246IDEwLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB0b3RhbEltcHJvdmVtZW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0ZWNobmlxdWVJZCBvZiB0ZWNobmlxdWVzQXBwbGllZCkge1xuICAgICAgICAgICAgdG90YWxJbXByb3ZlbWVudCArPSBpbXByb3ZlbWVudE1hcFt0ZWNobmlxdWVJZF0gfHwgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcCBhdCByZWFzb25hYmxlIG1heGltdW0gKGRpbWluaXNoaW5nIHJldHVybnMpXG4gICAgICAgIGNvbnN0IGVmZmVjdGl2ZUltcHJvdmVtZW50ID0gTWF0aC5taW4odG90YWxJbXByb3ZlbWVudCwgMTUwKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcXVhbGl0eUltcHJvdmVtZW50OiBlZmZlY3RpdmVJbXByb3ZlbWVudCxcbiAgICAgICAgICAgIHRlY2huaXF1ZXNBcHBsaWVkLFxuICAgICAgICAgICAgcmVzZWFyY2hCYXNpczpcbiAgICAgICAgICAgICAgICBcIkNvbWJpbmVkIHJlc2VhcmNoLWJhY2tlZCB0ZWNobmlxdWVzIChNQlpVQUksIEdvb2dsZSBEZWVwTWluZCwgSUNMUiAyMDI0KVwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uIHN1bW1hcnlcbiAgICAgKi9cbiAgICBnZXRTZXNzaW9uU3VtbWFyeShzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaW1wcm92ZW1lbnQgPSB0aGlzLmNhbGN1bGF0ZUV4cGVjdGVkSW1wcm92ZW1lbnQoc2Vzc2lvbik7XG4gICAgICAgIGNvbnN0IGFwcHJvdmVkQ291bnQgPSBzZXNzaW9uLnN0ZXBzLmZpbHRlcihcbiAgICAgICAgICAgIChzKSA9PiBzLnN0YXR1cyA9PT0gXCJhcHByb3ZlZFwiIHx8IHMuc3RhdHVzID09PSBcIm1vZGlmaWVkXCIsXG4gICAgICAgICkubGVuZ3RoO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBgT3B0aW1pemF0aW9uIFNlc3Npb24gJHtzZXNzaW9uLmlkfVxcbmAgK1xuICAgICAgICAgICAgYCAgQ29tcGxleGl0eTogJHtzZXNzaW9uLmNvbXBsZXhpdHl9XFxuYCArXG4gICAgICAgICAgICBgICBEb21haW46ICR7c2Vzc2lvbi5kb21haW59XFxuYCArXG4gICAgICAgICAgICBgICBTdGVwcyBBcHBsaWVkOiAke2FwcHJvdmVkQ291bnR9LyR7c2Vzc2lvbi5zdGVwcy5sZW5ndGh9XFxuYCArXG4gICAgICAgICAgICBgICBFeHBlY3RlZCBJbXByb3ZlbWVudDogfiR7aW1wcm92ZW1lbnQucXVhbGl0eUltcHJvdmVtZW50fSVgXG4gICAgICAgICk7XG4gICAgfVxufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQWFBLElBQU0sc0JBQXNCO0FBQUEsRUFDeEIsT0FBTyxDQUFDLFNBQVMsT0FBTyxTQUFTLE9BQU8sU0FBUyxXQUFXLGNBQWM7QUFBQSxFQUMxRSxRQUFRO0FBQUEsSUFDSjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFdBQVcsQ0FBQyxhQUFhLFNBQVMsVUFBVSxXQUFXLFNBQVMsTUFBTTtBQUFBLEVBQ3RFLFNBQVMsQ0FBQyxXQUFXLGFBQWEsYUFBYSxZQUFZLGVBQWU7QUFDOUU7QUFLQSxJQUFNLGtCQUE0QztBQUFBLEVBQzlDLFVBQVU7QUFBQSxJQUNOO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FB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QSxJQUNKO0FBQUEsSUFDQSxLQUFLLGtCQUFrQixPQUFPO0FBQUE7QUFBQSxFQU1sQyxrQkFBa0IsQ0FBQyxhQUFnQztBQUFBLElBQy9DLElBQUksQ0FBQyxLQUFLLFlBQVksZUFBZSxTQUFTLFdBQVcsR0FBRztBQUFBLE1BQ3hELEtBQUssWUFBWSxlQUFlLEtBQUssV0FBVztBQUFBLElBQ3BEO0FBQUE7QUFBQSxFQU1KLGlCQUFpQixDQUNiLFFBU0EsU0FDSTtBQUFBLElBQ0osS0FBSyxZQUFZLGVBQWUsVUFBVTtBQUFBO0FBQUEsRUFNOUMsaUJBQWlCLENBQUMsU0FBeUI7QUFBQSxJQUN2QyxLQUFLLE9BQU8sY0FDUixZQUFZLFlBQVksVUFBVSxDQUFDLEtBQUssT0FBTztBQUFBO0FBQUEsRUFNdkQsWUFBWSxDQUFDLFdBQWlEO0FBQUEsSUFDMUQsS0FBSyxPQUFPLFlBQVk7QUFBQTtBQUFBLEVBTTVCLDRCQUE0QixDQUN4QixTQUNtQjtBQUFBLElBQ25CLE1BQU0scUJBQXFCLFFBQVEsTUFBTSxPQUNyQyxDQUFDLE1BQU0sRUFBRSxXQUFXLGNBQWMsRUFBRSxXQUFXLFVBQ25EO0FBQUEsSUFDQSxNQUFNLG9CQUFvQixtQkFBbUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTO0FBQUEsSUFHbkUsTUFBTSxpQkFBOEM7QUFBQSxNQUNoRCxVQUFVO0FBQUEsTUFDVixnQkFBZ0I7QUFBQSxNQUNoQixpQkFBaUI7QUFBQSxNQUNqQixpQkFBaUI7QUFBQSxNQUNqQixtQkFBbUI7QUFBQSxNQUNuQixpQkFBaUI7QUFBQSxJQUNyQjtBQUFBLElBRUEsSUFBSSxtQkFBbUI7QUFBQSxJQUN2QixXQUFXLGVBQWUsbUJBQW1CO0FBQUEsTUFDekMsb0JBQW9CLGVBQWUsZ0JBQWdCO0FBQUEsSUFDdkQ7QUFBQSxJQUdBLE1BQU0sdUJBQXVCLEtBQUssSUFBSSxrQkFBa0IsR0FBRztBQUFBLElBRTNELE9BQU87QUFBQSxNQUNILG9CQUFvQjtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxlQUNJO0FBQUEsSUFDUjtBQUFBO0FBQUEsRUFNSixpQkFBaUIsQ0FBQyxTQUFzQztBQUFBLElBQ3BELE1BQU0sY0FBYyxLQUFLLDZCQUE2QixPQUFPO0FBQUEsSUFDN0QsTUFBTSxnQkFBZ0IsUUFBUSxNQUFNLE9BQ2hDLENBQUMsTUFBTSxFQUFFLFdBQVcsY0FBYyxFQUFFLFdBQVcsVUFDbkQsRUFBRTtBQUFBLElBRUYsT0FDSSx3QkFBd0IsUUFBUTtBQUFBLElBQ2hDLGlCQUFpQixRQUFRO0FBQUEsSUFDekIsYUFBYSxRQUFRO0FBQUEsSUFDckIsb0JBQW9CLGlCQUFpQixRQUFRLE1BQU07QUFBQSxJQUNuRCw0QkFBNEIsWUFBWTtBQUFBO0FBR3BEOyIsCiAgImRlYnVnSWQiOiAiNEI2MkM3MTNDMzYwQjY0RTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
