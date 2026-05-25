# Code Quality Review — 2025-05-25

**Reviewer:** Thermo-nuclear code quality review skill
**Scope:** Full codebase source (`packages/cli/src/`, `build.ts`)

## Finding 1 — CRITICAL: 7 files over 1,000 lines (two copies each)

| File | Lines | Copy also at |
|------|-------|-------------|
| `build.ts` | 1,989 | (root only) |
| `src/execution/ralph-loop.ts` | 1,441 | `packages/cli/src/` |
| `tests/learning-automation.test.ts` | 1,224 | — |
| `src/backends/opencode/client.ts` | 1,220 | `packages/cli/src/` |
| `packages/cli/src/research/synthesis.ts` | 1,130 | `src/` |
| `packages/cli/src/research/analysis.ts` | 1,032 | `src/` |

`ralph-loop.ts` at 1,441 lines is a single exported function (`createRalphLoopRunner`) that appears to be ~1,341 lines long. This is not a file — it's a program. It handles cycle execution, stuck detection, git state, quality gates, checkpointing, and output formatting all in one function body.

**Remedy:** Decompose `ralph-loop.ts` into focused modules:
- `cycle-runner.ts` — single cycle execution
- `stuck-detector.ts` — progress tracking and stuck detection
- `checkpoint-store.ts` — checkpoint read/write
- `git-tracker.ts` — git diff/stat state management
- `gate-runner.ts` — quality gate evaluation

## Finding 2 — MAJOR: Swallowed errors in research modules

Five empty catch blocks in research code:

```
packages/cli/src/research/analysis.ts:  } catch (error) {}
packages/cli/src/research/analysis.ts:  } catch (error) {}
packages/cli/src/research/discovery.ts: } catch (error) {}
packages/cli/src/research/discovery.ts: } catch (error) {}
packages/cli/src/research/discovery.ts: } catch (error) {}
```

Silent failure in research means the system can produce incomplete results with no indication that something went wrong.

**Remedy:** At minimum, log the error. Better: classify expected failures (file not found, parse error) and propagate unexpected ones.

## Finding 3 — MAJOR: `any` type used as escape hatch

| File | `as any` casts | `: any` annotations |
|------|---------------|---------------------|
| `plan-generator.ts` | — | 12 |
| `plan-parser.ts` | — | 8 |
| `executor-bridge.ts` | — | 4 |
| `opencode/client.ts` | 12 | 3 |
| `loadConfig.ts` | 5 | — |

`plan-generator.ts` has 12 `any` annotations. This means the plan generation system has no type safety — changes to plan structure won't be caught at compile time.

**Remedy:** Define explicit interfaces for plan structures. Replace `any` with `unknown` + type guards where the shape is genuinely dynamic.

## Finding 4 — WARNING: `main()` in `run.ts` is 522 lines

The CLI dispatcher `main()` function handles argument parsing, subcommand routing, and flag validation in a single function. The `version` command was just added as another case in the switch — a pattern that will continue to bloat this function.

**Remedy:** Extract subcommand handlers into a registry pattern:
```typescript
const commands = { version: runVersion, init: runInit, install: runInstall, ... };
const handler = commands[subcommand] ?? runRalph;
await handler(subcommandArgs);
```

## Verdict

NOT APPROVED. The 1,441-line single-function `ralph-loop.ts` and five swallowed errors in research code are structural quality problems. The `any` usage in plan generation means the type system isn't protecting the most complex part of the codebase.
