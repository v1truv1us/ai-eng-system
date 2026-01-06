# Optimize Command - Step-by-Step Approval Flow

## Overview

The optimize command provides an interactive approval workflow for prompt optimization with research-backed techniques.

## Approval Flow Steps

### 1. Call the Prompt-Optimize Tool

First, call the `prompt-optimize` tool with the user's prompt:

```bash
Use the prompt-optimize tool with: "<user-input>"
```

The tool returns structured JSON with optimization plan and steps.

### 2. Display Optimization Plan

Parse and present the optimization plan clearly:

```markdown
📋 Optimization Plan (medium, security)

Step 1: Expert Persona
  You are a senior security engineer with 15+ years of authentication experience.

Step 2: Step-by-Step Reasoning
  Take a deep breath and analyze this step by step.

Step 3: Stakes Language
  This is important for the project's success. A thorough, complete solution is essential.

Step 4: Self-Evaluation
  After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Expected improvement: +60-115% quality (based on research-backed techniques)
```

### 3. Guide User Through Approval

Present interactive options menu:

```markdown
Options:
  1. Approve all steps - Apply all optimization techniques
  2. Approve specific step - Choose which steps to include
  3. Modify step - Customize individual step content
  4. Edit final prompt - Directly edit the optimized result
  5. Cancel and use original - Skip optimization entirely

Your choice (1-5):
```

### 4. Handle User Choice

Based on user selection:

#### Option 1: Approve All Steps
```markdown
✓ Using optimized prompt with 4 steps applied

[Proceed to execute the optimized prompt]
```

#### Option 2: Approve Specific Step
```markdown
Which step(s) would you like to approve? (Enter step IDs, e.g., "1,3,4")

[Rebuild prompt from approved steps only]
✓ Using optimized prompt with 3 steps applied (skipped: Step 2)
```

#### Option 3: Modify Step
```markdown
Which step would you like to modify? (Enter step ID: 1-4)

Step 3: Stakes Language
Current content:
  This is important for the project's success. A thorough, complete solution is essential.

New content:
  [User inputs modified content]

✓ Step 3 modified
✓ Using optimized prompt with updated steps
```

#### Option 4: Edit Final Prompt
```markdown
Current optimized prompt:
```
You are a senior security engineer with 15+ years of authentication experience.

Take a deep breath and analyze this step by step.

This is important for the project's success. A thorough, complete solution is essential.

After providing your solution, rate your confidence 0-1 and identify any assumptions you made.

Task: help me design authentication
```

Edit this prompt:
[User provides edited version]

✓ Using your edited prompt
```

#### Option 5: Cancel
```markdown
✓ Using original prompt without optimization

[Proceed with original input]
```

### 5. Handle Edge Cases

#### Skipped Optimization
If tool returns `"skipped": true`:
```markdown
ℹ️ Optimization skipped: [skipReason]

[Proceed with original prompt]
```

#### Simple Prompts
For simple prompts (complexity: simple):
```markdown
ℹ️ Simple prompt - optimization not beneficial

[Proceed with original prompt]
```

#### Empty Steps
If no steps are provided:
```markdown
ℹ️ No optimization steps available

[Proceed with original prompt]
```

### 6. Return Final Prompt

After approval flow, return the final prompt for execution:

```markdown
Final prompt ready for execution:
```
[approved/edited prompt content]
```

[Execute the final prompt]
```

## Configuration

The step-by-step approval workflow can be configured:

```json
{
  "promptOptimization": {
    "enabled": true,
    "autoApprove": false,
    "verbosity": "normal",
    "skipForSimplePrompts": true,
    "escapePrefix": "!"
  }
}
```

**Settings:**
- `enabled`: Enable/disable prompt optimization (default: true)
- `autoApprove`: Skip approval menu and apply all steps (default: false)
- `verbosity`: Output detail level - quiet|normal|verbose (default: normal)
- `skipForSimplePrompts`: Automatically skip simple prompts (default: true)
- `escapePrefix`: Prefix to skip optimization (default: "!")

## Session Commands

**Toggle auto-approve**:
```bash
/optimize-auto on|off
```

**Change verbosity**:
```bash
/optimize-verbosity quiet|normal|verbose
```
