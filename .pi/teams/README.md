# .crew — pi-crew Runtime Directory

This directory contains pi-crew runtime state and artifacts.

## What's Here

| Directory | Purpose | Commit? |
|-----------|---------|---------|
| `state/runs/` | Run manifests, tasks, events | No |
| `state/subagents/` | Subagent state | No |
| `artifacts/` | Run outputs (test files, docs, etc.) | Optional |
| `cache/` | Cached run results (fingerprint-based) | No |
| `graphs/` | Archived run graphs | Optional |
| `audit/` | Security event logs | No |

## Cleanup

To prune old runs:
```bash
team action='prune' keep=5
```

To clear cache:
```bash
team action='cache' action='clear'
```
