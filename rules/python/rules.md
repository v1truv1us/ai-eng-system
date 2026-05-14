# Python Rules

## Type Hints

- Type hints on all public functions and methods
- Use type hints for function parameters and return types
- Use Optional[X] for nullable types
- Use Union[X, Y] for multiple types
- Use TypedDict for structured dictionaries
- Use Protocol for structural subtyping

## Code Style

- Follow PEP 8
- Use f-strings for string formatting
- Use list/dict/set comprehensions over loops
- Use context managers (with statement) for resources
- Use dataclasses or pydantic for data models
- Use Enum for constants

## Async Patterns

- Use async/await, not callbacks
- Use asyncio.gather for concurrent operations
- Use async context managers (async with)
- No blocking calls in async functions
- Use aiohttp for async HTTP

## Error Handling

- Catch specific exceptions, not bare except
- Use custom exception classes for domain errors
- Use context managers for cleanup
- Log errors with context, not print()
- Use logging module, not print()

## Anti-Patterns

- No mutable default arguments
- No bare except clauses
- No print() in production code
- No wildcard imports (from module import *)
- No global variables (use classes or modules)
- No __init__.py side effects
