---
description: Debug and fix issues systematically
---

# Debugging Workflow

Follow this systematic approach to debug and fix issues efficiently.

## Phase 1: Reproduce the Issue

### 1. Gather Information

- [ ] Read error message and stack trace carefully
- [ ] Note the exact steps to reproduce
- [ ] Identify the environment (dev, staging, production)
- [ ] Check if issue is consistent or intermittent
- [ ] Review recent changes that might be related

### 2. Reproduce Locally

```bash
# Start dev server
pnpm dev

# Follow reproduction steps
# Document exact sequence that triggers the issue
```

### 3. Collect Evidence

- [ ] Screenshot or screen recording of the issue
- [ ] Browser console errors (if frontend issue)
- [ ] Server logs (if backend issue)
- [ ] Network tab for failed requests
- [ ] Database state if relevant

## Phase 2: Isolate the Problem

### 1. Identify the Layer

Determine where the issue originates:

- **Frontend/UI**: Component rendering, state management, user interactions
- **API/Backend**: Route handlers, server actions, business logic
- **Database**: Queries, migrations, data integrity
- **External Services**: AI models, authentication, blob storage
- **Build/Deploy**: Configuration, environment variables

### 2. Narrow Down the Scope

```typescript
// Add strategic console.logs or debugger statements
console.log('Debug checkpoint 1:', variable);

// Use React DevTools for component inspection
// Use Network tab for API debugging
// Use Database client for query debugging
```

### 3. Check Common Culprits

- [ ] Environment variables missing or incorrect
- [ ] TypeScript type mismatches
- [ ] Async/await issues or race conditions
- [ ] Null/undefined values
- [ ] Authentication/authorization failures
- [ ] CORS issues
- [ ] Database connection problems

## Phase 3: Diagnose Root Cause

### 1. Use Debugging Tools

**For Frontend Issues:**
```bash
# React DevTools
# - Inspect component props and state
# - Check component hierarchy
# - Monitor re-renders

# Browser DevTools
# - Console for errors
# - Network for API calls
# - Application for storage/cookies
```

**For Backend Issues:**
```typescript
// Add detailed logging
console.error('Error details:', {
  error: error.message,
  stack: error.stack,
  context: relevantData,
});

// Use debugger in VS Code
// Set breakpoints in route handlers or server actions
```

**For Database Issues:**
```bash
# Check migration status
pnpm db:migrate

# Run query directly in database client
# Verify data integrity
# Check for missing indexes
```

### 2. Form Hypothesis

- [ ] What is the expected behavior?
- [ ] What is the actual behavior?
- [ ] Why is there a discrepancy?
- [ ] What code is responsible?

### 3. Test Hypothesis

- [ ] Make minimal changes to test theory
- [ ] Verify if changes affect the issue
- [ ] Rule out alternative explanations

## Phase 4: Implement Fix

### 1. Plan the Fix

- [ ] Identify minimal change needed
- [ ] Consider side effects and edge cases
- [ ] Ensure fix doesn't break existing functionality
- [ ] Plan for backward compatibility if needed

### 2. Implement Solution

```typescript
// Example: Fixing null reference error
// Before:
const value = data.user.name; // Error if user is null

// After:
const value = data.user?.name ?? 'Unknown';
```

### 3. Add Defensive Code

```typescript
// Add validation
if (!data || !data.user) {
  console.error('Invalid data structure:', data);
  return defaultValue;
}

// Add error boundaries for React components
// Add try-catch for async operations
// Add input validation for API routes
```

## Phase 5: Add Regression Tests

### 1. Create Test Case

```typescript
// tests/unit/[feature]/[component].test.tsx
import { describe, it, expect } from 'vitest';

describe('Bug fix: [Issue description]', () => {
  it('should handle null user gracefully', () => {
    const result = processUser(null);
    expect(result).toBe('Unknown');
  });
});
```

### 2. Test Edge Cases

- [ ] Null/undefined values
- [ ] Empty arrays/objects
- [ ] Invalid input types
- [ ] Boundary conditions
- [ ] Error scenarios

### 3. Run Test Suite

// turbo
```bash
# Run all tests to ensure no regressions
pnpm exec vitest run
pnpm exec playwright test
```

## Phase 6: Verify Fix

### 1. Test Original Reproduction Steps

- [ ] Follow exact steps that caused the issue
- [ ] Verify issue no longer occurs
- [ ] Test related functionality still works

### 2. Test Edge Cases

- [ ] Test with different data
- [ ] Test with different user roles
- [ ] Test on different browsers/devices
- [ ] Test error handling

### 3. Code Quality Check

// turbo
```bash
# Lint and format
npx ultracite fix

# Type check
pnpm tsc --noEmit
```

## Phase 7: Document and Deploy

### 1. Update Documentation

```markdown
# Add to CHANGELOG.md under "Fixed"
- Fixed [issue description] that occurred when [scenario]
```

### 2. Add Code Comments

```typescript
// Add explanatory comments for non-obvious fixes
// Explain why the fix works
// Reference issue number if applicable
```

### 3. Commit Changes

```bash
git add .
git commit -m "fix: [concise description of fix]

- Detailed explanation of the issue
- How the fix addresses it
- Any side effects or considerations

Fixes #[issue-number]"
```

## Common Debugging Scenarios

### React Component Not Rendering

1. Check component is exported correctly
2. Verify import path is correct
3. Check for JavaScript errors in console
4. Verify props are passed correctly
5. Check conditional rendering logic

### API Route Returning 500

1. Check server logs for error details
2. Verify request body/params format
3. Check database connection
4. Verify authentication/authorization
5. Check for unhandled promise rejections

### Database Query Failing

1. Test query directly in database client
2. Check for syntax errors
3. Verify table/column names
4. Check for missing migrations
5. Verify data types match schema

### Styling Not Applied

1. Check Tailwind class names are correct
2. Verify CSS specificity
3. Check for conflicting styles
4. Verify dark mode compatibility
5. Check responsive breakpoints

### TypeScript Errors

1. Read error message carefully
2. Check type definitions
3. Verify imports are correct
4. Check for missing type annotations
5. Consider using type guards

## Prevention Tips

- [ ] Write tests before fixing bugs (TDD for bug fixes)
- [ ] Add error boundaries and fallbacks
- [ ] Validate inputs at boundaries
- [ ] Use TypeScript strictly (no `any`)
- [ ] Add logging for critical paths
- [ ] Review code before committing
- [ ] Keep dependencies updated
- [ ] Monitor error tracking (Sentry, etc.)
