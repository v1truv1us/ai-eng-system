# Specification: Headstart Autonomous Agent

## Metadata

| Field | Value |
|---|---|
| Feature | Headstart Autonomous Agent |
| Version | 1.0.0 |
| Date | 2026-05-29 |
| Status | Draft |
| Author | AI Engineering System |
| Depends on | `headstart-newsletter` skill, `ud-monthly-updates` skill, Coolify deployment infrastructure |

---

## 1. Objective

### What This Feature Does

The Headstart Autonomous Agent is a long-running service deployed to a VPS via Coolify that automates recurring maintenance tasks for the Headstart website. It operates without human intervention for detection and execution, but defers to human review for all changes by opening pull requests.

### Core Capabilities

1. **Newsletter Ingestion** — Receives PDF newsletter attachments via email webhook, validates the sender, copies the PDF to the correct repo path, updates the calendar JSON, commits, pushes a branch, and opens a PR.
2. **Monthly Maintenance Audit** — On a scheduled cron trigger, checks for outdated dependencies, runs Lighthouse performance/SEO audits, verifies content freshness (copyright year, last newsletter date, broken links), and opens a PR if any actionable changes are found.
3. **Job Queue Management** — Persists all work in a SQLite-backed queue with idempotency, retries, and failure recovery.
4. **Observability** — Exposes health, job status, and structured logs for monitoring.

### Target Users

| User | Role | Need |
|---|---|---|
| Site maintainer (you) | Primary operator | Eliminate manual monthly upkeep; review PRs at your convenience |
| Headstart staff | Email senders | Forward newsletter PDFs to an address; no technical steps required |

### Success Criteria

| # | Criterion | Measurement |
|---|---|---|
| 1 | Newsletter PR created within 5 minutes of valid email receipt | Time from webhook 202 to PR URL in GitHub |
| 2 | Monthly audit runs without failure on schedule | Cron fires on 1st of month; job completes or fails gracefully with logged reason |
| 3 | No duplicate PRs for the same newsletter month | Idempotency: branch `agent/newsletter-{month}-{year}` blocks reprocessing |
| 4 | Failed jobs retry 3× with exponential backoff | SQLite `retryCount` and `status` fields confirm retry behavior |
| 5 | Service is deployable to Coolify with a single `Dockerfile` and env vars | `docker build` succeeds; `docker run` with env vars starts the service |
| 6 | All changes arrive as PRs; the agent never pushes to `main` directly | GitHub branch protection + agent logic guarantee this |

---

## 2. Interface Contracts

### 2.1 Webhook Endpoint

```
POST /webhook/email
Content-Type: multipart/form-data
```

**Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `sender` | string | Yes | Originating email address |
| `subject` | string | Yes | Must match `/\w+ Newsletter \d{4}/i` |
| `attachment` | file | Yes | PDF file to ingest |

**Responses:**

```json
// 202 Accepted
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "type": "newsletter"
}

// 400 Bad Request
{ "error": "No PDF attachment found" }
{ "error": "Subject does not match expected format: '{Month} Newsletter {Year}'" }

// 403 Forbidden
{ "error": "Sender not authorized" }
```

**Validation Rules:**
- `sender` must be in `ALLOWED_SENDERS` env var (exact match, case-insensitive)
- `subject` must parse to `{Month} {Year}` where month is a valid English month name
- Exactly one PDF attachment accepted; reject if zero or multiple

### 2.2 Health & Status Endpoints

```
GET /health
```

```json
{
  "status": "ok",
  "version": "1.0.0",
  "queue": {
    "pending": 0,
    "running": 0,
    "failed": 0
  }
}
```

```
GET /jobs?limit=50&status=pending
```

```json
{
  "jobs": [
    {
      "id": "uuid",
      "type": "newsletter",
      "status": "completed",
      "branch": "agent/newsletter-april-2026",
      "prUrl": "https://github.com/.../pull/42",
      "createdAt": "2026-05-29T10:00:00Z",
      "completedAt": "2026-05-29T10:02:15Z"
    }
  ],
  "total": 1
}
```

### 2.3 Internal Task Runner API

All tasks implement a common interface:

```typescript
interface Task {
  readonly type: string;
  run(payload: unknown): Promise<TaskResult>;
}

interface TaskResult {
  success: boolean;
  branch?: string;
  prUrl?: string;
  message: string;
}
```

### 2.4 GitHub PR Creation

```typescript
// Pseudocode — actual implementation uses @octokit/rest
async function createPullRequest(params: {
  title: string;
  head: string;
  base: string;
  body: string;
  labels: string[];
}): Promise<string> // returns PR URL
```

**PR Body Template (Newsletter):**
```markdown
## Automated Newsletter Addition

- **Month:** April 2026
- **File:** `public/pdfs/April Newsletter 2026.pdf`
- **Triggered by:** Email from staff@headstart.org

### Changes
- Added PDF to `public/pdfs/`
- Updated `src/content/calendar/_index.json`

---
*This PR was created automatically by the Headstart Agent.*
```

**PR Body Template (Monthly Audit):**
```markdown
## Monthly Maintenance Audit — 2026-05-01

### Dependency Status
- Outdated packages: 3
- Vulnerabilities: 0

### Lighthouse Scores
| Category | Mobile | Desktop |
|---|---|---|
| Performance | 87 | 94 |
| Accessibility | 100 | 100 |
| Best Practices | 95 | 95 |
| SEO | 100 | 100 |

### Content Freshness
- Last newsletter: April 2026
- Copyright year: current
- Broken external links: 0

---
*This PR was created automatically by the Headstart Agent.*
```

---

## 3. Project Structure

### 3.1 New Files

```
apps/headstart-agent/
├── src/
│   ├── index.ts              # Entry point: starts HTTP server + scheduler
│   ├── server.ts             # Fastify/Express webhook receiver + status endpoints
│   ├── scheduler.ts          # node-cron setup for monthly audit
│   ├── queue.ts              # SQLite job queue (create, claim, complete, fail)
│   ├── config.ts             # Env var validation with zod
│   ├── logger.ts             # Structured pino logger
│   ├── github.ts             # Octokit wrapper for PR creation, branch push
│   ├── repo.ts               # Clone/pull repo, commit, push helpers
│   ├── tasks/
│   │   ├── index.ts          # Task registry
│   │   ├── newsletter.ts     # Newsletter ingestion task
│   │   └── monthly-audit.ts  # Monthly maintenance audit task
│   └── types.ts              # Shared TypeScript interfaces
├── prisma/
│   └── schema.prisma         # SQLite schema (optional; plain SQL also acceptable)
├── data/
│   └── .gitkeep              # Runtime SQLite DB + logs mount point
├── tests/
│   ├── unit/
│   │   ├── queue.test.ts
│   │   ├── config.test.ts
│   │   └── tasks.test.ts
│   ├── integration/
│   │   ├── webhook.test.ts
│   │   └── github.test.ts
│   └── fixtures/
│       └── sample-newsletter.pdf
├── .env.example
├── Dockerfile
├── coolify.yaml
├── package.json
├── tsconfig.json
└── README.md                 # Deployment and operation guide
```

### 3.2 Files Modified in ai-eng-system Monorepo

| File | Change |
|---|---|
| `package.json` (root) | Add `apps/headstart-agent` to workspaces if using pnpm/bun workspaces |
| `.github/workflows/ci.yml` | Add build/test step for `apps/headstart-agent` |
| `README.md` (root) | Link to agent README in apps section |

### 3.3 Runtime Directory Layout (in Container)

```
/app              # Application code (read-only layer)
/data             # Persistent volume: SQLite DB, logs
/repos            # Persistent volume: cloned repositories
```

---

## 4. Code Style

### 4.1 Language & Runtime

- **Runtime:** Bun (matches existing ai-eng-system stack)
- **Framework:** Fastify for HTTP server (lighter than Express, built-in JSON schema validation)
- **ORM/DB:** `better-sqlite3` for synchronous SQLite access (simpler than async for single-writer queue)
- **GitHub Client:** `@octokit/rest`
- **Scheduling:** `node-cron`
- **Logging:** `pino` (structured JSON)
- **Validation:** `zod` for env vars and webhook payloads

### 4.2 Naming Conventions

| Element | Pattern | Example |
|---|---|---|
| Files | kebab-case | `monthly-audit.ts` |
| Functions | camelCase | `createPullRequest` |
| Types/Interfaces | PascalCase | `TaskResult` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Branches | `agent/{task}-{slug}` | `agent/newsletter-april-2026` |
| Environment vars | UPPER_SNAKE_CASE | `GITHUB_TOKEN` |

### 4.3 Error Handling

- All async operations wrap in `try/catch` with typed error conversion
- Operational errors (expected failures) use a custom `AgentError` class with `code` field
- Unexpected errors bubble to the global error handler, log at `error` level, return 500
- Never swallow errors silently — every failure must be logged and, where relevant, queued for retry

### 4.4 Import Organization

```typescript
// 1. External dependencies
import { Octokit } from '@octokit/rest';
import { z } from 'zod';

// 2. Internal absolute imports
import { logger } from '@/logger';

// 3. Internal relative imports (within same directory only)
import { TaskResult } from './types';
```

### 4.5 Commit Messages

The agent itself does not need to follow conventional commits for its own repo, but the commits it creates in the Headstart repo should be human-readable:

- Newsletter: `Add April 2026 newsletter`
- Audit: `Monthly audit: update dependencies (2026-05-01)`

---

## 5. Testing Strategy

### 5.1 Framework & Runner

- **Runner:** Bun built-in test runner (`bun:test`)
- **Assertion style:** `expect` from `bun:test`
- **Mocking:** `mock` and `spy` from `bun:test`

### 5.2 Coverage Targets

| Layer | Target | Rationale |
|---|---|---|
| Unit tests | 80%+ | Queue logic, config validation, task business rules |
| Integration tests | 60%+ | Webhook handler, GitHub API interactions (mocked) |
| E2E tests | Minimal | One happy-path smoke test for full pipeline |

### 5.3 Test Categories

#### Unit Tests

| Test File | Coverage |
|---|---|
| `config.test.ts` | Env var parsing, missing required vars throw, defaults applied |
| `queue.test.ts` | Create job, claim job, complete job, fail with retry, max retries exceeded, idempotency key uniqueness |
| `tasks/newsletter.test.ts` | Subject parsing (valid/invalid), PDF path construction, JSON mutation logic, idempotency branch check |
| `tasks/monthly-audit.test.ts` | Dependency parsing from `bun outdated` output, Lighthouse score extraction, content freshness checks |

#### Integration Tests

| Test File | Coverage |
|---|---|
| `webhook.test.ts` | POST valid payload → 202 + job queued; invalid sender → 403; missing attachment → 400; malformed subject → 400 |
| `github.test.ts` | Mock Octokit: branch creation, commit push, PR creation with correct title/body/labels |

#### E2E / Smoke Test

```typescript
// One test: full happy path with mocked GitHub
it('ingests newsletter email and creates PR', async () => {
  // 1. Send webhook with test PDF fixture
  // 2. Poll job status until completed
  // 3. Assert branch name, PR title, and commit message
}, 30000);
```

### 5.4 Test Data

- `tests/fixtures/sample-newsletter.pdf` — Minimal valid PDF for upload testing
- `tests/fixtures/sample-calendar.json` — Snapshot of `calendar/_index.json` for mutation tests

### 5.5 CI Integration

```yaml
# In .github/workflows/ci.yml (root)
- name: Test headstart-agent
  working-directory: apps/headstart-agent
  run: bun test
```

---

## 6. Boundaries

### 6.1 Always Do

1. **Always create a PR** — The agent never pushes directly to `main` or any protected branch.
2. **Always validate the sender** — Reject webhooks from non-whitelisted email addresses before processing.
3. **Always log structured output** — Every job creation, start, completion, and failure must emit a JSON log line with `jobId`, `type`, and `status`.
4. **Always check for idempotency** — Before creating a branch or committing, verify the work hasn't already been done (branch exists, newsletter entry exists).
5. **Always retry failed jobs** — Use exponential backoff (5min, 15min, 45min) up to 3 times before marking permanently failed.
6. **Always clone/pull fresh** — Before any task, ensure the repo at `/repos/headstart` is at the latest `main`.
7. **Always leave the repo clean on failure** — If a task fails mid-run, delete any partially created branch and uncommitted changes.

### 6.2 Ask First

1. **Auto-merge PRs if checks pass?** — Currently the spec requires human review. If you later want auto-merge for low-risk changes (e.g., dependency patch updates), confirm the policy.
2. **Add more client sites?** — The current architecture is single-site. If you want to manage UD, Spring Creek, etc. from the same agent, the config schema and queue need multi-tenant support.
3. **Alert on failure?** — Currently failures are logged and retried silently. Should failed jobs email you, post to Slack, or create a GitHub issue?
4. **Proton Mail Bridge instead of webhook?** — If you later want to avoid Mailgun/Postmark, we can add an IMAP polling adapter. This is out of scope for v1 but architected to plug in.

### 6.3 Never Do

1. **Never push to `main`** — All changes go through PRs. The agent's PAT must not have bypass permissions.
2. **Never store secrets in code** — `GITHUB_TOKEN`, `WEBHOOK_SECRET`, and any future credentials live only in Coolify environment variables.
3. **Never execute arbitrary commands from email content** — The agent only parses the subject line and saves the PDF attachment. Never run shell commands derived from email body text.
4. **Never expose the webhook without signature verification** — Production webhook endpoints must verify the Mailgun/Postmark HMAC signature.
5. **Never process the same email twice** — Use the job queue idempotency key (derived from `sender + subject + attachment-hash`) to deduplicate.
6. **Never leave the SQLite database locked** — Use `better-sqlite3`'s synchronous API or short-lived transactions to avoid WAL growth or lock contention.
7. **Never commit the `.env` file** — `apps/headstart-agent/.env` must be in `.gitignore`.

---

## 7. Open Questions & Assumptions

| # | Question | Assumption for v1 |
|---|---|---|
| 1 | Which email provider for webhooks? | Mailgun (free tier: 5k emails/mo) |
| 2 | GitHub auth: PAT or App? | Fine-grained PAT scoped to `headstart` repo only |
| 3 | Repo location on VPS? | Cloned to `/repos/headstart` at runtime |
| 4 | Bun vs. Node for runtime? | Bun (matches existing monorepo) |
| 5 | Monthly audit auto-runs dependency updates? | Yes — minor/patch updates are committed; major version bumps are flagged in PR body but not auto-updated |

---

## 8. Acceptance Criteria

### AC-1: Newsletter Webhook
**Given** a valid email with PDF attachment from an allowed sender  
**When** the webhook endpoint receives it  
**Then** a job is queued, the PDF is saved, the calendar JSON is updated, a branch is pushed, and a PR is opened within 5 minutes.

### AC-2: Invalid Webhook Rejection
**Given** an email from an unauthorized sender, or with no attachment, or with a malformed subject  
**When** the webhook endpoint receives it  
**Then** the request is rejected with a 4xx status and no job is created.

### AC-3: Monthly Audit Schedule
**Given** the service is running on the 1st of the month at 09:00 UTC  
**When** the cron trigger fires  
**Then** the audit task runs, and if actionable changes exist, a PR is opened; otherwise, the job completes with "no action required".

### AC-4: Idempotent Newsletter Processing
**Given** a newsletter for April 2026 has already been processed  
**When** another email for April 2026 arrives  
**Then** the job is created but immediately skipped with a logged warning; no duplicate branch or PR is created.

### AC-5: Retry on Failure
**Given** a job fails during execution (e.g., GitHub API timeout)  
**When** the failure is caught  
**Then** the job is requeued with `retryCount + 1` and executed after a backoff delay; after 3 failures, it is marked `failed`.

### AC-6: Coolify Deployability
**Given** the `Dockerfile` and environment variables are configured in Coolify  
**When** the service is deployed  
**Then** it starts successfully, responds to `/health`, and processes webhooks and cron jobs as specified.

---

## 9. Related Resources

- Existing skill: `/Users/johnferguson/.agents/skills/headstart-newsletter/SKILL.md`
- Existing skill: `/Users/johnferguson/.agents/skills/ud-monthly-updates/SKILL.md`
- Coolify deployment skill: `.pi/skills/coolify-deploy/SKILL.md`

---

*End of Specification*
