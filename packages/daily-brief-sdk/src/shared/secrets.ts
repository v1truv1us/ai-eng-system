/**
 * Secret-scanning helpers. The B3 secrets-leak guard is a runtime check
 * that scans rendered HTML, JSONL telemetry, and stderr logs for the
 * literal substrings of secrets we know about. If a secret value ever
 * appears in any artifact destined for disk or the wire, the run fails.
 */

const SECRET_ENV_KEYS = [
    "SMTP_PASS",
    "ATLASSIAN_API_TOKEN",
    "BITBUCKET_API_TOKEN",
    "GRAFANA_API_TOKEN",
] as const;

export type SecretEnvKey = (typeof SECRET_ENV_KEYS)[number];

export class SecretLeakError extends Error {
    constructor(
        message: string,
        public readonly key: SecretEnvKey,
        public readonly artifactName: string,
    ) {
        super(message);
        this.name = "SecretLeakError";
    }
}

export interface SecretScanResult {
    leakedKeys: SecretEnvKey[];
}

/**
 * Build a set of known-secret values from process.env (or a passed env).
 * Empty / unset keys are skipped — a missing secret can't leak.
 */
function knownSecrets(
    env: Record<string, string | undefined> = process.env,
): Map<SecretEnvKey, string> {
    const out = new Map<SecretEnvKey, string>();
    for (const key of SECRET_ENV_KEYS) {
        const value = env[key];
        if (value && value.length >= 4) {
            out.set(key, value);
        }
    }
    return out;
}

/**
 * Scan a single artifact (string) for any known secret value.
 * Throws SecretLeakError on the first hit. Returns the result list of
 * secrets observed if no leak (always empty, but useful for logs).
 */
export function assertNoSecretLeak(
    artifact: string,
    artifactName: string,
    env?: Record<string, string | undefined>,
): SecretScanResult {
    const secrets = knownSecrets(env);
    const leaked: SecretEnvKey[] = [];
    for (const [key, value] of secrets) {
        if (artifact.includes(value)) {
            leaked.push(key);
        }
    }
    if (leaked.length > 0) {
        throw new SecretLeakError(
            `secret value for ${leaked.join(", ")} appeared in ${artifactName}`,
            leaked[0]!,
            artifactName,
        );
    }
    return { leakedKeys: leaked };
}
