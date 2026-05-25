# Security Review — 2025-05-25

**Reviewer:** Thermo-nuclear security review skill
**Scope:** CLI source (`packages/cli/src/`), build system, installed content

## Finding 1 — CRITICAL: Shell execution with user-controlled input

`packages/cli/src/execution/ralph-loop.ts` runs shell commands via `execSync`:

```typescript
const result = execSync(command, {
    encoding: "utf-8",
    cwd: this.flags.workingDir ?? process.cwd(),
    timeout: 120000,
});
```

The `command` variable comes from quality gate configuration — if a workflow spec or config file contains a malicious command, it executes with the full privileges of the CLI process.

`packages/cli/src/execution/task-executor.ts` uses `spawn` with `shell: true`:

```typescript
const child = spawn(shellTask.command, [], {
    shell: true,
    detached: true,
    cwd: shellTask.workingDirectory ?? this.options.workingDirectory,
});
```

`shellTask.command` comes from task execution plans. If a plan file contains injected commands, they run with shell expansion.

**Remedy:** Validate and sanitize all command inputs before execution. Implement an allowlist of permitted commands for quality gates. Never use `shell: true` with untrusted input — use argument arrays instead.

## Finding 2 — MAJOR: No input validation on workflow/config file loading

`packages/cli/src/config/loadConfig.ts` loads YAML configuration files with no schema validation beyond basic field presence. A malicious `.ai-eng/config.yaml` in a cloned repo could inject arbitrary config values.

`packages/cli/src/execution/plan-parser.ts` (743 lines) parses plan files. The plan parser has 8 `any` type annotations, suggesting the parsed output structure is not fully validated.

**Remedy:** Add strict schema validation (e.g., zod) for all loaded config and plan files. Reject unexpected fields. Validate types at the boundary (file read), not deep in business logic.

## Finding 3 — MAJOR: No integrity verification on installed skills/plugins

`ai-eng install` copies skill files from the toolkit package to local directories. There's no checksum or signature verification. If the npm package is compromised (typosquatting, registry attack), malicious skill content executes as agent prompts.

**Remedy:** Add integrity hashes to the install manifest. Verify on install. Pin exact versions.

## Finding 4 — WARNING: `createHash("sha256")` used correctly but only for run IDs

`ralph-loop.ts` uses `createHash("sha256")` for generating run IDs. This is fine for non-security purposes (deduplication), but it's the only crypto in the codebase. There's no HMAC, no signature verification, no integrity checking anywhere.

## Finding 5 — INFO: No secrets found in source code

No hardcoded API keys, tokens, or passwords in TypeScript source. The `skills/cursor-sdk/SKILL.md` hit was a documentation example, not a real secret.

## Finding 6 — INFO: No SQL injection surface

The codebase doesn't directly interact with SQL databases (it's a CLI tool, not a web server). SQL injection is not applicable.

## Verdict

NOT APPROVED. Shell execution with user-controllable input from config/workflow files (Finding 1) is a code injection vector. The lack of input validation on loaded config files (Finding 2) compounds the risk.
