---
name: sentry
description: Set up and operate Sentry for error tracking, performance monitoring, and release health. Use for SDK integration, alert tuning, and incident investigation.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Sentry Operations

## Current Versions (Verify Before Use)

Check the [Sentry SDK releases](https://github.com/getsentry/sentry-javascript/releases) for your platform. SDKs follow semver independently.

## Core Principles

1. **Instrument before you need it.** Sentry is most valuable when it's already running before an incident.
2. **Alert on new issues, not total volume.** A spike in errors you've already seen is less actionable than a new error type.
3. **Breadcrumbs tell the story.** Good instrumentation includes HTTP requests, state transitions, and user actions leading to the error.
4. **Performance is part of observability.** Enable distributed tracing to connect frontend errors to backend root causes.

## SDK Integration Checklist

### Error Tracking
- [ ] DSN configured via environment variable (not hardcoded)
- [ ] `release` set to git SHA or version tag
- [ ] `environment` set (production, staging, development)
- [ ] Global error handler captures unhandled exceptions
- [ ] Rejected promises are captured (frontend + backend)
- [ ] Source maps uploaded for JS/TS (enables readable stack traces)

### Performance
- [ ] Tracing enabled with appropriate sample rate
- [ ] Custom spans for critical operations (DB queries, external API calls)
- [ ] Distributed tracing headers propagated between services
- [ ] Database queries auto-instrumented or manually spanned

### Context
- [ ] User ID attached (hashed, not PII)
- [ ] Tags for team/service/component
- [ ] Breadcrumbs for state changes

## Alert Configuration

```javascript
// Example: Alert on new issues in production
// Sentry UI → Alerts → Create Alert Rule
// When: A new issue is created
// If: Environment equals "production"
// Then: Send notification to Slack #alerts
```

**Alert hierarchy:**
1. **New issue in production** → Immediate notification
2. **Issue count > 100/hour** → Page on-call (regression)
3. **Performance regression > 20%** → Slack notification
4. **Release crash rate > 1%** → Block deployment

## Performance Monitoring

### Key Metrics
- **Apdex:** User satisfaction score (0-1)
- **P50/P95/P99 Latency:** Response time distribution
- **Throughput:** Requests per minute
- **Failure Rate:** Error % of total requests

### Custom Spans
```javascript
const span = Sentry.startSpan({ name: 'process-payment' }, () => {
  // critical operation
});
```

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| Hardcoded DSN | Secret exposure, can't rotate per env | Environment variable |
| No source maps | Stack traces are minified gibberish | Upload maps in CI |
| 100% trace sampling | Expensive, unnecessary | 1-10% for high traffic |
| No release association | Can't correlate errors with deployments | Set `release` to git SHA |
| Ignoring caught errors | Silent failures accumulate | Log or capture explicitly |
| PII in context | Privacy violations | Hash IDs, strip emails/phones |

## Troubleshooting Flow

1. **New error spike:** Check release timing → correlate with deployment
2. **Minified stack trace:** Source maps not uploaded or mismatch
3. **Missing errors:** Check filters, sampling rate, DSN correctness
4. **Performance blind spot:** Check trace propagation between services
5. **Alert fatigue:** Review alert rules, add thresholds, use issue states

## Official Resources

- [Sentry docs](https://docs.sentry.io/)
- [JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Performance monitoring](https://docs.sentry.io/product/performance/)
- [Source maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
