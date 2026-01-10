## 2026-01-08 - Replaced Raw Loading Text with Skeletons

### Context
The `ItemDetail` and `CommentSection` components in the GitHub admin interface were using raw `<div>Loading...</div>` text, which broke the "Native macOS" aesthetic.

### Solution
Created specific Skeleton components (`ItemDetailSkeleton` and `CommentSectionSkeleton`) that mirror the layout of the actual components using `GlassCard` and `Skeleton` atoms.

### Outcome
Loading states now transition smoothly and match the rest of the application's design language.

### Learnings
- Always look for opportunities to replace raw loading text with high-fidelity skeletons.
- Skeletons should use `GlassCard` variants to match the container they are loading into.

## 2026-01-10 - Moved Writer Tools into a Rail Layout

### Context
The writing style analyzer and contextual prompts were floating overlays, which competed with the editor for attention and overlapped other UI panels.

### Solution
Relocated the tools into a dedicated right-side rail styled with glass surfaces, keeping the layout consistent with the rest of the writer view.

### Outcome
The tools now live in a predictable column, making them easier to scan without interrupting the writing flow.

### Learnings
- Reserve floating overlays for transient actions; persistent insights belong in structured rails.
