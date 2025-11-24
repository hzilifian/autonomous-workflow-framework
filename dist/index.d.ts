/**
 * Autonomous Workflow Framework
 * Main entry point
 */
export * from './types';
export * from './agents';
export * from './orchestrator';
export * from './worktree';
export * from './config/presets';
import { FrameworkConfig } from './types';
/**
 * Create and execute a workflow
 */
export declare function createWorkflow(options: {
    taskDescription: string;
    projectPath: string;
    projectType?: 'mobile' | 'web';
    config?: Partial<FrameworkConfig>;
}): Promise<{
    execute: () => Promise<import("./types").WorkflowState>;
    getState: () => import("./types").WorkflowState;
}>;
/**
 * Quick start for web projects
 */
export declare function webWorkflow(taskDescription: string, projectPath: string): Promise<{
    execute: () => Promise<import("./types").WorkflowState>;
    getState: () => import("./types").WorkflowState;
}>;
/**
 * Quick start for mobile projects
 */
export declare function mobileWorkflow(taskDescription: string, projectPath: string): Promise<{
    execute: () => Promise<import("./types").WorkflowState>;
    getState: () => import("./types").WorkflowState;
}>;
