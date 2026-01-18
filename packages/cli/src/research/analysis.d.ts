/**
 * Analysis phase handlers for research orchestration.
 * Implements sequential analysis with 2 specialized agents.
 */
import { type AnalysisAgent, type AnalysisConfig, type AnalysisResult, type DiscoveryResult, type Evidence, type Insight, type Relationship, type ResearchQuery } from "./types";
/**
 * Codebase Analyzer Agent
 * Analyzes code files for insights and relationships
 */
export declare class CodebaseAnalyzer implements AnalysisAgent {
    private config;
    constructor(config?: AnalysisConfig);
    analyze(discoveryResults: DiscoveryResult[], context?: Record<string, unknown>): Promise<AnalysisResult>;
    private collectAllFiles;
    private extractEvidence;
    private analyzeFileForEvidence;
    private getSnippet;
    private assessEvidenceConfidence;
    private generateInsights;
    private groupEvidenceByType;
    private groupEvidenceByFile;
    private generatePatternInsights;
    private generateFileInsights;
    private generateArchitecturalInsights;
    private analyzeImportSources;
    private identifyRelationships;
    private calculateOverallConfidence;
    private confidenceToNumber;
}
/**
 * Research Analyzer Agent
 * Analyzes documentation and patterns for insights
 */
export declare class ResearchAnalyzer implements AnalysisAgent {
    private config;
    constructor(config?: AnalysisConfig);
    analyze(discoveryResults: DiscoveryResult[], context?: Record<string, unknown>): Promise<AnalysisResult>;
    private collectAllDocumentation;
    private extractDocumentationEvidence;
    private analyzeDocumentationForEvidence;
    private analyzePatterns;
    private generateDocumentationInsights;
    private groupEvidenceByFile;
    private generateDocumentationQualityInsights;
    private generatePatternAnalysisInsights;
    private generateCompletenessInsights;
    private identifyDocumentationRelationships;
    private groupInsightsByCategory;
    private calculateOverallConfidence;
    private confidenceToNumber;
}
/**
 * Analysis Handler
 * Coordinates sequential analysis with both analyzers
 */
export declare class AnalysisHandler {
    private codebaseAnalyzer;
    private researchAnalyzer;
    private config;
    constructor(config?: AnalysisConfig);
    executeAnalysis(discoveryResults: DiscoveryResult[], query?: ResearchQuery): Promise<{
        codebaseAnalysis: AnalysisResult;
        researchAnalysis: AnalysisResult;
        combinedInsights: Insight[];
        combinedEvidence: Evidence[];
        combinedRelationships: Relationship[];
    }>;
    getAnalysisMetrics(results: {
        codebaseAnalysis: AnalysisResult;
        researchAnalysis: AnalysisResult;
        combinedInsights: Insight[];
        combinedEvidence: Evidence[];
        combinedRelationships: Relationship[];
    }): {
        totalInsights: number;
        totalEvidence: number;
        totalRelationships: number;
        averageConfidence: number;
        executionTime: number;
    };
    private calculateAverageConfidence;
    private confidenceToNumber;
}
