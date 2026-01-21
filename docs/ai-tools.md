# AI Tools Reference

This guide provides a technical overview of the AI Tools available in the Writer View (Power Dock). These tools allow users to interact with AI services for writing, refining, and analyzing their stories.

## Architecture: The Strategy Pattern

The Power Dock uses the **Strategy Pattern** to manage diverse AI tools. This decouples the UI (`PowerDock` component) from the specific business logic of each tool.

-   **Interface**: All tools implement `ToolStrategy`.
    ```typescript
    interface ToolStrategy {
        execute(context: ToolContext, input: string): Promise<{ success: boolean; result?: string }>;
    }
    ```
-   **Context**: The `ToolContext` provides the tool with necessary state:
    -   `project`: Current project metadata.
    -   `structure`: Full book structure (chapters/scenes).
    -   `activeChapterId` / `activeSceneId`: Currently selected items.
    -   `sceneContent`: Current text content (for export/analysis).
-   **Registry**: Tools are registered in `src/features/writer/components/tools/tool-strategies.ts`.

## Tool Reference

### 1. Batch Write (`write`)
Generates prose for multiple scenes in the active chapter.

-   **Service Call**: `batchWriteChapterAction(chapterId, instructions)` -> `writingService.batchWriteChapter`
-   **Inputs**:
    -   `context.activeChapterId`: Target chapter.
    -   `input`: User instructions (optional).
-   **Output**: Updates database records for scenes. Returns success/failure.
-   **Notes**: Uses `GenerationService` with the "Large" model. Processes scenes in parallel batches.

### 2. Rewrite (`rewrite`)
Rewrites the selected text or entire scene based on instructions.

-   **Service Call**: `rewriteSceneAction(sceneId, instructions)` -> `writingService.rewriteScene`
-   **Inputs**:
    -   `context.activeSceneId`: Target scene.
    -   `input`: Rewrite instructions (e.g., "Show, don't tell").
-   **Output**: Returns the rewritten text string.

### 3. Expand (`expand`)
Expands a short selection into a more detailed passage.

-   **Service Call**: `expandSceneAction(sceneId, notes)` -> `writingService.expandScene`
-   **Inputs**:
    -   `context.activeSceneId`: Target scene.
    -   `input`: Additional notes or context for expansion.
-   **Output**: Returns the expanded text string.

### 4. Critique (`critique`)
Analyzes the chapter for structure, pacing, and tone.

-   **Service Call**: `critiqueChapterAction(chapterId)` -> `analysisService.critiqueChapter`
-   **Inputs**: `context.activeChapterId`
-   **Output**: JSON object containing critique points. Displayed via `toast` or dedicated UI.

### 5. Check Consistency (`consistency`)
Scans the chapter for plot holes and character contradictions.

-   **Service Call**: `analyzeConsistencyAction(chapterId)` -> `analysisService.analyzeConsistency`
-   **Inputs**: `context.activeChapterId`
-   **Output**: JSON report of inconsistencies.

### 6. Dialogue Coach (`dialogue`)
Analyzes character voices and suggests improvements.

-   **Service Call**: `dialogueCoachAction(sceneId, focus)` -> `analysisService.dialogueCoach`
-   **Inputs**:
    -   `context.activeSceneId`
    -   `input`: Specific focus (optional).
-   **Output**: Formatted text report with voice notes and quick fixes.

### 7. Lore (Magic Fill) (`lore`)
Generates new entities (Characters, Locations) based on a description.

-   **Service Call**: `generateLoreAction(projectId, prompt, category)` -> `loreService.generateLore`
-   **Inputs**:
    -   `context.project.id`
    -   `input`: Description of the entity to generate.
-   **Output**: Creates a new Entity record in the database. Returns success.

### 8. Ask Manuscript (`search`)
Answers questions about the story using the manuscript as context.

-   **Service Call**: `askManuscriptAction(projectId, question)` -> `manuscriptService.askManuscript`
-   **Inputs**:
    -   `context.project.id`
    -   `input`: User question.
-   **Output**: Text answer with cited sources (Scenes/Entities).

### 9. Export (`export`)
Downloads the current scene as a Markdown file.

-   **Service Call**: Client-side only.
-   **Inputs**: `context.sceneContent`
-   **Output**: Trigger browser download of `.md` file.

## Adding a New Tool

1.  Create a new Strategy class implementing `ToolStrategy`.
2.  Implement the `execute` method, calling the appropriate Server Action.
3.  Add the tool to the `TOOLS` config in `tool-config.ts` (for UI).
4.  Register the strategy in `toolStrategies` map.
