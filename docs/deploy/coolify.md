# Deploy ai-eng-system on Coolify

Coolify hosts **two independent services** from this repo. Most people only need the **Research Runner** (scheduled Pi jobs).

| Service | Coolify type | Path | Public URL |
|---------|--------------|------|------------|
| **Research Runner** | Docker Compose | `agents/research-runner/deploy/docker-compose.yml` | None |
| **Docs site** (optional) | Static / Docker | `docs-site/` | Your domain |

## 1. Research Runner

Background worker (cron + pi). No HTTP UI.

### Coolify settings

| Setting | Value |
|---------|--------|
| Repository | `v1truv1us/ai-eng-system` |
| Branch | `main` |
| Build pack | Docker Compose |
| Compose file | `agents/research-runner/deploy/docker-compose.yml` |
| Base directory | `/` |
| Domains | Auto-configured in `docker-compose.yml` (optional queue UI) |
| Port exposes | Clear all — no host port bindings; Coolify's proxy routes internally |
| Health check | Compose (`pgrep crond`) — disable HTTP check |

### Queue UI (phone-friendly)

The domain and route are **declared in `docker-compose.yml`** via Traefik labels. Coolify's proxy auto-discovers them — no manual domain clicking needed.

1. In **Environment Variables** on the pi-runner service, add:
   - `QUEUE_UI_PASSWORD` — required password for the form
   - `QUEUE_UI_USER` — optional, default `admin`
   - `QUEUE_UI_DOMAIN` — optional, default `research.v1truv1us.dev`
2. Redeploy. Coolify's proxy (Traefik) auto-provisions SSL.

Open `https://research.v1truv1us.dev` on your phone, log in, submit topics.

Disable the UI anytime by setting `QUEUE_UI_DISABLE=1`.

Watch paths (optional): `agents/research-runner/deploy/**`

### VPS auth

```bash
ssh coolify@v1truv1us.dev
./setup-vps-auth.sh    # after: npm i -g @earendil-works/pi-coding-agent && pi
./verify-pi-runner.sh
```

Logs must show: `[init] Auth configured from /app/data/auth.json`

See [agents/research-runner/deploy/README.md](../../agents/research-runner/deploy/README.md).

## 2. Docs site (optional)

[docs-site/DEPLOYMENT.md](../../docs-site/DEPLOYMENT.md) — build `docs-site/` with `bun run build`, output `dist/`.

## 3. Auto-deploy

Enable Coolify webhook / deploy on push to `main`.

## 4. Update research topics

**Phone / web:** `https://research.v1truv1us.dev` (see Queue UI above).

**VPS CLI:** copy `manage-research.sh` once, then:

```bash
./manage-research.sh list
./manage-research.sh add engineering "Your question"
./manage-research.sh topics-add "Deep research question"
```

See [agents/research-runner/deploy/README.md](../../agents/research-runner/deploy/README.md).

## 5. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `EBADPLATFORM` / arm64 esbuild | Pull latest `main` |
| `No auth configured` | `./setup-vps-auth.sh` on VPS |
| `restarting:unhealthy` | Pull latest `main` (dcron/procps) |
| auth.json is a directory | Remove dir, recreate file, redeploy |
