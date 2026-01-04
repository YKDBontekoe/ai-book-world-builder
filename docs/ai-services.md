# AI Services & Architecture

This document details the underlying AI infrastructure, including model selection strategies, RAG implementation, and the chat transport layer.

## Model Routing Strategy

The application uses a **Role-Based Routing** system defined in `lib/ai/model-routing.ts`. Instead of hardcoding models in every component, we assign specific models to functional roles.

### Roles

| Role | Purpose | Default Model | Why? |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Planning, outlining, complex logic | `Claude 3.5 Opus` | Requires highest reasoning capability to maintain structural coherence. |
| **Writer** | Prose generation, creative writing | `Claude 3.5 Sonnet` | Best balance of creative nuance, prose quality, and speed. |
| **Checker** | Reviewing, consistency checking | `DeepSeek V3 (Reasoner)` | Excellent at logic and finding contradictions; cost-effective. |
| **Context** | Large context processing | `Gemini 1.5 Pro` | Massive context window allows ingesting entire books for analysis. |

### Configuration
While these defaults are hardcoded in `ROLE_MODEL_MAP`, the system is designed to check for user-configured overrides (persisted in cookies or user settings) before falling back to the defaults.

## Benchmark Service (`lib/ai/benchmark-service.ts`)

The Benchmark Service provides dynamic performance and quality metrics to help users select the right model for their task.

-   **Hybrid Data Source**: Combines static benchmarks (EQ-Bench, Chatbot Arena) with dynamic pricing data.
-   **Caching**: Caches results for 24 hours to prevent API rate limits.
-   **Recommendation Logic**: Algorithms to suggest the best "Budget" or "Quality" model for a specific task (Writing vs. Reviewing).

## Retrieval-Augmented Generation (RAG)

The project currently employs a **Session-Scoped In-Memory RAG** implemented in `lib/ai/rag.ts`.

### Current Implementation
- **Storage**: `Map<string, number[]>` (In-Memory Cache).
- **Scope**: Per-request/Per-generation.
- **Embedding Model**: `text-embedding-3-small`.
- **Strategy**: "Just-in-Time" embedding. When a context selection is made, we embed the candidates on the fly and cache them for the duration of the session.

### Why In-Memory?
For many "Book Generation" tasks, we can fit the entire relevant context (Entity Bible + Outline) into the context window of modern LLMs (200k+ tokens). We rely on **Context Flooding** rather than retrieval for the primary generation loop to avoid "retrieval misses."

RAG is primarily used for:
1.  **Chat**: Quickly finding relevant entities in a large project during a chat session.
2.  **Consistency Checks**: Verifying specific details against a large corpus.

## Analysis Architecture

The project features a multi-layered architecture for analyzing books and extracting structured data (Entities, Relationships).

### 1. Business Logic Orchestrator (`lib/services/book-analysis-service.ts`)
This is the high-level service consumed by Server Actions. It manages the analysis pipeline state and database transactions.
-   **Responsibility**:
    -   Verifies source material status.
    -   Prevents duplicate entity creation (filters against existing project entities).
    -   Orchestrates the 3-pass process (Detect -> Extract -> Infer).
    -   Saves results (Entities, Attributes, Relationships) to the database.

### 2. AI Service Wrapper (`lib/ai/services/analysis-service.ts`)
This layer handles the direct interaction with the LLM. It extends `BaseAIService` and encapsulates the prompt engineering and RAG logic.
-   **Key Methods**:
    -   `detectEntities(sourceMaterialId)`: Scans sampled chunks to identify potential entities.
    -   `extractDetails(name, kind, sourceMaterialId)`: Uses RAG to find relevant text and extract detailed attributes/quotes.
    -   `inferRelationships(entities, sourceMaterialId)`: Analyzes co-occurrence of entities to infer relationships.

### Data Flow
```mermaid
sequenceDiagram
    participant Action as Server Action
    participant Biz as BookAnalysisService
    participant AI as AnalysisService (AI)
    participant DB as Database

    Action->>Biz: analyzeBook(sourceId)
    Biz->>DB: Get Existing Entities

    rect rgb(240, 248, 255)
        Note right of Biz: Pass 1: Detection
        Biz->>AI: detectEntities()
        AI-->>Biz: DetectedEntity[]
    end

    rect rgb(255, 250, 240)
        Note right of Biz: Pass 2: Extraction
        loop For Top 20 Entities
            Biz->>AI: extractDetails()
            AI-->>Biz: EntityDetails
            Biz->>DB: Create Entity + Attributes
        end
    end

    rect rgb(240, 255, 240)
        Note right of Biz: Pass 3: Relationships
        Biz->>AI: inferRelationships()
        AI-->>Biz: InferredRelationship[]
        Biz->>DB: Create Relationships
    end

    Biz-->>Action: AnalysisResult
```

## Chat Transport Layer

The `ChatTransport` (`lib/ai/chat-transport.ts`) serves as the abstraction layer between the UI and the Vercel AI SDK.

- **Responsibility**: It standardizes how messages are sent, how tools are invoked, and how errors are handled.
- **Dynamic Configuration**: It accepts getter functions for `projectId` and `modelId` to ensure that long-lived chat hooks always access the current application state.
