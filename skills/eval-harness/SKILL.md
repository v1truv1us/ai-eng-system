---
name: eval-harness
description: Agent evaluation framework. Measure agent performance, identify weaknesses, and track improvement over time. Use when assessing agent quality, comparing approaches, or validating changes.
metadata:
  category: model-invoked
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
# Eval Harness

## Overview

A systematic framework for evaluating agent performance. Measures accuracy, efficiency, and reliability across defined test scenarios. Enables data-driven decisions about agent quality and improvement.

## When to Use

- Before deploying agent changes to production
- Comparing different agent configurations
- Identifying weaknesses in agent behavior
- Tracking agent quality over time
- Validating prompt improvements

## Evaluation Dimensions

### 1. Accuracy
Does the agent produce correct outputs?

| Metric | Measurement | Target |
|--------|------------|--------|
| Task completion | % of tasks completed correctly | > 90% |
| Code correctness | % of generated code that compiles and passes tests | > 85% |
| Instruction following | % of instructions followed exactly | > 95% |

### 2. Efficiency
Does the agent use resources well?

| Metric | Measurement | Target |
|--------|------------|--------|
| Token usage | Tokens consumed per task | Minimize |
| Tool calls | Number of tool calls per task | Minimize |
| Time to completion | Wall clock time per task | Minimize |

### 3. Reliability
Does the agent behave consistently?

| Metric | Measurement | Target |
|--------|------------|--------|
| Reproducibility | Same input → same output | > 95% |
| Error rate | % of runs that fail | < 5% |
| Recovery rate | % of errors recovered from | > 80% |

## Evaluation Process

### Step 1: Define Test Cases
Create test cases that cover:
- Happy path (expected behavior)
- Edge cases (unusual inputs)
- Error cases (invalid inputs)
- Ambiguous cases (unclear requirements)

### Step 2: Run Evaluation
Execute each test case and record:
- Input provided
- Expected output
- Actual output
- Pass/fail
- Token usage
- Time taken
- Tool calls made

### Step 3: Analyze Results
Calculate metrics:
- Overall pass rate
- Per-category pass rates
- Token efficiency
- Error patterns
- Improvement areas

### Step 4: Report Findings
```
## Eval Results

### Summary
- Test cases: N
- Pass rate: X%
- Average tokens: N
- Average time: Xs

### By Category
| Category | Pass Rate | Issues |
|----------|-----------|--------|
| Accuracy | X% | [list] |
| Efficiency | X% | [list] |
| Reliability | X% | [list] |

### Recommendations
1. [Specific improvement]
2. [Specific improvement]
```

## Benchmark Scenarios

### Code Generation
```
Input: "Write a function that sorts an array using quicksort"
Expected: Correct implementation with proper edge cases
Metrics: Compiles, passes tests, follows conventions
```

### Code Review
```
Input: [Code with intentional bugs]
Expected: Identifies all bugs with severity labels
Metrics: Recall (bugs found), Precision (false positives)
```

### Debugging
```
Input: [Error message + relevant code]
Expected: Correct root cause and fix
Metrics: Accuracy of diagnosis, correctness of fix
```

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I can tell it's working by looking" | Human judgment is biased and inconsistent. Metrics provide objective measurement. |
| "Evals take too much time" | Automated evals run in parallel. The time investment prevents production failures. |
| "One test case is enough" | Single tests don't reveal patterns. Multiple cases across categories provide confidence. |
| "The agent passed last time" | Regression happens. Regular evals catch quality drift before it reaches production. |
