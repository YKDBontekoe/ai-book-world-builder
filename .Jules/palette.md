## 2024-05-23 - Storybook Co-location & Configuration

I refactored the Storybook configuration to support co-located stories (`components/**/*.stories.tsx`) instead of a separate `stories/` directory. This aligns with modern component-driven development practices.

**Learnings:**
- **Vite/Rollup Warnings:** Dependencies using `"use client"` directives (like Radix UI) generate warnings during the Storybook build process because they are treated as module-level directives. These are safe to ignore in the context of the static build.
- **Storybook Configuration:** Updating `.storybook/main.ts` to include `../components/**/*.stories.@(ts|tsx)` was sufficient to discover the new files.
- **Accessibility:** Enabled `@storybook/addon-a11y` to improve accessibility testing coverage for UI components.
