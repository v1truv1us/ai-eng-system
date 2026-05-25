---
name: thermo-nuclear-performance-review
description: Run an extremely strict performance review for runtime efficiency, memory usage, bundle size, database query patterns, and scalability limits. Use for a thermo-nuclear performance review, thermonuclear performance audit, or especially harsh performance review.
disable-model-invocation: true
---

# Thermo-Nuclear Performance Review

Use this skill for an unusually strict performance-focused review. Do not merely check for obvious N+1 queries. Actively hunt for systemic performance problems: patterns that scale poorly, hidden allocations, unnecessary serialization, and designs that become bottlenecks under load.

Above all, this skill should push the reviewer to be **ambitious** about performance. Do not stop at "this query could be faster." Look for fundamental design issues: O(n²) algorithms disguised as O(n), data structures that fight the access pattern, and architectures that serialize when they could stream.

## Core Prompt

Start from this baseline:

> Perform a deep performance audit of the current branch's changes.
> Evaluate algorithmic complexity, memory behavior, I/O patterns, and scalability limits.
> Identify every hidden cost, every unnecessary allocation, every pattern that degrades under load.
> Be extremely thorough and rigorous. Performance debt is invisible until production.

## Non-Negotiable Performance Standards

0. **Know your complexity. State it. Verify it.**
   - Every loop over a collection must have a stated complexity.
   - Every nested loop must justify why it isn't O(n²) or worse.
   - Every recursive call must justify why it won't blow the stack.
   - If you can't state the complexity, the code is too clever to be performant.

1. **Database queries must be bounded and intentional.**
   - N+1 queries are presumptive blockers. Every loop that makes a query is suspect.
   - Unbounded queries (`SELECT * FROM table` without LIMIT) are presumptive blockers.
   - Missing indexes on columns used in WHERE, JOIN, or ORDER BY are findings.
   - Transactions that hold locks while doing non-database work are findings.
   - Flag any query that runs in a loop — it should be batched.

2. **Memory allocations must be proportional to the working set, not the data size.**
   - Loading an entire table into memory is a presumptive blocker.
   - Collecting results into an array when streaming would work is a finding.
   - Caching without bounds is a memory leak with extra steps.
   - Flag any place where large objects are held longer than necessary.
   - Flag any deep clone where a shallow copy or reference would suffice.

3. **Network calls are expensive. Batch them or eliminate them.**
   - Sequential network calls that could be parallel are a finding.
   - Network calls inside loops are presumptive blockers.
   - Missing timeouts on network calls are findings.
   - Retry without backoff is a finding.
   - Flag any waterfall of network requests that could be a single batched call.

4. **Serialization and parsing are not free.**
   - JSON.parse/JSON.stringify on large payloads in hot paths is a finding.
   - Repeated serialization/deserialization of the same data is a finding.
   - Flag any place where data is serialized just to be immediately parsed again.
   - Flag any serializer that doesn't handle the expected data volume.

5. **The hot path must be lean.**
   - Logging in hot paths must be gated by log level checks.
   - Object allocation in hot paths must be justified.
   - Synchronous I/O in hot paths is a presumptive blocker.
   - Flag any unnecessary work done on every request that could be done once at startup.
   - Flag any computation repeated across requests that could be cached.

6. **Frontend performance is user-visible.**
   - Bundle size increases must be justified. Flag any addition over 5KB.
   - Rendering must not trigger layout thrashing.
   - Flag any component that re-renders on every parent update without memoization.
   - Flag any image/video without size optimization or lazy loading.
   - Flag any third-party script loaded synchronously.
   - Large client-side data structures that grow unbounded are memory leaks.

7. **Concurrency and parallelism must be correct and efficient.**
   - Lock contention that serializes independent work is a finding.
   - Thread/process pools sized without regard to the workload are findings.
   - Flag any mutex held during I/O.
   - Flag any goroutine/thread that could leak (no context cancellation, no done channel).

## Primary Performance Questions

For every meaningful change, ask:

- What is the time complexity? Can you state it? Can you verify it?
- What is the memory complexity? Does it grow with input size? Is it bounded?
- How does this behave at 10x the current load? 100x?
- Does this make a network or database call? How many? Per what unit of work?
- Is there a loop that hides an expensive operation?
- Does this allocate memory proportional to something the caller controls?
- Is there a cached result that could replace repeated computation?
- Does this hold a resource (lock, connection, file handle) longer than necessary?
- Does this serialize or parse data unnecessarily?
- Would this be faster with a different data structure?

## What to Flag Aggressively

- N+1 queries (any query in a loop).
- Unbounded queries without LIMIT.
- Loading entire datasets into memory.
- Sequential network calls that could be parallel.
- Network calls inside loops.
- Missing database indexes on query columns.
- Synchronous I/O in request handlers.
- Unbounded caches (LRU, TTL, or max-size needed).
- Deep clones where references suffice.
- Repeated serialization/deserialization of the same data.
- Bundle size increases without justification.
- Component re-renders without memoization in hot paths.
- Logging in hot paths without level gating.
- Missing timeouts on external calls.
- Retry without exponential backoff.
- Lock contention during I/O operations.
- O(n²) or worse complexity without justification.

## Preferred Remedies

- Batch queries instead of looping.
- Add LIMIT to unbounded queries.
- Stream results instead of collecting into memory.
- Parallelize independent network calls.
- Add an index. Measure. Add the right index.
- Cache bounded by size or TTL.
- Replace deep clone with shallow copy or reference.
- Gate logging with level checks.
- Move one-time computation to initialization.
- Use a more efficient data structure for the access pattern.
- Lazy-load or code-split frontend modules.
- Memoize components that re-render with the same props.
- Set timeouts and circuit breakers on external calls.

Do not be satisfied with "it's fast enough on my machine."
Do not be satisfied with "we can optimize later" when the architecture makes optimization hard.

## Review Tone

Be direct, serious, and demanding about performance.
A performance problem in production is an outage, not an inconvenience.
If the code will not scale, say so clearly.
If the design creates a bottleneck, say that clearly too.

Good phrases:

- `this query runs inside a loop. that's N+1. batch it or use a JOIN.`
- `this loads the entire table into memory. at 10M rows this is an OOM. stream it.`
- `this endpoint makes 5 sequential HTTP calls. parallelize them with Promise.all.`
- `this caches results but never evicts. this is a memory leak. add an LRU or TTL.`
- `this re-renders on every parent state change. wrap it in React.memo or move the state down.`
- `this is O(n²). for 10k items that's 100M operations. use a Map or sort + two-pointer.`
- `this holds a database connection for 200ms while doing CPU work. release the connection first.`
- `this adds 15KB to the bundle. lazy-load it.`

## Output Expectations

Prioritize findings in this order:

1. Algorithmic complexity problems (O(n²), exponential, unbounded)
2. Database query anti-patterns (N+1, missing indexes, unbounded)
3. Memory issues (unbounded growth, unnecessary copies, leaks)
4. Network inefficiency (sequential calls, calls in loops, missing timeouts)
5. Hot path violations (unnecessary allocation, synchronous I/O, ungated logging)
6. Frontend performance (bundle size, re-renders, layout thrashing)
7. Concurrency issues (lock contention, resource leaks)

Do not flood the review with micro-optimizations if there are systemic scalability problems.
A single N+1 query in a request handler outweighs a hundred "use const instead of let" suggestions.

## Approval Bar

Do not approve merely because the code is correct.
The bar for approval is:

- no O(n²) or worse complexity without explicit justification and bounded input
- no N+1 queries or queries inside loops
- no unbounded data loading into memory
- no sequential network calls where parallel is safe
- no unbounded caches
- no synchronous I/O in request handlers
- no bundle size increases without justification

Treat these as presumptive blockers:

- the PR introduces an N+1 query pattern
- the PR loads an unbounded dataset into memory
- the PR makes sequential external calls that could be parallel
- the PR adds O(n²) complexity to a hot path
- the PR introduces an unbounded cache or growing data structure
- the PR adds synchronous I/O to a request handler
- the PR increases bundle size by more than 5KB without justification
