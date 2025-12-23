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

## 2025-12-22 - [Motion & Continuity Polish]

### Findings
- Implemented `AnimatePresence` and `layout` animations in `WriterSidebar` and `FloatingAssistant` to eliminate visual snapping.
- Used `autoSaveId` in `react-resizable-panels` to persist user workspace layout (Desktop/Mobile split) without backend state.
- Adapted `WriterView` for mobile by toggling `direction="vertical"` via `useMediaQuery`, solving the cramped 3-pane issue.
- Standardized `Dashboard` project list with staggered entry animations using `framer-motion` variants.

### Learnings
- **Animation Coexistence**: `framer-motion`'s `layout` prop works seamlessly with CSS-transitioned components (like `GlassCard`) if `transition-none` is applied to the container to prevent fighting.
- **Responsive Layouts in Client Components**: `useMediaQuery` requires a hydration check (`mounted` state) to avoid server/client mismatch errors, especially when changing layout direction.
- **Persistence Strategy**: `autoSaveId` in `react-resizable-panels` is powerful but requires distinct IDs for different layout directions (`-vertical` vs `-horizontal`) to avoid restoring invalid dimensions (e.g. restoring a 20% width as height).

## 2025-12-23 - [Glass UI Polish]

### Findings
- Refactored `GlassCard` 'subtle' variant to be theme-aware (`bg-glass/20`) instead of hardcoded white.
- Updated `MultimodalInput` to use `rounded-2xl` matching the floating panel aesthetic.
- Fixed stale unit tests for `GlassCard` (expecting `rounded-xl` when component used `rounded-lg`) and `Button` (expecting `bg-glass` utility class instead of semantic `glass` class).

### Learnings
- **CSS Utility Abstraction**: When using `@apply` in classes like `.glass`, unit tests checking `toHaveClass` must check for the semantic class name (`glass`) rather than the underlying utilities (`bg-glass`), as JSDOM doesn't resolve CSS.
- **Test Rot**: Visual components often evolve (e.g., radius changes) without tests being updated if they aren't strictly coupled. Periodic audits of UI tests are valuable.

## 2025-12-24 - [Project Management Workflow Enhancements]

### Findings
- Implemented advanced filtering (Search/Sort) and direct project manipulation (Rename, Duplicate, Delete) on the Projects page.
- Created `ProjectBrowser` to handle client-side filtering and sorting of project lists.
- Integrated `ProjectActionsMenu` with `ProjectCard` using absolute positioning and hover states.

### Learnings
- **Shallow to Deep**: Transforming a static grid into a searchable, sortable browser significantly improves the "Power User" feel without massive backend changes. Client-side filtering is sufficient for initial scaling.
- **Cascading Deletions**: Lacking database-level `ON DELETE CASCADE`, I implemented a robust manual deletion transaction in `deleteProject`. This highlights the importance of keeping the schema dependency graph in mind when performing deletions. The order must be leaf-to-root: `ChapterVersion` -> `Generation` -> `Scene` -> `Chapter` -> `Volume` -> `Outline` -> `Entity` -> `Project`.
- **UI Layering**: Overlaying interactive elements (actions menu) on top of a clickable card (Link) requires careful handling of `z-index` and event propagation (`e.stopPropagation()` and `e.preventDefault()`).
- **Type Narrowing**: Server Actions returning union types (success/error) require explicit checks (e.g., `'error' in result`) in the client to satisfy TypeScript's strict narrowing, especially when properties are not shared.

## 2025-05-20 - Database Migration Recovery

### Findings
- When `drizzle-kit` detects tables in the snapshot that were deleted from the codebase without a migration, it gets stuck in a loop of prompting for renames.
- The fix involves manually cleaning the `meta/_journal.json` and snapshot files to align Drizzle's history with the actual codebase state.

### Learnings
- **Snapshot Drift**: Always run a `DROP TABLE` migration (by deleting the schema and running `db:generate`) *before* removing the code entirely. If you delete the code first, Drizzle assumes it's still there or was renamed.
- **Consistency vs Graph**: Implemented both `ConsistencyService` (Analysis) and `GraphPane` (Visualization) to solve the user's "depth" request holistically.

## 2025-05-21 - [Inspiration UI Polish]

### Findings
- Refactored `InspirationPage` to use `GlassCard` (liquid variant) and `EmptyState` (glass variant) to align with the "Native macOS" aesthetic.
- Created `InspirationLoading` component with detailed skeleton states matching the data grid layout.
- Suppressed `noArrayIndexKey` lint rule in skeleton loops where stable IDs are inherently unavailable.

### Learnings
- **Skeleton Fidelity**: Creating a skeleton that exactly mimics the `GridList` and `GlassCard` layout prevents layout shifts and feels much more "native" than a generic spinner.
- **Visual Consistency**: Standardizing the `EmptyState` usage (specifically the `glass` variant) across features like Projects and Inspiration unifies the user experience and reduces cognitive load.
