# Agent Orchestrator ("The Brain")

The **Agent Orchestrator** is a specialized AI tool that acts as the decision-making brain for the Chat Agent. Unlike the deterministic `GenerationPipeline` (which follows a strict sequence of steps), the Orchestrator allows the agent to dynamically decide what to do based on the user's request and the current state of the project.

**File**: `src/lib/ai/tools/orchestrate-book.ts`

## Purpose

When a user says "Help me plan the next chapter" or "I'm stuck, what should I do?", the Chat Agent invokes the `orchestrateBook` tool. This tool analyzes the project's health, context, and the user's intent to propose a concrete action.

## Logic Flow

The tool follows a 6-step reasoning process:

1.  **Project Snapshot**:
    It fetches the full project data (Entities, Outlines, Chapters, Scenes) to understand the current scope.

2.  **Health Check (Analytics)**:
    It calculates the **Readiness Score** (see [`docs/ai-services.md`](ai-services.md)) and counts key elements (e.g., "5 Characters", "2 Chapters").

3.  **Context Retrieval (RAG)**:
    It uses the user's request (or the current active pane) as a query to fetch relevant snippets from the **Semantic Cache**.
    -   *Example*: If the user asks about "Chapter 3", it retrieves the outline for Chapter 3 and characters involved in it.

4.  **Reasoning (LLM)**:
    It sends a structured prompt to the **Orchestrator Model** (default: `Claude 3.5 Opus`).
    -   *Input*: Project Stats, Readiness Score, RAG Context, User Request.
    -   *Prompt*: "Decide the best next action... update_outline, update_scenes, draft_scene..."

5.  **Decision**:
    The LLM returns a JSON object containing:
    -   `nextAction`: The tool to call (e.g., `update_scenes`).
    -   `thoughtProcess`: Why it chose this action.
    -   `instructions`: Specific guidelines for the subsequent tool call.
    -   `suggestedCanvasPane`: Which UI pane should be focused (e.g., "scenes").

6.  **Logging**:
    The decision is logged to the `TaskLog` in the database, appearing in the "Project Activity" stream.

## Input Schema

The tool accepts the following arguments from the Chat Agent:

```typescript
interface OrchestratorInput {
  projectId: string;
  userRequest?: string;        // e.g. "Make chapter 3 scarier"
  currentCanvasState?: any;    // What the user is currently looking at
}
```

## Output Actions

The Orchestrator can decide on one of the following actions:

| Action | Description | Icon |
| :--- | :--- | :--- |
| `update_outline` | Modify story structure, plot beats, or pacing. | 📋 |
| `update_scenes` | Create, reorder, or archive scene cards. | 🎬 |
| `draft_scene` | Write actual prose for a specific scene. | ✍️ |
| `review_diagnostics` | Check for consistency issues or plot holes. | 🔍 |
| `update_bible` | Add or update characters, locations, or lore. | 📚 |
| `none` | No action needed (or just answering a question). | ✅ |

## Distinction from Batch Generation

-   **Agent Orchestrator**: Dynamic, conversational, single-step decisions. Used in **Chat**.
-   **Generation Pipeline**: Linear, multi-step, stateful process. Used for **Book Generation** (Wizard).
