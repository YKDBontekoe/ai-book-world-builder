## 2024-05-23 - [Projects Tabs UX]
Refactored the Projects List to use URL-based state (`?tab=`) instead of client-side `Tabs`.
- **Improved Friction**: Users can now share links to "Community" tab. Refreshes persist state.
- **Performance**: Data fetching is now server-side filtered, reducing load for default "My Projects" view.
- **Visuals**: Maintained "Native macOS" aesthetic with pill-shaped links matching `Tabs` style.
- **Learnings**: Server Components + `searchParams` is often superior to Client Components + `nuqs` for simple navigation state.
- **Fixes**: Corrected `GlassCard` border radius to `rounded-lg` (16px) to strictly align with Design System.
## 2025-05-24 - [Composition and Context Refactor]

### Findings
- Extracted `WriterContext` to resolve Prop Drilling in `WriterView` (3 levels deep).
- Refactored `WriterEditor` and `WriterSidebar` to consume context, reducing API surface area.
- Standardized `GlassCard` to use `.glass-panel` utility, removing hardcoded opacity values that conflicted with the design system.
- Introduced `WriterHeader` to improve composition in `WriterEditor`.

### Learnings
- When refactoring deep prop trees, Context is superior to Component Composition if the data is highly specific (like `writerState`) and used by many siblings.
- Design System tokens (like `.glass-panel`) should be the source of truth; hardcoded tailwind classes (like `bg-white/10`) drift over time.
- Verifying legacy `data-testid` expectations is crucial when refactoring component structures.

## 2025-12-21 - [Writer UX & Empty States]

### Findings
- Implemented `SidebarSkeleton` to prevent layout shifts during structure loading in `WriterSidebar`.
- Added specific `EmptyState` for "No Scene Selected" in `WriterEditor` to avoid dead ends.
- Added `aria-label` to icon-only buttons in `WriterSidebar`.

### Learnings
- **Empty States vs Start States**: `WriterEditor` distinguishes between "No scenes exist" (Start) and "No scene selected" (Navigation). This nuance is critical for guiding user intent.
- **Accessibility drives Testability**: Adding `aria-label` to icon buttons made them easily testable with `getByRole`, reinforcing the value of semantic HTML.

## 2025-12-21 - [Dead Code Cleanup]

### Findings
- Removed experimental 'Timeline' feature (components, tools, schema) which was deprecated.
- Removed unused AI tools (`getWeather`, `suggestPlot`, `createRelation`) and associated types.
- Cleaned up `lib/types.ts` `ChatTools` to match the actual tool registry, removing ghost tools.

### Learnings
- **Tool Registry is Truth**: `lib/ai/tool-registry.ts` determines what the AI sees. Types in `lib/types.ts` should mirror this to prevent confusion.
- **Example Code Rot**: `getWeather` is a classic example that persists in codebases. Periodic audits of `lib/ai/tools` are necessary.

## 2025-12-22 - [Liquid Glass UI Polish]

### Findings
- Enhanced `ResizableHandle` with invisible touch targets and liquid hover effects to mimic native macOS interaction.
- Upgraded `FloatingAssistant` to use `GlassCard` with `liquid` variant, ensuring visual consistency with the system.
- Implemented visual verification script `verify_ui_polish.py` to capture UI states.

### Learnings
- **Invisible Touch Targets**: Expanding hit areas via `after` pseudo-elements is essential for thin resize handles, improving usability without compromising the 1px visual aesthetic.
- **Glass Card Composition**: `GlassCard` encapsulates complex blur/border logic, making it easy to upgrade standard `Card` components, but local overrides (like `rounded-2xl`) may be needed for specific contexts.
- **Verification Overlays**: Playwright tests interacting with dialogs must account for `GlassOverlay` intercepting clicks on background elements.
