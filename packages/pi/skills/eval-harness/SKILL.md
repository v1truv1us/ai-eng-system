---
name: eval-harness
description: Agent evaluation framework. Measure agent performance, identify weaknesses, and track improvement over time. Use when assessing agent quality, comparing approaches, or validating changes.
---

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
