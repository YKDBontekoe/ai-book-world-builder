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
