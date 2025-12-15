## 2025-05-23 - Multiverse Map Implementation
- **Playwright Visibility Checks**: When verifying interactive elements like buttons, `force=True` is often necessary if the element is inside a collapsed sidebar or technically "outside viewport" due to CSS transitions, even if logically clickable.
- **Graph Visualization**: Integrated `@xyflow/react` successfully. Using `dagre` for auto-layout requires transforming the node positions to match React Flow's top-left anchor, whereas Dagre uses center-center.
- **Unified Graph Data**: Syncing canonical DB tables (Scene) with a graph-specific table (TimelineNode) allows for a hybrid approach where the main story is preserved but branching is flexible.
## 2024-05-23 - Storybook Co-location & Configuration

I refactored the Storybook configuration to support co-located stories (`components/**/*.stories.tsx`) instead of a separate `stories/` directory. This aligns with modern component-driven development practices.

**Learnings:**
- **Vite/Rollup Warnings:** Dependencies using `"use client"` directives (like Radix UI) generate warnings during the Storybook build process because they are treated as module-level directives. These are safe to ignore in the context of the static build.
- **Storybook Configuration:** Updating `.storybook/main.ts` to include `../components/**/*.stories.@(ts|tsx)` was sufficient to discover the new files.
- **Accessibility:** Enabled `@storybook/addon-a11y` to improve accessibility testing coverage for UI components.

## 2024-05-24 - Accessibility Labels for Dynamic Lists
**Learning:** Icon-only buttons in dynamic lists (like favorite toggles or reordering controls) require dynamic ARIA labels (e.g., "Add GPT-4 to favorites") rather than generic ones to be truly accessible.
**Action:** Always inject item context (names/IDs) into the `aria-label` of repetitive interactive elements.

## 2025-12-13 - Accessibility for Custom Disclosures
**Learning:** Custom disclosure widgets built with `framer-motion` often lack critical ARIA attributes (`aria-expanded`, `aria-controls`) unlike Radix primitives.
**Action:** Explicitly add `aria-expanded` and `aria-controls` to toggle buttons and ensure the content container has a matching `id` for accessible custom animations.

## 2025-05-20 - Premium Glassmorphism & Visual Hierarchy

I redesigned the Projects and Generation interfaces to adhere to a "Premium" Native macOS aesthetic.

**Learnings:**
- **Liquid Glass:** Enhancing the standard glass card with `backdrop-blur-[30px]`, `bg-glass/50`, and a softer border creates a much more "premium" feel than standard `backdrop-blur-md` with solid borders. The key is reducing opacity and increasing blur radius.
- **Layout Breathing Room:** Increasing padding from `p-6` to `p-12` and grid gaps from `4` to `8` significantly improves the "Professional" perception, reducing visual clutter.
- **Semantic Colors:** Shifting the primary accent from "SaaS Blue" to a "Creative Violet" (`hsl(262, 80%, 60%)`) aligns better with the "World Builder" persona, making the UI feel distinct and branded rather than generic.

## 2025-05-25 - Actionable Empty States
**Observation:** The "Projects" page empty state was a dead end, informing the user of zero projects but providing no path to create one.
**Recommendation:** Always include a primary CTA (Call to Action) in Empty States to guide the user to the next step, converting a "dead end" into a "starting point".
