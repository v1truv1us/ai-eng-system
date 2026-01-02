---
description: Research command with proper option parsing
agent: plan
mode: primary
---

You are about to execute a research command with options. The options will be parsed and the appropriate command will be invoked.

## Immediate Action Required

**Before proceeding, you MUST invoke the prompt-refinement skill:**

1. Load the skill from: `skills/prompt-refinement/SKILL.md`
2. Use phase: `research`
3. Follow the TCRO framework (Task, Context, Requirements, Output)
4. Ask clarifying questions if needed
5. Confirm the refined prompt with the user

## Command Options Detected

The following options are available:
- `--swarm` - Use Swarms multi-agent orchestration
- `-s, --scope <scope>` - Research scope (codebase|documentation|external|all)
- `-d, --depth <depth>` - Research depth (shallow|medium|deep)
- `-o, --output <file>` - Output file path
- `-f, --format <format>` - Export format (markdown|json|html)
- `--no-cache` - Disable research caching
- `--feed-into <command>` - Feed results into specify|plan
- `-v, --verbose` - Enable verbose output

## Execution

After prompt refinement, execute the command using:
```bash
bun run scripts/run-command.ts research "$ARGUMENTS" [options]
```

For example:
- `bun run scripts/run-command.ts research "authentication patterns"`
- `bun run scripts/run-command.ts research "api design" --scope codebase --depth deep`
- `bun run scripts/run-command.ts research "caching" --feed-into plan --verbose`

## Research Process

Once the command is executed, follow the 4-phase research methodology:

1. **Phase 0: Prompt Refinement** (already done above)
2. **Phase 1: Context & Scope Definition**
3. **Phase 2: Parallel Discovery** (spawn codebase-locator, research-locator, codebase-pattern-finder)
4. **Phase 3: Sequential Deep Analysis** (codebase-analyzer, research-analyzer)
5. **Phase 4: Synthesis & Documentation** (create comprehensive research document)

## Output

Save research findings to `docs/research/[date]-[topic-slug].md` with proper YAML frontmatter.

If `--feed-into` is specified, the next command will be automatically invoked with the research context.

$ARGUMENTS
