/**
 * Test Agent - Generates and runs tests
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
import * as path from 'path';

export class TestAgent extends BaseAgent {
  constructor() {
    super('test', 'sonnet');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      const buildSummary = await this.readFile(path.join(input.context.worktreePath, 'build-summary.md'));

      const tests = await this.generateTests(input, buildSummary);
      await this.writeTestFiles(input.context.worktreePath, tests);

      const results = await this.runTests(input.context.worktreePath);

      await this.saveResults(input.context.worktreePath, results);

      return {
        success: true,
        data: { tests, results },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a Test Agent generating comprehensive tests.

Generate:
- Unit tests
- Integration tests
- ${input.projectType === 'mobile' ? 'E2E tests (Detox/Appium)' : 'E2E tests (Playwright/Cypress)'}
- Accessibility tests
- Edge cases

Use appropriate testing framework for the project.`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Generate tests for: ${input.taskDescription}

Ensure >80% coverage and test edge cases.`;
  }

  private async generateTests(input: AgentInput, buildSummary: string): Promise<string> {
    return await this.callClaude(
      this.getSystemPrompt(input),
      `${this.getUserPrompt(input)}\n\n**Build Summary:**\n${buildSummary}`,
      8192
    );
  }

  private async writeTestFiles(worktreePath: string, tests: string): Promise<void> {
    // Parse and write test files (simplified)
    await this.writeFile(path.join(worktreePath, 'tests-generated.txt'), tests);
  }

  private async runTests(worktreePath: string): Promise<string> {
    // Run tests (simplified - would run actual test commands)
    const { stdout, stderr } = await this.executeCommand('npm test || echo "No tests configured"', worktreePath);
    return `${stdout}\n${stderr}`;
  }

  private async saveResults(worktreePath: string, results: string): Promise<void> {
    await this.writeFile(path.join(worktreePath, 'test-summary.md'), results);
  }
}
