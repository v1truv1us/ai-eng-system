# Performance Checklist Reference

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800-1800ms | > 1800ms |
| FCP (First Contentful Paint) | < 1.8s | 1.8-3s | > 3s |

## Frontend Performance

### Bundle Optimization
- [ ] Code splitting implemented (route-level, component-level)
- [ ] Tree shaking enabled and verified
- [ ] No duplicate dependencies in bundle
- [ ] Bundle size monitored (warn at 200KB, error at 500KB per chunk)
- [ ] Lazy loading for below-the-fold content
- [ ] Preload critical resources (`<link rel="preload">`)
- [ ] Preconnect to third-party origins

### Image Optimization
- [ ] Images served in modern formats (WebP, AVIF)
- [ ] Responsive images with `srcset` and `sizes`
- [ ] Lazy loading for below-the-fold images (`loading="lazy"`)
- [ ] Proper dimensions set (prevents CLS)
- [ ] CDN used for image delivery

### CSS Performance
- [ ] Critical CSS inlined
- [ ] Unused CSS removed
- [ ] CSS minified
- [ ] No render-blocking stylesheets

### JavaScript Performance
- [ ] Defer non-critical scripts (`defer` or `async`)
- [ ] No blocking scripts in `<head>`
- [ ] Web Workers for heavy computation
- [ ] Debounced/throttled event handlers
- [ ] Virtual scrolling for long lists
- [ ] Memoization for expensive computations

## Backend Performance

### Database
- [ ] N+1 queries eliminated
- [ ] Indexes on frequently queried columns
- [ ] Query execution time monitored (< 100ms p95)
- [ ] Connection pooling configured
- [ ] Read replicas for read-heavy workloads
- [ ] Pagination implemented (no unbounded queries)

### Caching
- [ ] HTTP caching headers set (Cache-Control, ETag)
- [ ] CDN configured for static assets
- [ ] Application-level caching for expensive computations
- [ ] Cache invalidation strategy defined
- [ ] Redis/Memcached for session storage

### API Performance
- [ ] Response time < 200ms p95 for simple endpoints
- [ ] Response time < 500ms p95 for complex endpoints
- [ ] Rate limiting configured
- [ ] Pagination for list endpoints
- [ ] Compression enabled (gzip/brotli)
- [ ] Request timeout configured

### Concurrency
- [ ] Connection pool size tuned
- [ ] Thread pool size appropriate for workload
- [ ] Async I/O used where possible
- [ ] Backpressure handling implemented

## Measurement Commands

```bash
# Lighthouse CI
npx lighthouse-ci autorun

# Bundle analysis
npx webpack-bundle-analyzer dist/

# Performance profiling (Chrome DevTools)
# 1. Open DevTools > Performance tab
# 2. Record during page load
# 3. Analyze main thread bottlenecks

# Server response times
curl -w "@curl-format.txt" -o /dev/null -s https://example.com/api/endpoint

# curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total:       %{time_total}\n
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Loading all data upfront | Slow initial load | Lazy load, paginate, virtualize |
| Unbounded queries | Database overload | Always paginate, add limits |
| Missing indexes | Full table scans | Add indexes on query columns |
| Over-fetching | Wasted bandwidth | Field selection, GraphQL |
| Synchronous blocking | Poor UX | Async operations, streaming |
| No caching | Repeated expensive work | Cache at appropriate layer |
| Large bundles | Slow page load | Code split, tree shake, defer |
| Layout shifts | Poor CLS | Set dimensions, reserve space |

## Performance Budget

| Resource | Budget |
|----------|--------|
| Total page weight | < 1MB (compressed) |
| JavaScript | < 200KB (compressed) |
| CSS | < 50KB (compressed) |
| Images | < 500KB total |
| Fonts | < 100KB total |
| Third-party scripts | < 100KB |
