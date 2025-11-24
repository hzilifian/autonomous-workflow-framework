"use strict";
/**
 * CTO Agent - Quality gate keeper
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTOAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
class CTOAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('scout', 'opus'); // Use Opus for critical review
    }
    async executereview(stageOutput, input) {
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
    async execute(input) {
        // CTO agent doesn't use standard execute
        throw new Error('Use reviewStage method');
    }
    getSystemPrompt(input) {
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
    getUserPrompt(input) {
        return `Review ${input.stageType} stage output for: ${input.taskDescription}

Provide decision, score, feedback, and list issues by severity.`;
    }
    async performReview(stageOutput, input) {
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
    parseReview(review) {
        try {
            const parsed = this.parseJSON(review);
            return {
                decision: parsed.decision,
                score: parsed.score,
                feedback: parsed.feedback,
                issues: parsed.issues || [],
            };
        }
        catch {
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
exports.CTOAgent = CTOAgent;
