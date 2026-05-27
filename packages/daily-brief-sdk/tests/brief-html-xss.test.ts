import { describe, expect, test } from "bun:test";
import type { TomorrowBrief } from "../src/shared/brief-schema.js";
import { renderTomorrowBrief } from "../src/templates/brief.html.js";

const XSS_BODY = "<script>alert(1)</script>";
const XSS_ATTR = `" onerror=alert(1) "`;

function adversarialBrief(): TomorrowBrief {
    return {
        workflow: "tomorrow",
        generatedAt: "2026-05-26T17:00:00.000Z",
        forDate: "2026-05-27",
        startFreshOn: [
            {
                title: XSS_BODY,
                why: XSS_BODY,
                url: `https://example.com/?x=${XSS_ATTR}`,
                sourceToolCallId: "toolu_01",
                metrics: [],
            },
        ],
        carryovers: [
            {
                title: "</script><img src=x onerror=alert(1)>",
                sourceToolCallId: "toolu_02",
                metrics: [],
            },
        ],
        skipOrNoise: [],
        calendar: [
            {
                title: XSS_BODY,
                start: "10:00",
                end: "11:00",
                sourceToolCallId: "toolu_03",
            },
        ],
        risks: [
            {
                title: XSS_BODY,
                severity: "high",
                sourceToolCallId: "toolu_04",
            },
        ],
        sources: { "atlassian-mcp": { status: "ok", note: XSS_BODY } },
    };
}

describe("brief-html-xss (end-to-end template render)", () => {
    test("element-context payload renders escaped", () => {
        const html = renderTomorrowBrief(adversarialBrief());
        expect(html).not.toContain("<script>alert(1)</script>");
        expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    });

    test("attribute-context payload (URL) escapes the closing quote", () => {
        const html = renderTomorrowBrief(adversarialBrief());
        // The URL was set to `https://example.com/?x=" onerror=alert(1) "`.
        // After escaping inside href="...", the literal `"` must be encoded
        // as &quot; so the attribute cannot be closed prematurely.
        expect(html).toContain("&quot;");
        // The href value must not contain a raw quote character that could
        // break out of the attribute. With `"` escaped to `&quot;`, the
        // remaining text after `&quot;` is inert: it lives inside the
        // attribute value, not as a new attribute.
        const hrefMatch = html.match(/<a href="([^"]*)"/);
        expect(hrefMatch).toBeTruthy();
        if (hrefMatch) {
            // No unescaped `"` inside the value.
            expect(hrefMatch[1]).not.toContain('"');
            // The injected `onerror` token is now inside the attribute
            // value as inert text — verify it's preceded by &quot;.
            expect(hrefMatch[1]).toContain("&quot; onerror=alert(1) &quot;");
        }
    });

    test("</script> in user input cannot break out of any context", () => {
        const html = renderTomorrowBrief(adversarialBrief());
        // The literal user-supplied "</script>" must be escaped, never appearing
        // as a tag close.
        expect(html.toLowerCase()).not.toMatch(/<\/script>/i);
        expect(html).toContain("&lt;/script&gt;");
    });

    test("onerror handler from <img src=x onerror=...> is inert", () => {
        const html = renderTomorrowBrief(adversarialBrief());
        expect(html).not.toContain("<img src=x onerror");
        expect(html).toContain("&lt;img src=x onerror");
    });

    test("source footer note renders escaped", () => {
        const html = renderTomorrowBrief(adversarialBrief());
        // The source note contained <script>alert(1)</script>; in the rendered
        // sources list it must appear escaped, not as a tag.
        expect(html).toContain("atlassian-mcp");
        expect(html).not.toContain("<script>alert(1)</script>");
    });
});
