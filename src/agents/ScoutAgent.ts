/**
 * Scout Agent
 *
 * Explores and analyzes the codebase, dependencies, and architecture
 * Generates context for subsequent stages
 */

import { BaseAgent } from './BaseAgent';
import { AgentInput, AgentOutput, ProjectType } from '../types';
import * as path from 'path';

interface ScoutReport {
  projectStructure: {
    rootFiles: string[];
    directories: string[];
    totalFiles: number;
  };
  techStack: {
    framework: string;
    language: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  patterns: {
    fileNamingConvention: string;
    componentStructure: string;
    stateManagement: string;
    styling: string;
  };
  relevantFiles: string[];
  analysis: string;
}

export class ScoutAgent extends BaseAgent {
  constructor() {
    super('scout', 'sonnet');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    try {
      // Gather codebase information
      const projectInfo = await this.gatherProjectInfo(input);

      // Get relevant files for the task
      const relevantFiles = await this.findRelevantFiles(
        input.context.worktreePath,
        input.taskDescription
      );

      // Analyze with Claude
      const analysis = await this.analyzeCodebase(input, projectInfo, relevantFiles);

      // Generate scout report
      const report: ScoutReport = {
        projectStructure: projectInfo.structure,
        techStack: projectInfo.techStack,
        patterns: projectInfo.patterns,
        relevantFiles,
        analysis,
      };

      // Save report
      await this.saveReport(input.context.worktreePath, report);

      return {
        success: true,
        data: report,
        metadata: {
          filesAnalyzed: relevantFiles.length,
          totalFiles: projectInfo.structure.totalFiles,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  protected getSystemPrompt(input: AgentInput): string {
    return `You are a Scout Agent responsible for analyzing codebases and providing context for development tasks.

Your role:
- Analyze project structure and identify patterns
- Understand the tech stack and conventions
- Identify relevant files and components for the given task
- Provide comprehensive context for the next stages

Focus on:
- Existing code patterns and conventions
- File organization and naming
- Dependencies and their usage
- Architecture decisions
- ${input.projectType === 'mobile' ? 'Mobile-specific patterns (navigation, state, native modules)' : 'Web-specific patterns (routing, state, API integration)'}

Provide clear, structured analysis that will guide the Plan stage.`;
  }

  protected getUserPrompt(input: AgentInput): string {
    return `Analyze this ${input.projectType} project for the following task:

**Task:** ${input.taskDescription}

**Project Type:** ${input.projectType}
**Framework:** ${input.context.framework || 'Unknown'}

**Available Context:**
- Total files: ${input.context.existingFiles?.length || 0}
- Dependencies: ${JSON.stringify(input.context.dependencies, null, 2)}

Please provide a comprehensive analysis covering:

1. **Project Overview**
   - Overall architecture
   - Key directories and their purposes
   - Entry points

2. **Tech Stack Analysis**
   - Framework and version
   - Key libraries and their roles
   - Build tools and configuration

3. **Code Patterns**
   - Component structure
   - State management approach
   - Styling methodology
   - Naming conventions

4. **Relevant Context for Task**
   - Files that need to be modified
   - Related components or modules
   - Dependencies that will be used
   - Potential challenges

5. **Recommendations**
   - Best approach for this task
   - Files to create/modify
   - Patterns to follow

Provide your analysis in clear, structured format.`;
  }

  private async gatherProjectInfo(input: AgentInput): Promise<{
    structure: {
      rootFiles: string[];
      directories: string[];
      totalFiles: number;
    };
    techStack: {
      framework: string;
      language: string;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    patterns: {
      fileNamingConvention: string;
      componentStructure: string;
      stateManagement: string;
      styling: string;
    };
  }> {
    const worktreePath = input.context.worktreePath;

    // Read package.json
    const packageJsonPath = path.join(worktreePath, 'package.json');
    let packageJson: any = {};

    try {
      const content = await this.readFile(packageJsonPath);
      packageJson = JSON.parse(content);
    } catch {
      // Package.json might not exist
    }

    // List root files and directories
    const fs = await import('fs/promises');
    const entries = await fs.readdir(worktreePath, { withFileTypes: true });

    const rootFiles = entries
      .filter((e) => e.isFile())
      .map((e) => e.name);

    const directories = entries
      .filter((e) => e.isDirectory())
      .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules')
      .map((e) => e.name);

    // Count total files
    const allFiles = await this.listFiles(worktreePath, true);

    // Detect framework
    const framework = this.detectFramework(packageJson.dependencies || {});

    // Detect patterns
    const patterns = await this.detectPatterns(worktreePath, allFiles);

    return {
      structure: {
        rootFiles,
        directories,
        totalFiles: allFiles.length,
      },
      techStack: {
        framework,
        language: 'TypeScript', // Could detect from tsconfig.json
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
      },
      patterns,
    };
  }

  private detectFramework(dependencies: Record<string, string>): string {
    if (dependencies['react-native']) return 'React Native';
    if (dependencies['react']) return 'React';
    if (dependencies['@angular/core']) return 'Angular';
    if (dependencies['vue']) return 'Vue';
    if (dependencies['next']) return 'Next.js';
    if (dependencies['vite']) return 'Vite';

    return 'Unknown';
  }

  private async detectPatterns(
    worktreePath: string,
    files: string[]
  ): Promise<{
    fileNamingConvention: string;
    componentStructure: string;
    stateManagement: string;
    styling: string;
  }> {
    // Analyze file naming
    const fileNaming = files.some((f) => f.includes('.component.'))
      ? 'Angular-style (.component.tsx)'
      : files.some((f) => /[A-Z]/.test(path.basename(f)))
        ? 'PascalCase'
        : 'kebab-case';

    // Detect component structure
    const hasComponentsDir = files.some((f) => f.includes('/components/'));
    const componentStructure = hasComponentsDir
      ? 'Organized in components/ directory'
      : 'Flat structure';

    // Detect state management
    let stateManagement = 'React hooks';
    if (files.some((f) => f.includes('redux') || f.includes('store'))) {
      stateManagement = 'Redux';
    } else if (files.some((f) => f.includes('zustand'))) {
      stateManagement = 'Zustand';
    } else if (files.some((f) => f.includes('mobx'))) {
      stateManagement = 'MobX';
    }

    // Detect styling
    let styling = 'CSS';
    if (files.some((f) => f.endsWith('.scss') || f.endsWith('.sass'))) {
      styling = 'SASS/SCSS';
    } else if (files.some((f) => f.includes('styled'))) {
      styling = 'Styled Components';
    } else if (files.some((f) => f.includes('tailwind'))) {
      styling = 'Tailwind CSS';
    }

    return {
      fileNamingConvention: fileNaming,
      componentStructure,
      stateManagement,
      styling,
    };
  }

  private async findRelevantFiles(
    worktreePath: string,
    taskDescription: string
  ): Promise<string[]> {
    const allFiles = await this.listFiles(worktreePath, true);

    // Filter to code files
    const codeFiles = allFiles.filter((f) => {
      const ext = path.extname(f);
      return ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'].includes(ext);
    });

    // For now, return key files (could use AI to determine relevance)
    const keyFiles = codeFiles.filter((f) => {
      const basename = path.basename(f).toLowerCase();
      return (
        basename.includes('app') ||
        basename.includes('index') ||
        basename.includes('main') ||
        basename.includes('config') ||
        f.includes('package.json')
      );
    });

    return keyFiles.slice(0, 20); // Limit to 20 most relevant
  }

  private async analyzeCodebase(
    input: AgentInput,
    projectInfo: any,
    relevantFiles: string[]
  ): Promise<string> {
    // Read content of relevant files
    const fileContents = await Promise.all(
      relevantFiles.slice(0, 10).map(async (file) => {
        try {
          const content = await this.readFile(file);
          return `\n\n### ${file}\n\`\`\`\n${content.slice(0, 500)}\n...\n\`\`\``;
        } catch {
          return '';
        }
      })
    );

    const userPrompt = `${this.getUserPrompt(input)}

**Sample Files:**
${fileContents.join('\n')}

**Project Info:**
${JSON.stringify(projectInfo, null, 2)}`;

    return await this.callClaude(this.getSystemPrompt(input), userPrompt, 8192);
  }

  private async saveReport(worktreePath: string, report: ScoutReport): Promise<void> {
    const reportPath = path.join(worktreePath, 'scout-report.json');
    await this.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Also save human-readable version
    const mdPath = path.join(worktreePath, 'context-map.md');
    const markdown = `# Scout Report

## Project Structure
- Total Files: ${report.projectStructure.totalFiles}
- Root Directories: ${report.projectStructure.directories.join(', ')}

## Tech Stack
- Framework: ${report.techStack.framework}
- Language: ${report.techStack.language}

## Patterns
- File Naming: ${report.patterns.fileNamingConvention}
- Components: ${report.patterns.componentStructure}
- State: ${report.patterns.stateManagement}
- Styling: ${report.patterns.styling}

## Relevant Files
${report.relevantFiles.map((f) => `- ${f}`).join('\n')}

## Analysis
${report.analysis}
`;

    await this.writeFile(mdPath, markdown);
  }
}
