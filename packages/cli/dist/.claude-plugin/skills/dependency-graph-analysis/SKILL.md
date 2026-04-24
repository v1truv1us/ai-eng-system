---
name: dependency-graph-analysis
description: Build and reason about import graphs, call graphs, schema graphs, and service dependency graphs. Use when tracing paths, finding god nodes, surfacing cycles, or answering architecture questions about how parts connect.
---

# Dependency Graph Analysis

## Overview

Use structural graphs when the real question is "how do these parts connect?" Dependency graphs help answer path, coupling, boundary, and architectural gravity questions that plain search cannot answer reliably.

## When to Use

- Tracing how one module reaches another
- Finding heavily coupled files or services
- Identifying cycles and boundary leaks
- Explaining imports, calls, schema references, or pipeline dependencies
- Surfacing unexpected cross-cutting connections

## Graph Types

### Import Graph

Nodes are files or packages. Edges are imports or requires.

### Call Graph

Nodes are functions or methods. Edges are calls.

### Schema Graph

Nodes are tables, models, or fields. Edges are references and joins.

### Service Graph

Nodes are services or jobs. Edges are network calls, events, or queue handoffs.

## Process

### Step 1: Define Nodes and Edges Explicitly

Before analyzing, decide:
- What counts as a node?
- What counts as an edge?
- Is direction meaningful?
- Are external dependencies included or collapsed?

Mixing edge semantics makes the graph misleading.

### Step 2: Build the Smallest Useful Graph

Start from the question:
- "Why does auth touch billing?"
- "How does request data reach persistence?"
- "Which modules sit at the center of this feature?"

Scope the graph to the relevant subsystem first.

### Step 3: Run Structural Checks

Look for:
- High in-degree: shared utilities or choke points
- High out-degree: coordinators or god objects
- High betweenness: bridges between subsystems
- Cycles: tangled boundaries
- Isolated islands: dead code or disconnected ownership

### Step 4: Trace Paths

For architecture questions, path tracing is often more useful than global stats:
- Shortest path between two nodes
- All incoming paths to a risky module
- Outgoing fan-out from a controller or service

### Step 5: Surface Architectural Findings

Summarize findings in actionable language:
- God nodes
- Surprise edges
- Boundary violations
- Missing seams for testing
- Refactor candidates

## Heuristics

| Signal | Typical Meaning |
|---|---|
| Very high out-degree | coordinator, god object, orchestration hotspot |
| Very high in-degree | shared dependency, utility choke point |
| High betweenness | bridge, hidden coupling, migration risk |
| Strong cycles | boundary leak, layered architecture failure |
| Surprise edge | cross-domain dependency worth review |

## Example Questions

- "What path connects the login route to token persistence?"
- "Which modules are hardest to change without ripple effects?"
- "Why does this small UI change touch backend files?"
- "What sits at the center of this subsystem?"

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Search results are enough" | Search finds mentions, not actual structural paths. |
| "Only cycles matter" | High-centrality nodes can be just as risky as cycles. |
| "One huge graph is best" | Subsystem-scoped graphs are easier to trust and act on. |

## Verification

- [ ] Node and edge semantics are clearly defined
- [ ] Graph scope matches the question being answered
- [ ] Paths or centrality measures support the conclusion
- [ ] Findings are translated into concrete architectural risks or actions
- [ ] Any surprise edges are validated against source evidence
