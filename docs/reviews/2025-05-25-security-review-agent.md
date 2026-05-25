# Thermo-Nuclear Security Review

**Date:** 2025-05-25
**Scope:** `main~4..HEAD` diff (4994 lines) + full `packages/cli/src/` codebase scan + `build.ts`
**Reviewer:** Security subagent (thermo-nuclear rubric)
**Verdict:** ⚠️ CONDITIONAL APPROVAL — 1 critical, 2 high, 3 medium findings

---

## Summary

The diff primarily adds documentation-only content: Markdown skill definitions, agent frontmatter, OpenCode/Claude/Pi plugin scaffolding, and build-system tooling. The only executable code changes are in `build.ts` (build script) and `packages/cli/src/cli/run.ts` (CLI dispatcher). No web endpoints, no authentication flows, and no user-facing API surfaces were introduced.

However, the **existing** `packages/cli/src/` codebase — which the diff touches via `run.ts` — contains shell execution patterns that are exploitable if an attacker controls the input. The build.ts changes are benign.

---

## Findings

### CRITICAL

#### C-1. `execSync` with config-driven gate commands — injection vector

**File:** `packages/cli/src/execution/ralph-loop.ts`
**Lines:** `runGateCommand()` method

```ts
const result = execSync(command, {
    encoding: "utf-8",
    cwd: this.flags.workingDir ?? process.cwd(),
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
});
```

The `command` argument comes from `gateConfig.command`, which is resolved from the user's `.ai-eng/config.yaml`. This is `execSync` with `shell: true` (default) on a config-sourced string.

**Why this is critical:** If an attacker can write to `.ai-eng/config.yaml` (e.g., via a malicious dependency install script, a compromised dev tool, or a supply-chain attack on a shared config), they get arbitrary code execution. This is a textbook config-driven shell injection.

**Mitigation:**
- Validate gate commands against an allow-list of known-safe commands (e.g., `bun run lint`, `bun test`, `pnpm typecheck`).
- Reject any gate command containing shell metacharacters (`|`, `;`, `&`, `$`, backticks, `$()`, `>`, `<`).
- Alternatively, parse the command into `[binary, ...args]` and use `spawn` with `shell: false`.

**Severity:** Critical — arbitrary code execution via config manipulation.

---

### HIGH

#### H-1. `spawn` with `shell: true` on plan-parser-driven commands

**File:** `packages/cli/src/execution/task-executor.ts`

```ts
const child = spawn(shellTask.command, [], {
    shell: true,
    detached: true,
    cwd: shellTask.workingDirectory ?? this.options.workingDirectory,
});
```

The `shellTask.command` originates from plan YAML files parsed in `plan-parser.ts`:

```ts
command: taskData.command, // Will be undefined for agent tasks
```

The parser only checks `typeof taskData.command !== "string"` — no sanitization of shell metacharacters. If a user opens a malicious `.ai-eng/plan.yml` (e.g., from an untrusted repo clone), the command runs with full shell interpretation.

**Mitigation:**
- Parse the command string into binary + args yourself, or use `spawn(command, args, { shell: false })`.
- Add explicit sanitization for shell metacharacters in plan task commands.
- Document that plan YAML files are a trust boundary.

**Severity:** High — command injection via untrusted plan files.

#### H-2. Stack traces leaked into persistent state files

**File:** `packages/cli/src/context/types.ts`

```ts
errorPayload = {
    message: input.error.message,
    name: input.error.name,
    stack: input.error.stack,
};
```

This writes full stack traces (including file paths, line numbers, and internal module structure) into `.ai-eng/` state files on disk. While this is not a direct network-exposed leak, it means:

1. Any tool or process that reads `.ai-eng/` state can learn internal paths and code structure.
2. If these state files are ever included in a repo (intentionally or accidentally), they leak internal project structure.
3. The debug output path in `ralph-loop.ts` (`redactSecrets`) only applies to console output — stack traces in state files are unredacted.

**Mitigation:**
- Strip stack traces before persisting. Keep only `message` and `name`.
- Or gate stack trace persistence behind an explicit debug flag.

**Severity:** High — information leakage into persistent state.

---

### MEDIUM

#### M-1. `JSON.parse` on file contents without schema validation

**Files:** Multiple files in `packages/cli/src/`

At least 14 instances of `JSON.parse` on file contents across:
- `flow-store.ts` (3 instances)
- `context/vector.ts`
- `context/memory.ts` (2 instances)
- `context/session.ts` (2 instances)
- `context/types.ts`
- `install/install.ts`
- `install/manifest.ts`
- `cli/run.ts`

All parse JSON from disk files and cast with `as SomeType`. No runtime schema validation occurs. A corrupted or tampered state file could cause unexpected runtime behavior.

**Mitigation:**
- Use a runtime validation library (zod, valibot, or typed) to validate parsed JSON against expected schemas at the boundary.
- At minimum, wrap `JSON.parse` in try/catch with a clear error message identifying the corrupted file.

**Severity:** Medium — no injection, but tampered state files could cause undefined behavior.

#### M-2. `redactSecrets` regex-based approach is fragile

**File:** `packages/cli/src/execution/ralph-loop.ts`

The secret redaction uses regex patterns:

```ts
const SECRET_PATTERNS = [
    /api[_-]?key/i,
    /token/i,
    /secret/i,
    /password/i,
    /credential/i,
];
```

Then builds dynamic regex from pattern sources:
```ts
result = result.replace(
    new RegExp(`${pattern.source}["']?\\s*[:=]\\s*["']?([^"'",\\s]+)`),
    "[REDACTED]"
);
```

Problems:
1. The pattern `/token/i` is extremely broad — it would redact legitimate uses of the word "token" in code samples, markdown, etc.
2. Regex-based secret redaction is inherently fragile. It will miss secrets in non-standard formats and over-redact common words.
3. The regex is built from `pattern.source` which could contain regex metacharacters that break the composite pattern.

**Mitigation:**
- Use a purpose-built secret scanning library (e.g., `gitleaks` patterns).
- Narrow the patterns to match specific secret formats (e.g., `ghp_[a-zA-Z0-9]{36}`, `sk-[a-zA-Z0-9]{20,}`).
- Or use a structured logging approach that never serializes raw values in the first place.

**Severity:** Medium — over-redaction causes noise; under-redaction causes leaks.

#### M-3. Build script reads `TEST_ROOT` from environment without validation

**File:** `build.ts`

```ts
const IS_TEST_MODE = !!process.env.TEST_ROOT;
const ROOT = process.env.TEST_ROOT
    ? process.env.TEST_ROOT
    : dirname(fileURLToPath(import.meta.url));
```

`TEST_ROOT` controls the entire build root. If set to an attacker-controlled path, the build script will read from and write to arbitrary directories. This is a build-time concern only (not runtime), but in CI environments where env vars may be injectable, this could lead to build output tampering.

**Mitigation:**
- Validate `TEST_ROOT` resolves to an expected location (e.g., a subdirectory of the project or a known temp dir).
- Or require `TEST_ROOT` to be an absolute path that passes a basic sanity check.

**Severity:** Medium — build-time only, requires CI env var injection.

---

### LOW / INFORMATIONAL

#### L-1. No rate limiting on CLI commands

The CLI has no rate limiting or throttling on any command. While this is a CLI tool (not a network service), the Ralph loop can make repeated external API calls (OpenCode client) without backoff limits beyond the `stuck-threshold` heuristic.

**Severity:** Low — CLI tool, not network-exposed.

#### L-2. No integrity checks on installed assets

`packages/cli/src/install/install.ts` copies files from the npm package to local directories without checksum verification. A tampered npm package would install malicious files without detection.

**Severity:** Low — standard npm trust model applies.

#### L-3. `.env` files properly gitignored

`.env` and `.env.*` are in `.gitignore`. No hardcoded secrets found in source. Good.

#### L-4. SHA-256 usage is appropriate

The only crypto usage is `createHash("sha256")` in `ralph-loop.ts` for output hashing in stuck detection. This is not a security-sensitive context — it's used for change detection, not authentication or integrity. SHA-256 is appropriate here.

#### L-5. Discord webhook URL sourced from environment variable

`DISCORD_WEBHOOK_URL` is read from `process.env`, not hardcoded. The URL is sent to Discord's servers over HTTPS (via `fetch`). No leakage of the webhook URL into logs was observed. Acceptable.

---

## Diff-Specific Assessment

The diff itself (`main~4..HEAD`) introduces:

1. **Markdown-only files:** `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, `.opencode/agent/*.md`, `.opencode/skill/*/SKILL.md` — all documentation/frontmatter. No executable code. No security impact.

2. **`build.ts` changes:** Build script additions for Pi, Cursor, Gemini targets. Uses file I/O (copy, mkdir, writeFile). No network calls, no shell execution, no secrets handling. The `TEST_ROOT` env var concern (M-3) is the only finding.

3. **`packages/cli/src/cli/run.ts` changes:** CLI dispatcher additions for `init`, `clean`, `reinstall` subcommands. Uses `parseArgs` for argument parsing (safe). Dynamic imports for lazy loading. `readFileSync` for `package.json` version resolution (safe — reads known paths only). No injection vectors introduced by the diff.

**The diff does not introduce new exploitable vulnerabilities.** The critical and high findings are pre-existing in `packages/cli/src/execution/` — the diff just adds the dispatcher that routes to code paths that use them.

---

## Approval Decision

**CONDITIONAL APPROVAL.**

The diff is safe to merge. The critical finding (C-1) and high findings (H-1, H-2) are pre-existing issues in the execution engine, not introduced by this diff. They should be tracked for remediation but should not block this merge.

**Required before next release:**
- C-1: Sanitize or allow-list gate commands before passing to `execSync`
- H-1: Sanitize or allow-list plan task commands before passing to `spawn`

**Recommended:**
- H-2: Strip stack traces from persisted state
- M-1: Add runtime validation to `JSON.parse` call sites
- M-2: Replace regex-based secret redaction with structured logging or a dedicated library
