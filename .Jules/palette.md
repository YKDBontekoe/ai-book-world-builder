## 2024-05-23 - Replaced Raw Loading Text with Skeletons

### Context
The `ItemDetail` and `CommentSection` components in the GitHub admin interface were using raw `<div>Loading...</div>` text, which broke the "Native macOS" aesthetic.

### Solution
Created specific Skeleton components (`ItemDetailSkeleton` and `CommentSectionSkeleton`) that mirror the layout of the actual components using `GlassCard` and `Skeleton` atoms.

### Outcome
Loading states now transition smoothly and match the rest of the application's design language.

### Learnings
- Always look for opportunities to replace raw loading text with high-fidelity skeletons.
- Skeletons should use `GlassCard` variants to match the container they are loading into.
