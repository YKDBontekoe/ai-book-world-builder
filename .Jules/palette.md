## 2024-05-23 - Chat UX Robustness
- **Collapsible Logs**: Tool logs can be overwhelming. Making them collapsible by default but expandable for details strikes a good balance between transparency and cleanliness.
- **Retry Strategy**: Implementing a "Retry" on the *last* user message is tricky with optimistic UIs. Using `regenerate()` from the AI SDK works well as it resends the history.
- **Visual Feedback**: Adding subtle animations (like the thinking dots or loading spinners) significantly improves the perceived responsiveness of the app.
## 2024-05-23 - Type Safety Refactoring

*   **Replacing `any` with `unknown`**: When refactoring loose types in a large codebase, replacing `any` with `unknown` (e.g., in `ToolInvocation.args`) is a safer first step than trying to define perfect types immediately. It forces explicit casting or checking at usage sites, revealing assumptions.
*   **Component Mocks in Tests**: Encountered issues with testing library failing to find labels when component mocks don't accurately reflect the DOM structure of complex libraries like Radix UI. Simplistic mocks (e.g., `select` instead of `SelectTrigger` + `SelectContent`) can cause `getByLabelText` to fail if the ID association is lost.
*   **Accessibility Linting**: `ultracite`/Biome is strict about `useSemanticElements` (e.g., `div role="button"`). While fixing these is ideal, pragmatic suppression with comments is sometimes necessary to avoid breaking complex UI interactions (like nested click handlers) or hydration issues without a full rewrite.
## 2024-05-23 - Fixed HTML Nesting in TipCard

Fixed a console error `<p> cannot contain a nested <p>` by changing the outer container of the `TipCard` component from a `<p>` tag to a `<div>` tag. This allows the `TipCard` to validly contain block-level elements (like `<ul>`, `<div>`, `<p>`) passed via the `children` prop, as seen in `GenerationReviewPanel`. This change adheres to HTML specifications and prevents hydration mismatches or layout issues.

## 2025-12-13 - Architectural Improvements: TanStack Query & Strict Typing

- **Centralized API**: Replaced scattered `fetch` calls with a typed `lib/api-client.ts` wrapper. This standardizes error handling and base URL management.
- **State Management**: Introduced `@tanstack/react-query` to replace `useSWR` for server state (fetching). This allows for better caching, background refetching, and mutation handling. Components like `ContextSelectionPanel` now use `useQuery`.
- **Strict Typing in Tools**: Refactored AI tools (e.g., `create-entity`) to use `z.infer<typeof schema>` for arguments instead of `any`. This catches type errors at compile time and improves safety.
- **Verification Performance**: Updated `verification/runner.py` to use `ThreadPoolExecutor` for parallel execution, significantly speeding up the visual verification workflow.
