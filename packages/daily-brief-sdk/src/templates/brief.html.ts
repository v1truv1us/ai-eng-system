/**
 * HTML brief template. Built as a TS module so the html`` tag does the
 * escaping for us — anything interpolated through {{escaped}} flows
 * through `escapeHtml`. Template parts (the static markup) pass through
 * verbatim.
 *
 * Why a TS module instead of a .html file? Two reasons:
 *  1. The `html` tagged template is impossible to bypass at the call
 *     site — there's no string concatenation path that compiles.
 *  2. We get type-checking on the brief shape against the schema.
 */

import type {
    BriefItem,
    CalendarEvent,
    Risk,
    SourceStatus,
    TomorrowBrief,
} from "../shared/brief-schema.js";
import { escapeHtml, html } from "../shared/html-escape.js";

function renderItem(item: BriefItem): string {
    const link = item.url
        ? html`<a href="${item.url}">${item.title}</a>`
        : html`${item.title}`;
    const why = item.why ? html`<div class="why">${item.why}</div>` : "";
    return `<li>${link}${why}</li>`;
}

function renderEvent(ev: CalendarEvent): string {
    return html`<li><strong>${ev.title}</strong> <span class="when">${ev.start}–${ev.end}</span></li>`;
}

function renderRisk(r: Risk): string {
    return html`<li class="risk-${r.severity}"><strong>${r.severity.toUpperCase()}</strong>: ${r.title}</li>`;
}

function renderSources(sources: Record<string, SourceStatus>): string {
    const rows = Object.entries(sources)
        .map(([name, status]) => {
            const note = status.note ? `: ${status.note}` : "";
            return html`<li class="source-${status.status}">${name} — ${status.status}${note}</li>`;
        })
        .join("");
    return rows;
}

function section(label: string, body: string, count?: number): string {
    const open = count !== undefined && count > 0 ? " open" : "";
    const heading = count !== undefined ? `${escapeHtml(label)} (${count})` : escapeHtml(label);
    return `<details${open}><summary>${heading}</summary>${body}</details>`;
}

function listOr(items: string[], emptyMessage: string): string {
    if (items.length === 0) return `<p class="empty">${escapeHtml(emptyMessage)}</p>`;
    return `<ul>${items.join("")}</ul>`;
}

export function renderTomorrowBrief(brief: TomorrowBrief): string {
    const startBody = listOr(brief.startFreshOn.map(renderItem), "no fresh starts");
    const carryBody = listOr(brief.carryovers.map(renderItem), "no carryovers");
    const skipBody = listOr(brief.skipOrNoise.map(renderItem), "nothing to skip");
    const calBody = listOr(brief.calendar.map(renderEvent), "no calendar configured");
    const riskBody = listOr(brief.risks.map(renderRisk), "no risks flagged");
    const sourcesBody = `<ul class="sources">${renderSources(brief.sources)}</ul>`;

    const generatedAt = escapeHtml(brief.generatedAt);
    const forDate = escapeHtml(brief.forDate);

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Tomorrow brief — ${forDate}</title>
<style>
body{font:15px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:800px;margin:24px auto;padding:0 16px;color:#222}
h1{margin:0 0 4px}
.meta{color:#666;font-size:13px;margin-bottom:24px}
details{border:1px solid #e0e0e0;border-radius:6px;padding:12px 14px;margin:8px 0;background:#fafafa}
details[open]>summary{margin-bottom:8px;border-bottom:1px solid #e0e0e0;padding-bottom:6px}
summary{cursor:pointer;font-weight:600}
ul{padding-left:20px;margin:6px 0}
li{margin:3px 0}
.why{color:#666;font-size:13px;margin-top:2px}
.empty{color:#999;font-style:italic;margin:6px 0}
.sources li{font-family:ui-monospace,monospace;font-size:13px}
.source-ok{color:#0a7}
.source-degraded{color:#c80}
.source-unavailable{color:#c00}
.risk-high{color:#c00;font-weight:600}
.risk-medium{color:#c80}
.risk-low{color:#888}
.when{color:#888;font-size:13px}
</style>
</head>
<body>
<h1>Tomorrow — ${forDate}</h1>
<p class="meta">generated ${generatedAt}</p>
${section("Start fresh on", startBody, brief.startFreshOn.length)}
${section("Carryovers", carryBody, brief.carryovers.length)}
${section("Skip / noise", skipBody, brief.skipOrNoise.length)}
${section("Calendar", calBody, brief.calendar.length)}
${section("Risks", riskBody, brief.risks.length)}
${section("Sources", sourcesBody, Object.keys(brief.sources).length)}
</body>
</html>
`;
}
