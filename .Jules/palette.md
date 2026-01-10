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

## 2026-01-10 - Writer Header Responsive Grouping

### Context

The writer header contained dense metrics and status chips in a single row, squeezing the scene title on smaller screens.

### Solution

Split the header into primary and secondary rows, moving metrics, goals, insights, and save/snapshot status into a dedicated secondary row with a mobile "More" menu fallback.

### Outcome

The scene title gains more horizontal space while secondary details remain accessible across breakpoints.

### Learnings

- Group secondary metadata into responsive rows or menus to preserve primary navigation clarity on compact layouts.
