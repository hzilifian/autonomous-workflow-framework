/**
 * Base Agent class
 *
 * Provides common functionality for all agents
 */

import Anthropic from '@anthropic-ai/sdk';
import { AgentInput, AgentOutput, StageType, ModelPreference } from '../types';

export abstract class BaseAgent {
  protected client: Anthropic;
  protected stageType: StageType;
  protected modelPreference: ModelPreference;

  constructor(stageType: StageType, modelPreference: ModelPreference = 'sonnet') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.stageType = stageType;
    this.modelPreference = modelPreference;
  }

  /**
   * Get the Claude model ID based on preference
   */
  protected getModel(): string {
    const models = {
      opus: 'claude-opus-4-20250514',
      sonnet: 'claude-sonnet-4-5-20250929',
      haiku: 'claude-3-5-haiku-20241022',
    };

    return models[this.modelPreference];
  }

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
  protected async callClaude(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number = 4096
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.getModel(),
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response type from Claude');
    } catch (error) {
      throw new Error(
        `Claude API call failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse JSON from Claude response
   */
  protected parseJSON<T>(text: string): T {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Read file from worktree
   */
  protected async readFile(filePath: string): Promise<string> {
    const fs = await import('fs/promises');
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Write file to worktree
   */
  protected async writeFile(filePath: string, content: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * List files in directory
   */
  protected async listFiles(
    dirPath: string,
    recursive: boolean = false
  ): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const files: string[] = [];

    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules, .git, etc.
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name.startsWith('.')
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          if (recursive) {
            await scan(fullPath);
          }
        } else {
          files.push(fullPath);
        }
      }
    }

    await scan(dirPath);
    return files;
  }

  /**
   * Execute shell command in worktree
   */
  protected async executeCommand(
    command: string,
    cwd: string
  ): Promise<{ stdout: string; stderr: string }> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      return await execAsync(command, { cwd });
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
      };
    }
  }
}
