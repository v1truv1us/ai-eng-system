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

## Deletion Criteria Applied

A skill is deleted when it meets ALL of these:
1. **< 20 lines** with no meaningful process, version info, or validation
2. **Plain prompting equivalent** — a generic prompt produces the same output
3. **MCP/server superseded** — an MCP server or tool provides the same capability better
4. **Overlapping** — a larger, more specific skill covers the same domain

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
