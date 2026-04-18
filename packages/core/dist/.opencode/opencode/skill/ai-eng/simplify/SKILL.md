---
name: simplify
description: "Review recently changed files for code reuse, quality, and efficiency issues, then fix them. Use when simplifying code, removing complexity, improving readability, or after making changes."
argument-hint: "[focus area]"
version: 1.0.0
---

# Simplify Skill

Review recently changed files for code reuse, quality, and efficiency issues, then fix them.

## Critical Importance

**Simplifying code is critical for long-term maintainability.** Complexity is the enemy of reliability. Every unnecessary abstraction, duplicated logic, or convoluted control flow increases the surface area for bugs and the cognitive load on every developer who reads the code. Simplification isn't about making code "prettier" — it's about making it correct, efficient, and understandable. The best code is the code you don't need to write.

## The Challenge

**The simplify code without losing functionality or introducing regressions, but if you can:**

- Future developers will understand the code in seconds, not minutes
- Bugs will hide in fewer places
- Performance will improve naturally
- Tests will be easier to write and maintain

The challenge is removing complexity without removing capability. Can you find the perfect balance between minimal and complete?

## Workflow

### Step 1: Identify Changes

Find recently changed files:

```bash
git diff --stat HEAD~1          # Files changed in last commit
git diff --stat HEAD~3          # Files changed in last 3 commits
git diff --name-only            # Unstaged changes
git diff --cached --name-only   # Staged changes
```

If no git history is available, review files passed as arguments or ask the user which files to review.

### Step 2: Spawn Three Review Agents (Parallel)

Launch these agents concurrently for comprehensive coverage:

| Agent | Focus | What It Finds |
|-------|-------|---------------|
| **Code Reuse** | Duplication | Repeated logic, extractable functions, missed abstractions, copy-paste patterns |
| **Quality** | Complexity | Unnecessary complexity, dead code, poor naming, missing error handling, deep nesting |
| **Efficiency** | Performance | Redundant allocations, unnecessary iterations, missing caches, O(n²) when O(n) possible |

Each agent should:
1. Read the changed files
2. Analyze against their focus area
3. Return a structured list of findings with file:line references

### Step 3: Aggregate Findings

Deduplicate and prioritize findings:

1. Combine findings from all three agents
2. Remove duplicates (same issue found by multiple agents)
3. Sort by impact: bugs > performance > readability > style
4. Group related changes together

### Step 4: Apply Fixes

For each finding:
1. Make the change
2. Verify the change preserves behavior
3. Run the project's linter/type checker if available
4. Ensure tests still pass

### Step 5: Verify

Detect the project's build system and run the appropriate verification commands. Check `package.json`, `Makefile`, `Cargo.toml`, `pyproject.toml`, `go.mod`, or `pom.xml` to determine the toolchain, then run:

```bash
# For any project: check what's available, then run accordingly
make check          # if Makefile exists
./gradlew check     # if Gradle project
mvn verify          # if Maven project
go test ./...       # if Go project
cargo test          # if Rust project
pytest              # if Python project
ruff check .        # if Python with ruff
npm test            # if Node.js project
```

Do not assume a specific runtime. Discover the toolchain from project files first.

## Focus Areas

Pass a focus argument to narrow scope:

```
/ai-eng-simplify focus on memory efficiency
/ai-eng-simplify focus on readability
/ai-eng-simplify focus on reducing duplication
/ai-eng-simplify focus on performance
/ai-eng-simplify focus on error handling
```

When a focus area is specified, weight findings from the matching agent higher.

## What to Simplify

### Code Reuse Patterns
- **Duplicated logic**: Extract into shared functions
- **Copy-paste blocks**: Parameterize differences, extract commonalities
- **Similar conditionals**: Merge with shared logic
- **Repeated type definitions**: Use generics or shared interfaces

### Quality Patterns
- **Deep nesting**: Extract early returns, use guard clauses
- **Long functions**: Extract focused sub-functions
- **Poor naming**: Rename for clarity (variables, functions, files)
- **Dead code**: Remove unused imports, functions, variables
- **Missing error handling**: Add try/catch, validate inputs

### Efficiency Patterns
- **Redundant iterations**: Combine loops, use map/filter/reduce
- **Unnecessary allocations**: Reuse objects, use primitives
- **Missing caches**: Memoize expensive computations
- **Inefficient data structures**: Use Set/Map instead of array scans
- **N+1 queries**: Batch database calls

## What NOT to Simplify

- **Intentional complexity**: Some problems are inherently complex
- **Performance-critical paths**: Don't simplify at the cost of speed
- **Public APIs**: Don't change interfaces without migration plan
- **Test code**: Clarity over brevity in tests
- **Generated code**: Don't modify generated files

## Confidence Assessment

After completing simplification, rate your confidence from **0.0 to 1.0**:

- **0.8-1.0**: All changes verified, tests pass, linter clean, no behavior changes
- **0.5-0.8**: Most changes verified, some edge cases uncertain
- **0.2-0.5**: Changes applied but verification incomplete
- **0.0-0.2**: Changes applied without verification, regression risk high

## Quality Checklist

Before finalizing:

- [ ] All findings from three agents reviewed
- [ ] Duplicates removed and findings prioritized
- [ ] Each change preserves original behavior
- [ ] Linter and type checker pass
- [ ] Tests pass (or failures are pre-existing)
- [ ] No public API changes without migration
- [ ] Confidence rated honestly

## Integration with ai-eng-system

Works with the spec-driven workflow:

```
# After completing a feature
/ai-eng/work "implement feature X"

# Simplify the result
/ai-eng/simplify

# Or with focus
/ai-eng/simplify focus on performance
```

Can also be combined with `/ai-eng/review` for comprehensive analysis:

```
/ai-eng/simplify
/ai-eng/review    # Deeper review of simplified code
```

## See Also

- `text-cleanup` — For removing AI-generated verbosity (different from code simplification)
- `code-review` — For comprehensive multi-dimensional code review
- `ralph-wiggum` — For iterative fix-until-green loops
