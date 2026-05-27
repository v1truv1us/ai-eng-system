---
name: seo-audit
description: Full SEO and performance audit for any website. Use when asked to check SEO, run a lighthouse scan, audit performance, check accessibility, or validate structured data.
---

# SEO Audit Skill

## When to Use
- User says "SEO audit", "check SEO", "lighthouse scan", "performance check", "site audit"
- Need to validate SEO, accessibility, performance, or structured data

## Workflow

### 1. Lighthouse Scan
Run Lighthouse via CLI for both mobile and desktop:

```bash
# Install if needed
npx --yes lighthouse

# Run scans
npx lighthouse URL --output=json --output-path=./lighthouse-mobile.json --emulated-form-factor=mobile --quiet
npx lighthouse URL --output=json --output-path=./lighthouse-desktop.json --emulated-form-factor=desktop --quiet
```

Extract and report:
- **Performance** (target: 90+)
- **Accessibility** (target: 100)
- **Best Practices** (target: 100)
- **SEO** (target: 90+)

### 2. Core Web Vitals
From Lighthouse results, extract and assess:
- **LCP** (Largest Contentful Paint) — target: <2.5s
- **FID** (First Input Delay) — target: <100ms
- **CLS** (Cumulative Layout Shift) — target: <0.1
- **INP** (Interaction to Next Paint) — target: <200ms
- **TTFB** (Time to First Byte) — target: <800ms

Flag any that fail and identify the cause.

### 3. Meta Tags Audit
Fetch the page HTML and check:
- [ ] `<title>` present, 30-60 chars, unique per page
- [ ] `<meta name="description">` present, 120-160 chars
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- [ ] Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `<meta name="viewport">` present
- [ ] `<link rel="canonical">` set correctly
- [ ] `<meta name="robots">` not blocking important pages
- [ ] Hreflang tags for multilingual sites

### 4. Heading Hierarchy
Parse headings and check:
- [ ] Exactly one `<h1>` per page
- [ ] Logical hierarchy (H1 → H2 → H3, no skipping levels)
- [ ] Headings contain relevant keywords
- [ ] No empty heading tags

### 5. Image Audit
Scan all `<img>` tags:
- [ ] All images have `alt` text
- [ ] `width` and `height` attributes set (prevents CLS)
- [ ] Images use modern formats (WebP, AVIF)
- [ ] Lazy loading applied (`loading="lazy"`) for below-fold images
- [ ] No oversized images (check natural vs display size)
- [ ] Decorative images have empty alt (`alt=""`)

### 6. Link Audit
Check all links on the page:
- [ ] No broken internal links (404s)
- [ ] No broken external links
- [ ] External links use `rel="noopener"` for `target="_blank"`
- [ ] Descriptive anchor text (no "click here")
- [ ] No orphaned pages (pages with no internal links to them)

### 7. Sitemap & Robots.txt
- [ ] `sitemap.xml` exists and is valid XML
- [ ] `sitemap.xml` referenced in `robots.txt`
- [ ] `robots.txt` exists and is not overly restrictive
- [ ] All important pages are in sitemap
- [ ] Sitemap last modified date is recent

### 8. Structured Data / Schema
Check for JSON-LD structured data:
- [ ] Valid JSON-LD present
- [ ] Schema type appropriate for page content
- [ ] Common schemas: Organization, WebSite, BreadcrumbList, Article, FAQPage, LocalBusiness
- [ ] No schema errors or warnings (validate with Google Rich Results Test logic)
- [ ] `@id` and `url` fields consistent

### 9. Technical SEO
- [ ] HTTPS enforced (redirects HTTP → HTTPS)
- [ ] WWW/non-WWW canonical redirect
- [ ] No mixed content warnings
- [ ] Proper 404 page
- [ ] 301/302 redirects working correctly
- [ ] No redirect chains (3+ hops)
- [ ] Compression enabled (gzip/brotli)
- [ ] Browser caching headers set
- [ ] No render-blocking resources

### 10. Mobile & Accessibility
- [ ] Responsive meta viewport tag
- [ ] Touch targets >= 48px
- [ ] Text readable without zooming
- [ ] No horizontal scroll on mobile
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ratio >= 4.5:1
- [ ] Form labels present
- [ ] Skip navigation link

## Output Format

```
═══════════════════════════════════════
SEO AUDIT: [URL]
Date: [YYYY-MM-DD]
═══════════════════════════════════════

LIGHTHOUSE SCORES
                 Desktop    Mobile
Performance        [XX]       [XX]
Accessibility      [XX]       [XX]
Best Practices     [XX]       [XX]
SEO                [XX]       [XX]

CORE WEB VITALS
LCP:  [X.Xs]  [✓/✗ target: <2.5s]
FID:  [Xms]   [✓/✗ target: <100ms]
CLS:  [X.XX]  [✓/✗ target: <0.1]

META TAGS         [✓/✗] [issue count]
HEADINGS          [✓/✗] [issue count]
IMAGES            [✓/✗] [issue count]
LINKS             [✓/✗] [broken count]
SITEMAP           [✓/✗]
STRUCTURED DATA   [✓/✗]
TECHNICAL SEO     [✓/✗]
MOBILE/A11Y       [✓/✗]

═══════════════════════════════════════
ISSUES FOUND
═══════════════════════════════════════

🔴 CRITICAL
[Issues that severely impact rankings or UX]

🟡 WARNING
[Issues that should be fixed]

🟢 SUGGESTIONS
[Nice-to-have improvements]

═══════════════════════════════════════
RECOMMENDATIONS
═══════════════════════════════════════
1. [Most impactful fix first]
2. [Second most impactful]
3. [Third]
```

## Usage

```
# Single page audit
/seo-audit https://example.com

# Full site audit (crawls linked pages)
/seo-audit https://example.com --full

# Compare before/after
/seo-audit https://example.com --compare ./previous-audit.json
```

## Multi-Page Mode (--full)
When `--full` is specified:
1. Start with the provided URL
2. Crawl all internal links (same domain)
3. Run full audit on each page
4. Generate aggregate report with worst offenders
5. List pages sorted by score (lowest first)

## Confidence Assessment
After completing audit, rate confidence **0.0 to 1.0**:
- **0.9-1.0**: Full Lighthouse + all 10 checks, clear prioritized issues
- **0.6-0.9**: Lighthouse run but some checks incomplete
- **0.3-0.6**: Only partial audit completed
- **0.0-0.3**: Could not access site or run Lighthouse

