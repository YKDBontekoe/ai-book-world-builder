# User Guide: AI Book World Builder

Welcome to the AI Book World Builder! This guide will help you navigate the features designed to help you craft complex narratives, plan stories, and generate books.

## Getting Started

1.  **Create a Project**: On the dashboard, click **"New Project"**. Give it a title and a genre. This creates your workspace.
2.  **Add Entities**: Go to the **"World"** tab (inside the Writer View). Here you can add Characters, Locations, and Lore. The more you add here, the smarter the AI becomes about your world.
3.  **Create an Outline**: In the **"Story"** tab, start planning your chapters. You don't need to write the prose yet—just the high-level beats.

## Project Dashboard

The dashboard provides a high-level overview of your project's health and usage.

*   **Total Cost**: An estimate of the AI generation costs for this project.
*   **Total Entities**: The total number of world-building elements (Characters, Locations, etc.) you've created.
*   **Input/Output Tokens**: Tracks the volume of text sent to and received from the AI.

**Charts & Insights:**
*   **Usage Chart**: Visualizes your AI usage over time, helping you track activity spikes.
*   **Entity Insights**: A breakdown of your world-building elements (e.g., how many Characters vs. Locations) and a "Top Connected" list showing which entities have the most relationships.

## Writer View Interface

The Project View is divided into three main panels to help you organize and write your story:

1.  **Navigation (Left)**: This sidebar lists your Chapters and Scenes. Use it to jump between different parts of your book. It also contains the "Create Story" wizard when your project is empty.
2.  **Editor (Center)**: This is your main writing space. It works like a standard document editor but is connected to the AI.
3.  **Canvas (Right)**: A visual board for your world.

### Using the World Canvas

The Canvas (Right Panel) is your command center for world-building and analysis. It features several specialized tools (tabs):

*   **Outline**: View and manage your high-level book structure (Volumes and Chapters).
*   **Graph**: Visualizes your **Entity Network**. See how characters, locations, and lore are connected.
    *   *Nodes* represent entities.
    *   *Lines* represent relationships (e.g., "Ally", "Sibling").
*   **Arc**: Analyzes your story's **Pacing** and **Tension**.
    *   *Tension (Area Chart)*: Derived from atmospheric keywords and emotional beats.
    *   *Pacing (Line Chart)*: Based on scene length and dialogue density.
*   **Timeline**: Tracks chronological events to ensure your plot is consistent.
*   **Context**: Shows exactly what the AI "sees" when generating the current scene (e.g., Active Characters, Location details). Use this to verify the AI has the right info.
*   **Map**: A visual gallery of your locations. You can attach images to locations to visualize your world's geography.
*   **Scenes**: A Kanban-style board to manage scene status (Planned -> Drafted -> Final).
*   **Draft**: A scratchpad for rough ideas or snippets that don't fit in the main manuscript yet.
*   **Readiness**: Displays the **Project Readiness Score** and diagnostic health checks. It tells you if you have enough world data to start generating high-quality prose.
*   **Bible**: The core database of your characters and lore. Use this to search and edit entities without leaving the editor.
*   **Log**: A history of changes and AI generations.

## Writer Tools

The Writer View includes specialized AI tools to assist your creative process.

### 1. Structure Power Editor
Manage your entire book's outline as a simple text file.
-   **Usage**: Click the **File Text** icon in the sidebar header.
-   **Features**:
    -   **Bulk Editing**: Type `Chapter 1: Title` and `Scene: Title` to rapidly build structure.
    -   **Smart Format**: Automatically cleans up your text and numbering.
    -   **Preview**: See a live tree view of your structure before saving.
-   **Best For**: Rapidly prototyping a new book structure or reorganizing chapters.

### 2. Time Travel
Restore previous versions of your scene without losing progress.
-   **Usage**: Click the **Clock** icon (Time Travel) at the bottom of the editor when a scene is active.
-   **Controls**: Use the slider to step back through every save point.
-   **Best For**: Recovering deleted text or comparing drafts.

### 3. Generate Scenes (AI)
Automatically drafts prose for planned scenes.
-   **Usage**: Click the **Sparkles** icon next to a Chapter in the sidebar, then select **Generate Scenes (AI)**. The AI will draft content for all pending scenes in that chapter based on their summaries.
-   **Note**: This tool processes a maximum of **5 scenes** at a time to ensure high-quality output and prevent network timeouts.
-   **Best For**: Rapidly converting a chapter outline into a first draft.

### 4. Rewrite
Refine existing scene content.
-   **Usage**: Select a scene and provide instructions (e.g., "Make the dialogue more tense," "Show, don't tell") via the Tools menu.
-   **Best For**: Polishing specific passages or changing the tone.

### 5. Expand
Add depth and detail to a scene.
-   **Usage**: Select a scene. The AI will elaborate on the existing content, adding sensory details and character introspection.
-   **Best For**: Fleshing out "thin" scenes.

### 6. Critique
Get feedback on your chapter.
-   **Usage**: Select a chapter. The AI analyzes the structure, pacing, and character arcs, providing actionable feedback.
-   **Best For**: Identifying weaknesses before editing.

### 7. Consistency Check
Ensure your story aligns with your world.
-   **Usage**: The AI scans the chapter for contradictions with your defined Entities (Characters, Lore).
-   **Best For**: Catching plot holes or out-of-character behavior.

### 8. Generate Lore
Create new world entities from your ideas.
-   **Usage**: Describe a character, location, or item. The AI will generate a structured entity entry in your World Bible.

## Book Generation Wizard

The Book Generation feature is a powerful tool to turn your initial idea into a full story structure.

### How it Works

1.  **Input Idea**: Describe your story concept (e.g., "A cyberpunk detective story on Mars"). Select a Genre, Point of View (POV), and Tone.
2.  **Generate Plan**: Click "Generate Plan". The AI (using the "Large" reasoning model) will create a list of chapters and summaries based on your prompt.
3.  **Review & Edit**: You will see the proposed structure.
    *   **Edit**: Change chapter titles or summaries.
    *   **Add/Remove**: Add new chapters or delete ones you don't like.
4.  **Create Story**: Once satisfied, click "Create Story" to build the actual chapters and scenes in your project.

## Model Settings

You can customize which AI models are used for different tasks in the **Settings > Models** menu.

### Model Tiers
We categorize models into three roles:
*   **Light**: Fast and efficient. Used for simple chat questions and quick suggestions.
*   **Middle**: Balanced performance. Used for most writing tasks and analyzing your world.
*   **Large**: High intelligence. Used for complex reasoning, outlining your story, and orchestration.

### Model Selector
The new model selector organizes available models to help you find the best fit:
*   **Favorites**: Pin your most-used models to the top for quick access.
*   **Recents**: Quickly switch back to models you've used recently.
*   **By Provider**: Browse models grouped by their provider (e.g., OpenAI, Anthropic, Google).

## Project-Aware Chat

The chat interface is integrated into the **Floating Assistant** (Writer View).

-   **Ask about your world**: "Who is the king of the Western Lands?" (It looks up your "Western Lands" entity).
-   **Brainstorm**: "Give me 5 plot twists involving [Character Name]."
-   **Drafting**: "Write a scene where [Character A] meets [Character B] for the first time."
-   **Multimodal**: You can attach images or text files to the chat to provide additional context for the AI.

> **Pro Tip**: Use the **"@"** key to explicitly reference a specific character or document in your chat.

## Troubleshooting

-   **The AI got a fact wrong**: Check your **World** entities. Does the entity exist? Is the description clear? The AI relies on what you've written there.
-   **The generation is stalled**: Large generations can take time. If it seems stuck, try refreshing the page. The system saves progress at every step, so you won't lose work.
