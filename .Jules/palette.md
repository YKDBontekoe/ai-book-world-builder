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
