# Autonomous Feature Development

Launch the autonomous workflow framework to build a new feature with full Scout → Plan → Build → Test → Review pipeline and CTO quality gates.

**Usage:** `/autonomous-feature "Add user authentication"`

---

Execute the autonomous workflow to implement: {{ARGS}}

Use the @autonomous-workflow/core framework with these steps:

1. Initialize workflow with task description
2. Execute through all stages (Scout, Plan, Build, Test, Review)
3. CTO agent reviews each stage and can approve or request revisions
4. Create PR when all quality gates pass

Configuration:
- Project type: Detect from codebase (web vs mobile)
- Quality gates: Enabled
- CTO strict mode: On
- Min coverage: 80%

After completion, create a GitHub PR with the changes using gh CLI.
