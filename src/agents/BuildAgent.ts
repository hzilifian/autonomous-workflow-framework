/**
 * Build Agent - Implements the planned changes
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput, FileChange } from '../types';
import * as path from 'path';

export class BuildAgent extends BaseAgent {
  constructor() {
    super('build', 'sonnet');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      const plan = await this.readFile(path.join(input.context.worktreePath, 'implementation-plan.md'));
      const scoutReport = await this.readFile(path.join(input.context.worktreePath, 'scout-report.json'));

      const implementation = await this.implementChanges(input, plan, scoutReport);
      const fileChanges = await this.applyChanges(input.context.worktreePath, implementation);

      await this.saveSum(input.context.worktreePath, implementation);

      return {
        success: true,
        data: { implementation },
        files: fileChanges,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a Build Agent implementing code changes.

Generate high-quality, production-ready code following:
- Project conventions and patterns
- Best practices for ${input.projectType}
- Proper error handling
- Type safety
- Accessibility standards
- Performance optimization

Output file changes in JSON format:
{ "files": [{ "path": "...", "action": "create|modify", "content": "..." }] }`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Implement: ${input.taskDescription}

Follow the plan and scout findings to generate code.`;
  }

  private async implementChanges(input: AgentInput, plan: string, scoutReport: string): Promise<string> {
    const prompt = `${this.getUserPrompt(input)}

**Plan:**
${plan}

**Scout Report:**
${scoutReport}

Generate the code changes as JSON.`;

    return await this.callClaude(this.getSystemPrompt(input), prompt, 8192);
  }

  private async applyChanges(worktreePath: string, implementation: string): Promise<FileChange[]> {
    try {
      const parsed = this.parseJSON<{ files: FileChange[] }>(implementation);

      for (const file of parsed.files) {
        const fullPath = path.join(worktreePath, file.path);

        if (file.action === 'create' || file.action === 'modify') {
          await this.writeFile(fullPath, file.content || '');
        }
      }

      return parsed.files;
    } catch {
      return [];
    }
  }

  private async saveSum(worktreePath: string, implementation: string): Promise<void> {
    await this.writeFile(path.join(worktreePath, 'build-summary.md'), implementation);
  }
}
