// src/research/analysis.ts
import { readFile } from "node:fs/promises";
class CodebaseAnalyzer {
  config;
  constructor(config) {
    this.config = config;
  }
  async analyze(discoveryResults, context) {
    const startTime = Date.now();
    try {
      const allFiles = this.collectAllFiles(discoveryResults);
      const evidence = await this.extractEvidence(allFiles);
      const insights = await this.generateInsights(evidence, discoveryResults);
      const relationships = await this.identifyRelationships(insights, evidence);
      const executionTime = Date.now() - startTime;
      return {
        source: "codebase-analyzer",
        insights,
        evidence,
        relationships,
        confidence: this.calculateOverallConfidence(insights, evidence),
        executionTime,
        metadata: {
          insightsGenerated: insights.length,
          evidenceCollected: evidence.length,
          relationshipsFound: relationships.length
        }
      };
    } catch (error) {
      throw new Error(`Codebase analyzer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  collectAllFiles(discoveryResults) {
    const files = [];
    for (const result of discoveryResults) {
      files.push(...result.files);
    }
    const uniqueFiles = files.filter((file, index, self) => index === self.findIndex((f) => f.path === file.path));
    return uniqueFiles.sort((a, b) => b.relevance - a.relevance);
  }
  async extractEvidence(files) {
    const evidence = [];
    for (const file of files.slice(0, 20)) {
      try {
        const content = await readFile(file.path, "utf-8");
        const fileEvidence = this.analyzeFileForEvidence(file, content);
        evidence.push(...fileEvidence);
      } catch (error) {}
    }
    return evidence;
  }
  analyzeFileForEvidence(file, content) {
    const evidence = [];
    const lines = content.split(`
`);
    const patterns = [
      { regex: /class\s+(\w+)/g, type: "class-definition" },
      { regex: /function\s+(\w+)/g, type: "function-definition" },
      { regex: /interface\s+(\w+)/g, type: "interface-definition" },
      {
        regex: /import.*from\s+['"]([^'"]+)['"]/g,
        type: "import-statement"
      },
      {
        regex: /export\s+(default\s+)?(class|function|interface|const|let|var)\s+(\w+)/g,
        type: "export-statement"
      },
      {
        regex: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK/g,
        type: "technical-debt"
      },
      { regex: /\/\*\*[\s\S]*?\*\//g, type: "documentation-block" }
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split(`
`).length;
        const snippet = this.getSnippet(lines, lineNumber - 1, 3);
        evidence.push({
          id: `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "code",
          source: "codebase-analyzer",
          content: match[0],
          file: file.path,
          line: lineNumber,
          confidence: this.assessEvidenceConfidence(match[0], pattern.type),
          relevance: file.relevance
        });
      }
    }
    return evidence;
  }
  getSnippet(lines, centerLine, context) {
    const start = Math.max(0, centerLine - context);
    const end = Math.min(lines.length, centerLine + context + 1);
    return lines.slice(start, end).join(`
`);
  }
  assessEvidenceConfidence(content, type) {
    if (type.includes("definition") && content.length > 10) {
      return "high" /* HIGH */;
    }
    if (type.includes("statement") && content.length > 5) {
      return "medium" /* MEDIUM */;
    }
    if (type.includes("debt")) {
      return "high" /* HIGH */;
    }
    return "low" /* LOW */;
  }
  async generateInsights(evidence, discoveryResults) {
    const insights = [];
    const evidenceByType = this.groupEvidenceByType(evidence);
    const evidenceByFile = this.groupEvidenceByFile(evidence);
    insights.push(...this.generatePatternInsights(evidenceByType));
    insights.push(...this.generateFileInsights(evidenceByFile));
    insights.push(...this.generateArchitecturalInsights(evidence, discoveryResults));
    return insights;
  }
  groupEvidenceByType(evidence) {
    const grouped = {};
    for (const item of evidence) {
      const key = `${item.type}-${item.source}`;
      if (!grouped[key])
        grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  }
  groupEvidenceByFile(evidence) {
    const grouped = {};
    for (const item of evidence) {
      if (item.file) {
        if (!grouped[item.file])
          grouped[item.file] = [];
        grouped[item.file].push(item);
      }
    }
    return grouped;
  }
  generatePatternInsights(evidenceByType) {
    const insights = [];
    for (const [type, items] of Object.entries(evidenceByType)) {
      if (items.length >= 5) {
        insights.push({
          id: `insight-pattern-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "pattern",
          title: `High frequency of ${type}`,
          description: `Found ${items.length} instances of ${type} across the codebase`,
          evidence: items.map((e) => e.id),
          confidence: "high" /* HIGH */,
          impact: items.length > 10 ? "high" : "medium",
          category: "pattern-analysis"
        });
      }
    }
    return insights;
  }
  generateFileInsights(evidenceByFile) {
    const insights = [];
    for (const [file, items] of Object.entries(evidenceByFile)) {
      if (items.length > 20) {
        insights.push({
          id: `insight-complexity-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "finding",
          title: `Complex file detected: ${file}`,
          description: `File contains ${items.length} significant code elements, may need refactoring`,
          evidence: items.slice(0, 10).map((e) => e.id),
          confidence: "medium" /* MEDIUM */,
          impact: "medium",
          category: "complexity-analysis"
        });
      }
      const debtItems = items.filter((e) => e.content.includes("TODO") || e.content.includes("FIXME"));
      if (debtItems.length > 0) {
        insights.push({
          id: `insight-debt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "finding",
          title: `Technical debt markers in ${file}`,
          description: `Found ${debtItems.length} TODO/FIXME comments indicating technical debt`,
          evidence: debtItems.map((e) => e.id),
          confidence: "high" /* HIGH */,
          impact: debtItems.length > 3 ? "high" : "medium",
          category: "technical-debt"
        });
      }
    }
    return insights;
  }
  generateArchitecturalInsights(evidence, discoveryResults) {
    const insights = [];
    const imports = evidence.filter((e) => e.type === "import-statement");
    const importSources = this.analyzeImportSources(imports);
    if (importSources.external > importSources.internal * 2) {
      insights.push({
        id: `insight-external-deps-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "decision",
        title: "High external dependency usage",
        description: `Codebase relies heavily on external dependencies (${importSources.external} vs ${importSources.internal} internal)`,
        evidence: imports.slice(0, 5).map((e) => e.id),
        confidence: "medium" /* MEDIUM */,
        impact: "medium",
        category: "architecture"
      });
    }
    return insights;
  }
  analyzeImportSources(imports) {
    let internal = 0;
    let external = 0;
    for (const imp of imports) {
      if (imp.content.startsWith("./") || imp.content.startsWith("../") || imp.content.startsWith("/")) {
        internal++;
      } else {
        external++;
      }
    }
    return { internal, external };
  }
  async identifyRelationships(insights, evidence) {
    const relationships = [];
    for (let i = 0;i < insights.length; i++) {
      for (let j = i + 1;j < insights.length; j++) {
        const insight1 = insights[i];
        const insight2 = insights[j];
        const sharedEvidence = insight1.evidence.filter((e) => insight2.evidence.includes(e));
        if (sharedEvidence.length > 0) {
          relationships.push({
            id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: "similarity",
            source: insight1.id,
            target: insight2.id,
            description: `Insights share ${sharedEvidence.length} pieces of evidence`,
            strength: sharedEvidence.length / Math.max(insight1.evidence.length, insight2.evidence.length),
            evidence: sharedEvidence
          });
        }
        if (insight1.category === insight2.category && insight1.category !== "pattern-analysis") {
          relationships.push({
            id: `rel-category-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: "enhancement",
            source: insight1.id,
            target: insight2.id,
            description: `Both insights relate to ${insight1.category}`,
            strength: 0.7,
            evidence: [
              ...insight1.evidence.slice(0, 2),
              ...insight2.evidence.slice(0, 2)
            ]
          });
        }
      }
    }
    return relationships;
  }
  calculateOverallConfidence(insights, evidence) {
    if (insights.length === 0)
      return "low" /* LOW */;
    const insightConfidence = insights.reduce((sum, insight) => {
      const confidenceValue = this.confidenceToNumber(insight.confidence);
      return sum + confidenceValue;
    }, 0) / insights.length;
    const evidenceConfidence = evidence.reduce((sum, ev) => {
      const confidenceValue = this.confidenceToNumber(ev.confidence);
      return sum + confidenceValue;
    }, 0) / evidence.length;
    const overallConfidence = (insightConfidence + evidenceConfidence) / 2;
    if (overallConfidence >= 0.8)
      return "high" /* HIGH */;
    if (overallConfidence >= 0.6)
      return "medium" /* MEDIUM */;
    return "low" /* LOW */;
  }
  confidenceToNumber(confidence) {
    switch (confidence) {
      case "high" /* HIGH */:
        return 0.9;
      case "medium" /* MEDIUM */:
        return 0.6;
      case "low" /* LOW */:
        return 0.3;
      default:
        return 0.1;
    }
  }
}

class ResearchAnalyzer {
  config;
  constructor(config) {
    this.config = config;
  }
  async analyze(discoveryResults, context) {
    const startTime = Date.now();
    try {
      const allDocs = this.collectAllDocumentation(discoveryResults);
      const evidence = await this.extractDocumentationEvidence(allDocs);
      const patternEvidence = await this.analyzePatterns(discoveryResults);
      evidence.push(...patternEvidence);
      const insights = await this.generateDocumentationInsights(evidence, discoveryResults);
      const relationships = await this.identifyDocumentationRelationships(insights, evidence);
      const executionTime = Date.now() - startTime;
      return {
        source: "research-analyzer",
        insights,
        evidence,
        relationships,
        confidence: this.calculateOverallConfidence(insights, evidence),
        executionTime,
        metadata: {
          insightsGenerated: insights.length,
          evidenceCollected: evidence.length,
          relationshipsFound: relationships.length
        }
      };
    } catch (error) {
      throw new Error(`Research analyzer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  collectAllDocumentation(discoveryResults) {
    const docs = [];
    for (const result of discoveryResults) {
      docs.push(...result.documentation);
    }
    const uniqueDocs = docs.filter((doc, index, self) => index === self.findIndex((d) => d.path === doc.path));
    return uniqueDocs.sort((a, b) => b.relevance - a.relevance);
  }
  async extractDocumentationEvidence(docs) {
    const evidence = [];
    for (const doc of docs.slice(0, 15)) {
      try {
        const content = await readFile(doc.path, "utf-8");
        const docEvidence = this.analyzeDocumentationForEvidence(doc, content);
        evidence.push(...docEvidence);
      } catch (error) {}
    }
    return evidence;
  }
  analyzeDocumentationForEvidence(doc, content) {
    const evidence = [];
    const lines = content.split(`
`);
    const patterns = [
      {
        regex: /#+\s+(.+)/g,
        type: "heading",
        confidence: "high" /* HIGH */
      },
      {
        regex: /```[\s\S]*?```/g,
        type: "code-block",
        confidence: "high" /* HIGH */
      },
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        type: "link",
        confidence: "medium" /* MEDIUM */
      },
      {
        regex: /`([^`]+)`/g,
        type: "inline-code",
        confidence: "medium" /* MEDIUM */
      },
      {
        regex: /TODO|FIXME|NOTE|WARNING/g,
        type: "attention-marker",
        confidence: "high" /* HIGH */
      },
      {
        regex: /\*\*([^*]+)\*\*/g,
        type: "emphasis",
        confidence: "low" /* LOW */
      }
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split(`
`).length;
        evidence.push({
          id: `evidence-doc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "documentation",
          source: "research-analyzer",
          content: match[0],
          file: doc.path,
          line: lineNumber,
          confidence: pattern.confidence,
          relevance: doc.relevance
        });
      }
    }
    return evidence;
  }
  async analyzePatterns(discoveryResults) {
    const evidence = [];
    for (const result of discoveryResults) {
      for (const pattern of result.patterns) {
        evidence.push({
          id: `evidence-pattern-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "pattern",
          source: "research-analyzer",
          content: `Pattern: ${pattern.pattern} (found ${pattern.frequency} times)`,
          confidence: pattern.confidence,
          relevance: pattern.matches.length > 0 ? Math.max(...pattern.matches.map((m) => m.relevance)) : 0.5
        });
      }
    }
    return evidence;
  }
  async generateDocumentationInsights(evidence, discoveryResults) {
    const insights = [];
    const evidenceByFile = this.groupEvidenceByFile(evidence);
    if (Object.keys(evidenceByFile).length > 0) {
      insights.push({
        id: `insight-doc-overview-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "finding",
        title: "Documentation analysis completed",
        description: `Analyzed ${Object.keys(evidenceByFile).length} documentation files with ${evidence.length} evidence points`,
        evidence: evidence.slice(0, 5).map((e) => e.id),
        confidence: "high" /* HIGH */,
        impact: "medium",
        category: "documentation-quality"
      });
    }
    insights.push(...this.generateDocumentationQualityInsights(evidenceByFile));
    insights.push(...this.generatePatternAnalysisInsights(evidence));
    insights.push(...this.generateCompletenessInsights(evidence, discoveryResults));
    return insights;
  }
  groupEvidenceByFile(evidence) {
    const grouped = {};
    for (const item of evidence) {
      if (item.file) {
        if (!grouped[item.file])
          grouped[item.file] = [];
        grouped[item.file].push(item);
      }
    }
    return grouped;
  }
  generateDocumentationQualityInsights(evidenceByFile) {
    const insights = [];
    for (const [file, items] of Object.entries(evidenceByFile)) {
      const headings = items.filter((e) => e.content.includes("#"));
      const codeBlocks = items.filter((e) => e.content.includes("```"));
      const links = items.filter((e) => e.content.includes("[") && e.content.includes("]("));
      if (headings.length === 0 && items.length > 5) {
        insights.push({
          id: `insight-doc-structure-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "finding",
          title: `Poor documentation structure in ${file}`,
          description: `Document lacks proper headings despite having ${items.length} elements`,
          evidence: items.slice(0, 5).map((e) => e.id),
          confidence: "medium" /* MEDIUM */,
          impact: "medium",
          category: "documentation-quality"
        });
      }
      if (codeBlocks.length > 0 && headings.length === 0) {
        insights.push({
          id: `insight-code-explanation-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          type: "finding",
          title: `Code without explanation in ${file}`,
          description: `Document contains ${codeBlocks.length} code blocks but lacks explanatory headings`,
          evidence: codeBlocks.slice(0, 3).map((e) => e.id),
          confidence: "high" /* HIGH */,
          impact: "medium",
          category: "documentation-quality"
        });
      }
    }
    return insights;
  }
  generatePatternAnalysisInsights(evidence) {
    const insights = [];
    const patternEvidence = evidence.filter((e) => e.type === "pattern");
    const highFrequencyPatterns = patternEvidence.filter((e) => {
      if (!e.content.includes("found"))
        return false;
      const match = e.content.match(/found (\d+) times/);
      return match ? Number.parseInt(match[1]) > 5 : false;
    });
    if (highFrequencyPatterns.length > 0) {
      insights.push({
        id: `insight-high-freq-patterns-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "pattern",
        title: "High-frequency patterns detected",
        description: `Found ${highFrequencyPatterns.length} patterns that occur more than 5 times`,
        evidence: highFrequencyPatterns.map((e) => e.id),
        confidence: "high" /* HIGH */,
        impact: "high",
        category: "pattern-analysis"
      });
    }
    return insights;
  }
  generateCompletenessInsights(evidence, discoveryResults) {
    const insights = [];
    const docEvidence = evidence.filter((e) => e.type === "documentation");
    const patternEvidence = evidence.filter((e) => e.type === "pattern");
    if (patternEvidence.length > docEvidence.length * 2) {
      insights.push({
        id: `insight-doc-coverage-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "finding",
        title: "Insufficient documentation coverage",
        description: `Found ${patternEvidence.length} patterns but only ${docEvidence.length} documentation elements`,
        evidence: [
          ...patternEvidence.slice(0, 3).map((e) => e.id),
          ...docEvidence.slice(0, 3).map((e) => e.id)
        ],
        confidence: "medium" /* MEDIUM */,
        impact: "high",
        category: "documentation-coverage"
      });
    }
    return insights;
  }
  async identifyDocumentationRelationships(insights, evidence) {
    const relationships = [];
    const insightsByCategory = this.groupInsightsByCategory(insights);
    for (const [category, categoryInsights] of Object.entries(insightsByCategory)) {
      if (categoryInsights.length > 1) {
        for (let i = 0;i < categoryInsights.length; i++) {
          for (let j = i + 1;j < categoryInsights.length; j++) {
            relationships.push({
              id: `rel-doc-category-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
              type: "similarity",
              source: categoryInsights[i].id,
              target: categoryInsights[j].id,
              description: `Both insights relate to ${category}`,
              strength: 0.8,
              evidence: [
                ...categoryInsights[i].evidence.slice(0, 2),
                ...categoryInsights[j].evidence.slice(0, 2)
              ]
            });
          }
        }
      }
    }
    return relationships;
  }
  groupInsightsByCategory(insights) {
    const grouped = {};
    for (const insight of insights) {
      if (!grouped[insight.category])
        grouped[insight.category] = [];
      grouped[insight.category].push(insight);
    }
    return grouped;
  }
  calculateOverallConfidence(insights, evidence) {
    if (insights.length === 0)
      return "low" /* LOW */;
    const insightConfidence = insights.reduce((sum, insight) => {
      const confidenceValue = this.confidenceToNumber(insight.confidence);
      return sum + confidenceValue;
    }, 0) / insights.length;
    const evidenceConfidence = evidence.reduce((sum, ev) => {
      const confidenceValue = this.confidenceToNumber(ev.confidence);
      return sum + confidenceValue;
    }, 0) / evidence.length;
    const overallConfidence = (insightConfidence + evidenceConfidence) / 2;
    if (overallConfidence >= 0.8)
      return "high" /* HIGH */;
    if (overallConfidence >= 0.6)
      return "medium" /* MEDIUM */;
    return "low" /* LOW */;
  }
  confidenceToNumber(confidence) {
    switch (confidence) {
      case "high" /* HIGH */:
        return 0.9;
      case "medium" /* MEDIUM */:
        return 0.6;
      case "low" /* LOW */:
        return 0.3;
      default:
        return 0.1;
    }
  }
}

class AnalysisHandler {
  codebaseAnalyzer;
  researchAnalyzer;
  config;
  constructor(config) {
    this.config = config;
    this.codebaseAnalyzer = new CodebaseAnalyzer(config);
    this.researchAnalyzer = new ResearchAnalyzer(config);
  }
  async executeAnalysis(discoveryResults, query) {
    try {
      const codebaseAnalysis = await this.codebaseAnalyzer.analyze(discoveryResults, query);
      const researchAnalysis = await this.researchAnalyzer.analyze(discoveryResults, {
        ...query,
        codebaseContext: codebaseAnalysis
      });
      const combinedInsights = [
        ...codebaseAnalysis.insights,
        ...researchAnalysis.insights
      ];
      const combinedEvidence = [
        ...codebaseAnalysis.evidence,
        ...researchAnalysis.evidence
      ];
      const combinedRelationships = [
        ...codebaseAnalysis.relationships,
        ...researchAnalysis.relationships
      ];
      return {
        codebaseAnalysis,
        researchAnalysis,
        combinedInsights,
        combinedEvidence,
        combinedRelationships
      };
    } catch (error) {
      throw new Error(`Analysis execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  getAnalysisMetrics(results) {
    const {
      codebaseAnalysis,
      researchAnalysis,
      combinedInsights,
      combinedEvidence,
      combinedRelationships
    } = results;
    const totalInsights = combinedInsights.length;
    const totalEvidence = combinedEvidence.length;
    const totalRelationships = combinedRelationships.length;
    const averageConfidence = this.calculateAverageConfidence(combinedInsights, combinedEvidence);
    const executionTime = codebaseAnalysis.executionTime + researchAnalysis.executionTime;
    return {
      totalInsights,
      totalEvidence,
      totalRelationships,
      averageConfidence,
      executionTime
    };
  }
  calculateAverageConfidence(insights, evidence) {
    const insightScores = insights.map((i) => this.confidenceToNumber(i.confidence));
    const evidenceScores = evidence.map((e) => this.confidenceToNumber(e.confidence));
    const allScores = [...insightScores, ...evidenceScores];
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }
  confidenceToNumber(confidence) {
    switch (confidence) {
      case "high" /* HIGH */:
        return 0.9;
      case "medium" /* MEDIUM */:
        return 0.6;
      case "low" /* LOW */:
        return 0.3;
      default:
        return 0.1;
    }
  }
}
export {
  ResearchAnalyzer,
  CodebaseAnalyzer,
  AnalysisHandler
};

//# debugId=C8F9201B2B09EA8C64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3Jlc2VhcmNoL2FuYWx5c2lzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogQW5hbHlzaXMgcGhhc2UgaGFuZGxlcnMgZm9yIHJlc2VhcmNoIG9yY2hlc3RyYXRpb24uXG4gKiBJbXBsZW1lbnRzIHNlcXVlbnRpYWwgYW5hbHlzaXMgd2l0aCAyIHNwZWNpYWxpemVkIGFnZW50cy5cbiAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBleHRuYW1lLCBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFuYWx5c2lzQWdlbnQsXG4gICAgdHlwZSBBbmFseXNpc1Jlc3VsdCxcbiAgICBDb25maWRlbmNlTGV2ZWwsXG4gICAgdHlwZSBEaXNjb3ZlcnlSZXN1bHQsXG4gICAgdHlwZSBEb2NSZWZlcmVuY2UsXG4gICAgdHlwZSBFdmlkZW5jZSxcbiAgICB0eXBlIEZpbGVSZWZlcmVuY2UsXG4gICAgdHlwZSBJbnNpZ2h0LFxuICAgIFBhdHRlcm5NYXRjaCxcbiAgICB0eXBlIFJlbGF0aW9uc2hpcCxcbiAgICB0eXBlIFJlc2VhcmNoUXVlcnksXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogQ29kZWJhc2UgQW5hbHl6ZXIgQWdlbnRcbiAqIEFuYWx5emVzIGNvZGUgZmlsZXMgZm9yIGluc2lnaHRzIGFuZCByZWxhdGlvbnNoaXBzXG4gKi9cbmV4cG9ydCBjbGFzcyBDb2RlYmFzZUFuYWx5emVyIGltcGxlbWVudHMgQW5hbHlzaXNBZ2VudCB7XG4gICAgcHJpdmF0ZSBjb25maWc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogYW55KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIH1cblxuICAgIGFzeW5jIGFuYWx5emUoXG4gICAgICAgIGRpc2NvdmVyeVJlc3VsdHM6IERpc2NvdmVyeVJlc3VsdFtdLFxuICAgICAgICBjb250ZXh0PzogYW55LFxuICAgICk6IFByb21pc2U8QW5hbHlzaXNSZXN1bHQ+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMS4gQ29sbGVjdCBhbGwgZmlsZXMgZnJvbSBkaXNjb3ZlcnkgcmVzdWx0c1xuICAgICAgICAgICAgY29uc3QgYWxsRmlsZXMgPSB0aGlzLmNvbGxlY3RBbGxGaWxlcyhkaXNjb3ZlcnlSZXN1bHRzKTtcblxuICAgICAgICAgICAgLy8gMi4gRXh0cmFjdCBldmlkZW5jZSBmcm9tIGZpbGVzXG4gICAgICAgICAgICBjb25zdCBldmlkZW5jZSA9IGF3YWl0IHRoaXMuZXh0cmFjdEV2aWRlbmNlKGFsbEZpbGVzKTtcblxuICAgICAgICAgICAgLy8gMy4gR2VuZXJhdGUgaW5zaWdodHMgZnJvbSBldmlkZW5jZVxuICAgICAgICAgICAgY29uc3QgaW5zaWdodHMgPSBhd2FpdCB0aGlzLmdlbmVyYXRlSW5zaWdodHMoXG4gICAgICAgICAgICAgICAgZXZpZGVuY2UsXG4gICAgICAgICAgICAgICAgZGlzY292ZXJ5UmVzdWx0cyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIDQuIElkZW50aWZ5IHJlbGF0aW9uc2hpcHNcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBhd2FpdCB0aGlzLmlkZW50aWZ5UmVsYXRpb25zaGlwcyhcbiAgICAgICAgICAgICAgICBpbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICBldmlkZW5jZSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvblRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogXCJjb2RlYmFzZS1hbmFseXplclwiLFxuICAgICAgICAgICAgICAgIGluc2lnaHRzLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlLFxuICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcHMsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogdGhpcy5jYWxjdWxhdGVPdmVyYWxsQ29uZmlkZW5jZShpbnNpZ2h0cywgZXZpZGVuY2UpLFxuICAgICAgICAgICAgICAgIGV4ZWN1dGlvblRpbWUsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5zaWdodHNHZW5lcmF0ZWQ6IGluc2lnaHRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZXZpZGVuY2VDb2xsZWN0ZWQ6IGV2aWRlbmNlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwc0ZvdW5kOiByZWxhdGlvbnNoaXBzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgQ29kZWJhc2UgYW5hbHl6ZXIgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbGxlY3RBbGxGaWxlcyhcbiAgICAgICAgZGlzY292ZXJ5UmVzdWx0czogRGlzY292ZXJ5UmVzdWx0W10sXG4gICAgKTogRmlsZVJlZmVyZW5jZVtdIHtcbiAgICAgICAgY29uc3QgZmlsZXM6IEZpbGVSZWZlcmVuY2VbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGRpc2NvdmVyeVJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goLi4ucmVzdWx0LmZpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGFuZCBzb3J0IGJ5IHJlbGV2YW5jZVxuICAgICAgICBjb25zdCB1bmlxdWVGaWxlcyA9IGZpbGVzLmZpbHRlcihcbiAgICAgICAgICAgIChmaWxlLCBpbmRleCwgc2VsZikgPT5cbiAgICAgICAgICAgICAgICBpbmRleCA9PT0gc2VsZi5maW5kSW5kZXgoKGYpID0+IGYucGF0aCA9PT0gZmlsZS5wYXRoKSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdW5pcXVlRmlsZXMuc29ydCgoYSwgYikgPT4gYi5yZWxldmFuY2UgLSBhLnJlbGV2YW5jZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBleHRyYWN0RXZpZGVuY2UoZmlsZXM6IEZpbGVSZWZlcmVuY2VbXSk6IFByb21pc2U8RXZpZGVuY2VbXT4ge1xuICAgICAgICBjb25zdCBldmlkZW5jZTogRXZpZGVuY2VbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcy5zbGljZSgwLCAyMCkpIHtcbiAgICAgICAgICAgIC8vIExpbWl0IHRvIHRvcCAyMCBmaWxlc1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoZmlsZS5wYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVFdmlkZW5jZSA9IHRoaXMuYW5hbHl6ZUZpbGVGb3JFdmlkZW5jZShmaWxlLCBjb250ZW50KTtcbiAgICAgICAgICAgICAgICBldmlkZW5jZS5wdXNoKC4uLmZpbGVFdmlkZW5jZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmlkZW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFuYWx5emVGaWxlRm9yRXZpZGVuY2UoXG4gICAgICAgIGZpbGU6IEZpbGVSZWZlcmVuY2UsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICApOiBFdmlkZW5jZVtdIHtcbiAgICAgICAgY29uc3QgZXZpZGVuY2U6IEV2aWRlbmNlW10gPSBbXTtcbiAgICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICAgIC8vIExvb2sgZm9yIGtleSBwYXR0ZXJuc1xuICAgICAgICBjb25zdCBwYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIHsgcmVnZXg6IC9jbGFzc1xccysoXFx3KykvZywgdHlwZTogXCJjbGFzcy1kZWZpbml0aW9uXCIgfSxcbiAgICAgICAgICAgIHsgcmVnZXg6IC9mdW5jdGlvblxccysoXFx3KykvZywgdHlwZTogXCJmdW5jdGlvbi1kZWZpbml0aW9uXCIgfSxcbiAgICAgICAgICAgIHsgcmVnZXg6IC9pbnRlcmZhY2VcXHMrKFxcdyspL2csIHR5cGU6IFwiaW50ZXJmYWNlLWRlZmluaXRpb25cIiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlZ2V4OiAvaW1wb3J0Lipmcm9tXFxzK1snXCJdKFteJ1wiXSspWydcIl0vZyxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImltcG9ydC1zdGF0ZW1lbnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVnZXg6IC9leHBvcnRcXHMrKGRlZmF1bHRcXHMrKT8oY2xhc3N8ZnVuY3Rpb258aW50ZXJmYWNlfGNvbnN0fGxldHx2YXIpXFxzKyhcXHcrKS9nLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiZXhwb3J0LXN0YXRlbWVudFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZWdleDogL1xcL1xcL1xccypUT0RPfFxcL1xcL1xccypGSVhNRXxcXC9cXC9cXHMqSEFDSy9nLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwidGVjaG5pY2FsLWRlYnRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IHJlZ2V4OiAvXFwvXFwqXFwqW1xcc1xcU10qP1xcKlxcLy9nLCB0eXBlOiBcImRvY3VtZW50YXRpb24tYmxvY2tcIiB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgICAgICAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHBhdHRlcm4ucmVnZXguZXhlYyhjb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lTnVtYmVyID0gY29udGVudFxuICAgICAgICAgICAgICAgICAgICAuc3Vic3RyaW5nKDAsIG1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoXCJcXG5cIikubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNuaXBwZXQgPSB0aGlzLmdldFNuaXBwZXQobGluZXMsIGxpbmVOdW1iZXIgLSAxLCAzKTtcblxuICAgICAgICAgICAgICAgIGV2aWRlbmNlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogYGV2aWRlbmNlLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjb2RlXCIsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogXCJjb2RlYmFzZS1hbmFseXplclwiLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtYXRjaFswXSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBsaW5lOiBsaW5lTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiB0aGlzLmFzc2Vzc0V2aWRlbmNlQ29uZmlkZW5jZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybi50eXBlLFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICByZWxldmFuY2U6IGZpbGUucmVsZXZhbmNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2aWRlbmNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U25pcHBldChcbiAgICAgICAgbGluZXM6IHN0cmluZ1tdLFxuICAgICAgICBjZW50ZXJMaW5lOiBudW1iZXIsXG4gICAgICAgIGNvbnRleHQ6IG51bWJlcixcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KDAsIGNlbnRlckxpbmUgLSBjb250ZXh0KTtcbiAgICAgICAgY29uc3QgZW5kID0gTWF0aC5taW4obGluZXMubGVuZ3RoLCBjZW50ZXJMaW5lICsgY29udGV4dCArIDEpO1xuICAgICAgICByZXR1cm4gbGluZXMuc2xpY2Uoc3RhcnQsIGVuZCkuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzc2Vzc0V2aWRlbmNlQ29uZmlkZW5jZShcbiAgICAgICAgY29udGVudDogc3RyaW5nLFxuICAgICAgICB0eXBlOiBzdHJpbmcsXG4gICAgKTogQ29uZmlkZW5jZUxldmVsIHtcbiAgICAgICAgLy8gU2ltcGxlIGNvbmZpZGVuY2UgYXNzZXNzbWVudCBiYXNlZCBvbiBjb250ZW50IGFuZCB0eXBlXG4gICAgICAgIGlmICh0eXBlLmluY2x1ZGVzKFwiZGVmaW5pdGlvblwiKSAmJiBjb250ZW50Lmxlbmd0aCA+IDEwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkhJR0g7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUuaW5jbHVkZXMoXCJzdGF0ZW1lbnRcIikgJiYgY29udGVudC5sZW5ndGggPiA1KSB7XG4gICAgICAgICAgICByZXR1cm4gQ29uZmlkZW5jZUxldmVsLk1FRElVTTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZS5pbmNsdWRlcyhcImRlYnRcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBDb25maWRlbmNlTGV2ZWwuSElHSDsgLy8gVGVjaG5pY2FsIGRlYnQgbWFya2VycyBhcmUgdXN1YWxseSByZWxpYWJsZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTE9XO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVJbnNpZ2h0cyhcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgICAgIGRpc2NvdmVyeVJlc3VsdHM6IERpc2NvdmVyeVJlc3VsdFtdLFxuICAgICk6IFByb21pc2U8SW5zaWdodFtdPiB7XG4gICAgICAgIGNvbnN0IGluc2lnaHRzOiBJbnNpZ2h0W10gPSBbXTtcblxuICAgICAgICAvLyBHcm91cCBldmlkZW5jZSBieSB0eXBlIGFuZCBsb2NhdGlvblxuICAgICAgICBjb25zdCBldmlkZW5jZUJ5VHlwZSA9IHRoaXMuZ3JvdXBFdmlkZW5jZUJ5VHlwZShldmlkZW5jZSk7XG4gICAgICAgIGNvbnN0IGV2aWRlbmNlQnlGaWxlID0gdGhpcy5ncm91cEV2aWRlbmNlQnlGaWxlKGV2aWRlbmNlKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBpbnNpZ2h0cyBmcm9tIHBhdHRlcm5zXG4gICAgICAgIGluc2lnaHRzLnB1c2goLi4udGhpcy5nZW5lcmF0ZVBhdHRlcm5JbnNpZ2h0cyhldmlkZW5jZUJ5VHlwZSkpO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGluc2lnaHRzIGZyb20gZmlsZSBhbmFseXNpc1xuICAgICAgICBpbnNpZ2h0cy5wdXNoKC4uLnRoaXMuZ2VuZXJhdGVGaWxlSW5zaWdodHMoZXZpZGVuY2VCeUZpbGUpKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBhcmNoaXRlY3R1cmFsIGluc2lnaHRzXG4gICAgICAgIGluc2lnaHRzLnB1c2goXG4gICAgICAgICAgICAuLi50aGlzLmdlbmVyYXRlQXJjaGl0ZWN0dXJhbEluc2lnaHRzKGV2aWRlbmNlLCBkaXNjb3ZlcnlSZXN1bHRzKSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaW5zaWdodHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBncm91cEV2aWRlbmNlQnlUeXBlKFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICApOiBSZWNvcmQ8c3RyaW5nLCBFdmlkZW5jZVtdPiB7XG4gICAgICAgIGNvbnN0IGdyb3VwZWQ6IFJlY29yZDxzdHJpbmcsIEV2aWRlbmNlW10+ID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGV2aWRlbmNlKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtpdGVtLnR5cGV9LSR7aXRlbS5zb3VyY2V9YDtcbiAgICAgICAgICAgIGlmICghZ3JvdXBlZFtrZXldKSBncm91cGVkW2tleV0gPSBbXTtcbiAgICAgICAgICAgIGdyb3VwZWRba2V5XS5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwZWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBncm91cEV2aWRlbmNlQnlGaWxlKFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICApOiBSZWNvcmQ8c3RyaW5nLCBFdmlkZW5jZVtdPiB7XG4gICAgICAgIGNvbnN0IGdyb3VwZWQ6IFJlY29yZDxzdHJpbmcsIEV2aWRlbmNlW10+ID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGV2aWRlbmNlKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5maWxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFncm91cGVkW2l0ZW0uZmlsZV0pIGdyb3VwZWRbaXRlbS5maWxlXSA9IFtdO1xuICAgICAgICAgICAgICAgIGdyb3VwZWRbaXRlbS5maWxlXS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwZWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVBhdHRlcm5JbnNpZ2h0cyhcbiAgICAgICAgZXZpZGVuY2VCeVR5cGU6IFJlY29yZDxzdHJpbmcsIEV2aWRlbmNlW10+LFxuICAgICk6IEluc2lnaHRbXSB7XG4gICAgICAgIGNvbnN0IGluc2lnaHRzOiBJbnNpZ2h0W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFt0eXBlLCBpdGVtc10gb2YgT2JqZWN0LmVudHJpZXMoZXZpZGVuY2VCeVR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID49IDUpIHtcbiAgICAgICAgICAgICAgICBpbnNpZ2h0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBpbnNpZ2h0LXBhdHRlcm4tJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBhdHRlcm5cIixcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGBIaWdoIGZyZXF1ZW5jeSBvZiAke3R5cGV9YCxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBGb3VuZCAke2l0ZW1zLmxlbmd0aH0gaW5zdGFuY2VzIG9mICR7dHlwZX0gYWNyb3NzIHRoZSBjb2RlYmFzZWAsXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBpdGVtcy5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwuSElHSCxcbiAgICAgICAgICAgICAgICAgICAgaW1wYWN0OiBpdGVtcy5sZW5ndGggPiAxMCA/IFwiaGlnaFwiIDogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwicGF0dGVybi1hbmFseXNpc1wiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc2lnaHRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVGaWxlSW5zaWdodHMoXG4gICAgICAgIGV2aWRlbmNlQnlGaWxlOiBSZWNvcmQ8c3RyaW5nLCBFdmlkZW5jZVtdPixcbiAgICApOiBJbnNpZ2h0W10ge1xuICAgICAgICBjb25zdCBpbnNpZ2h0czogSW5zaWdodFtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBbZmlsZSwgaXRlbXNdIG9mIE9iamVjdC5lbnRyaWVzKGV2aWRlbmNlQnlGaWxlKSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbXBsZXggZmlsZXNcbiAgICAgICAgICAgIGlmIChpdGVtcy5sZW5ndGggPiAyMCkge1xuICAgICAgICAgICAgICAgIGluc2lnaHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogYGluc2lnaHQtY29tcGxleGl0eS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZmluZGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYENvbXBsZXggZmlsZSBkZXRlY3RlZDogJHtmaWxlfWAsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRmlsZSBjb250YWlucyAke2l0ZW1zLmxlbmd0aH0gc2lnbmlmaWNhbnQgY29kZSBlbGVtZW50cywgbWF5IG5lZWQgcmVmYWN0b3JpbmdgLFxuICAgICAgICAgICAgICAgICAgICBldmlkZW5jZTogaXRlbXMuc2xpY2UoMCwgMTApLm1hcCgoZSkgPT4gZS5pZCksIC8vIExpbWl0IGV2aWRlbmNlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5NRURJVU0sXG4gICAgICAgICAgICAgICAgICAgIGltcGFjdDogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiY29tcGxleGl0eS1hbmFseXNpc1wiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgdGVjaG5pY2FsIGRlYnRcbiAgICAgICAgICAgIGNvbnN0IGRlYnRJdGVtcyA9IGl0ZW1zLmZpbHRlcihcbiAgICAgICAgICAgICAgICAoZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgZS5jb250ZW50LmluY2x1ZGVzKFwiVE9ET1wiKSB8fCBlLmNvbnRlbnQuaW5jbHVkZXMoXCJGSVhNRVwiKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoZGVidEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpbnNpZ2h0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBpbnNpZ2h0LWRlYnQtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImZpbmRpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGBUZWNobmljYWwgZGVidCBtYXJrZXJzIGluICR7ZmlsZX1gLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYEZvdW5kICR7ZGVidEl0ZW1zLmxlbmd0aH0gVE9ETy9GSVhNRSBjb21tZW50cyBpbmRpY2F0aW5nIHRlY2huaWNhbCBkZWJ0YCxcbiAgICAgICAgICAgICAgICAgICAgZXZpZGVuY2U6IGRlYnRJdGVtcy5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwuSElHSCxcbiAgICAgICAgICAgICAgICAgICAgaW1wYWN0OiBkZWJ0SXRlbXMubGVuZ3RoID4gMyA/IFwiaGlnaFwiIDogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwidGVjaG5pY2FsLWRlYnRcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnNpZ2h0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlQXJjaGl0ZWN0dXJhbEluc2lnaHRzKFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICAgICAgZGlzY292ZXJ5UmVzdWx0czogRGlzY292ZXJ5UmVzdWx0W10sXG4gICAgKTogSW5zaWdodFtdIHtcbiAgICAgICAgY29uc3QgaW5zaWdodHM6IEluc2lnaHRbXSA9IFtdO1xuXG4gICAgICAgIC8vIEFuYWx5emUgaW1wb3J0IHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGltcG9ydHMgPSBldmlkZW5jZS5maWx0ZXIoKGUpID0+IGUudHlwZSA9PT0gXCJpbXBvcnQtc3RhdGVtZW50XCIpO1xuICAgICAgICBjb25zdCBpbXBvcnRTb3VyY2VzID0gdGhpcy5hbmFseXplSW1wb3J0U291cmNlcyhpbXBvcnRzKTtcblxuICAgICAgICBpZiAoaW1wb3J0U291cmNlcy5leHRlcm5hbCA+IGltcG9ydFNvdXJjZXMuaW50ZXJuYWwgKiAyKSB7XG4gICAgICAgICAgICBpbnNpZ2h0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogYGluc2lnaHQtZXh0ZXJuYWwtZGVwcy0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJkZWNpc2lvblwiLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkhpZ2ggZXh0ZXJuYWwgZGVwZW5kZW5jeSB1c2FnZVwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgQ29kZWJhc2UgcmVsaWVzIGhlYXZpbHkgb24gZXh0ZXJuYWwgZGVwZW5kZW5jaWVzICgke2ltcG9ydFNvdXJjZXMuZXh0ZXJuYWx9IHZzICR7aW1wb3J0U291cmNlcy5pbnRlcm5hbH0gaW50ZXJuYWwpYCxcbiAgICAgICAgICAgICAgICBldmlkZW5jZTogaW1wb3J0cy5zbGljZSgwLCA1KS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5NRURJVU0sXG4gICAgICAgICAgICAgICAgaW1wYWN0OiBcIm1lZGl1bVwiLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zaWdodHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbmFseXplSW1wb3J0U291cmNlcyhpbXBvcnRzOiBFdmlkZW5jZVtdKToge1xuICAgICAgICBpbnRlcm5hbDogbnVtYmVyO1xuICAgICAgICBleHRlcm5hbDogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBsZXQgaW50ZXJuYWwgPSAwO1xuICAgICAgICBsZXQgZXh0ZXJuYWwgPSAwO1xuXG4gICAgICAgIGZvciAoY29uc3QgaW1wIG9mIGltcG9ydHMpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpbXAuY29udGVudC5zdGFydHNXaXRoKFwiLi9cIikgfHxcbiAgICAgICAgICAgICAgICBpbXAuY29udGVudC5zdGFydHNXaXRoKFwiLi4vXCIpIHx8XG4gICAgICAgICAgICAgICAgaW1wLmNvbnRlbnQuc3RhcnRzV2l0aChcIi9cIilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGludGVybmFsKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBpbnRlcm5hbCwgZXh0ZXJuYWwgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGlkZW50aWZ5UmVsYXRpb25zaGlwcyhcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogUHJvbWlzZTxSZWxhdGlvbnNoaXBbXT4ge1xuICAgICAgICBjb25zdCByZWxhdGlvbnNoaXBzOiBSZWxhdGlvbnNoaXBbXSA9IFtdO1xuXG4gICAgICAgIC8vIEZpbmQgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIGluc2lnaHRzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5zaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGluc2lnaHRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5zaWdodDEgPSBpbnNpZ2h0c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnNpZ2h0MiA9IGluc2lnaHRzW2pdO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHNoYXJlZCBldmlkZW5jZVxuICAgICAgICAgICAgICAgIGNvbnN0IHNoYXJlZEV2aWRlbmNlID0gaW5zaWdodDEuZXZpZGVuY2UuZmlsdGVyKChlKSA9PlxuICAgICAgICAgICAgICAgICAgICBpbnNpZ2h0Mi5ldmlkZW5jZS5pbmNsdWRlcyhlKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChzaGFyZWRFdmlkZW5jZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogYHJlbC0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNpbWlsYXJpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogaW5zaWdodDEuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGluc2lnaHQyLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBJbnNpZ2h0cyBzaGFyZSAke3NoYXJlZEV2aWRlbmNlLmxlbmd0aH0gcGllY2VzIG9mIGV2aWRlbmNlYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVuZ3RoOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlZEV2aWRlbmNlLmxlbmd0aCAvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2lnaHQxLmV2aWRlbmNlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zaWdodDIuZXZpZGVuY2UubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBldmlkZW5jZTogc2hhcmVkRXZpZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBjYXRlZ29yeSByZWxhdGlvbnNoaXBzXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBpbnNpZ2h0MS5jYXRlZ29yeSA9PT0gaW5zaWdodDIuY2F0ZWdvcnkgJiZcbiAgICAgICAgICAgICAgICAgICAgaW5zaWdodDEuY2F0ZWdvcnkgIT09IFwicGF0dGVybi1hbmFseXNpc1wiXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogYHJlbC1jYXRlZ29yeS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImVuaGFuY2VtZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGluc2lnaHQxLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBpbnNpZ2h0Mi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgQm90aCBpbnNpZ2h0cyByZWxhdGUgdG8gJHtpbnNpZ2h0MS5jYXRlZ29yeX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZW5ndGg6IDAuNyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uaW5zaWdodDEuZXZpZGVuY2Uuc2xpY2UoMCwgMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uaW5zaWdodDIuZXZpZGVuY2Uuc2xpY2UoMCwgMiksXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVsYXRpb25zaGlwcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZU92ZXJhbGxDb25maWRlbmNlKFxuICAgICAgICBpbnNpZ2h0czogSW5zaWdodFtdLFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICApOiBDb25maWRlbmNlTGV2ZWwge1xuICAgICAgICBpZiAoaW5zaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkxPVztcblxuICAgICAgICBjb25zdCBpbnNpZ2h0Q29uZmlkZW5jZSA9XG4gICAgICAgICAgICBpbnNpZ2h0cy5yZWR1Y2UoKHN1bSwgaW5zaWdodCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZGVuY2VWYWx1ZSA9IHRoaXMuY29uZmlkZW5jZVRvTnVtYmVyKFxuICAgICAgICAgICAgICAgICAgICBpbnNpZ2h0LmNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgY29uZmlkZW5jZVZhbHVlO1xuICAgICAgICAgICAgfSwgMCkgLyBpbnNpZ2h0cy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgZXZpZGVuY2VDb25maWRlbmNlID1cbiAgICAgICAgICAgIGV2aWRlbmNlLnJlZHVjZSgoc3VtLCBldikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZGVuY2VWYWx1ZSA9IHRoaXMuY29uZmlkZW5jZVRvTnVtYmVyKGV2LmNvbmZpZGVuY2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdW0gKyBjb25maWRlbmNlVmFsdWU7XG4gICAgICAgICAgICB9LCAwKSAvIGV2aWRlbmNlLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBvdmVyYWxsQ29uZmlkZW5jZSA9IChpbnNpZ2h0Q29uZmlkZW5jZSArIGV2aWRlbmNlQ29uZmlkZW5jZSkgLyAyO1xuXG4gICAgICAgIGlmIChvdmVyYWxsQ29uZmlkZW5jZSA+PSAwLjgpIHJldHVybiBDb25maWRlbmNlTGV2ZWwuSElHSDtcbiAgICAgICAgaWYgKG92ZXJhbGxDb25maWRlbmNlID49IDAuNikgcmV0dXJuIENvbmZpZGVuY2VMZXZlbC5NRURJVU07XG4gICAgICAgIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTE9XO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uZmlkZW5jZVRvTnVtYmVyKGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbCk6IG51bWJlciB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlkZW5jZSkge1xuICAgICAgICAgICAgY2FzZSBDb25maWRlbmNlTGV2ZWwuSElHSDpcbiAgICAgICAgICAgICAgICByZXR1cm4gMC45O1xuICAgICAgICAgICAgY2FzZSBDb25maWRlbmNlTGV2ZWwuTUVESVVNOlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjY7XG4gICAgICAgICAgICBjYXNlIENvbmZpZGVuY2VMZXZlbC5MT1c6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuMztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuMTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZXNlYXJjaCBBbmFseXplciBBZ2VudFxuICogQW5hbHl6ZXMgZG9jdW1lbnRhdGlvbiBhbmQgcGF0dGVybnMgZm9yIGluc2lnaHRzXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNlYXJjaEFuYWx5emVyIGltcGxlbWVudHMgQW5hbHlzaXNBZ2VudCB7XG4gICAgcHJpdmF0ZSBjb25maWc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogYW55KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIH1cblxuICAgIGFzeW5jIGFuYWx5emUoXG4gICAgICAgIGRpc2NvdmVyeVJlc3VsdHM6IERpc2NvdmVyeVJlc3VsdFtdLFxuICAgICAgICBjb250ZXh0PzogYW55LFxuICAgICk6IFByb21pc2U8QW5hbHlzaXNSZXN1bHQ+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMS4gQ29sbGVjdCBhbGwgZG9jdW1lbnRhdGlvbiBmcm9tIGRpc2NvdmVyeSByZXN1bHRzXG4gICAgICAgICAgICBjb25zdCBhbGxEb2NzID0gdGhpcy5jb2xsZWN0QWxsRG9jdW1lbnRhdGlvbihkaXNjb3ZlcnlSZXN1bHRzKTtcblxuICAgICAgICAgICAgLy8gMi4gRXh0cmFjdCBldmlkZW5jZSBmcm9tIGRvY3VtZW50YXRpb25cbiAgICAgICAgICAgIGNvbnN0IGV2aWRlbmNlID0gYXdhaXQgdGhpcy5leHRyYWN0RG9jdW1lbnRhdGlvbkV2aWRlbmNlKGFsbERvY3MpO1xuXG4gICAgICAgICAgICAvLyAzLiBBbmFseXplIHBhdHRlcm5zXG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuRXZpZGVuY2UgPVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYW5hbHl6ZVBhdHRlcm5zKGRpc2NvdmVyeVJlc3VsdHMpO1xuICAgICAgICAgICAgZXZpZGVuY2UucHVzaCguLi5wYXR0ZXJuRXZpZGVuY2UpO1xuXG4gICAgICAgICAgICAvLyA0LiBHZW5lcmF0ZSBpbnNpZ2h0cyBmcm9tIGRvY3VtZW50YXRpb25cbiAgICAgICAgICAgIGNvbnN0IGluc2lnaHRzID0gYXdhaXQgdGhpcy5nZW5lcmF0ZURvY3VtZW50YXRpb25JbnNpZ2h0cyhcbiAgICAgICAgICAgICAgICBldmlkZW5jZSxcbiAgICAgICAgICAgICAgICBkaXNjb3ZlcnlSZXN1bHRzLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gNS4gSWRlbnRpZnkgcmVsYXRpb25zaGlwc1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb25zaGlwcyA9IGF3YWl0IHRoaXMuaWRlbnRpZnlEb2N1bWVudGF0aW9uUmVsYXRpb25zaGlwcyhcbiAgICAgICAgICAgICAgICBpbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICBldmlkZW5jZSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvblRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogXCJyZXNlYXJjaC1hbmFseXplclwiLFxuICAgICAgICAgICAgICAgIGluc2lnaHRzLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlLFxuICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcHMsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogdGhpcy5jYWxjdWxhdGVPdmVyYWxsQ29uZmlkZW5jZShpbnNpZ2h0cywgZXZpZGVuY2UpLFxuICAgICAgICAgICAgICAgIGV4ZWN1dGlvblRpbWUsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5zaWdodHNHZW5lcmF0ZWQ6IGluc2lnaHRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZXZpZGVuY2VDb2xsZWN0ZWQ6IGV2aWRlbmNlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwc0ZvdW5kOiByZWxhdGlvbnNoaXBzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUmVzZWFyY2ggYW5hbHl6ZXIgZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbGxlY3RBbGxEb2N1bWVudGF0aW9uKFxuICAgICAgICBkaXNjb3ZlcnlSZXN1bHRzOiBEaXNjb3ZlcnlSZXN1bHRbXSxcbiAgICApOiBEb2NSZWZlcmVuY2VbXSB7XG4gICAgICAgIGNvbnN0IGRvY3M6IERvY1JlZmVyZW5jZVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgZGlzY292ZXJ5UmVzdWx0cykge1xuICAgICAgICAgICAgZG9jcy5wdXNoKC4uLnJlc3VsdC5kb2N1bWVudGF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGFuZCBzb3J0IGJ5IHJlbGV2YW5jZVxuICAgICAgICBjb25zdCB1bmlxdWVEb2NzID0gZG9jcy5maWx0ZXIoXG4gICAgICAgICAgICAoZG9jLCBpbmRleCwgc2VsZikgPT5cbiAgICAgICAgICAgICAgICBpbmRleCA9PT0gc2VsZi5maW5kSW5kZXgoKGQpID0+IGQucGF0aCA9PT0gZG9jLnBhdGgpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB1bmlxdWVEb2NzLnNvcnQoKGEsIGIpID0+IGIucmVsZXZhbmNlIC0gYS5yZWxldmFuY2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXh0cmFjdERvY3VtZW50YXRpb25FdmlkZW5jZShcbiAgICAgICAgZG9jczogRG9jUmVmZXJlbmNlW10sXG4gICAgKTogUHJvbWlzZTxFdmlkZW5jZVtdPiB7XG4gICAgICAgIGNvbnN0IGV2aWRlbmNlOiBFdmlkZW5jZVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcy5zbGljZSgwLCAxNSkpIHtcbiAgICAgICAgICAgIC8vIExpbWl0IHRvIHRvcCAxNSBkb2NzXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShkb2MucGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2NFdmlkZW5jZSA9IHRoaXMuYW5hbHl6ZURvY3VtZW50YXRpb25Gb3JFdmlkZW5jZShcbiAgICAgICAgICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZXZpZGVuY2UucHVzaCguLi5kb2NFdmlkZW5jZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmlkZW5jZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFuYWx5emVEb2N1bWVudGF0aW9uRm9yRXZpZGVuY2UoXG4gICAgICAgIGRvYzogRG9jUmVmZXJlbmNlLFxuICAgICAgICBjb250ZW50OiBzdHJpbmcsXG4gICAgKTogRXZpZGVuY2VbXSB7XG4gICAgICAgIGNvbnN0IGV2aWRlbmNlOiBFdmlkZW5jZVtdID0gW107XG4gICAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdChcIlxcblwiKTtcblxuICAgICAgICAvLyBMb29rIGZvciBkb2N1bWVudGF0aW9uIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHBhdHRlcm5zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlZ2V4OiAvIytcXHMrKC4rKS9nLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiaGVhZGluZ1wiLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5ISUdILFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZWdleDogL2BgYFtcXHNcXFNdKj9gYGAvZyxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNvZGUtYmxvY2tcIixcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwuSElHSCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVnZXg6IC9cXFsoW15cXF1dKylcXF1cXCgoW14pXSspXFwpL2csXG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5rXCIsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLk1FRElVTSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVnZXg6IC9gKFteYF0rKWAvZyxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImlubGluZS1jb2RlXCIsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLk1FRElVTSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVnZXg6IC9UT0RPfEZJWE1FfE5PVEV8V0FSTklORy9nLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYXR0ZW50aW9uLW1hcmtlclwiLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5ISUdILFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZWdleDogL1xcKlxcKihbXipdKylcXCpcXCovZyxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImVtcGhhc2lzXCIsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLkxPVyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gcGF0dGVybi5yZWdleC5leGVjKGNvbnRlbnQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgbWF0Y2guaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdChcIlxcblwiKS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBldmlkZW5jZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBldmlkZW5jZS1kb2MtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRvY3VtZW50YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBcInJlc2VhcmNoLWFuYWx5emVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1hdGNoWzBdLFxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBkb2MucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogbGluZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgY29uZmlkZW5jZTogcGF0dGVybi5jb25maWRlbmNlLFxuICAgICAgICAgICAgICAgICAgICByZWxldmFuY2U6IGRvYy5yZWxldmFuY2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXZpZGVuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhbmFseXplUGF0dGVybnMoXG4gICAgICAgIGRpc2NvdmVyeVJlc3VsdHM6IERpc2NvdmVyeVJlc3VsdFtdLFxuICAgICk6IFByb21pc2U8RXZpZGVuY2VbXT4ge1xuICAgICAgICBjb25zdCBldmlkZW5jZTogRXZpZGVuY2VbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGRpc2NvdmVyeVJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiByZXN1bHQucGF0dGVybnMpIHtcbiAgICAgICAgICAgICAgICBldmlkZW5jZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBldmlkZW5jZS1wYXR0ZXJuLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwYXR0ZXJuXCIsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogXCJyZXNlYXJjaC1hbmFseXplclwiLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgUGF0dGVybjogJHtwYXR0ZXJuLnBhdHRlcm59IChmb3VuZCAke3BhdHRlcm4uZnJlcXVlbmN5fSB0aW1lcylgLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBwYXR0ZXJuLmNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgIHJlbGV2YW5jZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm4ubWF0Y2hlcy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXR0ZXJuLm1hdGNoZXMubWFwKChtKSA9PiBtLnJlbGV2YW5jZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAwLjUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXZpZGVuY2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZURvY3VtZW50YXRpb25JbnNpZ2h0cyhcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgICAgIGRpc2NvdmVyeVJlc3VsdHM6IERpc2NvdmVyeVJlc3VsdFtdLFxuICAgICk6IFByb21pc2U8SW5zaWdodFtdPiB7XG4gICAgICAgIGNvbnN0IGluc2lnaHRzOiBJbnNpZ2h0W10gPSBbXTtcblxuICAgICAgICAvLyBHcm91cCBldmlkZW5jZSBieSBmaWxlXG4gICAgICAgIGNvbnN0IGV2aWRlbmNlQnlGaWxlID0gdGhpcy5ncm91cEV2aWRlbmNlQnlGaWxlKGV2aWRlbmNlKTtcblxuICAgICAgICAvLyBBbHdheXMgYWRkIGEgZG9jdW1lbnRhdGlvbiBvdmVydmlldyBpbnNpZ2h0IGZvciBkb2N1bWVudGF0aW9uIHNjb3BlXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhldmlkZW5jZUJ5RmlsZSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaW5zaWdodHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGBpbnNpZ2h0LWRvYy1vdmVydmlldy0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJmaW5kaW5nXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiRG9jdW1lbnRhdGlvbiBhbmFseXNpcyBjb21wbGV0ZWRcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYEFuYWx5emVkICR7T2JqZWN0LmtleXMoZXZpZGVuY2VCeUZpbGUpLmxlbmd0aH0gZG9jdW1lbnRhdGlvbiBmaWxlcyB3aXRoICR7ZXZpZGVuY2UubGVuZ3RofSBldmlkZW5jZSBwb2ludHNgLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBldmlkZW5jZS5zbGljZSgwLCA1KS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5ISUdILFxuICAgICAgICAgICAgICAgIGltcGFjdDogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJkb2N1bWVudGF0aW9uLXF1YWxpdHlcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZG9jdW1lbnRhdGlvbiBpbnNpZ2h0c1xuICAgICAgICBpbnNpZ2h0cy5wdXNoKFxuICAgICAgICAgICAgLi4udGhpcy5nZW5lcmF0ZURvY3VtZW50YXRpb25RdWFsaXR5SW5zaWdodHMoZXZpZGVuY2VCeUZpbGUpLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIHBhdHRlcm4gaW5zaWdodHNcbiAgICAgICAgaW5zaWdodHMucHVzaCguLi50aGlzLmdlbmVyYXRlUGF0dGVybkFuYWx5c2lzSW5zaWdodHMoZXZpZGVuY2UpKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBjb21wbGV0ZW5lc3MgaW5zaWdodHNcbiAgICAgICAgaW5zaWdodHMucHVzaChcbiAgICAgICAgICAgIC4uLnRoaXMuZ2VuZXJhdGVDb21wbGV0ZW5lc3NJbnNpZ2h0cyhldmlkZW5jZSwgZGlzY292ZXJ5UmVzdWx0cyksXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGluc2lnaHRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ3JvdXBFdmlkZW5jZUJ5RmlsZShcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogUmVjb3JkPHN0cmluZywgRXZpZGVuY2VbXT4ge1xuICAgICAgICBjb25zdCBncm91cGVkOiBSZWNvcmQ8c3RyaW5nLCBFdmlkZW5jZVtdPiA9IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBldmlkZW5jZSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0uZmlsZSkge1xuICAgICAgICAgICAgICAgIGlmICghZ3JvdXBlZFtpdGVtLmZpbGVdKSBncm91cGVkW2l0ZW0uZmlsZV0gPSBbXTtcbiAgICAgICAgICAgICAgICBncm91cGVkW2l0ZW0uZmlsZV0ucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBncm91cGVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVEb2N1bWVudGF0aW9uUXVhbGl0eUluc2lnaHRzKFxuICAgICAgICBldmlkZW5jZUJ5RmlsZTogUmVjb3JkPHN0cmluZywgRXZpZGVuY2VbXT4sXG4gICAgKTogSW5zaWdodFtdIHtcbiAgICAgICAgY29uc3QgaW5zaWdodHM6IEluc2lnaHRbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgW2ZpbGUsIGl0ZW1zXSBvZiBPYmplY3QuZW50cmllcyhldmlkZW5jZUJ5RmlsZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRpbmdzID0gaXRlbXMuZmlsdGVyKChlKSA9PiBlLmNvbnRlbnQuaW5jbHVkZXMoXCIjXCIpKTtcbiAgICAgICAgICAgIGNvbnN0IGNvZGVCbG9ja3MgPSBpdGVtcy5maWx0ZXIoKGUpID0+IGUuY29udGVudC5pbmNsdWRlcyhcImBgYFwiKSk7XG4gICAgICAgICAgICBjb25zdCBsaW5rcyA9IGl0ZW1zLmZpbHRlcihcbiAgICAgICAgICAgICAgICAoZSkgPT4gZS5jb250ZW50LmluY2x1ZGVzKFwiW1wiKSAmJiBlLmNvbnRlbnQuaW5jbHVkZXMoXCJdKFwiKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEFzc2VzcyBkb2N1bWVudGF0aW9uIHF1YWxpdHlcbiAgICAgICAgICAgIGlmIChoZWFkaW5ncy5sZW5ndGggPT09IDAgJiYgaXRlbXMubGVuZ3RoID4gNSkge1xuICAgICAgICAgICAgICAgIGluc2lnaHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogYGluc2lnaHQtZG9jLXN0cnVjdHVyZS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZmluZGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYFBvb3IgZG9jdW1lbnRhdGlvbiBzdHJ1Y3R1cmUgaW4gJHtmaWxlfWAsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRG9jdW1lbnQgbGFja3MgcHJvcGVyIGhlYWRpbmdzIGRlc3BpdGUgaGF2aW5nICR7aXRlbXMubGVuZ3RofSBlbGVtZW50c2AsXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBpdGVtcy5zbGljZSgwLCA1KS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwuTUVESVVNLFxuICAgICAgICAgICAgICAgICAgICBpbXBhY3Q6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcImRvY3VtZW50YXRpb24tcXVhbGl0eVwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29kZUJsb2Nrcy5sZW5ndGggPiAwICYmIGhlYWRpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGluc2lnaHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpZDogYGluc2lnaHQtY29kZS1leHBsYW5hdGlvbi0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZmluZGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYENvZGUgd2l0aG91dCBleHBsYW5hdGlvbiBpbiAke2ZpbGV9YCxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBEb2N1bWVudCBjb250YWlucyAke2NvZGVCbG9ja3MubGVuZ3RofSBjb2RlIGJsb2NrcyBidXQgbGFja3MgZXhwbGFuYXRvcnkgaGVhZGluZ3NgLFxuICAgICAgICAgICAgICAgICAgICBldmlkZW5jZTogY29kZUJsb2Nrcy5zbGljZSgwLCAzKS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwuSElHSCxcbiAgICAgICAgICAgICAgICAgICAgaW1wYWN0OiBcIm1lZGl1bVwiLFxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJkb2N1bWVudGF0aW9uLXF1YWxpdHlcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnNpZ2h0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlUGF0dGVybkFuYWx5c2lzSW5zaWdodHMoZXZpZGVuY2U6IEV2aWRlbmNlW10pOiBJbnNpZ2h0W10ge1xuICAgICAgICBjb25zdCBpbnNpZ2h0czogSW5zaWdodFtdID0gW107XG5cbiAgICAgICAgY29uc3QgcGF0dGVybkV2aWRlbmNlID0gZXZpZGVuY2UuZmlsdGVyKChlKSA9PiBlLnR5cGUgPT09IFwicGF0dGVyblwiKTtcbiAgICAgICAgY29uc3QgaGlnaEZyZXF1ZW5jeVBhdHRlcm5zID0gcGF0dGVybkV2aWRlbmNlLmZpbHRlcigoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFlLmNvbnRlbnQuaW5jbHVkZXMoXCJmb3VuZFwiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBlLmNvbnRlbnQubWF0Y2goL2ZvdW5kIChcXGQrKSB0aW1lcy8pO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoID8gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzFdKSA+IDUgOiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGhpZ2hGcmVxdWVuY3lQYXR0ZXJucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpbnNpZ2h0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogYGluc2lnaHQtaGlnaC1mcmVxLXBhdHRlcm5zLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcInBhdHRlcm5cIixcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJIaWdoLWZyZXF1ZW5jeSBwYXR0ZXJucyBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRm91bmQgJHtoaWdoRnJlcXVlbmN5UGF0dGVybnMubGVuZ3RofSBwYXR0ZXJucyB0aGF0IG9jY3VyIG1vcmUgdGhhbiA1IHRpbWVzYCxcbiAgICAgICAgICAgICAgICBldmlkZW5jZTogaGlnaEZyZXF1ZW5jeVBhdHRlcm5zLm1hcCgoZSkgPT4gZS5pZCksXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLkhJR0gsXG4gICAgICAgICAgICAgICAgaW1wYWN0OiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJwYXR0ZXJuLWFuYWx5c2lzXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnNpZ2h0cztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlQ29tcGxldGVuZXNzSW5zaWdodHMoXG4gICAgICAgIGV2aWRlbmNlOiBFdmlkZW5jZVtdLFxuICAgICAgICBkaXNjb3ZlcnlSZXN1bHRzOiBEaXNjb3ZlcnlSZXN1bHRbXSxcbiAgICApOiBJbnNpZ2h0W10ge1xuICAgICAgICBjb25zdCBpbnNpZ2h0czogSW5zaWdodFtdID0gW107XG5cbiAgICAgICAgY29uc3QgZG9jRXZpZGVuY2UgPSBldmlkZW5jZS5maWx0ZXIoKGUpID0+IGUudHlwZSA9PT0gXCJkb2N1bWVudGF0aW9uXCIpO1xuICAgICAgICBjb25zdCBwYXR0ZXJuRXZpZGVuY2UgPSBldmlkZW5jZS5maWx0ZXIoKGUpID0+IGUudHlwZSA9PT0gXCJwYXR0ZXJuXCIpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGRvY3VtZW50YXRpb24gbWF0Y2hlcyBjb2RlIHBhdHRlcm5zXG4gICAgICAgIGlmIChwYXR0ZXJuRXZpZGVuY2UubGVuZ3RoID4gZG9jRXZpZGVuY2UubGVuZ3RoICogMikge1xuICAgICAgICAgICAgaW5zaWdodHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGBpbnNpZ2h0LWRvYy1jb3ZlcmFnZS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJmaW5kaW5nXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiSW5zdWZmaWNpZW50IGRvY3VtZW50YXRpb24gY292ZXJhZ2VcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYEZvdW5kICR7cGF0dGVybkV2aWRlbmNlLmxlbmd0aH0gcGF0dGVybnMgYnV0IG9ubHkgJHtkb2NFdmlkZW5jZS5sZW5ndGh9IGRvY3VtZW50YXRpb24gZWxlbWVudHNgLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICAgICAgICAgIC4uLnBhdHRlcm5FdmlkZW5jZS5zbGljZSgwLCAzKS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgICAgICAuLi5kb2NFdmlkZW5jZS5zbGljZSgwLCAzKS5tYXAoKGUpID0+IGUuaWQpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLk1FRElVTSxcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IFwiaGlnaFwiLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcImRvY3VtZW50YXRpb24tY292ZXJhZ2VcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc2lnaHRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaWRlbnRpZnlEb2N1bWVudGF0aW9uUmVsYXRpb25zaGlwcyhcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogUHJvbWlzZTxSZWxhdGlvbnNoaXBbXT4ge1xuICAgICAgICBjb25zdCByZWxhdGlvbnNoaXBzOiBSZWxhdGlvbnNoaXBbXSA9IFtdO1xuXG4gICAgICAgIC8vIEZpbmQgcmVsYXRpb25zaGlwcyBiYXNlZCBvbiBjYXRlZ29yeVxuICAgICAgICBjb25zdCBpbnNpZ2h0c0J5Q2F0ZWdvcnkgPSB0aGlzLmdyb3VwSW5zaWdodHNCeUNhdGVnb3J5KGluc2lnaHRzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtjYXRlZ29yeSwgY2F0ZWdvcnlJbnNpZ2h0c10gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAgICAgICBpbnNpZ2h0c0J5Q2F0ZWdvcnksXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGlmIChjYXRlZ29yeUluc2lnaHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhdGVnb3J5SW5zaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgY2F0ZWdvcnlJbnNpZ2h0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYHJlbC1kb2MtY2F0ZWdvcnktJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2ltaWxhcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogY2F0ZWdvcnlJbnNpZ2h0c1tpXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGNhdGVnb3J5SW5zaWdodHNbal0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBCb3RoIGluc2lnaHRzIHJlbGF0ZSB0byAke2NhdGVnb3J5fWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZW5ndGg6IDAuOCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmlkZW5jZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5jYXRlZ29yeUluc2lnaHRzW2ldLmV2aWRlbmNlLnNsaWNlKDAsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5jYXRlZ29yeUluc2lnaHRzW2pdLmV2aWRlbmNlLnNsaWNlKDAsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWxhdGlvbnNoaXBzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ3JvdXBJbnNpZ2h0c0J5Q2F0ZWdvcnkoXG4gICAgICAgIGluc2lnaHRzOiBJbnNpZ2h0W10sXG4gICAgKTogUmVjb3JkPHN0cmluZywgSW5zaWdodFtdPiB7XG4gICAgICAgIGNvbnN0IGdyb3VwZWQ6IFJlY29yZDxzdHJpbmcsIEluc2lnaHRbXT4gPSB7fTtcblxuICAgICAgICBmb3IgKGNvbnN0IGluc2lnaHQgb2YgaW5zaWdodHMpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXBlZFtpbnNpZ2h0LmNhdGVnb3J5XSkgZ3JvdXBlZFtpbnNpZ2h0LmNhdGVnb3J5XSA9IFtdO1xuICAgICAgICAgICAgZ3JvdXBlZFtpbnNpZ2h0LmNhdGVnb3J5XS5wdXNoKGluc2lnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwZWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVPdmVyYWxsQ29uZmlkZW5jZShcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogQ29uZmlkZW5jZUxldmVsIHtcbiAgICAgICAgaWYgKGluc2lnaHRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIENvbmZpZGVuY2VMZXZlbC5MT1c7XG5cbiAgICAgICAgY29uc3QgaW5zaWdodENvbmZpZGVuY2UgPVxuICAgICAgICAgICAgaW5zaWdodHMucmVkdWNlKChzdW0sIGluc2lnaHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb25maWRlbmNlVmFsdWUgPSB0aGlzLmNvbmZpZGVuY2VUb051bWJlcihcbiAgICAgICAgICAgICAgICAgICAgaW5zaWdodC5jb25maWRlbmNlLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bSArIGNvbmZpZGVuY2VWYWx1ZTtcbiAgICAgICAgICAgIH0sIDApIC8gaW5zaWdodHMubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGV2aWRlbmNlQ29uZmlkZW5jZSA9XG4gICAgICAgICAgICBldmlkZW5jZS5yZWR1Y2UoKHN1bSwgZXYpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb25maWRlbmNlVmFsdWUgPSB0aGlzLmNvbmZpZGVuY2VUb051bWJlcihldi5jb25maWRlbmNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VtICsgY29uZmlkZW5jZVZhbHVlO1xuICAgICAgICAgICAgfSwgMCkgLyBldmlkZW5jZS5sZW5ndGg7XG5cbiAgICAgICAgY29uc3Qgb3ZlcmFsbENvbmZpZGVuY2UgPSAoaW5zaWdodENvbmZpZGVuY2UgKyBldmlkZW5jZUNvbmZpZGVuY2UpIC8gMjtcblxuICAgICAgICBpZiAob3ZlcmFsbENvbmZpZGVuY2UgPj0gMC44KSByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkhJR0g7XG4gICAgICAgIGlmIChvdmVyYWxsQ29uZmlkZW5jZSA+PSAwLjYpIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTUVESVVNO1xuICAgICAgICByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkxPVztcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbmZpZGVuY2VUb051bWJlcihjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwpOiBudW1iZXIge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZGVuY2UpIHtcbiAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLkhJR0g6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuOTtcbiAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLk1FRElVTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gMC42O1xuICAgICAgICAgICAgY2FzZSBDb25maWRlbmNlTGV2ZWwuTE9XOlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjM7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjE7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQW5hbHlzaXMgSGFuZGxlclxuICogQ29vcmRpbmF0ZXMgc2VxdWVudGlhbCBhbmFseXNpcyB3aXRoIGJvdGggYW5hbHl6ZXJzXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmFseXNpc0hhbmRsZXIge1xuICAgIHByaXZhdGUgY29kZWJhc2VBbmFseXplcjogQ29kZWJhc2VBbmFseXplcjtcbiAgICBwcml2YXRlIHJlc2VhcmNoQW5hbHl6ZXI6IFJlc2VhcmNoQW5hbHl6ZXI7XG4gICAgcHJpdmF0ZSBjb25maWc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogYW55KSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmNvZGViYXNlQW5hbHl6ZXIgPSBuZXcgQ29kZWJhc2VBbmFseXplcihjb25maWcpO1xuICAgICAgICB0aGlzLnJlc2VhcmNoQW5hbHl6ZXIgPSBuZXcgUmVzZWFyY2hBbmFseXplcihjb25maWcpO1xuICAgIH1cblxuICAgIGFzeW5jIGV4ZWN1dGVBbmFseXNpcyhcbiAgICAgICAgZGlzY292ZXJ5UmVzdWx0czogRGlzY292ZXJ5UmVzdWx0W10sXG4gICAgICAgIHF1ZXJ5PzogUmVzZWFyY2hRdWVyeSxcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgY29kZWJhc2VBbmFseXNpczogQW5hbHlzaXNSZXN1bHQ7XG4gICAgICAgIHJlc2VhcmNoQW5hbHlzaXM6IEFuYWx5c2lzUmVzdWx0O1xuICAgICAgICBjb21iaW5lZEluc2lnaHRzOiBJbnNpZ2h0W107XG4gICAgICAgIGNvbWJpbmVkRXZpZGVuY2U6IEV2aWRlbmNlW107XG4gICAgICAgIGNvbWJpbmVkUmVsYXRpb25zaGlwczogUmVsYXRpb25zaGlwW107XG4gICAgfT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBjb2RlYmFzZSBhbmFseXNpcyBmaXJzdFxuICAgICAgICAgICAgY29uc3QgY29kZWJhc2VBbmFseXNpcyA9IGF3YWl0IHRoaXMuY29kZWJhc2VBbmFseXplci5hbmFseXplKFxuICAgICAgICAgICAgICAgIGRpc2NvdmVyeVJlc3VsdHMsXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHJlc2VhcmNoIGFuYWx5c2lzIHdpdGggY29kZWJhc2UgY29udGV4dFxuICAgICAgICAgICAgY29uc3QgcmVzZWFyY2hBbmFseXNpcyA9IGF3YWl0IHRoaXMucmVzZWFyY2hBbmFseXplci5hbmFseXplKFxuICAgICAgICAgICAgICAgIGRpc2NvdmVyeVJlc3VsdHMsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAuLi5xdWVyeSxcbiAgICAgICAgICAgICAgICAgICAgY29kZWJhc2VDb250ZXh0OiBjb2RlYmFzZUFuYWx5c2lzLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBDb21iaW5lIHJlc3VsdHNcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkSW5zaWdodHMgPSBbXG4gICAgICAgICAgICAgICAgLi4uY29kZWJhc2VBbmFseXNpcy5pbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICAuLi5yZXNlYXJjaEFuYWx5c2lzLmluc2lnaHRzLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkRXZpZGVuY2UgPSBbXG4gICAgICAgICAgICAgICAgLi4uY29kZWJhc2VBbmFseXNpcy5ldmlkZW5jZSxcbiAgICAgICAgICAgICAgICAuLi5yZXNlYXJjaEFuYWx5c2lzLmV2aWRlbmNlLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkUmVsYXRpb25zaGlwcyA9IFtcbiAgICAgICAgICAgICAgICAuLi5jb2RlYmFzZUFuYWx5c2lzLnJlbGF0aW9uc2hpcHMsXG4gICAgICAgICAgICAgICAgLi4ucmVzZWFyY2hBbmFseXNpcy5yZWxhdGlvbnNoaXBzLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb2RlYmFzZUFuYWx5c2lzLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoQW5hbHlzaXMsXG4gICAgICAgICAgICAgICAgY29tYmluZWRJbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICBjb21iaW5lZEV2aWRlbmNlLFxuICAgICAgICAgICAgICAgIGNvbWJpbmVkUmVsYXRpb25zaGlwcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEFuYWx5c2lzIGV4ZWN1dGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEFuYWx5c2lzTWV0cmljcyhyZXN1bHRzOiB7XG4gICAgICAgIGNvZGViYXNlQW5hbHlzaXM6IEFuYWx5c2lzUmVzdWx0O1xuICAgICAgICByZXNlYXJjaEFuYWx5c2lzOiBBbmFseXNpc1Jlc3VsdDtcbiAgICAgICAgY29tYmluZWRJbnNpZ2h0czogSW5zaWdodFtdO1xuICAgICAgICBjb21iaW5lZEV2aWRlbmNlOiBFdmlkZW5jZVtdO1xuICAgICAgICBjb21iaW5lZFJlbGF0aW9uc2hpcHM6IFJlbGF0aW9uc2hpcFtdO1xuICAgIH0pOiB7XG4gICAgICAgIHRvdGFsSW5zaWdodHM6IG51bWJlcjtcbiAgICAgICAgdG90YWxFdmlkZW5jZTogbnVtYmVyO1xuICAgICAgICB0b3RhbFJlbGF0aW9uc2hpcHM6IG51bWJlcjtcbiAgICAgICAgYXZlcmFnZUNvbmZpZGVuY2U6IG51bWJlcjtcbiAgICAgICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBjb2RlYmFzZUFuYWx5c2lzLFxuICAgICAgICAgICAgcmVzZWFyY2hBbmFseXNpcyxcbiAgICAgICAgICAgIGNvbWJpbmVkSW5zaWdodHMsXG4gICAgICAgICAgICBjb21iaW5lZEV2aWRlbmNlLFxuICAgICAgICAgICAgY29tYmluZWRSZWxhdGlvbnNoaXBzLFxuICAgICAgICB9ID0gcmVzdWx0cztcblxuICAgICAgICBjb25zdCB0b3RhbEluc2lnaHRzID0gY29tYmluZWRJbnNpZ2h0cy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHRvdGFsRXZpZGVuY2UgPSBjb21iaW5lZEV2aWRlbmNlLmxlbmd0aDtcbiAgICAgICAgY29uc3QgdG90YWxSZWxhdGlvbnNoaXBzID0gY29tYmluZWRSZWxhdGlvbnNoaXBzLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBhdmVyYWdlQ29uZmlkZW5jZSA9IHRoaXMuY2FsY3VsYXRlQXZlcmFnZUNvbmZpZGVuY2UoXG4gICAgICAgICAgICBjb21iaW5lZEluc2lnaHRzLFxuICAgICAgICAgICAgY29tYmluZWRFdmlkZW5jZSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uVGltZSA9XG4gICAgICAgICAgICBjb2RlYmFzZUFuYWx5c2lzLmV4ZWN1dGlvblRpbWUgKyByZXNlYXJjaEFuYWx5c2lzLmV4ZWN1dGlvblRpbWU7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsSW5zaWdodHMsXG4gICAgICAgICAgICB0b3RhbEV2aWRlbmNlLFxuICAgICAgICAgICAgdG90YWxSZWxhdGlvbnNoaXBzLFxuICAgICAgICAgICAgYXZlcmFnZUNvbmZpZGVuY2UsXG4gICAgICAgICAgICBleGVjdXRpb25UaW1lLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlQXZlcmFnZUNvbmZpZGVuY2UoXG4gICAgICAgIGluc2lnaHRzOiBJbnNpZ2h0W10sXG4gICAgICAgIGV2aWRlbmNlOiBFdmlkZW5jZVtdLFxuICAgICk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGluc2lnaHRTY29yZXMgPSBpbnNpZ2h0cy5tYXAoKGkpID0+XG4gICAgICAgICAgICB0aGlzLmNvbmZpZGVuY2VUb051bWJlcihpLmNvbmZpZGVuY2UpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBldmlkZW5jZVNjb3JlcyA9IGV2aWRlbmNlLm1hcCgoZSkgPT5cbiAgICAgICAgICAgIHRoaXMuY29uZmlkZW5jZVRvTnVtYmVyKGUuY29uZmlkZW5jZSksXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgYWxsU2NvcmVzID0gWy4uLmluc2lnaHRTY29yZXMsIC4uLmV2aWRlbmNlU2NvcmVzXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGFsbFNjb3Jlcy5yZWR1Y2UoKHN1bSwgc2NvcmUpID0+IHN1bSArIHNjb3JlLCAwKSAvIGFsbFNjb3Jlcy5sZW5ndGhcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbmZpZGVuY2VUb051bWJlcihjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwpOiBudW1iZXIge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZGVuY2UpIHtcbiAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLkhJR0g6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuOTtcbiAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLk1FRElVTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gMC42O1xuICAgICAgICAgICAgY2FzZSBDb25maWRlbmNlTGV2ZWwuTE9XOlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjM7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjE7XG4gICAgICAgIH1cbiAgICB9XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiO0FBS0E7QUFvQk8sTUFBTSxpQkFBMEM7QUFBQSxFQUMzQztBQUFBLEVBRVIsV0FBVyxDQUFDLFFBQWE7QUFBQSxJQUNyQixLQUFLLFNBQVM7QUFBQTtBQUFBLE9BR1osUUFBTyxDQUNULGtCQUNBLFNBQ3VCO0FBQUEsSUFDdkIsTUFBTSxZQUFZLEtBQUssSUFBSTtBQUFBLElBRTNCLElBQUk7QUFBQSxNQUVBLE1BQU0sV0FBVyxLQUFLLGdCQUFnQixnQkFBZ0I7QUFBQSxNQUd0RCxNQUFNLFdBQVcsTUFBTSxLQUFLLGdCQUFnQixRQUFRO0FBQUEsTUFHcEQsTUFBTSxXQUFXLE1BQU0sS0FBSyxpQkFDeEIsVUFDQSxnQkFD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LE1BQ0E7QUFBQSxRQUNBO0FBQUEsSUFFSixNQUFNLGdCQUFnQixpQkFBaUI7QUFBQSxJQUN2QyxNQUFNLGdCQUFnQixpQkFBaUI7QUFBQSxJQUN2QyxNQUFNLHFCQUFxQixzQkFBc0I7QUFBQSxJQUVqRCxNQUFNLG9CQUFvQixLQUFLLDJCQUMzQixrQkFDQSxnQkFDSjtBQUFBLElBQ0EsTUFBTSxnQkFDRixpQkFBaUIsZ0JBQWdCLGlCQUFpQjtBQUFBLElBRXRELE9BQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBR0ksMEJBQTBCLENBQzlCLFVBQ0EsVUFDTTtBQUFBLElBQ04sTUFBTSxnQkFBZ0IsU0FBUyxJQUFJLENBQUMsTUFDaEMsS0FBSyxtQkFBbUIsRUFBRSxVQUFVLENBQ3hDO0FBQUEsSUFDQSxNQUFNLGlCQUFpQixTQUFTLElBQUksQ0FBQyxNQUNqQyxLQUFLLG1CQUFtQixFQUFFLFVBQVUsQ0FDeEM7QUFBQSxJQUVBLE1BQU0sWUFBWSxDQUFDLEdBQUcsZUFBZSxHQUFHLGNBQWM7QUFBQSxJQUN0RCxPQUNJLFVBQVUsT0FBTyxDQUFDLEtBQUssVUFBVSxNQUFNLE9BQU8sQ0FBQyxJQUFJLFVBQVU7QUFBQTtBQUFBLEVBSTdELGtCQUFrQixDQUFDLFlBQXFDO0FBQUEsSUFDNUQsUUFBUTtBQUFBO0FBQUEsUUFFQSxPQUFPO0FBQUE7QUFBQSxRQUVQLE9BQU87QUFBQTtBQUFBLFFBRVAsT0FBTztBQUFBO0FBQUEsUUFFUCxPQUFPO0FBQUE7QUFBQTtBQUd2QjsiLAogICJkZWJ1Z0lkIjogIkM4RjkyMDFCMkIwOUVBOEM2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
