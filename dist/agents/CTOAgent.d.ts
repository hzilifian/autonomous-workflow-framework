/**
 * CTO Agent - Quality gate keeper
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput, CTOReview } from '../types';
export declare class CTOAgent extends BaseAgent {
    constructor();
    executereview(stageOutput: any, input: AgentInput): Promise<CTOReview>;
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private performReview;
    private parseReview;
}
