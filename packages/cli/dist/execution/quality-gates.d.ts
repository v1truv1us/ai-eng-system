/**
 * Quality gates runner for the Ferg Engineering System.
 * Executes quality gates in sequence with proper error handling and reporting.
 */
import { type ExecutionOptions, type QualityGateConfig, type QualityGateResult, type Task } from "./types";
export declare class QualityGateRunner {
    private taskExecutor;
    private options;
    constructor(options?: ExecutionOptions);
    /**
     * Execute all quality gates for a plan
     */
    executeQualityGates(gates: QualityGateConfig[]): Promise<QualityGateResult[]>;
    /**
     * Execute a single quality gate
     */
    executeQualityGate(gate: QualityGateConfig): Promise<QualityGateResult>;
    /**
     * Get default quality gates configuration
     */
    static getDefaultGates(): QualityGateConfig[];
    /**
     * Create quality gates from tasks in a plan
     */
    static createGatesFromTasks(tasks: Task[]): QualityGateConfig[];
    private sortGatesByPriority;
    private createTaskFromGate;
    private mapGateTypeToTaskType;
    private static mapTaskTypeToGateType;
    private getDefaultCommandForGate;
    private getDefaultTimeoutForGate;
    private evaluateGateResult;
    private evaluateTestGate;
    private evaluateBuildGate;
    private evaluateLintGate;
    private createResultMessage;
    private static isQualityGateTask;
    private log;
}
