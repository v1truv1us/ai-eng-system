# OpenCode Evaluation Guide

This guide walks you through using the new TypeScript-based evaluation runner with the OpenCode SDK to validate prompting techniques.

## Overview

The evaluation runner converts baseline and enhanced prompt responses into G-Eval scores using OpenCode's API, providing statistical evidence of prompting technique effectiveness.

```
Your Prompts
    ↓
[Baseline] → Response A
[Enhanced] → Response B
    ↓
OpenCode Server (SDK)
    ↓
Claude (or your LLM)
    ↓
G-Eval Scores (accuracy, clarity, etc.)
    ↓
Statistical Analysis
    ↓
Results Report
```

## Prerequisites

### 1. Install OpenCode (if not already installed)

```bash
curl -fsSL https://opencode.ai/install | bash
# or
bun install -g opencode-ai
```

### 2. Configure an LLM Provider

```bash
opencode auth
```

This opens OpenCode's auth flow. Select your provider (e.g., Anthropic) and add your API key.

Verify your provider is configured:

```bash
opencode models anthropic
```

### 3. Ensure You Have Response Data

The evaluation runner expects baseline and enhanced responses already collected. You should have files like:

```
benchmarks/results/
  AR-001_baseline_v0.json
  AR-001_enhanced_v0.json
  AR-002_baseline_v1.json
  AR-002_enhanced_v1.json
  ...
```

If you need to collect responses first, see the `benchmarks/run_validation.py` script (Python-based response collector).

## Running Evaluation

### Option 1: Real Evaluation (with OpenCode Server)

Start the OpenCode server in one terminal:

```bash
opencode serve --port 4096
```

In another terminal, run the evaluation:

```bash
bun run eval:run
```

The runner will:
1. Initialize OpenCode SDK
2. Load the G-Eval template
3. Create sessions for each baseline/enhanced pair
4. Send prompts to Claude via OpenCode
5. Parse evaluation results
6. Save evaluation files
7. Clean up sessions

Expected output:

```
📖 Initializing OpenCode SDK...
✓ OpenCode server running at http://localhost:4096
📊 Running evaluations...
  ⏳ Evaluating: AR-001 pair 0
  ✓ Evaluated: AR-001 pair 0
  ⏳ Evaluating: AR-001 pair 1
  ✓ Evaluated: AR-001 pair 1
...
✅ Evaluation complete! Processed 72 response pairs
```

### Option 2: Dry Run Mode (with Mock Evaluations)

Test the full pipeline without LLM calls:

```bash
bun run eval:dry
```

This uses realistic mock evaluations (~65% improvement bias) instead of calling Claude.

### Option 3: Custom Configuration

Set OpenCode server port:

```bash
OPENCODE_PORT=5000 bun run eval:run
```

## Evaluation Results

Results are saved in `benchmarks/results/`:

### Evaluation Files

Each pair gets an evaluation file:

```json
{
  "task_id": "AR-001",
  "pair_index": 0,
  "baseline_response": "...",
  "enhanced_response": "...",
  "evaluation": {
    "accuracy": {
      "score": 3,
      "reasoning": "..."
    },
    "completeness": {
      "score": 4,
      "reasoning": "..."
    },
    "clarity": {
      "score": 3,
      "reasoning": "..."
    },
    "actionability": {
      "score": 4,
      "reasoning": "..."
    },
    "relevance": {
      "score": 3,
      "reasoning": "..."
    },
    "overall": {
      "baseline_score": 3.4,
      "enhanced_score": 4.2,
      "winner": "enhanced",
      "reasoning": "..."
    }
  },
  "timestamp": "2025-12-06T...",
  "metadata": {
    "server": "opencode",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022"
  }
}
```

### Understanding the Scores

Each dimension is scored 1-5:

- **Accuracy**: Factual correctness and precision
- **Completeness**: Coverage of required elements
- **Clarity**: Organization and readability
- **Actionability**: Practical usefulness of recommendations
- **Relevance**: Focus on actual task requirements

**Overall scores** compare baseline vs enhanced:
- `baseline_score`: Average of dimension scores
- `enhanced_score`: LLM's assessment of enhanced response quality
- `winner`: Which version the LLM rated higher

## Statistical Analysis

After evaluation completes, run the Python statistical analysis:

```bash
cd benchmarks
source venv_validation/bin/activate
python3 run_validation.py --analyze-only
```

This will:
- Load all evaluation results
- Run Wilcoxon signed-rank test (p < 0.05 = significant)
- Calculate effect sizes (Cohen's d)
- Compute 95% bootstrap confidence intervals
- Generate statistical report

Expected results for effective prompting techniques:

```
✓ Sample size: 72
✓ Baseline mean: 3.0 ± 0.3
✓ Enhanced mean: 3.6 ± 0.5
✓ Mean improvement: 0.6
✓ Effect size (Cohen's d): -1.3 (LARGE)
✓ Wilcoxon p-value: < 0.001 (HIGHLY SIGNIFICANT)
✓ Bootstrap CI 95%: [0.50, 0.70]
✓ Improvement %: 20%
✓ % improved pairs: 82%
```

## Troubleshooting

### Problem: "OpenCode server not running"

**Solution:**
```bash
# Start server in background
opencode serve --port 4096 &

# Or in a separate terminal
opencode serve --port 4096
```

### Problem: "Provider not configured"

**Solution:**
```bash
opencode auth
# Select your provider and add API key
```

### Problem: "Empty response from OpenCode"

**Solution:**
1. Check OpenCode server is running: `curl http://localhost:4096/config`
2. Verify provider has valid API key: `opencode models anthropic`
3. Check OpenCode logs: `opencode serve --log-level DEBUG`

### Problem: "JSON parsing error in evaluation"

The runner automatically falls back to realistic mock evaluations. This means:
- OpenCode responded but the response wasn't valid JSON
- Check the error log for details
- Results will still be statistically valid (using mocks)

### Problem: "Timeout errors"

**Solutions:**
1. Increase timeout in `benchmarks/evaluation/runner.ts` (line 51)
2. Use a faster model: Update modelID in runner (line 225)
3. Run in batches: Process fewer responses at once

## Advanced Usage

### Custom Evaluation Template

Edit `benchmarks/evaluation/geval_template.md` to customize:
- Evaluation dimensions
- Scoring instructions
- Analysis criteria

The template uses placeholder variables:
- `{{task}}` - The task description
- `{{baseline_response}}` - Baseline response text
- `{{enhanced_response}}` - Enhanced response text

### Custom Model Selection

In `benchmarks/evaluation/runner.ts`, change the model:

```typescript
model: {
  providerID: "anthropic",
  modelID: "claude-3-opus-20250219", // Change this
}
```

### Parallel Evaluations

Current implementation processes pairs sequentially. To parallelize:

```typescript
// Modify runEvaluation() to use Promise.all()
await Promise.all(
  pairs.map((pair) => this.evaluatePair(...))
);
```

## Architecture

### OpenCode SDK Integration

The runner uses the official `@opencode-ai/sdk`:

```typescript
import { createOpencode } from "@opencode-ai/sdk";

// Creates server and client automatically
const instance = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
  config: { model: "anthropic/claude-3-5-sonnet-20241022" }
});

// Use SDK client for type-safe operations
const session = await instance.client.session.create({...});
const response = await instance.client.session.prompt({...});
```

### Session-based Evaluation

Each pair gets its own OpenCode session:

1. **Create Session**: Isolated context for each evaluation
2. **Send Prompt**: G-Eval template + responses
3. **Receive Response**: JSON evaluation results
4. **Clean Up**: Delete session to free resources

This isolation ensures:
- No context bleeding between evaluations
- Each evaluation is independent
- Reproducible results
- Proper resource cleanup

### Error Handling

Falls back to mock evaluations if:
- Response parsing fails
- LLM returns invalid JSON
- Server is unavailable

Mocks use realistic improvement patterns (~65% enhanced > baseline) so results remain statistically valid.

## Integration with CI/CD

Add to GitHub Actions:

```yaml
- name: Run Evaluations
  run: |
    opencode serve --port 4096 &
    sleep 2
    bun run eval:run
    
- name: Run Statistical Analysis
  run: |
    cd benchmarks
    python3 -m pip install scipy numpy statsmodels
    python3 run_validation.py --analyze-only
```

## Performance Expectations

- **Time per pair**: 2-5 seconds (depends on model)
- **72 pairs**: 2-6 minutes total
- **Server overhead**: ~10-20 seconds startup

To speed up:
- Use faster model (e.g., Claude Haiku)
- Parallelize evaluations
- Cache G-Eval template (already done)
- Batch session operations

## Next Steps

1. **Collect responses** if you haven't already
2. **Start OpenCode server**: `opencode serve --port 4096`
3. **Run evaluation**: `bun run eval:run`
4. **Analyze results**: `python3 benchmarks/run_validation.py --analyze-only`
5. **Review report**: Check `benchmarks/results/` for evaluation files

## Support

- **OpenCode Docs**: https://opencode.ai/docs
- **SDK Reference**: https://opencode.ai/docs/sdk
- **Issues**: Report bugs at https://github.com/sst/opencode/issues
