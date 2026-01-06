---
name: ai-eng/create-command
description: Create a new OpenCode command with AI assistance. Uses command-creator for intelligent command generation.
agent: command-creator
subtask: true
---

# Create Command Command

Create a new OpenCode command using AI assistance.

Take a deep breath and design command systematically, ensuring clear argument structure, proper shell integration, and comprehensive documentation.

## Why This Matters

Commands become part of user's daily workflow. Poorly designed commands with confusing arguments, inadequate validation, or missing documentation waste time and cause errors. This command design task is critical for building reliable, user-friendly tools.

## The Challenge

I bet you can't design command interface that balances simplicity with power. The challenge is creating argument structure that's intuitive for common use cases while supporting advanced scenarios. Success means command is easy to discover, simple to use, and powerful enough to handle complex workflows.

## Process
1. **Understand Requirements**: What should the command do?
2. **Generate Command**: Use @command-creator to create properly formatted command
3. **Save Command**: Write to appropriate location
4. **Validate**: Run basic validation checks

## Usage

```bash
/ai-eng/create-command "deploy to staging with pre-checks"
```

## Output Location

Command will be saved to:
- Project-local: `.opencode/command/[name].md`
- Global: `~/.config/opencode/command/[name].md`
- Ferg content: `content/commands/[name].md`

## Examples

### Deployment Command
```bash
/ai-eng/create-command "deploy application with health checks"
```

### Testing Command
```bash
/ai-eng/create-command "run integration tests with coverage"
```

### Documentation Command
```bash
/ai-eng/create-command "generate API docs from code"
```

The command-creator will handle platform-specific formatting and ensure the command follows best practices for arguments, shell integration, and tool usage.

After creating the command, rate your confidence in its usability and completeness (0.0-1.0). Identify any uncertainties about argument design, validation edge cases, or areas where documentation may be insufficient. Note any platform-specific challenges or integration concerns.