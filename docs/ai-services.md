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

## Chat Transport Layer

The `ChatTransport` (`lib/ai/chat-transport.ts`) serves as the abstraction layer between the UI and the Vercel AI SDK.

- **Responsibility**: It standardizes how messages are sent, how tools are invoked, and how errors are handled.
- **Dynamic Configuration**: It accepts getter functions for `projectId` and `modelId` to ensure that long-lived chat hooks always access the current application state.
