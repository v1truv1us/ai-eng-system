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
3. **Auth on the VPS** (recommended — Coolify env vars are too short for full `auth.json`):
   ```bash
   # SSH to the VPS (same machine Coolify uses for Docker)
   npm install -g @earendil-works/pi-coding-agent
   pi    # sign in once
   ./setup-vps-auth.sh   # copies ~/.pi/agent/auth.json → /data/pi-runner/auth.json
   ```
   Compose bind-mounts that file into the container. To refresh tokens later, run `pi` on the VPS again and re-run `setup-vps-auth.sh` (no redeploy needed if the mount path is unchanged).

   Optional: set `PI_AUTH_HOST_FILE` in Coolify if you use a path other than `/data/pi-runner/auth.json`.

   Alternative (small auth only): `PI_AUTH_JSON` from `./get-auth.sh` on your Mac — only works if the JSON fits Coolify’s env editor.
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

OAuth tokens expire (~30 days). On the VPS:

```bash
pi    # sign in again on the host
./setup-vps-auth.sh   # overwrites /data/pi-runner/auth.json
```

Restart the container in Coolify if a job still sees stale auth (usually not required).

## File structure

```
deploy/
├── Dockerfile              # Alpine + pi + intelli-search + ai-eng-system + ofelia
├── docker-compose.yml      # Coolify deployment config
├── config/
│   ├── entrypoint.sh       # Auth init, vault init, starts dcron
│   ├── crontab             # Cron schedule (5 jobs)
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
├── get-auth.sh                 # Extract minimal auth for PI_AUTH_JSON (optional)
├── setup-vps-auth.sh           # Copy host pi login → /data/pi-runner/auth.json
├── add-research.sh             # Add item to running container's queue
└── .gitignore
```
