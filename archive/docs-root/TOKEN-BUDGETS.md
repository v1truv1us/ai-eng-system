# Token Budget Framework for ai-eng-system

## Overview

This document defines token budgets for all commands and skills in the ai-eng-system. Token budgets help manage API costs and ensure efficient command execution.

## Budget Tiers

| Tier | Max Words | Max Tokens | Use Case |
|------|-----------|-----------|----------|
| **Minimal** | 300 | 400 | Simple utilities, quick references |
| **Small** | 500 | 700 | Basic commands, single-purpose tools |
| **Medium** | 800 | 1,100 | Standard commands, moderate complexity |
| **Large** | 1,500 | 2,000 | Complex commands, multi-phase workflows |
| **Critical** | 3,000+ | 4,000+ | Full-cycle commands, comprehensive guides |

## Command Budgets

### Core Workflow Commands (Phase 1-5)

| Command | Current Words | Budget | Tier | Status |
|---------|--------------|--------|------|--------|
| research.md | 891 | 1,100 | Medium | ✅ Under budget |
| specify.md | 1,584 | 1,500 | Large | ⚠️ Over budget by 84 |
| plan.md | 2,309 | 2,000 | Large | ⚠️ Over budget by 309 |
| work.md | 2,573 | 2,000 | Large | ⚠️ Over budget by 573 |
| review.md | 1,018 | 1,100 | Medium | ✅ Under budget |

### Specialized Commands

| Command | Current Words | Budget | Tier | Status |
|---------|--------------|--------|------|--------|
| ralph-wiggum.md | 2,816 | 3,000 | Critical | ✅ Under budget |
| create-plugin.md | 1,953 | 2,000 | Large | ✅ Under budget |
| recursive-init.md | 1,150 | 1,500 | Large | ✅ Under budget |
| optimize.md | 5,313 | 6,000 | Critical | ✅ Under budget |
| clean.md | 119 | 300 | Minimal | ✅ Under budget |
| deploy.md | 119 | 300 | Minimal | ✅ Under budget |
| seo.md | 126 | 300 | Minimal | ✅ Under budget |
| create-command.md | 151 | 300 | Minimal | ✅ Under budget |
| create-skill.md | 144 | 300 | Minimal | ✅ Under budget |
| create-tool.md | 172 | 300 | Minimal | ✅ Under budget |

## Skill Budgets

| Skill | Current Words | Budget | Tier | Status |
|-------|--------------|--------|------|--------|
| ralph-wiggum/SKILL.md | 1,511 | 1,500 | Large | ⚠️ Over budget by 11 |
| comprehensive-research/SKILL.md | 1,252 | 1,500 | Large | ✅ Under budget |
| text-cleanup/SKILL.md | 1,054 | 1,100 | Medium | ✅ Under budget |
| prompt-refinement/SKILL.md | ~1,200 | 1,500 | Large | ✅ Under budget |
| incentive-prompting/SKILL.md | ~800 | 1,100 | Medium | ✅ Under budget |
| plugin-dev/SKILL.md | ~2,000 | 2,500 | Large | ✅ Under budget |
| git-worktree/SKILL.md | ~600 | 800 | Medium | ✅ Under budget |
| coolify-deploy/SKILL.md | ~700 | 900 | Medium | ✅ Under budget |

## Optimization Targets

### Phase 1: Core Workflow Commands
- **specify.md**: 1,584 → 1,500 words (-84 words)
- **plan.md**: 2,309 → 2,000 words (-309 words)
- **work.md**: 2,573 → 2,000 words (-573 words)
- **Total**: -966 words

### Phase 2: Specialized Commands
- **ralph-wiggum/SKILL.md**: 1,511 → 1,500 words (-11 words)
- **Total**: -11 words

### Phase 3: Skills Optimization
- **comprehensive-research/SKILL.md**: 1,252 → 1,200 words (-52 words)
- **text-cleanup/SKILL.md**: 1,054 → 1,000 words (-54 words)
- **Total**: -106 words

## Validation Rules

1. **No command exceeds its tier budget**
2. **No skill exceeds its tier budget**
3. **Total command words ≤ 25,000**
4. **Total skill words ≤ 15,000**
5. **External documentation doesn't count against budgets**

## Monitoring

### Token Usage Tracking

Track token usage for each command:
```bash
# Measure token usage for a command
/ai-eng/research "test query" --measure-tokens

# Output includes:
# - Input tokens (command + query)
# - Output tokens (response)
# - Total tokens used
# - Budget remaining
```

### Regular Audits

- **Weekly**: Check top 5 most-used commands
- **Monthly**: Full audit of all commands and skills
- **Quarterly**: Review budget tiers and adjust as needed

## Cost Implications

### Token to Cost Conversion

Using Claude 3.5 Sonnet pricing (as of 2024):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

### Budget Impact

| Command | Avg Tokens | Cost per 100 uses |
|---------|-----------|------------------|
| research.md | 1,100 | $0.33 |
| specify.md | 1,500 | $0.45 |
| plan.md | 2,000 | $0.60 |
| work.md | 2,000 | $0.60 |
| review.md | 1,100 | $0.33 |
| ralph-wiggum.md | 3,000 | $0.90 |

## Future Improvements

1. **Implement token measurement** in build process
2. **Add token budgets** to command metadata
3. **Create monitoring dashboard** for token usage
4. **Implement automatic warnings** when budgets exceeded
5. **Establish cost optimization** as part of CI/CD
