/**
 * Plan Agent - Creates detailed implementation plan
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
export declare class PlanAgent extends BaseAgent {
    constructor();
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private readScoutReport;
    private generatePlan;
    private savePlan;
}
