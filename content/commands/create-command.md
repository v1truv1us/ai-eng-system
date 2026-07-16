---
name: ai-eng/create-command
description: Create a new OpenCode command with AI assistance. Uses command-creator for intelligent command generation.
agent: command-creator
subtask: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Create Command Command

Create a new OpenCode command using AI assistance.

 design command systematically, ensuring clear argument structure, proper shell integration, and comprehensive documentation.

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
- Canonical content: `content/commands/[name].md`

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
