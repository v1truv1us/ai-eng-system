# Windsurf IDE Setup

## Overview

This guide explains how to set up ai-eng-system skills in Windsurf IDE (by Codeium).

## Installation

### Using Windsurf Rules

1. Create `.windsurf/rules/` directory in your project root
2. Copy key skills into the rules directory:

```bash
mkdir -p .windsurf/rules
for skill in skills/*/; do
  name=$(basename "$skill")
  cp "$skill/SKILL.md" ".windsurf/rules/${name}.md"
done
```

### Using Cascade Custom Instructions

1. Open Windsurf Settings → Cascade → Custom Instructions
2. Add the following to your custom instructions:

```
Follow the ai-eng-system workflow:
1. Research before implementing
2. Specify before planning
3. Plan before building
4. Verify after every change
5. Review before merging

Available skills are in the skills/ directory.
Load the relevant skill for each task.
```

## Available Skills

The following skills are available after installation:

- **DEFINE**: `idea-refine`, `spec-driven-development`
- **PLAN**: `planning-and-task-breakdown`, `comprehensive-research`
- **BUILD**: `incremental-implementation`, `test-driven-development`, `source-driven-development`, `frontend-ui-engineering`, `api-and-interface-design`, `context-engineering`
- **VERIFY**: `browser-testing-with-devtools`, `debugging-and-error-recovery`
- **REVIEW**: `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization`
- **SHIP**: `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `shipping-and-launch`

## Best Practices

1. **Use Cascade with skill context**: Open the relevant skill file when working on related tasks
2. **Follow the workflow**: DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP
3. **Verify changes**: Run tests and builds after every modification
4. **Keep commits atomic**: ~100 lines per commit with clear messages
