# AI Engineering Agents

## Agent Coordination

See **[CLAUDE.md](./CLAUDE.md)** — Project philosophy and core guidelines that guide all agent behavior.

This document defines the **agents and tools** available in this system. For the guiding **philosophy**, refer to CLAUDE.md.

## Agent Coordination

| Agent | Mode | Purpose |
|-------|------|---------|
| plan | read-only | Research + planning (no edits) |
| build | edit | Implements changes |
| review | read-only | Code review |

## Specialized Agents (48 Total)

### Architecture & Planning
- `architect-advisor` - System architecture decisions and trade-off analysis
- `backend-architect` - Backend system design and scalability
- `infrastructure-builder` - Cloud infrastructure design and IaC
- `aws-architect` - AWS service selection, cloud architecture, and Well-Architected guidance
- `planner` - Feature implementation planning and task decomposition

### Development & Coding
- `frontend-reviewer` - Frontend code review (React, TypeScript, accessibility)
- `full-stack-developer` - End-to-end application development
- `api-builder-enhanced` - REST/GraphQL API development with documentation
- `database-optimizer` - Database performance and query optimization
- `java-pro` - Java development with modern features and patterns
- `mobile-developer` - iOS, Android, React Native, and Flutter development
- `data-engineer` - Data pipelines, warehousing, and streaming systems
- `docs-lookup` - Documentation retrieval and verification from official sources
- `documentation-specialist` - Comprehensive technical documentation generation
- `docs-writer` - Concise product and feature documentation

### Quality & Testing
- `code-reviewer` - Comprehensive code quality assessment
- `test-generator` - Automated test suite generation
- `tdd-guide` - Test-driven development enforcement
- `security-scanner` - Security vulnerability detection and fixes
- `performance-engineer` - Application performance optimization
- `build-error-resolver` - Build and compilation error diagnosis
- `e2e-runner` - End-to-end Playwright testing
- `plugin-validator` - Plugin structure validation and best practices
- `text-cleaner` - AI-generated verbosity cleanup and content tightening

### Language-Specific Reviewers (NEW)
- `typescript-reviewer` - TypeScript/JavaScript type safety, async, React patterns
- `python-reviewer` - Python type hints, async, testing, Pythonic idioms
- `go-reviewer` - Go concurrency, error handling, interfaces, idioms
- `java-reviewer` - Java Spring Boot, JPA, concurrency, enterprise patterns
- `rust-reviewer` - Rust ownership, lifetimes, traits, async, safety
- `cpp-reviewer` - C++ memory management, RAII, templates, modern C++
- `kotlin-reviewer` - Kotlin coroutines, sealed classes, Android/KMP patterns
- `csharp-reviewer` - C# async/await, LINQ, DI, .NET patterns

### Reliability & Automation (NEW)
- `silent-failure-hunter` - Detects swallowed errors, missing assertions, unmonitored paths
- `loop-operator` - Manages autonomous agent loops with quality gates and recovery

### DevOps & Operations
- `deployment-engineer` - CI/CD pipeline design and deployment automation
- `monitoring-expert` - Observability, alerting, and system monitoring
- `cost-optimizer` - Cloud cost optimization and resource efficiency
- `harness-optimizer` - Agent harness reliability, cost, and configuration tuning

### AI & Machine Learning
- `ai-engineer` - AI integration and LLM application development
- `ml-engineer` - Machine learning model development and deployment
- `prompt-optimizer` - Prompt enhancement using research-backed techniques
- `agent-developer` - MCP, A2A, tool calling, and multi-agent orchestration

### Content & SEO
- `seo-specialist` - Technical and on-page SEO expertise

### Plugin Development
- `agent-creator` - AI-assisted agent generation
- `command-creator` - AI-assisted command generation
- `skill-creator` - AI-assisted skill creation
- `tool-creator` - AI-assisted custom tool creation

### Coordination
- `subagent-orchestration` - Routes work to the most appropriate specialist agent

**All agents enhanced with research-backed prompting techniques** (+45-115% quality improvement)

## Incentive-Based Prompting Integration

All subagents are enhanced with research-backed techniques:

1. **Expert Persona Assignment** — Detailed role with years of experience and notable companies (Kong et al., 2023: 24% → 84% accuracy)

2. **Step-by-Step Reasoning** — "Take a deep breath and analyze systematically" (Yang et al., 2023: 34% → 80% accuracy)

3. **Stakes Language** — "This is critical", "direct impact on production" (Bsharat et al., 2023: +45% quality)

4. **Challenge Framing** — "I bet you can't find the perfect balance" (Li et al., 2023: +115% on hard tasks)

5. **Self-Evaluation** — Confidence ratings and uncertainty identification

## Usage Examples

### Spec-Driven Workflow
```
# Complete spec-driven development with ai-eng-system
/ai-eng/research "authentication patterns"      # Gather context
/ai-eng/specify "user authentication"        # Create specification
/ai-eng/plan --from-spec=specs/auth     # Create implementation plan
/ai-eng/work "specs/auth/plan"              # Execute with quality gates
/ai-eng/review                               # Multi-agent code review
```

### Using prompt-refinement skill
The prompt-refinement skill is automatically invoked by:
- `/ai-eng/research` - Clarifies research scope and depth
- `/ai-eng/specify` - Clarifies user stories and requirements
- `/ai-eng/plan` - Clarifies technical approach and constraints
- `/ai-eng/work` - Clarifies execution context and quality requirements

### Using prompt-optimizer
```
Ask the prompt-optimizer to enhance: "Help me fix this slow database query"
```

## Automatic Prompt Optimization System

The ai-eng-system includes an **automatic step-by-step prompt optimization** system that enhances all user prompts with research-backed techniques.

### Features

- **Automatic**: Every prompt is optimized by default (no manual action needed)
- **Step-by-step**: Shows each optimization technique with approve/reject/modify options
- **Research-backed**: Uses peer-reviewed prompting techniques for +45-115% quality improvement
- **Domain-aware**: Detects technical domain (security, frontend, backend, etc.) and applies relevant expertise
- **Escape hatch**: Use `!` prefix to skip optimization entirely
- **Configurable**: Adjustable verbosity (quiet/normal/verbose) and auto-approve mode

### Techniques Applied

1. **Expert Persona** (+60% accuracy): Assigns detailed expert role with years of experience
2. **Step-by-Step Reasoning** (+46% accuracy): Adds systematic analysis instruction
3. **Stakes Language** (+45% quality): Adds importance and consequence framing
4. **Challenge Framing** (+115% on hard tasks): Frames problem as challenge
5. **Self-Evaluation** (+10% calibration): Requests confidence rating

### Platform-Specific Behavior

#### Claude Code

**Mechanism**: UserPromptSubmit hook (intercepts every prompt)

**Example Flow**:
```
User: help me fix the auth bug

→ Hook analyzes: Complexity: Medium, Domain: Security
→ Hook applies techniques:
  ✓ Expert Persona (security engineer)
  ✓ Step-by-Step Reasoning
  ✓ Stakes Language
  ✓ Self-Evaluation

→ Returns optimized prompt with all techniques applied
```

#### OpenCode

**Mechanism**: Custom tool (`prompt-optimize`) that model can call

**Example Flow**:
```
User: help me fix the auth bug

→ Model calls: prompt-optimize("help me fix the auth bug")
→ Tool analyzes: Complexity: Medium, Domain: Security
→ Tool applies techniques:
  ✓ Expert Persona (security engineer)
  ✓ Step-by-Step Reasoning
  ✓ Stakes Language
  ✓ Self-Evaluation

→ Returns: 🧧 Prompt optimized (medium, security)
```

### Usage

#### Automatic Mode (Default)

Every prompt is automatically optimized. No action needed.

**Examples**:
```
# These are all automatically optimized
"help me debug this error"
"design a scalable architecture"
"optimize this database query"
```

#### Escape Hatch

Use `!` prefix to bypass optimization entirely:

```
!just say hello
!no thanks, I'm good
```

#### Manual Optimization

Use `/optimize` command for explicit optimization with options:

```bash
/optimize --help                         # Show help
/optimize "help me debug" --verbose       # Verbose mode
/optimize "help me debug" --quiet           # Quiet mode
/optimize --auto-approve on|off            # Toggle auto-approve
/optimize-verbosity quiet|normal|verbose     # Change verbosity
```

### Configuration

**Defaults** (built-in):
- `enabled`: true
- `autoApprove`: false (require approval at each step)
- `verbosity`: "normal" (condensed view)
- `escapePrefix`: "!"
- `skipForSimplePrompts`: true

**Customize via**:
- Claude Code: `.claude/ai-eng-config.json`
- OpenCode: `opencode.json` or `ai-eng-config.json`

**Example Config**:
```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": true,
    "verbosity": "verbose",
    "skipForSimplePrompts": true,
    "escapePrefix": "!"
  }
}
```

### Session Commands

**Toggle auto-approve**:
```bash
/optimize-auto on|off
```

**Change verbosity**:
```bash
/optimize-verbosity quiet|normal|verbose
```

### Verification

To verify optimization is working:
```bash
# See verification guide
cat docs/prompt-optimization-verification.md
```

### Research References

All techniques are based on peer-reviewed research:

- **Bsharat et al. (2023, MBZUAI)**: 26 principled prompting instructions, +57.7% quality
- **Yang et al. (2023, Google DeepMind OPRO)**: "Take a deep breath", +50% improvement
- **Li et al. (2023, ICLR 2024)**: Challenge framing, +115% on hard tasks
- **Kong et al. (2023)**: Expert persona, 24% → 84% accuracy

### Performance

- **Latency**: ~10-50ms per prompt (hook-based)
- **Quality**: +45-115% improvement in response quality
- **Trade-off**: Small latency for significantly better responses

### Using recursive-init
```
Run recursive-init on a monorepo: /recursive-init --dry-run --estimate-cost
```

### Using enhanced agents
```
Use the architect-advisor to evaluate: Should we use microservices or a monolith?
```

## Selected Skills

The table below highlights the most important lifecycle and alignment skills. The repository also contains additional namespaced and platform-specific skills under `skills/`.

 | Skill | Location | Purpose |
|-------|----------|---------|
| comprehensive-research | skills/comprehensive-research/ | Multi-phase research orchestration |
| code-review-and-quality | skills/code-review-and-quality/ | Multi-axis review before merge |
| code-simplification | skills/code-simplification/ | Behavior-preserving code simplification |
| coolify-deploy | skills/coolify-deploy/ | Coolify deployment best practices |
| debugging-and-error-recovery | skills/debugging-and-error-recovery/ | Root-cause debugging workflow |
| git-worktree | skills/git-worktree/ | Git worktree workflow |
| incremental-implementation | skills/incremental-implementation/ | Thin-slice implementation discipline |
| prompt-refinement | skills/prompt-refinement/ | TCRO structuring with phase-specific clarification |
| incentive-prompting | skills/incentive-prompting/ | Research-backed prompting techniques |
| knowledge-architecture | skills/knowledge-architecture/ | Static-first knowledge architecture and learning workflows |
| plugin-dev | skills/plugin-dev/ | Plugin development knowledge base |
| using-agent-skills | skills/using-agent-skills/ | Decision tree for task-to-skill mapping |
| continuous-learning-v2 | skills/continuous-learning-v2/ | Instinct-based learning with confidence scoring |
| verification-loop | skills/verification-loop/ | Continuous verification after every change |
| eval-harness | skills/eval-harness/ | Agent evaluation framework |
| context-budget | skills/context-budget/ | Context window management |

## Key Commands

| Command | Description | Agent Mode |
|---------|-------------|------------|
| /research | Multi-phase research orchestration | read-only |
| /specify | Create feature specifications | read-only |
| /plan | Create detailed implementation plans | read-only |
| /work | Execute plans with quality gates and tracking | build |
| /review | Multi-perspective code review (32 agents) | read-only |
| /ralph-wiggum | Full-cycle feature development with continuous iteration through all spec-driven workflow phases | build |
| /deploy | Pre-deployment checklist and deployment workflows | build |
| /content-optimize | Content and prompt enhancement | build |
| /context | Context management and retrieval | read-only |
| /create-plugin | Guided plugin creation workflow | build |
| /create-agent | AI-assisted agent generation | build |
| /create-command | AI-assisted command generation | build |
| /create-skill | AI-assisted skill creation | build |
| /create-tool | AI-assisted tool creation | build |
| /knowledge-capture | Document solved problems for team | build |
| /knowledge-architecture | Build static-first knowledge maps | build |
| /decision-journal | Record durable decisions | build |
| /quality-gate | Define file-backed quality gates | build |
| /maintenance-review | Review drift and maintenance debt | read-only |
| /prp-prd | Generate Product Requirements Document | plan |
| /prp-plan | Create implementation plan from PRD | plan |
| /prp-implement | Execute implementation plan | build |
| /loop-start | Start autonomous agent loop | build |
| /loop-status | Check loop status | plan |
| /harness-audit | Audit agent harness configuration | plan |

See `docs/reference/commands.md` for the full 49-command inventory.

### Lifecycle Mapping

This repository keeps the `ai-eng/*` command namespace, but its main workflow now maps more clearly to the lifecycle used by `agent-skills`:

| ai-eng-system | Common lifecycle name |
|---------------|-----------------------|
| `/specify` | `/spec` |
| `/plan` | `/plan` |
| `/work` | `/build` |
| `/review` | `/review` |

### Using /research

The research command orchestrates multiple agents for thorough investigation:

```bash
# Basic research
/research "How does authentication work in this codebase?"

# Research with specific scope
/research "Analyze payment processing" --scope=codebase --depth=deep

# Research from ticket
/research --ticket="docs/tickets/AUTH-123.md"
```

**Research Phases:**
1. **Discovery** (Parallel): codebase-locator, research-locator, codebase-pattern-finder
2. **Analysis** (Sequential): codebase-analyzer, research-analyzer
3. **Synthesis**: Consolidated findings with evidence and recommendations

## New Additions from External Repositories

### References (from addyosmani/agent-skills)
Located in `references/`, loaded on-demand by skills:

| Reference | Purpose |
|-----------|---------|
| `testing-patterns.md` | Test structure, naming, mocking, React/API/E2E examples |
| `security-checklist.md` | Pre-commit checks, OWASP Top 10, secrets management |
| `performance-checklist.md` | Core Web Vitals, frontend/backend checklists |
| `accessibility-checklist.md` | Keyboard nav, screen readers, WCAG 2.1 AA |
| `orchestration-patterns.md` | 5 endorsed + 4 anti-pattern orchestration approaches |

### Rules (from everything-claude-code)
Located in `rules/`, always-follow guidelines per language:

| Rule Pack | Purpose |
|-----------|---------|
| `common/rules.md` | Language-agnostic principles |
| `typescript/rules.md` | Type safety, async, React, module system |
| `python/rules.md` | Type hints, async, PEP 8, error handling |
| `golang/rules.md` | Error handling, concurrency, interfaces |

### Contexts (from everything-claude-code)
Located in `contexts/`, dynamic system prompt injection:

| Context | Purpose |
|---------|---------|
| `dev.md` | Development mode principles and tool preferences |
| `review.md` | Code review mode with five-axis review process |
| `research.md` | Research mode with read-only analysis patterns |

### Hooks (from addyosmani/agent-skills)
Located in `hooks/`, session lifecycle automations:

| Hook | Event | Purpose |
|------|-------|---------|
| `session-start.sh` | SessionStart | Load project context and skill count |
| `hooks.json` | Configuration | Hook definitions and conditions |

### New Skills (from both repos)

| Skill | Source | Purpose |
|-------|--------|---------|
| `using-agent-skills` | agent-skills | Decision tree for task-to-skill mapping |
| `continuous-learning-v2` | everything-claude-code | Instinct-based learning with confidence scoring |
| `verification-loop` | everything-claude-code | Continuous verification after every change |
| `eval-harness` | everything-claude-code | Agent evaluation framework |
| `context-budget` | everything-claude-code | Context window management |

### New Commands (from everything-claude-code)

| Command | Purpose |
|---------|---------|
| `/prp-prd` | Generate Product Requirements Document |
| `/prp-plan` | Create implementation plan from PRD |
| `/prp-implement` | Execute implementation plan |
| `/loop-start` | Start autonomous agent loop |
| `/loop-status` | Check loop status |
| `/harness-audit` | Audit agent harness configuration |

### Multi-Platform Setup Guides (from addyosmani/agent-skills)
Located in `docs/`:

| Guide | Platform |
|-------|----------|
| `cursor-setup.md` | Cursor IDE |
| `gemini-cli-setup.md` | Google Gemini CLI |
| `windsurf-setup.md` | Windsurf IDE |
| `copilot-setup.md` | GitHub Copilot |
| `kiro-setup.md` | Kiro IDE |

### MCP Configurations (from everything-claude-code)
Located in `mcp-configs/mcp-servers.json`:
- Pre-configured MCP servers for GitHub, Supabase, Vercel, Railway, Slack, Sentry, Cloudflare, Puppeteer, Playwright, Context7, Sequential Thinking, and Filesystem.

## Directory Context Index

| Directory | Hierarchy Level | Purpose | Key Files |
|-----------|-----------------|---------|-----------|
| `src/` | Core Implementation | TypeScript source code | `agents/`, `cli/`, `context/`, `execution/`, `research/` |
| `tests/` | Quality Assurance | Comprehensive test suite | `unit.test.ts`, `integration.test.ts`, `performance.test.ts` |
| `docs/` | Knowledge Base | Documentation and research | `PHASE-3-USAGE.md`, `research-command-guide.md` |
| `.claude/` | Command Implementation | Claude Code command definitions | `commands/*.md` |
| `content/` | Agent Documentation | Agent & command documentation | `agents/`, `commands/` |
| `skills/` | Skill Definitions | Modular skill definitions | `devops/`, `prompting/`, `research/` |
| `scripts/` | Build Utilities | Build & installation utilities | `install.js` |

## Build Commands

```bash
# Main build process
bun run build

# Development with watch mode  
bun run build:watch

# Clean build artifacts
bun run clean

# Validate build
bun run validate

# Installation
bun run install:global  # Global OpenCode install
bun run install:local    # Local OpenCode install
```

## Task Management with TODO.md

The project uses **TODO.md** as the central task management system. This file tracks:

### Task Categories
- **High Priority** - Critical items requiring immediate attention
- **Medium Priority** - Important items for next iteration
- **Low Priority** - Nice-to-have enhancements
- **Completed Tasks** - Historical record of completed work

### Using TODO.md

1. **Check current tasks** before starting work:
   ```bash
   # Read TODO.md to understand what needs attention
   ```

2. **Update task status** when working on items:
   - Mark tasks as `[x]` when completed
   - Move tasks between priority levels as needed
   - Add new tasks as they arise

3. **Reference TODO.md in agent workflows**:
   - When using `/ai-eng/work`, check TODO.md for related tasks
   - When using `/ai-eng/research`, consider TODO.md items that need context
   - After completing work, update TODO.md to reflect progress

### TODO Integration with Agents

The TODO system integrates with agent workflows:

- **plan mode agents** can reference TODO.md for planning context
- **build mode agents** should check TODO.md for implementation priorities
- **review mode agents** can verify TODO items are properly addressed

### Maintaining TODO.md

Keep TODO.md current by:
- Reviewing and updating task priorities regularly
- Adding detailed notes when tasks are completed
- Using consistent formatting for task descriptions
- Including version information and dates in headers

## Research References

- Bsharat et al. (2023) — "Principled Instructions Are All You Need" — MBZUAI
- Yang et al. (2023) — "Large Language Models as Optimizers" (OPRO) — Google DeepMind
- Li et al. (2023) — Challenge framing research — ICLR 2024
- Kong et al. (2023) — Persona prompting research
