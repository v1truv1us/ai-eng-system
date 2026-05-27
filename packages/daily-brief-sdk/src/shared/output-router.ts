/**
 * Routes a finished brief to its on-disk HTML file and (optionally) email.
 * Pure function over fs + email transport seams; no MCP, no Jira here.
 */

import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
    BRIEFS_OUTPUT_DIR,
    briefHtmlPath,
    type WorkflowName,
} from "./paths.js";
import type { TomorrowBrief } from "./brief-schema.js";
import { renderTomorrowBrief } from "../templates/brief.html.js";
import type { EmailTransport } from "./email.js";

export interface OutputResult {
    htmlPath: string;
    emailed: boolean;
}

export interface RouteOptions {
    workflow: WorkflowName;
    brief: TomorrowBrief;
    transport?: EmailTransport;
    /** When true, render but do not write or email. */
    dryRun?: boolean;
    /** Override the output directory (used by tests). */
    outputDir?: string;
}

export async function routeBrief(opts: RouteOptions): Promise<OutputResult> {
    const html = renderTomorrowBrief(opts.brief);
    const outputDir = opts.outputDir ?? BRIEFS_OUTPUT_DIR;
    const path = opts.outputDir
        ? `${opts.outputDir.replace(/\/$/, "")}/${opts.workflow}-${opts.brief.forDate}.html`
        : briefHtmlPath(opts.workflow, opts.brief.forDate);

    if (opts.dryRun) {
        return { htmlPath: path, emailed: false };
    }

    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, html, { encoding: "utf-8" });

    let emailed = false;
    if (opts.transport) {
        await opts.transport.send({
            subject: `${opts.workflow} brief — ${opts.brief.forDate}`,
            html,
        });
        emailed = true;
    }

    void outputDir;
    return { htmlPath: path, emailed };
}
