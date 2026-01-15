---
title: ai-eng ralph CLI
description: Autonomous research and implementation workflow with terminal user interface
sidebar:
  order: 10
---

The `ai-eng ralph` CLI provides a terminal-based interface for autonomous research and implementation workflows with continuous improvement looping.

## Overview

The CLI orchestrates the complete spec-driven development cycle:

1. **Research** - Deep analysis of codebase and documentation
2. **Specify** - Create detailed feature specifications
3. **Plan** - Design implementation strategy
4. **Work** - Execute implementation with quality gates
5. **Review** - Multi-perspective code review

Each iteration automatically improves based on results, creating a continuous loop toward feature completion.

## Installation

Install globally via npm (works with Node.js or Bun):

```bash
npm install -g ai-eng-system

# Run the CLI
ai-eng ralph "implement user authentication"
```

### Quick Start

```bash
# Default to ralph (shortcut)
ai-eng "fix the bug" --print-logs

# Explicit ralph subcommand
ai-eng ralph "implement authentication" --ship

# TUI mode
ai-eng ralph --tui "build a REST API"
```

### Development

Run directly from source (requires Bun):

```bash
# From project root
bun run build
bun src/cli/run.ts "implement user authentication"
```

## Configuration

Create a `.ai-eng/config.yaml` file in your project root:

```yaml
# OpenCode server configuration
opencode:
  serverUrl: "http://localhost:8080"
  apiKey: "your-api-key"
  model: "github-copilot/gpt-5.2"

# Model configuration per task type
models:
  default: "github-copilot/gpt-5.2"
  research: "github-copilot/gpt-5.2"
  planning: "github-copilot/gpt-5.2"
  exploration: "github-copilot/gpt-5.2"
  coding: "github-copilot/gpt-5.2"

# Prompt timeout (milliseconds)
promptTimeout: 120000  # 2 minutes

# Retry configuration
maxRetries: 3
```

### Model Resolution Priority

The CLI uses a 3-tier fallback system for model selection:

1. **Task-specific model** - e.g., `config.models.research` for research tasks
2. **Default model** - `config.models.default` if no task-specific model is set
3. **OpenCode fallback** - `config.opencode.model` from OpenCode configuration

**Important:** If no model is configured, the CLI will throw an error. You must explicitly specify a model in your config.

## Usage

### Basic Workflow

1. **Launch CLI**:
   ```bash
   bun src/cli/run.ts
   ```

2. **Welcome Screen**: Press **ENTER** to begin or **ESC** to exit

3. **Enter Prompt**: Type your research/implementation prompt

4. **Review Optimization**: The CLI applies research-backed prompting techniques:
   - **A** - Approve all optimizations
   - **R** - Reject and use original
   - **M** - Modify optimizations
   - **E** - Edit the prompt manually

5. **Execution**: Watch progress as agents complete each phase

6. **Results**: Review findings and implementation status

7. **Continue or Quit**:
   - **ENTER** - Continue with next iteration
   - **ESC** or **Q** - Exit

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ENTER | Submit prompt / Continue / Approve |
| ESC | Cancel / Exit |
| A | Approve optimizations |
| R | Reject optimizations |
| M | Modify optimizations |
| E | Edit prompt manually |
| Q | Quit |

## Features

### Timeout Handling

Prevents indefinite hangs from stalled API responses:

- Default: 120 seconds (2 minutes)
- Configurable via `promptTimeout` setting
- Automatically applies to all OpenCode prompt operations

### Rate Limit Detection

Intelligent handling of API rate limits:

- Detects HTTP 429 status codes
- Recognizes "rate limit", "quota", "overloaded" error messages
- Applies exponential backoff with jitter

**Backoff Strategy**:

- **Rate limits**: 5s → 10s → 20s → 40s (max 60s)
- **Normal errors**: 1s → 2s → 4s → 8s (max 60s)

### Prompt Optimization

Automatically applies research-backed techniques (+45-115% quality improvement):

- **Expert Persona** - Detailed role with years of experience
- **Step-by-Step Reasoning** - Systematic analysis instruction
- **Stakes Language** - Importance and consequence framing
- **Challenge Framing** - Problem as challenge format
- **Self-Evaluation** - Confidence rating request

### Continuous Iteration

The ralph-wiggum pattern ensures feature completion:

- Executes all 5 phases (Research → Specify → Plan → Work → Review)
- Each phase generates findings and recommendations
- Automatic continuation based on completion criteria
- Stops only when feature is fully implemented

## TUI Screens

1. **Welcome Screen** - Overview and entry point
2. **Prompt Input** - Enter your research query
3. **Optimization Review** - Review enhanced prompts
4. **Execution** - Watch agent progress
5. **Results** - View findings and status
6. **Continue/Exit** - Decide on next iteration

## Error Handling

### Common Issues

**Connection Error**: Ensure OpenCode server is running
```
Error: Failed to connect to OpenCode server
Solution: Check OpenCode server is accessible
```

**Rate Limit**: Wait and retry
```
Warning: Rate limit hit, retrying in 5s...
Solution: Wait or increase backoff delays
```

**Timeout**: Increase `promptTimeout`
```
Error: Prompt timeout after 120000ms
Solution: Set higher promptTimeout in config
```

## Example Workflows

### Research Workflow

```bash
# 1. Start CLI
bun src/cli/run.ts

# 2. Enter prompt
"Analyze authentication patterns in this codebase"

# 3. Approve optimizations (A)

# 4. Review research findings
```

### Implementation Workflow

```bash
# 1. Start CLI
bun src/cli/run.ts

# 2. Enter prompt
"Implement JWT authentication with proper error handling"

# 3. Approve optimizations (A)

# 4. Watch execution through all phases

# 5. Review implementation results

# 6. Continue iterations if needed
```

## Advanced Usage

### Skip Optimization

Use `--no-optimize` flag to skip prompt optimization (if implemented in future version):

```bash
bun src/cli/run.ts --no-optimize
```

### Custom Config

Use different configuration file:

```bash
bun src/cli/run.ts --config=.ai-eng/custom-config.yaml
```

### Verbose Mode

Enable detailed logging for debugging:

```bash
bun src/cli/run.ts --verbose
```

## Related Features

- [Spec-Driven Workflow](./spec-driven-workflow.md) - Complete development cycle
- [Ralph Wiggum](./ralph-wiggum.md) - Autonomous execution pattern
- [Prompt Optimization](./prompt-optimization.md) - Underlying optimization system
