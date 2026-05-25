# Performance Review — 2025-05-25

**Reviewer:** Thermo-nuclear performance review skill
**Scope:** CLI source (`packages/cli/src/`), build system, package size

## Finding 1 — CRITICAL: Astro, Starlight, and MDX are production dependencies of the CLI package

`packages/cli/package.json` lists these as production dependencies:

```json
"@astrojs/mdx": "^5.0.3",
"@astrojs/starlight": "^0.38.3",
"astro": "^6.1.6",
```

Astro is a static site generator. Starlight is a documentation framework. MDX is markdown-with-JSX. The CLI package (`@ai-eng-system/cli`) is a command-line tool. These dependencies add megabytes to the install for functionality that belongs in the docs-site package, if anywhere.

**Impact:** Every `npm install -g @ai-eng-system/cli` pulls down the Astro ecosystem unnecessarily. Slow installs, large disk footprint, unnecessary transitive dependencies.

**Remedy:** Move Astro/Starlight/MDX to `devDependencies` or to the `docs-site/` package. The CLI should not depend on a static site generator.

## Finding 2 — MAJOR: `web-tree-sitter` as a production dependency

```
"web-tree-sitter": "0.25.10"
```

Tree-sitter is a parser generator used for code analysis. It requires native WASM binaries. This is a heavy dependency for a CLI tool that may or may not need syntax-aware parsing at runtime.

**Remedy:** If tree-sitter is only used for research/analysis features, make it an optional peer dependency. Don't force every CLI install to download WASM binaries.

## Finding 3 — MAJOR: Synchronous filesystem operations throughout the CLI

| File | Sync FS calls |
|------|--------------|
| `install/validation.ts` | 17 |
| `install/install.ts` | 14 |
| `index.ts` | 14 |
| `execution/flow-store.ts` | 14 |
| `install/sync-skills.ts` | 11 |

42+ synchronous filesystem calls in `install/` alone. During `ai-eng install`, these block the event loop for every file copy, read, and stat operation. For large skill sets (76 skills), this adds up.

**Remedy:** Use async `fs/promises` equivalents. Batch file operations. The install path should be fully async.

## Finding 4 — MAJOR: Build produces 58MB of OpenCode output

```
.opencode/    → 234 files, 58MB
```

The OpenCode build output is 58MB on disk. This suggests the build is either including unnecessary files (source maps, declarations, assets) or the OpenCode format requires substantial duplication.

**Remedy:** Audit what's actually needed at runtime. Strip source maps and declarations from the OpenCode output. Only include what OpenCode actually loads.

## Finding 5 — WARNING: `ralph-loop.ts` reads full file contents for stuck detection

```typescript
const diff = execSync("git diff --stat", ...);
const status = execSync("git status --short", ...);
```

These run on every cycle of the ralph loop. For large repos with many changes, `git diff --stat` can be slow. Combined with `execSync` (blocking), this pauses the entire loop.

**Remedy:** Use `git diff --stat` with `--cached` or limit depth. Consider caching the result and only re-running when the git HEAD changes.

## Finding 6 — WARNING: `build.ts` does full recursive copies on every build

The build script copies entire directory trees (`copyDirRecursive`) for every platform output. For a codebase with 76+ skills, this means copying 300+ files 6 times on every build.

**Remedy:** Use incremental builds. Check modification times. Only copy changed files.

## Verdict

NOT APPROVED. Astro/Starlight as production CLI dependencies (Finding 1) is the most impactful performance problem — it bloats every install. The synchronous filesystem operations (Finding 3) make the install path unnecessarily slow.
