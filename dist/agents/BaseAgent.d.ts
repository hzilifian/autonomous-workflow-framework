/**
 * Base Agent class
 *
 * Provides common functionality for all agents
 */
import Anthropic from '@anthropic-ai/sdk';
import { AgentInput, AgentOutput, StageType, ModelPreference } from '../types';
export declare abstract class BaseAgent {
    protected client: Anthropic;
    protected stageType: StageType;
    protected modelPreference: ModelPreference;
    constructor(stageType: StageType, modelPreference?: ModelPreference);
    /**
     * Get the Claude model ID based on preference
     */
    protected getModel(): string;
    /**
     * Execute the agent
     */
    abstract execute(input: AgentInput): Promise<AgentOutput>;
    /**
     * Build system prompt for the agent
     */
    protected abstract getSystemPrompt(input: AgentInput): string;
    /**
     * Build user prompt for the agent
     */
    protected abstract getUserPrompt(input: AgentInput): string;
    /**
     * Call Claude API
     */
    protected callClaude(systemPrompt: string, userPrompt: string, maxTokens?: number): Promise<string>;
    /**
     * Parse JSON from Claude response
     */
    protected parseJSON<T>(text: string): T;
    /**
     * Read file from worktree
     */
    protected readFile(filePath: string): Promise<string>;
    /**
     * Write file to worktree
     */
    protected writeFile(filePath: string, content: string): Promise<void>;
    /**
     * List files in directory
     */
    protected listFiles(dirPath: string, recursive?: boolean): Promise<string[]>;
    /**
     * Execute shell command in worktree
     */
    protected executeCommand(command: string, cwd: string): Promise<{
        stdout: string;
        stderr: string;
    }>;
}
