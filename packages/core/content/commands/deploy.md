---
name: ai-eng/deploy
description: Pre-deployment verification and Coolify deployment
agent: build
subtask: true
---

# Deploy Command

Run pre-deployment verification and prepare for Coolify deployment.

 approach deployment systematically. Verify all checks, prepare configuration, and ensure proper monitoring before going live.

## Why This Matters

Deployment failures wake people at 3AM. Missing pre-deployment checks lead to production outages. Poor monitoring configuration hides problems until users report them. This deployment task is critical for maintaining stable, reliable production systems.

## The Challenge

The deploy with confidence without skipping important checks. The challenge is balancing deployment speed with thorough verification, ensuring all risks are identified and mitigated. Success means deployment succeeds cleanly, application performs as expected, and monitoring catches any issues before users are impacted.

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

After completing deployment, rate your confidence in production readiness (0.0-1.0). Identify any uncertainties about deployment configuration, potential monitoring gaps, or areas where rollback plans may be insufficient. Note any deployment risks that remain or post-deploy issues observed.