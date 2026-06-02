## Goal

**Objective:** Reduce the GitHub Actions CI build time from 12 minutes to under 5 minutes without changing the primary build tool.

**Success Criteria:**
- [ ] CI build completes in <5 minutes on a clean run
- [ ] No regressions in test coverage or build artifacts
- [ ] Changes are documented in BUILD.md

**Verification Evidence:**
- GitHub Actions workflow run logs showing <5 minute completion
- Full test suite passes (no skips, no new failures)
- Build artifact sizes and contents match or improve baseline

**Scope:**
- **In scope:** CI workflow optimization, caching strategy, parallel job tuning
- **Out of scope:** Changing from Vite to another build tool, removing tests, modifying source code behavior

**Constraints:**
- Preserve existing behavior unless the task explicitly changes it.
- Do not leave TODO placeholders or undocumented changes.

**Boundaries:**
- May modify: `.github/workflows/`, `package.json` scripts, build config files
- Must NOT modify: source code, test logic, API contracts

**Iteration Policy:**
- After each change, run the CI workflow and record the time.
- If a change doesn't help, revert it before trying the next.
- If validation fails (tests break, artifacts change), fix the cause before proceeding.

**Completion Audit:**
- Map each success criterion to fresh evidence from CI logs, test output, and artifact comparison.
- The goal is not complete if any criterion is unverified or only "probably" satisfied.

**Blocked Stop Condition:**
- If the build tool has a hard floor >5 minutes due to inherent limitations, stop and report the blocker with evidence.
