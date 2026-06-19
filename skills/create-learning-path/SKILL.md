---
name: create-learning-path
description: Build a personalized learning roadmap with milestones and practice checkpoints
metadata:
  category: model-invoked
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
# Create a learning path

## Trigger

Building capability in a topic over multiple sessions.

## Workflow

1. Assess baseline knowledge and target outcomes.
2. Sequence topics from fundamentals to applied practice.
3. Define milestone projects and time-boxed checkpoints.
4. Add deliberate practice exercises with feedback criteria.
5. Review progress and adjust pacing.

## Tools

- Use Ask user tool.

## Guardrails

- Keep milestones achievable within the stated schedule.
- Include practice and reflection in every phase.
- Avoid resource overload by prioritizing a small set of materials.

## Output

- Week-by-week or milestone-based plan
- Practice assignments
- Progress review rubric
