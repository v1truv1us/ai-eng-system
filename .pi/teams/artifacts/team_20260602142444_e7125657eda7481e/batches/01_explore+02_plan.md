=== Task 1: 01_explore (explorer) ===
Status: COMPLETED
Role: explorer
Result artifact: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/results/01_explore.txt
Log artifact: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/logs/01_explore.log
Transcript: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/transcripts/01_explore.attempt-0.jsonl
Usage: {"input":507070,"output":5364,"cacheRead":0,"cacheWrite":0,"cost":0,"turns":0}
I've completed the codebase exploration. Here is my findings report.

---

## Exploration Report: ud-audit-agent

### Objective
Explore the codebase for patterns relevant to building a VPS-hosted Fastify + Bun service that performs monthly Lighthouse, SEO, a11y, and dependency audits for UD client sites, applies fixes, and opens GitHub PRs.

### Key Findings

#### 1. Existing Near-Identical Blueprint: headstart-agent Spec
**File:** `specs/headstart-agent/spec.md`

The codebase already contains a **complete specification and implementation plan** for a nearly identical service — the Headstart Autonomous Agent. It covers:
- Fastify + Bun service on VPS via Coolify
- Monthly Lighthouse (mobile + desktop), SEO, accessibility audits
- Dependency checking via `bun outdated` / `bun audit`
- SQLite job queue with retries and idempotency
- GitHub PR creation via `@octokit/rest`
- Cron scheduling via `node-cron`
- Sentry error tracking + email alerts
- Docker/Coolify deployment

The ud-audit-agent would be a **multi-tenant generalization** of this single-site agent. The headstart spec has 17 implementation tasks (T-001 through T-017) with full dependency graphs.

#### 2. Tech Stack (Established Pattern)
From `specs/headstart-agent/spec.md` §4.1 and task files:
| Component | Technology |
|-----------|-----------|
| Runtime | Bun |
| HTTP Framework | Fastify |
| Job Queue | better-sqlite3 (sync, single-writer) |
| GitHub API | @octokit/rest |
| Scheduling | node-cron |
| Logging | pino (structured JSON) |
| Error Tracking | @sentry/node |
| Email Alerts | nodemailer |
| Validation | zod |
| Testing | bun:test |

#### 3. Relevant Skills Already in Codebase
| Skill | Path | Relevance |
|-------|------|-----------|
| `seo-audit` | `skills/seo-audit/SKILL.md` | Full Lighthouse audit workflow — mobile + desktop scans, Core Web Vitals extraction, meta tags, headings, images, links, structured data, technical SEO, mobile/a11y checks. Complete output format defined. |
| `coolify-deploy` | `skills/coolify-deploy/SKILL.md` | Coolify deployment patterns, health checks, Nixpacks config, rollback |
| `github` | `skills/github/SKILL.md` | GitHub CLI automation for PRs, issues, checks |
| `performance-optimization` | `skills/performance-optimization/SKILL.md` | Lighthouse audit integration |
| `sentry` | `skills/sentry/SKILL.md` | Sentry error tracking |
| `playwright` | `skills/playwright/SKILL.md` | E2E testing |
| `security-scan` | `skills/security-scan/SKILL.md` | Security scanning |

#### 4. Reference Documents
| Document | Path | Content |
|----------|------|---------|
| Accessibility Checklist | `references/accessibility-checklist.md` | WCAG 2.1 AA, keyboard nav, screen reader, automated testing (axe, pa11y, Lighthouse, Playwright) |
| Performance Checklist | `references/performance-checklist.md` | Core Web Vitals targets, bundle optimization, measurement commands |
| Security Checklist | `references/security-checklist.md` | OWASP Top 10, dependency auditing (`npm audit`, `npm outdated`, `socket scan`) |

#### 5. Plugin Architecture (for ai-eng-system integration)
The project uses a plugin system under `plugins/` with this structure:
```
plugins/<name>/
├── plugin.json     # Name, version, commands array
├── commands/*.md   # Slash commands
├── agents/*.md     # Agent definitions (frontmatter: name, description, mode, temperature, tools)
├── skills/         # Skill directories with SKILL.md
└── hooks.json      # Session lifecycle hooks
```

7 existing plugins: `ai-eng-core`, `ai-eng-content`, `ai-eng-quality`, `ai-eng-devops`, `ai-eng-research`, `ai-eng-learning`, `ai-eng-plugin-dev`.

A `ud-audit-agent` could be added as a new plugin or as a standalone service (like headstart-agent).

#### 6. PR Creation Pattern
From `specs/headstart-agent/spec.md` §2.4:
- Uses `@octokit/rest` with fine-grained PAT (`contents:write`, `pull_requests:write`)
- Branch naming: `agent/{task}-{slug}` (e.g., `agent/monthly-2026-06-01`)
- PR body template includes audit results table (Lighthouse scores, dependency status, content freshness)
- Never pushes to `main` directly

#### 7. Audit Task Pattern
From `specs/headstart-agent/tasks/T-010.md`:
1. `ensureRepo()` — fresh clone/pull of target repo
2. `bun outdated` — parse output for outdated packages
3. `bun audit` — capture vulnerability count
4. Lighthouse (mobile + desktop) — extract scores
5. Content freshness checks
6. If actionable changes: update deps, create branch, commit, push, open PR
7. If no changes: return success with "no action required"

#### 8. Multi-Tenant Gap
The headstart-agent spec is **single-site**. For ud-audit-agent serving multiple UD client sites, the following would need extension:
- Config schema → array of client sites with URLs, repos, tokens
- Queue → multi-tenant with `siteId` or `clientId` field
- Scheduler → iterate over all client sites
- PR creation → per-site repos
- Rate limiting → GitHub API rate limits across multiple repos

### Files Inspected
| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | Full | Workspace structure, dependencies, scripts |
| `build.ts` | 1–80 | Build process overview |
| `specs/headstart-agent/spec.md` | Full | Complete service specification |
| `specs/headstart-agent/plan.md` | Full | 17-task implementation plan |
| `specs/headstart-agent/tasks/T-001.md` | Full | Scaffold task |
| `specs/headstart-agent/tasks/T-006.md` | Full | GitHub API wrapper task |
| `specs/headstart-agent/tasks/T-010.md` | Full | Monthly audit task |
| `skills/seo-audit/SKILL.md` | Full | Lighthouse/SEO audit workflow |
| `skills/coolify-deploy/SKILL.md` | Full | Coolify deployment patterns |
| `skills/github/SKILL.md` | Full | GitHub automation |
| `references/accessibility-checklist.md` | Full | a11y testing reference |
| `references/performance-checklist.md` | Full | Performance testing reference |
| `references/security-checklist.md` | 85–100 | Dependency auditing section |
| `plugins/ai-eng-*/plugin.json` | Full | Plugin structure patterns |
| `plugins/ai-eng-devops/agents/deployment-engineer.md` | Full | Agent definition pattern |
| `TODO.md` | 1–80 | Current task backlog |
| `scripts/build-all.ts` | Full | Build orchestration pattern |

### Blockers / Risks
1. **No ud-audit-agent spec exists yet** — The headstart-agent spec is the closest reference but is single-site. A new spec is needed that generalizes to multiple UD client sites.
2. **GitHub API rate limits** — Multiple client sites means multiple repos. A fine-grained PAT per site or a GitHub App may be needed.
3. **Lighthouse in Docker** — Headstart plan flags this risk (Low likelihood, High impact). The `lighthouse` npm package can be used programmatically but requires Chrome/Chromium in the container.
4. **No existing ud-* skills found** — The headstart spec references `headstart-newsletter` and `ud-monthly-updates` skills at `/Users/johnferguson/.agents/skills/` (outside this repo). These should be reviewed if available.

### Recommended Next Action
Create a **ud-audit-agent specification** modeled on the headstart-agent spec, with these additions:
- Multi-tenant config: `clients[]` array with `name`, `url`, `githubRepo`, `lighthouseTargets`
- Client-specific Lighthouse audit targets (not just the repo homepage)
- Dependency audit scope clarification: audit each client site's repo independently
- PR creation per client site
- Rate limit management across multiple GitHub repos

=== Task 2: 02_plan (planner) ===
Status: COMPLETED
Role: planner
Result artifact: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/results/02_plan.txt
Log artifact: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/logs/02_plan.log
Transcript: /Users/johnferguson/Github/ai-eng-system/.pi/teams/artifacts/team_20260602142444_e7125657eda7481e/transcripts/02_plan.attempt-0.jsonl
Usage: {"input":229034,"output":5955,"cacheRead":0,"cacheWrite":0,"cost":0,"turns":0}
Now I have sufficient context. Here is the implementation plan:

---

# Implementation Plan: ud-audit-agent

## Metadata

| Field | Value |
|---|---|
| Feature | ud-audit-agent — VPS-hosted monthly audit service |
| Version | 1.0.0 |
| Date | 2026-06-02 |
| Status | Draft |
| Depends on | `seo-audit` skill patterns, Coolify deployment skill, `headstart-agent` architecture reference |

---

## 1. Objective

Build a VPS-hosted Fastify + Bun service that performs **monthly Lighthouse, SEO, accessibility, and dependency audits** for UD client sites, **applies safe fixes automatically**, and **opens GitHub PRs** for human review.

Unlike `headstart-agent`, this agent has **no email webhook** — it is purely cron-driven. It also manages **multiple client sites** from a single instance.

### Success Criteria

| # | Criterion | Measurement |
|---|---|---|
| 1 | Monthly audit runs on schedule for all configured sites | Cron fires; each site gets a job with completed/failed status |
| 2 | Lighthouse scores captured for mobile + desktop | JSON output parsed; scores written to PR body |
| 3 | SEO, a11y, and dependency issues detected | Audit report lists findings with severity |
| 4 | Safe fixes applied automatically | Auto-fixes committed to PR branch; unsafe findings listed as recommendations only |
| 5 | PR opened per site per audit cycle | Idempotency: one PR per site per month |
| 6 | Service deployable via Coolify with `Dockerfile` + env vars | `docker build` succeeds; `/health` responds |
| 7 | Failed jobs alert via Sentry | Sentry issue created with job context |

---

## 2. Scope

### In Scope
- Standalone Fastify + Bun service under `ud-audit-agent/`
- SQLite job queue (create, claim, complete, fail, retry)
- Multi-site configuration via env vars or JSON config
- Cron scheduler for monthly audit runs
- Lighthouse CLI integration (mobile + desktop)
- SEO/a11y checks (leveraging `seo-audit` skill patterns)
- Dependency audit via `bun outdated` parsing
- Auto-fix engine for safe, deterministic fixes
- GitHub PR creation via `@octokit/rest`
- Sentry error reporting
- Docker + Coolify deployment config
- Unit + integration tests

### Out of Scope
- Email webhooks or newsletter ingestion (headstart-agent covers this)
- Real-time monitoring dashboards
- Auto-merge of PRs (always requires human review)
- Dependency major version auto-updates (flagged only)

---

## 3. Architecture

### 3.1 High-Level Data Flow

```
Cron fires → Scheduler creates audit jobs per site
           → Job Queue stores jobs
           → Job Processor claims jobs one-by-one
                → Clone/pull site repo
                → Run Lighthouse (mobile + desktop)
                → Run SEO/a11y checks
                → Run dependency audit
                → Apply safe auto-fixes
                → Commit + push to agent branch
                → Open PR with audit report
           → Mark job complete/failed
           → Retry on failure (3× exponential backoff)
```

### 3.2 Project Structure

```
ud-audit-agent/
├── src/
│   ├── index.ts                 # Entry: starts server + scheduler + job processor
│   ├── server.ts                # Fastify: /health, /jobs, /trigger endpoints
│   ├── scheduler.ts             # node-cron: monthly schedule, manual trigger support
│   ├── queue.ts                 # SQLite job queue (better-sqlite3)
│   ├── config.ts                # Zod env validation + multi-site config
│   ├── logger.ts                # Pino structured logging
│   ├── github.ts                # @octokit/rest wrapper
│   ├── repo.ts                  # Clone, pull, commit, push helpers
│   ├── alerts.ts                # Sentry error reporting
│   ├── types.ts                 # Shared interfaces
│   └── audit/
│       ├── orchestrator.ts      # Runs all audit checks, aggregates results
│       ├── lighthouse.ts        # Lighthouse CLI wrapper (mobile + desktop)
│       ├── seo.ts               # SEO checks (meta tags, structured data, sitemaps)
│       ├── a11y.ts              # Accessibility checks (ARIA, contrast, labels)
│       ├── dependencies.ts      # bun outdated parser, safe update logic
│       ├── autofix.ts           # Deterministic fix appliers
│       └── reporter.ts          # PR body generator from audit results
├── data/
│   └── .gitkeep                 # SQLite DB mount point
├── tests/
│   ├── unit/
│   │   ├── queue.test.ts
│   │   ├── config.test.ts
│   │   ├── lighthouse.test.ts
│   │   ├── seo.test.ts
│   │   ├── dependencies.test.ts
│   │   └── autofix.test.ts
│   └── integration/
│       ├── github.test.ts
│       └── orchestrator.test.ts
├── .env.example
├── Dockerfile
├── coolify.yaml
├── package.json
├── tsconfig.json
└── README.md
```

### 3.3 Technology Stack

| Component | Choice | Rationale |
|---|---|---|
| Runtime | Bun | Matches existing ai-eng-system stack |
| HTTP | Fastify | Lightweight, built-in JSON schema validation |
| Database | better-sqlite3 | Sync SQLite, single-writer, no async complexity |
| GitHub API | @octokit/rest | Official, well-typed |
| Scheduling | node-cron | Simple cron expressions |
| Logging | pino | Structured JSON |
| Validation | zod | Env vars + config schemas |
| Error Tracking | @sentry/node | Automatic capture + tracing |
| Testing | bun:test | Built-in, no extra deps |
| Auditing | lighthouse (npm package) | Programmatic CLI access |

---

## 4. Implementation Tasks

### Phase 1: Foundation (1.0 hrs)

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-001 | Initialize project scaffold | 15 min | Low | None |
| T-002 | Config + multi-site schema (zod) | 20 min | Low | T-001 |
| T-003 | Structured logger (pino) | 10 min | Low | T-002 |
| T-004 | Shared types (Site, Job, AuditResult, Fix) | 15 min | Low | T-001 |

**Phase Exit:** `bun install`, `bun run typecheck` pass; `config.ts`, `logger.ts`, `types.ts` exist and compile.

### Phase 2: Core Infrastructure (1.75 hrs)

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-005 | SQLite job queue | 40 min | Medium | T-002, T-004 |
| T-006 | GitHub API wrapper | 30 min | Medium | T-002 |
| T-007 | Repo clone/pull/commit/push helpers | 35 min | Medium | T-006 |

**Phase Exit:** Queue CRUD + retry tests pass; GitHub mock tests pass; repo mock tests pass.

### Phase 3: Audit Engine (2.75 hrs)

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-008 | Lighthouse CLI wrapper | 35 min | Medium | T-002 |
| T-009 | SEO audit checks | 40 min | Medium | T-008 |
| T-010 | Accessibility checks | 30 min | Medium | T-008 |
| T-011 | Dependency audit + safe update logic | 40 min | Medium | T-002, T-007 |
| T-012 | Audit orchestrator (runs T-008–T-011, aggregates) | 30 min | Medium | T-008, T-009, T-010, T-011 |

**Phase Exit:** Each audit module has unit tests with mocked Lighthouse output; orchestrator aggregates correctly.

### Phase 4: Auto-Fix + Reporting (1.5 hrs)

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-013 | Auto-fix engine (deterministic, safe fixes only) | 45 min | High | T-012 |
| T-014 | PR body reporter (from audit results + fixes) | 25 min | Medium | T-012, T-013 |

**Auto-Fix Scope (v1 — safe, deterministic only):**
- Add missing `alt=""` to images without alt text
- Add `rel="noopener"` to external `target="_blank"` links
- Fix meta description length (trim or pad)
- Update copyright year in configured files
- Safe dependency patch/minor updates (pin exact versions)
- **Never:** delete content, modify business logic, change layout

**Phase Exit:** autofix tests verify each fix type; reporter generates correct PR body format.

### Phase 5: Server + Orchestration (1.5 hrs)

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-015 | Fastify server (/health, /jobs, /trigger) | 30 min | Medium | T-003, T-005 |
| T-016 | Scheduler + job processor loop | 45 min | Medium | T-005, T-012, T-013, T-014 |
| T-017 | Sentry alerting | 15 min | Low | T-003, T-005 |

**Phase Exit:** `bun run dev` starts without errors; manual `/trigger` creates jobs; processor executes and reports; SIGTERM graceful shutdown.

### Phase 6: Deployment (0.75 hrs)

| ID | Task | Time 
[pi-crew compacted 6292 chars]