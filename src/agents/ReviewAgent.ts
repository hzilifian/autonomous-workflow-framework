/**
 * Review Agent - Final code review and quality checks
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
import * as path from 'path';

export class ReviewAgent extends BaseAgent {
  constructor() {
    super('review', 'sonnet');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      const review = await this.performReview(input);
      await this.writeFile(path.join(input.context.worktreePath, 'review-report.md'), review);

      return { success: true, data: { review } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a Review Agent performing final quality checks.

Review:
- Code quality
- Security vulnerabilities
- Performance
- Accessibility
- ${input.projectType === 'mobile' ? 'Mobile guidelines compliance' : 'Web standards (Lighthouse score, SEO)'}
- Documentation

Provide actionable feedback.`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Review the implementation of: ${input.taskDescription}

Check all quality metrics and provide final assessment.`;
  }

  private async performReview(input: AgentInput): Promise<string> {
    const testSummary = await this.readFile(path.join(input.context.worktreePath, 'test-summary.md')).catch(() => '');
    return await this.callClaude(
      this.getSystemPrompt(input),
      `${this.getUserPrompt(input)}\n\n**Test Results:**\n${testSummary}`,
      8192
    );
  }
}
