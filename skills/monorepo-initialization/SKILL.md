---
name: monorepo-initialization
description: Recursively initialize AGENTS.md in monorepo subdirectories with smart detection. Creates hierarchical agent context files with proper linking to root CLAUDE.md and parent AGENTS.md. Use for setting up multi-package projects, microservices, or any project with important subdirectories that need AI agent guidance.
version: 1.0.0
tags: [monorepo, agents, context-engineering, setup, hierarchy]
---

# Monorepo Initialization Skill

## Purpose

Systematically initialize AGENTS.md files throughout a monorepo, creating a hierarchical context system where:
- Root AGENTS.md coordinates all agents
- Each package/service has its own AGENTS.md with hierarchy metadata
- All files link back to root CLAUDE.md (philosophy) 
- AI agents can navigate context efficiently across packages

This enables large projects to maintain clear, navigable agent guidance without overwhelming token budgets.

## When to Use

- **New monorepo setup** - Initialize entire project structure
- **Adding new packages** - Run on new subdirectory
- **Improving agent context** - Refresh existing AGENTS.md files
- **Scaling team** - Ensure new members understand cross-package dependencies
- **Microservices** - Document each service's agent context independently

## The Problem

Without structured AGENTS.md hierarchy:
- Agents get confused about project structure
- Context is scattered or missing
- Cross-package dependencies aren't clear
- Scaling to 5+ packages becomes difficult
- New team members waste time understanding structure

With this skill:
- Agents understand full project structure
- Each package has focused, actionable guidance
- Dependencies and integration points are documented
- Scales to 20+ packages without confusion

## Process

### Phase 1: Discovery (5-10 minutes)

Script automatically scans for:
- **Project files**: package.json, go.mod, Cargo.toml, pyproject.toml, pom.xml
- **Directories**: src/, lib/, components/, services/
- **Config files**: .cursorrules, .github/copilot-instructions.md
- **Documentation**: README.md, docs/

Scoring heuristic:
```
Project file present:     +10 points
src/lib/components dir:   +5 points
Config file present:      +3 points
>10 source files:         +3 points
README/docs present:      +2 points
Threshold: ≥ 5 points (default --min-score) = initialize
```

### Phase 2: Root Analysis

Create root AGENTS.md containing:
- Project overview
- All agents and their modes
- Available commands and skills
- Directory structure index (table of all packages)
- Hierarchy linking explanation

Example:
```markdown
# Project Agents

## Directory Structure

| Package | Level | Purpose | Key Files |
|---------|-------|---------|-----------|
| `packages/api` | API Services | REST backend | src/routes/, src/models/ |
| `packages/web` | Frontend | React UI | src/components/, src/pages/ |

## Hierarchy Linking

Each package maintains its own AGENTS.md with:
- **Hierarchy Level**: Role in system (e.g., "API Services")
- **Parent**: Link to this AGENTS.md
- **Philosophy**: Link to CLAUDE.md

See individual AGENTS.md files for package-specific guidance.
```

### Phase 3: Package Initialization

For each important subdirectory, create localized AGENTS.md (~20 lines):

**Metadata** (Required per Anthropic hierarchy docs):
```markdown
---
hierarchy:
  level: "API Services"
  parent: "../AGENTS.md"
  philosophy: "../../CLAUDE.md"
---

# API Service Agents
```

**Content**:
- Framework/tech stack used
- Build/lint/test commands with examples
- Code style guidelines (imports, formatting, naming)
- Common patterns specific to this package
- Integration points with other packages
- Key files and their purposes

**Example for API package**:
```markdown
# API Service Agents

**Hierarchy Level**: API Services (REST backend, database layer)  
**Parent**: [../AGENTS.md](../AGENTS.md)  
**Philosophy**: [CLAUDE.md](../../CLAUDE.md)

## Tech Stack

- Express.js (server framework)
- TypeScript (type safety)
- Prisma (ORM)
- PostgreSQL (database)

## Key Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build            # Compile TypeScript
npm run test             # Run Jest tests
npm run test:watch       # Watch mode

# Single test example
npm test -- routes.test.ts

# Linting & formatting
npm run lint             # ESLint check
npm run format           # Prettier format
```

## Code Style

**Imports**: Absolute paths from src/, relative for same package
```typescript
import { UserService } from '@api/services'  // Cross-package
import { helper } from '../utils'             // Local
```

**Naming**: camelCase functions, PascalCase classes, UPPER_SNAKE_CASE constants

**Types**: Explicit return types for all functions, use Zod for runtime validation

## Patterns

- **Services**: Business logic in `/services`, thin controllers
- **Models**: Prisma schemas in `/prisma/schema.prisma`
- **Error handling**: Use custom AppError class with status codes
- **Logging**: Use logger instance (shared/logger)

## Integration Points

- **Web package**: Uses `/api/*` routes via fetch
- **Shared package**: Uses types and utilities from shared
- **Database**: Migrations in `/prisma/migrations`

## AI Agent Guidance

For Claude/GPT working in this package:
1. Follow Express.js patterns (middleware, routing)
2. Always add types (no `any`)
3. Write tests alongside features
4. Update Prisma schema, run migrations
5. Reference `/shared` for shared types/utilities
```

### Phase 4: Root CLAUDE.md Update

Update (or create) root CLAUDE.md to document the hierarchy:

```markdown
# Project Philosophy

[Your guiding principles and vision...]

## Agent Coordination

See **[AGENTS.md](./AGENTS.md)** for:
- Agents and their modes (plan/build/review)
- Available commands and skills
- Directory context index

This CLAUDE.md defines **philosophy**. AGENTS.md documents **agents and tools**.

## Agent Contexts (Hierarchical)

Each package/service maintains specialized agent context:

| Directory | AGENTS.md | Level | Purpose |
|-----------|-----------|-------|---------|
| Root | [AGENTS.md](./AGENTS.md) | Coordination | Project overview, cross-package agents |
| `packages/api` | [packages/api/AGENTS.md](./packages/api/AGENTS.md) | API Services | REST backend, database layer |
| `packages/web` | [packages/web/AGENTS.md](./packages/web/AGENTS.md) | Frontend | React UI, styling, client logic |
| `packages/shared` | [packages/shared/AGENTS.md](./packages/shared/AGENTS.md) | Shared Utilities | Types, helpers, common code |

Each subdirectory's AGENTS.md includes hierarchy metadata:
- **Hierarchy Level**: Role in system architecture
- **Parent**: Link to parent AGENTS.md for coordination
- **Philosophy**: Link to this CLAUDE.md for guiding principles

This three-tier system (philosophy → coordination → specialization) allows AI agents to:
1. Understand project vision and values (CLAUDE.md)
2. Understand cross-package structure (root AGENTS.md)
3. Get specialized guidance for their specific package (package AGENTS.md)
```

### Phase 5: Verification & Cleanup

Verify all links work:
```bash
✓ Root AGENTS.md exists and links to all packages
✓ Root CLAUDE.md lists all AGENTS.md files
✓ Each package AGENTS.md has hierarchy metadata
✓ No broken relative paths
✓ Build commands are tested (where applicable)
```

Cleanup:
```bash
git add .
git commit -m "chore: initialize monorepo AGENTS.md hierarchy"
```

## Usage

### Skill Invocation

This skill is invoked through your AI environment's skill system, not via a standalone shell command.

**In Claude Code or similar AI environments:**
```
Use the monorepo-initialization skill to initialize AGENTS.md across the repository
```

**Programmatic usage (OpenCode):**
```typescript
use_skill("monorepo-initialization", {
  depth: 3,
  dry_run: true,
  preserve: true
})
```

Parameters are passed through your AI tool's skill invocation mechanism following the same structure shown in the OpenCode example below.

### OpenCode:
```python
use_skill("monorepo-initialization", {
    "depth": 2,
    "dry_run": False,
    "preserve": False
})
```

### Claude Code:
```
Use monorepo-initialization skill to set up AGENTS.md hierarchy for new packages
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--depth N` | Maximum recursion depth | 2 |
| `--dry-run` | Preview without making changes | false |
| `--preserve` | Keep existing AGENTS.md files | false |
| `--batch-size N` | Process N directories at a time | 3 |
| `--min-score N` | Minimum importance score to initialize | 5 |
| `--include <pattern>` | Additional patterns to scan | - |
| `--exclude <pattern>` | Skip matching directories | node_modules,.git,dist,build |

## Directory Scoring

Automatically scores directories to determine importance:

| Indicator | Points |
|-----------|--------|
| Has package.json/go.mod/Cargo.toml/etc | +10 |
| Has src/, lib/, components/, or services/ | +5 |
| Has .cursorrules or copilot-instructions.md | +3 |
| Has >10 source files (.ts,.js,.py,.go,.rs) | +3 |
| Has README.md or docs/ | +2 |

Only directories scoring > 5 are initialized (configurable via `--min-score`).

## Output Example

```
🔍 Scanning monorepo structure...
📊 Found 8 directories above threshold (score > 5)

📁 Root
   ✓ AGENTS.md created (project coordination, 8 packages)
   ✓ CLAUDE.md updated (hierarchy linking)

📦 Batch 1/3: [packages/api, packages/web, packages/shared]
   ✓ packages/api: AGENTS.md (Express.js, TypeScript, Prisma)
   ✓ packages/web: AGENTS.md (Next.js 14, React, Tailwind)
   ✓ packages/shared: AGENTS.md (TypeScript utilities, types)

📦 Batch 2/3: [packages/cli, packages/docs, services/worker]
   ✓ packages/cli: AGENTS.md (TypeScript CLI, Yargs)
   ✓ packages/docs: AGENTS.md (MDX docs site, Nextra)
   ✓ services/worker: AGENTS.md (Bull queue, async jobs)

📦 Batch 3/3: [.claude, scripts]
   ✓ .claude: AGENTS.md (custom Claude Code hooks)
   ✓ scripts: AGENTS.md (utility scripts, Bash)

✅ Summary: 1 root + 8 packages initialized
   📚 All packages linked hierarchically to CLAUDE.md
   🔗 Cross-package dependencies documented
   💾 Git commit ready: "chore: initialize monorepo AGENTS.md hierarchy"
```

## What Gets Created

For each important directory:

```
my-monorepo/
├── AGENTS.md                    ← Root coordination
├── CLAUDE.md                    ← Updated with hierarchy
├── packages/
│   ├── api/
│   │   ├── AGENTS.md            ← New (API Services level)
│   │   └── src/
│   ├── web/
│   │   ├── AGENTS.md            ← New (Frontend level)
│   │   └── src/
│   ├── shared/
│   │   ├── AGENTS.md            ← New (Shared Utilities level)
│   │   └── src/
│   └── cli/
│       ├── AGENTS.md            ← New (CLI Tools level)
│       └── src/
```

Each AGENTS.md includes:
- Hierarchy metadata (level, parent, philosophy)
- Tech stack summary
- Build/test/lint commands
- Code style guidelines
- Common patterns
- Integration points
- AI agent guidance

## Quality Checklist

Before running this skill, verify:
- [ ] Root CLAUDE.md exists or will be created
- [ ] Project structure is stable (won't add/remove packages soon)
- [ ] Key dependencies between packages are known

After running, verify:
- [ ] Each AGENTS.md is 15-25 lines (focused, not overwhelming)
- [ ] All hierarchy metadata is correct
- [ ] Links are valid (no broken references)
- [ ] Build commands are accurate
- [ ] Cross-package dependencies are noted
- [ ] Git commit message is clear

## Best Practices

1. **Run once per new package** - Update root AGENTS.md when adding packages
2. **Keep AGENTS.md lean** - ~20 lines per file, link to docs for details
3. **Update when tech changes** - Refresh AGENTS.md if framework/language updates
4. **Link to packages** - Reference package-specific docs, not inline docs
5. **Verify the hierarchy** - Test that agents can navigate from root → package

## Common Patterns

### Adding a new package:
```bash
# Add your new package directory
mkdir -p packages/my-service/src

# Re-run monorepo-initialization
/monorepo-initialization

# Verifies all links still work, updates root AGENTS.md
```

### Migrating existing project:
```bash
# Run on project with existing AGENTS.md files
/monorepo-initialization --preserve=true

# Won't overwrite existing files, just adds missing ones
```

### Large monorepos (20+ packages):
```bash
# Increase recursion depth, process in batches
/monorepo-initialization --depth=3 --batch-size=5 --min-score=7

# Higher score = fewer but more important directories initialized
```

## Success Metrics

After running:
- ✓ Root AGENTS.md exists and lists all packages
- ✓ All important directories have AGENTS.md
- ✓ Each AGENTS.md has hierarchy metadata
- ✓ CLAUDE.md links to package AGENTS.md files
- ✓ AI agents can understand project structure
- ✓ New team members can navigate contexts easily
- ✓ Cross-package dependencies are clear

This transforms your monorepo from "confusing structure" to "clear, navigable context for AI agents and humans alike."

