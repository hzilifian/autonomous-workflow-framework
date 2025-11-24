/**
 * Scout Agent
 *
 * Explores and analyzes the codebase, dependencies, and architecture
 * Generates context for subsequent stages
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
export declare class ScoutAgent extends BaseAgent {
    constructor();
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private gatherProjectInfo;
    private detectFramework;
    private detectPatterns;
    private findRelevantFiles;
    private analyzeCodebase;
    private saveReport;
}
