/**
 * Discovery phase handlers for research orchestration.
 * Implements parallel discovery with 3 specialized agents.
 */
import { type DiscoveryAgent, type DiscoveryResult, type ResearchQuery } from "./types";
/**
 * Codebase Locator Agent
 * Finds relevant files and directories in the codebase
 */
export declare class CodebaseLocator implements DiscoveryAgent {
    private config;
    constructor(config: any);
    discover(query: ResearchQuery): Promise<DiscoveryResult>;
    private parseQueryToPatterns;
    private findFiles;
    private scoreRelevance;
    private extractSnippets;
    private detectLanguage;
    private isSourceCode;
    private meetsConstraints;
    private calculateConfidence;
}
/**
 * Research Locator Agent
 * Finds documentation, decisions, and notes
 */
export declare class ResearchLocator implements DiscoveryAgent {
    private config;
    constructor(config: any);
    discover(query: ResearchQuery): Promise<DiscoveryResult>;
    private findDocumentation;
    private indexDocuments;
    private searchIndex;
    private detectDocType;
    private meetsDocConstraints;
    private calculateConfidence;
}
/**
 * Pattern Finder Agent
 * Identifies recurring implementation patterns
 */
export declare class PatternFinder implements DiscoveryAgent {
    private config;
    constructor(config: any);
    discover(query: ResearchQuery): Promise<DiscoveryResult>;
    private identifyPatterns;
    private findSimilarCode;
    private containsPattern;
    private analyzeUsage;
    private categorizePattern;
    private calculatePatternConfidence;
    private detectLanguage;
    private calculateConfidence;
}
/**
 * Discovery Handler
 * Coordinates parallel execution of all discovery agents
 */
export declare class DiscoveryHandler {
    private config;
    private locators;
    constructor(config: any);
    discover(query: ResearchQuery): Promise<DiscoveryResult[]>;
    private executeWithTimeout;
    private deduplicateResults;
}
