---
name: ai-eng/review
description: Run comprehensive code review with multiple perspectives
agent: review
version: 2.0.0
inputs:
  - name: files
    type: string[]
    required: false
    description: Files to review
outputs:
  - name: review_report
    type: file
    format: JSON
    description: Review report saved to code-review-report.json
---

# Review Command

Review code changes: $ARGUMENTS

> **Phase 5 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

## Quick Start

```bash
/ai-eng/review src/
/ai-eng/review src/ --type=security --severity=high
/ai-eng/review . --focus=performance --verbose
```

## Options

| Option | Description |
|--------|-------------|
| `--swarm` | Use Swarms multi-agent orchestration |
| `-t, --type <type>` | Review type (full\|incremental\|security\|performance\|frontend) [default: full] |
| `-s, --severity <severity>` | Minimum severity level (low\|medium\|high\|critical) [default: medium] |
| `-f, --focus <focus>` | Focused review (security\|performance\|frontend\|general) |
| `-o, --output <file>` | Output report file [default: code-review-report.json] |
| `-v, --verbose` | Enable verbose output |

## Phase 0: Prompt Refinement (CRITICAL - Do First)

**You MUST invoke the `prompt-refinement` skill before proceeding.**

**How to invoke:**
1. Load the skill from: `skills/prompt-refinement/SKILL.md`
2. Use phase: `review`
3. Follow the TCRO framework: Task, Context, Requirements, Output

## Perspectives

#### Subagent Communication Protocol (Minimal)

If you spawn reviewer subagents in parallel, include:

```text
<CONTEXT_HANDOFF_V1>
Goal: Review changes for (focus area)
Files under review: (paths)
Constraints: (e.g., no code changes; read-only)
Deliverable: findings with file:line evidence
Output format: RESULT_V1
</CONTEXT_HANDOFF_V1>
```

Require:

```text
<RESULT_V1>
RESULT:
FINDINGS: (bullets with severity)
EVIDENCE: (file:line)
RECOMMENDATIONS:
CONFIDENCE: 0.0-1.0
</RESULT_V1>
```

- **Code Quality**: Clean code, SOLID principles, DRY
- **Performance**: Time/space complexity, caching opportunities
- **SEO**: Meta tags, structured data, Core Web Vitals impact
- **Security**: Input validation, authentication, data exposure
- **Architecture**: Component boundaries, coupling, scalability

## Output Format

For each finding provide:

| Field | Description |
|-------|-------------|
| Severity | critical, major, minor |
| Location | file:line |
| Issue | Description of the problem |
| Recommendation | Suggested fix |

## Summary

End with overall assessment: APPROVE, CHANGES_REQUESTED, or NEEDS_DISCUSSION.

## Execution

Run a review using:

```bash
bun run scripts/run-command.ts review "$ARGUMENTS" [options]
```

For example:
- `bun run scripts/run-command.ts review "src/" --type=security --severity=high --output=security-review.json`
- `bun run scripts/run-command.ts review "." --focus=performance --verbose`

## Perspectives

Review code from multiple expert perspectives:

- **Code Quality**: Clean code, SOLID principles, DRY
- **Performance**: Time/space complexity, caching opportunities
- **SEO**: Meta tags, structured data, Core Web Vitals impact
- **Security**: Input validation, authentication, data exposure
- **Architecture**: Component boundaries, coupling, scalability

When spawning reviewer subagents, use the Context Handoff Protocol:

```
<CONTEXT_HANDOFF_V1>
Goal: Review changes for (focus area)
Files under review: (paths)
Constraints: (e.g., no code changes; read-only)
Deliverable: findings with file:line evidence
Output format: RESULT_V1
</CONTEXT_HANDOFF_V1>
```

## Output Format

For each finding provide:

| Field | Description |
|-------|-------------|
| Severity | critical, major, minor |
| Location | file:line |
| Issue | Description of the problem |
| Recommendation | Suggested fix |

$ARGUMENTS
