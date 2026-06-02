// Shared types for ud-audit-agent

export interface Site {
  id: string;
  name: string;
  url: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  auditPath: string;
}

export type JobStatus = "pending" | "claimed" | "running" | "completed" | "failed" | "retrying";

export interface Job {
  id: string;
  siteId: string;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  nextRetryAt: string | null;
  error: string | null;
  auditMonth: string; // YYYY-MM
}

export type Severity = "critical" | "warning" | "info";

export interface AuditFinding {
  rule: string;
  severity: Severity;
  description: string;
  url?: string;
  element?: string;
  score?: number;
}

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

export interface LighthouseResult {
  formFactor: "mobile" | "desktop";
  scores: LighthouseScore;
  findings: AuditFinding[];
  rawUrl?: string;
}

export interface SeoResult {
  findings: AuditFinding[];
  metaTags: Record<string, string>;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  structuredDataValid: boolean;
}

export interface A11yResult {
  findings: AuditFinding[];
  totalViolations: number;
  totalPasses: number;
}

export interface DependencyInfo {
  name: string;
  current: string;
  latest: string;
  type: "patch" | "minor" | "major";
  isSafeUpdate: boolean;
}

export interface DependencyResult {
  findings: AuditFinding[];
  dependencies: DependencyInfo[];
  safeUpdates: DependencyInfo[];
}

export interface AuditResult {
  siteId: string;
  auditMonth: string;
  timestamp: string;
  lighthouse: {
    mobile: LighthouseResult | null;
    desktop: LighthouseResult | null;
  };
  seo: SeoResult | null;
  a11y: A11yResult | null;
  dependencies: DependencyResult | null;
  error: string | null;
}

export interface Fix {
  type: string;
  description: string;
  filePath: string;
  severity: Severity;
  applied: boolean;
  error?: string;
}

export interface JobProcessorResult {
  jobId: string;
  siteId: string;
  success: boolean;
  auditResult: AuditResult | null;
  fixesApplied: Fix[];
  prUrl: string | null;
  error: string | null;
}

export interface ServiceConfig {
  sites: Site[];
  github: {
    token: string;
    defaultPrBranch: string;
  };
  sentry: {
    dsn: string | null;
  };
  server: {
    port: number;
    host: string;
  };
  cron: {
    schedule: string;
    enabled: boolean;
  };
  workDir: string;
  maxRetries: number;
  retryBackoffMs: number;
}
