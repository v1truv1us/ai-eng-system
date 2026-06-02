# pi-crew Worker Runtime Context
Run ID: team_20260602122212_6bfb072870186ac6
Team: direct-explorer
Workflow: direct-agent
State root: /Users/johnferguson/Github/ai-eng-system/.pi/teams/state/runs/team_20260602122212_6bfb072870186ac6
Artifacts root: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602122212_6bfb072870186ac6
Events path: /Users/johnferguson/Github/ai-eng-system/.pi/teams/state/runs/team_20260602122212_6bfb072870186ac6/events.jsonl
Task ID: 01_01-agent
Task cwd: /Users/johnferguson/Github/ai-eng-system
Workspace mode: single
Protocol:
- Stay within the task scope unless the prompt explicitly says otherwise.
- Report blockers and verification evidence in the final result.
- Do not claim completion without evidence.
- Follow the Task Packet contract below; escalate if any contract field is impossible to satisfy.
# Crew Coordination Channel
Mailbox target for this task: 01_01-agent
Use the run mailbox contract for coordination with the leader/orchestrator:
- If blocked or uncertain, report the blocker in your final result and, when mailbox tools/API are available, send an inbox/outbox message addressed to the leader.
- Ask the leader before editing when scope is ambiguous, requirements conflict, destructive action is needed, or you discover likely overlap with another task.
- Before making non-trivial edits, state intended changed files in your notes/result; if another worker may touch the same file/symbol, pause and request sequencing/ownership guidance.
- Do not resolve cross-worker conflicts silently. Escalate via mailbox/result with: file/symbol, conflicting task if known, proposed owner, and safest next step.
- If nudged, answer with current status, blocker, or smallest next step.
- Treat inherited/dependency context as reference-only; do not continue the parent conversation directly.
- Completion handoff should include: DONE/FAILED, summary, changed/read files, verification evidence, and remaining risks.
# Workspace Structure
.
  - index.d.ts  85B  14h
  - index.js  150B  14h
  - plugins/
    - ai-eng-pstack/
      - plugin.json  237B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-plugin-dev/
      - plugin.json  430B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-content/
      - plugin.json  361B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-quality/
      - plugin.json  574B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-devops/
      - hooks.json  247B  14h
      - hooks/
      - plugin.json  494B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-research/
      - plugin.json  395B  14h
      - skills/
      - agents/
      - commands/
    - ai-eng-learning/
      - plugin.json  517B  14h
      - templates/
      - docs/
      - skills/
      - agents/
      - commands/
    - ai-eng-core/
      - hooks/
      - hooks.json  454B  14h
      - plugin.json  591B  14h
      - skills/
      - agents/
      - commands/
  - build.ts  70.7KB  14h
  - skills/
    - npm-trusted-publishing/
      - SKILL.md  5.1KB  14h
    - prompt-refinement/
      - SKILL.md  12.5KB  15h
      - templates/
    - AGENTS.md  5.4KB  15h
    - agents-sdk-dev/
      - SKILL.md  9.5KB  22h
      - references/
    - seo-audit/
      - SKILL.md  6.2KB  5d
    - test-fix-loop/
      - SKILL.md  3.4KB  5d
    - investigation-loop/
      - SKILL.md  3.9KB  5d
    - dreaming-consolidator/
      - SKILL.md  4.8KB  5d
    - cross-repo-refactor/
      - SKILL.md  4.8KB  5d
    - using-agent-skills/
      - SKILL.md  6.2KB  23h
    - orchestrate/
      - SKILL.md  4.2KB  23h
    - … 55 more
    - coolify-deploy/
      - SKILL.md  5.3KB  9d
  - package.json  4.3KB  19h
  - specs/
    - headstart-agent/
      - plan.md  7.3KB  2d
      - tasks/
      - spec.md  18.4KB  2d
    - ralph-wiggum-command/
      - spec.md  17.6KB  11w
      - plan.md  9.9KB  11w
    - global-aware-installation/
      - spec.md  10.7KB  11w
      - plan.md  27.7KB  11w
    - fix-timeout-and-model-config.md  8.6KB  11w
  - docs/
    - subagent-orchestration-guide.md  23.1KB  22h
    - deploy/
      - coolify.md  2.8KB  3d
    - reference/
      - commands.md  4.8KB  15h
    - reviews/
    - cursor-setup.md  2.6KB  9d
    - getting-started/
    - gemini-cli-setup.md  1.1KB  9d
    - decisions/
    - attribution/
    - kiro-setup.md  1.5KB  4w
    - copilot-setup.md  2.0KB  4w
    - … 28 more
    - research-command-guide.md  12.3KB  25w
  - README.md  7.1KB  3d
  - Research/
    - Switchboard/
  - agents/
    - research-runner/
    - runner-shared/
    - seo-review-runner/
  - … 51 more
  - test-data/
    - plans/
    - commands/
    - agents/
… (56 lines elided)

Goal:
Read-only review. Inspect /Users/johnferguson/Github/research-queue local repo and relevant environment/config references. Goal: validate research-queue deployment state and identify exact next steps after Coolify build/routing issues. Focus on docker-compose.yml, Dockerfile, package/lockfile, README/env docs, API routes, auth behavior, and any likely routing/domain conflicts with old pi-runner. Do not modify files, do not SSH, do not call external APIs. Return concise findings with evidence and suggested next steps.

Step: 01_agent
Role: agent



# Task Packet

```json
{
  "objective": "Read-only review. Inspect /Users/johnferguson/Github/research-queue local repo and relevant environment/config references. Goal: validate research-queue deployment state and identify exact next steps after Coolify build/routing issues. Focus on docker-compose.yml, Dockerfile, package/lockfile, README/env docs, API routes, auth behavior, and any likely routing/domain conflicts with old pi-runner. Do not modify files, do not SSH, do not call external APIs. Return concise findings with evidence and suggested next steps.",
  "scope": "workspace",
  "repo": "ai-eng-system",
  "branchPolicy": "Use the current checkout; do not create branches unless explicitly requested.",
  "acceptanceTests": [],
  "commitPolicy": "Do not commit unless explicitly requested by the user or workflow.",
  "reportingContract": "Report intended/changed files, verification evidence, blockers, conflict risks, and next recommended action.",
  "escalationPolicy": "Stop and report if scope is ambiguous, destructive action is needed, permissions are missing, verification cannot be completed, or edits may overlap with another worker/task.",
  "constraints": [
    "Stay within the assigned task scope.",
    "Do not claim completion without verification evidence.",
    "Use mailbox/API state for coordination when available.",
    "Do not make overlapping edits to the same file/symbol without explicit leader sequencing or ownership guidance."
  ],
  "expectedArtifacts": [
    "prompt",
    "result",
    "verification"
  ],
  "verification": {
    "requiredGreenLevel": "none",
    "commands": [],
    "allowManualEvidence": true
  }
}
```





Task:
Read-only review. Inspect /Users/johnferguson/Github/research-queue local repo and relevant environment/config references. Goal: validate research-queue deployment state and identify exact next steps after Coolify build/routing issues. Focus on docker-compose.yml, Dockerfile, package/lockfile, README/env docs, API routes, auth behavior, and any likely routing/domain conflicts with old pi-runner. Do not modify files, do not SSH, do not call external APIs. Return concise findings with evidence and suggested next steps.
