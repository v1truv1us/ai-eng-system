# Skills Best Practices Audit & Simplify Skill Plan

**Date:** 2026-03-23
**Scope:** Full fix — all structural issues + new simplify skill
**Reference:** https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Phase 1: Create the `/simplify` Skill

Create a canonical `skills/simplify/SKILL.md` following the Claude Code bundled skill pattern.

### Claude Code `/simplify` Pattern

The bundled `/simplify` skill:
- Reviews recently changed files for code reuse, quality, and efficiency
- Spawns **three review agents in parallel**
- Aggregates findings
- Applies fixes
- Accepts optional focus argument: `/simplify focus on memory efficiency`

### Implementation

Create `skills/simplify/SKILL.md`:

```yaml
---
name: simplify
description: "Review recently changed files for code reuse, quality, and efficiency issues, then fix them. Use when simplifying code, removing complexity, improving readability, or after making changes. Trigger phrases: 'simplify', 'clean up', 'reduce complexity', 'improve readability'."
argument-hint: "[focus area]"
version: 1.0.0
---

# Simplify Skill

Review recently changed files for code reuse, quality, and efficiency issues, then fix them.

## Workflow

1. **Identify changes**: Run `git diff --stat HEAD~1` and `git diff HEAD~1` to find recently changed files
2. **Spawn three review agents in parallel**:
   - **Code reuse agent**: Detect duplicated logic, extractable functions, missed abstractions
   - **Quality agent**: Find unnecessary complexity, dead code, poor naming, missing error handling
   - **Efficiency agent**: Identify performance issues, redundant allocations, unnecessary iterations
3. **Aggregate findings**: Deduplicate and prioritize by impact
4. **Apply fixes**: Make changes, ensuring tests still pass
5. **Verify**: Run linter and type checker

## Focus Areas (optional)

Pass a focus argument to narrow scope:
- `/simplify focus on memory efficiency`
- `/simplify focus on readability`
- `/simplify focus on reducing duplication`
```

**Files to create:**
- `skills/simplify/SKILL.md` (~50-80 lines)

---

## Phase 2: Fix Ghost References

### 2a. `ralph-wiggum` — Missing Template

**Problem:** `skills/workflow/ralph-wiggum/SKILL.md:121` references `templates/ralph-wiggum-prompts.md` but the directory doesn't exist.

**Fix:** Create `skills/workflow/ralph-wiggum/templates/ralph-wiggum-prompts.md` with the 5 prompt templates referenced in the SKILL.md:
1. TDD Implementation
2. Bug Fixing
3. Refactoring
4. Feature Implementation
5. Quality Gate Passing

Each template should include: requirements, process steps, success criteria, completion promise.

### 2b. `agent-analyzer` — Empty Reference Directories

**Problem:** `~/.claude/skills/agent-analyzer/SKILL.md` references files in `scripts/`, `references/`, `assets/` that don't exist.

**Options:**
- **Option A (Recommended):** Create placeholder files with actual content matching what SKILL.md describes
- **Option B:** Remove references from SKILL.md and simplify

**Fix:** Option A — create minimal functional content:

```
~/.claude/skills/agent-analyzer/
├── SKILL.md
├── scripts/
│   ├── analyze-performance.py    # Basic performance report generator
│   ├── debug-agent.sh            # Agent debugging helper
│   ├── workflow-optimizer.py      # DAG analysis tool
│   └── pattern-detector.py        # Pattern detection script
├── references/
│   ├── metrics-guide.md           # Metrics reference
│   ├── pattern-catalog.md         # Known patterns
│   ├── optimization-strategies.md # Optimization techniques
│   └── debugging-guide.md         # Debugging procedures
└── assets/
    ├── dashboard-template.html    # Performance dashboard
    ├── report-template.md         # Report template
    └── workflow-visualizer.html   # Workflow visualization
```

### 2c. `code-review` — Empty Reference Directories

**Problem:** `~/.claude/skills/code-review/SKILL.md` references files in `scripts/`, `references/`, `assets/` that don't exist.

**Fix:** Same approach as 2b — create functional content:

```
~/.claude/skills/code-review/
├── SKILL.md
├── scripts/
│   ├── pre-commit-review.sh       # Git pre-commit hook
│   ├── ci-review.sh               # CI/CD integration
│   └── review-report-generator.py # Report formatter
├── references/
│   ├── severity-classification.md # Severity guidelines
│   ├── auto-fix-capabilities.md   # Auto-fixable issues list
│   ├── framework-rules.md         # Framework-specific rules
│   └── best-practices.md          # Code review best practices
└── assets/
    ├── review-template.md         # Report template
    ├── .codereview.yml            # Config example
    └── quality-gates.yml          # CI/CD quality gate configs
```

---

## Phase 3: Improve Thin Skills

### 3a. `coolify-deploy` — Too Thin

**Problem:** Only 40 lines, description too vague: "Deploy to Coolify with best practices"

**Fix:** Expand to include:
- Deployment checklist with concrete steps
- Build/start command examples
- Environment variable configuration
- Health check setup
- Rollback instructions
- Better description with trigger phrases

### 3b. `git-worktree` — Too Thin

**Problem:** Only 43 lines, description generic: "Manage Git worktrees for parallel development"

**Fix:** Expand to include:
- Common workflow examples
- Integration with ai-eng-system's agent coordination
- Cleanup patterns
- Best practices for naming
- Better description with trigger phrases

---

## Phase 4: Description Quality Pass

Update skill descriptions to follow best practices:
- Write in third person
- Include trigger phrases
- Be specific about when to use

**Skills to update:**
| Skill | Current | Issue |
|-------|---------|-------|
| `coolify-deploy` | "Deploy to Coolify with best practices" | No trigger phrases, too vague |
| `git-worktree` | "Manage Git worktrees for parallel development" | No trigger phrases |
| `verbalized-sampling` | OK | — |
| `database-optimization` | OK | — |
| `docker-container-management` | OK | — |

---

## Phase 5: Cross-Reference Integration

Add progressive disclosure cross-references between related skills:

1. `incentive-prompting` ←→ `prompt-refinement` — Already partially done, verify
2. `comprehensive-research` ←→ `deep-web-research` ←→ `research-companion` — Add references
3. `ralph-wiggum` ←→ `git-worktree` — Already referenced, verify link works
4. `content-optimization` ←→ `incentive-prompting` — Already done
5. `simplify` ←→ `code-review` ←→ `text-cleanup` — Add references in new simplify skill

---

## Phase 6: Evaluation Scaffolding

Create evaluation templates for skills that currently lack them. At minimum, create `evals/` directories for the most critical skills:

1. `skills/simplify/evals/` — 3 evaluation scenarios
2. `skills/comprehensive-research/evals/` — 3 evaluation scenarios
3. `skills/text-cleanup/evals/` — 3 evaluation scenarios

Each eval should follow the format from best practices:
```json
{
  "skills": ["skill-name"],
  "query": "Test scenario description",
  "files": ["test-files/example.ts"],
  "expected_behavior": ["Expected behavior 1", "Expected behavior 2"]
}
```

---

## Execution Order

1. **Phase 1** (simplify skill) — Independent, do first
2. **Phase 2** (ghost references) — Fix 2a first (ralph-wiggum template)
3. **Phase 3** (thin skills) — Can parallelize 3a and 3b
4. **Phase 4** (descriptions) — Quick pass, can batch
5. **Phase 5** (cross-references) — Depends on Phase 1 completion
6. **Phase 6** (evaluations) — Low priority, can defer

---

## Verification

After each phase:
- Run `bun run build` to verify build still works
- Verify SKILL.md files parse correctly (YAML frontmatter valid)
- Check no broken references remain
- Run linter if available

Final verification:
- `bun run validate` — Check all content validates
- `bun run build` — Full build succeeds
- Manual check: all referenced files exist
- Manual check: all descriptions are third-person with trigger phrases
