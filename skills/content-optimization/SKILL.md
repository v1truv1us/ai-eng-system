---
name: content-optimization
description: Enhance any content type using research-backed techniques. Optimize AI prompts with step-by-step approval, improve code quality, refine database queries, enhance documentation, optimize commit messages, and improve communication. Wraps incentive-prompting skill with content-type detection.
version: 1.0.0
tags: [optimization, prompts, code, queries, documentation, communication]
---

# Content Optimization Skill

## Purpose

Systematically enhance any type of content using research-backed techniques and best practices. This skill:
- Automatically detects content type
- Applies domain-specific optimization techniques
- Provides step-by-step approval workflow (especially for prompts)
- Measures improvement with confidence scores
- Supports multiple optimization modes (conservative, moderate, aggressive)

## When to Use

- **AI Prompts**: Improve clarity, add reasoning chains, optimize for better responses
- **Code**: Refactor for performance, readability, error handling
- **Database Queries**: Optimize performance, suggest indexes, enable caching
- **Commit Messages**: Clarify intent, follow conventional format
- **Documentation**: Improve structure, add examples, enhance clarity
- **Communication**: Refine tone, improve call-to-action, enhance effectiveness

## The Problem

Without systematic optimization:
- Prompts to AI models are vague, leading to poor responses
- Code is written without considering performance
- Database queries are inefficient, causing slowdowns
- Commit messages lack clarity about changes
- Documentation is unclear for readers
- Communications miss the mark

With this skill:
- Prompts generate 45-115% better responses (research-backed)
- Code is performant and maintainable
- Queries execute faster with proper indexes
- Commit history is clear and navigable
- Documentation is clear and helpful
- Communications are more effective

## Supported Content Types

| Type | Purpose | Techniques |
|------|---------|-----------|
| `prompt` | AI prompt optimization | Expert personas, step-by-step reasoning, stakes language, challenge framing |
| `code` | Source code improvement | Performance, readability, error handling, best practices |
| `query` | Database/search query | Indexes, execution plans, caching, pagination |
| `commit` | Git commit messages | Conventional commits, clarity, intent description |
| `docs` | Documentation | Structure, examples, clarity, accessibility |
| `email` | Communication | Tone, clarity, call-to-action, effectiveness |

## Prompt Optimization Techniques

### 1. Expert Persona Assignment
Assigns detailed expert role with relevant background.
```
Instead of: "Help me debug this"
Optimized: "As a senior backend engineer with 10 years of experience debugging distributed systems..."
```
**Impact**: +60% accuracy (Kong et al., 2023)

### 2. Step-by-Step Reasoning
Instructs systematic analysis approach.
```
"Take a deep breath and think step by step. First, identify the symptoms..."
```
**Impact**: +46% accuracy (Yang et al., 2023)

### 3. Stakes Language
Frames importance and consequences.
```
"This is critical for production. Incorrect analysis could cause service outage."
```
**Impact**: +45% quality (Bsharat et al., 2023)

### 4. Challenge Framing
Positions as difficult problem worth solving.
```
"This is a tricky optimization problem. I bet you can't find the perfect balance."
```
**Impact**: +115% on hard tasks (Li et al., 2023)

### 5. Self-Evaluation
Requests confidence ratings and uncertainty identification.
```
"Rate your confidence in this solution (0.0-1.0) and identify any uncertainties."
```
**Impact**: +10% calibration

## Usage Examples

### Optimize AI Prompts
```bash
# Use the content-optimization skill to enhance prompts
use_skill("content-optimization", {
  "content": "Help me debug auth",
  "type": "prompt"
})

# Interactive approval workflow:
# - Shows detected domain (security)
# - Suggests optimization steps
# - Asks approve/reject/modify for each step
# - Calculates expected improvement

use_skill("content-optimization", {
  "content": "Help me debug auth",
  "type": "prompt",
  "verbose": true
})
# Detailed walkthrough with reasoning for each optimization

use_skill("content-optimization", {
  "content": "Help me debug auth",
  "type": "prompt",
  "mode": "aggressive"
})
# Apply maximum optimization (more aggressive than default)

use_skill("content-optimization", {
  "content": "Help me debug auth",
  "type": "prompt",
  "mode": "conservative"
})
# Minimal changes, preserve original intent

# Skip optimization with exclamation mark prefix
use_skill("content-optimization", {
  "content": "! Help me debug auth",
  "type": "prompt"
})
# Exclamation mark prefix bypasses optimization
```

### Optimize Source Code
```bash
use_skill("content-optimization", {
  "file": "src/auth.js",
  "type": "code"
})
# Suggests: performance improvements, readability, error handling

use_skill("content-optimization", {
  "file": "src/auth.js",
  "type": "code",
  "preview": true
})
# Show changes before applying

/optimize src/auth.js --code --apply
# Automatically apply optimizations

/optimize src/auth.js --code --mode=aggressive
# Maximum optimization (may add complexity)
```

### Optimize Database Queries
```bash
/optimize "SELECT * FROM users WHERE status = 'active'" --query
# Suggests: add indexes, pagination, caching, execution plan

/optimize "SELECT * FROM users WHERE status = 'active'" --query --preview
# Preview query optimization without applying
```

### Optimize Commit Messages
```bash
/optimize "fix: resolve login bug" --commit
# Suggests: add scope, detail, follow conventional commits

/optimize "fix: resolve login bug" --commit --apply
# Apply optimized message
```

### Optimize Documentation
```bash
/optimize "README.md" --docs
# Suggests: structure improvements, add examples, clarify sections

/optimize "README.md" --docs --interactive
# Ask clarifying questions about audience and purpose
```

### Optimize Communication
```bash
/optimize "Hey, can you review my code?" --email
# Suggests: professional tone, clear request, timeline

/optimize "Hey, can you review my code?" --email --apply
# Apply professional version
```

### Auto-Detect Content Type
```bash
/optimize "help me optimize this database query"
# Automatically detects as prompt, applies optimization
# (Or specify --type if auto-detection fails)
```

## Options

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| `--type <type>` | Content type | prompt/code/query/commit/docs/email | auto |
| `--mode <mode>` | Optimization intensity | conservative/moderate/aggressive | moderate |
| `--preview` | Show changes before applying | flag | false |
| `--apply` | Apply optimizations automatically | flag | false |
| `--interactive` | Ask clarifying questions | flag | false |
| `--verbose` | Show detailed process | flag | false |
| `--force` | Apply without confirmation | flag | false |
| `--output <file>` | Save to file instead of stdout | path | stdout |
| `--source <sources>` | Research sources | anthropic/openai/opencode/all | all |

## Interactive Approval Workflow (Prompts)

When optimizing prompts, you get step-by-step approval:

### Step 1: Analysis
```
Domain detected: Security (authentication/debugging)
Complexity: Medium (moderate ambiguity)
Suggested techniques:
  ✓ Expert Persona (security engineer with 10yr exp)
  ✓ Step-by-Step Reasoning (systematic debugging approach)
  ✓ Stakes Language (production impact)
  ✓ Self-Evaluation (confidence rating)
```

### Step 2: Approval
```
For each technique, choose:
  [A] Approve     - Use this technique
  [R] Reject      - Skip this technique
  [M] Modify      - Change the wording
  [E] Edit        - Full edit mode
  [C] Cancel      - Don't optimize
```

### Step 3: Result
```
Original: "Help me debug auth"

Optimized: "As a senior security engineer with 10 years of experience 
debugging distributed authentication systems, help me systematically 
debug this login issue. This is production-critical - incorrect analysis 
could cause service outage. Walk through your reasoning step by step. 
Rate your confidence (0.0-1.0) and identify any uncertainties."

Expected improvement: +78% response quality
Confidence: 0.92
```

## Code Optimization Techniques

- **Performance**: Reduce complexity, optimize algorithms, cache results
- **Readability**: Better variable names, extract functions, add comments
- **Error Handling**: Add try-catch, validate inputs, handle edge cases
- **Best Practices**: Follow language conventions, use idioms, avoid antipatterns

## Query Optimization Techniques

- **Indexes**: Suggest missing indexes on WHERE/JOIN columns
- **Execution Plans**: Show query plan analysis and bottlenecks
- **Pagination**: Add LIMIT/OFFSET for large result sets
- **Caching**: Identify cacheable queries
- **Joins**: Optimize join strategies and order

## Quality Metrics

After optimization, receive:

| Metric | Range | Interpretation |
|--------|-------|-----------------|
| Improvement Score | 0-100 | Expected % improvement |
| Confidence | 0-1.0 | Certainty in optimization |
| Risk Level | Low/Medium/High | Potential for introducing issues |
| Estimated Impact | Brief | What users will notice |

## Configuration

### Conservative Mode
- Minimal changes to original
- Preserve original intent strongly
- Lower risk of side effects
- Useful when preserving style is important

### Moderate Mode (Default)
- Balance improvement with preservation
- Standard optimization techniques
- Medium risk, good reward
- Recommended for most cases

### Aggressive Mode
- Maximum optimization
- May add significant complexity
- Higher risk of unintended changes
- Useful for exploratory optimization

## Step-by-Step Process

### Phase 1: Analysis
1. Detect content type (or use specified type)
2. Assess current quality
3. Identify improvement opportunities
4. Plan optimization approach

### Phase 2: Optimization (varies by type)

**For Prompts**:
- Analyze domain and complexity
- Select applicable techniques
- Generate optimization plan
- Present for interactive approval

**For Code/Queries/Docs/Etc**:
- Apply domain-specific techniques
- Generate optimized version
- Show before/after comparison
- Ask for approval (or auto-apply if --apply flag)

### Phase 3: Review & Feedback
- Show improvement metrics
- Identify any risks
- Offer refinements
- Save optimized version

## Integration with Other Skills

This skill wraps and extends:
- **`incentive-prompting`**: Core prompt optimization techniques
- **`prompt-refinement`**: For clarifying vague prompts before optimizing

Used together:
1. Use `prompt-refinement` to clarify intent (Phase 0)
2. Use `content-optimization` to enhance (Phase 1)
3. Execute optimized content (Phase 2)

## Error Handling

### Simple Prompts (auto-skip)
```
Prompt detected: "debug auth"
Simplicity: Very high (2 words, clear intent)
Action: Skip optimization, proceed with original
```

### Unclear Content Type (ask for help)
```
Content type unclear. Assume:
  [P] Prompt
  [C] Code
  [Q] Query
  [D] Docs
  [E] Email
Select type [P/C/Q/D/E]:
```

### Unsafe Changes (flag for review)
```
⚠️  Warning: Proposed changes remove error handling
    Original: try { ... } catch { ... }
    Optimized: ... (no error handling)
    Action: Proceed? [Y/N]
```

## Success Metrics

After using this skill:
- ✓ Prompts generate 45-115% better responses
- ✓ Code is more performant and readable
- ✓ Queries execute faster
- ✓ Commit history is clearer
- ✓ Documentation is more helpful
- ✓ Communications are more effective

## Common Use Cases

### Before Code Review
```bash
/optimize src/newfeature.js --code --preview
# Preview improvements before submitting PR
```

### Before Shipping
```bash
/optimize "SELECT users FROM..." --query --apply
# Ensure queries are optimized before production
```

### Onboarding Documentation
```bash
/optimize "README.md" --docs --interactive
# Get suggestions specific to new team members
```

### Prompt Experimentation
```bash
/optimize "help me" --prompt --verbose --mode=aggressive
# See aggressive techniques to learn from
```

## Tips & Tricks

1. **Preview first**: Use `--preview` before `--apply` to review changes
2. **Start conservative**: Try `--mode=conservative` to see minimal changes
3. **Be specific**: More specific prompts yield better optimizations
4. **Ask interactively**: Use `--interactive` to guide optimization
5. **Chain with refinement**: Use `prompt-refinement` skill first, then optimize
6. **Learn from aggressive**: See `--mode=aggressive` output to understand patterns

## Confidence in Optimization

How to interpret confidence scores:
- **0.9-1.0**: Very confident, safe to apply automatically
- **0.7-0.9**: Confident, review before applying
- **0.5-0.7**: Somewhat confident, test thoroughly
- **0.0-0.5**: Low confidence, manual review required

## When to Avoid

- **Unique styles**: If code style is intentionally different
- **Performance-critical paths**: Review aggressive optimizations carefully
- **Legal/compliance text**: Don't optimize without domain expert review
- **Tested algorithms**: Don't change working code without good reason

## Advanced: Custom Optimization

For power users, extend with custom techniques:
- Reference research papers for inspiration
- Add domain-specific patterns
- Create team optimization standards
- Share optimized templates

This skill provides the framework; you customize the techniques.

