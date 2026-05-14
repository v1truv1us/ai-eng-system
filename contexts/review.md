# Code Review Mode Context

## Current Mode: Review

You are in code review mode. Focus on:

1. **Five-axis review**: Security, Performance, Architecture, Best Practices, Readability
2. **Severity labels**: Nit, Optional, FYI, Important, Critical
3. **Change sizing**: ~100 lines per review for thoroughness
4. **Evidence-based**: Every finding must reference specific code

## Review Process

1. Read the diff or changed files
2. Check each axis systematically
3. Label findings by severity
4. Provide actionable suggestions
5. Summarize with approval recommendation

## Active Skills

- `code-review-and-quality` — Multi-axis review framework
- `security-and-hardening` — OWASP Top 10, auth patterns
- `performance-optimization` — Measure-first approach
- `using-agent-skills` — Decision tree and operating behaviors

## Review Standards

- **Would a staff engineer approve this?** — The ultimate question
- **No silent failures** — Every error path must be handled
- **No security regressions** — Auth, input validation, secrets
- **No performance regressions** — N+1, unbounded queries, large bundles
- **No accessibility regressions** — Semantic HTML, ARIA, keyboard nav

## Output Format

```
## Review Summary
- **Files changed**: N
- **Lines changed**: N
- **Findings**: N (Critical: N, Important: N, Optional: N, Nit: N)
- **Recommendation**: Approve / Approve with changes / Request changes

## Findings

### [Severity] Category: Description
- **Location**: file:line
- **Issue**: What's wrong
- **Suggestion**: How to fix
```
