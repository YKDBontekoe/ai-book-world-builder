# User Guide: AI Book World Builder

Welcome to the AI Book World Builder! This guide will help you navigate the features designed to help you craft complex narratives, plan stories, and generate books.

## Core Workflow

The typical user journey follows three main stages: **Plan**, **Write**, and **Analyze**.

### 1. Plan Your Story
There are two primary ways to begin:

**Option A: Use the Book Generation Wizard (Recommended for new projects)**
The **Story Wizard** is the fastest way to turn an idea into a complete outline.

1.  **Open**: When you create a new, empty project, the Wizard will appear in the center panel.
2.  **Input Idea**: Describe your story concept (e.g., "A cyberpunk detective story on Mars"). Select a Genre, Point of View (POV), and Tone.
3.  **Generate Plan**: The AI will create a list of chapters and summaries based on your prompt.
4.  **Review & Edit**: You can change chapter titles or summaries, and add or remove chapters.
5.  **Create Story**: Once satisfied, click "Create Story" to build the actual chapters and scenes in your project.

**Option B: Manual Structuring**
If you already have an outline, you can build it manually.

## Writer View Interface

The Project View is divided into three main panels to help you organize and write your story:

1.  **Navigation (Left)**: This sidebar lists your Chapters and Scenes. Use it to jump between different parts of your book. It also contains the "Create Story" wizard when your project is empty.
2.  **Editor (Center)**: This is your main writing space. It works like a standard document editor but is connected to the AI.
3.  **Canvas (Right)**: A visual board for your world.

### Command Palette (Writer Spotlight)

Access powerful actions instantly without taking your hands off the keyboard.

-   **Open**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows), or click the search icon in the bottom toolbar.
-   **Features**:
    -   **Navigate**: Type a scene or character name to jump directly to it.
    -   **Actions**: Run commands like "Toggle Zen Mode", "Toggle Typewriter Mode", or "Ask AI Assistant".
    -   **Filter**: Use tabs to search only for Entities, Scenes, or Actions.

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
*   **Map**: A visual gallery of your locations.
    *   *Images*: Attach reference images or maps to your Location entities.
    *   *Grid*: View all your locations in a visual grid.
*   **Scenes**: A Kanban-style board to manage scene status.
    *   *Workflow*: Drag and drop scenes between columns (Planned -> Drafted -> Final).
*   **Bible**: The core database of your characters and lore. Use this to search and edit entities without leaving the editor.
*   **Context**: Shows exactly what the AI "sees" when generating the current scene (e.g., Active Characters, Location details). Use this to verify the AI has the right info.
*   **Draft**: A scratchpad for rough ideas or snippets that don't fit in the main manuscript yet.
*   **Diagnostics**: Runs health checks on your story (e.g., "Missing Character Descriptions", "Empty Scenes").
*   **Log**: A history of changes and AI generations.

## Writer Tools

The Writer View includes specialized AI tools to assist your creative process.

### 1. Structure Power Editor
Manage your entire book's outline as a simple text file.
-   **Usage**: Click the **File Text** icon in the sidebar header.
-   **Features**:
1.  **Structure Power Editor**: Click the **File Text** icon in the sidebar header to manage your entire book's outline as a simple text file.
    -   **Bulk Editing**: Type `Chapter 1: Title` and `Scene: Title` to rapidly build structure.
    -   **Smart Format**: Automatically cleans up your text and numbering.
2.  **Add Entities**: Go to the **Bible** pane on the right-hand Canvas. Here you can add Characters, Locations, and Lore. The more you add, the smarter the AI becomes about your world.

### 2. Write & Generate
Once you have a structure, you can start writing.

**The Writer View**
The Project View is divided into three main panels:
1.  **Navigation (Left)**: This sidebar lists your Chapters and Scenes. Use it to jump between different parts of your book.
2.  **Editor (Center)**: This is your main writing space. It works like a standard document editor but is connected to the AI.
3.  **Canvas (Right)**: A visual board for your world-building and analysis tools.

**AI Writing Tools**
-   **Generate Scenes (AI)**: Click the **Sparkles** icon next to a Chapter in the sidebar. The AI will draft content for all pending scenes in that chapter.
-   **Rewrite / Expand**: Select existing text and use the AI to refine or elaborate on it.
-   **Project-Aware Chat**: Open the **Floating Assistant** to ask the AI questions about your world, brainstorm ideas, or draft new scenes with specific instructions.

### 3. Analyze & Refine
Use the **World Canvas** (Right Panel) to gain insights and ensure consistency. The canvas is a powerful tool for visualizing your story's structure and content.

-   **Bible**: The central repository for all your world-building information. Here you can create, edit, and view all your characters, locations, and lore.
-   **Graph / Network**: Visualizes the relationships between your entities. See at a glance how characters are connected to each other and to various locations.
-   **Arc**: Analyzes your story's narrative arc, showing the pacing and tension across scenes and chapters.
-   **Timeline**: Tracks chronological events to ensure your plot is consistent and free of continuity errors.
-   **Map**: A visual gallery of your locations. Attach images to your location entities to create a visual reference for your world.
-   **Scenes / Kanban**: A Kanban-style board for managing the status of your scenes. Drag and drop scenes between columns like "Planned," "Drafted," and "Final" to track your progress.
-   **Context**: Shows exactly what information the AI "sees" when generating a scene. Use this to verify that the AI has the right context before you generate new content.
-   **Draft**: A scratchpad for rough ideas, snippets of dialogue, or alternative scene versions that don't yet have a place in the main manuscript.
-   **Diagnostics**: Runs health checks on your story, flagging potential issues like missing character descriptions, empty scenes, or continuity errors.
-   **Changelog**: A log of all the changes made to your project, allowing you to track your progress and easily revert to previous versions if needed.
Use the **World Canvas** (Right Panel) to gain insights and ensure consistency.

-   **Graph**: Visualizes your **Entity Network**. See how characters, locations, and lore are connected.
-   **Arc**: Analyzes your story's **Pacing** and **Tension**.
-   **Timeline**: Tracks chronological events to ensure your plot is consistent.
-   **Diagnostics**: Runs health checks on your story (e.g., "Missing Character Descriptions", "Empty Scenes").
-   **Context**: Shows exactly what the AI "sees" when generating the current scene. Use this to verify the AI has the right information.

## Advanced Features

### Command Palette (Writer Spotlight)
Access powerful actions instantly. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows).
-   **Navigate**: Instantly jump to any scene or entity.
-   **Actions**: Run commands like "Toggle Zen Mode" or "Ask AI Assistant".

### Model Settings
You can customize which AI models are used for different tasks in the **Settings > Models** menu. We categorize models into three roles:
*   **Light**: Fast and efficient (for chat and simple tasks).
*   **Middle**: Balanced performance (for most writing tasks).
*   **Large**: High intelligence (for complex reasoning and outlining).

### Time Travel
Restore previous versions of your scene without losing progress. Click the **Clock** icon (Time Travel) at the bottom of the editor.

## Troubleshooting

-   **The AI got a fact wrong**: Check your **Bible** entities. The AI relies on what you've written there.
-   **The generation is stalled**: Large generations can take time. If it seems stuck, try refreshing the page. The system saves progress at every step.
