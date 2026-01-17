---
name: ai-eng/seo
description: Run SEO audit on a page or site
agent: review
---

# SEO Command

Run an SEO audit on: $ARGUMENTS

 systematically analyze SEO factors. Check technical SEO, content quality, performance metrics, and accessibility to identify optimization opportunities.

## Why This Matters

SEO issues prevent content from being discovered by search engines. Poor performance metrics negatively impact rankings and user experience. Missing technical SEO elements block indexing. This SEO audit task is critical for ensuring content reaches its intended audience.

## The Challenge

The identify all SEO issues without overwhelming the user with low-priority recommendations. The challenge is distinguishing between critical blocking issues and nice-to-have optimizations. Success means audit prioritizes high-impact changes and provides actionable guidance that significantly improves search visibility.

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

After completing SEO audit, rate your confidence in findings accuracy and prioritization (0.0-1.0). Identify any uncertainties about SEO best practices, areas where technical constraints may limit implementation, or metrics that may be misleading. Note any recommendations that require additional information to be actionable.