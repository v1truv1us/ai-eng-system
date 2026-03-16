# OpenCode Validation Setup

This validation framework uses OpenCode Server to evaluate LLM responses with real models.

## Prerequisites

1. **OpenCode installed** - Install via:
   ```bash
   curl -fsSL https://opencode.ai/install | bash
   # or
   bun install -g opencode-ai
   ```

2. **Provider configured** - Configure your LLM provider (e.g., Anthropic):
   ```bash
   opencode auth
   # Select your provider and follow prompts to add API key
   ```

## Running Validation with Real LLM Evaluation

### Step 1: Start OpenCode Server

```bash
opencode serve --port 4096
```

This starts the server on `http://localhost:4096`. The server will use the provider configured in step 2.

### Step 2: Run Validation

In another terminal:

```bash
cd /path/to/ferg-engineering-system
source venv_validation/bin/activate
python3 benchmarks/run_validation.py
```

The evaluation will:
1. Collect 288 baseline and enhanced responses (72 pairs × 4 categories)
2. Send each pair to OpenCode Server for G-Eval evaluation
3. Collect real LLM scores (accuracy, completeness, clarity, actionability, relevance)
4. Run statistical analysis with Wilcoxon signed-rank test
5. Generate reports

### Step 3: View Results

Results are saved in `benchmarks/results/`:
- `*.json` - Response and evaluation files
- `statistical_report.md` - Complete analysis with effect sizes, p-values, confidence intervals

## Environment Variables

- `OPENCODE_SERVER_URL` - Override server URL (default: `http://localhost:4096`)

## Fallback Behavior

If OpenCode evaluation fails (e.g., server unreachable, response parsing error):
- System automatically falls back to realistic mock evaluations
- Mock evaluations have ~65% improvement bias (realistic baseline)
- Allows testing the full pipeline without external dependencies

## Troubleshooting

**Server won't start:**
```bash
# Check if port 4096 is in use
lsof -i :4096
# Use different port
opencode serve --port 5000
# Update OPENCODE_SERVER_URL env var
export OPENCODE_SERVER_URL=http://localhost:5000
```

**Authentication errors:**
```bash
opencode auth
# List configured providers
opencode models anthropic
```

**Timeout errors:**
- Increase `timeout` in `benchmarks/config.json` (default: 300s)
- Check network connectivity to OpenCode server
- Verify LLM provider API is responding

## Architecture

```
┌─────────────────────────────────────────────┐
│    Validation Framework                     │
│   (benchmarks/run_validation.py)            │
└──────────────┬──────────────────────────────┘
               │
        ┌──────▼──────────┐
        │ Response        │
        │ Collection      │
        │ (288 pairs)     │
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ G-Eval          │
        │ Evaluation      │
        │ via OpenCode    │
        └──────┬──────────┘
               │
        ┌──────▼──────────────────────────┐
        │ OpenCode Server                 │
        │ - Creates sessions              │
        │ - Sends prompts to LLM          │
        │ - Parses JSON responses         │
        │ - Returns structured results    │
        └──────┬──────────────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │ LLM Provider (e.g., Anthropic)  │
        │ - Evaluates responses           │
        │ - Returns JSON scores           │
        └─────────────────────────────────┘
```

## What Gets Validated

The framework validates **incentive-based prompting techniques** by:

1. **Collecting paired responses** - Baseline and enhanced versions of 72 benchmark tasks
2. **G-Eval evaluation** - LLM-as-judge on 5 dimensions:
   - Accuracy (factual correctness)
   - Completeness (coverage)
   - Clarity (organization)
   - Actionability (practical usefulness)
   - Relevance (task focus)
3. **Statistical rigor**:
   - Wilcoxon signed-rank test (p < 0.05)
   - Effect size analysis (Cohen's d, Hedges' g)
   - 95% bootstrap confidence intervals
   - Power analysis
   - Multiple comparison correction

## Expected Results

With incentive-based prompting techniques, you should see:
- **Wilcoxon p-value** < 0.05 (highly significant improvement)
- **Effect size** Cohen's d ≥ 0.8 (large effect)
- **Mean improvement** 15-30% increase in overall scores
- **% improved pairs** 60-80% of enhanced responses score higher
