# CLI Installation & Usage Guide

## Installation

### Option 1: From Published Package (Recommended)

```bash
# Install globally
bun add -g ai-eng-system

# Or install locally to project
bun add -D ai-eng-system
```

### Option 2: From Source (Development)

```bash
# Clone repository
git clone https://github.com/v1truv1us/ai-eng-system.git
cd ai-eng-system

# Install dependencies
bun install

# Build CLI
bun run build

# Create symlink for global access
ln -s $(pwd)/dist/cli/run.js ~/.local/bin/"ai-eng ralph"
```

Or for the `ai-eng` command (without ralph):

```bash
ln -s $(pwd)/dist/cli/run.js ~/.local/bin/ai-eng
chmod +x dist/cli/run.ts
```

### Option 3: Direct Execution (No Install)

```bash
# Run directly with bun
bun /path/to/ai-eng-system/dist/cli/run.ts [options]
```

## Configuration

Create `.ai-eng-config.yaml` in your project root:

```yaml
version: 1

# Runner configuration
runner:
  backend: opencode           # Backend to use (opencode, anthropic, or both)
  review: opencode            # Review mode (none, opencode, anthropic, or both)
  artifactsDir: .ai-eng/runs  # Where to save run artifacts
  maxIters: 3                 # Maximum iteration loops

# OpenCode configuration
opencode:
  model: <your-model-name>    # Required: Specify your model
  temperature: 0.2

# Model configuration (task-specific)
models:
  default: <your-model-name>        # Required: Default model for all phases
  research: <your-model-name>       # Optional: Research phase model
  planning: <your-model-name>       # Optional: Planning phase model
  exploration: <your-model-name>    # Optional: Exploration phase model
  coding: <your-model-name>         # Optional: Coding phase model

# Quality gates
gates:
  lint: bun run lint
  typecheck: bun run typecheck
  test: bun run test
  build: bun run build

# Anthropic configuration (optional)
anthropic:
  enabled: false
  model: <your-model-name>
```

### Minimal Configuration

At minimum, you **must** configure a model:

```yaml
version: 1
models:
  default: <your-model-name>  # Replace with your actual model
```

Or use the `opencode.model` field:

```yaml
version: 1
opencode:
  model: <your-model-name>  # Replace with your actual model
```

**Important:** The CLI will **throw an error** if no model is configured. There is no automatic fallback. You must explicitly specify which model to use.

## Usage

### Basic Usage

```bash
# Interactive mode (TUI)
ai-eng ralph "implement user authentication"

# With workflow specification
ai-eng ralph path/to/workflow.yml

# With options
ai-eng ralph --max-iters 5 --review both
```

### CLI Options

```
OPTIONS:
  --max-iters <number>     Maximum iterations (default: from config)
  --gates <gate1,gate2>   Comma-separated list of quality gates
  --review <mode>          Review mode: none|opencode|anthropic|both
  --resume                 Resume previous run
  --run-id <id>           Specific run ID to resume
  --dry-run               Show what would be done without executing
  --ci                     Run in CI mode (no interactive prompts)
  --help                   Show this help message
```

### TUI (Terminal UI) Workflow

The CLI provides an interactive Terminal UI with 6 screens:

#### 1. Welcome Screen
- Press **ENTER** to continue
- Press **Q** to quit

#### 2. Input Screen
- Enter your prompt/task description
- Press **ENTER** to submit
- Press **ESC** to go back

#### 3. Optimizing Screen
- Shows prompt optimization progress
- Uses research-backed techniques (+45-115% quality)
- Automatically advances when complete

#### 4. Review Screen
- Review optimized prompt
- Press **A** to approve and continue
- Press **R** to reject and edit
- Press **ESC** to cancel

#### 5. Executing Screen
- Shows phase execution progress
- Displays current phase (Research → Specify → Plan → Work → Review)
- Shows quality gate results
- Live status updates

#### 6. Results Screen
- Shows final workflow results
- Displays artifacts location
- Press **Q** to quit
- Press **R** to start new run

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **ENTER** | Confirm/Submit |
| **ESC** | Back/Cancel |
| **Q** | Quit |
| **A** | Approve |
| **R** | Reject/Retry |
| **↑/↓** | Navigate options |

## Workflow Phases

The CLI executes 5 phases in sequence:

### 1. Research Phase
- Gathers context and background information
- Model: `config.models.research` or fallback to default

### 2. Specify Phase
- Creates detailed feature specification
- Model: `config.models.planning` or fallback to default

### 3. Plan Phase
- Generates implementation plan
- Model: `config.models.planning` or fallback to default

### 4. Work Phase
- Executes implementation
- Model: `config.models.coding` or fallback to default
- Runs quality gates after implementation

### 5. Review Phase
- Multi-perspective code review
- Model: `config.runner.review` backend

## Quality Gates

Quality gates run after the **Work** phase:

```yaml
gates:
  lint: bun run lint          # Code style check
  typecheck: bun run typecheck # Type checking
  test: bun run test           # Unit tests
  build: bun run build         # Build verification
```

**Gate Behavior:**
- Gates run in parallel
- Failures are reported but don't stop execution
- Results shown in TUI execution screen
- Stored in artifacts for review

## Artifacts

All workflow artifacts are saved to `.ai-eng/runs/<run-id>/`:

```
.ai-eng/runs/
└── run-20260112-012345/
    ├── research.md      # Research findings
    ├── spec.md          # Feature specification
    ├── plan.md          # Implementation plan
    ├── work.md          # Implementation results
    ├── review.md        # Code review
    ├── gates.json       # Quality gate results
    └── metadata.json    # Run metadata
```

## CI/CD Integration

Use `--ci` mode for non-interactive execution:

```bash
# In GitHub Actions or other CI
ai-eng ralph "fix bug in auth module" --ci --review opencode
```

**CI Mode Features:**
- No interactive prompts
- Automatic approval of optimization
- Exit codes indicate success/failure
- JSON output for parsing

## Error Handling

### Common Errors

**1. No Model Configured**
```
Error: No model configured. Please configure a model in .ai-eng/config.yaml
```

**Fix:** Add model configuration with YOUR actual model:
```yaml
models:
  default: <your-model-name>  # e.g., gpt-4, claude-opus-3, etc.
```

**2. Config File Not Found**
```
Error: Config file not found at .ai-eng-config.yaml
```

**Fix:** Create config file in project root or current directory.

**3. Rate Limit Exceeded**
```
Error: Rate limit exceeded. Retrying in 5s...
```

**Fix:** CLI automatically retries with exponential backoff (5s → 10s → 20s → 40s, max 60s)

**4. Timeout**
```
Error: OpenCode prompt timed out after 120s
```

**Fix:** Check OpenCode server status or increase timeout in config.

## Timeouts

Default timeout: **120 seconds** per prompt

The CLI uses `Promise.race()` to enforce timeouts:
```typescript
Promise.race([
    client.prompt(params),
    new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 120000)
    )
])
```

## Rate Limiting

Automatic retry with exponential backoff:

| Attempt | Rate Limit Wait | Normal Error Wait |
|---------|----------------|------------------|
| 1       | 5s             | 1s               |
| 2       | 10s            | 2s               |
| 3       | 20s            | 4s               |
| 4       | 40s            | 8s               |
| Max     | 60s            | 60s              |

**Random jitter:** ±10% to prevent thundering herd

## Model Resolution Priority

The CLI resolves models in this order:

1. **Task-specific:** `config.models.<taskType>` (research, planning, exploration, coding)
2. **Default:** `config.models.default`
3. **OpenCode:** `config.opencode.model`
4. **Error:** Throws error if none configured

Example:
```yaml
models:
  research: gpt-4-turbo        # Priority 1 for research tasks
  default: gpt-4               # Priority 2 for other tasks
opencode:
  model: gpt-3.5-turbo         # Priority 3 if no default
```

## Examples

### Example 1: Basic Feature Implementation

```bash
cd ~/my-project
cat > .ai-eng-config.yaml << EOF
version: 1
models:
  default: <your-model-name>  # Replace with your actual model
gates:
  test: bun test
EOF

ai-eng ralph "implement user authentication with JWT"
```

### Example 2: Bug Fix with Full Review

```bash
ai-eng ralph "fix memory leak in background worker" \
  --review both \
  --gates lint,typecheck,test
```

### Example 3: Resume Previous Run

```bash
# List runs
ls .ai-eng/runs/

# Resume specific run
ai-eng ralph --resume --run-id run-20260112-012345
```

### Example 4: Dry Run (Preview)

```bash
ai-eng ralph "refactor database layer" --dry-run
```

## Troubleshooting

### CLI Not Found

```bash
# Check if installed globally
which "ai-eng ralph"

# If not found, create symlink
ln -s /path/to/ai-eng-system/dist/cli/run.js ~/.local/bin/"ai-eng ralph"
chmod +x ~/.local/bin/"ai-eng ralph"

# Or add to PATH
export PATH="$PATH:/path/to/ai-eng-system/dist/cli"
```

### Permission Denied

```bash
# Make executable
chmod +x /path/to/ai-eng-system/dist/cli/run.ts
```

### Module Not Found

```bash
# Rebuild from source
cd /path/to/ai-eng-system
bun install
bun run build
```

### Config Not Loading

```bash
# Check config file location
ls -la .ai-eng-config.yaml

# CLI looks in current directory first
pwd
```

## Testing

Run CLI tests:

```bash
# All CLI tests
bun test tests/cli/

# Specific test file
bun test tests/cli/ralph-cli.test.ts
bun test tests/cli/timeout-and-models.test.ts

# With coverage
bun test --coverage tests/cli/
```

## Development

### Project Structure

```
src/cli/
├── run.ts              # Main entry point
├── flags.ts            # CLI flags interface
└── tui/
    └── App.ts          # Terminal UI implementation

src/backends/
└── opencode/
    └── client.ts       # OpenCode client wrapper

src/config/
├── schema.ts           # Config schema
├── loadConfig.ts       # YAML config loader
└── modelResolver.ts    # Model resolution logic
```

### Adding New Features

1. Update `src/cli/flags.ts` for new CLI options
2. Update `src/config/schema.ts` for new config options
3. Update TUI screens in `src/cli/tui/App.ts`
4. Add tests in `tests/cli/`
5. Update this documentation

## Support

- **Issues:** https://github.com/v1truv1us/ai-eng-system/issues
- **Discussions:** https://github.com/v1truv1us/ai-eng-system/discussions
- **Documentation:** https://github.com/v1truv1us/ai-eng-system/blob/main/README.md
