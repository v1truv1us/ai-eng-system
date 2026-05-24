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

> **Phase 6 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Verify → Review

Load `skills/code-review-and-quality/SKILL.md` and `skills/prompt-refinement/SKILL.md` (phase: review). If using `--ralph`, also load `skills/workflow/ralph-wiggum/SKILL.md`.

## Quick Start

```bash
/ai-eng/review src/
/ai-eng/review src/ --type=security --severity=high
/ai-eng/review . --focus=performance --verbose
/ai-eng/review src/ --ralph --ralph-show-progress
```

## Options

| Option | Description |
|--------|-------------|
| `-t, --type <type>` | Review type (full\|incremental\|security\|performance\|frontend) [default: full] |
| `-s, --severity <severity>` | Minimum severity level (low\|medium\|high\|critical) [default: medium] |
| `-f, --focus <focus>` | Focused review (security\|performance\|frontend\|general) |
| `-o, --output <file>` | Output report file [default: code-review-report.json] |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode |

## Five-Axis Review

Review changes across five axes (see skill for full detail):
1. **Correctness**: Does it do what the task requires?
2. **Readability**: Are names clear, control flow easy to follow?
3. **Architecture**: Does it follow existing patterns?
4. **Security**: Is untrusted input validated? Are secrets handled safely?
5. **Performance**: Any N+1 patterns, missing pagination, or unbounded operations?

## Output Format

For each finding:

| Field | Description |
|-------|-------------|
| Severity | Critical / Required / Optional / FYI |
| Location | file:line |
| Issue | Description of the problem |
| Recommendation | Suggested fix |

End with overall assessment: **APPROVE**, **CHANGES_REQUESTED**, or **NEEDS_DISCUSSION**.

Rate confidence in findings (0.0-1.0).

$ARGUMENTS
