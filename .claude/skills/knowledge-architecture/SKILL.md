---
name: knowledge-architecture
description: Build a static-first knowledge architecture using file-backed domain maps, rules, hypotheses, and durable references. Use for knowledge architecture, learning systems, decision context, and long-lived team memory without runtime memory tooling.
version: 1.0.0
tags: [knowledge-management, documentation, learning-system, decision-making]
---

# Knowledge Architecture Skill

## Purpose

Create a durable, file-backed knowledge system that helps the team keep shared context, decisions, rules, and open questions in one place.

This milestone is **static-first**:
- no hooks
- no MCP
- no custom tools
- no runtime memory engine

Use markdown files, links, and clear ownership.

## When to Use

- Starting a knowledge base for a product or domain
- Reorganizing scattered planning notes into canonical files
- Turning repeated context into stable rules and references
- Establishing decision, quality, and review links around a domain

## Canonical Inputs

- `templates/knowledge/index.md`
- `templates/knowledge/domain.md`
- `templates/knowledge/knowledge.md`
- `templates/knowledge/hypotheses.md`
- `templates/knowledge/rules.md`
- `docs/knowledge/README.md`

Related records:
- `templates/decisions/decision.md`
- `templates/quality/gate.md`
- `templates/review/maintenance-review.md`

## Target Structure

Prefer this shape:

```text
docs/knowledge/
├── README.md
├── index.md
├── domains/
│   └── <domain>.md
├── entries/
│   └── <topic>.md
├── hypotheses.md
└── rules.md
```

## Workflow

1. **Define scope**
   - What product, system, or domain does this cover?
   - What should be durable vs still uncertain?

2. **Create the index**
   - Start from `templates/knowledge/index.md`.
   - Capture domains, key knowledge, rules, open hypotheses, and linked records.

3. **Map domains**
   - Create one file per meaningful domain from `templates/knowledge/domain.md`.
   - Keep boundaries explicit.

4. **Capture atomic knowledge**
   - Use `templates/knowledge/knowledge.md` for durable facts, patterns, or references.
   - Favor small entries with strong links.

5. **Track uncertainty**
   - Use `templates/knowledge/hypotheses.md` for claims that need validation.
   - Every hypothesis should have an owner or next validation step.

6. **Write rules**
   - Use `templates/knowledge/rules.md` for stable operating rules.
   - Link each rule to evidence, decisions, or prior incidents when possible.

7. **Link adjacent systems**
   - Stable choices belong in `docs/decisions/`.
   - Repeatable checks belong in `docs/quality/`.
   - Recurring health checks belong in `docs/reviews/maintenance/`.

## Writing Rules

- Keep titles crisp.
- Prefer one idea per file.
- Mark uncertainty instead of hiding it.
- Link laterally across knowledge, decisions, quality, and reviews.
- Avoid session-specific chatter.

## Done Criteria

- `docs/knowledge/index.md` exists or is updated.
- Core domains are listed.
- Durable knowledge is separated from hypotheses.
- Rules are explicit.
- Related decisions, gates, and reviews are linked.

## Anti-Patterns

- Giant undifferentiated notes
- Rules without rationale
- Decisions embedded in random meeting notes
- Hypotheses presented as settled facts
- Runtime tooling assumptions in milestone 1
