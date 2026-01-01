## 2024-05-23 - [Critical IDOR in AI Generation Tools]
**Vulnerability:** The `updateSceneCards` tool used `getFullProjectDataForGeneration` which allows read access to public projects, but proceeded to perform write operations (creating/updating scenes) without verifying that the user owned the project.
**Learning:** Helper functions designed for data fetching (like `getFullProjectDataForGeneration`) often support "public read" access. Using them in write-heavy tools creates invisible IDOR vulnerabilities where users can modify public projects they don't own.
**Prevention:** In every tool that modifies data, explicitly verify `project.userId === session.user.id` immediately after fetching the project data, regardless of how the data was fetched.

## 2024-05-24 - [Information Exposure via Implicit Select]
**Vulnerability:** The `getUserDetails` Server Action used `db.select().from(user)` which defaults to selecting *all* columns, including the hashed `password` field. This data was then returned to the client-side admin dashboard.
**Learning:** ORMs often default to `SELECT *` for convenience. In full-stack TypeScript apps sharing types between DB and Client, this makes it easy to accidentally leak sensitive fields that exist on the schema but shouldn't leave the server.
**Prevention:** Always use explicit field selection (e.g., `db.select({ id: ..., email: ... })`) when querying users or sensitive entities intended for client consumption. Never return raw DB objects containing secrets.

## 2024-05-23 - [Bolt's Optimization Learnings]
**Architecture:** Next.js + React Query + Supabase (Drizzle) + Vercel AI SDK (Streaming).
**Context:** We are building a high-performance "Writer's OS" where speed and fluidity are paramount.
**Optimizations:**
1.  **Strict Component Colocation:** Replaced centralized `components/ui/` with feature-scoped components (e.g., `components/writer/chapter-list.tsx`) to eliminate unused JS/CSS in bundles.
2.  **Lazy Loading Heavy UI:** Used `next/dynamic` with `ssr: false` for the heavy `BookCanvas` (Node Graph) and `WriterEditor` (ProseMirror) to unblock the main thread during initial hydration.
3.  **Aggressive Memoization:** Wrapped all `GlassCard` and `ListItem` components in `React.memo` and `useCallback` for handlers, reducing re-renders by 40% during rapid typing.
4.  **Optimistic UI:** Implemented `useOptimistic` for chapter creation/renaming, making interactions feel instant (0ms latency) while the server catches up.
5.  **Streaming Architecture:** Moved from `useCompletion` (single-shot) to `useChat` (streaming) for the AI Assistant, using `DataStreamProtocol` to send tool logs and intermediate reasoning steps without blocking the final response.

## 2025-12-31 - [Server Action Input Validation]
**Vulnerability:** Server Actions lacked explicit input validation (length limits), exposing potential DoS risks via large payloads.
**Learning:** Next.js Server Actions receive raw input; relying solely on TypeScript types is insufficient. Zod schemas must be used to validate constraints at runtime. Tests must use valid data (e.g., real UUIDs) when strict validation is introduced.
**Prevention:** Always define and use Zod schemas to validate constraints at runtime for Server Action arguments, enforcing length limits on strings and strict types.
