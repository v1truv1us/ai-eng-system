# Thermo-Nuclear Code Quality Review — 2025-05-25

**Reviewer:** Thermo-nuclear code quality review (subagent)
**Scope:** `main~4..HEAD` diff (54 file changes, ~4994 lines)
**Date:** 2025-05-25

---

## Summary

This branch adds three things:

1. **Thermo-nuclear review skill pack** — four new review skills (code-quality, architecture, performance, security) plus `fix-ci`, `loop-on-ci`, `review-and-ship`, and `verify-this`.
2. **Agent definitions** for each review skill across Claude, OpenCode, and plugin directories.
3. **`version` subcommand** in `packages/cli/src/cli/run.ts` and minor build config updates in `build.ts`.

The actual **logic** changes are small: a 22-line `version` handler in `run.ts` and 14 lines of plugin/skill registration in `build.ts`. The vast majority of this diff is **content**: markdown skill rubrics and agent definitions, each duplicated verbatim across 5–7 directory trees.

---

## Findings

### 1. STRUCTURAL: Massive content duplication — every skill is copy-pasted into 4+ directories

**Severity: Blocker**

Each of the 7 new skills (4 thermo-nuclear + fix-ci + loop-on-ci + review-and-ship) plus `verify-this` is an **identical file** copied into at least 4 source trees:

| Canonical source | Copy targets |
|---|---|
| `skills/<name>/SKILL.md` | `.claude/skills/`, `.opencode/skill/`, `plugins/ai-eng-quality/skills/` (or `ai-eng-devops/`) |

Each agent definition is likewise duplicated:

| Canonical source | Copy targets |
|---|---|
| `content/agents/<name>.md` | `.claude/agents/`, `.opencode/agent/ai-eng/quality-testing/`, `plugins/ai-eng-quality/agents/` |

I verified with `diff` that **every copy is byte-identical**. There are **75+ identical copies** of 8 skill markdown files in this diff alone. The build system then generates additional copies under `dist/` and `packages/toolkit/`.

This is the single biggest structural problem in this diff. It is exactly the kind of "copy-pasted logic instead of extracted helpers" the rubric flags. If someone fixes a typo in one copy, the other 3–6 copies silently diverge. The build system (`build.ts`) should be the **only** thing that fans content out to platform directories. The source-of-truth copies under `skills/` and `content/agents/` should be the only files tracked in git; the `.claude/`, `.opencode/`, and `plugins/` copies should be build outputs that `.gitignore` excludes.

**Remedy:** Delete all the `.claude/skills/`, `.claude/agents/`, `.opencode/skill/`, `.opencode/agent/`, and `plugins/*/skills/`, `plugins/*/agents/` copies from source control. Make them generated-only. The build script already does this — there is no reason to track them. This would remove ~40 files from the diff while preserving identical behavior.

---

### 2. STRUCTURAL: `build.ts` is already 1989 lines and this diff adds more entries to `PLUGIN_MAP`

**Severity: Concern**

`build.ts` is nearly 2000 lines. This diff doesn't cross the 1k threshold (it was already past it), but it adds entries to `PLUGIN_MAP` which is a god-object that drives all platform fanout. Every new skill requires touching this map.

The right question: should `PLUGIN_MAP` exist at all, or should skills self-register? A convention like "every directory under `skills/` is a skill; every directory under `plugins/` is a plugin with a manifest" would eliminate the need for a centralized map entirely.

This is a pre-existing concern, but worth flagging: `build.ts` at 2000 lines is a coupling hotspot. The next time it grows, decompose it.

---

### 3. CODE QUALITY: `version` handler uses filesystem walk with swallowed errors

**Severity: Concern**

In `packages/cli/src/cli/run.ts` (lines 541–560), the `version` subcommand:

```typescript
let dir = dirname(process.argv[1]);
for (let i = 0; i < 5; i++) {
    try {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        if (pkg.name === "@ai-eng-system/cli" && pkg.version) {
            version = pkg.version;
            break;
        }
    } catch { /* not found, walk up */ }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
}
```

Problems:

1. **Swallowed catch** — `catch { /* not found, walk up */ }`. This will silently swallow `EACCES`, `EMFILE`, and JSON parse errors from corrupt files. The comment says "not found" but the catch is broader than that. At minimum, catch only `ENOENT`.

2. **Magic number `5`** — why 5 levels? If the CLI is installed globally via npm/bun, the depth from `node_modules/.bin/ai-eng` to the package root is predictable (3 levels). If it's installed differently, 5 may not be enough. This is a "works by accident" heuristic.

3. **`process.argv[1]` assumption** — this assumes `process.argv[1]` points to the JS file inside the package. In some bundling/execution contexts, it may not. A more reliable approach: import the package.json directly (or use `import.meta.url` in ESM) to resolve the version at build time or via a direct import.

4. **Synchronous I/O** — `readFileSync` in a CLI startup path. This is acceptable for a CLI tool (it's not a server), but it's worth noting. If Bun or the build system can embed the version at build time (via string replacement in the bundle), the filesystem walk disappears entirely.

**Remedy:** Replace the filesystem walk with a build-time version injection. The build system already knows the version. Inject it as a constant:

```typescript
// build.ts replaces __VERSION__ during bundling
const VERSION = "__VERSION__";
console.log(`ai-eng v${VERSION}`);
```

This would delete the entire 22-line handler and replace it with 2 lines. That's the code-judo move here.

---

### 4. BOUNDARY: Version flag routing duplicates subcommand and flag handling

**Severity: Minor**

The switch statement handles `version`, `-V`, and `--version` as a single case:

```typescript
case "version":
case "-V":
case "--version": {
```

But `-V` and `--version` are also listed as global flags in the help text. If someone runs `ai-eng ralph -V`, it will be passed to the ralph parser which doesn't know about `-V` — it will silently be ignored or error. The flag handling for `-V`/`--version` should happen at the top level (before the subcommand switch), similar to how `--help`/`-h` is handled immediately.

This is a minor inconsistency, not a blocker.

---

### 5. MODULARITY: Four thermo-nuclear agent definitions are near-identical boilerplate

**Severity: Concern**

The four agent files under `content/agents/` (and their copies) are structurally identical:

```
---
name: thermo-nuclear-{variant}-review
description: Thermo-nuclear {variant} audit (...)
mode: subagent
temperature: 0.1
tools: { read: true, grep: true, glob: true, list: true, bash: true, edit: false, write: false, patch: false }
---
# Thermo-Nuclear {Variant} Review
You are a Task subagent...
## Rubric
1. Load the `thermo-nuclear-{variant}-review` skill...
## Work
- Apply the rubric only to what the diff and contents show...
## Parent orchestration
Typical flow: gather git diff...
```

The only differences are: the `{variant}` string in names/descriptions, and the skill name to load. This is a textbook case for a **parameterized template**. All four agent definitions could be generated from a single template + a config like:

```yaml
variants:
  - name: code-quality
    description: maintainability, structure, 1k-line rule, spaghetti, code-judo
  - name: architecture
    description: coupling, boundary violations, dependency direction, layering, structural decay
  - name: performance
    description: algorithmic complexity, memory, N+1 queries, network patterns, bundle size, scalability
  - name: security
    description: injection, auth bypass, secrets exposure, boundary validation, OWASP
```

This would turn 4 boilerplate files into 1 template + 4 entries in a config. The build system already has the infrastructure to generate files; this is a natural extension.

---

### 6. PRE-EXISTING: Swallowed errors in `packages/cli/src/research/`

**Severity: Concern (pre-existing)**

Not introduced by this diff, but noted during the scan:

```
packages/cli/src/research/analysis.ts:  } catch (error) {}  (×2)
packages/cli/src/research/discovery.ts:  } catch (error) {}  (×3)
```

These silently swallow all errors. If the research module fails, there is no logging, no error propagation, no way to diagnose the failure from the outside. This is exactly the pattern the architecture rubric flags: "catch block that swallows errors silently."

---

### 7. PRE-EXISTING: `any` type usage across `packages/cli/src/`

**Severity: Concern (pre-existing)**

18 files use `: any` type annotations. The worst offenders:

| File | Count |
|------|-------|
| `agents/plan-generator.ts` | 12 |
| `execution/plan-parser.ts` | 8 |
| `backends/opencode/client.ts` | 3 |
| `agents/executor-bridge.ts` | 4 |

Not introduced by this diff, but the thermo-nuclear skills and agents being added would flag these same patterns in any codebase they review. The system should eat its own dog food.

---

## Verdict: **Changes Requested**

This diff does not meet the approval bar. The primary blocker is the **massive content duplication** (Finding #1). The skill and agent markdown files are byte-identical across 4+ source trees. This should be build-output, not tracked source.

The `version` handler (Finding #3) is a missed code-judo opportunity: build-time injection would delete the filesystem walk entirely and make the handler trivially correct.

### Required before approval:

1. **Delete the duplicate source copies.** Keep only `skills/` and `content/agents/` as source of truth. Make `.claude/`, `.opencode/`, and `plugins/` copies generated-only (add to `.gitignore` if not already).
2. **Replace the filesystem-walk version handler** with build-time version injection, or at minimum tighten the catch to `ENOENT` only.
3. **Add `-V`/`--version` handling before the subcommand switch** to match how `--help` works.

### Recommended but not blocking:

4. **Parameterize the four thermo-nuclear agent definitions** into a single template.
5. **Begin decomposing `build.ts`** — it's nearly 2000 lines and growing.
