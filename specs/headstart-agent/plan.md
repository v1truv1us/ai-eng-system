# Implementation Plan: Headstart Autonomous Agent

## Metadata

| Field | Value |
|---|---|
| Feature | Headstart Autonomous Agent |
| Version | 1.0.0 |
| Date | 2026-05-30 |
| Status | Ready for Work |
| Total Tasks | 17 |
| Estimated Total Time | ~8.5 hours |

---

## Phase Overview

| Phase | Name | Tasks | Theme | Est. Time |
|---|---|---|---|---|
| 1 | Foundation | T-001 — T-004 | Project scaffold, config, logger, types | ~1.25 hrs |
| 2 | Core Infrastructure | T-005 — T-007 | Queue, GitHub, repo operations | ~2 hrs |
| 3 | Webhook & Tasks | T-008 — T-010 | Server, newsletter, audit tasks | ~3 hrs |
| 4 | Orchestration | T-011 — T-012 | Alerts, scheduler, job processor | ~1.5 hrs |
| 5 | Deployment | T-013 — T-014 | Docker, Coolify config | ~1 hr |
| 6 | Testing & CI | T-015 — T-017 | E2E test, CI pipeline, final verify | ~1.25 hrs |

---

## Dependency Graph

```
T-001 (Scaffold)
  ├── T-002 (Config)
  │     ├── T-003 (Logger)
  │     ├── T-005 (Queue)
  │     ├── T-006 (GitHub)
  │     └── T-011 (Alerts)
  ├── T-004 (Types)
  │     └── T-005 (Queue)
  │
T-006 (GitHub)
  └── T-007 (Repo)
  │     ├── T-009 (Newsletter)
  │     └── T-010 (Audit)
  │
T-003 (Logger) ──→ T-008 (Server)
T-005 (Queue) ───→ T-008 (Server)
                   T-012 (Scheduler)

T-009 (Newsletter) ──→ T-012 (Scheduler)
T-010 (Audit) ───────→ T-012 (Scheduler)
T-011 (Alerts) ──────→ T-012 (Scheduler)

T-012 (Scheduler) ──→ T-015 (E2E Test)
T-013 (Dockerfile) ──→ T-014 (Coolify)
T-015 (E2E) ─────────→ T-016 (CI)
T-012, T-014, T-016 ──→ T-017 (Final Verify)
```

---

## Phase 1: Foundation

**Goal:** Project scaffold and shared primitives ready.
**Parallel Tasks:** T-001, T-002, T-003, T-004

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-001 | Initialize Project Scaffold | 20 min | Low | None |
| T-002 | Implement Configuration Validation | 25 min | Low | T-001 |
| T-003 | Implement Structured Logger | 15 min | Low | T-002 |
| T-004 | Define Shared Types | 15 min | Low | T-001 |

**Phase Exit Criteria:**
- `bun install` succeeds
- `src/config.ts`, `src/logger.ts`, `src/types.ts` exist and compile
- `bun run typecheck` passes

---

## Phase 2: Core Infrastructure

**Goal:** Database queue, GitHub API, and repo operations working independently.
**Parallel Tasks:** T-005, T-006, T-007

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-005 | Implement SQLite Job Queue | 45 min | Medium | T-002, T-004 |
| T-006 | Implement GitHub API Wrapper | 40 min | Medium | T-002 |
| T-007 | Implement Repo Clone/Pull Helpers | 35 min | Medium | T-002, T-006 |

**Phase Exit Criteria:**
- `queue.test.ts` passes: create, claim, complete, fail, retry, idempotency
- `github.test.ts` passes: mock branch creation, PR creation
- `repo.test.ts` passes: mock clone, pull, commit, push

---

## Phase 3: Webhook & Tasks

**Goal:** Server receives webhooks and tasks execute end-to-end.
**Parallel Tasks:** T-008, T-009, T-010

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-008 | Implement Webhook Server | 50 min | Medium | T-003, T-005 |
| T-009 | Implement Newsletter Task | 60 min | High | T-005, T-006, T-007 |
| T-010 | Implement Monthly Audit Task | 75 min | High | T-005, T-006, T-007 |

**Phase Exit Criteria:**
- `POST /webhook/email` returns 202 for valid payload, correct 4xx for invalid
- Newsletter task creates correct branch, commit, and PR in mocked tests
- Audit task parses `bun outdated` and Lighthouse output correctly in mocked tests

---

## Phase 4: Orchestration

**Goal:** Scheduler, job processor, and alerting wired together.
**Sequential Tasks:** T-011 → T-012

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-011 | Implement Alerting (Sentry + Email) | 40 min | Medium | T-002, T-003 |
| T-012 | Implement Scheduler and Job Processor | 45 min | Medium | T-005, T-009, T-010, T-011 |

**Phase Exit Criteria:**
- `bun run dev` starts server and scheduler without errors
- Job processor loop claims and executes jobs from queue
- Permanent failures trigger email + Sentry in mocked tests
- SIGTERM triggers graceful shutdown

---

## Phase 5: Deployment

**Goal:** Containerized and ready for Coolify.
**Sequential Tasks:** T-013 → T-014

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-013 | Create Dockerfile and Local Dev Stack | 30 min | Low | T-001, T-012 |
| T-014 | Create Coolify Deployment Configuration | 25 min | Low | T-013 |

**Phase Exit Criteria:**
- `docker build -t headstart-agent .` succeeds
- `docker run -p 3000:3000 headstart-agent` responds to `/health`
- `coolify.yaml` is complete with all env vars documented

---

## Phase 6: Testing & CI

**Goal:** Full test coverage, CI green, final verification.
**Sequential Tasks:** T-015 → T-016 → T-017

| ID | Task | Time | Complexity | Depends On |
|---|---|---|---|---|
| T-015 | Write End-to-End Smoke Test | 35 min | Medium | T-008, T-009, T-012 |
| T-016 | Set Up CI/CD Pipeline | 20 min | Low | T-015 |
| T-017 | Final Integration and Verification | 30 min | Medium | T-012, T-014, T-016 |

**Phase Exit Criteria:**
- `bun test` passes with all unit, integration, and E2E tests green
- `bun run typecheck` passes with zero errors
- All 7 acceptance criteria (AC-1 through AC-7) traceable to tasks
- README.md is complete and accurate

---

## Acceptance Criteria Coverage Matrix

| AC | Description | Covered By |
|---|---|---|
| AC-1 | Newsletter webhook → PR within 5 min | T-008, T-009, T-015 |
| AC-2 | Invalid webhook rejected with 4xx | T-008, T-015 |
| AC-3 | Monthly audit runs on schedule | T-010, T-012 |
| AC-4 | Idempotent newsletter processing | T-009, T-005 |
| AC-5 | Retry on failure (3× backoff) | T-005, T-012 |
| AC-6 | Coolify deployability | T-013, T-014, T-017 |
| AC-7 | Failure alerting (email + Sentry) | T-011, T-012, T-015 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mailgun webhook signature verification is tricky | Medium | Medium | T-008 includes explicit signature validation; test with real Mailgun payload early |
| Lighthouse CLI not available in Docker image | Low | High | T-010 uses `lighthouse` npm package programmatically; verify in T-013 Docker build |
| GitHub PAT expires or lacks permissions | Low | High | Document in README; T-006 has clear error messages for 403/404 |
| SQLite locking under concurrent access | Low | Medium | T-005 uses `better-sqlite3` sync API; single-writer design prevents contention |
| Monthly audit task takes too long | Medium | Medium | T-010 runs asynchronously in job processor; timeout and failure handling in T-012 |

---

## Parallel Work Opportunities

Within each phase, tasks can be worked on in parallel by different agents:

- **Phase 1:** T-001 (scaffold) can be done first, then T-002, T-003, T-004 in parallel
- **Phase 2:** T-005, T-006, T-007 are independent and can run in parallel
- **Phase 3:** T-008, T-009, T-010 are mostly independent (T-009 and T-010 both need T-007)

**Recommended single-agent order:** T-001 → T-002 → T-004 → T-003 → T-005 → T-006 → T-007 → T-008 → T-009 → T-010 → T-011 → T-012 → T-013 → T-014 → T-015 → T-016 → T-017

---

*End of Implementation Plan*
