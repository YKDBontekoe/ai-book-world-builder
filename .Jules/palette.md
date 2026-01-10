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

## 2026-01-10 - Added SQLite Driver Support

### Context
Local development and unit tests needed a lightweight database option without requiring Postgres.

### Solution
Implemented a DB driver switch with a SQLite schema layer and a bootstrap script to initialize a local `.sqlite` file with seed data.

### Outcome
Developers can now run the app against SQLite by toggling `DB_DRIVER` and initializing the database with the mock bootstrap script.

### Learnings
- Keep DB driver selection centralized so server actions and repositories always follow the active driver.
## 2026-01-10 - Mobile overlays preserve editor focus

### Context
The writer layout now uses overlay sheets for navigation and canvas on mobile to avoid shrinking the editor space.

### Solution
Keep the editor as the full-height primary surface while sliding sidebar/canvas panels in as translucent sheets.

### Outcome
Mobile writing stays focused and visually consistent with the macOS glass aesthetic.

### Learnings
- Mobile panels should be overlays so the editor remains the dominant surface.
