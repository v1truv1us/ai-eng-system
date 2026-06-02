I now have a thorough understanding of the codebase. Here is my exploration report:

---

## Exploration Report: ud-audit-agent

### Status: DONE

### Files Inspected (with evidence)

| File | Lines | Relevance |
|------|-------|-----------|
| `specs/headstart-agent/spec.md` | Full | **Primary blueprint** — detailed spec for a nearly identical service (Fastify + Bun + SQLite queue + cron + GitHub PRs + Coolify deploy). ud-audit-agent is a multi-site variant of this. |
| `specs/headstart-agent/plan.md` | Full | 17-task implementation plan with dependency graph, phases, and risk assessment |
| `specs/headstart-agent/tasks/T-001.md` through `T-017.md` | Sampled T-001, T-006, T-008, T-010, T-012, T-013 | Detailed task acceptance criteria for scaffold, GitHub wrapper, Fastify server, monthly audit, scheduler, Dockerfile |
| `skills/seo-audit/SKILL.md` | Full | Lighthouse scan workflow (mobile + desktop), 10-point SEO checklist, output format |
| `/Users/johnferguson/.agents/skills/ud-monthly-updates/SKILL.md` | Full | **Critical** — lists all 10 UD client sites with repos/URLs, defines the monthly audit workflow (Lighthouse + SEO + deps + content freshness) |
| `skills/github/SKILL.md` | Full | GitHub automation skill (GH CLI based) |
| `skills/coolify-deploy/SKILL.md` | Full | Coolify deployment checklist, health check setup, rollback |
| `agents/seo-review-runner/README.md` | Full | Multi-runtime SEO review agent pattern (anthropic/codex/cursor/opencode/pi) |
| `agents/runner-shared/seo-prompt.ts` | Full | Shared SEO prompt builder |
| `agents/research-runner/deploy/*` | Listed | Existing VPS deployment pattern: Dockerfile, docker-compose.yml, entrypoint.sh, crontab |
| `docs/deploy/coolify.md` | Full | Coolify deployment guide for the repo |
| `references/accessibility-checklist.md` | Partial (30/114 lines) | WCAG AA checklist |
| `references/performance-checklist.md` | Partial (30/123 lines) | Core Web Vitals targets, frontend/backend checklists |
| `package.json` | Full | Monorepo workspace structure, bun scripts |

### Existing Reusable Assets

1. **Spec + Plan** (`specs/headstart-agent/`): A fully spec'd autonomous agent with identical architecture (Fastify, Bun, SQLite queue, node-cron, @octokit/rest, Coolify deploy). The ud-audit-agent differs in:
   - **Multi-site** (6+ auditable sites vs. single site)
   - **No email webhook** (cron-only vs. webhook + cron)
   - **Audit scope** (Lighthouse + SEO + a11y + deps for multiple repos vs. newsletter + audit for one repo)

2. **SEO Audit Skill** (`skills/seo-audit/SKILL.md`): Complete 10-point audit workflow with Lighthouse CLI commands, output format, confidence scoring.

3. **UD Monthly Updates Skill** (`~/.agents/skills/ud-monthly-updates/SKILL.md`): Client site registry (7 sites with confirmed URLs, 3 needing URLs), audit workflow definition.

4. **Coolify Deploy Pattern** (`agents/research-runner/deploy/`): Working Dockerfile, docker-compose.yml, dcron-based scheduling, entrypoint script.

5. **Reference Checklists** (`references/`): accessibility-checklist.md, performance-checklist.md, security-checklist.md.

6. **Agent Runner Pattern** (`agents/seo-review-runner/`): Multi-SDK runner architecture with shared prompt/output logic.

### Key Dependencies (from headstart-agent spec T-001)
- `fastify` — HTTP server
- `zod` — env var validation
- `pino` — structured logging
- `better-sqlite3` — job queue
- `@octokit/rest` — GitHub API
- `node-cron` — scheduling
- `@sentry/node` — error tracking
- `lighthouse` — programmatic audits
- `nodemailer` — alert emails

### Architecture Decisions Already Made (in headstart-agent spec)
- **Runtime:** Bun
- **HTTP Framework:** Fastify
- **Database:** SQLite via better-sqlite3 (single-writer, no contention)
- **Scheduling:** node-cron (or dcron in Docker)
- **GitHub:** @octokit/rest with fine-grained PAT
- **Deployment:** Docker → Coolify
- **Error tracking:** Sentry
- **Alerts:** SMTP email
- **Policy:** Never push to main; always open PRs

### Blockers / Uncertainties

1. **No existing ud-audit-agent code** — This is a greenfield service. The headstart-agent is only a spec/plan, not implemented code.
2. **Multi-site vs. single-site** — The headstart spec is single-site. ud-audit-agent needs multi-tenant config (list of sites, each with repo path, production URL, branch policy).
3. **Lighthouse in Docker** — Headstart plan notes this risk (T-010): Lighthouse CLI needs Chrome/Chromium in the Docker image. The Alpine-based `oven/bun:1.2-alpine` won't have it by default.
4. **Which repos to audit** — The ud-monthly-updates skill lists local paths (`~/Github/headstart`, etc.) but the VPS won't have these repos cloned. The agent needs to clone/pull each site's repo before running `bun outdated`.
5. **No existing `specs/ud-audit-agent/`** — Should be created before implementation.

### Next Recommended Action

1. **Create spec** at `specs/ud-audit-agent/spec.md` — fork the headstart-agent spec, replace newsletter webhook with multi-site audit config, expand the monthly audit task to iterate over all client sites
2. **Create plan** at `specs/ud-audit-agent/plan.md` — adapt the 17-task headstart plan, remove newsletter tasks, add multi-site config iteration
3. **Decide on repo strategy**: clone-on-demand vs. persistent repo cache at `/repos/{site-name}`
4. **Address Lighthouse in Docker**: use `lighthouse` npm package programmatically (not CLI) with a headless Chrome binary, or run Lighthouse outside the container via a sidecar
