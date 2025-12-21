# Generation Architecture

The Book Generation system in AI Book World Builder is a **state-driven, multi-agent pipeline** designed to create coherent long-form content. It prioritizes consistency, context-awareness, and fault tolerance.

## Core Components

### 1. Generation Orchestrator
The `GenerationOrchestrator` (`lib/generation/generation-orchestrator.ts`) is the central engine. It does not run in a single long-lived process but rather executes a sequence of database-persisted steps.

- **State Machine**: The generation process is defined by a series of `bookGenerationStep` records in the database.
- **Resiliency**: Because state is persisted, the generation can be paused, resumed, or recovered after a server restart.
- **Context Management**: The orchestrator builds a `ProcessStepContext` containing the project's lore, outline, and global notes, which is passed to every step.

### 2. Step Handlers
Each phase of generation is handled by a specific `StepHandler` implementation. These are located in `lib/generation/steps/`.

**Interface:**
```typescript
interface StepHandler {
  process(step: BookGenerationStep, context: ProcessStepContext): Promise<void>;
}
```

**Available Steps:**
- **Prologue**: Generates an introductory scene.
- **Chapter Writing**: The core step. Uses the `WriterAgent` to generate a chapter based on the outline.
- **Chapter Reviewing**: Uses a separate "Reviewer" model to critique the generated chapter and suggest improvements (or auto-fix).
- **Epilogue**: Generates the concluding scene.
- **Consistency Check**: Analyzes the generated content against the project's entity database to find contradictions.

### 3. Writer Agent
The `WriterAgent` (`lib/generation/writer-agent.ts`) is responsible for the actual prose generation. It operates on a "Context Flooding" principle.

- **Inputs**: It receives the *entire* relevant context (Project Context, Lore, Outline, Previous Chapter Summary).
- **Prompt Engineering**: It constructs a massive system prompt that enforces the selected "Writing Style" (e.g., Hemingway, Tolkien) and specific author instructions.
- **Output**: Returns raw text, word count, and token usage.

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant DB as Database
    participant Orch as Orchestrator
    participant Step as StepHandler
    participant Agent as WriterAgent
    participant AI as LLM Provider

    UI->>DB: Create Generation + Steps
    UI->>Orch: runGeneration(id)
    Orch->>DB: Fetch Steps

    loop For Each Step
        Orch->>DB: Update Status (Running)
        Orch->>Step: process(step, context)
        Step->>Agent: generateChapter(context, outline)
        Agent->>AI: Stream/Generate Text
        AI-->>Agent: Content
        Agent-->>Step: Result
        Step->>DB: Save Output (agentOutput)
        Orch->>DB: Update Status (Completed)
    end

    Orch->>DB: Mark Generation Complete
```

## Key Concepts

### Context Flooding
Instead of using RAG for every small detail during generation, we "flood" the context window of long-context models (like Claude 3.5 Sonnet or Gemini 1.5 Pro) with:
1.  **Project Context**: High-level description.
2.  **Lore Context**: All entities (Characters, Locations) relevant to the book.
3.  **Outline**: The structural plan for the book.

This ensures the model has "random access" to all necessary facts without retrieval errors.

### Optimistic Concurrency
The orchestrator checks for `paused` or `cancelled` status before starting each step, allowing users to intervene in the middle of a long generation process.
