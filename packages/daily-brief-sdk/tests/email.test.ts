import { describe, expect, test } from "bun:test";
import {
    InMemoryTransport,
    readSmtpConfigFromEnv,
} from "../src/shared/email.js";

describe("email", () => {
    test("InMemoryTransport records every send", async () => {
        const t = new InMemoryTransport();
        await t.send({ subject: "a", html: "<p>1</p>" });
        await t.send({ subject: "b", html: "<p>2</p>" });
        expect(t.sent).toHaveLength(2);
        expect(t.sent[0]!.subject).toBe("a");
        expect(t.sent[1]!.subject).toBe("b");
    });

    test("readSmtpConfigFromEnv reads required keys", () => {
        const config = readSmtpConfigFromEnv({
            SMTP_HOST: "smtp.postmarkapp.com",
            SMTP_USER: "user",
            SMTP_PASS: "secret",
            BRIEF_TO: "me@example.com",
        });
        expect(config.host).toBe("smtp.postmarkapp.com");
        expect(config.port).toBe(587);
        expect(config.user).toBe("user");
        expect(config.pass).toBe("secret");
        expect(config.to).toBe("me@example.com");
        // SMTP_FROM defaults to user when unset
        expect(config.from).toBe("user");
    });

    test("readSmtpConfigFromEnv parses SMTP_PORT when present", () => {
        const config = readSmtpConfigFromEnv({
            SMTP_HOST: "h",
            SMTP_USER: "u",
            SMTP_PASS: "p",
            BRIEF_TO: "t",
            SMTP_PORT: "465",
        });
        expect(config.port).toBe(465);
    });

    test("readSmtpConfigFromEnv uses SMTP_FROM when set", () => {
        const config = readSmtpConfigFromEnv({
            SMTP_HOST: "h",
            SMTP_USER: "u",
            SMTP_PASS: "p",
            BRIEF_TO: "t",
            SMTP_FROM: "noreply@example.com",
        });
        expect(config.from).toBe("noreply@example.com");
    });

    test("readSmtpConfigFromEnv throws on missing required keys", () => {
        expect(() => readSmtpConfigFromEnv({ SMTP_HOST: "h" })).toThrow(
            /SMTP_USER/,
        );
    });

    test("readSmtpConfigFromEnv error message names ALL missing keys", () => {
        let caught: unknown;
        try {
            readSmtpConfigFromEnv({});
        } catch (error) {
            caught = error;
        }
        expect((caught as Error).message).toContain("SMTP_HOST");
        expect((caught as Error).message).toContain("SMTP_USER");
        expect((caught as Error).message).toContain("SMTP_PASS");
        expect((caught as Error).message).toContain("BRIEF_TO");
    });
});
