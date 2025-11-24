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

```typescript
import { createWorkflow } from '@autonomous-workflow/core';

const workflow = await createWorkflow({
  taskDescription: 'Add user authentication with Supabase',
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

## Configuration

See the [full specification](../boolean/AUTONOMOUS_FRAMEWORK_SPEC.md) for detailed configuration options.

## Status

🚧 **In Development** - Core types and project structure complete. Implementation in progress.

### Completed
- ✅ Comprehensive specification document
- ✅ Project setup with Claude Agent SDK
- ✅ Core TypeScript type definitions
- ✅ Project structure

### In Progress
- 🔄 Core type definitions and interfaces

### Pending
- ⏳ Worktree manager implementation
- ⏳ Agent implementations (Scout, Plan, Build, Test, Review, CTO)
- ⏳ Orchestrator implementation
- ⏳ Mobile/Web platform configurations
- ⏳ Slash command integration
- ⏳ End-to-end testing
- ⏳ Documentation

## License

MIT
