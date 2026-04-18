---
name: prompt-engineering
description: "Comprehensive prompt engineering for coding agents covering structured instruction design, few-shot prompting, chain-of-thought, decomposition, agent workflow patterns, and reliability techniques for multi-step pipelines."
version: 1.0.0
tags: [prompt-engineering, coding-agents, agentic-workflows, few-shot, chain-of-thought, prompting]
---

# Prompt Engineering for Coding Agents

## Critical Importance

**Prompt engineering is the single highest-leverage skill for getting reliable output from coding agents.** A well-engineered prompt turns a coding agent from a frustrating guessing machine into a precise, predictable partner. Every prompt you write either compounds quality or compounds debt—there is no neutral. The techniques below are drawn from peer-reviewed research, production agent systems, and direct experience building multi-step coding workflows.

## Systematic Approach

** approach every prompt as an engineering artifact, not a casual instruction.** Treat prompts like API contracts: explicit inputs, defined outputs, documented constraints, and graceful failure modes. A prompt that works "most of the time" is a prompt that fails at the worst time.

## The Challenge

**The write prompts that produce reliable, correct code across multi-step agent workflows—even when individual step reliability is only 90%.** The "March of the Nines" (Karpathy) shows that a 10-step pipeline at 90% per-step reliability has only a 35% chance of succeeding end-to-end. Your prompts must be robust enough to close that gap through explicit planning, fallbacks, and constraint communication.

## When to Use This Skill

- Writing system prompts or task prompts for coding agents
- Designing multi-step agent workflows (spec → draft → test → refactor)
- Improving reliability of existing agent prompts
- Building few-shot examples for code generation
- Debugging why an agent produces inconsistent output
- Creating reusable prompt templates for teams

## Core Prompting Techniques

### 1. Structured Instruction Design

Good prompts have four explicit elements:

| Element | Purpose | Example |
|---------|---------|---------|
| **Role** | Sets expertise context | "You are a senior backend engineer with 10 years of Node.js experience" |
| **Task** | Defines the specific job | "Implement a rate limiter middleware using the sliding window algorithm" |
| **Context** | Provides relevant background | "This is for a REST API serving 10k req/s. Must be Redis-backed." |
| **Constraints** | Bounds the solution | "No external dependencies beyond ioredis. Must handle distributed instances." |

**Pattern:**
```
# Role
You are a [specific role] with [X years] of experience in [relevant domain].

# Task
[Specific, actionable instruction]

# Context
[Background information, existing code, architectural decisions]

# Constraints
- [Hard constraint 1]
- [Hard constraint 2]
- [Output format requirement]
```

### 2. Few-Shot Prompting

Provide concrete input/output examples to establish expected patterns. Research shows few-shot prompting dramatically improves consistency, especially for code style and conventions.

**Zero-shot vs Few-shot:**
```
Zero-shot: "Write a function that validates email addresses."
→ Unpredictable style, may not match project conventions.

Few-shot: "Write a function that validates email addresses, following this pattern:
// Example: validatePhoneNumber
export function validatePhoneNumber(input: string): Result<string, ValidationError> {
  const trimmed = input.trim();
  const pattern = /^\+?[\d\s-()]{7,}$/;
  if (!pattern.test(trimmed)) {
    return { ok: false, error: { field: 'phone', message: 'Invalid phone number' } };
  }
  return { ok: true, value: trimmed };
}"
→ Matches project style, returns same Result type, uses same error pattern.
```

**Best practices for few-shot with coding agents:**
- Use 1-3 examples from the actual project codebase
- Show the full pattern including types, error handling, and naming
- Match the exact import style and module structure
- Include edge case handling in examples

### 3. Chain-of-Thought (CoT) Prompting

Force explicit reasoning before action. Critical for debugging, refactoring, and architecture decisions.

**Pattern:**
```
Before writing any code:
1. Analyze the current implementation and identify all issues
2. List each issue with its severity and root cause
3. Propose a solution for each issue
4. Identify dependencies between fixes
5. Only then implement changes in the correct order

Format your analysis as:
## Analysis
[step-by-step reasoning]

## Plan
[ordered list of changes]

## Implementation
[code changes]
```

### 4. Decomposition Patterns

Break complex tasks into explicit sub-tasks. Two primary patterns:

**Self-Ask Pattern:**
```
Before solving this task, answer these sub-questions:
1. What are the input types and edge cases?
2. What existing code handles similar cases?
3. What error conditions need handling?
4. What tests would validate correctness?
5. What performance constraints apply?

Then synthesize your answers into the implementation.
```

**Step-Back Pattern:**
```
Before implementing, step back and consider:
- What is the broader architectural pattern this fits into?
- What are the common failure modes for this type of change?
- How will this scale or need to change in 6 months?
- What would a senior engineer review critically about this approach?
```

### 5. Agent Workflow Prompting

For autonomous or semi-autonomous coding agents, structure prompts around phases:

```
# Phase 1: Understand
Read the existing codebase. Identify:
- Current architecture and patterns
- Related code that will be affected
- Existing tests and their coverage
- Dependencies and integration points

# Phase 2: Plan
Create an explicit plan before writing code:
- List every file that needs to change
- Describe each change and why
- Identify the correct order of changes
- Flag any risky changes that need extra care

# Phase 3: Implement
Make changes one at a time:
- Each change should be independently verifiable
- Run relevant tests after each change
- Commit (or checkpoint) after each logical unit

# Phase 4: Verify
- Run the full test suite
- Check for type errors
- Verify edge case handling
- Review for security issues

# Phase 5: Simplify
Review all changes for:
- Unnecessary complexity
- Missed code reuse opportunities
- Better idioms or patterns
- Inconsistencies with the rest of the codebase
```

### 6. Reliability Techniques for Agent Pipelines

Addressing the "March of the Nines" problem:

| Technique | How to Apply | Example |
|-----------|-------------|---------|
| **Explicit Planning** | Require a plan before any code | "List all changes before implementing any" |
| **Verification Gates** | Insert checks between steps | "After each function, write a test that validates it" |
| **Fallback Instructions** | Define what to do on failure | "If the test fails, analyze the error before retrying" |
| **Output Constraints** | Define exact output format | "Return only valid TypeScript, no prose explanations" |
| **Self-Correction** | Prompt to review own output | "Review your code for these 5 common mistakes: [...]" |
| **Guardrails** | Set hard boundaries | "Never modify files outside src/features/auth/" |

### 7. Prompt Patterns for Specific Coding Tasks

#### Debugging
```
Analyze this error systematically:

## Error
[paste error message and stack trace]

## Context
[what were you doing, what changed recently]

## Steps
1. Identify the exact line and operation causing the error
2. Trace the data flow backward to find the root cause
3. Determine if this is a logic error, type error, or environmental issue
4. Propose the minimal fix
5. Explain why this fix is correct and what would break if wrong
```

#### Refactoring
```
Refactor this code following these constraints:

## Goal
[what the refactoring should achieve]

## Rules
- Preserve all existing behavior (tests must still pass)
- Make changes incrementally (each step should be commit-worthy)
- Prefer extracting functions over adding comments
- Follow the existing patterns in this codebase

## Anti-goals
- Do not add new features
- Do not change the public API
- Do not optimize prematurely
```

#### Feature Implementation
```
Implement [feature description]:

## Specification
[detailed requirements]

## Existing patterns to follow
[reference to similar existing code]

## Implementation order
1. Define types/interfaces first
2. Implement core logic with tests
3. Add error handling
4. Wire into existing system
5. Update affected tests

## Verification
- All existing tests pass
- New tests cover: happy path, error cases, edge cases
- TypeScript compiles without errors
- No regressions in related features
```

## Prompt Element Taxonomy

Every effective prompt contains some subset of these elements. Use this as a checklist:

| Category | Elements | When Needed |
|----------|----------|-------------|
| **Identity** | Role, expertise level, perspective | Always |
| **Task** | Specific instruction, scope, boundaries | Always |
| **Context** | Background, existing code, constraints | Most tasks |
| **Examples** | Few-shot input/output pairs | Style-sensitive tasks |
| **Reasoning** | Chain-of-thought, decomposition | Complex tasks |
| **Output** | Format, structure, length constraints | Always |
| **Quality** | Self-evaluation, review criteria | Important tasks |
| **Safety** | Guardrails, fallbacks, constraints | Production code |
| **Iteration** | Re-plan, retry, correction loops | Agent workflows |

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Fix |
|-------------|-------------|-----|
| Vague instructions | Agent fills gaps with wrong assumptions | Be explicit about what you want |
| No output format | Inconsistent, hard-to-parse responses | Define exact structure |
| Single massive prompt | Lost context, missed requirements | Decompose into phases |
| No examples | Agent invents its own conventions | Provide 1-3 project-relevant examples |
| Ignoring failure modes | Agent silently produces wrong output | Define error handling and fallbacks |
| Over-constraining | Agent can't adapt to edge cases | Constrain outcomes, not approaches |

## Resource Reference

### Core Prompting
| Resource | Why It Matters | Best Use |
|----------|---------------|----------|
| MIT Sloan — Effective Prompts for AI | Foundation for clarity, specificity, context | Compact overview of strong prompt habits |
| OpenAI — Prompting | Practical prompt construction | Repeatability and predictable formatting |
| OpenAI — Prompt Engineering | Instruction design and iteration | System prompts and task prompts |
| Prompt Engineering Guide — Elements of a Prompt | Breaks prompts into instruction, context, supporting pieces | Reusable template design |
| Microsoft Learn — Create Effective Prompts | Goal, context, expectations, source | Business rules and internal repo context |

### Advanced Techniques
| Resource | Why It Matters | Best Use |
|----------|---------------|----------|
| Cisco — 6 Advanced AI Prompt Engineering Techniques | Few-shot, chain-of-thought, meta prompting | Multi-step code tasks |
| Patronus — Advanced Prompt Engineering Techniques | Self-ask, step-back decomposition | Debugging, refactoring, architecture |
| Learn Prompting — Zero/One/Few-Shot Prompting | Example-driven prompting | Project style and code conventions |

### Coding-Agent Specific
| Resource | Why It Matters | Best Use |
|----------|---------------|----------|
| Exploring Prompt Patterns in AI-Assisted Code Generation | Research-backed patterns for code generation | Reducing back-and-forth with agents |
| Building Effective Prompt Engineering Strategies for AI Agents | Tool definitions, planning, re-planning, iterations | Autonomous coding agents |
| Developer's Guide to Prompt Engineering for AI Coding Assistants | Debugging, refactoring, feature work | Day-to-day coding prompts |
| Curated Agentic System Prompts | Template collection for system prompts | Studying mature agent prompt structures |
| Vercel Coding Agent Template | Multi-agent workflow across coding CLIs | End-to-end system understanding |

### Key Figures
| Person | Resource | Key Insight |
|--------|----------|-------------|
| Andrej Karpathy | "Code Agents, AutoResearch, and the Loopy Era" | Code agents close the loop: generate → run → analyze → iterate. Brittle per-step reliability kills naive pipelines. |
| Andrej Karpathy | "March of the Nines" | 90% per-step reliability → 35% pipeline success over 10 steps. Need explicit planning and fallbacks. |
| Andrej Karpathy | "Vibe Coding" | Need robust, multi-step, constraint-aware prompts instead of one-off instructions. |
| Boris Cherny | "Agentic Coding with Claude Code" | Phase-based coding: spec → draft → simplify → verify. Prompts interact with tool-use patterns. |
| Boris Cherny | Claude Code Handbook | Practical prompt-driven manual: spec, refactor, test, deploy phases. |

## Integration with ai-eng-system

This skill complements existing prompting skills:

- **`incentive-prompting`** — Research-backed quality enhancement techniques (stakes, personas, self-evaluation)
- **`prompt-refinement`** — TCRO framework for structuring vague prompts into clear specifications
- **`content-optimization`** — Applying optimization techniques across all content types
- **`text-cleanup`** — Removing AI-generated verbosity from outputs

**Use together for maximum effect:**
```
1. prompt-engineering — Design the prompt with proper structure and patterns
2. prompt-refinement — Structure with TCRO if the task is vague
3. incentive-prompting — Enhance with expert persona and stakes language
4. text-cleanup — Clean up any verbosity in the final output
```

## See Also

- `incentive-prompting` — Research-backed quality enhancement (+45-115%)
- `prompt-refinement` — TCRO structuring with phase-specific clarification
- `content-optimization` — Content and prompt enhancement
- `comprehensive-research` — Research agent enhancement
