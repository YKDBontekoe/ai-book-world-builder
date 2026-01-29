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
-   **BookCanvasContext**: Split into `BookCanvasLayoutContext` (stable config), `BookCanvasSelectionContext` (volatile selection), and `BookCanvasActionsContext` (stable functions) to optimize performance.

**Embedded Canvas Sync**:
The `BookCanvas` is usually a standalone page but is embedded in the Writer View. We use a `CanvasSync` component (`features/writer/components/canvas-sync.tsx`) to synchronize the `WriterContext` state (project ID, read-only status) to the `BookCanvasContext`.

**Lazy Loading**:
To optimize TTI (Time to Interactive), heavy components are lazy-loaded:
-   `FloatingAssistant` (The chat interface)
-   `BookCanvas` (The entity graph/bible)
-   `StructureEditorDialog` (The power editor)

### 2. Power Dock Architecture (Strategy Pattern)

The Power Dock uses the **Strategy Pattern** to manage diverse AI tools without cluttering the UI component with business logic.

-   **Interface**: All tools implement `ToolStrategy` (`execute(context, input) -> Promise<Result>`).
-   **Registry**: Tools are registered in `toolStrategies` object in `src/features/writer/components/tools/tool-strategies.ts`.
-   **Execution**: The `PowerDock` component simply looks up the strategy by ID and calls `execute`. This makes adding new tools purely a matter of creating a new class and registering it, respecting the Open-Closed Principle.

See [`docs/ai-tools.md`](ai-tools.md) for a detailed technical reference of available tools.

### 3. Command Palette (Writer Spotlight)
The Command Palette is driven by the `useSpotlightItems` hook (`hooks/use-spotlight-items.tsx`).
-   **Registry**: It aggregates "Actions" (static commands), "Entities" (from `useProjectEntities`), and "Scenes" (from `WriterContext`).
-   **Filtering**: It performs client-side fuzzy filtering on the aggregated list.

### 4. Time Travel (History Management)
The Editor History is managed via the `useEditorHistory` hook (`hooks/use-editor-history.ts`), ensuring a linear undo/redo stack distinct from ProseMirror's internal history.
-   **Snapshots**: Every content change (debounced) pushes a snapshot to a local stack.
-   **Preview State**: Activating "Time Travel" enters a preview mode where the editor becomes read-only and displays content from the selected history index.
-   **Restoration**: Confirming a restore creates a new snapshot at the top of the stack with the old content, preserving the forward history.

### 5. Smart Sync (Structure Editor)
The `saveProjectStructure` Server Action (`features/writer/actions/structure.ts`) implements a **Smart Sync** algorithm to allow plain-text editing of the database structure:
1.  **Parse**: Converts the text input into a hierarchical tree (Chapters -> Scenes).
2.  **Normalize**: Converts titles to lowercase and removes accents for fuzzy matching.
3.  **Match**: Queries existing DB records and attempts to match them by title.
    *   *Match Found*: Updates the sequence and title (preserves ID and content).
    *   *No Match*: Creates a new record.
    *   *Missing*: Deletes records that are no longer in the text input.
4.  **Transaction**: All operations occur within a single Drizzle transaction to ensure atomicity.

### 6. Server Actions & Services
We separate controller logic (Server Actions) from business logic (Services):
-   **Server Actions** (`app/actions/` and `features/**/actions`): Handle auth checks, input validation, and calling services. They must check `ensureProjectAccess`.
-   **Services** (`lib/services/`): Pure business logic, database transactions, and AI orchestration.
    -   `StoryService`: Handles scene planning and text generation.
    -   `BookAnalysisService`: Orchestrates entity detection and consistency checks.
    -   `SceneSequenceService`: Centralizes logic for scene insertion, reordering, and shifting. It uses a **Doubly-Linked List** strategy (`prevSceneId`) alongside a `sequence` integer to ensure robust ordering and race-condition handling.
    -   `ProjectDuplicationService`: Handles deep-cloning of projects. It employs a **Two-Pass Strategy** for scenes to resolve circular dependencies (linked lists) and an **ID Map** system to maintain referential integrity across all 15+ database tables.

### StoryService vs GenerationOrchestrator
It is important to distinguish between these two key services:
-   **`StoryService`**: Handles **interactive, synchronous** operations triggered by the user in the Writer View (e.g., "Batch Write", "Plan Chapter"). It focuses on immediate feedback and user-guided generation.
-   **`GenerationOrchestrator`**: Manages the **long-running, stateful** generation pipeline (e.g., generating a full book from scratch). It persists state to the database to handle timeouts and resume operations.

### 7. Analysis Pipeline
The analysis features are broken down into specialized micro-services under `src/lib/services/analysis/`:
-   `consistency-service.ts`: Checks for plot holes and character contradictions.
-   `detail-extractor.ts`: Extracts potential new entities (names, locations) from raw text.
-   `entity-detector.ts`: Identifies *existing* entities mentioned in a scene to update the "Context" pane.
-   `style-analytics.ts`: Computes metrics like reading ease and tone.

**AI Operations (`app/actions/ai-operations.ts`)**:
This file acts as the primary gateway for the frontend to access AI features. It wraps the service layer calls with error handling and response formatting.
-   **Purpose**: Expose capabilities like "Lore Generation", "Chapter Critique", and "Search" to Client Components.
-   **Error Handling**: Most actions return a unified `{ success: boolean, error?: string, data?: any }` structure. Raw errors are logged to the server console but masked from the user with friendly messages.

### 8. Generation Architecture
The generation pipeline is a complex state machine managed by the `GenerationOrchestrator`. It supports long-running, multi-step processes (Outline -> Chapter -> Review -> Epilogue) that persist state to the database.

> **See [`docs/generation-architecture.md`](generation-architecture.md) for the full technical specification.**

### 9. Software Builder (Jules Agent)
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

### 10. AI Service Architecture
The AI layer is structured to separate "AI Logic" from "Business Logic".

**Core Components**:
-   **BaseService Pattern**: All AI services extend `BaseService` to inherit common utilities and `aiClient` access, reducing abstraction layers.
-   **GenerationService** (`lib/ai/services/generation-service.ts`): The low-level abstraction for LLM interaction. It handles prompt construction, system message formatting, and calling the Vercel AI SDK. It is agnostic to the business domain (stories, analysis).
-   **WritingService** (`lib/services/ai/writing-service.ts`): The domain-specific service that orchestrates generation. It calls `GenerationService` but adds business rules like batch processing, scene fetching, and access control.

**Batch Processing Strategy**:
Long-running AI tasks (like "Generate All Scenes") are handled in `WritingService.batchWriteChapter` using a concurrency pattern to avoid Vercel Serverless Function timeouts (usually 10-60s):
1.  **Batch Limit**: Processes a maximum of 5 scenes per request.
2.  **Concurrency Limit**: Runs strictly 3 generations in parallel to balance speed vs. rate limits.
3.  **Chunking**: Breaks the task into chunks (e.g., `tasks.slice(i, i + CONCURRENCY_LIMIT)`), awaiting each chunk before proceeding.

### 11. Project Analytics
Analytics are calculated on-the-fly via `ProjectAnalyticsService` (`lib/services/project-analytics.ts`).

-   **Readiness Score**: A weighted metric (0-100) indicating how "ready" a project is for generation.
    -   Formula: `min(Chars*20, 100)*0.3 + min(Locs*25, 100)*0.2 + (HasOutline?100:0)*0.3 + min(Chaps*10, 100)*0.2`
-   *Note*: This score is calculated backend-side and is available for future UI enhancements or gating mechanisms.

### 12. Complex Business Logic

**Scene Management (Linked Lists)**:
Scenes are ordered using a hybrid approach in `SceneSequenceService`:
-   **Structure**: A Doubly-Linked List (`prevSceneId`) + Integer Sequence (`sequence`).
-   **Purpose**: The linked list (`prevSceneId`) is the source of truth for logical order, especially for resolving merge conflicts. The integer `sequence` is used for efficient database sorting and UI rendering.
-   **Reordering**: We use a single atomic SQL transaction with a `CASE` statement to update all affected `sequence` numbers at once, preventing race conditions.

**Project Forking (Deep Cloning)**:
The `ProjectDuplicationService` implements a "Deep Clone" operation to duplicate a project and all its entities (15+ tables).
-   **ID Mapping**: We generate new UUIDs for every record but maintain an in-memory `Map<OldID, NewID>` during the transaction. This allows us to update foreign keys (e.g., `chapter.volumeId`) correctly on the fly.
-   **Refined Single-Pass Strategy**: For scenes (which reference each other via `prevSceneId`), we use an optimized single-pass approach:
    1.  Iterate through scenes in batches.
    2.  For each scene, if its new ID or its `prevSceneId`'s new ID is missing from the map, generate and cache them immediately.
    3.  Insert the scene record with fully resolved IDs. This solves the "chicken-and-egg" problem of linked lists without needing a second iteration.

**Productivity Tools Architecture**:
The Sprint, Goals, and Insights widgets (`features/writer/components/tools/`) are purely client-side React components.
-   **Persistence**: They use `localStorage` (via `useLocalStorage`) to persist goals and session stats across reloads.
-   **Real-time Metrics**: They consume `WriterContext` to calculate word counts and pacing scores on the fly, without needing backend polls.

**Smart Defaults (User Preferences)**:
We use a lightweight "Smart Defaults" pattern to improve UX by persisting user choices.
-   **Implementation**: `useLocalStorage` hook (from `usehooks-ts`).
-   **Example**: `CreateProjectDialog` remembers `visibility` and `templateId`.
-   **Hydration**: Components using this must handle hydration mismatches (e.g., by waiting for `mounted` state) or use client-only rendering for the dependent parts.

### 13. Structured Context (Context Builder)
To enable the AI to write coherently over long contexts without a Vector DB, we use a **Structured Context** strategy defined in `lib/services/story/story-context-builder.ts`:

-   **Smart Truncation**: We utilize a `smartTruncate` utility that respects sentence boundaries. This prevents feeding cut-off sentences to the LLM, which often causes it to hallucinate completions or break flow.
-   **Immediate Continuity**: We inject the *full text* (truncated to ~2000 chars) of the immediately preceding scene to ensure stylistic continuity.
-   **Narrative Arc**: We provide summaries of *all* previous scenes in the current chapter to maintain the plot arc.
-   **Global Context**: Chapter notes and Outline parameters (POV, Tone) are always included.

### 14. AI Integration & Models

**Dynamic Model Fetching**:
The system fetches available models dynamically via the `getAvailableModels` Server Action. This ensures that the application supports new models (like Grok Lite or newer Claude versions) immediately as they become available via the gateway, without requiring code changes. While defaults are defined in `DEFAULT_MODELS`, they are used only as fallbacks.

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


### 15. Factory Tycoon Architecture
Located in `src/features/factory-tycoon`, this feature implements a deterministic simulation loop.

**Core Loop (`simulateTick`)**:
- **Determinism**: The state is cloned and buildings are sorted by ID before processing to ensure consistent results across renders.
- **Phases**:
  1. **Transport**: Moves items between buildings using a shared grid system.
  2. **Production**: Consumes inputs and produces outputs (if storage permits).
  3. **Market**: Consumes end-products (Gadgets) and generates Cash.

**State Management**:
- Uses a `useReducer` pattern with a specialized `GameProvider`.
- **Canvas Rendering**: The grid is rendered using absolute positioning and CSS transitions for performance.

### 16. Feedback Automation
To close the loop between user feedback and development, we use an automated pipeline defined in `lib/services/feedback-service.ts`.

-   **Cron Job**: A daily job (`api/cron/process-feedback`) triggers the analysis.
-   **AI Grouping**: An LLM analyzes all pending feedback items and groups them into features or bug reports.
-   **Jules Hand-off**: The system automatically creates a **Jules Session** for each group, instructing the agent to "Implement or improve the feature".
-   **Traceability**: Feedback items are linked to the generated Plan/PR, allowing us to notify users when their request is built.

## Design System

The project adheres to a **Native macOS Aesthetic** ("Liquid Glass"):
-   **GlassCard**: The primary container. Use `variant='liquid'` for the signature frosted effect.
-   **Motion**: All animations use `ease-spring` (stiffness 400, damping 25).
-   **Tailwind v4**: Defined in `app/globals.css` using the `@theme` directive.

## Verification Strategy

We employ a **Testing Trophy** methodology (refer to `.agent/personas/testing-agent.md`) to ensure high quality with optimal effort:

### 1. Integration/Unit Verification (Vitest)
-   **Priority**: High (Base of the trophy).
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

### 2. Visual & Interaction Verification (Storybook)
-   **Priority**: Medium.
-   Located in `src/stories/` or co-located.
-   Run: `pnpm storybook`
-   **Requirement**: Stories must use the `play` function for interaction testing to enable execution via Vitest.

### 3. End-to-End Verification (Playwright)
-   **Priority**: Low (Top of trophy - critical paths only).
-   Located in `tests/e2e/`.
-   Run: `pnpm exec playwright test`
-   Strategy: We mock the AI responses to test the *application logic* deterministically.

## Contribution Workflow

1.  **Plan**: Analyze the task and explore the codebase.
2.  **Edit**: Make changes, favoring small, testable units.
3.  **Verify**: Run `pnpm test:unit` and `pnpm exec playwright test` locally.
4.  **Pre-Commit**: Follow the `pre_commit_instructions` tool output.
5.  **Submit**: Commit with a clear message.
