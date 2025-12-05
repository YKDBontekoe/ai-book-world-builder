# Testing expectations

This project expects every user-visible change to be covered by fast unit tests, realistic integration flows, and targeted accessibility checks. The guidance below describes the required tooling, where tests live, and which suites must succeed in CI before a pull request can merge.

## Folder structure

```
tests/
  unit/               # Vitest + React Testing Library component hooks and utilities
  integration/        # Playwright flows that exercise multiple components without touching external services
  accessibility/      # Playwright + axe-core a11y audits scoped to key pages and widgets
  e2e/                # Full-stack Playwright scenarios (login, chat flows, document uploads)
  routes/             # Playwright route-level assertions for server responses
```

## Unit testing (Vitest + React Testing Library)

- Write isolated component, hook, and utility tests with **Vitest** and **React Testing Library**. Favor real DOM assertions over snapshots, and stub network calls or timers as close to the component as possible.
- Co-locate helpers inside `tests/unit` (for example, `tests/unit/components` or `tests/unit/hooks`) and reuse shared render utilities instead of re-creating providers per test.
- Keep tests deterministic—avoid timeouts and random inputs unless they are fixed via seeds.
- Sample commands:

```bash
# Run the whole unit suite once with coverage
pnpm exec vitest run --coverage

# Re-run a specific file while developing
pnpm exec vitest tests/unit/components/chat-input.test.tsx --watch
```

## Integration and end-to-end testing (Playwright)

- Use **Playwright** for user journeys that span multiple components or services. Target happy paths and critical error handling (e.g., auth failures, network hiccups) instead of duplicating exhaustive unit coverage.
- Place browser-driven flows under `tests/integration` and production-like journeys under `tests/e2e`. Route-level assertions (for example, checking status codes or headers) live in `tests/routes` and share the same Playwright configuration.
- Prefer the shared fixtures in `tests/fixtures.ts` and helper utilities in `tests/helpers.ts` to keep tests concise and consistent.
- Sample commands:

```bash
# Run the full Playwright suite (headless)
pnpm exec playwright test

# Focus on a single project (e2e) or file
pnpm exec playwright test --project=e2e tests/e2e/chat.test.ts

# Inspect interactions in a headed browser while iterating
pnpm exec playwright test --project=e2e tests/e2e/chat.test.ts --headed --debug
```

## Accessibility testing

- Automate accessibility checks alongside Playwright flows by injecting **axe-core** (for example, via `@axe-core/playwright`) into key screens. Capture and fail on WCAG violations instead of relying solely on manual audits. Add the axe dependency to `devDependencies` if it is not already present.
- Scope tests to user-critical paths (chat composition, document upload, navigation menus) and ensure interactive elements have discernible names, focus order, and role semantics.
- Store accessibility-specific specs in `tests/accessibility` and reuse shared Playwright fixtures to keep setup minimal.
- Sample commands:

```bash
# Run only the accessibility specs (uses the shared Playwright config)
pnpm exec playwright test tests/accessibility
```

## What must run in CI before merge

- **Unit suite:** `pnpm exec vitest run --coverage` must pass on CI to merge. Add it to your pipeline once Vitest is configured in the repository.
- **Integration/end-to-end suite:** `pnpm exec playwright test` (all projects) must be green. Pull requests should not merge with any Playwright failures or skipped tests unless explicitly justified.
- **Accessibility checks:** Include the `tests/accessibility` Playwright jobs in CI; treat any reported violations as blocking until triaged or justified.

When adding new tests, update CI workflows to ensure the relevant suite runs automatically. Document any temporary skips in the pull request description and add a follow-up issue to restore coverage.
