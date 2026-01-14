# Developer Guide

This guide provides technical details for developers contributing to the AI Book World Builder. It covers codebase structure, key patterns, and the verification strategy.

## Codebase Structure

The project uses a standard Next.js 14 App Router structure with some specific conventions:

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── (auth)/          # Authentication routes (login, register)
│   ├── (chat)/          # Core application (Project Browser, Settings)
│   ├── (studio)/        # Writer View (Isolated Studio Environment)
│   ├── (reader)/        # Standalone Reader Mode application
│   ├── admin/           # Admin Dashboard (Jules, GitHub)
│   ├── actions/         # Global Server Actions (mutations)
│   └── api/             # API Routes (webhooks, streaming)
├── components/          # Shared React components
│   ├── atoms/           # Low-level UI primitives (Button, Input)
│   ├── molecules/       # Composition of atoms (GlassCard, StatCard)
│   ├── messages/        # Chat message components
│   ├── organisms/       # Complex components (BookCanvas, Settings)
│   └── ...
├── features/            # Feature-scoped components and logic
│   └── writer/          # Writer View implementation (Sidebar, Editor, Context)
├── lib/                 # Shared logic
│   ├── ai/              # AI Service wrappers (models, tools, providers)
│   │   └── tools/       # AI Tools definition
│   ├── db/              # Database schema (Drizzle) and queries
│   └── services/        # Business logic services
└── tests/               # Test suites
    ├── e2e/             # Playwright E2E tests
    └── unit/            # Vitest unit tests
        └── features/
            └── writer/  # Unit tests for the Writer feature
```

## Key Architectural Patterns

## Database Configuration

The app supports both Postgres and SQLite via `DB_DRIVER`:

- `DB_DRIVER=postgres` (default) uses `POSTGRES_URL`.
- `DB_DRIVER=sqlite` uses `SQLITE_DB_PATH` (defaults to `.local/dev.sqlite`).

For a lightweight local SQLite bootstrap (schema + seed data), run:

```bash
pnpm exec tsx scripts/dev-mock-db.ts --reset
```

Then start the app with:

```bash
DB_DRIVER=sqlite SQLITE_DB_PATH=.local/dev.sqlite pnpm dev
```

### 1. Writer View (Studio) Architecture

The Writer View is located in `src/app/(studio)`. It uses a dedicated `StudioLayout` to provide a full-screen environment isolated from the main app shell.

**Key Components**:
The `WriterView` (`src/features/writer/components/writer-view.tsx`) employs a complex 3-pane layout managed by `react-resizable-panels`:

1.  **Sidebar (Left)**: Managed by `WriterSidebar`. Contains navigation (Chapters/Scenes) and Project structure.
2.  **Editor (Center)**: The `WriterEditor` wraps a ProseMirror instance. It is the primary workspace.
3.  **Book Canvas (Right)**: An embedded version of the `BookCanvas`. Displays the Entity Bible, Graphs, and Context.

**State Management**:
The Writer uses a **Split Context** strategy to prevent unnecessary re-renders:
-   **WriterContext**: Holds relatively stable data (`project`, `structure`, `activeSceneId`).
-   **WriterControlContext**: Holds volatile UI state (`isChatOpen`, `isSpotlightOpen`).
-   **WriterLayoutContext**: Handles layout toggles (`ZenMode`, `DirectorMode`, `SidebarOpen`).

**Embedded Canvas Sync**:
The `BookCanvas` is usually a standalone page but is embedded in the Writer View. We use a `CanvasSync` component (`features/writer/components/canvas-sync.tsx`) to synchronize the `WriterContext` state (project ID, read-only status) to the `BookCanvasContext`.

**Lazy Loading**:
To optimize TTI (Time to Interactive), heavy components are lazy-loaded:
-   `FloatingAssistant` (The chat interface)
-   `BookCanvas` (The entity graph/bible)
-   `StructureEditorDialog` (The power editor)

### 2. Command Palette (Writer Spotlight)
The Command Palette is driven by the `useSpotlightItems` hook (`hooks/use-spotlight-items.tsx`).
-   **Registry**: It aggregates "Actions" (static commands), "Entities" (from `useProjectEntities`), and "Scenes" (from `WriterContext`).
-   **Filtering**: It performs client-side fuzzy filtering on the aggregated list.

### 3. Time Travel (History Management)
The Editor History is managed via the `useEditorHistory` hook (`hooks/use-editor-history.ts`), ensuring a linear undo/redo stack distinct from ProseMirror's internal history.
-   **Snapshots**: Every content change (debounced) pushes a snapshot to a local stack.
-   **Preview State**: Activating "Time Travel" enters a preview mode where the editor becomes read-only and displays content from the selected history index.
-   **Restoration**: Confirming a restore creates a new snapshot at the top of the stack with the old content, preserving the forward history.

### 4. Smart Sync (Structure Editor)
The `saveProjectStructure` Server Action (`features/writer/actions/structure.ts`) implements a **Smart Sync** algorithm to allow plain-text editing of the database structure:
1.  **Parse**: Converts the text input into a hierarchical tree (Chapters -> Scenes).
2.  **Normalize**: Converts titles to lowercase and removes accents for fuzzy matching.
3.  **Match**: Queries existing DB records and attempts to match them by title.
    *   *Match Found*: Updates the sequence and title (preserves ID and content).
    *   *No Match*: Creates a new record.
    *   *Missing*: Deletes records that are no longer in the text input.
4.  **Transaction**: All operations occur within a single Drizzle transaction to ensure atomicity.

### 5. Server Actions & Services
We separate controller logic (Server Actions) from business logic (Services):
-   **Server Actions** (`app/actions/` and `features/**/actions`): Handle auth checks, input validation, and calling services. They must check `ensureProjectAccess`.
-   **Services** (`lib/services/`): Pure business logic, database transactions, and AI orchestration.
    -   `StoryService`: Handles scene planning and text generation.
    -   `BookAnalysisService`: Orchestrates entity detection and consistency checks.

### 6. Software Builder (Jules Agent)
We utilize a dedicated "Agentic" workflow for self-improvement, known as the **Software Builder**.

> **See [`docs/jules-integration.md`](jules-integration.md) for a deep dive into the architecture.**

-   **Admin Dashboard**: Located at `/admin/github`. It wraps the `TaskBoard` component to visualize Issues, Plans, and PRs.
-   **Jules Client**: `lib/jules-client.ts` wraps the Google Jules API.
-   **Artifact Renderer**: `src/components/admin/jules/artifact-renderer.tsx` is a reusable component for displaying rich agent outputs like Git patches and terminal logs.
-   **Workflow**:
    1.  **Session**: A long-lived interaction with the agent (`JulesSession`).
    2.  **Planning**: The agent proposes a `JulesPlan` (steps to solve the task).
    3.  **Execution**: The agent generates `JulesArtifact`s (Git patches, bash commands).
    4.  **PR**: The agent opens a Pull Request via the configured GitHub credentials.

### 7. AI Service Architecture
The AI layer is structured to separate "AI Logic" from "Business Logic".

**Core Components**:
-   **GenerationService** (`lib/ai/services/generation-service.ts`): The low-level abstraction for LLM interaction. It handles prompt construction, system message formatting, and calling the Vercel AI SDK. It is agnostic to the business domain (stories, analysis).
-   **WritingService** (`lib/services/ai/writing-service.ts`): The domain-specific service that orchestrates generation. It calls `GenerationService` but adds business rules like batch processing, scene fetching, and access control.

**Batch Processing Strategy**:
Long-running AI tasks (like "Generate All Scenes") are handled in `WritingService.batchWriteChapter` using a concurrency pattern to avoid Vercel Serverless Function timeouts (usually 10-60s):
1.  **Batch Limit**: Processes a maximum of 5 scenes per request.
2.  **Concurrency Limit**: Runs strictly 3 generations in parallel to balance speed vs. rate limits.
3.  **Chunking**: Breaks the task into chunks (e.g., `tasks.slice(i, i + CONCURRENCY_LIMIT)`), awaiting each chunk before proceeding.

### 8. Project Analytics
Analytics are calculated on-the-fly via `ProjectAnalyticsService` (`lib/services/project-analytics.ts`).

-   **Readiness Score**: A weighted metric (0-100) indicating how "ready" a project is for generation.
    -   Formula: `min(Chars*20, 100)*0.3 + min(Locs*25, 100)*0.2 + (HasOutline?100:0)*0.3 + min(Chaps*10, 100)*0.2`
-   *Note*: This score is calculated backend-side and is available for future UI enhancements or gating mechanisms.

### 9. Structured Context (Context Builder)
To enable the AI to write coherently over long contexts without a Vector DB, we use a **Structured Context** strategy defined in `lib/services/story/story-context-builder.ts`:

-   **Smart Truncation**: We utilize a `smartTruncate` utility that respects sentence boundaries. This prevents feeding cut-off sentences to the LLM, which often causes it to hallucinate completions or break flow.
-   **Immediate Continuity**: We inject the *full text* (truncated to ~2000 chars) of the immediately preceding scene to ensure stylistic continuity.
-   **Narrative Arc**: We provide summaries of *all* previous scenes in the current chapter to maintain the plot arc.
-   **Global Context**: Chapter notes and Outline parameters (POV, Tone) are always included.

### 10. AI Integration & Models

**Role-Based Routing**:
We do not hardcode model IDs. Instead, we use a role-based system defined in `lib/ai/model-routing.ts`:
- `light`: Fast, cheap (e.g., Haiku, Flash). Used for UI labeling.
- `middle`: Balanced (e.g., Sonnet 3.5, GPT-4o). Used for most generation.
- `large`: Powerful (e.g., Opus). Used for complex planning.

**Tools**:
Tools are defined in `lib/ai/tools/`. They must:
1.  Verify ownership (`verifyToolAccess`).
2.  Return typed results.
3.  Be registered in `lib/ai/tool-registry.ts`.

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
-   **Mocking Tips**:
    -   **Server-Only**: Imports like `lib/ai/models` must be mocked.
    -   **Drizzle Chains**: When mocking DB updates, you must return a builder object that supports chaining (e.g., `.set().where().returning()`).
    ```typescript
    vi.mock("@/lib/ai/models", () => ({
      getSelectedModelId: vi.fn().mockResolvedValue("mock-model"),
    }));
    ```

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
