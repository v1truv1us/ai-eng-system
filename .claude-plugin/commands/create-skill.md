---
name: ai-eng/create-skill
description: Create a new OpenCode skill with AI assistance. Uses skill-creator for intelligent skill generation.
agent: skill-creator
subtask: true
---

# Create Skill Command

Create a new OpenCode skill using AI assistance.

Take a deep breath and design skill systematically, ensuring clear triggering conditions, proper knowledge structure, and effective progressive disclosure.

## Why This Matters

Skills provide specialized knowledge to agents across many interactions. Poorly designed skills with weak triggering or bloated content waste tokens, provide inconsistent guidance, and overwhelm context. This skill design task is critical for building reusable knowledge resources.

## The Challenge

I bet you can't balance depth with conciseness in skill design. The challenge is providing comprehensive knowledge while using progressive disclosure to keep token usage efficient. Success means skill loads at right moment, provides accurate guidance, and remains focused on specific domain.

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
- Ferg content: `content/skills/[skill-name]/SKILL.md`

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

After creating the skill, rate your confidence in its triggering accuracy and knowledge quality (0.0-1.0). Identify any uncertainties about triggering conditions, knowledge gaps, or areas where progressive disclosure may be insufficient. Note any token efficiency concerns or integration challenges.