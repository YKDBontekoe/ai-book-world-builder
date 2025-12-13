## 2024-05-23 - Storybook Co-location & Configuration

I refactored the Storybook configuration to support co-located stories (`components/**/*.stories.tsx`) instead of a separate `stories/` directory. This aligns with modern component-driven development practices.

**Learnings:**
- **Vite/Rollup Warnings:** Dependencies using `"use client"` directives (like Radix UI) generate warnings during the Storybook build process because they are treated as module-level directives. These are safe to ignore in the context of the static build.
- **Storybook Configuration:** Updating `.storybook/main.ts` to include `../components/**/*.stories.@(ts|tsx)` was sufficient to discover the new files.
- **Accessibility:** Enabled `@storybook/addon-a11y` to improve accessibility testing coverage for UI components.

## 2025-12-13 - Custom Collapsible Accessibility & Testing Strategy

**Learning:**
- **Accessibility:** Custom collapsible implementations (like `ProcessLogs`) often miss `aria-expanded`/`aria-controls` and keyboard focus states. Standardizing on primitives (like Radix UI) or rigorously testing custom implementations with `toHaveAttribute` is crucial.
- **Testing Infrastructure:** The repository's `vitest.config.ts` was implicitly suppressing unit tests by only defining a Storybook project. Explicitly defining a 'unit' project in the workspace configuration is necessary to run isolated component tests alongside Storybook tests.

**Action:**
- Audit other custom toggle buttons for missing `aria-expanded` and focus rings.
- Use the new `unit` test project setup for future component testing.
