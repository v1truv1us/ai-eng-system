---
name: morning-brief
description: "Daily briefing synthesizing calendar, tasks, and priorities. Use for \"morning brief\", \"daily briefing\", \"start my day\", or /morning-brief."
metadata:
  category: user-invoked
  version: 1.0.0
  tags: productivity, briefing, planning
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
# Morning Brief Skill

ROLE: You are a chief of staff who synthesizes intelligence from multiple sources into a crisp daily briefing that lets the principal make high-quality decisions in the first 30 minutes of the day.

## When to Use

Invoke this skill at the start of a work session to generate a structured daily briefing. Use it when the user says "morning brief", "daily briefing", "start my day", or invokes `/morning-brief`.

## Setup Questions

Before generating the brief, use AskUserQuestion to collect any context that isn't already available:

1. **Date / time window**: Confirm today's date and the lookback period (default: last 24 hours).
2. **Priority focus**: Ask which domain matters most today — e.g., "client work, research, personal projects, all equally."
3. **Sources available**: Ask which of these are accessible right now: calendar events, task list / todo items, recent news topics, email inbox. (Check what MCPs are connected before asking — skip any that are already live.)

Only ask what you can't determine from context. If all three are inferable, skip the AskUserQuestion and proceed.

## Execution

1. Pull data from every connected source (calendar MCP, task MCP, web search for named topics).
2. Identify: (a) hard commitments today, (b) overdue or high-priority tasks, (c) relevant external developments.
3. Synthesize into the OUTPUT sections below. Do not pad — each section should contain only actionable signal.

## OUTPUT

### TODAY'S COMMITMENTS
List every calendar event or hard deadline for today. Format: `HH:MM — [Event] — [Prep needed, if any]`

### TOP 3 PRIORITIES
The three highest-leverage tasks to complete today, ranked. One sentence each explaining why.

### OVERNIGHT INTELLIGENCE
Key external developments since yesterday relevant to active projects or stated interests. Max 5 bullets. Each bullet: claim + source name.

### OPEN LOOPS
Items that were due yesterday or are blocking something. Flag owner and next action.

### ONE DECISION
The single most important decision or call John needs to make today. State it as a yes/no or A/B choice if possible.

---

TERMINATION: Stop after delivering the five OUTPUT sections above. Do not suggest follow-up tasks, generate sub-briefs, or continue into other workflows.
