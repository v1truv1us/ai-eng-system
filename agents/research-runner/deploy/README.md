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

Full checklist (docs site, webhooks, troubleshooting): [docs/deploy/coolify.md](../../../docs/deploy/coolify.md)

1. **Connect repo**: Coolify → server-stuff → New Resource → Docker Compose → `v1truv1us/ai-eng-system`
2. **Compose path**: `agents/research-runner/deploy/docker-compose.yml`, base directory `/`
3. **No public URL** — leave domains empty; clear port `3000` if Coolify added it (this is not a web app)
3. **Auth on the VPS** (recommended — Coolify env vars are too short for full `auth.json`):
   ```bash
   # SSH to the VPS (same machine Coolify uses for Docker)
   npm install -g @earendil-works/pi-coding-agent
   pi    # sign in once
   cd /path/to/ai-eng-system/agents/research-runner/deploy
   git pull
   ./setup-vps-auth.sh   # copies auth into the pi-runner-data Docker volume
   ./verify-pi-runner.sh # confirm auth is visible in the container
   ```
   Coolify does not pass arbitrary host bind-mounts from compose; auth lives at `/app/data/auth.json` inside the persistent volume. Re-run `setup-vps-auth.sh` after `pi` login when tokens expire, then restart the container.

   `cat /data/pi-runner/auth.json` as user `coolify` will fail with permission denied — that is normal (`chmod 600`, owned by root). Use `sudo cat` to inspect.

   Alternative (small auth only): `PI_AUTH_JSON` from `./get-auth.sh` on your Mac.
4. **Deploy**

## Managing research (easy)

### Web UI on your phone (recommended)

The domain is declared in `docker-compose.yml` via Traefik labels — Coolify's proxy auto-discovers it on deploy. No manual domain clicking needed.

Set the password in Coolify **Environment Variables**:
- `QUEUE_UI_PASSWORD` — your password (required; leave blank and the UI rejects all logins)
- `QUEUE_UI_USER` — optional, default `admin`
- `QUEUE_UI_DOMAIN` — optional, default `research.v1truv1us.dev`

Redeploy, then open `https://research.v1truv1us.dev` on your phone, log in, and submit topics.

### CLI on the VPS

Use **`manage-research.sh`** (copy to `~/` or run from this directory):

```bash
./manage-research.sh list
./manage-research.sh add engineering "How does X work?"
./manage-research.sh add research "Latest on agentic browsing"
./manage-research.sh add personal "Best travel routers 2026"
./manage-research.sh edit                    # full queue in vi

./manage-research.sh topics                  # deep-research rotation list
./manage-research.sh topics-add "Question for Wednesday deep run"

./manage-research.sh competitors
./manage-research.sh competitors-add "Competitor Inc"
```

| What | Where it lives | Schedule |
|------|----------------|----------|
| Wiki queue (`#engineering`, `#research`, `#personal`) | `/app/data/vault/RESEARCH_QUEUE.md` | Weekdays / Sunday |
| Deep research topics | `/app/data/scheduled/research-topics.txt` | Wed 2pm PT |
| Competitor scans | `/app/data/scheduled/competitors.txt` | Mon 9am PT |

All of the above persist on the **data volume** — no redeploy needed when you add or edit items.

From your Mac (with SSH/docker to the VPS):

```bash
scp manage-research.sh coolify@v1truv1us.dev:~/
ssh coolify@v1truv1us.dev './manage-research.sh add research "Your topic"'
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
├── manage-research.sh          # Add/list/edit queue and topic files (run on VPS)
├── queue-server.js             # Zero-dep web UI for adding to the queue (port 8080)
├── get-auth.sh                 # Extract minimal auth for PI_AUTH_JSON (optional)
├── setup-vps-auth.sh           # Copy host pi login → Docker volume auth.json
├── verify-pi-runner.sh         # VPS diagnostic (auth, volume, container)
├── add-research.sh             # Add item to running container's queue
└── .gitignore
```
