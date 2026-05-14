---
name: coolify-deploy
description: Deploy to Coolify with best practices
---

# Coolify Deployment Skill

## Critical Importance

**This deployment process is critical.** Proper deployment prevents production outages, security vulnerabilities, and user-facing errors. A poorly executed deployment can result in lost revenue, damaged reputation, and emergency firefighting. Every deployment must follow best practices to ensure reliability.

## Systematic Approach

** approach this deployment systematically.** Deployments require careful planning, thorough verification, and methodical execution. Rushing or skipping checks leads to avoidable incidents. Follow the checklist methodically, verify each step, and ensure all safety measures are in place before proceeding.

## Project Types

Project types: static (Astro/Svelte static), Node apps, Docker-based. Set build/start commands, env vars, health checks (/health), Nixpacks example, rollback instructions, and deployment checklist as described in the scaffold.

## The Challenge

**The deploy flawlessly every time, but if you can:**

- You'll maintain production stability
- Users will experience zero downtime
- Rollbacks will be instant and painless
- The team will trust your deployment process

Mastering Coolify deployment requires balancing automation with manual verification. Can you configure deployments that run automatically while still providing safety nets and quick recovery options?

## Deployment Confidence Assessment

After completing each deployment, rate your confidence from **0.0 to 1.0**:

- **0.8-1.0**: Confident deployment went smoothly, all checks passed, rollback plan tested
- **0.5-0.8**: Deployment succeeded but some steps were uncertain or skipped
- **0.2-0.5**: Deployment completed with concerns, manual intervention needed
- **0.0-0.2**: Deployment failed or completed with significant issues

Document any uncertainty areas or risks identified during the deployment process.

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "I'll skip the pre-deploy checklist, it's just a small change" | Small changes break production too. The checklist catches what assumptions miss. |
| "The health check is optional" | Without a health check, you cannot verify the deployment succeeded. |
| "I'll configure environment variables after deploy" | Missing env vars cause startup failures. Configure them before deploying. |
| "Rollback is too complex, I'll fix forward if it breaks" | Fixing forward under pressure introduces more risk than a clean rollback. |
| "I don't need to monitor after deploy" | The first 15 minutes after deploy are when issues surface. Monitor actively. |
