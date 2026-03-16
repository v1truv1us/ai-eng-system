# Phase 2: Meta-Validation Implementation Plan

**Status**: Draft
**Created**: 2025-12-06
**Estimated Effort**: 12 hours
**Complexity**: High

## Overview

Implement meta-validation to ensure the LLM-as-judge evaluation system is trustworthy. This involves creating human gold standards, calculating Cohen's Kappa for inter-rater agreement, testing for positional bias, and validating self-consistency. The goal is to achieve κ ≥ 0.60 (substantial agreement) between LLM and human evaluations.

## Success Criteria

- [ ] Human gold standard ratings collected for 10+ diverse tasks
- [ ] Cohen's Kappa calculation implemented (κ ≥ 0.60 target)
- [ ] Positional bias testing shows no significant preference
- [ ] Self-consistency validation with temperature > 0
- [ ] Meta-validation report with confidence intervals
- [ ] LLM-as-judge reliability established

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Human Gold      │───▶│ Cohen's Kappa    │───▶│ Bias Testing     │
│ Standard        │    │ Calculation      │    │ (Positional)     │
│ (10+ samples)   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Self-           │    │ Confidence       │    │ Meta-Validation │
│ Consistency     │    │ Intervals        │    │ Report          │
│ (Temp > 0)      │    │ (BCa Bootstrap)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Phase 2: Meta-Validation Implementation

**Goal**: Validate that LLM-as-judge evaluations are trustworthy and reliable
**Duration**: 12 hours

### Task 2.1: Create Human Gold Standard Dataset
- **ID**: META-002-A
- **Depends On**: None
- **Files**:
  - `benchmarks/validation/gold_standard.json` (create)
  - `benchmarks/tasks/` (select 10 diverse samples)
  - `benchmarks/validation/human_ratings.py` (create)
- **Acceptance Criteria**:
  - [ ] 10 diverse benchmark tasks selected across all categories
  - [ ] Human ratings collected for baseline vs enhanced pairs
  - [ ] All 5 G-Eval dimensions rated (accuracy, completeness, clarity, actionability, relevance)
  - [ ] Ratings include confidence scores (0-1)
  - [ ] Inter-rater agreement calculated if multiple humans
- **Time**: 4 hours
- **Complexity**: Medium

### Task 2.2: Implement Cohen's Kappa Calculation
- **ID**: META-002-B
- **Depends On**: META-002-A
- **Files**:
  - `benchmarks/validation/kappa_analysis.py` (create)
  - `benchmarks/harness/analyzer.py` (modify - add kappa method)
- **Acceptance Criteria**:
  - [ ] Cohen's Kappa calculation implemented for ordinal scales
  - [ ] Weighted kappa for 1-5 scale ratings
  - [ ] Confidence intervals calculated using bootstrap
  - [ ] κ ≥ 0.60 achieved (substantial agreement threshold)
  - [ ] Agreement statistics by dimension and overall
- **Time**: 3 hours
- **Complexity**: Medium

### Task 2.3: Implement Positional Bias Testing
- **ID**: META-002-C
- **Depends On**: META-002-B
- **Files**:
  - `benchmarks/validation/bias_test.py` (create)
  - `benchmarks/evaluation/runner.py` (modify - add randomization)
- **Acceptance Criteria**:
  - [ ] Response order randomization implemented
  - [ ] Bias detection test runs on gold standard
  - [ ] Statistical test for positional preference (p > 0.05)
  - [ ] Consistency check (same pair rated same way twice)
  - [ ] Bias mitigation strategies documented
- **Time**: 3 hours
- **Complexity**: Medium

### Task 2.4: Implement Self-Consistency Validation
- **ID**: META-002-D
- **Depends On**: META-002-C
- **Files**:
  - `benchmarks/validation/consistency_test.py` (create)
  - `benchmarks/evaluation/runner.py` (modify - add temperature control)
- **Acceptance Criteria**:
  - [ ] Temperature > 0 evaluations collected (3x per sample)
  - [ ] Intra-LLM agreement calculated (correlation between runs)
  - [ ] Variance within acceptable bounds (< 0.5 SD difference)
  - [ ] Self-consistency report generated
  - [ ] Temperature impact analysis
- **Time**: 2 hours
- **Complexity**: Low

## Dependencies

- Human evaluators (for gold standard creation)
- Existing evaluation pipeline (from Phase 1)
- Statistical libraries: scipy, numpy, scikit-learn
- Bootstrap resampling for confidence intervals

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low inter-rater agreement (κ < 0.60) | High | Medium | Use multiple human raters, calculate weighted kappa |
| Positional bias detected | Medium | Low | Implement randomization, test mitigation strategies |
| Self-consistency issues | Medium | Low | Adjust temperature, use majority voting |
| Human rating fatigue | Low | Medium | Limit to 10 samples, provide clear guidelines |
| Statistical analysis errors | Medium | Low | Peer review calculations, use established methods |

## Testing Plan

### Unit Tests
- [ ] Cohen's Kappa calculation functions
- [ ] Bootstrap confidence interval methods
- [ ] Positional bias detection algorithms
- [ ] Self-consistency correlation measures

### Integration Tests
- [ ] Complete meta-validation pipeline end-to-end
- [ ] Gold standard data loading and validation
- [ ] Statistical analysis integration
- [ ] Report generation with all metrics

### Manual Testing
- [ ] Review human ratings for consistency
- [ ] Verify statistical calculations manually
- [ ] Check confidence intervals are reasonable
- [ ] Validate bias detection logic

## Rollback Plan

1. **Individual Components**: Each validation method can be disabled independently
2. **Statistical Methods**: Can fall back to simpler agreement metrics if kappa fails
3. **Gold Standard**: Can use subset of data if full validation is problematic
4. **Bias Testing**: Can skip if positional bias is not detected
5. **Self-Consistency**: Can use temperature=0 if consistency issues arise

## References

- [Cohen's Kappa Wikipedia](https://en.wikipedia.org/wiki/Cohen%27s_kappa)
- [G-Eval Paper (arxiv:2303.16634)](https://arxiv.org/abs/2303.16634)
- [Inter-rater Reliability Guidelines](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3402032/)
- [Bootstrap Confidence Intervals](https://en.wikipedia.org/wiki/Bootstrapping_(statistics))</content>
<parameter name="filePath">plans/2025-12-06-phase2-meta-validation.md