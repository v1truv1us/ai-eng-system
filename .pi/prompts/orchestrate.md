---
description: Orchestrate multiple agents for complex development tasks
---

# Orchestrate Command

Coordinate multiple specialized agents for tasks that span domains.

Load the `subagent-orchestration` agent. Break the task into domain-specific sub-tasks, select appropriate specialists, determine dependency order, delegate with context handoff, and aggregate results.

```
/orchestrate "Design and implement a scalable API"
/orchestrate --plan-only "Migrate to microservices"
/orchestrate --agents=architect,backend,security "Build payment system"
```

See `docs/reference/orchestration-contract.md` for the full handoff envelope and result format.

$ARGUMENTS
