# skills-gtm Advisory — 2026-07-17

**Scope:** 205 vendored LeadMagic skills in `skills-gtm/` (opt-in, gitignored; copied into `skills/gtm/` by `scripts/install-gtm-skills.sh`). **Advisory only — no deletions.** This catalog is vendored from an upstream repo; pruning it here would be overwritten on the next `vendor-gtm-skills.sh` sync. Recommendations are for *how to install selectively* and *what to fork/collapse if maintained locally*.

## Headline

| Verdict | Count | % of 205 |
|---|---:|---:|
| **KEEP** (tool/API/vendor-specific) | 33 | 16% |
| **RETEST** (tool-flavored, fast-dating) | 16 | 8% |
| **RETIRE** (public-knowledge / redundant) | 156 | 76% |

~4 out of 5 vendored skills restate public GTM/sales/marketing/legal/finance frameworks (SPIN, MEDDICC, SPICED, SaaStr, Damodaran DCF, AICPA SOC 2, YC SAFE, etc.) that frontier models already produce well.

## KEEP core (33) — install these by default

The genuine value: proprietary product knowledge the model can't reproduce. Concentrated in 6 categories.

- **leadmagic/ (6):** `leadmagic-cli`, `leadmagic-mcp`, `leadmagic-bulk-enrichment`, `leadmagic-job-change`, `leadmagic-waterfall`, `leadmagic-integrations` — real CLI syntax, credit costs (1cr find/verify, 2cr enrich), batch sizing, webhook patterns, provider-coverage waterfalls.
- **tools/ (15):** `clay-toolkit`, `clay-loops-toolkit`, `ai-prompts-toolkit`, `n8n-toolkit`, `instantly-sequences`, `smartlead-workflows`, `hubspot-sequences`, `outreach-sequences`, `salesloft-cadences`, `lemlist-setup`, `crm-toolkit`, `leadmagic-toolkit`, `sequencing-toolkit`, `analytics-toolkit`, `support-toolkit` — per-platform feature names, credit models, quirks (Smartlead "open tracking off in 2026", Instantly "26 A/B variants", HubSpot "max 50 contacts/sender").
- **automation/ (5):** `attio-setup` (Attio has no Lead object), `hubspot-setup`, `salesforce-setup`, `clay-automation`, `mcp-setup` (Plain MCP remote URL + OAuth scope).
- **outbound/ (4):** `email-deliverability` (SPF/DKIM/DMARC + `_spf.smartlead.ai` includes, warmup schedule, Postmaster thresholds), `domain-infrastructure`, `inbox-setup`, `sending-platforms`.
- **customer-success/ (2):** `headless-support`, `support-tool-stack`.
- **inbound/ (1):** `website-visitor-identification` (vendor matrix: Clearbit/Breeze, RB2B, 6sense, Demandbase, ZoomInfo, Leadfeeder, Warmly, Koala).

See `reports/skills-gtm-keeplist.txt` for the install list.

## RETEST (16) — re-audit every ~6 months

Tool-flavored but fast-dating (pricing, UI, vendor landscape shift): `crm-integration`, `api-enrichment`, `ai-sdr-setup`, `tool-selection-stack`, `v0-lander`, `vibe-coding`, `ai-video-creation`, `vibe-marketing`, `1p-tagging-pixels`, `deliverability-monitoring`, `event-analytics`, `tracking-plan`, `gtm-spend-management`, `linkedin-algorithm`, `linkedin-live-strategy`, `sales-navigator-prospecting`.

## RETIRE clusters (156) — public-knowledge restatements

Biggest block: **`founder-led/` (41, 100% RETIRE)** — textbook business-school topics (fundraising, financial modeling, SOC 2, legal, equity, hiring, founder brand). Every framework cited is public.

Other near-100% RETIRE categories: `foundation/` (8), `content-seo/` (6), `abm/` (7, ITSMA tiers), `sales-revops/` (8, MEDDICC/SPICED/JOLT), `design/` (7), `analytics/` (9), `gtm-ops/` (4), `growth/` (5), `lifecycle/` (5), `management-leadership/` (5), `product-led-growth/` (3), `partnerships/` (3), `events/` (3), `demand-gen/` (4), `prospecting/` (8, duplicates the leadmagic/tools skills), `sales-plays/` (5), and the methodology half of `outbound/`/`creative/`/`inbound/`/`customer-success/`.

## Redundancy clusters (collapse if forked)

| Cluster | Survivors | Retire rest |
|---|---|---|
| Enrichment/waterfall | `leadmagic-waterfall`, `clay-toolkit` | `waterfall-enrichment`, `data-enrichment-strategy`, `email-finding`, `lead-enrichment` |
| Cold-email infra vs methodology | `email-deliverability`, `sending-platforms`, `domain-infrastructure`, `inbox-setup` | `cold-email-strategy`, `cold-email-copywriting`, `multi-channel-outreach`, `reply-handling`, `cold-calling` |
| ABM | none (all public ITSMA) | all 7 |
| Qualification/sales-process | none (all WbD/MEDDICC/JOLT) | all 8 in `sales-revops/` |
| Signal plays | `leadmagic-job-change` | all `sales-plays/*`, `signal-scoring` |
| SEO/content | none | all `content-seo/*` + `copywriting` |
| Support | `support-tool-stack`, `headless-support` | `support-toolkit` (overlaps) |

## Recommended action

1. **Install selectively.** Use the new `--only` flag on `scripts/install-gtm-skills.sh` (see patch) with `reports/skills-gtm-keeplist.txt` to install just the 33-skill tool core by default, instead of all 205.
2. **Don't maintain the RETIRE 156 locally.** If a framework play is needed, plain prompting produces equivalent output.
3. **If forking:** collapse the redundancy clusters above; the catalog shrinks to ~50 skills with no capability loss.
