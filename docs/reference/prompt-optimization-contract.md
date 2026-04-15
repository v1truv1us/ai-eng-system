# Prompt Optimization Contract

## Overview

Prompt optimization in ai-eng-system follows a single contract with multiple harness adapters. The core logic is shared; only the delivery mechanism differs per platform.

## Core Contract

### Input

```typescript
interface PromptOptimizationInput {
  prompt: string;
  complexity: "simple" | "medium" | "complex";
  domain: string;
  techniques?: string[];
}
```

### Output

```typescript
interface PromptOptimizationOutput {
  optimized_prompt: string;
  techniques_applied: string[];
  confidence: number;
  metadata: {
    original_length: number;
    optimized_length: number;
    complexity: string;
    domain: string;
  };
}
```

### Techniques

1. **Expert Persona** — Assign domain-specific expert role
2. **Step-by-Step Reasoning** — Add systematic analysis instruction
3. **Stakes Language** — Add importance and consequence framing
4. **Challenge Framing** — Frame problem as challenge
5. **Self-Evaluation** — Request confidence rating

## Platform Adapters

### Claude Code (Python Hook)

- File: `.claude/hooks/prompt-optimizer.py`
- Mechanism: UserPromptSubmit hook
- Input: user prompt string
- Output: modified prompt string
- Escape prefix: `!` skips optimization

### OpenCode (TypeScript Tool)

- File: `packages/toolkit/.opencode/tool/prompt-optimize.ts`
- Mechanism: custom tool callable by the model
- Input: prompt string
- Output: optimized prompt JSON

### CLI (TypeScript)

- File: `packages/cli/src/prompt-optimization/optimizer.ts`
- Mechanism: programmatic API
- Input: PromptOptimizationInput
- Output: PromptOptimizationOutput

## Shared Behavior

All adapters must:
1. Skip optimization for prompts prefixed with `!`
2. Apply domain-appropriate techniques
3. Preserve the original prompt intent
4. Include technique metadata in output
5. Rate confidence in the optimization

## Configuration

```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": false,
    "verbosity": "normal",
    "skipForSimplePrompts": true,
    "escapePrefix": "!"
  }
}
```

## Validation

- OpenCode and Claude adapter outputs must be shape-compatible
- Optimization must preserve original intent
- Escape prefix must reliably bypass all optimization
