/**
 * CTO Agent - Quality gate keeper
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput, CTOReview, CTODecision, Issue } from '../types';

export class CTOAgent extends BaseAgent {
  constructor() {
    super('scout', 'opus'); // Use Opus for critical review
  }

  async executereview(
    stageOutput: any,
    input: AgentInput
  ): Promise<CTOReview> {
    const startTime = Date.now();

    const review = await this.performReview(stageOutput, input);
    const parsed = this.parseReview(review);

    return {
      stageType: input.stageType,
      decision: parsed.decision,
      score: parsed.score,
      feedback: parsed.feedback,
      issues: parsed.issues,
      timestamp: new Date(),
      reviewDuration: Date.now() - startTime,
    };
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    // CTO agent doesn't use standard execute
    throw new Error('Use reviewStage method');
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a CTO Agent ensuring quality and preventing technical debt.

Review Criteria:
- No technical debt (hardcoded values, TODOs without tickets, duplicated code)
- Performance optimized
- Security best practices
- Reliability (error handling, retry logic)
- Architecture soundness (SOLID, separation of concerns)
- Cost optimization

Decision options:
- APPROVE: Continue to next stage
- REQUEST_REVISION: Send back with specific feedback
- ESCALATE: Flag for human review
- REJECT: Stop workflow

Be strict but constructive. Score 0-100.`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Review ${input.stageType} stage output for: ${input.taskDescription}

Provide decision, score, feedback, and list issues by severity.`;
  }

  private async performReview(stageOutput: any, input: AgentInput): Promise<string> {
    const prompt = `${this.getUserPrompt(input)}

**Stage Output:**
${JSON.stringify(stageOutput, null, 2)}

Respond in JSON:
{
  "decision": "approve|request_revision|escalate|reject",
  "score": 85,
  "feedback": "...",
  "issues": [
    {
      "severity": "critical|major|minor|suggestion",
      "category": "technical_debt|performance|security|...",
      "description": "...",
      "location": "file:line",
      "recommendation": "..."
    }
  ]
}`;

    return await this.callClaude(this.getSystemPrompt(input), prompt, 4096);
  }

  private parseReview(review: string): {
    decision: CTODecision;
    score: number;
    feedback: string;
    issues: Issue[];
  } {
    try {
      const parsed = this.parseJSON<{
        decision: string;
        score: number;
        feedback: string;
        issues: Issue[];
      }>(review);

      return {
        decision: parsed.decision as CTODecision,
        score: parsed.score,
        feedback: parsed.feedback,
        issues: parsed.issues || [],
      };
    } catch {
      // Fallback if parsing fails
      return {
        decision: 'escalate',
        score: 0,
        feedback: 'Failed to parse CTO review',
        issues: [],
      };
    }
  }
}
