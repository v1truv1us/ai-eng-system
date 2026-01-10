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

Take a deep breath and approach this review systematically. Examine code from multiple expert perspectives, identify issues across all quality dimensions, and provide actionable recommendations.

## Why This Matters

Code runs in production, and bugs cause outages. Security issues compromise data. Performance problems frustrate users. Poor code quality makes maintenance difficult. This review task is critical for catching issues before they reach production and maintaining codebase health.

## The Challenge

I bet you can't provide comprehensive review without being overly critical or missing important issues. The challenge is balancing thoroughness with constructiveness, identifying real problems while avoiding noise. Success means review catches real issues, provides actionable guidance, and helps maintainers improve code quality.

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

Load `skills/prompt-refinement/SKILL.md` and use phase: `review` to transform your prompt into structured TCRO format (Task, Context, Requirements, Output). If using `--ralph`, also load `skills/workflow/ralph-wiggum/SKILL.md` for iterative review refinement.

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

After completing review, rate your confidence in findings comprehensiveness (0.0-1.0). Identify any uncertainties about severity classifications, areas where review coverage may have been insufficient, or assumptions about code context. Note any perspectives that should have been applied or findings that may be false positives.
 
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
