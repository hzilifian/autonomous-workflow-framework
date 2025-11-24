"use strict";
/**
 * Workflow Orchestrator
 * Manages workflow progression through stages with CTO quality gates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowOrchestrator = void 0;
const worktree_1 = require("../worktree");
const agents_1 = require("../agents");
const uuid_1 = require("uuid");
class WorkflowOrchestrator {
    constructor(taskDescription, projectPath, config) {
        this.config = config;
        this.worktreeManager = new worktree_1.WorktreeManager(projectPath, config.worktree);
        this.ctoAgent = new agents_1.CTOAgent();
        this.state = {
            id: (0, uuid_1.v4)(),
            taskDescription,
            status: 'running',
            currentStage: 'scout',
            projectType: config.projectType,
            stages: {
                scout: this.createInitialStageState(),
                plan: this.createInitialStageState(),
                build: this.createInitialStageState(),
                test: this.createInitialStageState(),
                review: this.createInitialStageState(),
            },
            ctoReviews: [],
            worktrees: [],
            startTime: new Date(),
        };
    }
    /**
     * Execute the workflow
     */
    async execute() {
        try {
            const stages = ['scout', 'plan', 'build', 'test', 'review'];
            for (const stage of stages) {
                if (!this.config.stages[stage].enabled) {
                    continue;
                }
                let approved = false;
                while (!approved) {
                    // Execute stage
                    await this.executeStage(stage);
                    // CTO review
                    if (this.config.qualityGates.enabled) {
                        const decision = await this.ctoReview(stage);
                        if (decision === 'approve') {
                            approved = true;
                        }
                        else if (decision === 'request_revision') {
                            // Retry stage
                            this.state.stages[stage].retryCount++;
                            if (this.state.stages[stage].retryCount >= this.config.stages[stage].retryCount) {
                                throw new Error(`Max retries exceeded for ${stage} stage`);
                            }
                        }
                        else if (decision === 'reject' || decision === 'escalate') {
                            this.state.status = 'failed';
                            throw new Error(`Workflow ${decision}ed at ${stage} stage`);
                        }
                    }
                    else {
                        approved = true;
                    }
                }
            }
            this.state.status = 'completed';
            this.state.endTime = new Date();
            return this.state;
        }
        catch (error) {
            this.state.status = 'failed';
            this.state.endTime = new Date();
            throw error;
        }
        finally {
            await this.cleanup();
        }
    }
    /**
     * Execute a single stage
     */
    async executeStage(stage) {
        const stageState = this.state.stages[stage];
        stageState.status = 'running';
        stageState.startTime = new Date();
        try {
            // Create worktree
            const worktree = await this.worktreeManager.createWorktree(this.state.id, stage, `${stage}-agent`);
            stageState.worktreePath = worktree.path;
            stageState.agentId = worktree.agentId;
            this.state.worktrees.push(worktree);
            // Create agent input
            const input = {
                workflowId: this.state.id,
                stageType: stage,
                taskDescription: this.state.taskDescription,
                projectType: this.config.projectType,
                context: {
                    projectPath: worktree.path,
                    worktreePath: worktree.path,
                    projectType: this.config.projectType,
                },
                previousStageOutput: this.getPreviousStageOutput(stage),
                config: this.config,
            };
            // Execute agent
            const agent = this.getAgent(stage);
            const output = await agent.execute(input);
            if (!output.success) {
                throw new Error(output.error || `${stage} stage failed`);
            }
            stageState.output = output.data;
            stageState.status = 'completed';
            stageState.endTime = new Date();
        }
        catch (error) {
            stageState.status = 'failed';
            stageState.endTime = new Date();
            throw error;
        }
    }
    /**
     * CTO review of stage output
     */
    async ctoReview(stage) {
        const stageState = this.state.stages[stage];
        const input = {
            workflowId: this.state.id,
            stageType: stage,
            taskDescription: this.state.taskDescription,
            projectType: this.config.projectType,
            context: {
                projectPath: stageState.worktreePath || '',
                worktreePath: stageState.worktreePath || '',
                projectType: this.config.projectType,
            },
            config: this.config,
        };
        const review = await this.ctoAgent.executereview(stageState.output, input);
        stageState.ctoReview = review;
        this.state.ctoReviews.push(review);
        if (review.decision === 'request_revision') {
            stageState.status = 'revision_requested';
        }
        return review.decision;
    }
    /**
     * Get agent for stage
     */
    getAgent(stage) {
        switch (stage) {
            case 'scout':
                return new agents_1.ScoutAgent();
            case 'plan':
                return new agents_1.PlanAgent();
            case 'build':
                return new agents_1.BuildAgent();
            case 'test':
                return new agents_1.TestAgent();
            case 'review':
                return new agents_1.ReviewAgent();
            default:
                throw new Error(`Unknown stage: ${stage}`);
        }
    }
    /**
     * Get previous stage output
     */
    getPreviousStageOutput(stage) {
        const stageOrder = ['scout', 'plan', 'build', 'test', 'review'];
        const currentIndex = stageOrder.indexOf(stage);
        if (currentIndex > 0) {
            const previousStage = stageOrder[currentIndex - 1];
            return this.state.stages[previousStage].output;
        }
        return null;
    }
    /**
     * Create initial stage state
     */
    createInitialStageState() {
        return {
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
        };
    }
    /**
     * Cleanup worktrees
     */
    async cleanup() {
        await this.worktreeManager.shutdown();
    }
    /**
     * Get current workflow state
     */
    getState() {
        return this.state;
    }
}
exports.WorkflowOrchestrator = WorkflowOrchestrator;
