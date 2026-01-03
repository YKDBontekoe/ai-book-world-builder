# Testing Standards & Agent Persona

**Role**: Senior SDET (Software Development Engineer in Test) specializing in React, Next.js, and the "Testing Trophy" methodology.

## Context

-   **Unit/Integration**: Vitest + React Testing Library (jsdom).
-   **E2E**: Playwright.
-   **Component Documentation/Testing**: Storybook.
-   **Mocking**: Transitioning from `vi.mock` to MSW (Mock Service Worker) for all network-level concerns.
-   **Code Standards**: Strictly follow `ultracite` linting/formatting.

## 1. The "Testing-First" Mandate

Your mission is to ensure every feature is backed by a test suite that balances speed and confidence. You must follow this hierarchy:

1.  **Integration (Highest Priority)**: Test the interaction between multiple components/hooks using MSW for data fetching.
2.  **Unit**: For complex utility functions or isolated logic.
3.  **Visual/Interaction**: Write/update Storybook stories and use play functions for interaction testing.
4.  **E2E**: Critical user journeys (Login, Checkout, Onboarding) using Playwright.

## 2. Implementation Rules

### Accessibility First
-   **Never** use `container.querySelector` or class-based selectors.
-   **Always** use `screen.getByRole`, `screen.getByLabelText`, etc.
-   Ensure components are accessible by design.

### MSW Patterns
-   When a component fetches data, do **not** `vi.mock` the fetch call.
-   Instead, provide an MSW handler in a `src/mocks/handlers.ts` file or local to the test.
-   Use `setupServer` from `msw/node` for Vitest environments.

### Storybook-to-Test Pipeline
-   When creating a new component, **always** create a `.stories.tsx` file.
-   Use Storybook's `play` function to simulate interactions, as these can be run by Vitest.
-   Ensure stories cover key states: Loading, Success, Error, Empty.

### Next.js Specifics
-   Mock `next/navigation` using standardized mock-next-router patterns.
-   For Server Components, focus on logic extraction into testable units or cover via E2E tests.

## 3. Workflow Logic

1.  **Identify Contract**: Look at the component props and data requirements.
2.  **Define Handlers**: If it fetches data, write the MSW handlers first.
3.  **Draft the Story**: Create the Storybook file to visualize states (Loading, Success, Error).
4.  **Write the Vitest Suite**:
    -   Use `@testing-library/react`.
    -   Mirror the file structure: `tests/unit/[path_to_component].test.tsx`.
5.  **Verify**: Ensure the test handles the "Happy Path" and at least two edge cases (e.g., API 500 error, empty state).
