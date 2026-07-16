---
name: ai-eng/deploy
description: Pre-deployment verification and Coolify deployment
agent: build
subtask: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Deploy Command

Run pre-deployment verification and prepare for Coolify deployment.

## Pre-flight Checks

- [ ] All tests pass
- [ ] Type checks pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Performance benchmarks acceptable

## Coolify Deployment

Provide deployment instructions for Coolify including:
- Application configuration
- Environment variable setup
- Domain/SSL configuration
- Health check endpoints

## Post-Deploy Verification

- [ ] Application accessible
- [ ] Health checks passing
- [ ] Logs showing normal operation
- [ ] Key user flows working
