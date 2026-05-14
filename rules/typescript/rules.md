# TypeScript Rules

## Type Safety

- Enable strict mode in tsconfig.json
- No implicit any
- Explicit return types on all public functions
- Use `unknown` instead of `any` for unknown values
- Use discriminated unions for state machines
- Prefer `readonly` for immutable data

## Async Patterns

- Always use async/await, never .then() chains
- Always handle errors with try/catch
- Use Promise.all for independent operations
- Use Promise.allSettled when partial failures are expected
- Propagate AbortController for cancellable operations

## React Patterns

- Follow Rules of Hooks (no conditional hooks)
- Include all dependencies in useEffect arrays
- Use React.memo for pure components
- Use useMemo/useCallback for expensive computations
- Hoist state to the lowest common ancestor

## Module System

- Use ES modules (import/export), not CommonJS
- Use verbatimModuleSyntax (type imports separated)
- Barrel exports sparingly (avoid re-exporting everything)
- Absolute imports over relative for deep paths

## Anti-Patterns

- No `any` without explicit justification comment
- No `as any` type assertions
- No mutable exports
- No console.log in production code (use logger)
- No nested ternaries (max 1 level)
- No default exports for React components (use named)
