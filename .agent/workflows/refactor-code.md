---
description: Refactor code safely and effectively
---

# Code Refactoring Workflow

Follow this workflow to refactor code safely while maintaining functionality and improving quality.

## When to Refactor

Refactor when you notice:
- Duplicated code across multiple files
- Functions/components that are too long or complex
- Poor naming or unclear abstractions
- Difficult-to-test code
- Performance bottlenecks
- Violations of coding standards

## Phase 1: Preparation

### 1. Ensure Test Coverage

**Critical: Never refactor code without tests!**

```bash
# Check current test coverage
pnpm exec vitest run --coverage

# If coverage is low, add tests first
```

### 2. Identify Refactoring Scope

- [ ] What code needs to be refactored?
- [ ] What is the desired end state?
- [ ] What are the benefits of refactoring?
- [ ] What are the risks?

### 3. Plan Incremental Steps

Break large refactorings into small, testable steps:
- Each step should be independently verifiable
- Each step should maintain functionality
- Commit after each successful step

## Phase 2: Common Refactoring Patterns

### Extract Function

**Before:**
```typescript
function processUser(user: User) {
  // Validation logic (20 lines)
  // Processing logic (30 lines)
  // Formatting logic (15 lines)
}
```

**After:**
```typescript
function processUser(user: User) {
  validateUser(user);
  const processed = processUserData(user);
  return formatUserOutput(processed);
}

function validateUser(user: User) {
  // Validation logic
}

function processUserData(user: User) {
  // Processing logic
}

function formatUserOutput(data: ProcessedUser) {
  // Formatting logic
}
```

### Extract Component

**Before:**
```typescript
function Dashboard() {
  return (
    <div>
      {/* 200 lines of JSX */}
    </div>
  );
}
```

**After:**
```typescript
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
}
```

### Extract Custom Hook

**Before:**
```typescript
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUser().then(setUser).catch(setError).finally(() => setLoading(false));
  }, []);
  
  // Component logic
}
```

**After:**
```typescript
function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).catch(setError).finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId);
  // Component logic
}
```

### Consolidate Duplicate Code

**Before:**
```typescript
// In multiple files
async function fetchUserData() {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('Failed');
  return response.json();
}

async function fetchPostData() {
  const response = await fetch('/api/posts');
  if (!response.ok) throw new Error('Failed');
  return response.json();
}
```

**After:**
```typescript
// lib/utils/api.ts
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

// Usage
const userData = await fetchAPI<User>('/api/user');
const postData = await fetchAPI<Post[]>('/api/posts');
```

### Improve Naming

**Before:**
```typescript
function proc(d: any) {
  const x = d.map(i => i.val);
  return x.filter(v => v > 0);
}
```

**After:**
```typescript
function getPositiveValues(items: DataItem[]): number[] {
  const values = items.map(item => item.value);
  return values.filter(value => value > 0);
}
```

### Replace Magic Numbers/Strings

**Before:**
```typescript
if (user.role === 'admin') {
  // Admin logic
}

setTimeout(callback, 5000);
```

**After:**
```typescript
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

const TIMEOUTS = {
  DEBOUNCE: 300,
  AUTO_SAVE: 5000,
  SESSION: 3600000,
} as const;

if (user.role === USER_ROLES.ADMIN) {
  // Admin logic
}

setTimeout(callback, TIMEOUTS.AUTO_SAVE);
```

## Phase 3: Refactoring Process

### 1. Run Tests Before Changes

```bash
# Ensure all tests pass before refactoring
pnpm exec vitest run
pnpm exec playwright test
```

### 2. Make Incremental Changes

- [ ] Make one small change at a time
- [ ] Run tests after each change
- [ ] Commit if tests pass
- [ ] Revert if tests fail

### 3. Maintain Functionality

- [ ] Don't change behavior while refactoring
- [ ] Keep the same public API
- [ ] Preserve error handling
- [ ] Maintain performance characteristics

### 4. Update Tests if Needed

```typescript
// If internal structure changes, update tests
// But maintain the same test coverage

// Before:
test('processUser validates input', () => {
  expect(() => processUser(null)).toThrow();
});

// After refactoring, test might change to:
test('validateUser throws on invalid input', () => {
  expect(() => validateUser(null)).toThrow();
});
```

## Phase 4: Verification

### 1. Run Full Test Suite

// turbo
```bash
# Unit tests
pnpm exec vitest run --coverage

# Integration tests
pnpm exec playwright test

# Type check
pnpm tsc --noEmit
```

### 2. Check Code Quality

// turbo
```bash
# Lint and format
npx ultracite fix
```

### 3. Manual Testing

- [ ] Test the refactored functionality manually
- [ ] Verify edge cases
- [ ] Check performance hasn't degraded
- [ ] Test on different browsers/devices if UI changes

### 4. Review Changes

- [ ] Code is more readable
- [ ] Complexity is reduced
- [ ] Duplication is eliminated
- [ ] Naming is clear
- [ ] Tests still pass
- [ ] No new bugs introduced

## Phase 5: Documentation

### 1. Update Comments

```typescript
// Remove outdated comments
// Add new comments for complex logic
// Update JSDoc if API changed
```

### 2. Update Documentation

- [ ] Update architecture docs if structure changed
- [ ] Update README if user-facing changes
- [ ] Add migration guide if breaking changes

### 3. Update CHANGELOG

```markdown
# Add to CHANGELOG.md under "Changed"
- Refactored [component/module] to improve [readability/performance/maintainability]
```

## Refactoring Checklist

Before starting:
- [ ] Tests exist and pass
- [ ] Understand the code being refactored
- [ ] Have a clear goal for the refactoring

During refactoring:
- [ ] Make small, incremental changes
- [ ] Run tests frequently
- [ ] Commit after each successful step
- [ ] Don't change behavior

After refactoring:
- [ ] All tests pass
- [ ] Code quality improved
- [ ] No new bugs introduced
- [ ] Documentation updated
- [ ] Changes reviewed

## Red Flags - When to Stop

Stop refactoring if:
- Tests start failing unexpectedly
- Scope keeps expanding
- You're changing behavior, not structure
- You don't understand the code well enough
- There's no clear improvement

## Best Practices

1. **Boy Scout Rule**: Leave code better than you found it
2. **Test First**: Never refactor without tests
3. **Small Steps**: Make tiny, verifiable changes
4. **One Thing**: Refactor OR add features, not both
5. **Commit Often**: Each step should be committable
6. **Pair Review**: Get feedback on large refactorings
7. **Measure**: Use metrics to verify improvements

## Tools

```bash
# Code complexity analysis
npx complexity-report

# Find duplicated code
npx jscpd

# Visualize dependencies
npx madge --circular --extensions ts,tsx .

# Bundle size analysis
pnpm build && npx @next/bundle-analyzer
```
