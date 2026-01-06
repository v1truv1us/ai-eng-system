---
name: ai-eng/specify
description: Create a feature specification using structured requirements gathering
agent: plan
version: 2.0.0
inputs:
  - name: feature
    type: string
    required: false
    description: Feature description or name
  - name: fromResearch
    type: string
    required: false
    description: Path to research document
outputs:
  - name: spec_file
    type: file
    format: Markdown
    description: Specification saved to specs/[feature]/spec.md
---

# Specify Command

Create a comprehensive feature specification: $ARGUMENTS

> **Phase 2 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Review

Take a deep breath and gather requirements systematically. Understand user needs, clarify ambiguities, and create detailed specification with clear acceptance criteria.

## Why This Matters

Poor specifications lead to wrong implementations, wasted time, and rework. Missing requirements mean features don't meet user needs. Ambiguous acceptance criteria cause confusion during development and testing. This specification task is critical for ensuring implementation solves the right problem.

## The Challenge

I bet you can't create specification that's comprehensive without being overly detailed. The challenge is capturing all requirements while keeping specification manageable and not over-constraining implementation. Success means spec has clear acceptance criteria, covers edge cases, and allows appropriate implementation flexibility.

## Quick Start

```bash
/ai-eng/specify "user authentication system"
/ai-eng/specify "payment integration" --from-research=docs/research/payment.md
/ai-eng/specify "api design" --template=api

# Ralph Wiggum iteration for complex features
/ai-eng/specify "multi-tenant architecture" --ralph --ralph-show-progress

# Ralph Wiggum with custom quality gate
/ai-eng/specify "real-time collaboration" --ralph --ralph-quality-gate="rg '\[NEEDS CLARIFICATION\]' specs/*/spec.md" --ralph-stop-on-gate-fail
```

## Options

| Option | Description |
|--------|-------------|
| `--from-research <path>` | Use existing research document as context |
| `--template <name>` | Use a specific specification template |
| `--output <path>` | Custom output path [default: `specs/[feature]/spec.md`] |
| `--no-confirmation` | Skip confirmation prompts |
| `--verbose` | Show detailed process |
| `--ralph` | Enable Ralph Wiggum iteration mode for persistent specification refinement |
| `--ralph-max-iterations <n>` | Maximum iterations for Ralph Wiggum mode [default: 10] |
| `--ralph-completion-promise <text>` | Custom completion promise text [default: "Specification is complete and ready for implementation"] |
| `--ralph-quality-gate <command>` | Command to run after each iteration for quality validation |
| `--ralph-stop-on-gate-fail` | Stop iterations when quality gate fails [default: continue] |
| `--ralph-show-progress` | Show detailed iteration progress |
| `--ralph-log-history <file>` | Log iteration history to JSON file |
| `--ralph-verbose` | Enable verbose Ralph Wiggum iteration output |

## Phase 0: Prompt Refinement (CRITICAL - Do First)

Load `skills/prompt-refinement/SKILL.md` and use phase: `specify` to transform your prompt into structured TCRO format (Task, Context, Requirements, Output). See `templates/specification.md` for output structure.

## Specification Structure

See `templates/specification.md` for complete template with:
- Overview, Context (personas, system, research)
- User Stories with acceptance criteria
- Non-Functional Requirements (security, performance, availability, maintainability, compliance, accessibility)
- Open Questions and Success Criteria

Validate specification against:
- All user stories have acceptance criteria
- Non-functional requirements defined (security, performance, maintainability)
- No unresolved [NEEDS CLARIFICATION] markers
- All requirements are testable and unambiguous
- Success criteria are specific and measurable

Confirm with user before writing to file.

## Output Structure

```
specs/[feature-name]/
└── spec.md
```

## Integration

### Feeds Into
- `/ai-eng/plan` - Reads spec.md to create implementation plan
- `/ai-eng/work` - Validates task completion against spec acceptance criteria

### Reads From
- `CLAUDE.md` - Project context and philosophy
- `docs/research/*.md` - Optional research context via `--from-research`

## Example Usage

### Example 1: Simple Feature Specification

```bash
# User provides vague input
/ai-eng/specify "user authentication"

# Step 0: Prompt refinement skill asks clarifying questions
# (see examples in prompt-refinement/templates/specify.md)

# After clarification, generates spec
```

**Output:**
```
specs/auth/spec.md

# User Authentication System

## Overview
Provides secure user account creation, login, and password reset functionality
for the application.

## User Stories

### US-001: User Registration
**As a** new user
**I want** to create an account
**So that** I can access the application

#### Acceptance Criteria
- [ ] User can register with email and password
- [ ] Email format is validated
- [ ] Password must be at least 8 characters
- [ ] User account is created in database
- [ ] User receives confirmation email

### US-002: User Login
**As a** registered user
**I want** to log in with email and password
**So that** I can access my account

#### Acceptance Criteria
- [ ] User can login with correct credentials
- [ ] Invalid credentials show error message
- [ ] Login rate limited to 5 attempts per minute

## Non-Functional Requirements

### Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens signed with RS256
- GDPR-compliant data handling

### Performance
- Login completes within 200ms (p95)
- Supports 500 login requests per second

## Success Criteria
- [ ] All user stories have acceptance criteria
- [ ] All non-functional requirements defined
- [ ] Ready for planning phase
```

### Example 2: Spec with Research Context

```bash
# User specifies research to use
/ai-eng/specify "API caching layer" --from-research=docs/research/2025-12-26-caching-patterns.md

# Specification incorporates research findings
```

**Output includes:**
```markdown
## Context

### Research Context
Key findings from docs/research/2025-12-26-caching-patterns.md:

1. **Recommended Cache Strategy**: Redis for in-memory caching
   - Pros: Fast sub-millisecond response times
   - Cons: Additional infrastructure complexity
2. **Cache Invalidation**: Time-to-live (TTL) + explicit invalidation
   - TTL: 5 minutes for user data, 30 minutes for static content
3. **Implementation Pattern**: Middleware-based cache interceptor
   - Place before route handlers
   - Check cache before hitting database
   - Set cache after successful database query

Recommendation: Use Redis with middleware pattern and 5-minute TTL for dynamic data
```

## Best Practices

### Writing User Stories

Use the "As a... I want... So that..." format consistently:

**Bad:**
```markdown
Users should be able to reset passwords
```

**Good:**
```markdown
**As a** registered user who forgot their password
**I want** to reset my password via email
**So that** I can regain access to my account
```

### Writing Acceptance Criteria

Make criteria specific, measurable, and testable:

**Bad:**
```markdown
- [ ] Login works
- [ ] Fast performance
```

**Good:**
```markdown
- [ ] POST /api/auth/login accepts email and password
- [ ] Returns 200 with JWT token for valid credentials
- [ ] Returns 401 for invalid credentials
- [ ] Login completes within 200ms (p95)
```

### Marking Ambiguities

Never guess or make assumptions. Always mark unclear requirements:

```markdown
## [NEEDS CLARIFICATION: What OAuth providers?]
The system should support social login.
```

When implementing, if ambiguity is discovered:
1. Add `[NEEDS CLARIFICATION]` marker
2. Don't implement ambiguous requirement
3. Ask user to clarify before proceeding

### Non-Functional Requirements

Always consider these categories:

| Category | Questions to Answer |
|-----------|---------------------|
| Security | Authentication, authorization, encryption, data privacy? |
| Performance | Response times, throughput, concurrency, latency? |
| Availability | Uptime targets, degradation handling, backup/recovery? |
| Maintainability | Logging, monitoring, documentation, debuggability? |
| Compliance | GDPR, SOC2, HIPAA, PCI-DSS, industry regulations? |
| Accessibility | WCAG 2.1 AA, screen readers, keyboard navigation? |

## Troubleshooting

### "Specification too vague"

1. Use `--verbose` flag to see prompt-refinement questions
2. Answer clarifying questions thoroughly
3. Provide concrete examples of desired behavior
4. Reference existing similar features or systems

### "Don't know what to include"

1. Start with core user stories (happy path)
2. Add edge cases and error scenarios
3. Consider non-functional requirements systematically
4. Review CLAUDE.md for project patterns

### "Too many [NEEDS CLARIFICATION] markers"

1. Prioritize high-value questions
2. Make reasonable assumptions and note them
3. Proceed with assumptions, validate later
4. Document assumptions in specification

## Success Criteria

Successful specification achieves:
- ✅ Well-structured user stories with acceptance criteria
- ✅ All non-functional requirements defined
- ✅ Ambiguities marked with [NEEDS CLARIFICATION]
- ✅ Aligned with project philosophy (CLAUDE.md)
- ✅ Ready to feed into `/ai-eng/plan`
- ✅ User reviewed and approved

## Execution

After specification, create a plan using:

```bash
bun run scripts/run-command.ts specify "$ARGUMENTS" [options]
```

For example:
- `bun run scripts/run-command.ts specify "user auth" --from-research=docs/research/auth.md --output=specs/auth/spec.md`
- `bun run scripts/run-command.ts specify "payment system" --template=api --verbose`

After creating specification, rate your confidence in its completeness and clarity (0.0-1.0). Identify any uncertainties about user requirements, areas where acceptance criteria may be ambiguous, or constraints that weren't adequately considered. Note any open questions or clarifications needed from stakeholders.

## Integration

- Can use output from `/ai-eng/research` via `--from-research`
- Feeds into `/ai-eng/plan` for implementation planning

$ARGUMENTS
