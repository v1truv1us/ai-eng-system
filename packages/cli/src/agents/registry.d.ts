/**
 * AgentRegistry - Loads and manages agent definitions from .claude-plugin/
 *
 * Key responsibilities:
 * 1. Parse agent markdown files with frontmatter
 * 2. Extract capabilities from description and tags
 * 3. Map intended_followups to handoff relationships
 * 4. Provide capability-based queries
 */
import { type AgentDefinition, AgentType } from "./types";
export declare class AgentRegistry {
    private agents;
    private capabilityIndex;
    private handoffGraph;
    loadFromDirectory(dir: string): Promise<void>;
    private parseAgentMarkdown;
    private parseFrontmatter;
    private parseValue;
    private extractCapabilities;
    private parseHandoffs;
    private normalizeAgentType;
    private indexCapabilities;
    private indexHandoffs;
    get(type: AgentType): AgentDefinition | undefined;
    getAllAgents(): AgentDefinition[];
    findByCapability(capability: string): AgentType[];
    findByCapabilities(capabilities: string[], minMatch?: number): AgentType[];
    getHandoffs(type: AgentType): AgentType[];
    isHandoffAllowed(from: AgentType, to: AgentType): boolean;
    getCapabilitySummary(): Record<string, number>;
}
