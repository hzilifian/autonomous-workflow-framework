/**
 * Core type definitions for the Autonomous Workflow Framework
 */
export type StageType = 'scout' | 'plan' | 'build' | 'test' | 'review';
export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'revision_requested';
export type WorkflowStatus = 'running' | 'paused' | 'completed' | 'failed';
export type CTODecision = 'approve' | 'request_revision' | 'escalate' | 'reject';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion';
export type ProjectType = 'mobile' | 'web';
export type MobilePlatform = 'ios' | 'android' | 'both';
export type MobileFramework = 'react-native' | 'flutter' | 'native';
export type WebBuildTool = 'vite' | 'webpack' | 'turbopack';
export type WebStyling = 'tailwind' | 'css-modules' | 'styled-components';
export type WebUIFramework = 'shadcn' | 'mui' | 'chakra' | 'custom';
export type WebBackend = 'supabase' | 'firebase' | 'custom';
export type AccessibilityLevel = 'wcag-a' | 'wcag-aa' | 'wcag-aaa';
export type ModelPreference = 'opus' | 'sonnet' | 'haiku';
export interface WorkflowState {
    id: string;
    taskDescription: string;
    status: WorkflowStatus;
    currentStage: StageType;
    projectType: ProjectType;
    stages: {
        scout: StageState;
        plan: StageState;
        build: StageState;
        test: StageState;
        review: StageState;
    };
    ctoReviews: CTOReview[];
    worktrees: WorktreeInfo[];
    startTime: Date;
    endTime?: Date;
    metadata?: Record<string, any>;
}
export interface StageState {
    status: StageStatus;
    agentId?: string;
    worktreePath?: string;
    output?: any;
    ctoReview?: CTOReview;
    startTime?: Date;
    endTime?: Date;
    retryCount: number;
    maxRetries: number;
}
export interface CTOReview {
    stageType: StageType;
    decision: CTODecision;
    score: number;
    feedback: string;
    issues: Issue[];
    timestamp: Date;
    reviewDuration?: number;
}
export interface Issue {
    severity: IssueSeverity;
    category: string;
    description: string;
    location?: string;
    recommendation: string;
}
export interface WorktreeInfo {
    id: string;
    stageType: StageType;
    path: string;
    createdAt: Date;
    status: 'active' | 'cleaning' | 'cleaned';
    agentId?: string;
}
export interface FrameworkConfig {
    projectType: ProjectType;
    worktree: WorktreeConfig;
    cto: CTOConfig;
    stages: StagesConfig;
    mobile?: MobileConfig;
    web?: WebConfig;
    qualityGates: QualityGatesConfig;
}
export interface WorktreeConfig {
    baseDir: string;
    autoCleanup: boolean;
    cleanupTimeout: number;
    maxConcurrent: number;
}
export interface CTOConfig {
    strictMode: boolean;
    autoApproveThreshold: number;
    requireExplicitApproval: boolean;
}
export interface StagesConfig {
    scout: StageConfig;
    plan: StageConfig;
    build: StageConfig;
    test: StageConfig;
    review: StageConfig;
}
export interface StageConfig {
    enabled: boolean;
    timeout: number;
    retryCount: number;
    parallel: boolean;
    modelPreference: ModelPreference;
}
export interface MobileConfig {
    platform: MobilePlatform;
    framework: MobileFramework;
    minCoverage: number;
    performanceBudget: PerformanceBudget;
}
export interface WebConfig {
    buildTool: WebBuildTool;
    styling: WebStyling;
    uiFramework: WebUIFramework;
    backend: WebBackend;
    minCoverage: number;
    performanceBudget: WebPerformanceBudget;
    seo: boolean;
    accessibility: AccessibilityLevel;
}
export interface QualityGatesConfig {
    enabled: boolean;
    requiredScore: number;
    criticalIssueBlock: boolean;
}
export interface PerformanceBudget {
    bundleSize: number;
    timeToInteractive: number;
    memoryUsage: number;
    apiCallLimit: number;
}
export interface WebPerformanceBudget {
    bundleSize: number;
    lighthouseScore: number;
    lcp: number;
    fid: number;
    cls: number;
    tti: number;
}
export interface AgentInput {
    workflowId: string;
    stageType: StageType;
    taskDescription: string;
    projectType: ProjectType;
    context: AgentContext;
    previousStageOutput?: any;
    config: FrameworkConfig;
}
export interface AgentContext {
    projectPath: string;
    worktreePath: string;
    projectType: ProjectType;
    existingFiles?: string[];
    dependencies?: Record<string, string>;
    framework?: string;
}
export interface AgentOutput {
    success: boolean;
    data?: any;
    error?: string;
    files?: FileChange[];
    metadata?: Record<string, any>;
}
export interface FileChange {
    path: string;
    action: 'create' | 'modify' | 'delete';
    content?: string;
}
export interface Metrics {
    workflow: {
        successRate: number;
        averageDuration: number;
        stageSuccessRates: Record<StageType, number>;
    };
    cto: {
        approvalRate: number;
        revisionRate: number;
        averageReviewTime: number;
    };
    quality: {
        averageCodeCoverage: number;
        securityIssuesFound: number;
        performanceScore: number;
    };
    efficiency: {
        parallelExecutionRate: number;
        worktreeUtilization: number;
    };
}
