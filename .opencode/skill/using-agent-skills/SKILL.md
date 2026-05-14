---
name: using-agent-skills
description: "Discovery and invocation of all skills, commands, and agents. Decision tree for task-to-skill mapping. Core operating behaviors for agents. Use when unsure which skill or agent to use."
---

# Using Agent Skills

## Overview

This is the meta-skill for discovering and invoking the right skill, command, or agent for any task. It includes a decision tree for task-to-skill mapping and core operating behaviors that all agents should follow.

## When to Use

- Starting a new session and unsure which skill applies
- Task doesn't clearly match a single skill
- Need to understand the full capability landscape
- Debugging why an agent isn't following expected workflows

## Decision Tree: Task to Skill Mapping

```
What are you trying to do?

DEFINE (understand the problem)
  → Turning a vague idea into something concrete?
    → idea-refine
  → Writing requirements before coding?
    → spec-driven-development

PLAN (break down the work)
  → Decomposing a spec into implementable tasks?
    → planning-and-task-breakdown
  → Researching before planning?
    → comprehensive-research

BUILD (write the code)
  → Implementing a feature across multiple files?
    → incremental-implementation
  → Writing tests first?
    → test-driven-development
  → Need the right documentation?
    → source-driven-development
  → Building user-facing interfaces?
    → frontend-ui-engineering
  → Designing an API or module boundary?
    → api-and-interface-design
  → Need the right context loaded?
    → context-engineering

VERIFY (prove it works)
  → Testing in the browser?
    → browser-testing-with-devtools
  → Something is broken?
    → debugging-and-error-recovery

REVIEW (improve code health)
  → Reviewing code before merge?
    → code-review-and-quality
  → Code works but is hard to read?
    → code-simplification
  → Security concerns?
    → security-and-hardening
  → Performance issues?
    → performance-optimization

SHIP (deploy safely)
  → Preparing for production?
    → shipping-and-launch
  → Managing git workflow?
    → git-workflow-and-versioning
  → Setting up CI/CD?
    → ci-cd-and-automation
  → Deprecating old code?
    → deprecation-and-migration
  → Documenting decisions?
    → documentation-and-adrs

SPECIALIZED
  → Analyzing dependencies or architecture?
    → dependency-graph-analysis
  → Building knowledge graphs?
    → graphify or graph-rag
  → Creating plugins/commands/skills?
    → plugin-dev
  → Optimizing prompts?
    → incentive-prompting or prompt-refinement
  → Cleaning up AI verbosity?
    → text-cleanup
  → Managing git worktrees?
    → git-worktree
  → Deploying to Coolify?
    → coolify-deploy
```

## Core Operating Behaviors

### 1. Surface Assumptions
Before acting, state what you're assuming:
- "I'm assuming this is a new feature, not a bug fix"
- "I'm assuming we're using the existing auth pattern"
- "I'm assuming the database schema doesn't need changes"

### 2. Manage Confusion
When uncertain, say so explicitly:
- "I'm not sure which pattern applies here"
- "This could be interpreted two ways"
- "I need more context about the expected behavior"

### 3. Push Back
Challenge requirements when needed:
- "This approach will create tight coupling. Consider..."
- "The spec says X, but the existing code does Y. Which is correct?"
- "This change is too large for one commit. Should we split it?"

### 4. Enforce Simplicity
Prefer simple solutions:
- "Can we solve this with a function instead of a class?"
- "Do we need a new dependency, or can we use what we have?"
- "Is there a simpler way to handle this edge case?"

### 5. Scope Discipline
Stay within boundaries:
- "This is out of scope for the current task"
- "I'll note this as a follow-up, not implement it now"
- "The spec covers A and B, but not C. Should I expand scope?"

### 6. Verify
Always prove correctness:
- "Seems right" is never sufficient
- Run tests, check build output, verify runtime behavior
- Provide evidence: passing tests, screenshots, logs

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll add tests later" | Tests are proof. Without them, you have no evidence it works. Write tests first or alongside. |
| "This is simple enough to skip the spec" | Simple now, complex later. A 5-minute spec prevents 5-hour rewrites. |
| "I know this pattern, no need to check docs" | Frameworks change. Source-driven development prevents subtle bugs from outdated knowledge. |
| "The code works, no need to simplify" | Working code that's hard to read is technical debt. Future you (or teammates) will pay the cost. |
| "I'll fix the security issue in the next PR" | Security issues are stop-the-line. Fix now or create a tracked issue with severity. |
| "This only affects one file, no review needed" | Every change deserves review. Even small changes can have cascading effects. |
| "I'll document it later" | Undocumented code is a time bomb. Document the why, not the what, while it's fresh. |

## Composition Rules

1. **Agents do NOT invoke other agents** — enforced by platform constraint
2. **Agents MAY invoke skills** — skills are instructions, not agents
3. **The user or a slash command is the orchestrator** — no router agents
4. **Skills auto-activate based on context** — no manual skill selection needed
5. **Teams cannot nest** — flat hierarchy only

## References

- `references/orchestration-patterns.md` — Endorsed and anti-pattern orchestration approaches
- `references/testing-patterns.md` — Test structure, naming, mocking, examples
- `references/security-checklist.md` — Pre-commit checks, OWASP Top 10, secrets management
- `references/performance-checklist.md` — Core Web Vitals, frontend/backend checklists
- `references/accessibility-checklist.md` — Keyboard nav, screen readers, WCAG 2.1 AA
