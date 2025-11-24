/**
 * Review Agent - Final code review and quality checks
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
export declare class ReviewAgent extends BaseAgent {
    constructor();
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private performReview;
}
