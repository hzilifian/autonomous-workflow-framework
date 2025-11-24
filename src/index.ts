/**
 * Autonomous Workflow Framework
 * Main entry point
 */

export * from './types';
export * from './agents';
export * from './orchestrator';
export * from './worktree';
export * from './config/presets';

import { WorkflowOrchestrator } from './orchestrator';
import { FrameworkConfig } from './types';
import { defaultConfig, mobilePreset, webPreset } from './config/presets';

/**
 * Create and execute a workflow
 */
export async function createWorkflow(options: {
  taskDescription: string;
  projectPath: string;
  projectType?: 'mobile' | 'web';
  config?: Partial<FrameworkConfig>;
}) {
  const { taskDescription, projectPath, projectType = 'web', config = {} } = options;

  const preset = projectType === 'mobile' ? mobilePreset : webPreset;
  const finalConfig: FrameworkConfig = {
    ...defaultConfig,
    ...preset,
    ...config,
    projectType,
  } as FrameworkConfig;

  const orchestrator = new WorkflowOrchestrator(taskDescription, projectPath, finalConfig);

  return {
    execute: () => orchestrator.execute(),
    getState: () => orchestrator.getState(),
  };
}

/**
 * Quick start for web projects
 */
export async function webWorkflow(taskDescription: string, projectPath: string) {
  return createWorkflow({ taskDescription, projectPath, projectType: 'web' });
}

/**
 * Quick start for mobile projects
 */
export async function mobileWorkflow(taskDescription: string, projectPath: string) {
  return createWorkflow({ taskDescription, projectPath, projectType: 'mobile' });
}
