/**
 * Communication System for Agent Coordination
 *
 * Provides chatroom-style messaging between agents for collaboration,
 * handoff coordination, and real-time status updates.
 */
import { EventEmitter } from "node:events";
import type { MemoryManager } from "../context/memory";
import type { AgentType } from "./types";
export interface AgentMessage {
    id: string;
    from: AgentType;
    to: AgentType | "broadcast";
    type: "status" | "request" | "response" | "handoff" | "notification" | "collaboration";
    content: unknown;
    timestamp: Date;
    correlationId?: string;
    priority: "low" | "medium" | "high" | "urgent";
}
export interface CommunicationChannel {
    id: string;
    participants: AgentType[];
    topic: string;
    messages: AgentMessage[];
    created: Date;
    active: boolean;
}
export interface HandoffRequest {
    id: string;
    fromAgent: AgentType;
    toAgent: AgentType;
    context: Record<string, any>;
    reason: string;
    priority: "low" | "medium" | "high" | "urgent";
    timestamp: Date;
}
export interface CollaborationSession {
    id: string;
    taskId: string;
    participants: AgentType[];
    status: "active" | "completed" | "failed";
    startTime: Date;
    endTime?: Date;
    messages: AgentMessage[];
    outcome?: unknown;
}
/**
 * Agent Communication Hub
 * Manages inter-agent messaging, handoffs, and collaboration sessions
 */
export declare class AgentCommunicationHub extends EventEmitter {
    private channels;
    private activeSessions;
    private pendingHandoffs;
    private memoryManager;
    private messageHistory;
    constructor(memoryManager: MemoryManager);
    /**
     * Send a message between agents
     */
    sendMessage(message: Omit<AgentMessage, "id" | "timestamp">): Promise<string>;
    /**
     * Create a collaboration session for multi-agent tasks
     */
    createCollaborationSession(taskId: string, participants: AgentType[], topic: string): Promise<string>;
    /**
     * Request a handoff between agents
     */
    requestHandoff(request: Omit<HandoffRequest, "id" | "timestamp">): Promise<string>;
    /**
     * Accept a handoff request
     */
    acceptHandoff(handoffId: string, acceptingAgent: AgentType): Promise<void>;
    /**
     * Complete a collaboration session
     */
    completeSession(sessionId: string, outcome?: any): Promise<void>;
    /**
     * Get messages for an agent
     */
    getAgentMessages(agent: AgentType, limit?: number): AgentMessage[];
    /**
     * Get active collaboration sessions
     */
    getActiveSessions(): CollaborationSession[];
    /**
     * Get pending handoffs for an agent
     */
    getPendingHandoffs(agent: AgentType): HandoffRequest[];
    private createChannel;
    private broadcastMessage;
    private deliverMessage;
    private addMessageToChannels;
    private storeMessage;
    private setupEventHandlers;
    /**
     * Get communication statistics
     */
    getStats(): {
        totalMessages: number;
        activeSessions: number;
        pendingHandoffs: number;
        activeChannels: number;
    };
}
export declare function getAgentCommunicationHub(memoryManager?: MemoryManager): AgentCommunicationHub;
