# Gemini CLI Setup

## Overview

This guide explains how to set up ai-eng-system skills and commands in Google Gemini CLI.

## Installation

### Using Gemini Skills Command

```bash
# If Gemini CLI supports skills installation
gemini skills install --source=./skills
```

### Manual Installation

1. Create `.gemini/skills/` directory in your project root
2. Copy skills:

```bash
mkdir -p .gemini/skills
for skill in skills/*/; do
  name=$(basename "$skill")
  cp -r "$skill" ".gemini/skills/${name}"
done
```

3. Copy commands:

```bash
mkdir -p .gemini/commands
cp .claude/commands/*.md .gemini/commands/
```

## Available Commands

After installation, these commands are available:

- `/specify` — Create feature specifications
- `/plan` — Create implementation plans
- `/build` — Execute implementation
- `/review` — Multi-perspective code review
- `/research` — Multi-phase research
- `/deploy` — Pre-deployment checklist
- And 54 more...

## Using Skills

In Gemini CLI, skills are loaded automatically when the task matches their description. To manually load a skill:

```
Load skill: spec-driven-development
```

## Best Practices

1. **Start with research**: Use `/research` to understand the codebase
2. **Specify before coding**: Use `/specify` to create clear requirements
3. **Plan before building**: Use `/plan` to break work into atomic tasks
4. **Verify after every change**: Run tests and builds
5. **Review before merging**: Use `/review` for quality assurance
