import { describe, expect, test } from "bun:test";
import { assertNoSecretLeak, SecretLeakError } from "../src/shared/secrets.js";

describe("secrets-leak guard", () => {
    test("passes through clean artifacts", () => {
        const result = assertNoSecretLeak(
            "<p>regular brief content</p>",
            "rendered.html",
            {
                SMTP_PASS: "supersecret123",
                ATLASSIAN_API_TOKEN: "abc123def456",
            },
        );
        expect(result.leakedKeys).toEqual([]);
    });

    test("throws when SMTP_PASS leaks into HTML", () => {
        const env = { SMTP_PASS: "supersecret123" };
        let caught: unknown;
        try {
            assertNoSecretLeak(
                "<p>oops password=supersecret123</p>",
                "rendered.html",
                env,
            );
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(SecretLeakError);
        if (caught instanceof SecretLeakError) {
            expect(caught.key).toBe("SMTP_PASS");
            expect(caught.artifactName).toBe("rendered.html");
        }
    });

    test("throws when ATLASSIAN_API_TOKEN leaks into a telemetry row", () => {
        const env = { ATLASSIAN_API_TOKEN: "atok-deadbeef" };
        const row = JSON.stringify({
            workflow: "tomorrow",
            error_kind: "AuthError",
            error_message: "401 with token atok-deadbeef",
        });
        let caught: unknown;
        try {
            assertNoSecretLeak(row, "telemetry.jsonl", env);
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(SecretLeakError);
        if (caught instanceof SecretLeakError) {
            expect(caught.key).toBe("ATLASSIAN_API_TOKEN");
        }
    });

    test("ignores unset secret env keys", () => {
        // No SMTP_PASS in env; no leak possible.
        const result = assertNoSecretLeak(
            "<p>this contains the literal word supersecret123</p>",
            "rendered.html",
            {},
        );
        expect(result.leakedKeys).toEqual([]);
    });

    test("ignores trivially-short secret values to avoid false positives", () => {
        // 3-char "secret" is too short to trust as a real token.
        const result = assertNoSecretLeak(
            "<p>foo bar baz abc</p>",
            "rendered.html",
            { SMTP_PASS: "abc" },
        );
        expect(result.leakedKeys).toEqual([]);
    });

    test("scans for multiple secret types", () => {
        const env = {
            SMTP_PASS: "smtp-secret-123",
            BITBUCKET_API_TOKEN: "bb-tok-456789",
        };
        let caught: unknown;
        try {
            assertNoSecretLeak(
                "<p>bb-tok-456789 in error log</p>",
                "stderr.log",
                env,
            );
        } catch (error) {
            caught = error;
        }
        expect(caught).toBeInstanceOf(SecretLeakError);
        if (caught instanceof SecretLeakError) {
            expect(caught.key).toBe("BITBUCKET_API_TOKEN");
        }
    });
});
