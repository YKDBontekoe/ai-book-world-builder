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
│   │   └── tools/       # AI Tools definition
│   ├── db/              # Database schema (Drizzle) and queries
│   ├── generation/      # Book generation pipeline (Orchestrator, WriterAgent)
│   └── services/        # Business logic services
│       ├── ai/          # AI Service implementations (Writing, Analysis, Lore)
│       └── story/       # Story logic and context building
└── tests/               # Test suites
    ├── e2e/             # Playwright E2E tests
    └── unit/            # Vitest unit tests
```

## Key Architectural Patterns

### 1. Writer View Architecture
The `WriterView` (`components/organisms/writer/writer-view.tsx`) is the core interface. It employs a complex 3-pane layout managed by `react-resizable-panels`:

1.  **Sidebar (Left)**: Managed by `WriterSidebar`. Contains navigation (Chapters/Scenes) and Project structure.
2.  **Editor (Center)**: The `WriterEditor` wraps a ProseMirror instance. It is the primary workspace.
3.  **Book Canvas (Right)**: An embedded version of the `BookCanvas`. Displays the Entity Bible, Graphs, and Context.

**State Management**:
The Writer uses a context stack to manage its state without prop drilling:
-   **WriterProvider**: Holds project data (`project`, `chapters`, `scenes`).
-   **WriterControlProvider**: Manages UI state like `isChatOpen`, `activePane`.
-   **WriterLayoutContext**: Handles layout toggles like `ZenMode`, `DirectorMode`.

**Lazy Loading**:
To optimize TTI (Time to Interactive), heavy components are lazy-loaded:
-   `FloatingAssistant` (The chat interface)
-   `BookCanvas` (The entity graph/bible)

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

### 4. AI Service Architecture
The AI layer is structured to separate "AI Logic" from "Business Logic".

-   **Service Implementations** (`lib/services/ai/`):
    -   `WritingService`: Handles interactive text generation (continue writing, rewrite, draft scene).
    -   `AnalysisService`: Handles content analysis (entity detection, consistency checks).
    -   `LoreService`: Manages world-building generation (creating characters, locations).
-   **Business Logic** (`lib/services/story-service.ts`):
    -   Orchestrates the flow between the database and AI services.
    -   Manages high-level operations like `planChapterScenes` and `generateSceneText`.

### 5. Structured Context (Context Builder)
To enable the AI to write coherently over long contexts without a Vector DB, we use a **Structured Context** strategy defined in `lib/services/story/story-context-builder.ts`:

-   **Immediate Continuity**: We inject the *full text* of the immediately preceding scene (last ~2000 tokens) to ensure flow.
-   **Narrative Arc**: We provide *summaries* of all previous scenes in the current chapter to maintain the arc.
-   **Global Context**: Chapter notes and Outline parameters (POV, Tone) are always included.
-   *Note*: This replaces the previous "Smart Context" flooding strategy with a more deterministic, token-efficient approach.

### 6. AI Integration & Models

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
-   Mocking: We use `vi.mock` heavily. Note that `server-only` imports must be mocked.
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
