---
name: graph-rag
description: Relationship-aware retrieval using graph traversal, entity anchors, community expansion, and hybrid vector plus graph search. Use when chunk similarity alone misses paths, entities, or subsystem context.
---

# Graph RAG

## Overview

Use graph-native retrieval when the answer depends on relationships, not just similar text. Graph RAG works well for entity-heavy systems, architecture questions, causal chains, and multi-hop queries that plain vector retrieval often misses.

## When to Use

- The user asks how two concepts connect
- The answer depends on paths, dependencies, or neighborhoods
- Important context is split across multiple files or documents
- Vector search returns individually relevant chunks but weak overall explanations
- You already have entities, references, or graph structure available

## Retrieval Patterns

### Entity Anchor Retrieval

Resolve the question to known entities first, then retrieve around them.

### Neighborhood Expansion

Expand one or two hops across relevant relations only.

### Path Retrieval

Find the path between two anchors when the question is about connection or causality.

### Community Retrieval

Pull the subsystem or cluster around the anchor when local context matters more than one edge.

### Hybrid Retrieval

Use vector search to find candidate anchors, then use the graph to expand and explain.

## Process

### Step 1: Classify the Question

Graph RAG is a fit when the question is one of these:
- connection: "how is A related to B?"
- path: "how does data get from A to B?"
- neighborhood: "what else is involved with A?"
- subsystem: "what belongs to this area?"

If the question is simple lookup, plain retrieval may be enough.

### Step 2: Resolve Anchors

Identify entities, files, symbols, tables, or services named in the question.

If anchor resolution is fuzzy:
- use semantic search first
- rank candidates
- keep the confidence visible

### Step 3: Expand With Bounded Traversal

Expand only across relations that matter to the question:
- imports
- calls
- references
- belongs_to
- decided_by
- documented_in

Bound the retrieval:
- max depth
- max nodes
- relation allowlist

### Step 4: Build Prompt Context

Assemble context as structured evidence, not a raw graph dump:

```markdown
## Anchors
- AuthController
- SessionToken

## Relevant Path
AuthController -> AuthService -> TokenStore -> sessions table

## Supporting Evidence
- src/auth/controller.ts:42
- src/auth/service.ts:88
- src/data/token-store.ts:21
- docs/decisions/2026-01-15-auth.md:12
```

### Step 5: Answer With Relationship Context

The answer should explain:
- what the relevant nodes are
- how they connect
- which evidence supports the path
- where uncertainty remains

## Selection Guide

| Question Shape | Retrieval Strategy |
|---|---|
| direct lookup | vector or keyword only |
| entity + neighbors | anchor + neighborhood expansion |
| how A connects to B | anchor + path retrieval |
| subsystem overview | anchor + community retrieval |
| fuzzy question with named concepts | hybrid vector + graph |

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Vector search already found the files" | File relevance is not the same as relationship explanation. |
| "Dump the whole graph into the prompt" | Large raw graphs waste context and hide the important path. |
| "More hops is better" | Unbounded traversal quickly turns into noise. |

## Verification

- [ ] The question actually needs relationship-aware retrieval
- [ ] Anchors are resolved with visible confidence
- [ ] Traversal is bounded by depth and relation type
- [ ] Prompt context contains paths and evidence, not a raw graph dump
- [ ] The final answer explains both the conclusion and the connection path
