# Testing Patterns Reference

## Test Structure

### Naming Conventions
- **Test files**: `*.test.ts`, `*.spec.ts`, or `*_test.go` (language-specific)
- **Test names**: `describe("UnitName", () => { it("should do something when condition", ...) })`
- **Go**: `TestUnitName_DoesSomethingWhenCondition(t *testing.T)`

### Test Pyramid
| Layer | Percentage | Purpose | Speed |
|-------|-----------|---------|-------|
| Unit | 70-80% | Test individual functions/methods | Fast (<10ms) |
| Integration | 15-20% | Test component interactions | Medium (<100ms) |
| E2E | 5-10% | Test full user flows | Slow (<10s) |

## Mocking Strategy

### When to Mock
- External services (APIs, databases, file systems)
- Time-dependent operations
- Random number generators
- Network calls

### When NOT to Mock
- Pure functions
- Data transformations
- Business logic that is fast and deterministic
- Internal utility functions

### Mock Patterns

#### TypeScript (Vitest/Jest)
```typescript
// Mock a module
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('{"key": "value"}'),
}));

// Mock with implementation
const mockFetch = vi.fn().mockImplementation((url) => {
  if (url.includes('/api/users')) return Promise.resolve({ id: 1, name: 'Test' });
  return Promise.reject(new Error('Not found'));
});
```

#### Go
```go
// Interface-based mocking
type MockDB struct {
  mock.Mock
}

func (m *MockDB) GetUser(id int) (*User, error) {
  args := m.Called(id)
  return args.Get(0).(*User), args.Error(1)
}
```

## React Testing Patterns

### Component Testing
```typescript
describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Custom Hook Testing
```typescript
describe('useAuth', () => {
  it('returns user when authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider user={{ id: 1, email: 'test@example.com' }}>
          {children}
        </AuthProvider>
      ),
    });
    expect(result.current.user).toEqual({ id: 1, email: 'test@example.com' });
  });
});
```

## API Testing Patterns

### REST Endpoint Testing
```typescript
describe('GET /api/users/:id', () => {
  it('returns 200 with user data', async () => {
    const response = await request(app).get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  it('returns 404 for non-existent user', async () => {
    const response = await request(app).get('/api/users/999');
    expect(response.status).toBe(404);
  });

  it('rate limits after 5 requests', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/users/1');
    }
    const response = await request(app).get('/api/users/1');
    expect(response.status).toBe(429);
  });
});
```

## E2E Testing Patterns (Playwright)

### User Flow Testing
```typescript
test('user can register and login', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // Logout and login
  await page.click('[data-testid="logout"]');
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Testing implementation details | Brittle tests that break on refactoring | Test behavior, not implementation |
| Over-mocking | Tests pass but code is broken | Mock only external dependencies |
| Shared state between tests | Flaky tests that depend on order | Reset state in beforeEach |
| Testing third-party code | Wasted effort, false confidence | Trust library tests, test your integration |
| No assertions | Tests that always pass | Every test must have at least one assertion |
| Giant test files | Hard to navigate, slow to run | Split by feature/unit, max 300 lines |
| Testing private methods | Brittle, couples to implementation | Test through public API |

## Coverage Guidelines

| Metric | Target | Notes |
|--------|--------|-------|
| Line coverage | 80%+ | Not a goal in itself, but a useful metric |
| Branch coverage | 70%+ | More important than line coverage |
| Critical path | 100% | Authentication, payments, data integrity |
| New code | 90%+ | Higher bar for new code |
