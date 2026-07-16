---
name: ai-eng/create-agent
description: Create a new OpenCode agent with AI assistance. Uses agent-creator for intelligent agent generation.
agent: agent-creator
subtask: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Create Agent Command

Create a new OpenCode agent using AI assistance.

 design agent systematically, ensuring clear triggering logic, proper expertise definition, and smooth integration with existing system.

## Process
1. **Understand Requirements**: What should the agent do?
2. **Generate Agent**: Use @agent-creator to create properly formatted agent
3. **Save Agent**: Write to appropriate location
4. **Validate**: Run basic validation checks

## Usage

```bash
/ai-eng/create-agent "code reviewer that checks for security issues"
```

## Output Location

Agent will be saved to:
- Project-local: `.opencode/agent/[name].md`
- Global: `~/.config/opencode/agent/[name].md`
- Canonical content: `content/agents/[name].md`

## Examples

### Security Review Agent
```bash
/ai-eng/create-agent "security scanner that finds vulnerabilities"
```

### Documentation Agent
```bash
/ai-eng/create-agent "technical writer for API documentation"
```

### Data Analysis Agent
```bash
/ai-eng/create-agent "data analyst for database queries"
```

The agent-creator will handle platform-specific formatting and ensure the agent follows best practices for triggering, expertise, and integration.
