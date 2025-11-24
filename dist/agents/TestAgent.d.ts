/**
 * Test Agent - Generates and runs tests
 */
import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
export declare class TestAgent extends BaseAgent {
    constructor();
    execute(input: AgentInput): Promise<AgentOutput>;
    protected getSystemPrompt(input: AgentInput): string;
    protected getUserPrompt(input: AgentInput): string;
    private generateTests;
    private writeTestFiles;
    private runTests;
    private saveResults;
}
