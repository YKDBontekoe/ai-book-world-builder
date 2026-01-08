# Architecture Overview

This document summarizes the key modules that power the AI Book World Builder, including the Writer, the Reader, the Brain (AI), and the Library (Database).

## High-Level Design

The application is a Next.js 14 App Router application designed to assist authors in writing fiction. It combines a structured writing environment with generative AI capabilities and a distraction-free reading mode.

## Core Systems

### 1. The Writer (Frontend)
*   **Writer View:** A complex 3-pane layout (Sidebar, Editor, Canvas) managed by `react-resizable-panels`.
*   **State Management:** Heavy use of React Context (`WriterContext`) and optimistic UI updates.
*   **Real-time:** Uses `useOptimistic` for immediate feedback on structural changes.
*   **Code:** `src/components/organisms/writer/`

### 2. The Reader (Consumption)
*   **Reader Mode:** A standalone app shell (`src/app/(reader)`) optimized for long-form reading.
*   **Pagination Engine:** CSS Multi-column layout simulating physical pages.
*   **Isolation:** Bypasses the heavy Writer/Admin logic for performance.
*   **Code:** `src/components/organisms/reader/`

### 3. The Brain (AI Backend)
*   **Providers:** OpenRouter (access to GPT-4, Claude 3, etc.) via `lib/ai/providers.ts`.
*   **Generation Service:** `lib/ai/services/generation-service.ts` abstracts LLM calls.
*   **Context Engine:** `lib/services/story/story-context-builder.ts` constructs prompts using "Smart Context" (immediate text + summaries).
*   **RAG:** Currently uses an in-memory "Structured Context" strategy instead of Vector DBs for reliability and speed.
*   **Tools:** AI can execute tools (e.g., `createDocument`, `requestSuggestions`) defined in `lib/ai/tools`.

### 4. The Library (Database)
*   **PostgreSQL:** Relational data model.
*   **Drizzle ORM:** Type-safe database access via `lib/db/`.
*   **Schema:** `Project` -> `Volume` -> `Chapter` -> `Scene`.
*   **Persistence:** `lib/db/queries.ts` centralizes queries for projects, chats, and documents.

### 5. The Builder (Agentic Workflow)
*   **Jules Agent:** A self-improving agent that can modify the codebase.
*   **TaskBoard:** An admin interface (`src/app/admin/github`) to manage development tasks.
*   **Integration:** Connects to GitHub Issues and PRs.

## Data Flow (Generation)
1.  **User Action:** User requests "Generate Scene".
2.  **Server Action:** `generateScene` (in `app/actions/generation.ts`) is called.
3.  **Context Builder:** Fetches active scene, outline, and relevant entities.
4.  **LLM Call:** Sends prompt to OpenRouter via `GenerationService`.
5.  **Stream:** Text streams back to the client via `AI SDK`.
6.  **Persistence:** Final result is saved to the DB via `WritingService`.

## Security
*   **Authentication:** NextAuth.js (Google, Credentials).
*   **Authorization:** Row-level security checks in every Server Action (`getProjectByIdWithAccess`).
*   **File Uploads:** Validated and stored via Vercel Blob (`src/app/(chat)/api/files/upload/route.ts`).

## Code Map
- Writer View: `src/components/organisms/writer/writer-view.tsx`
- Reader View: `src/components/organisms/reader/reader-view.tsx`
- Generation Logic: `src/lib/services/ai/writing-service.ts`
- Database Schema: `src/lib/db/schema/`
- AI Tools: `src/lib/ai/tools/`
