---
name: orchestrate
description: Use only when the user explicitly types `/orchestrate <goal>` to decompose a large task, spawn a tree of parallel cloud-agent workers/subplanners/verifiers via the Cursor SDK, and collect structured handoffs; do not invoke autonomously.
metadata:
  version: 1.0.0
  tags: cursor-import, orchestrate
---

# Orchestrate

> **Status: planned.** The spawn/wait/handoff driver (`scripts/cli.ts`) and role references (`references/dispatcher.md`, `references/planner.md`) are not in this repository yet. Until they land, use the **`agents-sdk-dev`** skill (harness=cursor) with cloud `Agent.create({ cloud: { repos } })` for multi-agent work, or the local pattern in `agents/research-runner/cursor/runner.ts`.

An explicit `/orchestrate <goal>` will fan out a large task across parallel Cursor cloud agents. Workers don't talk to each other; they talk up through structured handoffs. The intended design: a script owns the spawn/wait loop, the planner writes `plan.json`, the script executes it, and the planner reads handoffs to decide what comes next.

**Required reading: the `agents-sdk-dev` skill** (`skills/agents-sdk-dev/SKILL.md` in this repo, specify harness=cursor). Spawning, auth, and the error taxonomy live there.

## Setup (when implemented)

- `CURSOR_API_KEY` must be a personal/user key. Create it from [Cursor Dashboard > Integrations](https://cursor.com/dashboard/integrations), then read `agents-sdk-dev` (harness=cursor) auth guidance.
- `SLACK_BOT_TOKEN` is optional for Slack visibility in the upstream design.

## Workaround today

1. Load **`agents-sdk-dev`** with harness=cursor.
2. Use **cloud** runtime with explicit `cloud: { repos: [...] }` per worker task.
3. Persist handoffs as JSON files on disk; use deterministic code for phase transitions (see `agents/research-runner/shared/workflow-contract.ts`).
4. Track `/orchestrate` status in `docs/reference/commands.md` (listed as **planned**).

## Core principles

These rules make the tree self-converging without global coordination.

1. **Planners own scopes and publish tasks. They do no coding.** Writing `plan.json`, reading handoffs, and deciding what's next are planner work. Editing files, running `git merge`, and fixing conflicts inline are not. If a planner feels the urge to code, it publishes a task for a worker instead.
2. **Planners don't know who picks up their tasks.** The script routes each task to a cloud agent. The planner's mental model stays at the task level.
3. **Workers are isolated.** One task, one clone of the repo, no channel to any other agent. One handoff when done.
4. **Subplanners are recursive planners.** A planner publishes a "subplan this slice" task; the subplanner fully owns that slice and hands back an aggregated handoff.
5. **Continuous motion via handoffs.** A planner that thought it was done can receive a late handoff and replan. No "finished" state until the planner decides to stop publishing.
6. **Propagation, not synchronization.** No cross-talk between siblings. No shared state between levels. Each level sees only its children's handoffs.

## Node types

| Node           | Runs the loop? | Scope                            | Output                                  |
| -------------- | -------------- | -------------------------------- | --------------------------------------- |
| Planner        | yes            | Entire user goal                 | User-facing message + optional PR       |
| Subplanner (↻) | yes            | One slice of parent's scope      | Handoff to parent                       |
| Worker         | no             | One concrete task                | Handoff to spawning planner             |
| Verifier       | no             | One target's acceptance criteria | Verdict handoff to spawning planner     |
| Git            | n/a            | Shared medium                    | Branches (code) + handoffs/ (meaning)   |

## Role (when reference docs exist)

Two roles, one skill:

- **Dispatcher** — local IDE session; kick off a cloud root planner and return its URL. One-shot; not the planner.
- **Planner (root or sub)** — owns a scope, publishes tasks, reads handoffs, decides what's next.

`disable-model-invocation: true` means this skill loads only on explicit invocation.
