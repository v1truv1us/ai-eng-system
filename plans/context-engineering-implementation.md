# Context Engineering Implementation Plan

**Status**: In Progress  
**Created**: 2025-01-06  
**Last Updated**: 2025-01-06

## Overview

Implementing context engineering patterns from Google's research and Claude Skills best practices to enhance ferg-engineering-system with:

1. **Session Management** - Persistent workbench state across conversations
2. **Memory System** - Declarative/procedural memory with provenance tracking
3. **Progressive Disclosure** - 3-tier skill loading (90% token reduction)
4. **Context Retrieval** - Intelligent push/pull context assembly

## Research Foundation

| Source | Key Insight | Application |
|--------|-------------|-------------|
| Google (Aakash Gupta) | Sessions as workbenches, 7 context keys | Session persistence, memory types |
| Claude Skills (Rick Hightower) | Progressive Disclosure Architecture | 3-tier loading: metadata → instructions → resources |
| MBZUAI (Bsharat et al.) | Principled prompting | Already integrated in agents |

## Architecture

```
.ferg-context/                    # Local context storage (gitignored)
├── sessions/
│   ├── current.json              # Active session state
│   └── archive/                  # Previous sessions
├── memory/
│   ├── declarative.json          # Facts, code patterns, decisions
│   ├── procedural.json           # Workflows, preferences
│   └── episodic/                 # Conversation summaries
├── index/
│   └── embeddings.json           # Optional: local vector index
└── config.json                   # User preferences

src/context/                      # TypeScript implementation
├── session.ts                    # Session manager
├── memory.ts                     # Memory store with provenance
├── retrieval.ts                  # Context assembly engine
├── progressive.ts                # Skill loader with PDA
└── index.ts                      # Main exports
```

## Phase 1: Session Management (Week 1)

### Goal
Create persistent session state that survives conversation restarts.

### Implementation

```typescript
// src/context/session.ts
interface Session {
  id: string
  createdAt: Date
  lastActive: Date
  workbench: {
    activeFiles: string[]
    pendingTasks: Task[]
    decisions: Decision[]
    context: Record<string, any>
  }
  metadata: {
    project: string
    branch?: string
    mode?: 'plan' | 'build' | 'review'
  }
}
```

### Files to Create
- [x] `plans/context-engineering-implementation.md` (this file)
- [ ] `src/context/session.ts`
- [ ] `src/context/types.ts`

### Integration Points
- Hook into Claude Code's `SessionStart` event
- Auto-load previous session context
- Save session on significant events

---

## Phase 2: Memory System (Week 2)

### Goal
Implement declarative/procedural memory with source provenance.

### Memory Types

| Type | Content | Example |
|------|---------|---------|
| Declarative | Facts, patterns | "User prefers Bun over Node" |
| Procedural | Workflows | "Always run tests before commit" |
| Episodic | Summaries | "Yesterday: fixed auth bug in session.ts" |

### Provenance Tracking

```typescript
interface MemoryEntry {
  id: string
  type: 'declarative' | 'procedural' | 'episodic'
  content: string
  provenance: {
    source: 'user' | 'agent' | 'inferred'
    timestamp: Date
    confidence: number  // 0-1
    context: string     // Where this was learned
  }
  tags: string[]
  lastAccessed: Date
}
```

---

## Phase 3: Progressive Disclosure (Week 3)

### Goal
Implement 3-tier skill loading to reduce token usage by 90%.

### Tier Structure

```
Tier 1: Metadata (always loaded)
├── Name, description, capabilities
└── ~50 tokens per skill

Tier 2: Instructions (loaded on demand)
├── Core instructions, patterns
└── ~500 tokens per skill

Tier 3: Resources (loaded when needed)
├── Reference docs, examples
└── ~2000+ tokens per skill
```

### Enhanced SKILL.md Format

```markdown
---
name: progressive-skill
tier: 1
capabilities: ["capability1", "capability2"]
---

## Overview
[Always loaded - Tier 1]

## Instructions
<!-- tier:2 -->
[Loaded when skill is activated]

## References
<!-- tier:3 -->
[Loaded only when specifically needed]
```

---

## Phase 4: Context Retrieval (Week 4)

### Goal
Intelligent context assembly with push/pull patterns.

### Patterns

| Pattern | Trigger | Example |
|---------|---------|---------|
| Push | Proactive | Load project conventions on file open |
| Pull | On-demand | Fetch memory when asked about past decisions |
| Hybrid | Smart | Auto-load relevant memories based on task |

### Implementation

```typescript
interface ContextAssembler {
  // Push: Proactive context loading
  onSessionStart(session: Session): Promise<Context>
  onFileOpen(path: string): Promise<Context>
  
  // Pull: On-demand retrieval
  query(question: string): Promise<MemoryEntry[]>
  getRelevantSkills(task: string): Promise<Skill[]>
  
  // Assembly: Combine and prioritize
  assemble(triggers: Trigger[]): Promise<AssembledContext>
}
```

---

## Phase 5: Agent Integration (Week 5)

### Goal
Connect context system to existing agents and commands.

### Integration Points

| Component | Integration |
|-----------|-------------|
| `/plan` | Load relevant memories, save decisions |
| `/review` | Reference past reviews, patterns |
| `/work` | Track progress in session |
| Agents | Access memory via API |

### New Command: `/context`

```bash
/context status     # Show current session state
/context remember   # Save a memory manually
/context forget     # Remove a memory
/context search     # Query memories
/context export     # Export session/memories
```

---

## Phase 6: Production Polish (Week 6)

### Goal
Performance optimization, testing, documentation.

### Tasks
- [ ] Performance benchmarks (target: <100ms context load)
- [ ] Memory size management (auto-archive old entries)
- [ ] Conflict resolution for concurrent sessions
- [ ] Cross-platform testing (Claude Code + OpenCode)
- [ ] Documentation updates

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token reduction | 90% | Compare skill loading before/after |
| Context load time | <100ms | Benchmark session restoration |
| Memory retrieval | <50ms | Query response time |
| User adoption | TBD | Usage of /context commands |

---

## Dependencies

- **Bun runtime** - Already in use
- **No external databases** - Local JSON/vector storage
- **Existing build.ts** - Extend for context compilation
- **Conexus** - Future integration (deferred)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large context files | Implement archiving, summarization |
| Stale memories | Confidence decay over time |
| Cross-platform compat | Test both Claude Code and OpenCode |
| Breaking changes | Maintain backward compatibility |

---

## Next Steps

1. **Today**: Create `src/context/` directory and types
2. **This Week**: Implement Session Manager
3. **Testing**: Manual testing with real workflows
4. **Iterate**: Gather feedback, refine

---

## References

- [Google Context Engineering](https://www.news.aakashg.com/p/context-engineering) - Aakash Gupta
- [Claude Skills Deep Dive](https://rickhightower.substack.com/p/claude-skills-deep-dive) - Rick Hightower
- [Principled Instructions](https://arxiv.org/abs/2312.16171) - MBZUAI
