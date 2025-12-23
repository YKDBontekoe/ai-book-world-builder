# Developer Guide

This document provides technical details on key architectural components of the AI Book World Builder, intended for engineers working on the codebase.

## Model Preferences Architecture

The application abstracts specific AI models into three capability tiers: `light`, `middle`, and `large`. This allows the application to adapt to new models without hardcoding specific IDs throughout the codebase.

### Core Concepts

- **Light**: Fast, cheap models suitable for quick chat interactions and simple tasks.
- **Middle**: Balanced models for standard generation and analysis (e.g., `BookAnalysisService`).
- **Large**: High-reasoning models for complex story planning and orchestration.

### Implementation Details

- **Definition**: Defaults are defined in `src/lib/ai/models.ts` via `DEFAULT_MODELS`.
- **Resolution**: The `getSelectedModelId(type)` function resolves the actual model ID to use.
  1.  It checks the user's persisted preferences (stored in the `UserPreferences` table).
  2.  If no preference is set, it falls back to the `DEFAULT_MODELS` configuration.
- **Usage**:
  ```typescript
  // Example: Getting the model for analysis
  import { getSelectedModelId } from "@/lib/ai/models";

  const modelId = await getSelectedModelId("middle");
  ```

## Book Analysis Service (RAG)

The `BookAnalysisService` (`src/lib/services/book-analysis-service.ts`) implements a Retrieval-Augmented Generation (RAG) pipeline to analyze uploaded texts (EPUB, PDF, etc.) and extract structured world data.

### Pipeline Steps

The analysis is performed in three sequential passes to maximize accuracy:

1.  **Entity Detection (Pass 1)**
    *   **Goal**: Identify potential entities (Characters, Locations, Lore) in the text.
    *   **Process**: Scans the text using the `EntityDetector` service.
    *   **Filtering**: Entities are filtered by confidence score (>= 50) and checked against existing project entities to prevent duplicates.

2.  **Detail Extraction (Pass 2)**
    *   **Goal**: enrich identified entities with descriptions and attributes.
    *   **Process**: For the top 20 high-confidence entities, the `DetailExtractor` retrieves relevant text chunks and summarizes the entity's role and traits.
    *   **Output**: Creates `Entity` records and `EntityAttribute` records (e.g., `_inspirationSource`).

3.  **Relationship Inference (Pass 3)**
    *   **Goal**: Map how entities interact.
    *   **Process**: The `RelationshipInferrer` analyzes the text for interactions between the created entities.
    *   **Output**: Creates `EntityRelationship` records (e.g., "Family", "Enemy") if confidence is >= 60.

### Configuration

*   **Model**: Uses the `middle` tier model by default.
*   **Concurrency**: Entity extraction is sequential for the top 20 to manage rate limits and costs.

## Writer Architecture

The "Writer View" (`src/app/(chat)/projects/[id]/page.tsx`) is the primary interface for book creation. It utilizes a "Fetch-Then-Hydrate" pattern to ensure fast initial loads while supporting rich client-side interactivity.

### Component Structure

The UI (`WriterView`) is built using a 3-pane layout via `react-resizable-panels`:

1.  **Sidebar (Left)**: `WriterSidebar`
    *   Managed by `WriterLayoutContext`.
    *   Handles navigation between Chapters and Scenes.
    *   Displays the "Story Wizard" when the project is empty.

2.  **Editor (Center)**: `WriterEditor`
    *   Contains the `TextEditor` (ProseMirror-based).
    *   Synchronizes content updates via `useWriterState`.

3.  **Canvas (Right)**: `BookCanvas` (Embedded Variant)
    *   Visualizes entity relationships.
    *   Synchronized via `CanvasSync` component to match the current project.

### Data Flow

1.  **Server Load**: `page.tsx` pre-fetches the project structure (Chapters/Scenes hierarchy) and available models.
2.  **Hydration**: These initial props initialize the `WriterProvider` context.
3.  **Lazy Loading**: Scene content (the actual text) is *not* loaded initially. It is fetched on-demand via `getSceneContent` when a user selects a scene, optimizing performance for large books.
