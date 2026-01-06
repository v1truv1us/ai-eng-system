---
name: ai-eng/create-tool
description: Create a new OpenCode custom tool with AI assistance. Uses tool-creator for intelligent TypeScript tool generation.
agent: tool-creator
subtask: true
---

# Create Tool Command

Create a new OpenCode custom tool using AI assistance.

Take a deep breath and implement tool systematically, ensuring proper TypeScript types, robust validation, and comprehensive error handling.

## Why This Matters

Custom tools extend system capabilities and are called from agents and commands. Poorly implemented tools with type errors, weak validation, or insufficient error handling break workflows and cause confusing failures. This tool implementation task is critical for reliable system extensions.

## The Challenge

I bet you can't implement a tool that balances flexibility with safety. The challenge is creating tool interface that handles various input scenarios while validating rigorously and failing gracefully. Success means tool works reliably, provides clear error messages, and integrates smoothly with existing patterns.

## Process
1. **Understand Requirements**: What functionality should the tool provide?
2. **Generate Tool**: Use @tool-creator to create properly formatted TypeScript tool
3. **Save Tool**: Write to appropriate location
4. **Validate**: Run basic validation checks

## Usage

```bash
/ai-eng/create-tool "database query executor with connection pooling"
```

## Output Location

Tool will be saved to:
- Project-local: `.opencode/tool/[name].ts`
- Global: `~/.config/opencode/tool/[name].ts`
- Ferg content: `content/tools/[name].ts`

## Examples

### Database Tool
```bash
/ai-eng/create-tool "PostgreSQL query builder with parameter binding"
```

### File Processing Tool
```bash
/ai-eng/create-tool "CSV processor with validation and transformation"
```

### API Client Tool
```bash
/ai-eng/create-tool "REST API client with retry logic and authentication"
```

### System Integration Tool
```bash
/ai-eng/create-tool "Docker container management with status monitoring"
```

The tool-creator will handle TypeScript compilation, Zod validation, error handling, and OpenCode tool integration patterns.

After creating the tool, rate your confidence in its implementation quality and reliability (0.0-1.0). Identify any uncertainties about type safety, validation edge cases, or error handling gaps. Note any TypeScript compilation concerns or integration challenges that could affect reliability.