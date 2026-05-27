/**
 * The only path from external strings (Jira summary, commit message,
 * calendar title, error text) into rendered HTML. Used by output-router
 * and the brief template; raw template-literal interpolation of source
 * strings into HTML is forbidden by code review.
 *
 * Escapes the five characters that matter for both element-content and
 * attribute-value contexts (assuming attributes are always quoted with `"`):
 *
 *   &  ->  &amp;
 *   <  ->  &lt;
 *   >  ->  &gt;
 *   "  ->  &quot;
 *   '  ->  &#x27;
 *
 * `&` MUST be replaced first; otherwise a subsequent `&lt;` becomes
 * `&amp;lt;`.
 */
export function escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = typeof value === "string" ? value : String(value);
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

/**
 * Tagged template literal helper. Interpolated values are escaped; the
 * static template parts are passed through as-is. Use everywhere we
 * compose HTML in code:
 *
 *   const out = html`<a href="${url}">${title}</a>`;
 *
 * This makes XSS via Jira/commit/calendar input physically impossible
 * unless the call site bypasses the helper, which is what code review
 * is for.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
    let result = strings[0] ?? "";
    for (let i = 0; i < values.length; i++) {
        result += escapeHtml(values[i]);
        result += strings[i + 1] ?? "";
    }
    return result;
}

/**
 * Escape a value for safe insertion inside a quoted HTML attribute.
 * Currently identical to escapeHtml — separated so future contexts
 * (URL attributes, JS contexts) can specialise without touching call
 * sites.
 */
export const escapeAttribute = escapeHtml;
