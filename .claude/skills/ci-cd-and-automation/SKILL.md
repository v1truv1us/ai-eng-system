---
name: ci-cd-and-automation
description: Shift Left, Faster is Safer, feature flags, quality gate pipelines, failure feedback loops. Use when setting up or modifying build and deploy pipelines.
---

# CI/CD and Automation

## Overview

Build and deployment pipelines should enforce quality automatically. Apply Shift Left principles (catch issues early), use feature flags for safe releases, and make the pipeline the authority on whether code is ready to ship.

## When to Use

- Setting up CI/CD for a new project
- Modifying existing build or deploy pipelines
- Adding quality gates or automated checks
- Troubleshooting pipeline failures

## Core Principles

### Shift Left

Catch issues as early as possible:
- Lint and format on save or pre-commit
- Run type checks locally before push
- Run unit tests on every push
- Run integration tests on every PR
- Run security scans on merge to main

### Faster is Safer

Small, frequent deployments are safer than large, infrequent ones:
- Automate the deployment process completely
- Make rollbacks trivial
- Deploy to staging automatically on merge
- Deploy to production with a single approval or automatically

### Feature Flags

Use feature flags for:
- Incomplete features merged to main
- A/B testing and gradual rollouts
- Kill switches for new functionality
- Environment-specific behavior

### Quality Gate Pipeline

Standard pipeline stages:
1. Lint and format check
2. Type check
3. Unit tests with coverage
4. Build
5. Integration tests
6. Security scan
7. Deploy to staging
8. Smoke tests
9. Deploy to production

## Process

### Step 1: Define Pipeline Stages

- List all automated checks the project needs
- Order them fastest-failing-first
- Ensure each stage has clear pass/fail criteria

### Step 2: Implement Fast Feedback

- Ensure lint and type checks run in under 30 seconds
- Ensure unit tests run in under 2 minutes
- Provide clear error output for each failure

### Step 3: Add Deployment Automation

- Automated staging deployment on merge
- Automated production deployment with approval gate
- Rollback procedure that can execute in under 1 minute

### Step 4: Monitor Pipeline Health

- Track build success rates
- Track mean time to recovery from failures
- Alert on pipeline failures that block merges

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The pipeline can be fixed later" | Broken pipelines encourage bypassing them, which defeats their purpose. |
| "Full automation is too much work" | Manual deployment is slower, more error-prone, and harder to audit. |
| "Feature flags add complexity" | Feature flags add controlled complexity that prevents uncontrolled deployment risk. |

## Verification

- [ ] Pipeline runs on every push and PR
- [ ] Fastest checks run first
- [ ] Each stage has clear pass/fail criteria
- [ ] Deployment is fully automated
- [ ] Rollback takes under 1 minute
