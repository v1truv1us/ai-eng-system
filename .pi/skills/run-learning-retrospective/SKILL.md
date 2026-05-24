---
name: run-learning-retrospective
description: Evaluate learning progress, identify blockers, and adjust the learning plan
metadata:
  version: 1.0.0
  tags: cursor-import, teaching
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
# Run a learning retrospective

## Trigger

Learner completed a milestone and needs data-driven adjustment to their plan.

## Workflow

1. Review completed work against target outcomes.
2. Identify recurring blockers and weak concepts.
3. Prioritize what to reinforce versus what to defer.
4. Adjust pacing and upcoming practice tasks.
5. Set next milestone and measurable checkpoint.

## Tools

- Use Ask user tool.

## Output

- Progress retrospective
- Updated learning plan
- Next milestone definition
