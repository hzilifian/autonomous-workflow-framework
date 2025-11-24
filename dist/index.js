"use strict";
/**
 * Autonomous Workflow Framework
 * Main entry point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflow = createWorkflow;
exports.webWorkflow = webWorkflow;
exports.mobileWorkflow = mobileWorkflow;
__exportStar(require("./types"), exports);
__exportStar(require("./agents"), exports);
__exportStar(require("./orchestrator"), exports);
__exportStar(require("./worktree"), exports);
__exportStar(require("./config/presets"), exports);
const orchestrator_1 = require("./orchestrator");
const presets_1 = require("./config/presets");
/**
 * Create and execute a workflow
 */
async function createWorkflow(options) {
    const { taskDescription, projectPath, projectType = 'web', config = {} } = options;
    const preset = projectType === 'mobile' ? presets_1.mobilePreset : presets_1.webPreset;
    const finalConfig = {
        ...presets_1.defaultConfig,
        ...preset,
        ...config,
        projectType,
    };
    const orchestrator = new orchestrator_1.WorkflowOrchestrator(taskDescription, projectPath, finalConfig);
    return {
        execute: () => orchestrator.execute(),
        getState: () => orchestrator.getState(),
    };
}
/**
 * Quick start for web projects
 */
async function webWorkflow(taskDescription, projectPath) {
    return createWorkflow({ taskDescription, projectPath, projectType: 'web' });
}
/**
 * Quick start for mobile projects
 */
async function mobileWorkflow(taskDescription, projectPath) {
    return createWorkflow({ taskDescription, projectPath, projectType: 'mobile' });
}
