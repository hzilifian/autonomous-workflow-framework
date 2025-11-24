/**
 * Worktree Manager for parallel agent execution
 *
 * Manages git worktrees to enable parallel agent execution in isolated environments
 * with automatic cleanup on completion or timeout.
 */
import { WorktreeInfo, StageType, WorktreeConfig } from '../types';
export declare class WorktreeManager {
    private worktrees;
    private cleanupTimers;
    private config;
    private projectPath;
    constructor(projectPath: string, config: WorktreeConfig);
    /**
     * Create a new worktree for an agent
     */
    createWorktree(workflowId: string, stageType: StageType, agentId: string): Promise<WorktreeInfo>;
    /**
     * Remove a worktree and clean up
     */
    removeWorktree(worktreeId: string): Promise<void>;
    /**
     * Get worktree info
     */
    getWorktree(worktreeId: string): WorktreeInfo | undefined;
    /**
     * Get all worktrees
     */
    getAllWorktrees(): WorktreeInfo[];
    /**
     * Get active worktrees
     */
    getActiveWorktrees(): WorktreeInfo[];
    /**
     * Schedule automatic cleanup for a worktree
     */
    private scheduleCleanup;
    /**
     * Save logs and outputs before cleanup
     */
    private saveLogs;
    /**
     * Clean up all worktrees (emergency cleanup)
     */
    cleanupAll(): Promise<void>;
    /**
     * Daily cleanup job - removes old worktrees
     */
    pruneOldWorktrees(): Promise<void>;
    /**
     * Get worktree utilization metrics
     */
    getUtilization(): {
        active: number;
        total: number;
        utilizationRate: number;
    };
    /**
     * Check if a worktree exists on filesystem
     */
    worktreeExists(worktreeId: string): Promise<boolean>;
    /**
     * Shutdown - cleanup all resources
     */
    shutdown(): Promise<void>;
}
