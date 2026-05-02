# Kiro IDE Setup

## Overview

This guide explains how to set up ai-eng-system skills in Kiro IDE.

## Installation

### Using Kiro Skills

1. Create `.kiro/skills/` directory in your project root
2. Copy skills:

```bash
mkdir -p .kiro/skills
for skill in skills/*/; do
  name=$(basename "$skill")
  cp -r "$skill" ".kiro/skills/${name}"
done
```

### Using Kiro Rules

1. Create `.kiro/rules/` directory
2. Copy rules:

```bash
mkdir -p .kiro/rules
cp -r rules/* .kiro/rules/
```

## Available Skills

After installation, the following skills are available:

- `spec-driven-development` — Write specs before coding
- `test-driven-development` — Red-Green-Refactor workflow
- `incremental-implementation` — Thin vertical slices
- `code-review-and-quality` — Multi-axis review
- `debugging-and-error-recovery` — Root-cause debugging
- `security-and-hardening` — OWASP Top 10 prevention
- `performance-optimization` — Measure-first optimization
- `git-workflow-and-versioning` — Trunk-based development
- `ci-cd-and-automation` — Shift Left, quality gates
- And 33 more...

## Using Skills

In Kiro, skills are automatically activated when the task matches their description. To manually activate:

```
Use skill: spec-driven-development
```

## Best Practices

1. **Follow the workflow**: research → specify → plan → work → review
2. **Load skills contextually**: Skills auto-activate based on task context
3. **Verify after changes**: Run tests, lint, and typecheck
4. **Keep commits small**: ~100 lines per commit
