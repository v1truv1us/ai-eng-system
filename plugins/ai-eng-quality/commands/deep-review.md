---
name: deep-review
description: Run all four review axes in parallel — code quality, security, architecture, and performance — each in its own isolated context. The most thorough review available.
agent: review
version: 1.0.0
inputs:
  - name: target
    type: string
    required: false
    description: Files, directory, or PR to review
  - name: fromRef
    type: string
    required: false
    description: Git ref to diff from (e.g., main)
outputs:
  - name: review_report
    type: file
    format: Markdown
    description: Unified review report
---

# Deep Review Command

Run the four core review axes in parallel with isolated context windows: $ARGUMENTS

```bash
/ai-eng/deep-review src/
/ai-eng/deep-review . --from-ref=main
/ai-eng/deep-review src/auth.ts src/payments.ts
```

## What It Does

Launches **4 parallel reviews**, each in its own context window:

| Axis | Agent | Skill | Focus |
|------|-------|-------|-------|
| Code Quality | code-reviewer | thermo-nuclear-code-quality-review | Maintainability, structure, 1k-line rule, spaghetti |
| Security | security-scanner | thermo-nuclear-security-review | Injection, auth bypass, secrets, OWASP |
| Architecture | architect-advisor | thermo-nuclear-architecture-review | Coupling, boundaries, layering, dependency direction |
| Performance | performance-engineer | thermo-nuclear-performance-review | Complexity, memory, N+1, network, bundle size |

Each review runs with `--depth=deep`.

## Process

1. **Gather context** — diff, changed files, PR description
2. **Launch 4 parallel reviews** — one per axis, each with full codebase context
3. **Collect findings** — each axis produces a structured report
4. **Synthesize** — merge into a single unified report with:
   - Cross-axis findings (e.g., security issue that also hurts performance)
   - Prioritized action items
   - Overall assessment: **APPROVE**, **CHANGES_REQUESTED**, or **NEEDS_DISCUSSION**

## Parallel Execution by Harness

### Anthropic / Claude
Use `crew_agent` with 4 parallel subagents:
```ts
const reviews = await Promise.all([
  crew_agent({ prompt: "Review code quality...", subagent_type: "reviewer" }),
  crew_agent({ prompt: "Review security...", subagent_type: "security-reviewer" }),
  // ...
]);
```

### Cursor
Use `Agent.create` with cloud runtime and 4 parallel agents.

### OpenAI / Codex
Use `Runner.run()` with 4 parallel `Agent` instances.

### OpenCode
Use 4 parallel prompt sessions.

### Pi
Use `crew_agent` with `run_in_background: true` for each axis.

## Unified Report Format

```markdown
# Deep Review Report

## Summary
- **Overall**: CHANGES_REQUESTED
- **Critical issues**: 3
- **Warnings**: 12
- **Cross-axis findings**: 2

## Code Quality
[Findings from code-reviewer with --depth=deep]

## Security
[Findings from security-scanner with --depth=deep]

## Architecture
[Findings from architect-advisor with --depth=deep]

## Performance
[Findings from performance-engineer with --depth=deep]

## Cross-Axis Findings
[Issues that span multiple axes]

## Action Items (Prioritized)
1. [P0] Fix SQL injection (Security + Code Quality)
2. [P0] Split 1,200-line file (Code Quality + Architecture)
3. [P1] Add connection pooling (Performance)
...

## Approval Bar
- No critical security vulnerabilities
- No structural regressions
- No performance degradation
- No files over 1k lines without justification
```

## When to Use

- **Before major releases** — catch everything
- **For critical paths** — auth, payments, data pipelines
- **When onboarding new team members** — establish quality bar
- **After large refactors** — verify nothing broke across axes

## When NOT to Use

- **Trivial changes** — use `/ai-eng/review` instead
- **Tight deadlines** — deep review takes 4x the tokens
- **Established code** — use targeted `/ai-eng/review --type=security`

$ARGUMENTS