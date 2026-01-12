# Testing expectations

This project follows the **Testing Trophy** methodology, prioritizing integration testing of components with mocked data (MSW) and visual verification via Storybook.

## The Hierarchy

1.  **Integration (Highest Priority)**: Vitest + MSW. Tests the interaction between multiple components/hooks.
2.  **Unit**: Vitest. For complex utility functions or isolated logic.
3.  **Visual/Interaction**: Storybook. Visual documentation and interaction tests (via play functions).
4.  **E2E**: Playwright. Critical user journeys (Login, Checkout, Onboarding).

## Folder structure

```
tests/
  unit/               # Vitest: Unit and Integration (MSW) tests
  e2e/                # Playwright: Critical user journeys
src/
  mocks/              # MSW handlers
  **/*.stories.tsx    # Storybook stories (co-located with components)
```

## Integration & Unit (Vitest + MSW)

- **Tooling**: Vitest + React Testing Library + MSW (Mock Service Worker).
- **Strategy**:
    - Favor **Integration** tests that render a component tree and mock network requests using MSW handlers.
    - Avoid `vi.mock` for `fetch` or network calls. Use `src/mocks/handlers.ts` or local test handlers.
    - Test the "Happy Path" and at least two edge cases (e.g., Error 500, Empty State).
- **Accessibility**: Use `screen.getByRole` or `screen.getByLabelText`. Never use class selectors.
- **Commands**:

```bash
# Run unit/integration tests
pnpm test:unit

# Run specific test file
pnpm test:unit tests/unit/path/to/test.test.tsx
```

## Visual & Interaction (Storybook)

- **Tooling**: Storybook + Vitest Browser Mode (via plugin).
- **Strategy**:
    - Every new component must have a `.stories.tsx` file.
    - Use **play functions** in Storybook to simulate user interactions.
    - These stories are automatically tested via Vitest.
- **Commands**:

```bash
# Start Storybook
pnpm storybook

# Run Storybook tests via Vitest
pnpm exec vitest run --project storybook
```

## End-to-End (Playwright)

- **Tooling**: Playwright.
- **Strategy**:
    - Focus on critical user journeys that span full pages and auth flows.
    - Avoid duplicating coverage already provided by Vitest/MSW integration tests.
- **Commands**:

```bash
# Run E2E tests
pnpm test:e2e
```

## CI Requirements

- **Unit/Integration**: `pnpm test:unit` must pass.
- **Storybook**: `pnpm exec vitest run --project storybook` must pass.
- **E2E**: `pnpm test:e2e` must pass.
- **Type Check**: `pnpm type-check` must pass.
