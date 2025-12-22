## 2024-05-23 - [Projects Tabs UX]
Refactored the Projects List to use URL-based state (`?tab=`) instead of client-side `Tabs`.
- **Improved Friction**: Users can now share links to "Community" tab. Refreshes persist state.
- **Performance**: Data fetching is now server-side filtered, reducing load for default "My Projects" view.
- **Visuals**: Maintained "Native macOS" aesthetic with pill-shaped links matching `Tabs` style.
- **Learnings**: Server Components + `searchParams` is often superior to Client Components + `nuqs` for simple navigation state.
- **Fixes**: Corrected `GlassCard` border radius to `rounded-lg` (16px) to strictly align with Design System.
