---
name: ai-eng/create-skill
description: Create a new OpenCode skill with AI assistance. Uses skill-creator for intelligent skill generation.
agent: skill-creator
subtask: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Create Skill Command

Create a new OpenCode skill using AI assistance.

 design skill systematically, ensuring clear triggering conditions, proper knowledge structure, and effective progressive disclosure.

## Process
1. **Understand Requirements**: What domain knowledge should the skill provide?
2. **Generate Skill**: Use @skill-creator to create properly formatted skill
3. **Save Skill**: Write to appropriate location
4. **Validate**: Run basic validation checks

## Usage

```bash
/ai-eng/create-skill "database optimization for PostgreSQL"
```

## Output Location

Skill will be saved to:
- Project-local: `.opencode/skill/[skill-name]/SKILL.md`
- Global: `~/.config/opencode/skill/[skill-name]/SKILL.md`
- Canonical content: `content/skills/[skill-name]/SKILL.md`

## Examples

### Database Skill
```bash
/ai-eng/create-skill "database query optimization"
```

### API Integration Skill
```bash
/ai-eng/create-skill "REST API client for external service"
```

### Security Skill
```bash
/ai-eng/create-skill "security vulnerability scanning"
```

The skill-creator will handle progressive disclosure, proper frontmatter, and ensure compatibility with opencode-skills plugin.
