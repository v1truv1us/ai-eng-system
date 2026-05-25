# Thermo-Nuclear Performance Review

**Date:** 2025-05-25
**Scope:** Full codebase — `build.ts`, `packages/cli/src/`, dist output
**Diff range:** main~4..HEAD (4,994 lines across 54 files)
**Reviewer:** Performance review agent (thermo-nuclear rubric)

---

## Executive Summary

This codebase has **two systemic performance problems** that will degrade under load and one structural issue that will block scalability. The build pipeline (`build.ts`) does ~50 sequential file I/O operations per build when the data is static and could be cached. The CLI package (`packages/cli/src/`) uses synchronous filesystem operations throughout the hot path — `install.ts` alone has 16 `mkdirSync`/`readFileSync`/`writeFileSync` calls. The build output is **12.7 MB of JavaScript** with a single 4.2 MB bundle (`App.js`) and 5 Tree-sitter WASM files totaling 3.3 MB, all shipped in an npm package.

The diff under review is mostly additive content (agent markdown files, skill markdown files) and does not introduce new performance regressions beyond extending the build's I/O surface. The pre-existing issues below are carried forward.

---

## 1. Algorithmic Complexity Problems

### 1.1 `copyDirRecursive` is O(files × depth) — called 20+ times per build

**Location:** `build.ts:836-856`

```
copyDirRecursive → readdir → for each entry → copyFile or recurse
```

`copyDirRecursive` walks the source tree depth-first, calling `readdir`, `mkdir`, and `copyFile` for every file. It is called **20+ times** per `buildAll()` invocation (grep found 20 call sites: lines 463, 489, 675, 687, 730, 850, 859, 863, 1021, 1092, 1557, 1607, 1632).

**Complexity:** O(N × D) where N = total files across all calls, D = max directory depth.

**The real problem:** Skills are copied redundantly. `SKILLS_DIR` is copied at least 6 times per build:
- `buildClaude()` → `copyDirRecursive(SKILLS_DIR, ...)` (line 463)
- `buildOpenCode()` → `copySkillsPreservePath(SKILLS_DIR, ...)` (line 562)
- `buildPi()` → `copySkillsPreservePath(SKILLS_DIR, ...)` (line 661)
- `buildCursor()` → `copySkillsPreservePath(SKILLS_DIR, ...)` (line 675)
- `buildGemini()` → `copySkillsPreservePath(SKILLS_DIR, ...)` (line 730)
- `copySkillsToDist()` → `copyDirRecursive(SKILLS_DIR, ...)` (line 859)

With 104 skills, each containing at minimum a `SKILL.md` and potentially supporting files, that's **600+ file copies** of the same data per build. At 1000 skills, this is 6000+ copies.

**Remedy:** Build skills once to a staging directory, then symlink or hardlink to each target. Or: copy once, then use `fs.cp()` (Node 16.7+) which is a single syscall.

### 1.2 `getMarkdownFiles` walks the same directory tree repeatedly

**Location:** `build.ts:145-161`

Called 6+ times for `CONTENT_DIR/commands` and `CONTENT_DIR/agents` across build phases (lines 449, 457, 539, 547, 651, 1829, 1830). Each call does a full recursive directory walk.

**Complexity:** O(N) per call, called 6+ times on unchanged data = O(6N) per build.

**Remedy:** Cache the file lists at the top of `buildAll()` and pass them as arguments. The data does not change during a single build invocation.

### 1.3 `discoverSkills` reads and parses every SKILL.md on every call

**Location:** `build.ts:233-271`

`discoverSkills` reads each `SKILL.md`, parses YAML frontmatter, validates the name — then the caller often reads the same files again. Called 4+ times per build (lines 293, 754, 784, 815).

**Complexity:** O(S × Y) per call where S = number of skills, Y = YAML parse cost. Called 4 times = O(4 × S × Y).

**Remedy:** Discover once, cache the result, pass it to each build phase.

---

## 2. Database / Filesystem Query Anti-Patterns

### 2.1 `package.json` is read and parsed 5 times per build

**Location:** `build.ts:466-468, 690-692, 1576-1578, 1682-1684, 1735-1737`

```typescript
const packageJson = JSON.parse(
    await readFile(join(ROOT, "package.json"), "utf-8"),
);
```

This exact pattern appears 5 times. `package.json` does not change during the build.

**Remedy:** Read and parse `package.json` once at the top of `buildAll()`, pass the parsed object to each function that needs it.

### 2.2 Sequential I/O where parallel is safe — build phases are independent

**Location:** `build.ts:1934-1953`

```typescript
await buildClaude();
await buildOpenCode();
await buildPi();
await buildCursor();
await buildGemini();
await copySkillsToDist();
// ...
await syncToMarketplacePlugins();
await generateMarketplaceJson();
await generateCursorMarketplaceJson();
```

`buildClaude`, `buildPi`, `buildCursor`, and `buildGemini` all write to separate directories under `dist/`. They share no mutable state (each reads the same source files). They could run in parallel.

`syncToMarketplacePlugins`, `generateMarketplaceJson`, and `generateCursorMarketplaceJson` write to separate directories and could also run in parallel with each other (though they depend on the build phases completing).

**Remedy:**
```typescript
await Promise.all([
    buildClaude(),
    buildOpenCode(),  // builds to both dist/.opencode/ and .opencode/
    buildPi(),
    buildCursor(),
    buildGemini(),
]);
await copySkillsToDist();
await Promise.all([
    syncToMarketplacePlugins(),
    generateMarketplaceJson(),
    generateCursorMarketplaceJson(),
]);
```

Estimated speedup: 3-5x on builds with cold filesystem cache.

### 2.3 Sequential file copies inside loops — no batching

**Location:** `build.ts:450-451, 458-459, 542-543, 548-549, 652-653`

```typescript
for (const src of commandFiles) {
    await copyFile(src, join(claudeCommandsDir, basename(src)));
}
```

Each `copyFile` is awaited sequentially. For 110 content files, that's 110 sequential I/O round-trips.

**Remedy:** Batch with `Promise.all`:
```typescript
await Promise.all(commandFiles.map(src =>
    copyFile(src, join(destDir, basename(src)))
));
```

### 2.4 Synchronous FS throughout CLI install/clean flow

**Location:** `packages/cli/src/install/` — 6 files with 37+ sync FS calls

| File | `readFileSync` | `writeFileSync` | `readdirSync` | `mkdirSync` | `copyFileSync` |
|------|---------------|-----------------|---------------|-------------|----------------|
| `install.ts` | 1 | 4 | 2 | 10 | 1 |
| `clean.ts` | 0 | 0 | 1 | 0 | 0 |
| `manifest.ts` | 1 | 1 | 0 | 1 | 0 |
| `sync-skills.ts` | 0 | 0 | 4 | 4 | 0 |
| `validation.ts` | 0 | 0 | 5 | 0 | 0 |
| `flow-store.ts` | 3 | 5 | 0 | 1 | 0 |

`install.ts` is the worst offender: `copyRecursive` (line 47) is synchronous end-to-end — `statSync`, `mkdirSync`, `readdirSync`, `copyFileSync`. For a plugin with 104 skills and supporting files, this blocks the Node event loop for the entire copy operation.

**Impact:** The `ai-eng install` command blocks the Node event loop. If this were used inside a server or long-running process (e.g., an OpenCode plugin), it would freeze the entire process during install.

**Remedy:** Convert to async `fs/promises` equivalents. The `build.ts` already uses async I/O throughout — `packages/cli/src/install/` should follow the same pattern.

### 2.5 `ralph-loop.ts` uses `execSync` in the hot path

**Location:** `packages/cli/src/execution/ralph-loop.ts:12, 734-741, 1239`

```typescript
import { execSync } from "node:child_process";
// ...
const diff = execSync("git diff --stat", { encoding: "utf-8", cwd: process.cwd() });
const status = execSync("git status --short", { encoding: "utf-8", cwd: process.cwd() });
// ...
const result = execSync(command, { encoding: "utf-8", cwd: ..., timeout: 120000 });
```

`getGitStatus()` calls two `execSync` sequentially — that's two shell spawns blocking the event loop. The quality gate runner (line 1239) also uses `execSync` with a 2-minute timeout, meaning the event loop can be blocked for up to 120 seconds.

**Complexity:** O(1) per call, but blocks the event loop for the full duration of the shell command.

**Remedy:** Use `execFile` or `exec` (async) from `node:child_process`. For quality gates, run them in parallel with `Promise.allSettled` and impose timeouts via `AbortSignal`.

---

## 3. Memory Issues

### 3.1 `contextCache` in `retrieval.ts` is an unbounded Map

**Location:** `packages/cli/src/context/retrieval.ts:27-29`

```typescript
private contextCache: Map<string, { context: AssembledContext; expires: number }>;
```

The cache has a TTL of 5 minutes (line 476) but **no size limit**. Entries are only evicted by TTL expiry on read (lazy eviction). If `getCachedContext` is never called again for a key, the entry stays in memory forever.

**Complexity:** O(K) memory where K = unique cache keys generated during the process lifetime. Unbounded.

**Remedy:** Add a `maxSize` limit and evict the oldest entry when exceeded. Or use an LRU cache. Even a simple `if (this.contextCache.size > MAX) this.contextCache.clear()` is better than unbounded growth.

### 3.2 `loadedCache` in `progressive.ts` is an unbounded Map with no eviction

**Location:** `packages/cli/src/context/progressive.ts:24`

```typescript
private loadedCache: Map<string, LoadedSkill> = new Map();
```

`clearCache()` exists but is never called automatically. Skills are loaded and cached forever.

**Remedy:** Same as 3.1 — add a size limit or TTL.

### 3.3 Build copies skills 6+ times — 6x memory for file handles and buffers

**Location:** Discussed in §1.1.

Each `copyDirRecursive` call opens file handles, reads content into buffers, writes to destination. With 104 skills copied 6 times, that's 624 file operations per build, each holding a buffer.

**At 1000 skills:** 6,000 file operations. If skills contain images or large files, this could exhaust file descriptors.

**Remedy:** Copy once, link or reference everywhere.

---

## 4. Network Inefficiency

### 4.1 OpenCode client has proper retry with backoff — ✅ adequate

**Location:** `packages/cli/src/backends/opencode/client.ts:1134-1137`

```typescript
private getBackoffDelay(attempt: number, isRateLimit: boolean): number {
    const base = isRateLimit ? 5000 : 1000;
    const exponential = base * 2 ** (attempt - 1);
    const jitter = Math.random() * 1000;
```

This is correct: exponential backoff with jitter, longer delay for rate limits. No issue here.

### 4.2 No connection pooling or session reuse visible in OpenCode client

**Location:** `packages/cli/src/backends/opencode/client.ts`

The client creates sessions and maintains an `activeSessions` Map, but each prompt creates a new session via HTTP. There's no visible HTTP connection pooling configuration or keep-alive settings.

**Impact:** Low — OpenCode runs locally. Would be a finding if the backend were remote.

---

## 5. Hot Path Violations

### 5.1 `ralph-loop.ts` — `getGitStatus()` runs `execSync` on every cycle

**Location:** `packages/cli/src/execution/ralph-loop.ts:731-742`

If `getGitStatus()` is called per cycle, and cycles can number in the dozens (default `maxCycles = 50`), that's up to 100 blocking `execSync` calls (2 per cycle × 50 cycles).

**Remedy:** Use async `exec`. Cache the result if the git state hasn't changed (check `HEAD` ref or mtime of `.git/index`).

### 5.2 `flow-store.ts` — `writeFileSync` on every cycle, checkpoint, and gate

**Location:** `packages/cli/src/execution/flow-store.ts:141, 159, 187, 192, 203`

Each cycle writes:
- `state.json` (line 141)
- `cycle.json` (line 187)
- `context.md` (line 192)
- `gate.json` (line 203)
- `checkpoint.json` (line 159)

That's 5 synchronous file writes per cycle, plus reads on resume. At 50 cycles, that's 250 blocking writes.

**Remedy:** Use `fs/promises.writeFile`. The data is small (JSON state), so the overhead of async is negligible.

### 5.3 Build script reads YAML frontmatter for every skill on every invocation

**Location:** `build.ts:258` (inside `discoverSkills`)

`YAML.parse` is called for every skill file every time `discoverSkills` is called (4+ times per build). YAML parsing is significantly slower than JSON parsing.

**Remedy:** Cache parsed skills after the first `discoverSkills` call.

---

## 6. Frontend / Bundle Performance

### 6.1 **BLOCKER:** `dist/App.js` is 4.2 MB — single JS file

**Location:** `dist/App.js` (4,280 KB)

This is the TUI component compiled by `Bun.build`. 4.2 MB of JavaScript is shipped to every consumer of the npm package. This is a **presumptive blocker** under the 5 KB rule — the file is 856x over the threshold.

### 6.2 **BLOCKER:** `dist/run.js` is 1.8 MB — CLI entry point

**Location:** `dist/run.js` (1,803 KB)

The CLI entry point is 1.8 MB. This suggests `Bun.build` is inlining all dependencies including heavy ones like `web-tree-sitter`, `@opentui/core`, and Astro-related packages.

### 6.3 `dist/*.js` totals 12.7 MB — all shipped in npm package

**Files over 5 KB threshold:**

| File | Size | Threshold Exceeded |
|------|------|--------------------|
| `App.js` | 4,280 KB | 856× |
| `run.js` | 1,803 KB | 360× |
| `plan-parser.js` | 929 KB | 185× |
| `loadConfig.js` | 873 KB | 174× |
| `init.js` | 858 KB | 171× |
| `run-cli.js` | 855 KB | 171× |
| `orchestrator.js` | 855 KB | 171× |
| `ralph-loop.js` | 616 KB | 123× |

Every file above is hundreds of times over the 5 KB threshold. The transpilation step (`transpileCLI`) uses `Bun.build` with `external: []`, which inlines **all dependencies** into each output file. This means shared dependencies (like `@opencode-ai/sdk`) are duplicated across multiple output files.

### 6.4 Tree-sitter WASM files: 3.3 MB shipped in npm package

**Location:** `dist/` — 5 `.wasm` files

| File | Size |
|------|------|
| `tree-sitter-typescript-*.wasm` | 1,400 KB |
| `tree-sitter-zig-*.wasm` | 676 KB |
| `tree-sitter-markdown_inline-*.wasm` | 420 KB |
| `tree-sitter-markdown-*.wasm` | 412 KB |
| `tree-sitter-javascript-*.wasm` | 404 KB |

These are compiled grammars for Tree-sitter. If they're only needed for code analysis features, they should be lazy-loaded, not shipped in the main package.

### 6.5 `package.json` includes `astro`, `@astrojs/mdx`, `@astrojs/starlight` as dependencies

**Location:** `packages/cli/package.json`

```json
"dependencies": {
    "@astrojs/mdx": "^5.0.3",
    "@astrojs/starlight": "^0.38.3",
    "astro": "^6.1.6",
    "web-tree-sitter": "0.25.10",
    ...
}
```

Astro is a **full static site generator**. `@astrojs/starlight` is a documentation framework. These should not be runtime dependencies of a CLI tool. They should be `devDependencies` or peer dependencies.

**Impact:** Every `npm install @ai-eng-system/cli` downloads the entire Astro framework. Astro alone is ~30 MB of node_modules.

---

## 7. Concurrency Issues

### 7.1 `buildAll()` is entirely sequential — no parallelism

**Location:** `build.ts:1934-1957`

14 sequential `await` calls. Build phases that write to separate directories (`buildClaude`, `buildPi`, `buildCursor`, `buildGemini`) could run in parallel. Marketplace generation could also be parallelized.

**Estimated impact:** On a machine with SSD, parallelizing the 5 build phases could reduce build time from ~5 sequential phases to ~1 (the slowest phase). With filesystem contention, maybe 2-3x speedup.

### 7.2 No concurrency protection in `FlowStore`

**Location:** `packages/cli/src/execution/flow-store.ts`

Multiple `writeFileSync` calls write to different files in the same `.flow/` directory. If two cycles overlap (unlikely given sequential design, but possible with resume), state files could be corrupted. No locking mechanism.

**Impact:** Low — current design is sequential. Would become a finding if the loop were ever parallelized.

---

## 8. Diff-Specific Findings (main~4..HEAD)

The diff adds:
- 4 thermo-nuclear review agent markdown files (content + skills)
- 6 new skill packs (`fix-ci`, `loop-on-ci`, `review-and-ship`, `verify-this`, 4 thermo-nuclear skills)
- 26-line change to `packages/cli/src/cli/run.ts` (new `version` subcommand)
- Review documents in `docs/reviews/`

### 8.1 `run.ts` version command — minor sync FS concern

**Location:** `packages/cli/src/cli/run.ts:545-560`

```typescript
case "version": {
    let version: string | undefined;
    let dir = dirname(process.argv[1]);
    for (let i = 0; i < 5; i++) {
        try {
            const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
```

This walks up 5 directories looking for `package.json`, reading and parsing up to 5 files. For a `version` command, this is acceptable — it runs once and exits. Low severity.

**Minor improvement:** Use `import.meta.resolve` or resolve the path at build time.

### 8.2 New skill packs add 6 more SKILL.md files to copy

The 6 new skill packs increase the skill count from 98 to 104. Each additional skill increases the I/O cost of the redundant copies described in §1.1 by 6x (one copy per build target). This is a linear increase, which is fine for now but confirms the need to fix the underlying pattern.

---

## 9. Findings Summary — By Priority

### 🔴 Presumptive Blockers (must fix before merge)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| **6.1** | `dist/App.js` is 4.2 MB | `dist/App.js` | npm package bloat |
| **6.2** | `dist/run.js` is 1.8 MB | `dist/run.js` | npm package bloat |
| **6.3** | `dist/*.js` totals 12.7 MB, all dependencies inlined | `transpileCLI()` `external: []` | Massive duplication, slow installs |
| **6.5** | Astro is a runtime dependency of CLI | `packages/cli/package.json` | ~30 MB unnecessary install |

### 🟠 High Priority (should fix)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| **2.4** | 37+ synchronous FS calls in install/ | `packages/cli/src/install/*.ts` | Blocks event loop |
| **2.5** | `execSync` in ralph-loop hot path | `packages/cli/src/execution/ralph-loop.ts` | Blocks event loop up to 120s |
| **1.1** | Skills copied 6+ times per build | `build.ts` (20+ call sites) | 600+ file ops per build |
| **3.1** | Unbounded contextCache Map | `packages/cli/src/context/retrieval.ts` | Memory leak |
| **3.2** | Unbounded loadedCache Map | `packages/cli/src/context/progressive.ts` | Memory leak |

### 🟡 Medium Priority (should address soon)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| **2.1** | `package.json` read 5 times per build | `build.ts` (5 locations) | Wasted I/O |
| **2.2** | Build phases run sequentially | `build.ts:1934-1953` | 3-5x slower than needed |
| **2.3** | File copies sequential in loops | `build.ts` (5+ loops) | Slower than `Promise.all` |
| **1.2** | `getMarkdownFiles` called 6+ times | `build.ts` | Redundant directory walks |
| **1.3** | `discoverSkills` called 4+ times | `build.ts` | Redundant YAML parsing |
| **5.2** | `writeFileSync` in flow-store per cycle | `packages/cli/src/execution/flow-store.ts` | Blocks loop iteration |
| **5.3** | YAML parsed per skill per discovery call | `build.ts` | Slow YAML parse × 4 |

### 🟢 Low Priority (nice to have)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| **8.1** | Version command reads up to 5 package.json files | `run.ts:545-560` | Runs once, exits |
| **4.2** | No HTTP connection pooling config | `packages/cli/src/backends/opencode/client.ts` | Local-only, low impact |
| **7.2** | No locking in FlowStore | `flow-store.ts` | Sequential design mitigates |

---

## 10. Verdict

**Do not approve.** This codebase carries significant performance debt that will worsen as the skill count grows. The npm package ships 12.7 MB of JavaScript and 3.3 MB of WASM because `Bun.build` is configured with `external: []` — every dependency is inlined into every output file. Astro is listed as a runtime dependency of a CLI tool. The build script does 6x redundant file copies. The CLI's install path blocks the event loop with synchronous I/O.

The diff under review does not make any of these worse, but it does add 6 more skills to the copy pipeline, confirming the need to address the structural issues.

**Required before approval:**
1. Fix `transpileCLI()` to use `external` for large dependencies. Do not inline Astro, Tree-sitter, or `@opentui/core` into every output file.
2. Move `astro`, `@astrojs/mdx`, `@astrojs/starlight` to `devDependencies`.
3. Cache skill discovery and file lists in `buildAll()`.
4. Convert `packages/cli/src/install/` from sync to async FS.

**Recommended before next release:**
5. Parallelize independent build phases.
6. Add bounds to `contextCache` and `loadedCache`.
7. Convert `execSync` to async `exec` in `ralph-loop.ts`.
8. Convert `flow-store.ts` to async FS.
