Create a complete `dynamic-claude-router` skill under `.pi/skills/dynamic-claude-router/` for the ai-eng-system Claude plugin. Implements a conductor/subagent routing pattern using only Anthropic models.

## Architecture

### Conductor Agent
- Receives user task, assesses complexity and intent
- Routes to correct subagent based on task characteristics
- Optionally chains subagents for multi-step tasks

### Subagents (all Anthropic-only models)
- `LookupAgent` → claude-3-5-haiku (fast, cheap, scanning/quick info)
- `WorkAgent` → claude-sonnet-4 (balanced, normal coding/work)  
- `PlannerAgent` → claude-opus-4 (highest reasoning, planning/architecture/hard problems)
- `DebuggerAgent` → claude-sonnet-4 (debugging, tracing, root-cause analysis)
- `RefactorAgent` → claude-opus-4 (code restructuring, design improvement)

### Skill Layer
- Exposes as a CLI command via the existing ai-eng command system
- SKILL.md with full documentation

## Deliverables

1. **SKILL.md** at `.pi/skills/dynamic-claude-router/SKILL.md` — frontmatter, purpose, architecture, role descriptions, model mapping table, CLI usage examples, integration notes. Follow existing skill conventions (see `.pi/skills/claude-agent-sdk/SKILL.md` and `.pi/skills/comprehensive-research/SKILL.md` for format).

2. **TypeScript conductor implementation** at `src/agents/claude-router/` with:
   - `conductor.ts` — TaskComplexity assessment, routing logic, subagent chaining
   - `subagents.ts` — Subagent type definitions and model constants (all Anthropic)
   - `types.ts` — Router-specific types (TaskInput, TaskComplexity, RoutingDecision, SubagentResult)
   - `index.ts` — Public exports

3. **Agent definitions** at `content/agents/` following the plugin-dev conventions:
   - `claude-conductor.md` — Conductor agent definition
   - `claude-lookup-agent.md` — Lookup agent definition  
   - `claude-work-agent.md` — Work agent definition
   - `claude-planner-agent.md` — Planner agent definition
   - `claude-debugger-agent.md` — Debugger agent definition
   - `claude-refactor-agent.md` — Refactor agent definition

4. **Command definition** at `content/commands/` for the CLI command `dynamic-task`

5. **Tests** at `src/agents/claude-router/__tests__/`:
   - `conductor.test.ts` — Unit tests for routing logic (complexity assessment, correct subagent selection, chaining)
   - Smoke test with sample inputs of varying complexity

## Critical Constraints

- **Anthropic models ONLY**. Zero references to OpenAI, Google, Gemini, or any non-Anthropic model anywhere in the code.
- Follow existing project conventions exactly (TypeScript, file layout, naming, agent types from `src/agents/types.ts`)
- No TODOs, stubs, empty bodies, or placeholder implementations
- Match SKILL.md format from existing skills (YAML frontmatter with name/description/metadata)
- The conductor routing logic must be deterministic and testable: complexity assessment → subagent selection → model assignment

## Existing Context

- Agent types are in `src/agents/types.ts` with `AgentType` enum, `AgentTask`, `AgentInput`, `AgentOutput` etc.
- Agent coordinator is in `src/agents/coordinator.ts` — follow similar patterns
- Skills live in `.pi/skills/<name>/SKILL.md` with YAML frontmatter
- Content for Claude plugin goes in `content/agents/` and `content/commands/`
- Build: `bun run build`, typecheck: `bun run typecheck`, lint: `bun run lint`
