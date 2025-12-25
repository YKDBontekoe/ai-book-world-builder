# Developer Guide

This guide provides technical details for developers contributing to the AI Book World Builder. It covers codebase structure, key patterns, and the verification strategy.

## Codebase Structure

The project uses a standard Next.js 14 App Router structure with some specific conventions:

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── (auth)/          # Authentication routes (login, register)
│   ├── (chat)/          # Main application (Projects, Writer View)
│   ├── (reader)/        # Standalone Reader Mode application
│   ├── actions/         # Server Actions (mutations)
│   └── api/             # API Routes (webhooks, streaming)
├── components/          # React components
│   ├── atoms/           # Low-level UI primitives (Button, Input)
│   ├── molecules/       # Composition of atoms (GlassCard, StatCard)
│   ├── messages/        # Chat message components
│   ├── reader/          # Reader Mode specific components
│   └── writer/          # Writer View components (Sidebar, Editor)
├── lib/                 # Shared logic
│   ├── ai/              # AI Service wrappers (models, tools, providers)
│   ├── db/              # Database schema (Drizzle) and queries
│   ├── generation/      # Book generation pipeline
│   └── services/        # Business logic services (StoryService, Analysis)
└── tests/               # Test suites
    ├── e2e/             # Playwright E2E tests
    └── unit/            # Vitest unit tests
```

## Key Architectural Patterns

### 1. Writer View State
The Writer View (`app/(chat)/projects/[id]/page.tsx`) uses a complex state management strategy:
-   **Server-Side**: Fetches initial structure (Chapters/Scenes) and Project data.
-   **Client-Side**: `WriterProvider` hydrates `WriterContext` and `WriterLayoutContext`.
-   **Hook**: `useWriterState` manages the active chapter/scene and syncs with the URL/History.

### 2. Reader Mode Architecture
Reader Mode (`app/(reader)`) is intentionally isolated from the main Writer app to provide a focused reading experience.
-   **Client-Side Pagination**: We avoid server-side splitting. Instead, we use `column-width: 100vw` in CSS to reflow text into horizontal "pages". `ReaderView` calculates the total width to determine the page count.
-   **Persistence**: Reading progress (chapter + percentage) is debounced and saved via `saveReadingProgress` Server Action. Local settings (theme, font) are stored in `localStorage`.

### 3. Server Actions & Services
We separate controller logic (Server Actions) from business logic (Services):
-   **Server Actions** (`app/actions/`): Handle auth checks, input validation, and calling services. They must check `ensureProjectAccess`.
-   **Services** (`lib/services/`): Pure business logic, database transactions, and AI orchestration.
    -   `StoryService`: Handles scene planning and text generation.
    -   `BookAnalysisService`: Orchestrates entity detection and consistency checks.

### 4. Smart Context (Context Flooding)
To enable the AI to write coherently over long contexts without a Vector DB:
-   **Selection**: The `StoryService` (and `ContextSelection` type) allows selecting relevant entities, outlines, and previous scenes.
-   **Flooding**: We pass the *full text* of the immediately preceding scene and *summaries* of all prior scenes in the chapter to the model context window. This ensures continuity (e.g., characters are in the right room) without exceeding token limits for very long books.

### 5. AI Pipeline
-   **Providers**: `lib/ai/providers.ts` manages connections to OpenRouter/Verel AI SDK.
-   **Tools**: `lib/ai/tools/` contains Zod-validated tools used by the AI Agent.
-   **Generation**: `lib/generation/` implements the state-driven generation pipeline (see `generation-architecture.md`).

## Design System

The project adheres to a **Native macOS Aesthetic** ("Liquid Glass"):
-   **GlassCard**: The primary container. Use `variant='liquid'` for the signature frosted effect.
-   **Motion**: All animations use `ease-spring` (stiffness 400, damping 25).
-   **Tailwind v4**: Defined in `app/globals.css` using the `@theme` directive.

## Verification Strategy

We employ a **Dual Verification Strategy** (`AGENTS.md`) to ensure quality:

### 1. Functional Verification (Vitest)
-   Located in `tests/unit/`.
-   Run: `pnpm test:unit`
-   Mocking: We use `vi.mock` heavily. Note that `server-only` imports must be mocked.

### 2. End-to-End Verification (Playwright)
-   Located in `tests/e2e/`.
-   Run: `pnpm exec playwright test`
-   Strategy: We mock the AI responses to test the *application logic* deterministically.

## Contribution Workflow

1.  **Plan**: Analyze the task and explore the codebase.
2.  **Edit**: Make changes, favoring small, testable units.
3.  **Verify**: Run `pnpm test:unit` and `pnpm exec playwright test` locally.
4.  **Pre-Commit**: Follow the `pre_commit_instructions` tool output.
5.  **Submit**: Commit with a clear message.
