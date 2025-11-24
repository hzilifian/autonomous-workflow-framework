/**
 * Plan Agent - Creates detailed implementation plan
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput } from '../types';
import * as path from 'path';

export class PlanAgent extends BaseAgent {
  constructor() {
    super('plan', 'sonnet');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      // Read scout report
      const scoutReport = await this.readScoutReport(input.context.worktreePath);

      // Generate plan
      const plan = await this.generatePlan(input, scoutReport);

      // Save plan files
      await this.savePlan(input.context.worktreePath, plan);

      return {
        success: true,
        data: { plan },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a Plan Agent creating detailed implementation plans.

Create a comprehensive plan including:
1. Architecture design
2. File changes and additions
3. Step-by-step implementation
4. Risk assessment
5. ${input.projectType === 'mobile' ? 'Mobile-specific considerations (performance, offline, UX)' : 'Web-specific considerations (SEO, accessibility, Core Web Vitals)'}

Be specific and actionable.`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Create an implementation plan for: ${input.taskDescription}

Based on scout findings, provide:
- Architecture diagram (text-based)
- Files to create/modify
- Implementation steps
- Dependencies needed
- Performance considerations
- Security considerations
- Testing strategy`;
  }

  private async readScoutReport(worktreePath: string): Promise<any> {
    const reportPath = path.join(worktreePath, 'scout-report.json');
    const content = await this.readFile(reportPath);
    return JSON.parse(content);
  }

  private async generatePlan(input: AgentInput, scoutReport: any): Promise<string> {
    const prompt = `${this.getUserPrompt(input)}

**Scout Report:**
${JSON.stringify(scoutReport, null, 2)}`;

    return await this.callClaude(this.getSystemPrompt(input), prompt, 8192);
  }

  private async savePlan(worktreePath: string, plan: string): Promise<void> {
    await this.writeFile(path.join(worktreePath, 'implementation-plan.md'), plan);
  }
}
