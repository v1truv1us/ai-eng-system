---
name: ai-eng/seo
description: Run SEO audit on a page or site
agent: review
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# SEO Command

Run an SEO audit on: $ARGUMENTS

 systematically analyze SEO factors. Check technical SEO, content quality, performance metrics, and accessibility to identify optimization opportunities.

## Checklist

### Technical SEO
- Meta tags (title, description, canonical)
- Structured data (schema.org)
- robots.txt and sitemap.xml
- Canonical URLs and redirects

### Content SEO
- Heading hierarchy (H1-H6)
- Keyword optimization
- Content depth and E-E-A-T signals
- Internal linking structure

### Performance
- Core Web Vitals (LCP, FID, CLS)
- Image optimization (format, lazy loading, alt text)
- JavaScript/CSS blocking resources

### Accessibility
- WCAG AA compliance
- Keyboard navigation
- Screen reader compatibility

## Output

Prioritized recommendations with expected impact:
- 🔴 Critical (blocking indexing/ranking)
- 🟡 High Priority (significant opportunity)
- 🟢 Nice to Have (optimization)
