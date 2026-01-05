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

# Ralph Wiggum iteration for thorough reviews
/ai-eng/review src/ --ralph --ralph-show-progress

# Ralph Wiggum with security focus and custom iterations
/ai-eng/review . --focus=security --ralph --ralph-max-iterations 15 --ralph-verbose
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
| `--ralph` | Enable Ralph Wiggum iteration mode for persistent review refinement |
| `--ralph-max-iterations <n>` | Maximum iterations for Ralph Wiggum mode [default: 10] |
| `--ralph-completion-promise <text>` | Custom completion promise text [default: "Review is comprehensive and all findings addressed"] |
| `--ralph-quality-gate <command>` | Command to run after each iteration for quality validation |
| `--ralph-stop-on-gate-fail` | Stop iterations when quality gate fails [default: continue] |
| `--ralph-show-progress` | Show detailed iteration progress |
| `--ralph-log-history <file>` | Log iteration history to JSON file |
| `--ralph-verbose` | Enable verbose Ralph Wiggum iteration output |

## Phase 0: Prompt Refinement (CRITICAL - Do First)

**You MUST invoke the `prompt-refinement` skill before proceeding.**

**How to invoke:**
1. Load the skill from: `skills/prompt-refinement/SKILL.md`
2. Use phase: `review`
3. Follow the TCRO framework: Task, Context, Requirements, Output

### Ralph Wiggum Integration

If `--ralph` flag is used, also invoke the `ralph-wiggum` skill:

**Load Ralph Wiggum skill from:** `skills/workflow/ralph-wiggum/SKILL.md`

**Ralph Wiggum Review Cycle:**
1. **Initial Review** - Run comprehensive review with all perspectives
2. **Gap Analysis** - Identify missed issues, insufficient coverage
3. **Iterative Deepening** - Focus review on problematic areas or different perspectives
4. **Quality Validation** - Run quality gate if specified
5. **Completion Check** - Continue until completion promise met or max iterations reached

**Default Review Completion Promise:** "Review is comprehensive and all findings addressed"

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

## Ralph Wiggum Iteration Mode

When `--ralph` flag is enabled, the review process follows a persistent refinement cycle:

### Ralph Wiggum Review Cycle

**Iteration Process:**
1. **Execute Standard Review** - Run complete review with all perspectives
2. **Gap Analysis** - Review findings for:
   - Critical issues that may have been missed
   - Insufficient coverage of complex areas
   - Areas needing deeper security or performance analysis
   - Findings that lack clear recommendations
3. **Targeted Deepening** - Focus next iteration on identified gaps:
   - Add new perspectives (e.g., focus on accessibility, compliance)
   - Deep-dive into complex components
   - Re-review with different expert lenses
   - Strengthen recommendations and remediation steps
4. **Quality Gate** - Run quality gate command if specified
5. **Progress Update** - Log iteration improvements and continue
6. **Completion Check** - Stop when:
   - Review comprehensiveness promise is met
   - Quality gates consistently pass
   - Maximum iterations reached

### Ralph Wiggum Quality Gates

**Review Quality Gate Examples:**
```bash
# Check for critical findings
rg '"severity": "critical"' code-review-report.json

# Validate recommendations completeness
rg '"recommendation"' code-review-report.json | wc -l

# Check file coverage
rg '"location"' code-review-report.json | sort | uniq | wc -l
```

### Progress Tracking

**Iteration Metrics:**
- Iteration number and completion status
- New findings discovered per iteration
- Severity distribution (critical/major/minor)
- Perspectives covered (security, performance, etc.)
- Quality gate pass/fail status
- Review comprehensiveness score

**Example Progress Output:**
```
🔄 Ralph Wiggum Review Iteration 4/10
🔍 Findings: 23 total (+4 this iteration)
🚨 Critical issues: 2 (new this iteration)
⚠️ Major issues: 8 (+1 this iteration)
📁 Files reviewed: 15 (+2 deep-dived this iteration)
✅ Quality gate: PASSED
🎯 Review coverage: 95% (improving)
```

### Ralph Wiggum Implementation Notes

**Review-Specific Considerations:**

- **Escalating Focus**: Each iteration should examine different aspects or deepen analysis
- **Severity Validation**: Critical findings should trigger immediate attention
- **Recommendation Quality**: Each finding should have actionable, specific recommendations
- **Cross-Perspective Coverage**: Ensure multiple expert lenses are applied

**Default Settings:**
- **Max Iterations**: 10 (sufficient for thorough review refinement)
- **Completion Promise**: "Review is comprehensive and all findings addressed"
- **Quality Gate**: Check for critical findings and recommendations completeness
- **Progress Tracking**: Always enabled in Ralph mode

**Best Practices:**
- Start with broad review, then focus on high-risk areas
- Add new perspectives each iteration (security → performance → accessibility)
- Deep-dive into complex components that may hide issues
- Strengthen recommendations with specific remediation steps
- Validate that all critical findings have clear, actionable fixes

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
