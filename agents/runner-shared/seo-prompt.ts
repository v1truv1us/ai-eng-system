/**
 * Shared SEO review prompt builder.
 */

export function buildSeoPrompt(url: string, agent?: string): string {
    const agentPrompt = agent ? `\n\nAgent instruction: ${agent}` : "";
    return `You are running an SEO review workflow for ${url}.${agentPrompt}

Review the URL for:
- Lighthouse-style SEO, performance, accessibility, and best-practices risks
- Core Web Vitals risks: LCP, CLS, INP, TTFB
- title, meta description, canonical, robots, viewport, Open Graph, Twitter Card
- heading hierarchy
- image alt text, sizing, modern formats, lazy loading
- internal/external links, target=_blank rel safety, descriptive anchors
- sitemap.xml and robots.txt expectations
- structured data / JSON-LD
- HTTPS, redirects, compression, caching, mixed content
- mobile and accessibility basics

If live browsing or Lighthouse is unavailable, say so and provide a confidence score. Do not invent measured scores.

Return markdown with:
1. Summary
2. Evidence gathered
3. Critical issues
4. Warnings
5. Suggestions
6. Prioritized recommendations
7. Confidence score from 0.0 to 1.0
`;
}
