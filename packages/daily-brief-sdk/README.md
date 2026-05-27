# @ai-eng-system/daily-brief-sdk

Scheduled-brief SDK powering the four cook-and-brief workflows: `tomorrow`, `morning`, `week-ahead`, `dream-digest`. Each workflow pulls from configured MCP sources (Atlassian, Bitbucket, Grafana) plus the local calendar, validates the result against a Zod schema and a `ProvenanceValidator` that checks every numeric metric against the SDK's actual `tool_use` IDs, renders a `<details>`-driven HTML brief, and emails it.

See `~/projects/cook-and-brief/SPEC.md` for the full spec, including success criteria, boundaries, and the resolved-decisions log.

## Quick start

```bash
# Build
cd packages/daily-brief-sdk
bun run build

# Run the CLI
node dist/cli.mjs tomorrow --dry-run
node dist/cli.mjs tomorrow

# Install launchd schedules (4 plists)
./bin/install-launchd.sh
launchctl list | grep com.rainfocus.daily-brief
./bin/uninstall-launchd.sh
```

## Configuration

Credentials live at `~/.claude/cook-and-brief/.env` mode 0600 (never in git, never in plist `EnvironmentVariables`). See `INSTALL.md` for the full list and the SMTP/SPF/DKIM requirements.

## Workflows

- `tomorrow` (5pm): plans next workday morning from open Jira tickets + recent commits
- `morning` (7:30am): summarises overnight changes
- `week-ahead` (Fri 4pm): projects upcoming week from sprint state
- `dream-digest` (Sun 8pm): cross-session synthesis from `~/.claude/projects/*/memory/` — writes to `~/.claude/cook-and-brief/dream-digest/`, never auto-memory

## Status

Phase B in progress. See `~/projects/cook-and-brief/tasks/todo.html` for live status.
