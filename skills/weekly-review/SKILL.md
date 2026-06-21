---
name: weekly-review
description: Produce a weekly synthesis of authored commits with highlights by bugfix, tech debt, and net-new work
metadata:
  category: user-invoked
  version: 1.0.0
  tags: cursor-import, cursor-team-kit
disable-model-invocation: true
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
# Weekly review

## Trigger

Need a weekly recap of shipped work for status updates, retros, or planning.

## Workflow

1. Determine the current git user email from repo config.
2. Collect authored commits from the last 7-10 days on the primary branch context.
3. Exclude merge commits.
4. Group meaningful changes into 2-5 concise bullets.
5. Add a short classification paragraph covering:
   - likely bug fixes
   - likely tech debt work
   - likely net-new functionality

## Guardrails

- Keep the recap short and executive-readable.
- Base claims only on commit history and diffs.
- If git email is missing, ask the user to set it before proceeding.

## Output

- 2-5 bullet weekly summary
- Brief classification paragraph (bugfix / tech debt / net-new)
