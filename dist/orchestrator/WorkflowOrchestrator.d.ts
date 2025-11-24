/**
 * Workflow Orchestrator
 * Manages workflow progression through stages with CTO quality gates
 */
import { WorkflowState, FrameworkConfig } from '../types';
export declare class WorkflowOrchestrator {
    private state;
    private config;
    private worktreeManager;
    private ctoAgent;
    constructor(taskDescription: string, projectPath: string, config: FrameworkConfig);
    /**
     * Execute the workflow
     */
    execute(): Promise<WorkflowState>;
    /**
     * Execute a single stage
     */
    private executeStage;
    /**
     * CTO review of stage output
     */
    private ctoReview;
    /**
     * Get agent for stage
     */
    private getAgent;
    /**
     * Get previous stage output
     */
    private getPreviousStageOutput;
    /**
     * Create initial stage state
     */
    private createInitialStageState;
    /**
     * Cleanup worktrees
     */
    private cleanup;
    /**
     * Get current workflow state
     */
    getState(): WorkflowState;
}
