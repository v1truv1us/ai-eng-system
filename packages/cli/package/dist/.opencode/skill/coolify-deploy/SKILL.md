---
name: coolify-deploy
description: "Deploy applications to Coolify self-hosting platform. Use when deploying to Coolify, configuring build settings, setting environment variables, managing health checks, or performing rollbacks."
version: 1.0.0
---

# Coolify Deployment Skill

## Critical Importance

**This deployment process is critical.** Proper deployment prevents production outages, security vulnerabilities, and user-facing errors. A poorly executed deployment can result in lost revenue, damaged reputation, and emergency firefighting. Every deployment must follow best practices to ensure reliability.

## Systematic Approach

**Approach this deployment systematically.** Deployments require careful planning, thorough verification, and methodical execution. Rushing or skipping checks leads to avoidable incidents. Follow the checklist methodically, verify each step, and ensure all safety measures are in place before proceeding.

## The Challenge

**The deploy flawlessly every time, but if you can:**

- You'll maintain production stability
- Users will experience zero downtime
- Rollbacks will be instant and painless
- The team will trust your deployment process

Mastering Coolify deployment requires balancing automation with manual verification. Can you configure deployments that run automatically while still providing safety nets and quick recovery options?

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

## Deployment Confidence Assessment

After completing each deployment, rate your confidence from **0.0 to 1.0**:

- **0.8-1.0**: Confident deployment went smoothly, all checks passed, rollback plan tested
- **0.5-0.8**: Deployment succeeded but some steps were uncertain or skipped
- **0.2-0.5**: Deployment completed with concerns, manual intervention needed
- **0.0-0.2**: Deployment failed or completed with significant issues

Document any uncertainty areas or risks identified during the deployment process.
