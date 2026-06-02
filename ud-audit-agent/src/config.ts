import { z } from "zod";
import type { Site, ServiceConfig } from "./types.js";

const SiteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  repoUrl: z.string().url(),
  repoOwner: z.string().min(1),
  repoName: z.string().min(1),
  branch: z.string().default("main"),
  auditPath: z.string().default("/"),
});

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_DEFAULT_PR_BRANCH: z.string().default("ud-audit"),
  SENTRY_DSN: z.string().optional(),
  CRON_SCHEDULE: z.string().default("0 0 1 * *"), // midnight on 1st of each month
  CRON_ENABLED: z.coerce.boolean().default(true),
  SITES_CONFIG: z.string().optional(),
  WORK_DIR: z.string().default("/tmp/ud-audit-work"),
  MAX_RETRIES: z.coerce.number().default(3),
  RETRY_BACKOFF_MS: z.coerce.number().default(60000),
});

export type EnvVars = z.infer<typeof EnvSchema>;

function parseSitesConfig(raw: string | undefined): Site[] {
  if (!raw) return [];

  // If it looks like JSON, parse it as an array
  if (raw.trim().startsWith("[")) {
    const parsed = JSON.parse(raw);
    return z.array(SiteSchema).parse(parsed);
  }

  // Otherwise treat as comma-separated site IDs and build from env vars
  // Format: SITE_<ID>_URL, SITE_<ID>_REPO_URL, etc.
  const siteIds = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const sites: Site[] = [];

  for (const id of siteIds) {
    const upper = id.toUpperCase().replace(/-/g, "_");
    const url = process.env[`SITE_${upper}_URL`];
    const repoUrl = process.env[`SITE_${upper}_REPO_URL`];
    const repoOwner = process.env[`SITE_${upper}_REPO_OWNER`];
    const repoName = process.env[`SITE_${upper}_REPO_NAME`];

    if (!url || !repoUrl) {
      continue;
    }

    // Parse owner/name from repo URL if not explicitly set
    let owner = repoOwner;
    let name = repoName;
    if (!owner || !name) {
      const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (match) {
        owner = owner || match[1];
        name = name || match[2];
      }
    }

    if (!owner || !name) {
      continue;
    }

    sites.push({
      id,
      name: process.env[`SITE_${upper}_NAME`] || id,
      url,
      repoUrl,
      repoOwner: owner,
      repoName: name,
      branch: process.env[`SITE_${upper}_BRANCH`] || "main",
      auditPath: process.env[`SITE_${upper}_AUDIT_PATH`] || "/",
    });
  }

  return sites;
}

export function loadConfig(): ServiceConfig {
  const env = EnvSchema.parse(process.env);

  const sites: Site[] = env.SITES_CONFIG
    ? parseSitesConfig(env.SITES_CONFIG)
    : [];

  return {
    sites,
    github: {
      token: env.GITHUB_TOKEN,
      defaultPrBranch: env.GITHUB_DEFAULT_PR_BRANCH,
    },
    sentry: {
      dsn: env.SENTRY_DSN || null,
    },
    server: {
      port: env.PORT,
      host: env.HOST,
    },
    cron: {
      schedule: env.CRON_SCHEDULE,
      enabled: env.CRON_ENABLED,
    },
    workDir: env.WORK_DIR,
    maxRetries: env.MAX_RETRIES,
    retryBackoffMs: env.RETRY_BACKOFF_MS,
  };
}

export function validateConfig(config: ServiceConfig): void {
  if (config.sites.length === 0) {
    throw new Error(
      "No sites configured. Set SITES_CONFIG env var with site IDs, or provide a JSON config.",
    );
  }
  if (!config.github.token) {
    throw new Error("GITHUB_TOKEN is required");
  }
}
