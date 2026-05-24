---
name: spec-driven-development
description: Write a structured specification before writing code. Use when
  starting a new project, feature, or significant change. Defines objectives,
  commands, structure, code style, testing strategy, and boundaries.
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
# Spec-Driven Development

## Overview

Write a comprehensive specification before writing any implementation code. The spec covers objectives, interface contracts, project structure, code style, testing strategy, and behavioral boundaries. This is the canonical Define-phase skill.

## When to Use

- Starting a new project or module
- Building a feature that spans more than one file
- Making a significant change to existing behavior
- When stakeholders need to review and approve scope before work begins

## Spec Structure

### 1. Objective

- What this feature does and why
- Target users and their needs
- Measurable success criteria

### 2. Interface Contracts

- API endpoints, CLI commands, or function signatures
- Input/output shapes with examples
- Error cases and status codes

### 3. Project Structure

- New files to create
- Existing files to modify
- Directory layout if relevant

### 4. Code Style

- Language and framework conventions
- Naming patterns to follow
- Import organization
- Error handling patterns

### 5. Testing Strategy

- Test framework and runner
- Coverage targets (minimum 80%)
- Test categories: unit, integration, e2e
- Critical path coverage requirements

### 6. Boundaries

- Always do: rules that must always be followed
- Ask first: decisions that require stakeholder input
- Never do: hard constraints that must not be violated

## Process

### Step 1: Gather Requirements

- Understand the user problem
- Identify constraints and dependencies
- Clarify ambiguous requirements with questions

### Step 2: Write the Spec

- Save as `specs/{feature}/spec.md`
- Cover all six sections above
- Keep it concrete and actionable

### Step 3: Review and Validate

- Check that acceptance criteria are testable
- Verify boundaries are clear and enforceable
- Confirm scope is appropriate for the change

### Step 4: Get Approval

- Present spec to stakeholders
- Address feedback before proceeding to planning

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can just start coding" | Without a spec, you will discover requirements mid-implementation, causing rework. |
| "The spec will be outdated immediately" | Specs capture intent. Implementation details change; intent should not. |
| "This is too small for a spec" | If it touches more than one file or more than one concern, it deserves at least a brief spec. |

## Verification

- [ ] All six spec sections are present
- [ ] Acceptance criteria are testable
- [ ] Boundaries include always-do, ask-first, and never-do rules
- [ ] Spec is saved in `specs/{feature}/spec.md`

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll write the spec as I code" | Coding without a spec leads to rework. A 5-minute spec prevents a 5-hour rewrite. |
| "This is too simple for a spec" | Simple features become complex. A spec keeps scope clear and prevents scope creep. |
| "The requirements are clear in my head" | Mental requirements change during implementation. Written specs catch ambiguities early. |
| "I'll document it after implementation" | Post-implementation specs describe what was built, not what should be built. Spec first. |
| "The spec will be outdated immediately" | Specs capture intent. Implementation details change; intent should not. |
