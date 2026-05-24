/**
 * Agent Skills open standard — format and validation helpers.
 * @see https://agentskills.io/specification
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import YAML from "yaml";

/** Lowercase alphanumeric segments separated by single hyphens (spec + OpenCode). */
export const SKILL_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SKILL_NAME_MIN_LENGTH = 1;
export const SKILL_NAME_MAX_LENGTH = 64;
export const DESCRIPTION_MIN_LENGTH = 1;
export const DESCRIPTION_MAX_LENGTH = 1024;
export const DESCRIPTION_RECOMMENDED_MIN = 20;
export const COMPATIBILITY_MAX_LENGTH = 500;

/** Required and optional fields defined by agentskills.io */
export const SPEC_FRONTMATTER_FIELDS = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
]);

/** Supported by Claude Code, Cursor, Pi — safe to preserve, ignored elsewhere */
export const EXTENSION_FRONTMATTER_FIELDS = new Set([
    "disable-model-invocation",
    "context",
    "agent",
    "user-invocable",
    "argument-hint",
    "model",
    "effort",
    "hooks",
    "paths",
    "shell",
    "when_to_use",
    "arguments",
]);

/** Legacy ai-eng top-level fields migrated into metadata on format */
export const MIGRATE_TO_METADATA_FIELDS = new Set(["version", "tags"]);

export const ALL_KNOWN_FRONTMATTER_FIELDS = new Set([
    ...SPEC_FRONTMATTER_FIELDS,
    ...EXTENSION_FRONTMATTER_FIELDS,
    ...MIGRATE_TO_METADATA_FIELDS,
]);

export type SkillFrontmatter = Record<string, unknown>;

export type SkillFormatIssue = {
    level: "error" | "warning";
    code: string;
    message: string;
};

export type SkillFormatResult = {
    skillFile: string;
    changed: boolean;
    formatted: string;
    issues: SkillFormatIssue[];
};

export type ParseSkillFileResult = {
    meta: SkillFrontmatter;
    body: string;
    hasFrontmatter: boolean;
};

export function validateSkillName(name: string, filePath: string): void {
    if (
        name.length < SKILL_NAME_MIN_LENGTH ||
        name.length > SKILL_NAME_MAX_LENGTH
    ) {
        throw new Error(
            `Skill name '${name}' must be ${SKILL_NAME_MIN_LENGTH}-${SKILL_NAME_MAX_LENGTH} characters: ${filePath}`,
        );
    }
    if (!SKILL_NAME_REGEX.test(name)) {
        throw new Error(
            `Skill name '${name}' must be lowercase alphanumeric with single hyphens (regex: ${SKILL_NAME_REGEX}): ${filePath}`,
        );
    }
}

export function parseSkillFile(
    markdown: string,
    filePathForErrors: string,
): ParseSkillFileResult {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
        return { meta: {}, body: markdown, hasFrontmatter: false };
    }

    const [, raw, body] = match;
    try {
        const parsed = YAML.parse(raw);
        const meta =
            parsed && typeof parsed === "object" && !Array.isArray(parsed)
                ? (parsed as SkillFrontmatter)
                : {};
        return { meta, body, hasFrontmatter: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(
            `Invalid YAML frontmatter in ${filePathForErrors}: ${message}`,
        );
    }
}

function normalizeDescription(value: unknown): string {
    if (value == null) return "";
    if (Array.isArray(value)) {
        return value
            .map((part) => String(part).trim())
            .filter(Boolean)
            .join(" ");
    }
    return String(value).replace(/\s+/g, " ").trim();
}

function metadataString(value: unknown): string {
    if (value == null) return "";
    if (Array.isArray(value)) {
        return value.map(String).join(", ");
    }
    return String(value);
}

function asMetadataRecord(value: unknown): Record<string, string> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    const out: Record<string, string> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
        if (raw == null) continue;
        out[String(key)] = metadataString(raw);
    }
    return out;
}

function collectMetadata(
    meta: SkillFrontmatter,
    issues: SkillFormatIssue[],
): Record<string, string> | undefined {
    const merged = asMetadataRecord(meta.metadata);

    for (const field of MIGRATE_TO_METADATA_FIELDS) {
        if (meta[field] == null) continue;
        const key = field === "tags" ? "tags" : field;
        if (merged[key] && merged[key] !== metadataString(meta[field])) {
            issues.push({
                level: "warning",
                code: "metadata-overwrite",
                message: `metadata.${key} already set; legacy '${field}' value was merged`,
            });
        }
        merged[key] = metadataString(meta[field]);
    }

    for (const [key, value] of Object.entries(meta)) {
        if (ALL_KNOWN_FRONTMATTER_FIELDS.has(key)) continue;
        issues.push({
            level: "warning",
            code: "unknown-field",
            message: `Unknown frontmatter field '${key}' moved to metadata.${key}`,
        });
        merged[key] = metadataString(value);
    }

    return Object.keys(merged).length > 0 ? merged : undefined;
}

function orderedFrontmatter(meta: SkillFrontmatter): SkillFrontmatter {
    const ordered: SkillFrontmatter = {};

    const specOrder = [
        "name",
        "description",
        "license",
        "compatibility",
        "allowed-tools",
        "metadata",
    ] as const;

    for (const key of specOrder) {
        if (meta[key] != null && meta[key] !== "") {
            ordered[key] = meta[key];
        }
    }

    const extensions = [...EXTENSION_FRONTMATTER_FIELDS].sort();
    for (const key of extensions) {
        if (meta[key] != null && meta[key] !== "") {
            ordered[key] = meta[key];
        }
    }

    return ordered;
}

export function normalizeSkillFrontmatter(
    meta: SkillFrontmatter,
    dirName: string,
    skillFile: string,
    issues: SkillFormatIssue[],
): SkillFrontmatter {
    const name = String(meta.name ?? dirName).trim();
    if (meta.name && meta.name !== dirName) {
        issues.push({
            level: "error",
            code: "name-dir-mismatch",
            message: `Frontmatter name '${String(meta.name)}' must match directory '${dirName}'`,
        });
    }

    try {
        validateSkillName(name, skillFile);
    } catch (err) {
        issues.push({
            level: "error",
            code: "invalid-name",
            message: err instanceof Error ? err.message : String(err),
        });
    }

    const description = normalizeDescription(meta.description);
    if (!description) {
        issues.push({
            level: "error",
            code: "missing-description",
            message: "description is required and must be non-empty",
        });
    } else if (description.length < DESCRIPTION_RECOMMENDED_MIN) {
        issues.push({
            level: "warning",
            code: "short-description",
            message: `description is shorter than recommended minimum (${DESCRIPTION_RECOMMENDED_MIN} chars)`,
        });
    } else if (description.length > DESCRIPTION_MAX_LENGTH) {
        issues.push({
            level: "error",
            code: "long-description",
            message: `description exceeds ${DESCRIPTION_MAX_LENGTH} characters`,
        });
    }

    let compatibility = meta.compatibility;
    if (compatibility != null) {
        compatibility = normalizeDescription(compatibility);
        if (String(compatibility).length > COMPATIBILITY_MAX_LENGTH) {
            issues.push({
                level: "error",
                code: "long-compatibility",
                message: `compatibility exceeds ${COMPATIBILITY_MAX_LENGTH} characters`,
            });
        }
    }

    const metadata = collectMetadata(meta, issues);

    const normalized: SkillFrontmatter = {
        name,
        description,
    };

    if (meta.license != null && String(meta.license).trim()) {
        normalized.license = String(meta.license).trim();
    }
    if (compatibility != null && String(compatibility).trim()) {
        normalized.compatibility = String(compatibility).trim();
    }
    if (meta["allowed-tools"] != null && String(meta["allowed-tools"]).trim()) {
        normalized["allowed-tools"] = String(meta["allowed-tools"]).trim();
    }
    if (metadata) {
        normalized.metadata = metadata;
    }

    for (const key of EXTENSION_FRONTMATTER_FIELDS) {
        if (meta[key] != null && meta[key] !== "") {
            normalized[key] = meta[key];
        }
    }

    return orderedFrontmatter(normalized);
}

function serializeScalar(value: string): string {
    if (
        value.includes("\n") ||
        value.includes(":") ||
        value.includes("#") ||
        value.includes('"') ||
        value.startsWith(" ") ||
        value.endsWith(" ")
    ) {
        return JSON.stringify(value);
    }
    return value;
}

export function serializeSkillFile(
    meta: SkillFrontmatter,
    body: string,
): string {
    const normalizedBody = body.replace(/^\s+/, "");
    const lines: string[] = ["---"];

    const writeField = (key: string, value: unknown): void => {
        if (value == null || value === "") return;
        if (key === "metadata" && typeof value === "object") {
            lines.push("metadata:");
            for (const [metaKey, metaValue] of Object.entries(
                value as Record<string, string>,
            )) {
                lines.push(`  ${metaKey}: ${serializeScalar(metaValue)}`);
            }
            return;
        }
        if (key === "description" || key === "compatibility") {
            lines.push(`${key}: ${serializeScalar(String(value))}`);
            return;
        }
        lines.push(`${key}: ${serializeScalar(String(value))}`);
    };

    for (const [key, value] of Object.entries(meta)) {
        writeField(key, value);
    }

    lines.push("---", "", normalizedBody.trimEnd(), "");
    return lines.join("\n");
}

export function formatSkillContent(
    content: string,
    skillFile: string,
): SkillFormatResult {
    const issues: SkillFormatIssue[] = [];
    const dirName = basename(dirname(skillFile));
    const parsed = parseSkillFile(content, skillFile);

    if (!parsed.hasFrontmatter) {
        issues.push({
            level: "error",
            code: "missing-frontmatter",
            message: "SKILL.md must start with YAML frontmatter delimited by ---",
        });
        return {
            skillFile,
            changed: false,
            formatted: content,
            issues,
        };
    }

    const meta = normalizeSkillFrontmatter(
        parsed.meta,
        dirName,
        skillFile,
        issues,
    );
    const formatted = serializeSkillFile(meta, parsed.body);
    const changed = formatted !== content;

    return { skillFile, changed, formatted, issues };
}

export async function findSkillFiles(dir: string): Promise<string[]> {
    const out: string[] = [];
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    } catch {
        return out;
    }

    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...(await findSkillFiles(full)));
        } else if (entry.name === "SKILL.md") {
            out.push(full);
        }
    }
    return out;
}

export type FormatSkillsOptions = {
    skillsRoot: string;
    fix?: boolean;
    verbose?: boolean;
};

export type FormatSkillsSummary = {
    scanned: number;
    changed: number;
    errors: number;
    warnings: number;
    results: SkillFormatResult[];
};

export async function formatSkillsDirectory(
    options: FormatSkillsOptions,
): Promise<FormatSkillsSummary> {
    const files = await findSkillFiles(options.skillsRoot);
    const results: SkillFormatResult[] = [];
    let changed = 0;
    let errors = 0;
    let warnings = 0;

    for (const skillFile of files.sort()) {
        const content = await readFile(skillFile, "utf-8");
        const result = formatSkillContent(content, skillFile);
        results.push(result);

        for (const issue of result.issues) {
            if (issue.level === "error") errors++;
            else warnings++;
        }

        if (result.changed) {
            changed++;
            if (options.fix) {
                await writeFile(skillFile, result.formatted);
                if (options.verbose) {
                    console.log(`formatted ${skillFile}`);
                }
            } else if (options.verbose) {
                console.log(`would format ${skillFile}`);
            }
        }
    }

    return {
        scanned: files.length,
        changed,
        errors,
        warnings,
        results,
    };
}

export function hasFormatErrors(summary: FormatSkillsSummary): boolean {
    return summary.results.some((result) =>
        result.issues.some((issue) => issue.level === "error"),
    );
}
