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
