# Autonomous Workflow Framework

A comprehensive framework for autonomous mobile and web application development using Claude agents with built-in quality gates, parallel execution, and CTO oversight.

## Features

- **Scout → Plan → Build → Test → Review Pipeline** with quality gates at each stage
- **CTO Agent** that reviews each stage and can approve, request revisions, or reject
- **Worktree Management** for parallel agent execution with automatic cleanup
- **Mobile Support**: React Native (iOS & Android)
- **Web Support**: Vite, Tailwind CSS, Supabase, Shadcn UI, Framer Motion
- **GitHub CLI Integration** for all git operations
- **Comprehensive Error Handling** and recovery strategies

## Installation

```bash
npm install @autonomous-workflow/core
```

## Quick Start

### As a Library
```typescript
import { createWorkflow } from '@autonomous-workflow/core';

const workflow = await createWorkflow({
  taskDescription: 'Add user authentication with Supabase',
  projectPath: './my-project',
  projectType: 'web',
  config: {
    web: {
      buildTool: 'vite',
      styling: 'tailwind',
      uiFramework: 'shadcn',
      backend: 'supabase'
    }
  }
});

await workflow.execute();
```

### With Claude Code
Simply use the slash commands in your project:
```bash
/autonomous-feature "Add dark mode toggle"
/autonomous-fix "Login form validation not working"
```

## How It Works

The framework executes a multi-stage autonomous workflow:

1. **Scout** - Explores the codebase, identifies patterns, and gathers context
2. **Plan** - Creates architecture and implementation plan based on findings
3. **Build** - Generates code following project conventions
4. **Test** - Creates and runs comprehensive tests
5. **Review** - Performs code review and quality checks
6. **CTO Gates** - Reviews each stage and can:
   - ✅ **Approve** - Continue to next stage
   - 🔄 **Revise** - Send back for improvements
   - ❌ **Reject** - Stop workflow if quality is insufficient

Each agent works in isolated git worktrees for parallel execution, with automatic cleanup on completion or failure.

## Project Structure

```
autonomous-workflow-framework/
├── src/
│   ├── agents/          # Scout, Plan, Build, Test, Review, CTO agents
│   ├── orchestrator/    # Workflow orchestration logic
│   ├── worktree/        # Git worktree management
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── config/          # Configuration management
├── dist/                # Compiled output
└── package.json
```

## Claude Code Integration

Use the included slash commands for seamless integration with Claude Code:

### `/autonomous-feature`
Build new features with full quality gates:
```
/autonomous-feature "Add user authentication with Supabase"
```

### `/autonomous-fix`
Fix bugs with optimized workflow:
```
/autonomous-fix "Fix login button not responding"
```

Both commands execute the complete Scout → Plan → Build → Test → Review pipeline with CTO quality gates at each stage.

## Configuration

See the [full specification](../boolean/AUTONOMOUS_FRAMEWORK_SPEC.md) for detailed configuration options.

### Mobile Configuration
```typescript
{
  projectType: 'mobile',
  mobile: {
    platforms: ['ios', 'android'],
    framework: 'react-native',
    testing: 'jest'
  }
}
```

### Web Configuration
```typescript
{
  projectType: 'web',
  web: {
    buildTool: 'vite',
    styling: 'tailwind',
    uiFramework: 'shadcn',
    backend: 'supabase',
    animation: 'framer-motion'
  }
}
```

## Status

✨ **v0.1.0 - Core Implementation Complete**

### Completed
- ✅ Comprehensive specification document
- ✅ Project setup with Claude Agent SDK and Anthropic SDK
- ✅ Core TypeScript type definitions and interfaces
- ✅ Project structure with modular organization
- ✅ **Worktree Manager** - Parallel execution with automatic cleanup
- ✅ **Agent Implementations** - All agents fully implemented:
  - BaseAgent with shared functionality
  - ScoutAgent for codebase exploration
  - PlanAgent for architecture and planning
  - BuildAgent for code generation
  - TestAgent for test generation and execution
  - ReviewAgent for code review
  - CTOAgent for quality gate decisions
- ✅ **Workflow Orchestrator** - Stage progression with quality gates
- ✅ **Platform Configurations** - Mobile (React Native) and Web (Vite/Tailwind/Supabase) presets
- ✅ **Slash Commands** - `/autonomous-feature` and `/autonomous-fix` for Claude Code integration
- ✅ Built and compiled successfully

### Ready for Testing
- 🧪 End-to-end workflow testing with real projects
- 🧪 Integration testing with different project types
- 🧪 Quality gate validation

### Next Steps
- 📦 Publish to npm registry
- 📚 Create comprehensive examples and tutorials
- 🔧 Community feedback and refinement

## License

MIT
