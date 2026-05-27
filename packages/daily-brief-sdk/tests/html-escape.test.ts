import { describe, expect, test } from "bun:test";
import {
    escapeAttribute,
    escapeHtml,
    html,
} from "../src/shared/html-escape.js";

describe("html-escape", () => {
    test("escapes the standard XSS payload", () => {
        const out = escapeHtml("<script>alert(1)</script>");
        expect(out).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
        expect(out).not.toContain("<script");
    });

    test("escapes attribute-context vector with double-quote", () => {
        const out = escapeAttribute('" onerror=alert(1) "');
        expect(out).not.toContain('"');
        expect(out).toContain("&quot;");
    });

    test("escapes attribute-context vector with single-quote", () => {
        const out = escapeAttribute("' onerror=alert(1) '");
        expect(out).not.toContain("'");
        expect(out).toContain("&#x27;");
    });

    test("replaces & first so subsequent escapes don't double-encode", () => {
        const out = escapeHtml("<a&b>");
        expect(out).toBe("&lt;a&amp;b&gt;");
        expect(out).not.toContain("&amp;lt;");
    });

    test("handles null and undefined as empty string", () => {
        expect(escapeHtml(null)).toBe("");
        expect(escapeHtml(undefined)).toBe("");
    });

    test("coerces numbers and booleans via String()", () => {
        expect(escapeHtml(42)).toBe("42");
        expect(escapeHtml(true)).toBe("true");
    });

    test("html`` tagged template escapes interpolated values but not template parts", () => {
        const userInput = "<script>alert(1)</script>";
        const url = "https://example.com/?x=1&y=2";
        const out = html`<a href="${url}">${userInput}</a>`;
        expect(out).toBe(
            '<a href="https://example.com/?x=1&amp;y=2">&lt;script&gt;alert(1)&lt;/script&gt;</a>',
        );
    });

    test("html`` keeps static angle brackets in template, escapes user values", () => {
        const evil = "</script><img src=x onerror=alert(1)>";
        const out = html`<div>${evil}</div>`;
        expect(out).toContain("<div>");
        expect(out).toContain("</div>");
        expect(out).not.toContain("<img");
        expect(out).toContain("&lt;img");
    });

    test("html`` handles multiple interpolations", () => {
        const out = html`<p>${1}<br>${"&"}<br>${"<"}</p>`;
        expect(out).toBe("<p>1<br>&amp;<br>&lt;</p>");
    });
});
