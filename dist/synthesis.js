// src/research/synthesis.ts
import { writeFile } from "node:fs/promises";
class SynthesisHandlerImpl {
  config;
  constructor(config) {
    this.config = config;
  }
  async synthesize(query, analysisResults) {
    const startTime = Date.now();
    try {
      const allInsights = this.collectAllInsights(analysisResults);
      const allEvidence = this.collectAllEvidence(analysisResults);
      const allRelationships = this.collectAllRelationships(analysisResults);
      const synopsis = this.generateSynopsis(query, allInsights, allEvidence);
      const summary = this.generateSummary(query, allInsights, allEvidence);
      const findings = this.generateDetailedFindings(allInsights, allEvidence);
      const codeReferences = this.generateCodeReferences(allEvidence);
      const architectureInsights = this.generateArchitectureInsights(allInsights, allRelationships);
      const recommendations = this.generateRecommendations(findings, allInsights);
      const risks = this.generateRisks(findings, allInsights);
      const openQuestions = this.generateOpenQuestions(query, allInsights, allEvidence);
      const confidence = this.calculateOverallConfidence(allInsights, allEvidence);
      const executionTime = Date.now() - startTime;
      return {
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        query: query.query,
        synopsis,
        summary,
        findings,
        codeReferences,
        architectureInsights,
        recommendations,
        risks,
        openQuestions,
        confidence,
        agentsUsed: analysisResults.map((result) => result.source),
        executionTime,
        generatedAt: new Date,
        metadata: {
          totalFiles: this.countUniqueFiles(allEvidence),
          totalInsights: allInsights.length,
          totalEvidence: allEvidence.length,
          scope: query.scope,
          depth: query.depth
        }
      };
    } catch (error) {
      throw new Error(`Synthesis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  collectAllInsights(analysisResults) {
    const insights = [];
    for (const result of analysisResults) {
      insights.push(...result.insights);
    }
    const uniqueInsights = insights.filter((insight, index, self) => index === self.findIndex((i) => i.title === insight.title && i.description === insight.description));
    return uniqueInsights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }
  collectAllEvidence(analysisResults) {
    const evidence = [];
    for (const result of analysisResults) {
      evidence.push(...result.evidence);
    }
    const uniqueEvidence = evidence.filter((ev, index, self) => index === self.findIndex((e) => e.content === ev.content && e.file === ev.file));
    return uniqueEvidence.sort((a, b) => b.relevance - a.relevance);
  }
  collectAllRelationships(analysisResults) {
    const relationships = [];
    for (const result of analysisResults) {
      relationships.push(...result.relationships);
    }
    const uniqueRelationships = relationships.filter((rel, index, self) => index === self.findIndex((r) => r.source === rel.source && r.target === rel.target));
    return uniqueRelationships.sort((a, b) => b.strength - a.strength);
  }
  generateSynopsis(query, insights, evidence) {
    const highImpactInsights = insights.filter((i) => i.impact === "high");
    const totalFiles = this.countUniqueFiles(evidence);
    let synopsis = `Research analysis for "${query.query}" `;
    if (query.scope === "codebase" /* CODEBASE */) {
      synopsis += "across the codebase ";
    } else if (query.scope === "documentation" /* DOCUMENTATION */) {
      synopsis += "across documentation ";
    } else {
      synopsis += "across all available sources ";
    }
    synopsis += `revealed ${insights.length} key insights from ${totalFiles} files`;
    if (highImpactInsights.length > 0) {
      synopsis += `, with ${highImpactInsights.length} high-impact findings`;
    }
    synopsis += ". The analysis identified patterns in code structure, documentation quality, and architectural decisions that provide a comprehensive understanding of the current state.";
    return synopsis;
  }
  generateSummary(query, insights, evidence) {
    const summary = [];
    summary.push(`Found ${insights.length} insights across ${evidence.length} evidence points`);
    const insightsByCategory = this.groupInsightsByCategory(insights);
    const categories = Object.keys(insightsByCategory);
    if (categories.length > 0) {
      summary.push(`Key areas identified: ${categories.join(", ")}`);
    }
    const highImpactInsights = insights.filter((i) => i.impact === "high");
    const mediumImpactInsights = insights.filter((i) => i.impact === "medium");
    if (highImpactInsights.length > 0) {
      summary.push(`${highImpactInsights.length} high-impact findings require immediate attention`);
    }
    if (mediumImpactInsights.length > 0) {
      summary.push(`${mediumImpactInsights.length} medium-impact findings should be addressed in the near term`);
    }
    const highConfidenceEvidence = evidence.filter((e) => e.confidence === "high" /* HIGH */);
    if (highConfidenceEvidence.length > 0) {
      summary.push(`${highConfidenceEvidence.length} high-confidence evidence points support the findings`);
    }
    if (query.scope === "codebase" /* CODEBASE */) {
      const codeEvidence = evidence.filter((e) => e.type === "code");
      summary.push(`Analysis focused on ${codeEvidence.length} code elements across the codebase`);
    } else if (query.scope === "documentation" /* DOCUMENTATION */) {
      const docEvidence = evidence.filter((e) => e.type === "documentation");
      summary.push(`Analysis reviewed ${docEvidence.length} documentation elements`);
    }
    return summary;
  }
  generateDetailedFindings(insights, evidence) {
    const findings = [];
    const insightsByCategory = this.groupInsightsByCategory(insights);
    for (const [category, categoryInsights] of Object.entries(insightsByCategory)) {
      const sortedInsights = categoryInsights.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      });
      for (const insight of sortedInsights.slice(0, 5)) {
        findings.push({
          id: `finding-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          category,
          title: insight.title,
          description: insight.description,
          evidence: insight.evidence,
          confidence: insight.confidence,
          impact: insight.impact,
          source: insight.type
        });
      }
    }
    return findings;
  }
  generateCodeReferences(evidence) {
    const codeEvidence = evidence.filter((e) => e.type === "code" && e.file);
    const codeReferences = [];
    const evidenceByFile = this.groupEvidenceByFile(codeEvidence);
    for (const [file, fileEvidence] of Object.entries(evidenceByFile)) {
      if (fileEvidence.length > 0) {
        const lines = fileEvidence.map((e) => e.line).filter(Boolean);
        const minLine = Math.min(...lines);
        const maxLine = Math.max(...lines);
        const categories = [
          ...new Set(fileEvidence.map((e) => e.type))
        ];
        const category = categories[0] || "general";
        codeReferences.push({
          path: file,
          lines: lines.length === 1 ? String(lines[0]) : [minLine, maxLine],
          description: this.generateCodeDescription(fileEvidence),
          relevance: Math.max(...fileEvidence.map((e) => e.relevance)),
          category
        });
      }
    }
    return codeReferences.sort((a, b) => b.relevance - a.relevance);
  }
  generateCodeDescription(evidence) {
    const types = [...new Set(evidence.map((e) => e.type))];
    const count = evidence.length;
    if (types.includes("class-definition")) {
      return `Contains ${count} class definitions and related code elements`;
    }
    if (types.includes("function-definition")) {
      return `Contains ${count} function definitions and implementations`;
    }
    if (types.includes("import-statement")) {
      return `Contains ${count} import statements showing dependencies`;
    }
    if (types.includes("technical-debt")) {
      return `Contains ${count} technical debt markers requiring attention`;
    }
    return `Contains ${count} significant code elements`;
  }
  generateArchitectureInsights(insights, relationships) {
    const architectureInsights = [];
    const archInsights = insights.filter((i) => i.category === "architecture" || i.category === "pattern-analysis" || i.title.toLowerCase().includes("architecture") || i.title.toLowerCase().includes("pattern"));
    for (const insight of archInsights.slice(0, 8)) {
      const relatedEvidence = insight.evidence.slice(0, 5);
      const components = this.extractComponentsFromInsight(insight);
      architectureInsights.push({
        id: `arch-insight-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: this.mapInsightTypeToArchType(insight.type),
        title: insight.title,
        description: insight.description,
        components,
        impact: insight.impact,
        evidence: relatedEvidence
      });
    }
    const strongRelationships = relationships.filter((r) => r.strength > 0.7);
    if (strongRelationships.length > 0) {
      architectureInsights.push({
        id: `arch-relationships-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "pattern",
        title: "Strong architectural relationships detected",
        description: `Found ${strongRelationships.length} strong relationships between components, indicating well-structured architecture`,
        components: this.extractComponentsFromRelationships(strongRelationships),
        impact: "medium",
        evidence: strongRelationships.slice(0, 3).flatMap((r) => r.evidence)
      });
    }
    return architectureInsights;
  }
  mapInsightTypeToArchType(insightType) {
    switch (insightType) {
      case "pattern":
        return "pattern";
      case "decision":
        return "decision";
      case "finding":
        return "concern";
      case "relationship":
        return "pattern";
      default:
        return "concern";
    }
  }
  extractComponentsFromInsight(insight) {
    const components = [];
    if (insight.description.includes("class")) {
      components.push("Classes");
    }
    if (insight.description.includes("function")) {
      components.push("Functions");
    }
    if (insight.description.includes("module")) {
      components.push("Modules");
    }
    if (insight.description.includes("service")) {
      components.push("Services");
    }
    return components.length > 0 ? components : ["General Components"];
  }
  extractComponentsFromRelationships(relationships) {
    const components = [];
    for (const rel of relationships) {
      components.push(rel.source, rel.target);
    }
    return [...new Set(components)];
  }
  generateRecommendations(findings, insights) {
    const recommendations = [];
    const highImpactFindings = findings.filter((f) => f.impact === "high");
    const mediumImpactFindings = findings.filter((f) => f.impact === "medium");
    for (const finding of highImpactFindings.slice(0, 5)) {
      recommendations.push({
        id: `rec-immediate-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "immediate",
        priority: "critical",
        title: `Address: ${finding.title}`,
        description: `Immediate action required to resolve ${finding.title}`,
        rationale: `This high-impact finding in ${finding.category} requires immediate attention to prevent potential issues`,
        effort: this.estimateEffort(finding),
        impact: finding.impact,
        dependencies: []
      });
    }
    for (const finding of mediumImpactFindings.slice(0, 3)) {
      recommendations.push({
        id: `rec-short-term-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "short-term",
        priority: "medium",
        title: `Improve: ${finding.title}`,
        description: `Plan improvements for ${finding.title} in the next development cycle`,
        rationale: "This medium-impact finding should be addressed to improve overall quality",
        effort: this.estimateEffort(finding),
        impact: finding.impact,
        dependencies: []
      });
    }
    const archInsights = insights.filter((i) => i.category === "architecture");
    if (archInsights.length > 0) {
      recommendations.push({
        id: `rec-arch-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "long-term",
        priority: "medium",
        title: "Architectural improvements",
        description: "Consider implementing architectural improvements based on identified patterns",
        rationale: "Analysis revealed architectural patterns that could be optimized for better maintainability",
        effort: "high",
        impact: "high",
        dependencies: []
      });
    }
    return recommendations;
  }
  estimateEffort(finding) {
    if (finding.category === "technical-debt")
      return "medium";
    if (finding.category === "complexity-analysis")
      return "high";
    if (finding.category === "documentation-quality")
      return "low";
    if (finding.impact === "high")
      return "medium";
    return "low";
  }
  generateRisks(findings, insights) {
    const risks = [];
    const highImpactFindings = findings.filter((f) => f.impact === "high");
    for (const finding of highImpactFindings.slice(0, 3)) {
      const riskType = this.mapCategoryToRiskType(finding.category);
      risks.push({
        id: `risk-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: riskType,
        severity: finding.impact === "high" ? "critical" : "high",
        title: `Risk: ${finding.title}`,
        description: `${finding.description} This poses a risk to system stability and maintainability`,
        probability: this.assessRiskProbability(finding),
        impact: finding.impact,
        mitigation: this.generateMitigation(finding),
        evidence: finding.evidence
      });
    }
    const debtFindings = findings.filter((f) => f.category === "technical-debt");
    if (debtFindings.length > 2) {
      risks.push({
        id: `risk-debt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "maintainability",
        severity: "high",
        title: "Accumulated technical debt",
        description: `Found ${debtFindings.length} technical debt items that could impact future development`,
        probability: "medium",
        impact: "high",
        mitigation: "Implement regular refactoring sprints and address technical debt items systematically",
        evidence: debtFindings.slice(0, 3).map((f) => f.id)
      });
    }
    return risks;
  }
  mapCategoryToRiskType(category) {
    switch (category) {
      case "complexity-analysis":
        return "maintainability";
      case "technical-debt":
        return "technical";
      case "architecture":
        return "architectural";
      case "pattern-analysis":
        return "architectural";
      case "documentation-quality":
        return "maintainability";
      default:
        return "technical";
    }
  }
  assessRiskProbability(finding) {
    if (finding.confidence === "high" /* HIGH */)
      return "high";
    if (finding.confidence === "medium" /* MEDIUM */)
      return "medium";
    return "low";
  }
  generateMitigation(finding) {
    switch (finding.category) {
      case "complexity-analysis":
        return "Refactor complex components into smaller, more manageable pieces";
      case "technical-debt":
        return "Address technical debt items through planned refactoring efforts";
      case "documentation-quality":
        return "Improve documentation structure and add comprehensive explanations";
      case "architecture":
        return "Review and improve architectural patterns and decisions";
      default:
        return "Investigate the finding and implement appropriate corrective actions";
    }
  }
  generateOpenQuestions(query, insights, evidence) {
    const questions = [];
    if (insights.length === 0) {
      questions.push("Why were no significant insights found? Is the query too broad or the scope too limited?");
    }
    if (evidence.length < 10) {
      questions.push("Is there additional evidence that could be collected to support more comprehensive analysis?");
    }
    const categories = Object.keys(this.groupInsightsByCategory(insights));
    if (!categories.includes("architecture")) {
      questions.push("What architectural patterns and decisions should be further investigated?");
    }
    if (!categories.includes("performance")) {
      questions.push("Are there performance considerations that should be analyzed?");
    }
    if (query.scope === "codebase" /* CODEBASE */) {
      questions.push("How does the codebase structure align with industry best practices and standards?");
    } else if (query.scope === "documentation" /* DOCUMENTATION */) {
      questions.push("How can the documentation be improved to better support development and maintenance?");
    }
    questions.push("What steps should be taken to address the identified findings and risks?");
    questions.push("How can the research process be improved for future analyses?");
    return questions.slice(0, 5);
  }
  calculateOverallConfidence(insights, evidence) {
    if (insights.length === 0 && evidence.length === 0)
      return "low" /* LOW */;
    const insightScores = insights.map((i) => this.confidenceToNumber(i.confidence));
    const evidenceScores = evidence.map((e) => this.confidenceToNumber(e.confidence));
    const allScores = [...insightScores, ...evidenceScores];
    if (allScores.length === 0)
      return "low" /* LOW */;
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    if (averageScore >= 0.8)
      return "high" /* HIGH */;
    if (averageScore >= 0.6)
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
  groupInsightsByCategory(insights) {
    const grouped = {};
    for (const insight of insights) {
      if (!grouped[insight.category])
        grouped[insight.category] = [];
      grouped[insight.category].push(insight);
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
  countUniqueFiles(evidence) {
    const files = new Set(evidence.filter((e) => e.file).map((e) => e.file));
    return files.size;
  }
  async exportReport(report, options) {
    const outputPath = options.outputPath || `research-report-${Date.now()}.${options.format}`;
    switch (options.format) {
      case "markdown" /* MARKDOWN */:
        return this.exportToMarkdown(report, outputPath, options);
      case "json" /* JSON */:
        return this.exportToJSON(report, outputPath, options);
      case "html" /* HTML */:
        return this.exportToHTML(report, outputPath, options);
      case "pdf" /* PDF */:
        throw new Error("PDF export not yet implemented");
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
  async exportToMarkdown(report, outputPath, options) {
    const content = this.generateMarkdownContent(report, options);
    try {
      await writeFile(outputPath, content, "utf-8");
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to export markdown report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  generateMarkdownContent(report, options) {
    let content = "";
    content += `---
`;
    content += `id: ${report.id}
`;
    content += `query: "${report.query}"
`;
    content += `generated: ${report.generatedAt.toISOString()}
`;
    content += `confidence: ${report.confidence}
`;
    content += `scope: ${report.metadata.scope}
`;
    content += `depth: ${report.metadata.depth}
`;
    content += `agents: [${report.agentsUsed.join(", ")}]
`;
    content += `executionTime: ${report.executionTime}ms
`;
    content += `---

`;
    content += `# Research Report: ${report.query}

`;
    content += `## Synopsis

${report.synopsis}

`;
    content += `## Summary

`;
    for (const point of report.summary) {
      content += `- ${point}
`;
    }
    content += `
`;
    if (options.includeEvidence && report.findings.length > 0) {
      content += `## Key Findings

`;
      for (const finding of report.findings) {
        content += `### ${finding.title}

`;
        content += `**Category:** ${finding.category}  
`;
        content += `**Impact:** ${finding.impact}  
`;
        content += `**Confidence:** ${finding.confidence}

`;
        content += `${finding.description}

`;
      }
    }
    if (options.includeCodeReferences && report.codeReferences.length > 0) {
      content += `## Code References

`;
      for (const ref of report.codeReferences.slice(0, 10)) {
        content += `### ${ref.path}

`;
        content += `**Lines:** ${typeof ref.lines === "number" ? ref.lines : `${ref.lines[0]}-${ref.lines[1]}`}  
`;
        content += `**Category:** ${ref.category}  
`;
        content += `**Relevance:** ${ref.relevance.toFixed(2)}

`;
        content += `${ref.description}

`;
      }
    }
    if (report.architectureInsights.length > 0) {
      content += `## Architecture Insights

`;
      for (const insight of report.architectureInsights) {
        content += `### ${insight.title}

`;
        content += `**Type:** ${insight.type}  
`;
        content += `**Impact:** ${insight.impact}

`;
        content += `${insight.description}

`;
      }
    }
    if (report.recommendations.length > 0) {
      content += `## Recommendations

`;
      for (const rec of report.recommendations) {
        content += `### ${rec.title}

`;
        content += `**Type:** ${rec.type}  
`;
        content += `**Priority:** ${rec.priority}  
`;
        content += `**Effort:** ${rec.effort}  
`;
        content += `**Impact:** ${rec.impact}

`;
        content += `${rec.description}

`;
        content += `**Rationale:** ${rec.rationale}

`;
      }
    }
    if (report.risks.length > 0) {
      content += `## Risks

`;
      for (const risk of report.risks) {
        content += `### ${risk.title}

`;
        content += `**Type:** ${risk.type}  
`;
        content += `**Severity:** ${risk.severity}  
`;
        content += `**Probability:** ${risk.probability}

`;
        content += `${risk.description}

`;
        if (risk.mitigation) {
          content += `**Mitigation:** ${risk.mitigation}

`;
        }
      }
    }
    if (report.openQuestions.length > 0) {
      content += `## Open Questions

`;
      for (const question of report.openQuestions) {
        content += `- ${question}
`;
      }
      content += `
`;
    }
    if (options.includeMetadata) {
      content += `## Metadata

`;
      content += `- **Total Files:** ${report.metadata.totalFiles}
`;
      content += `- **Total Insights:** ${report.metadata.totalInsights}
`;
      content += `- **Total Evidence:** ${report.metadata.totalEvidence}
`;
      content += `- **Execution Time:** ${report.executionTime}ms
`;
      content += `- **Agents Used:** ${report.agentsUsed.join(", ")}
`;
    }
    return content;
  }
  async exportToJSON(report, outputPath, options) {
    const jsonContent = JSON.stringify(report, null, 2);
    try {
      await writeFile(outputPath, jsonContent, "utf-8");
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to export JSON report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async exportToHTML(report, outputPath, options) {
    const htmlContent = this.generateHTMLContent(report, options);
    try {
      await writeFile(outputPath, htmlContent, "utf-8");
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to export HTML report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  generateHTMLContent(report, options) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Report: ${this.escapeHtml(report.query)}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .finding, .recommendation, .risk { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .high-impact { border-left: 5px solid #d32f2f; }
        .medium-impact { border-left: 5px solid #f57c00; }
        .low-impact { border-left: 5px solid #388e3c; }
        .metadata { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Research Report: ${this.escapeHtml(report.query)}</h1>
        <p><strong>Generated:</strong> ${report.generatedAt.toLocaleString()}</p>
        <p><strong>Confidence:</strong> ${report.confidence}</p>
        <p><strong>Synopsis:</strong> ${this.escapeHtml(report.synopsis)}</p>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        <ul>
            ${report.summary.map((point) => `<li>${this.escapeHtml(point)}</li>`).join("")}
        </ul>
    </div>
    
    ${options.includeEvidence && report.findings.length > 0 ? `
    <div class="section">
        <h2>Key Findings</h2>
        ${report.findings.map((finding) => `
            <div class="finding ${finding.impact}-impact">
                <h3>${this.escapeHtml(finding.title)}</h3>
                <p><strong>Category:</strong> ${this.escapeHtml(finding.category)} | 
                   <strong>Impact:</strong> ${finding.impact} | 
                   <strong>Confidence:</strong> ${finding.confidence}</p>
                <p>${this.escapeHtml(finding.description)}</p>
            </div>
        `).join("")}
    </div>
    ` : ""}
    
    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h2>Recommendations</h2>
        ${report.recommendations.map((rec) => `
            <div class="recommendation">
                <h3>${this.escapeHtml(rec.title)}</h3>
                <p><strong>Type:</strong> ${rec.type} | 
                   <strong>Priority:</strong> ${rec.priority} | 
                   <strong>Effort:</strong> ${rec.effort}</p>
                <p>${this.escapeHtml(rec.description)}</p>
                <p><strong>Rationale:</strong> ${this.escapeHtml(rec.rationale)}</p>
            </div>
        `).join("")}
    </div>
    ` : ""}
    
    ${report.risks.length > 0 ? `
    <div class="section">
        <h2>Risks</h2>
        ${report.risks.map((risk) => `
            <div class="risk">
                <h3>${this.escapeHtml(risk.title)}</h3>
                <p><strong>Type:</strong> ${risk.type} | 
                   <strong>Severity:</strong> ${risk.severity} | 
                   <strong>Probability:</strong> ${risk.probability}</p>
                <p>${this.escapeHtml(risk.description)}</p>
                ${risk.mitigation ? `<p><strong>Mitigation:</strong> ${this.escapeHtml(risk.mitigation)}</p>` : ""}
            </div>
        `).join("")}
    </div>
    ` : ""}
    
    ${options.includeMetadata ? `
    <div class="section">
        <h2>Metadata</h2>
        <div class="metadata">
            <p><strong>Total Files:</strong> ${report.metadata.totalFiles}</p>
            <p><strong>Total Insights:</strong> ${report.metadata.totalInsights}</p>
            <p><strong>Total Evidence:</strong> ${report.metadata.totalEvidence}</p>
            <p><strong>Execution Time:</strong> ${report.executionTime}ms</p>
            <p><strong>Agents Used:</strong> ${report.agentsUsed.join(", ")}</p>
        </div>
    </div>
    ` : ""}
</body>
</html>
    `;
  }
}
export {
  SynthesisHandlerImpl
};

//# debugId=35F9692A4C67454A64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3Jlc2VhcmNoL3N5bnRoZXNpcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKipcbiAqIFN5bnRoZXNpcyBwaGFzZSBoYW5kbGVycyBmb3IgcmVzZWFyY2ggb3JjaGVzdHJhdGlvbi5cbiAqIEdlbmVyYXRlcyBjb21wcmVoZW5zaXZlIHJlc2VhcmNoIHJlcG9ydHMgd2l0aCBhbmFseXNpcyByZXN1bHRzLlxuICovXG5cbmltcG9ydCB7IHdyaXRlRmlsZSB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFuYWx5c2lzUmVzdWx0LFxuICAgIHR5cGUgQXJjaGl0ZWN0dXJlSW5zaWdodCxcbiAgICB0eXBlIENvZGVSZWZlcmVuY2UsXG4gICAgQ29uZmlkZW5jZUxldmVsLFxuICAgIHR5cGUgRGV0YWlsZWRGaW5kaW5nLFxuICAgIHR5cGUgRXZpZGVuY2UsXG4gICAgdHlwZSBJbnNpZ2h0LFxuICAgIHR5cGUgUmVjb21tZW5kYXRpb24sXG4gICAgdHlwZSBSZWxhdGlvbnNoaXAsXG4gICAgUmVzZWFyY2hEZXB0aCxcbiAgICBSZXNlYXJjaEV4cG9ydEZvcm1hdCxcbiAgICB0eXBlIFJlc2VhcmNoRXhwb3J0T3B0aW9ucyxcbiAgICB0eXBlIFJlc2VhcmNoUXVlcnksXG4gICAgUmVzZWFyY2hTY29wZSxcbiAgICB0eXBlIFJpc2ssXG4gICAgdHlwZSBTeW50aGVzaXNIYW5kbGVyLFxuICAgIHR5cGUgU3ludGhlc2lzUmVwb3J0LFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIFN5bnRoZXNpcyBIYW5kbGVyXG4gKiBHZW5lcmF0ZXMgY29tcHJlaGVuc2l2ZSByZXNlYXJjaCByZXBvcnRzIGZyb20gYW5hbHlzaXMgcmVzdWx0c1xuICovXG5leHBvcnQgY2xhc3MgU3ludGhlc2lzSGFuZGxlckltcGwgaW1wbGVtZW50cyBTeW50aGVzaXNIYW5kbGVyIHtcbiAgICBwcml2YXRlIGNvbmZpZzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBhbnkpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgfVxuXG4gICAgYXN5bmMgc3ludGhlc2l6ZShcbiAgICAgICAgcXVlcnk6IFJlc2VhcmNoUXVlcnksXG4gICAgICAgIGFuYWx5c2lzUmVzdWx0czogQW5hbHlzaXNSZXN1bHRbXSxcbiAgICApOiBQcm9taXNlPFN5bnRoZXNpc1JlcG9ydD4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyAxLiBDb2xsZWN0IGFsbCBhbmFseXNpcyBkYXRhXG4gICAgICAgICAgICBjb25zdCBhbGxJbnNpZ2h0cyA9IHRoaXMuY29sbGVjdEFsbEluc2lnaHRzKGFuYWx5c2lzUmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBhbGxFdmlkZW5jZSA9IHRoaXMuY29sbGVjdEFsbEV2aWRlbmNlKGFuYWx5c2lzUmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBhbGxSZWxhdGlvbnNoaXBzID1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxlY3RBbGxSZWxhdGlvbnNoaXBzKGFuYWx5c2lzUmVzdWx0cyk7XG5cbiAgICAgICAgICAgIC8vIDIuIEdlbmVyYXRlIHN5bm9wc2lzXG4gICAgICAgICAgICBjb25zdCBzeW5vcHNpcyA9IHRoaXMuZ2VuZXJhdGVTeW5vcHNpcyhcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBhbGxJbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICBhbGxFdmlkZW5jZSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIDMuIEdlbmVyYXRlIHN1bW1hcnlcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmdlbmVyYXRlU3VtbWFyeShcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBhbGxJbnNpZ2h0cyxcbiAgICAgICAgICAgICAgICBhbGxFdmlkZW5jZSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIDQuIEdlbmVyYXRlIGRldGFpbGVkIGZpbmRpbmdzXG4gICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IHRoaXMuZ2VuZXJhdGVEZXRhaWxlZEZpbmRpbmdzKFxuICAgICAgICAgICAgICAgIGFsbEluc2lnaHRzLFxuICAgICAgICAgICAgICAgIGFsbEV2aWRlbmNlLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gNS4gR2VuZXJhdGUgY29kZSByZWZlcmVuY2VzXG4gICAgICAgICAgICBjb25zdCBjb2RlUmVmZXJlbmNlcyA9IHRoaXMuZ2VuZXJhdGVDb2RlUmVmZXJlbmNlcyhhbGxFdmlkZW5jZSk7XG5cbiAgICAgICAgICAgIC8vIDYuIEdlbmVyYXRlIGFyY2hpdGVjdHVyZSBpbnNpZ2h0c1xuICAgICAgICAgICAgY29uc3QgYXJjaGl0ZWN0dXJlSW5zaWdodHMgPSB0aGlzLmdlbmVyYXRlQXJjaGl0ZWN0dXJlSW5zaWdodHMoXG4gICAgICAgICAgICAgICAgYWxsSW5zaWdodHMsXG4gICAgICAgICAgICAgICAgYWxsUmVsYXRpb25zaGlwcyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIDcuIEdlbmVyYXRlIHJlY29tbWVuZGF0aW9uc1xuICAgICAgICAgICAgY29uc3QgcmVjb21tZW5kYXRpb25zID0gdGhpcy5nZW5lcmF0ZVJlY29tbWVuZGF0aW9ucyhcbiAgICAgICAgICAgICAgICBmaW5kaW5ncyxcbiAgICAgICAgICAgICAgICBhbGxJbnNpZ2h0cyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIDguIEdlbmVyYXRlIHJpc2tzXG4gICAgICAgICAgICBjb25zdCByaXNrcyA9IHRoaXMuZ2VuZXJhdGVSaXNrcyhmaW5kaW5ncywgYWxsSW5zaWdodHMpO1xuXG4gICAgICAgICAgICAvLyA5LiBHZW5lcmF0ZSBvcGVuIHF1ZXN0aW9uc1xuICAgICAgICAgICAgY29uc3Qgb3BlblF1ZXN0aW9ucyA9IHRoaXMuZ2VuZXJhdGVPcGVuUXVlc3Rpb25zKFxuICAgICAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgICAgIGFsbEluc2lnaHRzLFxuICAgICAgICAgICAgICAgIGFsbEV2aWRlbmNlLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gMTAuIENhbGN1bGF0ZSBvdmVyYWxsIGNvbmZpZGVuY2VcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZGVuY2UgPSB0aGlzLmNhbGN1bGF0ZU92ZXJhbGxDb25maWRlbmNlKFxuICAgICAgICAgICAgICAgIGFsbEluc2lnaHRzLFxuICAgICAgICAgICAgICAgIGFsbEV2aWRlbmNlLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGByZXBvcnQtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeS5xdWVyeSxcbiAgICAgICAgICAgICAgICBzeW5vcHNpcyxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgICAgIGZpbmRpbmdzLFxuICAgICAgICAgICAgICAgIGNvZGVSZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgIGFyY2hpdGVjdHVyZUluc2lnaHRzLFxuICAgICAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucyxcbiAgICAgICAgICAgICAgICByaXNrcyxcbiAgICAgICAgICAgICAgICBvcGVuUXVlc3Rpb25zLFxuICAgICAgICAgICAgICAgIGNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgYWdlbnRzVXNlZDogYW5hbHlzaXNSZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHQuc291cmNlKSxcbiAgICAgICAgICAgICAgICBleGVjdXRpb25UaW1lLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsRmlsZXM6IHRoaXMuY291bnRVbmlxdWVGaWxlcyhhbGxFdmlkZW5jZSksXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSW5zaWdodHM6IGFsbEluc2lnaHRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxFdmlkZW5jZTogYWxsRXZpZGVuY2UubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBzY29wZTogcXVlcnkuc2NvcGUsXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiBxdWVyeS5kZXB0aCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgU3ludGhlc2lzIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb2xsZWN0QWxsSW5zaWdodHMoYW5hbHlzaXNSZXN1bHRzOiBBbmFseXNpc1Jlc3VsdFtdKTogSW5zaWdodFtdIHtcbiAgICAgICAgY29uc3QgaW5zaWdodHM6IEluc2lnaHRbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIGFuYWx5c2lzUmVzdWx0cykge1xuICAgICAgICAgICAgaW5zaWdodHMucHVzaCguLi5yZXN1bHQuaW5zaWdodHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgYW5kIHNvcnQgYnkgaW1wYWN0XG4gICAgICAgIGNvbnN0IHVuaXF1ZUluc2lnaHRzID0gaW5zaWdodHMuZmlsdGVyKFxuICAgICAgICAgICAgKGluc2lnaHQsIGluZGV4LCBzZWxmKSA9PlxuICAgICAgICAgICAgICAgIGluZGV4ID09PVxuICAgICAgICAgICAgICAgIHNlbGYuZmluZEluZGV4KFxuICAgICAgICAgICAgICAgICAgICAoaSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGkudGl0bGUgPT09IGluc2lnaHQudGl0bGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGkuZGVzY3JpcHRpb24gPT09IGluc2lnaHQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdW5pcXVlSW5zaWdodHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1wYWN0T3JkZXIgPSB7IGhpZ2g6IDMsIG1lZGl1bTogMiwgbG93OiAxIH07XG4gICAgICAgICAgICByZXR1cm4gaW1wYWN0T3JkZXJbYi5pbXBhY3RdIC0gaW1wYWN0T3JkZXJbYS5pbXBhY3RdO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbGxlY3RBbGxFdmlkZW5jZShhbmFseXNpc1Jlc3VsdHM6IEFuYWx5c2lzUmVzdWx0W10pOiBFdmlkZW5jZVtdIHtcbiAgICAgICAgY29uc3QgZXZpZGVuY2U6IEV2aWRlbmNlW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiBhbmFseXNpc1Jlc3VsdHMpIHtcbiAgICAgICAgICAgIGV2aWRlbmNlLnB1c2goLi4ucmVzdWx0LmV2aWRlbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGFuZCBzb3J0IGJ5IHJlbGV2YW5jZVxuICAgICAgICBjb25zdCB1bmlxdWVFdmlkZW5jZSA9IGV2aWRlbmNlLmZpbHRlcihcbiAgICAgICAgICAgIChldiwgaW5kZXgsIHNlbGYpID0+XG4gICAgICAgICAgICAgICAgaW5kZXggPT09XG4gICAgICAgICAgICAgICAgc2VsZi5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiBlLmNvbnRlbnQgPT09IGV2LmNvbnRlbnQgJiYgZS5maWxlID09PSBldi5maWxlLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHVuaXF1ZUV2aWRlbmNlLnNvcnQoKGEsIGIpID0+IGIucmVsZXZhbmNlIC0gYS5yZWxldmFuY2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdEFsbFJlbGF0aW9uc2hpcHMoXG4gICAgICAgIGFuYWx5c2lzUmVzdWx0czogQW5hbHlzaXNSZXN1bHRbXSxcbiAgICApOiBSZWxhdGlvbnNoaXBbXSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcHM6IFJlbGF0aW9uc2hpcFtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgYW5hbHlzaXNSZXN1bHRzKSB7XG4gICAgICAgICAgICByZWxhdGlvbnNoaXBzLnB1c2goLi4ucmVzdWx0LnJlbGF0aW9uc2hpcHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgYW5kIHNvcnQgYnkgc3RyZW5ndGhcbiAgICAgICAgY29uc3QgdW5pcXVlUmVsYXRpb25zaGlwcyA9IHJlbGF0aW9uc2hpcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHJlbCwgaW5kZXgsIHNlbGYpID0+XG4gICAgICAgICAgICAgICAgaW5kZXggPT09XG4gICAgICAgICAgICAgICAgc2VsZi5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgIChyKSA9PiByLnNvdXJjZSA9PT0gcmVsLnNvdXJjZSAmJiByLnRhcmdldCA9PT0gcmVsLnRhcmdldCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB1bmlxdWVSZWxhdGlvbnNoaXBzLnNvcnQoKGEsIGIpID0+IGIuc3RyZW5ndGggLSBhLnN0cmVuZ3RoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlU3lub3BzaXMoXG4gICAgICAgIHF1ZXJ5OiBSZXNlYXJjaFF1ZXJ5LFxuICAgICAgICBpbnNpZ2h0czogSW5zaWdodFtdLFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBoaWdoSW1wYWN0SW5zaWdodHMgPSBpbnNpZ2h0cy5maWx0ZXIoKGkpID0+IGkuaW1wYWN0ID09PSBcImhpZ2hcIik7XG4gICAgICAgIGNvbnN0IHRvdGFsRmlsZXMgPSB0aGlzLmNvdW50VW5pcXVlRmlsZXMoZXZpZGVuY2UpO1xuXG4gICAgICAgIGxldCBzeW5vcHNpcyA9IGBSZXNlYXJjaCBhbmFseXNpcyBmb3IgXCIke3F1ZXJ5LnF1ZXJ5fVwiIGA7XG5cbiAgICAgICAgaWYgKHF1ZXJ5LnNjb3BlID09PSBSZXNlYXJjaFNjb3BlLkNPREVCQVNFKSB7XG4gICAgICAgICAgICBzeW5vcHNpcyArPSBcImFjcm9zcyB0aGUgY29kZWJhc2UgXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocXVlcnkuc2NvcGUgPT09IFJlc2VhcmNoU2NvcGUuRE9DVU1FTlRBVElPTikge1xuICAgICAgICAgICAgc3lub3BzaXMgKz0gXCJhY3Jvc3MgZG9jdW1lbnRhdGlvbiBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN5bm9wc2lzICs9IFwiYWNyb3NzIGFsbCBhdmFpbGFibGUgc291cmNlcyBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bm9wc2lzICs9IGByZXZlYWxlZCAke2luc2lnaHRzLmxlbmd0aH0ga2V5IGluc2lnaHRzIGZyb20gJHt0b3RhbEZpbGVzfSBmaWxlc2A7XG5cbiAgICAgICAgaWYgKGhpZ2hJbXBhY3RJbnNpZ2h0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzeW5vcHNpcyArPSBgLCB3aXRoICR7aGlnaEltcGFjdEluc2lnaHRzLmxlbmd0aH0gaGlnaC1pbXBhY3QgZmluZGluZ3NgO1xuICAgICAgICB9XG5cbiAgICAgICAgc3lub3BzaXMgKz1cbiAgICAgICAgICAgIFwiLiBUaGUgYW5hbHlzaXMgaWRlbnRpZmllZCBwYXR0ZXJucyBpbiBjb2RlIHN0cnVjdHVyZSwgZG9jdW1lbnRhdGlvbiBxdWFsaXR5LCBhbmQgYXJjaGl0ZWN0dXJhbCBkZWNpc2lvbnMgdGhhdCBwcm92aWRlIGEgY29tcHJlaGVuc2l2ZSB1bmRlcnN0YW5kaW5nIG9mIHRoZSBjdXJyZW50IHN0YXRlLlwiO1xuXG4gICAgICAgIHJldHVybiBzeW5vcHNpcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlU3VtbWFyeShcbiAgICAgICAgcXVlcnk6IFJlc2VhcmNoUXVlcnksXG4gICAgICAgIGluc2lnaHRzOiBJbnNpZ2h0W10sXG4gICAgICAgIGV2aWRlbmNlOiBFdmlkZW5jZVtdLFxuICAgICk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeTogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBPdmVyYWxsIGZpbmRpbmdzIHN1bW1hcnlcbiAgICAgICAgc3VtbWFyeS5wdXNoKFxuICAgICAgICAgICAgYEZvdW5kICR7aW5zaWdodHMubGVuZ3RofSBpbnNpZ2h0cyBhY3Jvc3MgJHtldmlkZW5jZS5sZW5ndGh9IGV2aWRlbmNlIHBvaW50c2AsXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gQ2F0ZWdvcml6ZSBpbnNpZ2h0c1xuICAgICAgICBjb25zdCBpbnNpZ2h0c0J5Q2F0ZWdvcnkgPSB0aGlzLmdyb3VwSW5zaWdodHNCeUNhdGVnb3J5KGluc2lnaHRzKTtcbiAgICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IE9iamVjdC5rZXlzKGluc2lnaHRzQnlDYXRlZ29yeSk7XG5cbiAgICAgICAgaWYgKGNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3VtbWFyeS5wdXNoKGBLZXkgYXJlYXMgaWRlbnRpZmllZDogJHtjYXRlZ29yaWVzLmpvaW4oXCIsIFwiKX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEltcGFjdCBzdW1tYXJ5XG4gICAgICAgIGNvbnN0IGhpZ2hJbXBhY3RJbnNpZ2h0cyA9IGluc2lnaHRzLmZpbHRlcigoaSkgPT4gaS5pbXBhY3QgPT09IFwiaGlnaFwiKTtcbiAgICAgICAgY29uc3QgbWVkaXVtSW1wYWN0SW5zaWdodHMgPSBpbnNpZ2h0cy5maWx0ZXIoXG4gICAgICAgICAgICAoaSkgPT4gaS5pbXBhY3QgPT09IFwibWVkaXVtXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGhpZ2hJbXBhY3RJbnNpZ2h0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdW1tYXJ5LnB1c2goXG4gICAgICAgICAgICAgICAgYCR7aGlnaEltcGFjdEluc2lnaHRzLmxlbmd0aH0gaGlnaC1pbXBhY3QgZmluZGluZ3MgcmVxdWlyZSBpbW1lZGlhdGUgYXR0ZW50aW9uYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVkaXVtSW1wYWN0SW5zaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3VtbWFyeS5wdXNoKFxuICAgICAgICAgICAgICAgIGAke21lZGl1bUltcGFjdEluc2lnaHRzLmxlbmd0aH0gbWVkaXVtLWltcGFjdCBmaW5kaW5ncyBzaG91bGQgYmUgYWRkcmVzc2VkIGluIHRoZSBuZWFyIHRlcm1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV2aWRlbmNlIHF1YWxpdHkgc3VtbWFyeVxuICAgICAgICBjb25zdCBoaWdoQ29uZmlkZW5jZUV2aWRlbmNlID0gZXZpZGVuY2UuZmlsdGVyKFxuICAgICAgICAgICAgKGUpID0+IGUuY29uZmlkZW5jZSA9PT0gQ29uZmlkZW5jZUxldmVsLkhJR0gsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChoaWdoQ29uZmlkZW5jZUV2aWRlbmNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHN1bW1hcnkucHVzaChcbiAgICAgICAgICAgICAgICBgJHtoaWdoQ29uZmlkZW5jZUV2aWRlbmNlLmxlbmd0aH0gaGlnaC1jb25maWRlbmNlIGV2aWRlbmNlIHBvaW50cyBzdXBwb3J0IHRoZSBmaW5kaW5nc2AsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2NvcGUtc3BlY2lmaWMgc3VtbWFyeVxuICAgICAgICBpZiAocXVlcnkuc2NvcGUgPT09IFJlc2VhcmNoU2NvcGUuQ09ERUJBU0UpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvZGVFdmlkZW5jZSA9IGV2aWRlbmNlLmZpbHRlcigoZSkgPT4gZS50eXBlID09PSBcImNvZGVcIik7XG4gICAgICAgICAgICBzdW1tYXJ5LnB1c2goXG4gICAgICAgICAgICAgICAgYEFuYWx5c2lzIGZvY3VzZWQgb24gJHtjb2RlRXZpZGVuY2UubGVuZ3RofSBjb2RlIGVsZW1lbnRzIGFjcm9zcyB0aGUgY29kZWJhc2VgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChxdWVyeS5zY29wZSA9PT0gUmVzZWFyY2hTY29wZS5ET0NVTUVOVEFUSU9OKSB7XG4gICAgICAgICAgICBjb25zdCBkb2NFdmlkZW5jZSA9IGV2aWRlbmNlLmZpbHRlcihcbiAgICAgICAgICAgICAgICAoZSkgPT4gZS50eXBlID09PSBcImRvY3VtZW50YXRpb25cIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzdW1tYXJ5LnB1c2goXG4gICAgICAgICAgICAgICAgYEFuYWx5c2lzIHJldmlld2VkICR7ZG9jRXZpZGVuY2UubGVuZ3RofSBkb2N1bWVudGF0aW9uIGVsZW1lbnRzYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3VtbWFyeTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlRGV0YWlsZWRGaW5kaW5ncyhcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogRGV0YWlsZWRGaW5kaW5nW10ge1xuICAgICAgICBjb25zdCBmaW5kaW5nczogRGV0YWlsZWRGaW5kaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBHcm91cCBpbnNpZ2h0cyBieSBjYXRlZ29yeVxuICAgICAgICBjb25zdCBpbnNpZ2h0c0J5Q2F0ZWdvcnkgPSB0aGlzLmdyb3VwSW5zaWdodHNCeUNhdGVnb3J5KGluc2lnaHRzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtjYXRlZ29yeSwgY2F0ZWdvcnlJbnNpZ2h0c10gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAgICAgICBpbnNpZ2h0c0J5Q2F0ZWdvcnksXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIC8vIFNvcnQgYnkgaW1wYWN0XG4gICAgICAgICAgICBjb25zdCBzb3J0ZWRJbnNpZ2h0cyA9IGNhdGVnb3J5SW5zaWdodHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltcGFjdE9yZGVyID0geyBoaWdoOiAzLCBtZWRpdW06IDIsIGxvdzogMSB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBpbXBhY3RPcmRlcltiLmltcGFjdF0gLSBpbXBhY3RPcmRlclthLmltcGFjdF07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIGZpbmRpbmcgZm9yIGVhY2ggc2lnbmlmaWNhbnQgaW5zaWdodFxuICAgICAgICAgICAgZm9yIChjb25zdCBpbnNpZ2h0IG9mIHNvcnRlZEluc2lnaHRzLnNsaWNlKDAsIDUpKSB7XG4gICAgICAgICAgICAgICAgLy8gTGltaXQgdG8gdG9wIDUgcGVyIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgZmluZGluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBgZmluZGluZy0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogaW5zaWdodC50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGluc2lnaHQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBpbnNpZ2h0LmV2aWRlbmNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBpbnNpZ2h0LmNvbmZpZGVuY2UsXG4gICAgICAgICAgICAgICAgICAgIGltcGFjdDogaW5zaWdodC5pbXBhY3QsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogaW5zaWdodC50eXBlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbmRpbmdzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVDb2RlUmVmZXJlbmNlcyhldmlkZW5jZTogRXZpZGVuY2VbXSk6IENvZGVSZWZlcmVuY2VbXSB7XG4gICAgICAgIGNvbnN0IGNvZGVFdmlkZW5jZSA9IGV2aWRlbmNlLmZpbHRlcihcbiAgICAgICAgICAgIChlKSA9PiBlLnR5cGUgPT09IFwiY29kZVwiICYmIGUuZmlsZSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY29kZVJlZmVyZW5jZXM6IENvZGVSZWZlcmVuY2VbXSA9IFtdO1xuXG4gICAgICAgIC8vIEdyb3VwIGJ5IGZpbGVcbiAgICAgICAgY29uc3QgZXZpZGVuY2VCeUZpbGUgPSB0aGlzLmdyb3VwRXZpZGVuY2VCeUZpbGUoY29kZUV2aWRlbmNlKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtmaWxlLCBmaWxlRXZpZGVuY2VdIG9mIE9iamVjdC5lbnRyaWVzKGV2aWRlbmNlQnlGaWxlKSkge1xuICAgICAgICAgICAgaWYgKGZpbGVFdmlkZW5jZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IGxpbmUgcmFuZ2VcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9IGZpbGVFdmlkZW5jZVxuICAgICAgICAgICAgICAgICAgICAubWFwKChlKSA9PiBlLmxpbmUpXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbikgYXMgbnVtYmVyW107XG4gICAgICAgICAgICAgICAgY29uc3QgbWluTGluZSA9IE1hdGgubWluKC4uLmxpbmVzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXhMaW5lID0gTWF0aC5tYXgoLi4ubGluZXMpO1xuXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGNhdGVnb3J5IGJhc2VkIG9uIGV2aWRlbmNlIHR5cGVzXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4ubmV3IFNldChmaWxlRXZpZGVuY2UubWFwKChlKSA9PiBlLnR5cGUpKSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gY2F0ZWdvcmllc1swXSB8fCBcImdlbmVyYWxcIjtcblxuICAgICAgICAgICAgICAgIGNvZGVSZWZlcmVuY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICBsaW5lczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzLmxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gU3RyaW5nKGxpbmVzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogW21pbkxpbmUsIG1heExpbmVdLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5nZW5lcmF0ZUNvZGVEZXNjcmlwdGlvbihmaWxlRXZpZGVuY2UpLFxuICAgICAgICAgICAgICAgICAgICByZWxldmFuY2U6IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZmlsZUV2aWRlbmNlLm1hcCgoZSkgPT4gZS5yZWxldmFuY2UpLFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb2RlUmVmZXJlbmNlcy5zb3J0KChhLCBiKSA9PiBiLnJlbGV2YW5jZSAtIGEucmVsZXZhbmNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlQ29kZURlc2NyaXB0aW9uKGV2aWRlbmNlOiBFdmlkZW5jZVtdKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdHlwZXMgPSBbLi4ubmV3IFNldChldmlkZW5jZS5tYXAoKGUpID0+IGUudHlwZSkpXTtcbiAgICAgICAgY29uc3QgY291bnQgPSBldmlkZW5jZS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHR5cGVzLmluY2x1ZGVzKFwiY2xhc3MtZGVmaW5pdGlvblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGBDb250YWlucyAke2NvdW50fSBjbGFzcyBkZWZpbml0aW9ucyBhbmQgcmVsYXRlZCBjb2RlIGVsZW1lbnRzYDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZXMuaW5jbHVkZXMoXCJmdW5jdGlvbi1kZWZpbml0aW9uXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYENvbnRhaW5zICR7Y291bnR9IGZ1bmN0aW9uIGRlZmluaXRpb25zIGFuZCBpbXBsZW1lbnRhdGlvbnNgO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlcy5pbmNsdWRlcyhcImltcG9ydC1zdGF0ZW1lbnRcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBgQ29udGFpbnMgJHtjb3VudH0gaW1wb3J0IHN0YXRlbWVudHMgc2hvd2luZyBkZXBlbmRlbmNpZXNgO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlcy5pbmNsdWRlcyhcInRlY2huaWNhbC1kZWJ0XCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYENvbnRhaW5zICR7Y291bnR9IHRlY2huaWNhbCBkZWJ0IG1hcmtlcnMgcmVxdWlyaW5nIGF0dGVudGlvbmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGBDb250YWlucyAke2NvdW50fSBzaWduaWZpY2FudCBjb2RlIGVsZW1lbnRzYDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlQXJjaGl0ZWN0dXJlSW5zaWdodHMoXG4gICAgICAgIGluc2lnaHRzOiBJbnNpZ2h0W10sXG4gICAgICAgIHJlbGF0aW9uc2hpcHM6IFJlbGF0aW9uc2hpcFtdLFxuICAgICk6IEFyY2hpdGVjdHVyZUluc2lnaHRbXSB7XG4gICAgICAgIGNvbnN0IGFyY2hpdGVjdHVyZUluc2lnaHRzOiBBcmNoaXRlY3R1cmVJbnNpZ2h0W10gPSBbXTtcblxuICAgICAgICAvLyBGaW5kIGFyY2hpdGVjdHVyYWwgaW5zaWdodHMgZnJvbSBhbmFseXNpc1xuICAgICAgICBjb25zdCBhcmNoSW5zaWdodHMgPSBpbnNpZ2h0cy5maWx0ZXIoXG4gICAgICAgICAgICAoaSkgPT5cbiAgICAgICAgICAgICAgICBpLmNhdGVnb3J5ID09PSBcImFyY2hpdGVjdHVyZVwiIHx8XG4gICAgICAgICAgICAgICAgaS5jYXRlZ29yeSA9PT0gXCJwYXR0ZXJuLWFuYWx5c2lzXCIgfHxcbiAgICAgICAgICAgICAgICBpLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJhcmNoaXRlY3R1cmVcIikgfHxcbiAgICAgICAgICAgICAgICBpLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJwYXR0ZXJuXCIpLFxuICAgICAgICApO1xuXG4gICAgICAgIGZvciAoY29uc3QgaW5zaWdodCBvZiBhcmNoSW5zaWdodHMuc2xpY2UoMCwgOCkpIHtcbiAgICAgICAgICAgIC8vIExpbWl0IHRvIHRvcCA4XG4gICAgICAgICAgICBjb25zdCByZWxhdGVkRXZpZGVuY2UgPSBpbnNpZ2h0LmV2aWRlbmNlLnNsaWNlKDAsIDUpOyAvLyBMaW1pdCBldmlkZW5jZVxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IHRoaXMuZXh0cmFjdENvbXBvbmVudHNGcm9tSW5zaWdodChpbnNpZ2h0KTtcblxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlSW5zaWdodHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IGBhcmNoLWluc2lnaHQtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMubWFwSW5zaWdodFR5cGVUb0FyY2hUeXBlKGluc2lnaHQudHlwZSksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGluc2lnaHQudGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGluc2lnaHQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IGluc2lnaHQuaW1wYWN0LFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlOiByZWxhdGVkRXZpZGVuY2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCByZWxhdGlvbnNoaXAtYmFzZWQgaW5zaWdodHNcbiAgICAgICAgY29uc3Qgc3Ryb25nUmVsYXRpb25zaGlwcyA9IHJlbGF0aW9uc2hpcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHIpID0+IHIuc3RyZW5ndGggPiAwLjcsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChzdHJvbmdSZWxhdGlvbnNoaXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZUluc2lnaHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBgYXJjaC1yZWxhdGlvbnNoaXBzLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcInBhdHRlcm5cIixcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJTdHJvbmcgYXJjaGl0ZWN0dXJhbCByZWxhdGlvbnNoaXBzIGRldGVjdGVkXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBGb3VuZCAke3N0cm9uZ1JlbGF0aW9uc2hpcHMubGVuZ3RofSBzdHJvbmcgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIGNvbXBvbmVudHMsIGluZGljYXRpbmcgd2VsbC1zdHJ1Y3R1cmVkIGFyY2hpdGVjdHVyZWAsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHRyYWN0Q29tcG9uZW50c0Zyb21SZWxhdGlvbnNoaXBzKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb25nUmVsYXRpb25zaGlwcyxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICAgICAgZXZpZGVuY2U6IHN0cm9uZ1JlbGF0aW9uc2hpcHNcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5mbGF0TWFwKChyKSA9PiByLmV2aWRlbmNlKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFyY2hpdGVjdHVyZUluc2lnaHRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFwSW5zaWdodFR5cGVUb0FyY2hUeXBlKFxuICAgICAgICBpbnNpZ2h0VHlwZTogc3RyaW5nLFxuICAgICk6IFwicGF0dGVyblwiIHwgXCJkZWNpc2lvblwiIHwgXCJjb25jZXJuXCIgfCBcInJlY29tbWVuZGF0aW9uXCIge1xuICAgICAgICBzd2l0Y2ggKGluc2lnaHRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicGF0dGVyblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcInBhdHRlcm5cIjtcbiAgICAgICAgICAgIGNhc2UgXCJkZWNpc2lvblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImRlY2lzaW9uXCI7XG4gICAgICAgICAgICBjYXNlIFwiZmluZGluZ1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImNvbmNlcm5cIjtcbiAgICAgICAgICAgIGNhc2UgXCJyZWxhdGlvbnNoaXBcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJwYXR0ZXJuXCI7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBcImNvbmNlcm5cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZXh0cmFjdENvbXBvbmVudHNGcm9tSW5zaWdodChpbnNpZ2h0OiBJbnNpZ2h0KTogc3RyaW5nW10ge1xuICAgICAgICAvLyBFeHRyYWN0IGNvbXBvbmVudCBuYW1lcyBmcm9tIGV2aWRlbmNlXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgLy8gVGhpcyBpcyBhIHNpbXBsaWZpZWQgaW1wbGVtZW50YXRpb25cbiAgICAgICAgLy8gSW4gcHJhY3RpY2UsIHlvdSdkIHBhcnNlIHRoZSBldmlkZW5jZSB0byBleHRyYWN0IGFjdHVhbCBjb21wb25lbnQgbmFtZXNcbiAgICAgICAgaWYgKGluc2lnaHQuZGVzY3JpcHRpb24uaW5jbHVkZXMoXCJjbGFzc1wiKSkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKFwiQ2xhc3Nlc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zaWdodC5kZXNjcmlwdGlvbi5pbmNsdWRlcyhcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2goXCJGdW5jdGlvbnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluc2lnaHQuZGVzY3JpcHRpb24uaW5jbHVkZXMoXCJtb2R1bGVcIikpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChcIk1vZHVsZXNcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluc2lnaHQuZGVzY3JpcHRpb24uaW5jbHVkZXMoXCJzZXJ2aWNlXCIpKSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2goXCJTZXJ2aWNlc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21wb25lbnRzLmxlbmd0aCA+IDAgPyBjb21wb25lbnRzIDogW1wiR2VuZXJhbCBDb21wb25lbnRzXCJdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXh0cmFjdENvbXBvbmVudHNGcm9tUmVsYXRpb25zaGlwcyhcbiAgICAgICAgcmVsYXRpb25zaGlwczogUmVsYXRpb25zaGlwW10sXG4gICAgKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBjb21wb25lbnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVsIG9mIHJlbGF0aW9uc2hpcHMpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChyZWwuc291cmNlLCByZWwudGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbLi4ubmV3IFNldChjb21wb25lbnRzKV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVJlY29tbWVuZGF0aW9ucyhcbiAgICAgICAgZmluZGluZ3M6IERldGFpbGVkRmluZGluZ1tdLFxuICAgICAgICBpbnNpZ2h0czogSW5zaWdodFtdLFxuICAgICk6IFJlY29tbWVuZGF0aW9uW10ge1xuICAgICAgICBjb25zdCByZWNvbW1lbmRhdGlvbnM6IFJlY29tbWVuZGF0aW9uW10gPSBbXTtcblxuICAgICAgICAvLyBHcm91cCBmaW5kaW5ncyBieSBpbXBhY3RcbiAgICAgICAgY29uc3QgaGlnaEltcGFjdEZpbmRpbmdzID0gZmluZGluZ3MuZmlsdGVyKChmKSA9PiBmLmltcGFjdCA9PT0gXCJoaWdoXCIpO1xuICAgICAgICBjb25zdCBtZWRpdW1JbXBhY3RGaW5kaW5ncyA9IGZpbmRpbmdzLmZpbHRlcihcbiAgICAgICAgICAgIChmKSA9PiBmLmltcGFjdCA9PT0gXCJtZWRpdW1cIixcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBpbW1lZGlhdGUgcmVjb21tZW5kYXRpb25zIGZyb20gaGlnaC1pbXBhY3QgZmluZGluZ3NcbiAgICAgICAgZm9yIChjb25zdCBmaW5kaW5nIG9mIGhpZ2hJbXBhY3RGaW5kaW5ncy5zbGljZSgwLCA1KSkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBgcmVjLWltbWVkaWF0ZS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTEpfWAsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJpbW1lZGlhdGVcIixcbiAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJjcml0aWNhbFwiLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBgQWRkcmVzczogJHtmaW5kaW5nLnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGBJbW1lZGlhdGUgYWN0aW9uIHJlcXVpcmVkIHRvIHJlc29sdmUgJHtmaW5kaW5nLnRpdGxlfWAsXG4gICAgICAgICAgICAgICAgcmF0aW9uYWxlOiBgVGhpcyBoaWdoLWltcGFjdCBmaW5kaW5nIGluICR7ZmluZGluZy5jYXRlZ29yeX0gcmVxdWlyZXMgaW1tZWRpYXRlIGF0dGVudGlvbiB0byBwcmV2ZW50IHBvdGVudGlhbCBpc3N1ZXNgLFxuICAgICAgICAgICAgICAgIGVmZm9ydDogdGhpcy5lc3RpbWF0ZUVmZm9ydChmaW5kaW5nKSxcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IGZpbmRpbmcuaW1wYWN0LFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIHNob3J0LXRlcm0gcmVjb21tZW5kYXRpb25zIGZyb20gbWVkaXVtLWltcGFjdCBmaW5kaW5nc1xuICAgICAgICBmb3IgKGNvbnN0IGZpbmRpbmcgb2YgbWVkaXVtSW1wYWN0RmluZGluZ3Muc2xpY2UoMCwgMykpIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogYHJlYy1zaG9ydC10ZXJtLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcInNob3J0LXRlcm1cIixcbiAgICAgICAgICAgICAgICBwcmlvcml0eTogXCJtZWRpdW1cIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYEltcHJvdmU6ICR7ZmluZGluZy50aXRsZX1gLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgUGxhbiBpbXByb3ZlbWVudHMgZm9yICR7ZmluZGluZy50aXRsZX0gaW4gdGhlIG5leHQgZGV2ZWxvcG1lbnQgY3ljbGVgLFxuICAgICAgICAgICAgICAgIHJhdGlvbmFsZTpcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIG1lZGl1bS1pbXBhY3QgZmluZGluZyBzaG91bGQgYmUgYWRkcmVzc2VkIHRvIGltcHJvdmUgb3ZlcmFsbCBxdWFsaXR5XCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiB0aGlzLmVzdGltYXRlRWZmb3J0KGZpbmRpbmcpLFxuICAgICAgICAgICAgICAgIGltcGFjdDogZmluZGluZy5pbXBhY3QsXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgYXJjaGl0ZWN0dXJhbCByZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgY29uc3QgYXJjaEluc2lnaHRzID0gaW5zaWdodHMuZmlsdGVyKFxuICAgICAgICAgICAgKGkpID0+IGkuY2F0ZWdvcnkgPT09IFwiYXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChhcmNoSW5zaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVjb21tZW5kYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBgcmVjLWFyY2gtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwibG9uZy10ZXJtXCIsXG4gICAgICAgICAgICAgICAgcHJpb3JpdHk6IFwibWVkaXVtXCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiQXJjaGl0ZWN0dXJhbCBpbXByb3ZlbWVudHNcIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgXCJDb25zaWRlciBpbXBsZW1lbnRpbmcgYXJjaGl0ZWN0dXJhbCBpbXByb3ZlbWVudHMgYmFzZWQgb24gaWRlbnRpZmllZCBwYXR0ZXJuc1wiLFxuICAgICAgICAgICAgICAgIHJhdGlvbmFsZTpcbiAgICAgICAgICAgICAgICAgICAgXCJBbmFseXNpcyByZXZlYWxlZCBhcmNoaXRlY3R1cmFsIHBhdHRlcm5zIHRoYXQgY291bGQgYmUgb3B0aW1pemVkIGZvciBiZXR0ZXIgbWFpbnRhaW5hYmlsaXR5XCIsXG4gICAgICAgICAgICAgICAgZWZmb3J0OiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IFwiaGlnaFwiLFxuICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWNvbW1lbmRhdGlvbnM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlc3RpbWF0ZUVmZm9ydChcbiAgICAgICAgZmluZGluZzogRGV0YWlsZWRGaW5kaW5nLFxuICAgICk6IFwibG93XCIgfCBcIm1lZGl1bVwiIHwgXCJoaWdoXCIge1xuICAgICAgICAvLyBTaW1wbGUgZWZmb3J0IGVzdGltYXRpb24gYmFzZWQgb24gY2F0ZWdvcnkgYW5kIGltcGFjdFxuICAgICAgICBpZiAoZmluZGluZy5jYXRlZ29yeSA9PT0gXCJ0ZWNobmljYWwtZGVidFwiKSByZXR1cm4gXCJtZWRpdW1cIjtcbiAgICAgICAgaWYgKGZpbmRpbmcuY2F0ZWdvcnkgPT09IFwiY29tcGxleGl0eS1hbmFseXNpc1wiKSByZXR1cm4gXCJoaWdoXCI7XG4gICAgICAgIGlmIChmaW5kaW5nLmNhdGVnb3J5ID09PSBcImRvY3VtZW50YXRpb24tcXVhbGl0eVwiKSByZXR1cm4gXCJsb3dcIjtcbiAgICAgICAgaWYgKGZpbmRpbmcuaW1wYWN0ID09PSBcImhpZ2hcIikgcmV0dXJuIFwibWVkaXVtXCI7XG4gICAgICAgIHJldHVybiBcImxvd1wiO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVSaXNrcyhcbiAgICAgICAgZmluZGluZ3M6IERldGFpbGVkRmluZGluZ1tdLFxuICAgICAgICBpbnNpZ2h0czogSW5zaWdodFtdLFxuICAgICk6IFJpc2tbXSB7XG4gICAgICAgIGNvbnN0IHJpc2tzOiBSaXNrW10gPSBbXTtcblxuICAgICAgICAvLyBHZW5lcmF0ZSByaXNrcyBmcm9tIGhpZ2gtaW1wYWN0IGZpbmRpbmdzXG4gICAgICAgIGNvbnN0IGhpZ2hJbXBhY3RGaW5kaW5ncyA9IGZpbmRpbmdzLmZpbHRlcigoZikgPT4gZi5pbXBhY3QgPT09IFwiaGlnaFwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpbmRpbmcgb2YgaGlnaEltcGFjdEZpbmRpbmdzLnNsaWNlKDAsIDMpKSB7XG4gICAgICAgICAgICBjb25zdCByaXNrVHlwZSA9IHRoaXMubWFwQ2F0ZWdvcnlUb1Jpc2tUeXBlKGZpbmRpbmcuY2F0ZWdvcnkpO1xuXG4gICAgICAgICAgICByaXNrcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogYHJpc2stJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDExKX1gLFxuICAgICAgICAgICAgICAgIHR5cGU6IHJpc2tUeXBlLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBmaW5kaW5nLmltcGFjdCA9PT0gXCJoaWdoXCIgPyBcImNyaXRpY2FsXCIgOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogYFJpc2s6ICR7ZmluZGluZy50aXRsZX1gLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgJHtmaW5kaW5nLmRlc2NyaXB0aW9ufSBUaGlzIHBvc2VzIGEgcmlzayB0byBzeXN0ZW0gc3RhYmlsaXR5IGFuZCBtYWludGFpbmFiaWxpdHlgLFxuICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5OiB0aGlzLmFzc2Vzc1Jpc2tQcm9iYWJpbGl0eShmaW5kaW5nKSxcbiAgICAgICAgICAgICAgICBpbXBhY3Q6IGZpbmRpbmcuaW1wYWN0LFxuICAgICAgICAgICAgICAgIG1pdGlnYXRpb246IHRoaXMuZ2VuZXJhdGVNaXRpZ2F0aW9uKGZpbmRpbmcpLFxuICAgICAgICAgICAgICAgIGV2aWRlbmNlOiBmaW5kaW5nLmV2aWRlbmNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSB0ZWNobmljYWwgZGVidCByaXNrc1xuICAgICAgICBjb25zdCBkZWJ0RmluZGluZ3MgPSBmaW5kaW5ncy5maWx0ZXIoXG4gICAgICAgICAgICAoZikgPT4gZi5jYXRlZ29yeSA9PT0gXCJ0ZWNobmljYWwtZGVidFwiLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZGVidEZpbmRpbmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHJpc2tzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBgcmlzay1kZWJ0LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMSl9YCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm1haW50YWluYWJpbGl0eVwiLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJBY2N1bXVsYXRlZCB0ZWNobmljYWwgZGVidFwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgRm91bmQgJHtkZWJ0RmluZGluZ3MubGVuZ3RofSB0ZWNobmljYWwgZGVidCBpdGVtcyB0aGF0IGNvdWxkIGltcGFjdCBmdXR1cmUgZGV2ZWxvcG1lbnRgLFxuICAgICAgICAgICAgICAgIHByb2JhYmlsaXR5OiBcIm1lZGl1bVwiLFxuICAgICAgICAgICAgICAgIGltcGFjdDogXCJoaWdoXCIsXG4gICAgICAgICAgICAgICAgbWl0aWdhdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgXCJJbXBsZW1lbnQgcmVndWxhciByZWZhY3RvcmluZyBzcHJpbnRzIGFuZCBhZGRyZXNzIHRlY2huaWNhbCBkZWJ0IGl0ZW1zIHN5c3RlbWF0aWNhbGx5XCIsXG4gICAgICAgICAgICAgICAgZXZpZGVuY2U6IGRlYnRGaW5kaW5ncy5zbGljZSgwLCAzKS5tYXAoKGYpID0+IGYuaWQpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmlza3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXBDYXRlZ29yeVRvUmlza1R5cGUoXG4gICAgICAgIGNhdGVnb3J5OiBzdHJpbmcsXG4gICAgKTpcbiAgICAgICAgfCBcInRlY2huaWNhbFwiXG4gICAgICAgIHwgXCJhcmNoaXRlY3R1cmFsXCJcbiAgICAgICAgfCBcInNlY3VyaXR5XCJcbiAgICAgICAgfCBcInBlcmZvcm1hbmNlXCJcbiAgICAgICAgfCBcIm1haW50YWluYWJpbGl0eVwiIHtcbiAgICAgICAgc3dpdGNoIChjYXRlZ29yeSkge1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXhpdHktYW5hbHlzaXNcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJtYWludGFpbmFiaWxpdHlcIjtcbiAgICAgICAgICAgIGNhc2UgXCJ0ZWNobmljYWwtZGVidFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcInRlY2huaWNhbFwiO1xuICAgICAgICAgICAgY2FzZSBcImFyY2hpdGVjdHVyZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcImFyY2hpdGVjdHVyYWxcIjtcbiAgICAgICAgICAgIGNhc2UgXCJwYXR0ZXJuLWFuYWx5c2lzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYXJjaGl0ZWN0dXJhbFwiO1xuICAgICAgICAgICAgY2FzZSBcImRvY3VtZW50YXRpb24tcXVhbGl0eVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIm1haW50YWluYWJpbGl0eVwiO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ0ZWNobmljYWxcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXNzZXNzUmlza1Byb2JhYmlsaXR5KFxuICAgICAgICBmaW5kaW5nOiBEZXRhaWxlZEZpbmRpbmcsXG4gICAgKTogXCJsb3dcIiB8IFwibWVkaXVtXCIgfCBcImhpZ2hcIiB7XG4gICAgICAgIGlmIChmaW5kaW5nLmNvbmZpZGVuY2UgPT09IENvbmZpZGVuY2VMZXZlbC5ISUdIKSByZXR1cm4gXCJoaWdoXCI7XG4gICAgICAgIGlmIChmaW5kaW5nLmNvbmZpZGVuY2UgPT09IENvbmZpZGVuY2VMZXZlbC5NRURJVU0pIHJldHVybiBcIm1lZGl1bVwiO1xuICAgICAgICByZXR1cm4gXCJsb3dcIjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlTWl0aWdhdGlvbihmaW5kaW5nOiBEZXRhaWxlZEZpbmRpbmcpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKGZpbmRpbmcuY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV4aXR5LWFuYWx5c2lzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUmVmYWN0b3IgY29tcGxleCBjb21wb25lbnRzIGludG8gc21hbGxlciwgbW9yZSBtYW5hZ2VhYmxlIHBpZWNlc1wiO1xuICAgICAgICAgICAgY2FzZSBcInRlY2huaWNhbC1kZWJ0XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQWRkcmVzcyB0ZWNobmljYWwgZGVidCBpdGVtcyB0aHJvdWdoIHBsYW5uZWQgcmVmYWN0b3JpbmcgZWZmb3J0c1wiO1xuICAgICAgICAgICAgY2FzZSBcImRvY3VtZW50YXRpb24tcXVhbGl0eVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIkltcHJvdmUgZG9jdW1lbnRhdGlvbiBzdHJ1Y3R1cmUgYW5kIGFkZCBjb21wcmVoZW5zaXZlIGV4cGxhbmF0aW9uc1wiO1xuICAgICAgICAgICAgY2FzZSBcImFyY2hpdGVjdHVyZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlJldmlldyBhbmQgaW1wcm92ZSBhcmNoaXRlY3R1cmFsIHBhdHRlcm5zIGFuZCBkZWNpc2lvbnNcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiSW52ZXN0aWdhdGUgdGhlIGZpbmRpbmcgYW5kIGltcGxlbWVudCBhcHByb3ByaWF0ZSBjb3JyZWN0aXZlIGFjdGlvbnNcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVPcGVuUXVlc3Rpb25zKFxuICAgICAgICBxdWVyeTogUmVzZWFyY2hRdWVyeSxcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICAgICAgZXZpZGVuY2U6IEV2aWRlbmNlW10sXG4gICAgKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBxdWVzdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgcXVlc3Rpb25zIGJhc2VkIG9uIGdhcHMgaW4gYW5hbHlzaXNcbiAgICAgICAgaWYgKGluc2lnaHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcXVlc3Rpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgXCJXaHkgd2VyZSBubyBzaWduaWZpY2FudCBpbnNpZ2h0cyBmb3VuZD8gSXMgdGhlIHF1ZXJ5IHRvbyBicm9hZCBvciB0aGUgc2NvcGUgdG9vIGxpbWl0ZWQ/XCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2aWRlbmNlLmxlbmd0aCA8IDEwKSB7XG4gICAgICAgICAgICBxdWVzdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICBcIklzIHRoZXJlIGFkZGl0aW9uYWwgZXZpZGVuY2UgdGhhdCBjb3VsZCBiZSBjb2xsZWN0ZWQgdG8gc3VwcG9ydCBtb3JlIGNvbXByZWhlbnNpdmUgYW5hbHlzaXM/XCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgcXVlc3Rpb25zIGJhc2VkIG9uIGZpbmRpbmdzXG4gICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBPYmplY3Qua2V5cyh0aGlzLmdyb3VwSW5zaWdodHNCeUNhdGVnb3J5KGluc2lnaHRzKSk7XG4gICAgICAgIGlmICghY2F0ZWdvcmllcy5pbmNsdWRlcyhcImFyY2hpdGVjdHVyZVwiKSkge1xuICAgICAgICAgICAgcXVlc3Rpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgXCJXaGF0IGFyY2hpdGVjdHVyYWwgcGF0dGVybnMgYW5kIGRlY2lzaW9ucyBzaG91bGQgYmUgZnVydGhlciBpbnZlc3RpZ2F0ZWQ/XCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYXRlZ29yaWVzLmluY2x1ZGVzKFwicGVyZm9ybWFuY2VcIikpIHtcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIFwiQXJlIHRoZXJlIHBlcmZvcm1hbmNlIGNvbnNpZGVyYXRpb25zIHRoYXQgc2hvdWxkIGJlIGFuYWx5emVkP1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIHNjb3BlLXNwZWNpZmljIHF1ZXN0aW9uc1xuICAgICAgICBpZiAocXVlcnkuc2NvcGUgPT09IFJlc2VhcmNoU2NvcGUuQ09ERUJBU0UpIHtcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIFwiSG93IGRvZXMgdGhlIGNvZGViYXNlIHN0cnVjdHVyZSBhbGlnbiB3aXRoIGluZHVzdHJ5IGJlc3QgcHJhY3RpY2VzIGFuZCBzdGFuZGFyZHM/XCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5LnNjb3BlID09PSBSZXNlYXJjaFNjb3BlLkRPQ1VNRU5UQVRJT04pIHtcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIFwiSG93IGNhbiB0aGUgZG9jdW1lbnRhdGlvbiBiZSBpbXByb3ZlZCB0byBiZXR0ZXIgc3VwcG9ydCBkZXZlbG9wbWVudCBhbmQgbWFpbnRlbmFuY2U/XCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZm9yd2FyZC1sb29raW5nIHF1ZXN0aW9uc1xuICAgICAgICBxdWVzdGlvbnMucHVzaChcbiAgICAgICAgICAgIFwiV2hhdCBzdGVwcyBzaG91bGQgYmUgdGFrZW4gdG8gYWRkcmVzcyB0aGUgaWRlbnRpZmllZCBmaW5kaW5ncyBhbmQgcmlza3M/XCIsXG4gICAgICAgICk7XG4gICAgICAgIHF1ZXN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgXCJIb3cgY2FuIHRoZSByZXNlYXJjaCBwcm9jZXNzIGJlIGltcHJvdmVkIGZvciBmdXR1cmUgYW5hbHlzZXM/XCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHF1ZXN0aW9ucy5zbGljZSgwLCA1KTsgLy8gTGltaXQgdG8gNSBxdWVzdGlvbnNcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZU92ZXJhbGxDb25maWRlbmNlKFxuICAgICAgICBpbnNpZ2h0czogSW5zaWdodFtdLFxuICAgICAgICBldmlkZW5jZTogRXZpZGVuY2VbXSxcbiAgICApOiBDb25maWRlbmNlTGV2ZWwge1xuICAgICAgICBpZiAoaW5zaWdodHMubGVuZ3RoID09PSAwICYmIGV2aWRlbmNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTE9XO1xuXG4gICAgICAgIGNvbnN0IGluc2lnaHRTY29yZXMgPSBpbnNpZ2h0cy5tYXAoKGkpID0+XG4gICAgICAgICAgICB0aGlzLmNvbmZpZGVuY2VUb051bWJlcihpLmNvbmZpZGVuY2UpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBldmlkZW5jZVNjb3JlcyA9IGV2aWRlbmNlLm1hcCgoZSkgPT5cbiAgICAgICAgICAgIHRoaXMuY29uZmlkZW5jZVRvTnVtYmVyKGUuY29uZmlkZW5jZSksXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgYWxsU2NvcmVzID0gWy4uLmluc2lnaHRTY29yZXMsIC4uLmV2aWRlbmNlU2NvcmVzXTtcbiAgICAgICAgaWYgKGFsbFNjb3Jlcy5sZW5ndGggPT09IDApIHJldHVybiBDb25maWRlbmNlTGV2ZWwuTE9XO1xuXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2VTY29yZSA9XG4gICAgICAgICAgICBhbGxTY29yZXMucmVkdWNlKChzdW0sIHNjb3JlKSA9PiBzdW0gKyBzY29yZSwgMCkgLyBhbGxTY29yZXMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChhdmVyYWdlU2NvcmUgPj0gMC44KSByZXR1cm4gQ29uZmlkZW5jZUxldmVsLkhJR0g7XG4gICAgICAgIGlmIChhdmVyYWdlU2NvcmUgPj0gMC42KSByZXR1cm4gQ29uZmlkZW5jZUxldmVsLk1FRElVTTtcbiAgICAgICAgcmV0dXJuIENvbmZpZGVuY2VMZXZlbC5MT1c7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25maWRlbmNlVG9OdW1iZXIoY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsKTogbnVtYmVyIHtcbiAgICAgICAgc3dpdGNoIChjb25maWRlbmNlKSB7XG4gICAgICAgICAgICBjYXNlIENvbmZpZGVuY2VMZXZlbC5ISUdIOlxuICAgICAgICAgICAgICAgIHJldHVybiAwLjk7XG4gICAgICAgICAgICBjYXNlIENvbmZpZGVuY2VMZXZlbC5NRURJVU06XG4gICAgICAgICAgICAgICAgcmV0dXJuIDAuNjtcbiAgICAgICAgICAgIGNhc2UgQ29uZmlkZW5jZUxldmVsLkxPVzpcbiAgICAgICAgICAgICAgICByZXR1cm4gMC4zO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gMC4xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBncm91cEluc2lnaHRzQnlDYXRlZ29yeShcbiAgICAgICAgaW5zaWdodHM6IEluc2lnaHRbXSxcbiAgICApOiBSZWNvcmQ8c3RyaW5nLCBJbnNpZ2h0W10+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBlZDogUmVjb3JkPHN0cmluZywgSW5zaWdodFtdPiA9IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3QgaW5zaWdodCBvZiBpbnNpZ2h0cykge1xuICAgICAgICAgICAgaWYgKCFncm91cGVkW2luc2lnaHQuY2F0ZWdvcnldKSBncm91cGVkW2luc2lnaHQuY2F0ZWdvcnldID0gW107XG4gICAgICAgICAgICBncm91cGVkW2luc2lnaHQuY2F0ZWdvcnldLnB1c2goaW5zaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ3JvdXBlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdyb3VwRXZpZGVuY2VCeUZpbGUoXG4gICAgICAgIGV2aWRlbmNlOiBFdmlkZW5jZVtdLFxuICAgICk6IFJlY29yZDxzdHJpbmcsIEV2aWRlbmNlW10+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBlZDogUmVjb3JkPHN0cmluZywgRXZpZGVuY2VbXT4gPSB7fTtcblxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZXZpZGVuY2UpIHtcbiAgICAgICAgICAgIGlmIChpdGVtLmZpbGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWdyb3VwZWRbaXRlbS5maWxlXSkgZ3JvdXBlZFtpdGVtLmZpbGVdID0gW107XG4gICAgICAgICAgICAgICAgZ3JvdXBlZFtpdGVtLmZpbGVdLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ3JvdXBlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvdW50VW5pcXVlRmlsZXMoZXZpZGVuY2U6IEV2aWRlbmNlW10pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBmaWxlcyA9IG5ldyBTZXQoXG4gICAgICAgICAgICBldmlkZW5jZS5maWx0ZXIoKGUpID0+IGUuZmlsZSkubWFwKChlKSA9PiBlLmZpbGUpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmlsZXMuc2l6ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgcmVzZWFyY2ggcmVwb3J0IHRvIHNwZWNpZmllZCBmb3JtYXRcbiAgICAgKi9cbiAgICBhc3luYyBleHBvcnRSZXBvcnQoXG4gICAgICAgIHJlcG9ydDogU3ludGhlc2lzUmVwb3J0LFxuICAgICAgICBvcHRpb25zOiBSZXNlYXJjaEV4cG9ydE9wdGlvbnMsXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgb3V0cHV0UGF0aCA9XG4gICAgICAgICAgICBvcHRpb25zLm91dHB1dFBhdGggfHxcbiAgICAgICAgICAgIGByZXNlYXJjaC1yZXBvcnQtJHtEYXRlLm5vdygpfS4ke29wdGlvbnMuZm9ybWF0fWA7XG5cbiAgICAgICAgc3dpdGNoIChvcHRpb25zLmZvcm1hdCkge1xuICAgICAgICAgICAgY2FzZSBSZXNlYXJjaEV4cG9ydEZvcm1hdC5NQVJLRE9XTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHBvcnRUb01hcmtkb3duKHJlcG9ydCwgb3V0cHV0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjYXNlIFJlc2VhcmNoRXhwb3J0Rm9ybWF0LkpTT046XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0VG9KU09OKHJlcG9ydCwgb3V0cHV0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjYXNlIFJlc2VhcmNoRXhwb3J0Rm9ybWF0LkhUTUw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0VG9IVE1MKHJlcG9ydCwgb3V0cHV0UGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjYXNlIFJlc2VhcmNoRXhwb3J0Rm9ybWF0LlBERjpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQREYgZXhwb3J0IG5vdCB5ZXQgaW1wbGVtZW50ZWRcIik7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZXhwb3J0IGZvcm1hdDogJHtvcHRpb25zLmZvcm1hdH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhwb3J0VG9NYXJrZG93bihcbiAgICAgICAgcmVwb3J0OiBTeW50aGVzaXNSZXBvcnQsXG4gICAgICAgIG91dHB1dFBhdGg6IHN0cmluZyxcbiAgICAgICAgb3B0aW9uczogUmVzZWFyY2hFeHBvcnRPcHRpb25zLFxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbmVyYXRlTWFya2Rvd25Db250ZW50KHJlcG9ydCwgb3B0aW9ucyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShvdXRwdXRQYXRoLCBjb250ZW50LCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFBhdGg7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBleHBvcnQgbWFya2Rvd24gcmVwb3J0OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlTWFya2Rvd25Db250ZW50KFxuICAgICAgICByZXBvcnQ6IFN5bnRoZXNpc1JlcG9ydCxcbiAgICAgICAgb3B0aW9uczogUmVzZWFyY2hFeHBvcnRPcHRpb25zLFxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGxldCBjb250ZW50ID0gXCJcIjtcblxuICAgICAgICAvLyBZQU1MIGZyb250bWF0dGVyXG4gICAgICAgIGNvbnRlbnQgKz0gXCItLS1cXG5cIjtcbiAgICAgICAgY29udGVudCArPSBgaWQ6ICR7cmVwb3J0LmlkfVxcbmA7XG4gICAgICAgIGNvbnRlbnQgKz0gYHF1ZXJ5OiBcIiR7cmVwb3J0LnF1ZXJ5fVwiXFxuYDtcbiAgICAgICAgY29udGVudCArPSBgZ2VuZXJhdGVkOiAke3JlcG9ydC5nZW5lcmF0ZWRBdC50b0lTT1N0cmluZygpfVxcbmA7XG4gICAgICAgIGNvbnRlbnQgKz0gYGNvbmZpZGVuY2U6ICR7cmVwb3J0LmNvbmZpZGVuY2V9XFxuYDtcbiAgICAgICAgY29udGVudCArPSBgc2NvcGU6ICR7cmVwb3J0Lm1ldGFkYXRhLnNjb3BlfVxcbmA7XG4gICAgICAgIGNvbnRlbnQgKz0gYGRlcHRoOiAke3JlcG9ydC5tZXRhZGF0YS5kZXB0aH1cXG5gO1xuICAgICAgICBjb250ZW50ICs9IGBhZ2VudHM6IFske3JlcG9ydC5hZ2VudHNVc2VkLmpvaW4oXCIsIFwiKX1dXFxuYDtcbiAgICAgICAgY29udGVudCArPSBgZXhlY3V0aW9uVGltZTogJHtyZXBvcnQuZXhlY3V0aW9uVGltZX1tc1xcbmA7XG4gICAgICAgIGNvbnRlbnQgKz0gXCItLS1cXG5cXG5cIjtcblxuICAgICAgICAvLyBUaXRsZSBhbmQgc3lub3BzaXNcbiAgICAgICAgY29udGVudCArPSBgIyBSZXNlYXJjaCBSZXBvcnQ6ICR7cmVwb3J0LnF1ZXJ5fVxcblxcbmA7XG4gICAgICAgIGNvbnRlbnQgKz0gYCMjIFN5bm9wc2lzXFxuXFxuJHtyZXBvcnQuc3lub3BzaXN9XFxuXFxuYDtcblxuICAgICAgICAvLyBTdW1tYXJ5XG4gICAgICAgIGNvbnRlbnQgKz0gXCIjIyBTdW1tYXJ5XFxuXFxuXCI7XG4gICAgICAgIGZvciAoY29uc3QgcG9pbnQgb2YgcmVwb3J0LnN1bW1hcnkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gYC0gJHtwb2ludH1cXG5gO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnQgKz0gXCJcXG5cIjtcblxuICAgICAgICAvLyBGaW5kaW5nc1xuICAgICAgICBpZiAob3B0aW9ucy5pbmNsdWRlRXZpZGVuY2UgJiYgcmVwb3J0LmZpbmRpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gXCIjIyBLZXkgRmluZGluZ3NcXG5cXG5cIjtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmluZGluZyBvZiByZXBvcnQuZmluZGluZ3MpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAjIyMgJHtmaW5kaW5nLnRpdGxlfVxcblxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipDYXRlZ29yeToqKiAke2ZpbmRpbmcuY2F0ZWdvcnl9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqSW1wYWN0OioqICR7ZmluZGluZy5pbXBhY3R9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqQ29uZmlkZW5jZToqKiAke2ZpbmRpbmcuY29uZmlkZW5jZX1cXG5cXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCR7ZmluZGluZy5kZXNjcmlwdGlvbn1cXG5cXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29kZSByZWZlcmVuY2VzXG4gICAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVDb2RlUmVmZXJlbmNlcyAmJiByZXBvcnQuY29kZVJlZmVyZW5jZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBcIiMjIENvZGUgUmVmZXJlbmNlc1xcblxcblwiO1xuICAgICAgICAgICAgZm9yIChjb25zdCByZWYgb2YgcmVwb3J0LmNvZGVSZWZlcmVuY2VzLnNsaWNlKDAsIDEwKSkge1xuICAgICAgICAgICAgICAgIC8vIExpbWl0IHRvIDEwXG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgIyMjICR7cmVmLnBhdGh9XFxuXFxuYDtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAqKkxpbmVzOioqICR7dHlwZW9mIHJlZi5saW5lcyA9PT0gXCJudW1iZXJcIiA/IHJlZi5saW5lcyA6IGAke3JlZi5saW5lc1swXX0tJHtyZWYubGluZXNbMV19YH0gIFxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipDYXRlZ29yeToqKiAke3JlZi5jYXRlZ29yeX0gIFxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipSZWxldmFuY2U6KiogJHtyZWYucmVsZXZhbmNlLnRvRml4ZWQoMil9XFxuXFxuYDtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAke3JlZi5kZXNjcmlwdGlvbn1cXG5cXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXJjaGl0ZWN0dXJlIGluc2lnaHRzXG4gICAgICAgIGlmIChyZXBvcnQuYXJjaGl0ZWN0dXJlSW5zaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBcIiMjIEFyY2hpdGVjdHVyZSBJbnNpZ2h0c1xcblxcblwiO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpbnNpZ2h0IG9mIHJlcG9ydC5hcmNoaXRlY3R1cmVJbnNpZ2h0cykge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCMjIyAke2luc2lnaHQudGl0bGV9XFxuXFxuYDtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAqKlR5cGU6KiogJHtpbnNpZ2h0LnR5cGV9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqSW1wYWN0OioqICR7aW5zaWdodC5pbXBhY3R9XFxuXFxuYDtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAke2luc2lnaHQuZGVzY3JpcHRpb259XFxuXFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY29tbWVuZGF0aW9uc1xuICAgICAgICBpZiAocmVwb3J0LnJlY29tbWVuZGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ICs9IFwiIyMgUmVjb21tZW5kYXRpb25zXFxuXFxuXCI7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlYyBvZiByZXBvcnQucmVjb21tZW5kYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgIyMjICR7cmVjLnRpdGxlfVxcblxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipUeXBlOioqICR7cmVjLnR5cGV9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqUHJpb3JpdHk6KiogJHtyZWMucHJpb3JpdHl9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqRWZmb3J0OioqICR7cmVjLmVmZm9ydH0gIFxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipJbXBhY3Q6KiogJHtyZWMuaW1wYWN0fVxcblxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgJHtyZWMuZGVzY3JpcHRpb259XFxuXFxuYDtcbiAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAqKlJhdGlvbmFsZToqKiAke3JlYy5yYXRpb25hbGV9XFxuXFxuYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJpc2tzXG4gICAgICAgIGlmIChyZXBvcnQucmlza3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBcIiMjIFJpc2tzXFxuXFxuXCI7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJpc2sgb2YgcmVwb3J0LnJpc2tzKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgIyMjICR7cmlzay50aXRsZX1cXG5cXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqVHlwZToqKiAke3Jpc2sudHlwZX0gIFxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgKipTZXZlcml0eToqKiAke3Jpc2suc2V2ZXJpdHl9ICBcXG5gO1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gYCoqUHJvYmFiaWxpdHk6KiogJHtyaXNrLnByb2JhYmlsaXR5fVxcblxcbmA7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgJHtyaXNrLmRlc2NyaXB0aW9ufVxcblxcbmA7XG4gICAgICAgICAgICAgICAgaWYgKHJpc2subWl0aWdhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ICs9IGAqKk1pdGlnYXRpb246KiogJHtyaXNrLm1pdGlnYXRpb259XFxuXFxuYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPcGVuIHF1ZXN0aW9uc1xuICAgICAgICBpZiAocmVwb3J0Lm9wZW5RdWVzdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCArPSBcIiMjIE9wZW4gUXVlc3Rpb25zXFxuXFxuXCI7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHF1ZXN0aW9uIG9mIHJlcG9ydC5vcGVuUXVlc3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCArPSBgLSAke3F1ZXN0aW9ufVxcbmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZW50ICs9IFwiXFxuXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNZXRhZGF0YVxuICAgICAgICBpZiAob3B0aW9ucy5pbmNsdWRlTWV0YWRhdGEpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gXCIjIyBNZXRhZGF0YVxcblxcblwiO1xuICAgICAgICAgICAgY29udGVudCArPSBgLSAqKlRvdGFsIEZpbGVzOioqICR7cmVwb3J0Lm1ldGFkYXRhLnRvdGFsRmlsZXN9XFxuYDtcbiAgICAgICAgICAgIGNvbnRlbnQgKz0gYC0gKipUb3RhbCBJbnNpZ2h0czoqKiAke3JlcG9ydC5tZXRhZGF0YS50b3RhbEluc2lnaHRzfVxcbmA7XG4gICAgICAgICAgICBjb250ZW50ICs9IGAtICoqVG90YWwgRXZpZGVuY2U6KiogJHtyZXBvcnQubWV0YWRhdGEudG90YWxFdmlkZW5jZX1cXG5gO1xuICAgICAgICAgICAgY29udGVudCArPSBgLSAqKkV4ZWN1dGlvbiBUaW1lOioqICR7cmVwb3J0LmV4ZWN1dGlvblRpbWV9bXNcXG5gO1xuICAgICAgICAgICAgY29udGVudCArPSBgLSAqKkFnZW50cyBVc2VkOioqICR7cmVwb3J0LmFnZW50c1VzZWQuam9pbihcIiwgXCIpfVxcbmA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGV4cG9ydFRvSlNPTihcbiAgICAgICAgcmVwb3J0OiBTeW50aGVzaXNSZXBvcnQsXG4gICAgICAgIG91dHB1dFBhdGg6IHN0cmluZyxcbiAgICAgICAgb3B0aW9uczogUmVzZWFyY2hFeHBvcnRPcHRpb25zLFxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGpzb25Db250ZW50ID0gSlNPTi5zdHJpbmdpZnkocmVwb3J0LCBudWxsLCAyKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlKG91dHB1dFBhdGgsIGpzb25Db250ZW50LCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFBhdGg7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBleHBvcnQgSlNPTiByZXBvcnQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZXhwb3J0VG9IVE1MKFxuICAgICAgICByZXBvcnQ6IFN5bnRoZXNpc1JlcG9ydCxcbiAgICAgICAgb3V0cHV0UGF0aDogc3RyaW5nLFxuICAgICAgICBvcHRpb25zOiBSZXNlYXJjaEV4cG9ydE9wdGlvbnMsXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSB0aGlzLmdlbmVyYXRlSFRNTENvbnRlbnQocmVwb3J0LCBvcHRpb25zKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlKG91dHB1dFBhdGgsIGh0bWxDb250ZW50LCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFBhdGg7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBleHBvcnQgSFRNTCByZXBvcnQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZXNjYXBlSHRtbCh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGV4dFxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKVxuICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCImIzM5O1wiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlSFRNTENvbnRlbnQoXG4gICAgICAgIHJlcG9ydDogU3ludGhlc2lzUmVwb3J0LFxuICAgICAgICBvcHRpb25zOiBSZXNlYXJjaEV4cG9ydE9wdGlvbnMsXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWwgbGFuZz1cImVuXCI+XG48aGVhZD5cbiAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIj5cbiAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiPlxuICAgIDx0aXRsZT5SZXNlYXJjaCBSZXBvcnQ6ICR7dGhpcy5lc2NhcGVIdG1sKHJlcG9ydC5xdWVyeSl9PC90aXRsZT5cbiAgICA8c3R5bGU+XG4gICAgICAgIGJvZHkgeyBmb250LWZhbWlseTogQXJpYWwsIHNhbnMtc2VyaWY7IG1heC13aWR0aDogMTIwMHB4OyBtYXJnaW46IDAgYXV0bzsgcGFkZGluZzogMjBweDsgfVxuICAgICAgICAuaGVhZGVyIHsgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkICMzMzM7IHBhZGRpbmctYm90dG9tOiAyMHB4OyBtYXJnaW4tYm90dG9tOiAzMHB4OyB9XG4gICAgICAgIC5zZWN0aW9uIHsgbWFyZ2luLWJvdHRvbTogMzBweDsgfVxuICAgICAgICAuZmluZGluZywgLnJlY29tbWVuZGF0aW9uLCAucmlzayB7IGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7IHBhZGRpbmc6IDE1cHg7IG1hcmdpbi1ib3R0b206IDE1cHg7IGJvcmRlci1yYWRpdXM6IDVweDsgfVxuICAgICAgICAuaGlnaC1pbXBhY3QgeyBib3JkZXItbGVmdDogNXB4IHNvbGlkICNkMzJmMmY7IH1cbiAgICAgICAgLm1lZGl1bS1pbXBhY3QgeyBib3JkZXItbGVmdDogNXB4IHNvbGlkICNmNTdjMDA7IH1cbiAgICAgICAgLmxvdy1pbXBhY3QgeyBib3JkZXItbGVmdDogNXB4IHNvbGlkICMzODhlM2M7IH1cbiAgICAgICAgLm1ldGFkYXRhIHsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsgcGFkZGluZzogMTVweDsgYm9yZGVyLXJhZGl1czogNXB4OyB9XG4gICAgICAgIGNvZGUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjRmNGY0OyBwYWRkaW5nOiAycHggNHB4OyBib3JkZXItcmFkaXVzOiAzcHg7IH1cbiAgICA8L3N0eWxlPlxuPC9oZWFkPlxuPGJvZHk+XG4gICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICA8aDE+UmVzZWFyY2ggUmVwb3J0OiAke3RoaXMuZXNjYXBlSHRtbChyZXBvcnQucXVlcnkpfTwvaDE+XG4gICAgICAgIDxwPjxzdHJvbmc+R2VuZXJhdGVkOjwvc3Ryb25nPiAke3JlcG9ydC5nZW5lcmF0ZWRBdC50b0xvY2FsZVN0cmluZygpfTwvcD5cbiAgICAgICAgPHA+PHN0cm9uZz5Db25maWRlbmNlOjwvc3Ryb25nPiAke3JlcG9ydC5jb25maWRlbmNlfTwvcD5cbiAgICAgICAgPHA+PHN0cm9uZz5TeW5vcHNpczo8L3N0cm9uZz4gJHt0aGlzLmVzY2FwZUh0bWwocmVwb3J0LnN5bm9wc2lzKX08L3A+XG4gICAgPC9kaXY+XG4gICAgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb25cIj5cbiAgICAgICAgPGgyPlN1bW1hcnk8L2gyPlxuICAgICAgICA8dWw+XG4gICAgICAgICAgICAke3JlcG9ydC5zdW1tYXJ5Lm1hcCgocG9pbnQpID0+IGA8bGk+JHt0aGlzLmVzY2FwZUh0bWwocG9pbnQpfTwvbGk+YCkuam9pbihcIlwiKX1cbiAgICAgICAgPC91bD5cbiAgICA8L2Rpdj5cbiAgICBcbiAgICAke1xuICAgICAgICBvcHRpb25zLmluY2x1ZGVFdmlkZW5jZSAmJiByZXBvcnQuZmluZGluZ3MubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb25cIj5cbiAgICAgICAgPGgyPktleSBGaW5kaW5nczwvaDI+XG4gICAgICAgICR7cmVwb3J0LmZpbmRpbmdzXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIChmaW5kaW5nKSA9PiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmluZGluZyAke2ZpbmRpbmcuaW1wYWN0fS1pbXBhY3RcIj5cbiAgICAgICAgICAgICAgICA8aDM+JHt0aGlzLmVzY2FwZUh0bWwoZmluZGluZy50aXRsZSl9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD48c3Ryb25nPkNhdGVnb3J5Ojwvc3Ryb25nPiAke3RoaXMuZXNjYXBlSHRtbChmaW5kaW5nLmNhdGVnb3J5KX0gfCBcbiAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkltcGFjdDo8L3N0cm9uZz4gJHtmaW5kaW5nLmltcGFjdH0gfCBcbiAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkNvbmZpZGVuY2U6PC9zdHJvbmc+ICR7ZmluZGluZy5jb25maWRlbmNlfTwvcD5cbiAgICAgICAgICAgICAgICA8cD4ke3RoaXMuZXNjYXBlSHRtbChmaW5kaW5nLmRlc2NyaXB0aW9uKX08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5qb2luKFwiXCIpfVxuICAgIDwvZGl2PlxuICAgIGBcbiAgICAgICAgICAgIDogXCJcIlxuICAgIH1cbiAgICBcbiAgICAke1xuICAgICAgICByZXBvcnQucmVjb21tZW5kYXRpb25zLmxlbmd0aCA+IDBcbiAgICAgICAgICAgID8gYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgIDxoMj5SZWNvbW1lbmRhdGlvbnM8L2gyPlxuICAgICAgICAke3JlcG9ydC5yZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgKHJlYykgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlY29tbWVuZGF0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGgzPiR7dGhpcy5lc2NhcGVIdG1sKHJlYy50aXRsZSl9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD48c3Ryb25nPlR5cGU6PC9zdHJvbmc+ICR7cmVjLnR5cGV9IHwgXG4gICAgICAgICAgICAgICAgICAgPHN0cm9uZz5Qcmlvcml0eTo8L3N0cm9uZz4gJHtyZWMucHJpb3JpdHl9IHwgXG4gICAgICAgICAgICAgICAgICAgPHN0cm9uZz5FZmZvcnQ6PC9zdHJvbmc+ICR7cmVjLmVmZm9ydH08L3A+XG4gICAgICAgICAgICAgICAgPHA+JHt0aGlzLmVzY2FwZUh0bWwocmVjLmRlc2NyaXB0aW9uKX08L3A+XG4gICAgICAgICAgICAgICAgPHA+PHN0cm9uZz5SYXRpb25hbGU6PC9zdHJvbmc+ICR7dGhpcy5lc2NhcGVIdG1sKHJlYy5yYXRpb25hbGUpfTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oXCJcIil9XG4gICAgPC9kaXY+XG4gICAgYFxuICAgICAgICAgICAgOiBcIlwiXG4gICAgfVxuICAgIFxuICAgICR7XG4gICAgICAgIHJlcG9ydC5yaXNrcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/IGBcbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICA8aDI+Umlza3M8L2gyPlxuICAgICAgICAke3JlcG9ydC5yaXNrc1xuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgICAocmlzaykgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJpc2tcIj5cbiAgICAgICAgICAgICAgICA8aDM+JHt0aGlzLmVzY2FwZUh0bWwocmlzay50aXRsZSl9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD48c3Ryb25nPlR5cGU6PC9zdHJvbmc+ICR7cmlzay50eXBlfSB8IFxuICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+U2V2ZXJpdHk6PC9zdHJvbmc+ICR7cmlzay5zZXZlcml0eX0gfCBcbiAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlByb2JhYmlsaXR5Ojwvc3Ryb25nPiAke3Jpc2sucHJvYmFiaWxpdHl9PC9wPlxuICAgICAgICAgICAgICAgIDxwPiR7dGhpcy5lc2NhcGVIdG1sKHJpc2suZGVzY3JpcHRpb24pfTwvcD5cbiAgICAgICAgICAgICAgICAke3Jpc2subWl0aWdhdGlvbiA/IGA8cD48c3Ryb25nPk1pdGlnYXRpb246PC9zdHJvbmc+ICR7dGhpcy5lc2NhcGVIdG1sKHJpc2subWl0aWdhdGlvbil9PC9wPmAgOiBcIlwifVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGAsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuam9pbihcIlwiKX1cbiAgICA8L2Rpdj5cbiAgICBgXG4gICAgICAgICAgICA6IFwiXCJcbiAgICB9XG4gICAgXG4gICAgJHtcbiAgICAgICAgb3B0aW9ucy5pbmNsdWRlTWV0YWRhdGFcbiAgICAgICAgICAgID8gYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgIDxoMj5NZXRhZGF0YTwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZXRhZGF0YVwiPlxuICAgICAgICAgICAgPHA+PHN0cm9uZz5Ub3RhbCBGaWxlczo8L3N0cm9uZz4gJHtyZXBvcnQubWV0YWRhdGEudG90YWxGaWxlc308L3A+XG4gICAgICAgICAgICA8cD48c3Ryb25nPlRvdGFsIEluc2lnaHRzOjwvc3Ryb25nPiAke3JlcG9ydC5tZXRhZGF0YS50b3RhbEluc2lnaHRzfTwvcD5cbiAgICAgICAgICAgIDxwPjxzdHJvbmc+VG90YWwgRXZpZGVuY2U6PC9zdHJvbmc+ICR7cmVwb3J0Lm1ldGFkYXRhLnRvdGFsRXZpZGVuY2V9PC9wPlxuICAgICAgICAgICAgPHA+PHN0cm9uZz5FeGVjdXRpb24gVGltZTo8L3N0cm9uZz4gJHtyZXBvcnQuZXhlY3V0aW9uVGltZX1tczwvcD5cbiAgICAgICAgICAgIDxwPjxzdHJvbmc+QWdlbnRzIFVzZWQ6PC9zdHJvbmc+ICR7cmVwb3J0LmFnZW50c1VzZWQuam9pbihcIiwgXCIpfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICAgICAgICAgICAgOiBcIlwiXG4gICAgfVxuPC9ib2R5PlxuPC9odG1sPlxuICAgIGA7XG4gICAgfVxufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQUtBO0FBMEJPLE1BQU0scUJBQWlEO0FBQUEsRUFDbEQ7QUFBQSxFQUVSLFdBQVcsQ0FBQyxRQUFhO0FBQUEsSUFDckIsS0FBSyxTQUFTO0FBQUE7QUFBQSxPQUdaLFdBQVUsQ0FDWixPQUNBLGlCQUN3QjtBQUFBLElBQ3hCLE1BQU0sWUFBWSxLQUFLLElBQUk7QUFBQSxJQUUzQixJQUFJO0FBQUEsTUFFQSxNQUFNLGNBQWMsS0FBSyxtQkFBbUIsZUFBZTtBQUFBLE1BQzNELE1BQU0sY0FBYyxLQUFLLG1CQUFtQixlQUFlO0FBQUEsTUFDM0QsTUFBTSxtQkFDRixLQUFLLHdCQUF3QixlQUFlO0FBQUEsTUFHaEQsTUFBTSxXQUFXLEtBQUssaUJBQ2xCLE9BQ0EsYUFDQSxXQUNKO0FBQUEsTUFHQSxNQUFNLFVBQVUsS0FBSyxnQkFDakIsT0FDQSxhQUNBLFdBQ0o7QUFBQSxNQUdBLE1BQU0sV0FBVyxLQUFLLHlCQUNsQixhQUNBLFdBQ0o7QUFBQSxNQUdBLE1BQU0saUJBQWlCLEtBQUssdUJBQXVCLFdBQVc7QUFBQSxNQUc5RCxNQUFNLHVCQUF1QixLQUFLLDZCQUM5QixhQUNBLGdCQUNKO0FBQUEsTUFHQSxNQUFNLGtCQUFrQixLQUFLLHdCQUN6QixVQUNBLFdBQ0o7QUFBQSxNQUdBLE1BQU0sUUFBUSxLQUFLLGNBQWMsVUFBVSxXQUFXO0FBQUEsTUFHdEQsTUFBTSxnQkFBZ0IsS0FBSyxz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LHNCQUVILEtBQUssV0FBVyxJQUFJLEtBQUs7QUFBQSw0Q0FDSCxJQUFJO0FBQUEsZ0RBQ0EsSUFBSTtBQUFBLDhDQUNOLElBQUk7QUFBQSxxQkFDN0IsS0FBSyxXQUFXLElBQUksV0FBVztBQUFBLGlEQUNILEtBQUssV0FBVyxJQUFJLFNBQVM7QUFBQTtBQUFBLFNBR2xFLEVBQ0MsS0FBSyxFQUFFO0FBQUE7QUFBQSxRQUdOO0FBQUE7QUFBQSxNQUlOLE9BQU8sTUFBTSxTQUFTLElBQ2hCO0FBQUE7QUFBQTtBQUFBLFVBR0osT0FBTyxNQUNKLElBQ0csQ0FBQyxTQUFTO0FBQUE7QUFBQSxzQkFFSixLQUFLLFdBQVcsS0FBSyxLQUFLO0FBQUEsNENBQ0osS0FBSztBQUFBLGdEQUNELEtBQUs7QUFBQSxtREFDRixLQUFLO0FBQUEscUJBQ25DLEtBQUssV0FBVyxLQUFLLFdBQVc7QUFBQSxrQkFDbkMsS0FBSyxhQUFhLG1DQUFtQyxLQUFLLFdBQVcsS0FBSyxVQUFVLFVBQVU7QUFBQTtBQUFBLFNBR3BHLEVBQ0MsS0FBSyxFQUFFO0FBQUE7QUFBQSxRQUdOO0FBQUE7QUFBQSxNQUlOLFFBQVEsa0JBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSwrQ0FJaUMsT0FBTyxTQUFTO0FBQUEsa0RBQ2IsT0FBTyxTQUFTO0FBQUEsa0RBQ2hCLE9BQU8sU0FBUztBQUFBLGtEQUNoQixPQUFPO0FBQUEsK0NBQ1YsT0FBTyxXQUFXLEtBQUssSUFBSTtBQUFBO0FBQUE7QUFBQSxRQUk1RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTWQ7IiwKICAiZGVidWdJZCI6ICIzNUY5NjkyQTRDNjc0NTRBNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
