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

## Project Dashboard

The **Project Dashboard** gives you a high-level overview of your story's progress and health.
- **Access**: Click the "Dashboard" tab on your project card or navigate to it from the project settings.
- **Stats**: View your total word count, entity count, and estimated reading time.
- **Analytics**:
    -   **Usage History**: Track your AI token usage and costs over time.
    -   **Entity Insights**: See which characters and locations are most active in your story.

## Writer View Interface

The Project View (also known as the **Studio**) is divided into three main panels to help you organize and write your story:

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
    *   *Entity Pages*: Click on any entity name to open a dedicated **Entity Details** page with a full timeline, attribute list, and biography.
*   **Context**: Shows exactly what the AI "sees" when generating the current scene (e.g., Active Characters, Location details). Use this to verify the AI has the right info.
*   **Draft**: A scratchpad for rough ideas or snippets that don't fit in the main manuscript yet.
*   **Diagnostics**: Runs health checks on your story (e.g., "Missing Character Descriptions", "Empty Scenes").
*   **Log**: A history of changes and AI generations.

## Reader Mode

**Reader Mode** offers a distraction-free environment to review your work as a finished book.
-   **Access**: Click the "Read" button in the project header.
-   **Features**:
    -   **Clean Layout**: Hides all editing tools and sidebars.
    -   **Progress Tracking**: Automatically remembers where you left off.
    -   **Pagination**: Read comfortably with simulated book pages or continuous scroll.

## Writer Tools

The Writer View includes specialized AI tools to assist your creative process.

### 1. Structure Power Editor
Manage your entire book's outline as a simple text file.
-   **Usage**: Click the **File Text** icon in the sidebar header.
-   **Features**:
    -   **Bulk Editing**: Type `Chapter 1: Title` and `Scene: Title` to rapidly build structure.
    -   **Smart Format**: Automatically cleans up your text and numbering.

### 2. The Power Dock (Editor Tools)
The **Power Dock** is your context-aware toolbar located at the bottom of the editor. It provides instant access to AI writing tools.

**Available Tools**:
-   **Batch Write**: Generate content for multiple selected scenes automatically.
-   **Rewrite**: Select text to have the AI rephrase it with a specific instruction (e.g., "Show, don't tell").
-   **Expand**: Select a short paragraph or sentence and have the AI flesh it out with more detail.
-   **Critique**: Get feedback on the current scene's pacing, dialogue, and tone.
-   **Check**: Analyze the chapter for plot holes, character inconsistencies, and setting errors.
-   **Lore**: Generate new lore entities (characters, locations) based on a prompt.
-   **Search**: Search your project's entities and content for specific details.
-   **Export**: Download the current scene as a Markdown file.

### 3. Write & Generate
Once you have a structure, you can start writing.

-   **Generate Scenes (AI)**: Click the **Sparkles** icon next to a Chapter in the sidebar. The AI will draft content for all pending scenes in that chapter.
-   **Project-Aware Chat**: Open the **Floating Assistant** to ask the AI questions about your world, brainstorm ideas, or draft new scenes with specific instructions.

### 4. Analyze & Refine
Use the **World Canvas** (Right Panel) to gain insights and ensure consistency. The canvas is a powerful tool for visualizing your story's structure and content.

-   **Bible**: The central repository for all your world-building information.
-   **Graph / Network**: Visualizes the relationships between your entities.
-   **Arc**: Analyzes your story's narrative arc (pacing and tension).
-   **Timeline**: Tracks chronological events to ensure your plot is consistent.
-   **Map**: A visual gallery of your locations.
-   **Scenes / Kanban**: A Kanban-style board for managing the status of your scenes.
-   **Context**: Shows exactly what information the AI "sees" when generating a scene.
-   **Diagnostics**: Runs health checks on your story.

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
Restore previous versions of your scene without losing progress.

1.  **Activate**: Click the **Clock** icon (Time Travel) at the bottom of the editor to enter "Preview Mode".
2.  **Preview**: Drag the slider to scroll back through your writing history. The editor will show you exactly what the scene looked like at that moment.
3.  **Restore**: Click **Restore Version** to create a new snapshot with that content.
    *   *Note*: This doesn't erase your current work; it adds the restored version as the newest "step" in history, so you can always undo if you change your mind.

## Troubleshooting

### Common Issues

**1. "The AI keeps getting facts wrong"**
*   **Cause**: The AI might not have access to the specific detail you need.
*   **Fix**: Update your **Bible** (Entity Database). Ensure the character or location has a clear description. Check the **Context** pane to see if that entity is currently active in the scene.

**2. "Generation is stalled or spinning forever"**
*   **Cause**: Vercel Serverless Function timeouts (usually after 60 seconds) or browser connection interruptions.
*   **Fix**: Refresh the page. The system saves generation progress in real-time, so you shouldn't lose much work. Try generating smaller chunks (one scene at a time) instead of a whole chapter.

**3. "I can't find my project"**
*   **Cause**: You might be logged into a different account or the project was deleted.
*   **Fix**: Check the "Shared" tab if you are looking for a community project.

**4. "Models are not loading"**
*   **Cause**: API key issues or OpenRouter service outages.
*   **Fix**: Go to **Settings > Models** and try selecting a different default model (e.g., switch from "Middle" to "Light").
