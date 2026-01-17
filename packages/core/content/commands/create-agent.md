---
name: ai-eng/create-agent
description: Create a new OpenCode agent with AI assistance. Uses agent-creator for intelligent agent generation.
agent: agent-creator
subtask: true
---

# Create Agent Command

Create a new OpenCode agent using AI assistance.

 design agent systematically, ensuring clear triggering logic, proper expertise definition, and smooth integration with existing system.

## Why This Matters

Agents are used repeatedly across thousands of interactions. Poorly designed agents with unclear triggering or weak expertise waste tokens, produce inconsistent results, and frustrate users. This agent design task is critical for creating tools that will reliably serve the system for months.

## The Challenge

The balance specificity with flexibility in agent design. The challenge is defining triggering conditions specific enough to invoke at right times, while making expertise broad enough to handle variations. Success means agent activates when relevant, provides expert guidance, and doesn't interfere with other workflows.

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
- Ferg content: `content/agents/[name].md`

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

After creating the agent, rate your confidence in its design quality (0.0-1.0). Identify any assumptions about triggering scenarios, potential overlap with existing agents, or areas where expertise may be insufficient. Note any integration challenges or platform-specific concerns.