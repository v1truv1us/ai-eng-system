# pi-runner deploy

Scheduled research agent that runs on Coolify as a Docker container.

## What it does

| Job | When | Engine |
|---|---|---|
| wiki-engineering | Weekdays 9:00 AM PT | `pi -p --skill wiki-research-engineering` |
| wiki-research | Weekdays 9:30 AM PT | `pi -p --skill wiki-research-research` |
| wiki-personal | Sundays 10:00 AM PT | `pi -p --skill wiki-research-personal` |
| competitor-scan | Mondays 9:00 AM PT | `pi -p` (inline prompt) |
| research-deep | Wednesdays 2:00 PM PT | **ai-eng-system research-runner** (9 templates, parallel) |

## Deploy to Coolify

1. **Connect repo**: Coolify → server-stuff → New Resource → Docker Compose → connect `v1truv1us/ai-eng-system`
2. **Set compose path**: Point to `agents/research-runner/deploy/docker-compose.yml` (or move it to repo root if Coolify needs it there)
3. **Set env vars**: Add `PI_AUTH_JSON` (run `./get-auth.sh` on your Mac). **Lock it.**
4. **Deploy**

## Adding research items

```bash
# Via Coolify terminal or SSH:
docker exec -it pi-runner vi /app/data/vault/RESEARCH_QUEUE.md

# Or edit topic files in the repo and redeploy:
vi scheduled/competitors.txt
vi scheduled/research-topics.txt
```

## Refreshing auth

OAuth tokens expire (~30 days). Refresh:

```bash
pi  # sign in on Mac
cd agents/research-runner/deploy && ./get-auth.sh
# Update PI_AUTH_JSON in Coolify → Redeploy
```

## File structure

```
deploy/
├── Dockerfile              # Alpine + pi + intelli-search + ai-eng-system + ofelia
├── docker-compose.yml      # Coolify deployment config
├── config/
│   ├── entrypoint.sh       # Auth init, vault init, starts ofelia
│   ├── ofelia.ini          # Cron schedule (5 jobs)
│   └── settings.json       # pi settings (packages, default model)
├── scripts/
│   ├── run-wiki-research.sh
│   ├── run-competitor-scan.sh
│   ├── run-research-runner.sh  # Uses ai-eng-system template engine
│   ├── run-research-deep.sh    # Simpler pi -p fallback
│   ├── pick-model.sh           # Model rotation with limits
│   └── rotate-topic.sh         # Topic file rotation
├── scheduled/
│   ├── models.json             # Model registry + limits
│   ├── competitors.txt         # Competitor rotation list
│   ├── research-topics.txt     # Deep research topics
│   └── usage.json              # Daily model usage tracking
├── skills/
│   ├── wiki-research-engineering/
│   ├── wiki-research-research/
│   ├── wiki-research-personal/
│   └── auto-research/
├── get-auth.sh                 # Extract auth for Coolify env var
├── add-research.sh             # Add item to running container's queue
└── .gitignore
```
