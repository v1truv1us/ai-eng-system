---
name: coolify-deploy
description: Deploy applications to Coolify self-hosting platform. Use when deploying to Coolify, configuring build settings, setting environment variables, managing health checks, or performing rollbacks.
metadata:
  category: user-invoked
  version: 1.0.0
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Coolify Deployment Skill

## Systematic Approach


## Project Types

### Static Sites (Astro, Svelte, Hugo, Jekyll)

```
Build Command: [your build tool] build
Output Directory: dist (or public, _site, build — check your framework)
```

### Application Containers (Any Runtime)

```
Build Command: [install dependencies] && [build]
Start Command: [your runtime] [entry point]
Port: [your app port]
```

Examples by language:
- Node.js: `npm run build` / `node dist/index.js`
- Python: `pip install -r requirements.txt` / `uvicorn app.main:app`
- Go: `go build -o app` / `./app`
- Rust: `cargo build --release` / `./target/release/app`

### Docker-Based Applications

```
Dockerfile: ./Dockerfile
Port: [your container port]
```

## Deployment Checklist

### Before Deploying

- [ ] All tests passing locally
- [ ] Environment variables configured in Coolify dashboard
- [ ] Health check endpoint verified (`/health`)
- [ ] Database migrations reviewed (if applicable)
- [ ] Rollback plan documented

### During Deployment

- [ ] Build succeeds without errors
- [ ] Health check passes after deploy
- [ ] No error spikes in logs
- [ ] Response times within normal range

### After Deployment

- [ ] Smoke test critical paths
- [ ] Monitor error rates for 15 minutes
- [ ] Verify database migrations completed
- [ ] Update deployment log

## Environment Variables

Set these in Coolify dashboard under Environment Variables:

```bash
ENVIRONMENT=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
# Add your app-specific variables
```

## Health Check Setup

Add a `/health` endpoint to your application. Examples by language:

**Python (Flask):**
```python
@app.route('/health')
def health():
    return jsonify(status='ok', timestamp=datetime.utcnow().isoformat())
```

**Go:**
```go
http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
})
```

**Node.js (Express):**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

Configure in Coolify:
- Health Check URL: `/health`
- Health Check Interval: 30 seconds

## Nixpacks Configuration

For automatic build detection, add `nixpacks.toml`. Coolify auto-detects most runtimes, but you can customize:

```toml
[phases.setup]
nixPkgs = ["<your-runtime-package>"]

[phases.install]
cmds = ["<install-command>"]

[phases.build]
cmds = ["<build-command>"]

[start]
cmd = "<start-command>"
```

Consult the [Nixpacks docs](https://nixpacks.com/docs) for your specific runtime.

## Rollback

If deployment fails:

1. In Coolify dashboard, go to Deployments
2. Find the last working deployment
3. Click "Redeploy" on the working version
4. Verify health check passes

Or via CLI:
```bash
coolify deployments redeploy --applicationUuid "app-uuid" --deploymentUuid "last-good-deployment-uuid"
```

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll skip the pre-deploy checklist, it's just a small change" | Small changes break production too. The checklist catches what assumptions miss. |
| "The health check is optional" | Without a health check, you cannot verify the deployment succeeded. |
| "I'll configure environment variables after deploy" | Missing env vars cause startup failures. Configure them before deploying. |
| "Rollback is too complex, I'll fix forward if it breaks" | Fixing forward under pressure introduces more risk than a clean rollback. |
| "I don't need to monitor after deploy" | The first 15 minutes after deploy are when issues surface. Monitor actively. |
