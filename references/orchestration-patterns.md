# Orchestration Patterns Reference

## Endorsed Patterns

### 1. Direct Invocation
**When to use:** Simple, single-purpose tasks
**How it works:** User or slash command directly invokes a specialist agent

```
User: "Review this PR"
→ Routes to @code-reviewer
→ Returns review
```

**Pros:** Simple, predictable, no coordination overhead
**Cons:** Limited to single-agent scope
**Example:** `/review`, `/security-scan`

### 2. Single-Persona Slash Command
**When to use:** Multi-step workflows within one domain
**How it works:** A command activates a skill that guides the agent through steps

```
Command: /specify "user authentication"
→ Loads prompt-refinement skill
→ Asks clarifying questions
→ Generates specification
```

**Pros:** Structured workflow, skill-driven, consistent output
**Cons:** Sequential, no parallel processing
**Example:** `/specify`, `/plan`, `/build`

### 3. Parallel Fan-Out with Merge
**When to use:** Independent subtasks that can be processed concurrently
**How it works:** Orchestrator spawns multiple agents, merges results

```
Task: "Analyze codebase for security issues"
→ Agent 1: Scan dependencies
→ Agent 2: Scan code patterns
→ Agent 3: Check configurations
→ Merge: Consolidated report
```

**Pros:** Fast, comprehensive, parallel processing
**Cons:** Merge complexity, potential conflicts
**Example:** `/research` (discovery phase), code review with multiple perspectives

### 4. Sequential Pipeline
**When to use:** Multi-stage workflows where each stage depends on the previous
**How it works:** Output of one agent becomes input to the next

```
/research → /specify → /plan → /build → /review → /ship
```

**Pros:** Clear dependencies, quality gates between stages
**Cons:** Slow (sequential), bottleneck at each stage
**Example:** Full spec-driven development lifecycle

### 5. Research Isolation
**When to use:** Deep investigation before any implementation decisions
**How it works:** Dedicated research phase with no code changes allowed

```
/research "authentication patterns"
→ Read-only analysis
→ Returns findings with evidence
→ Feeds into /specify
```

**Pros:** Thorough investigation, no premature implementation
**Cons:** Additional phase, may feel slow for simple tasks
**Example:** Technology evaluation, architecture analysis

## Anti-Patterns

### 1. Router Persona
**Problem:** An agent whose only job is to decide which other agent to call
**Why it fails:** Wastes context window, adds latency, fragile routing logic
**Fix:** Use slash commands or skills to route directly to specialists

```
BAD:  User → Router Agent → Specialist Agent → Result
GOOD: User → /command → Specialist Agent → Result
```

### 2. Persona-Calls-Persona
**Problem:** Agents spawning other agents, creating deep chains
**Why it fails:** Context explosion, lost instructions, unpredictable behavior
**Fix:** Platform constraint: subagents cannot spawn subagents. User or command orchestrates.

```
BAD:  @architect → @backend → @database → @optimizer
GOOD: User → @architect (returns plan) → User → @backend (implements)
```

### 3. Sequential Orchestrator That Paraphrases
**Problem:** An orchestrator agent that reads results, summarizes, then passes to next agent
**Why it fails:** Information loss in paraphrasing, context waste, added latency
**Fix:** Pass raw results directly between agents, use merge strategy

```
BAD:  Agent A → Orchestrator summarizes → Agent B gets summary → Agent B
GOOD: Agent A → Raw output → Agent B gets full output → Agent B
```

### 4. Deep Persona Trees
**Problem:** Multiple layers of agents, each delegating to sub-agents
**Why it fails:** Exponential context growth, instruction drift, impossible to debug
**Fix:** Flat hierarchy: user/command → specialist → result

```
BAD:  User → Manager → Lead → Senior → Junior → Result
GOOD: User → Specialist → Result
```

## Decision Flow

```
Is the task simple and single-purpose?
  YES → Direct Invocation (Pattern 1)
  NO → Does it require multiple steps?
    YES → Is each step independent?
      YES → Parallel Fan-Out (Pattern 3)
      NO → Does each step depend on the previous?
        YES → Sequential Pipeline (Pattern 4)
        NO → Single-Persona Command (Pattern 2)
    NO → Is it an investigation before action?
      YES → Research Isolation (Pattern 5)
      NO → Direct Invocation (Pattern 1)
```

## Composition Rules

1. **Agents do NOT invoke other agents** — enforced by platform constraint
2. **Agents MAY invoke skills** — skills are instructions, not agents
3. **The user or a slash command is the orchestrator** — no router agents
4. **Teams cannot nest** — flat hierarchy only
5. **Skills auto-activate based on context** — no manual skill selection needed

## Context Budget Management

| Pattern | Context Cost | Recommendation |
|---------|-------------|----------------|
| Direct Invocation | Low | Always safe |
| Single-Persona Command | Medium | Monitor skill size |
| Parallel Fan-Out (3 agents) | Medium | Limit to 3-5 agents |
| Sequential Pipeline (5 stages) | High | Use context packing |
| Research Isolation | Medium-High | Set token limits |
