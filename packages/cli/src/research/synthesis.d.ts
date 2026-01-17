/**
 * Synthesis phase handlers for research orchestration.
 * Generates comprehensive research reports with analysis results.
 */
import { type AnalysisResult, type ResearchExportOptions, type ResearchQuery, type SynthesisHandler, type SynthesisReport } from "./types";
/**
 * Synthesis Handler
 * Generates comprehensive research reports from analysis results
 */
export declare class SynthesisHandlerImpl implements SynthesisHandler {
    private config;
    constructor(config: any);
    synthesize(query: ResearchQuery, analysisResults: AnalysisResult[]): Promise<SynthesisReport>;
    private collectAllInsights;
    private collectAllEvidence;
    private collectAllRelationships;
    private generateSynopsis;
    private generateSummary;
    private generateDetailedFindings;
    private generateCodeReferences;
    private generateCodeDescription;
    private generateArchitectureInsights;
    private mapInsightTypeToArchType;
    private extractComponentsFromInsight;
    private extractComponentsFromRelationships;
    private generateRecommendations;
    private estimateEffort;
    private generateRisks;
    private mapCategoryToRiskType;
    private assessRiskProbability;
    private generateMitigation;
    private generateOpenQuestions;
    private calculateOverallConfidence;
    private confidenceToNumber;
    private groupInsightsByCategory;
    private groupEvidenceByFile;
    private countUniqueFiles;
    /**
     * Export research report to specified format
     */
    exportReport(report: SynthesisReport, options: ResearchExportOptions): Promise<string>;
    private exportToMarkdown;
    private generateMarkdownContent;
    private exportToJSON;
    private exportToHTML;
    private escapeHtml;
    private generateHTMLContent;
}
