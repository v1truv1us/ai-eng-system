---
name: thermo-nuclear-architecture-review
description: Run an extremely strict architecture and system design review for coupling, boundary violations, dependency direction, layering, and structural decay. Use for a thermo-nuclear architecture review, thermonuclear system design audit, or especially harsh architecture review.
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Thermo-Nuclear Architecture Review

Use this skill for an unusually strict architecture and system design review. Do not merely check that layers exist. Actively hunt for architectural decay: coupling that makes changes expensive, boundaries that leak, dependencies that point the wrong way, and abstractions that serve no one.

Above all, this skill should push the reviewer to be **ambitious** about system structure. Do not stop at "this module has too many dependencies." Look for systemic design problems: places where the architecture fights the domain, where changes require coordinated edits across distant modules, where adding a simple feature requires understanding the whole system.

## Core Prompt

Start from this baseline:

> Perform a deep architecture review of the current branch's changes.
> Evaluate how the change fits into the existing system structure.
> Identify coupling, boundary violations, wrong-way dependencies, and structural decay.
> Be extremely thorough and rigorous. Architecture debt compounds. Fix it now or pay more later.

## Non-Negotiable Architecture Standards

0. **Dependencies must point inward. Stable dependencies. Stable abstractions.**
   - Business logic must not depend on infrastructure details.
   - Domain types must not import framework types.
   - Core modules must not import from peripheral modules.
   - Flag any import from a higher-level module into a lower-level module.
   - Flag any circular dependency, no matter how "small."

1. **Boundaries must be explicit and enforced.**
   - Every module boundary should be visible in the directory structure.
   - Cross-boundary communication goes through defined interfaces, not shared state.
   - Flag any place where one module reaches into another module's internals.
   - Flag any "convenience" import that bypasses a module's public API.
   - If two modules share a database table, that's a coupling problem, not a convenience.

2. **Changes should be local. If they're not, the architecture is wrong.**
   - Adding a field to a domain concept should not require changes in 10 files.
   - Adding a new variant of something should not require modifying existing code (OCP).
   - A bug in one feature should not be fixable only by editing a shared module.
   - Flag any change that requires coordinated edits across 3+ modules — that's a design smell.

3. **Abstractions must earn their keep.**
   - Every interface, abstract class, or wrapper must have at least two implementations or a clear future second implementation.
   - An abstraction with one implementation is indirection without benefit.
   - A pass-through layer (controller → service → repository where the service just calls the repo) is waste.
   - Flag any abstraction that exists "for future flexibility" without a concrete second use case.

4. **Coupling must be measured and minimized.**
   - Flag any module imported by more than 10 other modules — it's a god module.
   - Flag any module that imports more than 15 other modules — it knows too much.
   - Flag any pair of modules that import each other — circular coupling.
   - Flag any module that changes every sprint — it's a coupling hotspot.

5. **Data ownership must be clear.**
   - Every piece of state has exactly one owner. Shared mutable state is a finding.
   - Every table has exactly one writing service/module. Multiple writers is a finding.
   - Every concept lives in exactly one module. Duplication across modules is a finding.
   - Flag any data that is "owned by everyone" — that means no one owns it.

6. **Error handling must match the boundary.**
   - Internal errors are structured types, not strings.
   - Boundary errors are translated to the boundary's protocol (HTTP status, API error code).
   - Flag any internal error that leaks through a boundary without translation.
   - Flag any catch block that swallows errors silently.

7. **The architecture must serve the domain, not the framework.**
   - Domain logic must not be coupled to framework lifecycle hooks.
   - Business rules must not live in middleware or interceptors.
   - Flag any place where the domain shape is distorted to fit the framework.
   - The framework is a detail. The domain is the core.

## Primary Architecture Questions

For every meaningful change, ask:

- Does this change require coordinated edits across modules? How many?
- Does this import cross a boundary? In the right direction?
- Does this introduce shared mutable state?
- Does this add a dependency to a god module?
- Does this create or deepen circular coupling?
- Is the new code in the right module, or is it convenience-driven placement?
- Does this abstraction have (or will it have) more than one implementation?
- Does this change the ownership of any data?
- Would this change be easier if the architecture were cleaner?
- Will the next person understand where this code lives and why?

## What to Flag Aggressively

- Circular imports between modules.
- Domain types importing infrastructure types (database, HTTP, framework).
- A module that is imported everywhere (god module).
- A module that imports everything (know-it-all module).
- Shared mutable state across module boundaries.
- Multiple modules writing to the same table or state.
- Pass-through layers that add no logic.
- Abstractions with exactly one implementation and no planned second.
- Business logic in controllers, middleware, or framework hooks.
- Changes that require editing 5+ files for a single concept.
- "Utility" modules that become dumping grounds for unrelated functions.
- Configuration or environment logic scattered across modules instead of centralized.
- Error types that cross boundaries without translation.

## Preferred Remedies

- Move the code to the module that owns the concept.
- Replace the abstraction with direct calls until a second implementation is real.
- Introduce an interface at the boundary to invert the dependency.
- Extract shared logic into a module that both depend on (not one into the other).
- Make the change local by restructuring ownership.
- Delete the pass-through layer.
- Consolidate the god module into focused sub-modules.
- Make data ownership explicit with a single writer.

Do not be satisfied with "the tests pass" when adding a feature requires touching 8 files.
Do not be satisfied with "it's in a service layer" when the service is just a proxy to the repository.

## Review Tone

Be direct, serious, and demanding about architecture.
Architecture debt doesn't show up in tests — it shows up in velocity and bug rates months later.
If the change is fighting the architecture, say so.
If the architecture is making simple things hard, say that clearly.

Good phrases:

- `this domain type imports the ORM decorator. the domain now depends on the database. invert this dependency.`
- `adding a field to this entity requires changes in 6 files across 3 modules. the architecture is fighting the domain.`
- `this module is imported by 23 other modules. it's a god module. decompose it.`
- `this interface has one implementation. this is indirection without benefit. remove the abstraction or show the second use case.`
- `this service layer just calls the repository. it adds nothing. delete it and call the repo directly, or put real logic here.`
- `these two modules import each other. that's circular coupling. extract the shared dependency.`
- `this change puts business logic in a middleware. middleware is infrastructure. move the logic to the domain module.`

## Output Expectations

Prioritize findings in this order:

1. Circular dependencies and wrong-way imports
2. God modules and coupling hotspots
3. Boundary violations and leaked internals
4. Shared mutable state and unclear data ownership
5. Unnecessary abstractions and pass-through layers
6. Domain-framework coupling
7. Structural decay that makes changes non-local

Do not flood the review with minor naming nits if there are systemic coupling problems.
A single circular dependency between core modules outweighs a dozen "maybe rename this" suggestions.

## Approval Bar

Do not approve merely because the code compiles and tests pass.
The bar for approval is:

- no new circular dependencies
- no wrong-way dependency imports (domain depending on infrastructure)
- no new god module or coupling hotspot
- the change is local (doesn't require coordinated edits across distant modules)
- data ownership is clear and single-writer
- abstractions have at least two implementations or a concrete planned second
- the change fits the existing architecture or improves it — not fights it

Treat these as presumptive blockers:

- the PR introduces a circular dependency between core modules
- the PR makes the domain depend on framework or infrastructure types
- the PR adds a dependency to an already-overloaded god module
- the PR requires coordinated changes across 5+ modules for a single concept
- the PR introduces shared mutable state across boundaries
- the PR adds an abstraction with one implementation and no justification
