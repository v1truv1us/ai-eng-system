DONE — read-only review only. No files modified, no SSH, no external APIs.

## Findings

### 1. New `research-queue` app is only partially wired for the stated “app + runner” deployment
Evidence:
- `research-queue/docker-compose.yml` defines only `services.app`; no `runner` service exists, despite comments and README saying two services.
- `README.md` says “single Coolify application with two services” and runner “pulls items from API”.
- `runner/` exists locally, but is not referenced by `docker-compose.yml`.

Impact: Coolify compose deploy from `research-queue/docker-compose.yml` will only deploy the Astro app, not the runner.

### 2. Healthcheck will fail unless changed
Evidence:
- `docker-compose.yml` healthcheck:
  ```yaml
  test: ["CMD", "curl", "-f", "http://localhost:4321/api/queue/next"]
  ```
- `src/pages/api/queue/next.ts` requires `x-runner-key` or `?key=...`; unauthorized returns `401`.
- `src/lib/runner-auth.ts` returns false if no key or no configured keys.

Impact: `curl -f` treats 401 as failure, so Coolify/Docker may mark the app unhealthy even when it is running.

Next step: add an unauthenticated `/health` endpoint or include a valid runner key in the healthcheck.

### 3. Routing/domain conflict with old `pi-runner` is likely
Evidence:
- New app labels route `research.v1truv1us.dev`:
  ```yaml
  traefik.http.routers.research-queue.rule=Host(`research.v1truv1us.dev`)
  ```
- Old `ai-eng-system/agents/research-runner/deploy/docker-compose.yml` also routes same host:
  ```yaml
  traefik.http.routers.pi-runner-queue.rule=Host(`research.v1truv1us.dev`)
  ```
- Old router uses `entrypoints=http,https` and TLS; new router only sets `entrypoints=http`.

Impact: if old `pi-runner` service remains deployed, Traefik may continue serving old queue UI or create competing routers for the same domain. HTTPS may especially stay on the old service because new labels do not declare HTTPS/TLS.

Next step: in Coolify, disable/remove the old `pi-runner` domain/router or move it to another hostname before routing `research.v1truv1us.dev` to the new app. Add HTTPS/TLS labels or let Coolify manage the domain, but avoid duplicate manual labels.

### 4. Runner container in `research-queue/runner` is not deployable as-is
Evidence:
- `runner/Dockerfile` sets:
  ```dockerfile
  ENTRYPOINT ["/app/entrypoint.sh"]
  ```
  but does not copy `runner/config/entrypoint.sh` to `/app/entrypoint.sh`.
- It creates `/app/scripts` but does not copy `runner/scripts/`.
- It copies from `agents/research-runner/deploy/...`, which belongs to `ai-eng-system`, not `research-queue`.
- `runner/scripts/run-wiki-research.sh` requires `RUNNER_API_KEY`, but `.env.example` and app use `RUNNER_API_KEYS`.

Impact: if you add a runner service using this Dockerfile, it is likely to fail at runtime due missing entrypoint/scripts and env mismatch.

Next step: choose one runner source of truth:
1. Keep old `ai-eng-system` runner but update it to call the new API and stop serving the old UI/domain; or
2. Make `research-queue/runner` self-contained and add it as a compose service with correct copies, `RUNNER_API_KEY`, `QUEUE_API_URL=***, and shared network.

### 5. Queue UI/auth is currently not protected
Evidence:
- Better Auth endpoint exists at `src/pages/api/auth/[...all].ts`.
- Search found no session checks/middleware in queue pages.
- `src/pages/api/queue/add.ts` has:
  ```ts
  userId: "system", // TODO: use actual user once auth is wired
  ```
- `src/pages/queue/[id].astro` allows POST requeue/archive/delete without auth.

Impact: if public route is live, anyone who can reach the domain can view/add/delete/archive/requeue items.

Next step: before public cutover, either add auth enforcement to all `/queue` pages and mutation endpoints or put the app behind Coolify/basic auth temporarily.

### 6. Runner API auth behavior is clear but env names must align
Evidence:
- App expects `RUNNER_API_KEYS` comma-separated.
- Runner script expects singular `RUNNER_API_KEY`.
- `next` accepts header or query key; `start` and `complete` accept header only.

Next step: set `RUNNER_API_KEYS=*** on app and `RUNNER_API_KEY=*** on runner.

## Suggested exact next steps

1. Resolve domain conflict first: remove/disable old `pi-runner` Traefik labels/domain for `research.v1truv1us.dev`, or assign old UI a different hostname.
2. Fix app healthcheck: use a `/health` route or authenticated check.
3. Add HTTPS/TLS routing for new app, or let Coolify own routing without duplicate manual labels.
4. Decide runner architecture:
   - Short path: keep old runner container, remove old UI routing, modify runner scripts/env to call new API.
   - Cleaner path: finish `research-queue/runner` and add it to `docker-compose.yml`.
5. Protect public UI before exposing the domain: Better Auth middleware/session checks or temporary basic auth.
6. Verify in Coolify logs after redeploy: app build, DB init, health status, effective Traefik routers for `research.v1truv1us.dev`.

## Verification evidence

Read/reviewed:
- `/Users/johnferguson/Github/research-queue/docker-compose.yml`
- `/Users/johnferguson/Github/research-queue/Dockerfile`
- `/Users/johnferguson/Github/research-queue/package.json`
- `/Users/johnferguson/Github/research-queue/.env.example`
- `/Users/johnferguson/Github/research-queue/README.md`
- `/Users/johnferguson/Github/research-queue/src/pages/api/**`
- `/Users/johnferguson/Github/research-queue/src/lib/auth/**`
- `/Users/johnferguson/Github/research-queue/src/lib/runner-auth.ts`
- `/Users/johnferguson/Github/research-queue/src/pages/queue/**`
- `/Users/johnferguson/Github/research-queue/runner/**`
- `/Users/johnferguson/Github/ai-eng-system/agents/research-runner/deploy/**`

Not verified:
- Did not run builds/tests.
- Did not inspect live Coolify state.
- Did not SSH or call external APIs.
