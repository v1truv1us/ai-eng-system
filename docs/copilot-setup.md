# GitHub Copilot Setup

## Overview

This guide explains how to use ai-eng-system agents and skills with GitHub Copilot.

## Installation

### Using Copilot Custom Instructions

1. Create `.github/copilot-instructions.md` in your project root
2. Add the following content:

```markdown
# AI Engineering System Instructions

Follow the ai-eng-system workflow for all development tasks.

## Workflow
1. Research before implementing
2. Specify before planning
3. Plan before building
4. Verify after every change
5. Review before merging

## Available Resources
- Skills: skills/ directory
- Rules: rules/ directory
- References: references/ directory

## Principles
- Spec before code
- Tests are proof
- Small changes (~100 lines)
- Source-driven development
- Verify always
```

### Using Agent Personas

The agent definitions in `.opencode/agent/ai-eng/` can be used as Copilot Chat system prompts:

1. **For code review**: Use `quality-testing/code-reviewer.md` content
2. **For architecture**: Use `development/architect-advisor.md` content
3. **For development**: Use `development/full-stack-developer.md` content

## Available Agents

| Agent | Use Case |
|-------|----------|
| `code-reviewer` | Code quality review |
| `typescript-reviewer` | TypeScript-specific review |
| `python-reviewer` | Python-specific review |
| `go-reviewer` | Go-specific review |
| `security-scanner` | Security vulnerability detection |
| `performance-engineer` | Performance optimization |
| `test-generator` | Test suite generation |
| `full-stack-developer` | End-to-end development |
| `backend-architect` | Backend system design |
| `planner` | Feature implementation planning |

## Best Practices

1. **Use Copilot Chat for planning**: Paste the relevant agent's instructions as context
2. **Reference skills**: Open skill files in the editor to provide context
3. **Verify suggestions**: Always run tests and builds on Copilot-generated code
4. **Follow conventions**: Ensure generated code matches project patterns
