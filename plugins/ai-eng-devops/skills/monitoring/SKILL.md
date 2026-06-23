---
name: monitoring
description: Design and operate application observability with metrics, logs, traces, and alerts. Use for SLO definition, dashboard design, on-call runbooks, and incident response.
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Observability Engineering

## Current Versions (Verify Before Use)

```bash
prometheus --version              # Prometheus server
grafana-server -v                 # Grafana
jaeger --version                  # Jaeger
tempo -version                    # Grafana Tempo
```

## Core Principles

1. **Metrics for symptoms, logs for causes, traces for paths.** Use the right signal for the right question.
2. **Alert on symptoms, not causes.** Alert when users are affected (error rate ↑, latency ↑), not when a CPU metric crosses a threshold.
3. **SLOs define reliability.** Every service has error budget, SLO targets, and explicit consequences for budget exhaustion.
4. **Dashboards are for exploration, not alerting.** If you need a dashboard to know something is wrong, your alerts are wrong.
5. **Observability data is production code.** Instrumentation gets the same review rigor as business logic.

## SLO Design Template

```
Service:    <name>
SLI:        <ratio of good events / total events>
SLO:        <target percentage> (e.g., 99.9%)
Error Budget: 100% - SLO (e.g., 0.1% = 43.8 min/month)
Alerting:
  - Fast burn: 2% budget in 1 hour → page immediately
  - Slow burn: 5% budget in 6 hours → page during business hours
```

**SLI types:**
- Request-based: `good_requests / total_requests` (availability, latency bucket)
- Window-based: `good_time_windows / total_time_windows` (uptime)

## Metric Instrumentation

### RED Method (for services)
- **Rate:** Requests per second
- **Errors:** Error rate (4xx, 5xx as % of total)
- **Duration:** Request latency (p50, p95, p99)

### USE Method (for resources)
- **Utilization:** % of resource used (CPU, memory, disk)
- **Saturation:** Queue length, wait time
- **Errors:** Hardware errors, failed allocations

### The Four Golden Signals
1. Latency
2. Traffic
3. Errors
4. Saturation

## Alert Design Rules

- **Page only when human action is required immediately.** Everything else is a ticket or dashboard note.
- **Every alert has a runbook.** If there's no runbook, there's no alert.
- **Alert fatigue kills observability.** If an alert fires and nobody does anything, delete the alert.
- **Use multi-window, multi-burn-rate alerts.** Single-threshold alerts are noisy.

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| "CPU > 80%" alert | CPU usage is not a user symptom | Alert on latency/error rate, investigate CPU |
| Alerting on every error | Not all errors are user-facing | Alert on error rate, not count |
| No SLOs | No shared definition of "broken" | Define SLIs and SLOs per service |
| Dashboards as primary detection | Reactive, requires human watching | Alert on symptoms, dashboard for diagnosis |
| Missing trace context | Can't correlate logs/metrics/traces | Use trace IDs in all signals |
| Log everything at INFO | Expensive, noisy, hard to query | Structured logs, sampled debug, ERROR for issues |

## Validation Checklist

- [ ] Every service exports RED metrics
- [ ] Every service has defined SLOs with error budgets
- [ ] Every page alert has a tested runbook
- [ ] Alert routing goes to the right team (not a catch-all)
- [ ] Dashboards answer "what happened" and "why" for known failure modes
- [ ] Traces span service boundaries with propagated context
- [ ] Log retention and cost are monitored

## Official Resources

- [Google SRE Book — SLOs](https://sre.google/sre-book/service-level-objectives/)
- [Prometheus best practices](https://prometheus.io/docs/practices/)
- [Grafana alerting docs](https://grafana.com/docs/grafana/latest/alerting/)
- [OpenTelemetry](https://opentelemetry.io/docs/)
- [Jaeger tracing](https://www.jaegertracing.io/docs/)
