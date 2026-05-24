---
name: frontend-ui-engineering
description: Component architecture, design systems, state management,
  responsive design, WCAG 2.1 AA accessibility. Use when building or modifying
  user-facing interfaces.
---

## Pi Context-Aware Execution

When this skill is invoked in Pi, treat the user's current request and any skill arguments as the task input. Do not treat this file as the task by itself.

Before applying the skill, establish only the context needed for the request:

1. Identify the current working directory and relevant project scope.
2. Read local guidance first when present: AGENTS.md, CLAUDE.md, TODO.md, or nearby task/spec files.
3. Inspect the current codebase with targeted searches (prefer rg) and read relevant files before making claims or proposing changes.
4. Ground findings and recommendations in project evidence: cite file paths, commands, tests, docs, or external sources as applicable.
5. Ask a concise clarification only when the arguments and codebase context are insufficient to proceed safely.

Operate conservatively: avoid broad scans, large reads, subagents, or parallel fanout unless the user's requested depth clearly requires them.
# Frontend UI Engineering

## Overview

Build user interfaces with component architecture, design system consistency, responsive design, and WCAG 2.1 AA accessibility as default requirements. Frontend work is not complete until it is accessible, responsive, and consistent.

## When to Use

- Building new UI components or pages
- Modifying existing user-facing interfaces
- Implementing design system changes
- Adding interactive features or state management

## Core Principles

### Component Architecture

- Components should have a single responsibility
- Prefer composition over inheritance
- Keep components small: 200-400 lines typical, 800 max
- Extract shared logic into hooks or utilities
- Colocate styles, tests, and component code

### Design System Consistency

- Use existing design tokens and variables
- Follow established naming conventions
- Maintain spacing, typography, and color consistency
- Extend the design system rather than one-off styles

### State Management

- Keep state as local as possible
- Lift state only as high as needed
- Use the simplest state management that works
- Prefer immutable state updates

### Responsive Design

- Design mobile-first by default
- Use relative units (rem, em, %) over fixed pixels
- Test at standard breakpoints (320px, 768px, 1024px, 1440px)
- Ensure touch targets meet minimum 44x44px

### Accessibility (WCAG 2.1 AA)

- All interactive elements must be keyboard accessible
- Images must have alt text
- Color contrast must meet 4.5:1 for text, 3:1 for large text
- Forms must have associated labels
- Dynamic content must have appropriate ARIA attributes
- Focus management must follow logical order

## Process

### Step 1: Review Existing Patterns

- Check the component library for existing solutions
- Follow established file structure and naming
- Use existing design tokens

### Step 2: Build Accessible First

- Start with semantic HTML
- Add ARIA attributes where semantic HTML is insufficient
- Verify keyboard navigation works
- Test with a screen reader if available

### Step 3: Make It Responsive

- Implement mobile layout first
- Add breakpoints for larger screens
- Test at all standard widths

### Step 4: Test

- Unit tests for component behavior
- Visual regression tests if available
- Accessibility audit with automated tools
- Manual keyboard navigation test

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Accessibility can be added later" | Retrofitting accessibility is much more expensive than building it in. |
| "This is an internal tool, accessibility does not matter" | Internal tools benefit from keyboard navigation and screen reader support too. |
| "The design system is too restrictive" | Consistency speeds up both development and user comprehension. |

## Verification

- [ ] Component follows existing patterns and design tokens
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Responsive at standard breakpoints
- [ ] Automated accessibility audit passes

## Anti-Rationalization Table

| Excuse | Counter |
|--------|---------|
| "Accessibility can be added later" | Retrofitting accessibility is much more expensive than building it in. |
| "This is an internal tool, accessibility doesn't matter" | Internal tools benefit from keyboard navigation and screen reader support too. |
| "The design system is too restrictive" | Consistency speeds up both development and user comprehension. |
| "I'll test responsive design on my phone" | Test at all standard breakpoints, not just one device. |
| "The component looks good, it's done" | Visual correctness is not functional correctness. Test keyboard nav and screen readers. |
