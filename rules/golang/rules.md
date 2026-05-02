# Go Rules

## Code Style

- Follow go fmt (gofumpt preferred)
- Run go vet before committing
- Use goimports for import management
- Table-driven tests for all functions
- Named return values only when documented

## Error Handling

- Always check errors (no _ = fn())
- Wrap errors with fmt.Errorf("%w", err)
- Use sentinel errors for expected conditions
- Use custom error types for complex errors
- Return errors, don't panic

## Concurrency

- Pass context as first parameter
- Use sync.WaitGroup for goroutine coordination
- Close channels from sender, not receiver
- Use select for channel operations
- Use context for cancellation and timeouts

## Interfaces

- Accept interfaces, return concrete types
- Keep interfaces small (1-2 methods)
- Define interfaces where they're used, not where they're implemented
- Use io.Reader/io.Writer for I/O abstraction

## Anti-Patterns

- No init() functions unless necessary
- No goroutines without termination conditions
- No ignored errors without justification
- No package-level mutable state
- No circular dependencies between packages
