---
description: Add a new feature to the application
---

# Feature Addition Workflow

Follow this systematic approach when adding new features to ensure consistency, quality, and maintainability.

## Phase 1: Planning and Design

### 1. Understand Requirements
- [ ] Clarify feature requirements and acceptance criteria
- [ ] Identify affected components and systems
- [ ] Consider edge cases and error scenarios
- [ ] Review similar existing features for consistency

### 2. Design Considerations
- [ ] Determine if feature requires new database tables/columns
- [ ] Identify required API endpoints
- [ ] Plan component hierarchy and data flow
- [ ] Consider server vs client component boundaries
- [ ] Plan for accessibility requirements
- [ ] Consider performance implications

### 3. Update Documentation
- [ ] Add feature to CHANGELOG.md (under "Unreleased")
- [ ] Update relevant docs if architecture changes
- [ ] Document any new environment variables

## Phase 2: Database Changes (if needed)

### 1. Update Schema

```bash
# Edit lib/db/schema.ts to add new tables/columns
```

### 2. Generate Migration

```bash
# Generate migration from schema changes
pnpm db:generate
```

### 3. Review and Apply Migration

```bash
# Review generated SQL in lib/db/migrations
# Apply migration locally
pnpm db:migrate
```

### 4. Update Queries

```typescript
// Add new query functions to lib/db/queries.ts
// Follow existing patterns for consistency
// Include proper TypeScript types
```

## Phase 3: Backend Implementation

### 1. Create API Routes (if needed)

```typescript
// app/(feature)/api/[endpoint]/route.ts
// - Validate authentication/authorization
// - Validate request body/params
// - Handle errors appropriately
// - Return consistent response format
// - Add proper TypeScript types
```

### 2. Server Actions (if needed)

```typescript
// app/(feature)/actions.ts
// - Use 'use server' directive
// - Validate inputs
// - Handle errors
// - Return typed responses
```

### 3. Add Business Logic

- [ ] Keep logic in appropriate layers (queries, actions, utils)
- [ ] Ensure proper error handling
- [ ] Add input validation
- [ ] Consider rate limiting if applicable

## Phase 4: Frontend Implementation

### 1. Create Components

```typescript
// components/[feature]/[component-name].tsx
// - Use TypeScript with proper types
// - Follow existing component patterns
// - Use shadcn/ui components where appropriate
// - Ensure accessibility (ARIA labels, keyboard navigation)
// - Add proper error boundaries
```

### 2. Component Guidelines

- [ ] Use Server Components by default
- [ ] Add 'use client' only when needed (hooks, interactivity, browser APIs)
- [ ] Keep components small and focused
- [ ] Extract reusable logic to custom hooks
- [ ] Use design system tokens (see docs/design-system.md)

### 3. State Management

- [ ] Lift state to lowest common parent
- [ ] Use URL state for shareable/bookmarkable state
- [ ] Consider server state (React Query patterns) for data fetching
- [ ] Use React Context sparingly

### 4. Styling

- [ ] Use Tailwind utility classes
- [ ] Follow design system tokens (bg-primary, text-muted-foreground, etc.)
- [ ] Ensure dark mode compatibility
- [ ] Test responsive behavior (mobile, tablet, desktop)

## Phase 5: Testing

### 1. Unit Tests

```bash
# Create test file: tests/unit/[feature]/[component].test.tsx
pnpm exec vitest tests/unit/[feature] --watch
```

### 2. Integration Tests

```bash
# Create test file: tests/integration/[feature].test.ts
pnpm exec playwright test tests/integration/[feature].test.ts
```

### 3. Accessibility Tests

```bash
# Add a11y checks to tests/accessibility/[feature].test.ts
pnpm exec playwright test tests/accessibility
```

### 4. Test Coverage Checklist

- [ ] Happy path scenarios
- [ ] Error handling
- [ ] Edge cases
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Responsive behavior

## Phase 6: Code Quality

### 1. Run Linter and Formatter

// turbo
```bash
# Format and fix code automatically
npx ultracite fix
```

### 2. Type Check

// turbo
```bash
# Ensure no TypeScript errors
pnpm tsc --noEmit
```

### 3. Run All Tests

```bash
# Unit tests
pnpm exec vitest run --coverage

# Integration/E2E tests
pnpm exec playwright test
```

## Phase 7: Documentation and Review

### 1. Update Documentation

- [ ] Add JSDoc comments to complex functions
- [ ] Update architecture docs if needed
- [ ] Add usage examples for new components
- [ ] Update README if user-facing changes

### 2. Self-Review Checklist

- [ ] Code follows project conventions (see .agent/context/conventions.md)
- [ ] No console.log or debugger statements
- [ ] Proper error handling throughout
- [ ] Accessibility requirements met
- [ ] Tests are comprehensive and passing
- [ ] No TypeScript errors or warnings
- [ ] Performance considerations addressed
- [ ] Security considerations addressed (no exposed secrets, proper validation)

### 3. Prepare for PR

- [ ] Commit with descriptive message
- [ ] Update CHANGELOG.md with user-facing changes
- [ ] Ensure all tests pass in CI
- [ ] Request code review

## Common Patterns

### Server Component with Data Fetching

```typescript
// app/(feature)/page.tsx
import { getFeatureData } from '@/lib/db/queries';

export default async function FeaturePage() {
  const data = await getFeatureData();
  
  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

### Client Component with Interactivity

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function InteractiveFeature() {
  const [state, setState] = useState(false);
  
  return (
    <Button onClick={() => setState(!state)}>
      Toggle
    </Button>
  );
}
```

### API Route with Validation

```typescript
// app/api/feature/route.ts
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';

const requestSchema = z.object({
  field: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const result = requestSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  
  // Process request
  return Response.json({ success: true });
}
```
