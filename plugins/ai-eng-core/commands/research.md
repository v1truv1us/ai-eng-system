---
name: ai-eng/research
description: Conduct comprehensive multi-phase research across codebase, documentation, and external sources
agent: plan
version: 2.0.0
inputs:
  - name: query
    type: string
    required: false
    description: Direct research question or topic
  - name: ticket
    type: string
    required: false
    description: Path to ticket file
outputs:
  - name: research_document
    type: structured
    format: Markdown document with YAML frontmatter
    description: Research findings saved to docs/research/
---

# Research Command

Conduct comprehensive research for: $ARGUMENTS

> **Phase 1 of Spec-Driven Workflow**: Research → Specify → Plan → Work → Verify → Review

Load `skills/comprehensive-research/SKILL.md` and `skills/prompt-refinement/SKILL.md` (phase: research).

## Quick Start

```bash
/ai-eng/research "authentication patterns"
/ai-eng/research "api design" --scope codebase --depth deep --verbose
/ai-eng/research "caching strategies" --feed-into plan
/ai-eng/research "microservices patterns" --ralph --ralph-show-progress
```

## Options

| Option | Description |
|--------|-------------|
| `-s, --scope <scope>` | Research scope (codebase\|documentation\|external\|all) [default: all] |
| `-d, --depth <depth>` | Research depth (shallow\|medium\|deep) [default: medium] |
| `-o, --output <file>` | Output file path |
| `--feed-into <command>` | After research, invoke specified command (specify\|plan) |
| `-v, --verbose` | Enable verbose output |
| `--ralph` | Enable Ralph Wiggum iteration mode |

## Process

1. Load prompt refinement and clarify research scope
2. Parse the research request, decompose into sub-questions
3. Read primary sources first (never spawn agents before understanding context)
4. Parallel discovery: codebase locator, research locator, pattern finder
5. Sequential deep analysis: codebase analyzer, research analyzer
6. Synthesis: save to `docs/research/[date]-[topic-slug].md`

## Subagent Handoff

When spawning discovery agents, include:

```
<CONTEXT_HANDOFF_V1>
Goal: (1 sentence)
Scope: (codebase|docs|external|all)
Deliverable: (what you must return)
Output format: RESULT_V1
</CONTEXT_HANDOFF_V1>
```

## Output

Save research document to `docs/research/[date]-[topic-slug].md` with findings, evidence, recommendations, and confidence rating.

## Integration

- Feeds into: `/ai-eng/specify` (via `--feed-into=specify`), `/ai-eng/plan` (via `--feed-into=plan`)

$ARGUMENTS
