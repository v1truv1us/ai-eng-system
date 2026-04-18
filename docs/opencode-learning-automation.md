# OpenCode learning automation (phase 2)

Phase 2 keeps OpenCode-only learning suggestions, but adds explicit approval controls before any suggested command can run.

## Runtime behavior

- listens to `command.executed`, `session.created`, and `session.idle`
- evaluates conservative heuristics for:
  - `/ai-eng/decision-journal`
  - `/ai-eng/quality-gate`
- surfaces at most one recommendation at a time via OpenCode toast notifications, and does not replace a still-actionable active recommendation
- directs the user to `/ai-eng/learning-approve`, `/ai-eng/learning-dismiss`, and `/ai-eng/learning-snooze`
- validates the recommendation payload and reconstructs an allowlisted executable command only after `/ai-eng/learning-approve`
- `/ai-eng/learning-dismiss` and `/ai-eng/learning-snooze` update local state only
- never executes the suggested command automatically
- never writes project docs from automation
- serializes runtime event handling to avoid duplicate surfacing/execution from overlapping events
- also uses a local `.ai-context/learning/state.lock/` directory lock so overlapping OpenCode/plugin processes share the same state transition guard; stale lock metadata is reclaimed after a short timeout

## Local state

Automation state stays under `.ai-context/learning/`:

- `policy.json` — optional local overrides merged with safe defaults
- `state.json` — versioned recommendation history, explicit action state, dedupe, and cooldown tracking
- `latest-recommendation.json` — last surfaced rich recommendation payload

Default cooldowns are conservative:

- one surfaced learning recommendation every 30 minutes max
- `decision-journal`: 2 hours
- `quality-gate`: 6 hours

Additional policy knobs are safe top-level overrides in `.ai-context/learning/policy.json`:

- `actionableRetentionMinutes` — defaults to `1440` (24 hours)
- `defaultSnoozeMinutes` — defaults to `60`

Actionable recommendation retention is longer than the surface cooldown by default:

- an active surfaced recommendation remains actionable for 24 hours unless it is approved, dismissed, snoozed, or expires
- `/ai-eng/learning-snooze` with no or invalid duration uses `defaultSnoozeMinutes`; explicit durations still cap at 7 days
