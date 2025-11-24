/**
 * Build Agent - Implements the planned changes
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
export declare class BuildAgent extends BaseAgent {
    constructor();
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private implementChanges;
    private applyChanges;
    private saveSum;
}
