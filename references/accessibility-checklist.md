# Accessibility Checklist Reference

## Keyboard Navigation

- [ ] All interactive elements reachable via Tab key
- [ ] Focus order is logical and matches visual order
- [ ] No keyboard traps (can navigate away from all elements)
- [ ] Custom keyboard shortcuts don't conflict with browser/assistive tech shortcuts
- [ ] Skip navigation link provided for main content
- [ ] Focus visible indicator present (not removed with `outline: none`)

## Screen Reader Support

- [ ] Semantic HTML used (headings, lists, landmarks)
- [ ] ARIA labels on interactive elements without visible text
- [ ] ARIA roles used correctly (not as a substitute for semantic HTML)
- [ ] Live regions announced for dynamic content updates
- [ ] Alt text on all meaningful images (decorative images use `alt=""`)
- [ ] Form inputs have associated labels
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] Tables have proper header associations (`<th scope="col">`)

## Visual Design

- [ ] Color contrast ratio >= 4.5:1 for normal text (WCAG AA)
- [ ] Color contrast ratio >= 3:1 for large text (18pt+ or 14pt+ bold)
- [ ] Color not used as the only means of conveying information
- [ ] Text can be resized to 200% without loss of content or functionality
- [ ] Content reflows at 400% zoom without horizontal scrolling
- [ ] Animations can be paused/disabled (prefers-reduced-motion)
- [ ] No content that flashes more than 3 times per second

## ARIA Usage

| Rule | Do | Don't |
|------|----|------|
| First rule of ARIA | Use semantic HTML first | Add ARIA to fix bad HTML |
| No change to semantics | Use ARIA to enhance, not replace | Change native element behavior |
| Interactive controls | Use native `<button>`, `<a>` | Add `role="button"` to `<div>` |
| State properties | Use `aria-expanded`, `aria-checked` | Use custom data attributes |
| Live regions | Use `aria-live="polite"` for updates | Announce every change |

## Forms

- [ ] Every input has a visible label
- [ ] Required fields indicated (visually and programmatically)
- [ ] Error messages are descriptive and actionable
- [ ] Error messages appear near the relevant field
- [ ] Form submission feedback provided
- [ ] Auto-complete attributes set appropriately
- [ ] Group related fields with `<fieldset>` and `<legend>`

## Testing Tools

### Automated Testing
```bash
# axe-core (browser extension or npm)
npx axe https://example.com

# Pa11y CLI
npx pa11y https://example.com

# Lighthouse accessibility audit
npx lighthouse https://example.com --only-categories=accessibility

# Playwright accessibility testing
await expect(page).toPassAxeTests();
```

### Manual Testing Checklist
1. Navigate entire page using only keyboard
2. Test with screen reader (VoiceOver, NVDA, or JAWS)
3. Test at 200% zoom
4. Test with high contrast mode
5. Test with reduced motion preference
6. Verify focus management on route changes
7. Verify focus management on modal/dialog open/close

### Playwright A11y Test
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    verbose: true,
  });
});
```

## WCAG 2.1 AA Compliance

| Principle | Guidelines | Key Requirements |
|-----------|-----------|-----------------|
| Perceivable | 1.1-1.4 | Text alternatives, captions, adaptable content, distinguishable |
| Operable | 2.1-2.4 | Keyboard accessible, enough time, no seizures, navigable |
| Understandable | 3.1-3.3 | Readable, predictable, input assistance |
| Robust | 4.1 | Compatible with current and future tools |

## Common Violations

| Violation | Severity | Fix |
|-----------|----------|-----|
| Missing alt text | Critical | Add descriptive alt text |
| Low contrast | Critical | Increase contrast ratio |
| Missing form labels | Critical | Add `<label>` elements |
| Empty links/buttons | Serious | Add accessible name |
| Missing heading structure | Moderate | Use proper heading hierarchy |
| Missing lang attribute | Moderate | Add `lang` to `<html>` |
| Missing focus indicator | Moderate | Add visible focus styles |
| Missing skip link | Minor | Add skip navigation link |
