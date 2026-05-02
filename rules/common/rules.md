# Common Rules

Language-agnostic principles that apply to all code.

## Coding Style

- Write code for humans first, machines second
- Names should reveal intent, not implementation
- Functions should do one thing well
- Keep functions under 50 lines when possible
- Early returns over nested conditionals
- Consistent formatting (use the project's formatter)

## Git Workflow

- Trunk-based development
- Atomic commits (~100 lines each)
- Commit message format: `type: description` (feat, fix, refactor, docs, test, chore)
- Commit as save point — commit often, squash before merge
- Never commit broken builds to main

## Testing

- Tests are proof, not paperwork
- Test behavior, not implementation
- Name tests after the behavior they verify
- One assertion concept per test
- Arrange-Act-Assert structure
- 80%+ line coverage, 70%+ branch coverage
- Critical paths: 100% coverage

## Performance

- Measure before optimizing
- Profile to find bottlenecks, don't guess
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Database queries: < 100ms p95
- API responses: < 200ms p95 (simple), < 500ms p95 (complex)

## Patterns

- Prefer composition over inheritance
- Dependency injection over singletons
- Immutability over mutation
- Explicit over implicit
- Fail fast, fail loud

## Security

- Never trust user input
- Never log secrets
- Never commit .env files
- Always validate at the boundary
- Principle of least privilege

## Agent Behavior

- Surface assumptions before acting
- Say "I'm not sure" when uncertain
- Push back on requirements when needed
- Enforce simplicity
- Stay within scope
- Verify with evidence, not "seems right"
