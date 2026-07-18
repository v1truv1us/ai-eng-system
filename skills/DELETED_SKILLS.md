# Deleted Skills Archive

This document records skills that were deleted from the ai-eng-system, with rationale and migration paths.

## Batch 1 — 2026-05-31 (Thin 8-line stubs)

### agent-analyzer
- **Why deleted:** 8-line stub. Plain prompting ("analyze this agent's behavior") produces equivalent output. No version-specific guidance, no validation steps, no unique process.
- **Migration:** Use `comprehensive-research` skill with agent behavior as the research topic, or plain prompt with specific questions about routing quality, missing context, and prompt clarity.

### api-test
- **Why deleted:** 8-line stub. Plain prompting ("test these API endpoints") produces equivalent output. No specific testing framework guidance (no Postman, REST Assured, pytest, supertest), no version info, no validation.
- **Migration:** Use `test-driven-development` or `source-driven-development` with the specific API testing framework. For HTTP API contract testing, use `browser-testing-with-devtools` (network tab) or plain prompts with `curl`/`httpie` commands.

### chrome-debug
- **Why deleted:** 8-line stub superseded by `browser-testing-with-devtools` skill (170+ lines with DevTools Protocol specifics) and chrome-devtools-mcp MCP server. This stub added no unique value.
- **Migration:** Use `browser-testing-with-devtools` skill, or the chrome-devtools-mcp MCP server for live DOM/network/performance inspection.

### cloudflare
- **Why deleted:** 8-line stub. Cloudflare MCP server in `mcp-configs/mcp-servers.json` provides direct API access. A stub skill with no version info, no wrangler CLI guidance, no Workers/ Pages-specific patterns is inferior to plain prompting + MCP.
- **Migration:** Use the Cloudflare MCP server for direct API operations. For Workers deployment patterns, use `ci-cd-and-automation` with Cloudflare-specific context.

### db-optimize
- **Why deleted:** 8-line stub. Plain prompting ("optimize this query") produces equivalent output. No specific database guidance (no PostgreSQL, MySQL, MongoDB version info), no EXPLAIN plan interpretation, no index analysis workflow.
- **Migration:** Use `performance-optimization` with database-specific context, or `source-driven-development` to verify against current database docs. For query analysis, use the database's native EXPLAIN tools.

### ios-sim
- **Why deleted:** 8-line stub. `ios-simulator-tooling` MCP server provides direct Xcode/simulator control. This stub had no version-specific iOS guidance, no Simulator app specifics, no device selection logic.
- **Migration:** Use `ios-simulator-tooling` MCP server, or `control-cli` for Xcode CLI workflows (`xcodebuild`, `simctl`).

### security-scan
- **Why deleted:** 8-line stub overlapping with `security-and-hardening` (139 lines with OWASP specifics, three-tier boundary system, auth patterns). No unique value.
- **Migration:** Use `security-and-hardening` skill for comprehensive security review. For dependency scanning, use `npm audit`, `snyk`, or Socket Security MCP.

### socket-security
- **Why deleted:** 8-line stub. Socket Security MCP server provides direct supply chain security scanning. A stub skill with no Socket-specific guidance is inferior to the MCP.
- **Migration:** Use Socket Security MCP server, or `security-and-hardening` for general supply chain security practices.

### verbalize
- **Why deleted:** 8-line stub. "Verbalized Sampling" is a real research technique but this stub provided no implementation guidance, no when-to-use criteria, no examples of verbalized comparisons.
- **Migration:** Use `incentive-prompting` for research-backed prompting techniques, or plain prompt with "surface 3 candidate approaches, compare tradeoffs, then recommend the best."

---

## Batch 2 — 2026-07-17 (Skills audit: public-knowledge restatements, duplicates, and redundancy)

Audited the library against the "skills should earn their place" framework (a skill earns its place only by providing private context, custom tool access, or a specific custom workflow; public-knowledge restatements fight the model's training and inflate routing cost). 40 skills retired across three sub-batches. See `reports/skills-audit-2026-07.md` for the full classification and evidence.

### 2a — Stubs & public-knowledge domain restatements (20)

Each restated public knowledge a frontier model already applies, or duplicated a larger skill. No command or agent hard-loaded any of these (verified via `validateCommandSkillReferences` + reference sweep).

- `check-compiler-errors`, `fix-merge-conflicts`, `get-pr-comments`, `new-branch-and-pr`, `run-smoke-tests`, `review-and-ship`, `what-did-i-get-done` — thin "do the obvious thing" stubs; plain prompting is equivalent. Migration: invoke the underlying tool (`bun run`, `gh pr`, `git`) directly, or use `verification-loop`.
- `git-workflow-and-versioning`, `deprecation-and-migration`, `documentation-and-adrs`, `frontend-ui-engineering`, `api-and-interface-design`, `performance-optimization`, `context-budget`, `context-engineering`, `idea-refine` — public best-practice (trunk-based commits, ADRs, WCAG, Hyrum's Law, Core Web Vitals, context tiers, divergent/convergent thinking). Migration: plain prompting with the specific constraint; `source-driven-development` for version-pinned guidance.
- `graphify`, `dependency-graph-analysis` — public CS/graph-DB primers (BFS, Dijkstra, PageRank, import graphs). Migration: plain prompting; `graph-rag` for retrieval-specific patterns.
- `content-optimization` — subset of `text-cleanup` / `unslop`. Migration: `unslop` (prose), `text-cleanup` (generic).
- `verify-this` — duplicate of `verification-loop` (same VERIFIED/NOT-VERIFIED schema). Migration: `verification-loop`.

### 2b — Duplicate principle skills (18)

Every principle skill restated a well-known engineering axiom (YAGNI, root-cause debugging, type discipline, boundary validation, etc.). `docs/attribution/cursor-plugins.md` already listed them as "Skipped (duplicate)". The `poteto-mode` aggregator was updated to inline the one-line guidance, so the leaf skills are no longer needed.

- Root (5): `principle-fix-root-causes`, `principle-laziness-protocol`, `principle-never-block-on-the-human`, `principle-prove-it-works`, `principle-type-system-discipline`
- `pstack/` (13): `principle-boundary-discipline`, `principle-encode-lessons-in-structure`, `principle-exhaust-the-design-space`, `principle-experience-first`, `principle-foundational-thinking`, `principle-guard-the-context-window`, `principle-make-operations-idempotent`, `principle-migrate-callers-then-delete-legacy-apis`, `principle-minimize-reader-load`, `principle-outcome-oriented-execution`, `principle-redesign-from-first-principles`, `principle-separate-before-serializing-shared-state`, `principle-subtract-before-you-add`
- Migration: the guidance is inlined in `skills/pstack/poteto-mode/SKILL.md`; otherwise plain prompting applies these by default.

### 2c — Prompt cluster collapse (2)

- `prompt-engineering` — duplicate of `prompt-refinement` (same Task/Context/Constraints/Output/Verify contract). Migration: `prompt-refinement` (the only one wired into `/ai-eng/{research,specify,plan,work,review}`).
- `incentive-prompting` — its v2 explicitly forbade the persona/stakes/challenge techniques that `AGENTS.md` still advertised as "+45-115% quality" (a live self-contradiction); the advertised apparatus was retired. Migration: `prompt-refinement`. `AGENTS.md` and `skills/AGENTS.md` marketing was corrected to match the surviving skill's real contract.

### Deferred (wired — not deleted)

These public-knowledge skills are hard-loaded as the procedure of a command or agent, so they qualify as a "specific custom workflow" and were kept pending a deliberate repoint: `code-simplification` (`/simplify`), `incremental-implementation` (`/work`), `spec-driven-development` (`/spec`), `thermo-nuclear-*` (`/deep-review` + reviewer agents), `security-and-hardening` (`security-scanner`), `knowledge-capture` (`teach`). `research-deep` stays (deployed research-runner service).

---

## Batch 3 — 2026-07-17 (Review-skill consolidation + demotion)

Resolved the deferred set from Batch 2.

### Retired (2) — genuine duplicates

- `thermo-nuclear-code-quality-review` — deep-mode content duplicated `code-review-and-quality` strict maintainability mode. Migration: `code-review-and-quality` (used by `code-reviewer` standard + deep mode, and `/deep-review`).
- `thermo-nuclear-security-review` — duplicated `security-and-hardening`. Migration: `security-and-hardening` (used by `security-scanner` and `/deep-review`).

Repointed `content/commands/deep-review.md`, `content/agents/code-reviewer.md`, `content/agents/security-scanner.md`. `thermo-nuclear-architecture-review` and `thermo-nuclear-performance-review` were kept (no surviving domain counterpart for those axes).

### Demoted model-invoked → user-invoked (18)

These are command-loaded (so they keep working via explicit `Load skills/.../SKILL.md`), but restate public knowledge the model already applies. Demoting removes their startup routing cost without changing any command behavior: `ai-eng/simplify`, `browser-testing-with-devtools`, `ci-cd-and-automation`, `code-review-and-quality`, `code-simplification`, `debugging-and-error-recovery`, `fix-ci`, `git-worktree`, `incremental-implementation`, `knowledge-capture`, `pstack/typescript-best-practices`, `security-and-hardening`, `shipping-and-launch`, `spec-driven-development`, `test-driven-development`, `thermo-nuclear-architecture-review`, `thermo-nuclear-performance-review`, `verification-loop`.

Result: auto-loading (model-invoked) skills dropped from 69 (original) → 11. The survivors are repo-specific workflows (`prompt-refinement`, `using-agent-skills`, `control-cli`, `control-ui`, `cross-repo-refactor`, `planning-and-task-breakdown`, `make-pr-easy-to-review`, `cli-for-agents`, `continuous-learning`, `source-driven-development`, `unslop`).

---

## What Was Preserved

Skills that were 8 lines but NOT deleted because they map to real, valuable domains that deserve enhancement:
- `docker` → Enhanced with current versions, doc links, multi-stage builds, security scanning
- `k8s` → Enhanced with current K8s version, kubectl cheatsheet, Helm patterns, validation
- `monitoring` → Enhanced with Prometheus/Grafana specifics, alertmanager patterns, SLOs
- `github` → Enhanced with gh CLI workflows, Actions patterns, PR best practices
- `sentry` → Enhanced with Sentry SDK setup, performance monitoring, release tracking
- `slack` → Enhanced with Slack API patterns, webhook security, block kit
- `playwright` → Enhanced with current version, codegen, trace viewer, CI patterns
- `xcodebuild` → Enhanced with current Xcode version, scheme/workspace patterns, CI
