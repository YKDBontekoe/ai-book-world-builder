# User Guide: AI Book World Builder

Welcome to the AI Book World Builder! This guide will help you navigate the features designed to help you craft complex narratives, plan stories, and generate books.

## Getting Started

1.  **Create a Project**: On the dashboard, click **"New Project"**. Give it a title and a genre. This creates your workspace.
2.  **Add Entities**: Go to the **"World"** tab. Here you can add Characters, Locations, and Lore. The more you add here, the smarter the AI becomes about your world.
3.  **Create an Outline**: In the **"Story"** tab, start planning your chapters. You don't need to write the prose yet—just the high-level beats.

## Writer Interface

The Project View is divided into three main panels to help you organize and write your story:

1.  **Navigation (Left)**: This sidebar lists your Chapters and Scenes. Use it to jump between different parts of your book.
2.  **Editor (Center)**: This is your main writing space. It works like a standard document editor but is connected to the AI.
3.  **Canvas (Right)**: A visual board for your world. You can view your entities and their relationships here.

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

You can customize which AI models are used for different tasks in the **Settings > Models** menu. We categorize models into three tiers:

*   **Light**: Fast and efficient. Used for simple chat questions and quick suggestions.
*   **Middle**: Balanced performance. Used for most writing tasks and analyzing your world.
*   **Large**: High intelligence. Used for complex reasoning, outlining your story, and orchestration.

By default, the system selects the best available models (e.g., "OpenRouter Auto"), but you can override these if you have specific preferences (like using Claude 3.5 Sonnet for writing).

## Project-Aware Chat

The chat bar on the right (or "Floating Assistant") isn't just a standard chatbot. It knows your project.

-   **Ask about your world**: "Who is the king of the Western Lands?" (It looks up your "Western Lands" entity).
-   **Brainstorm**: "Give me 5 plot twists involving [Character Name]."
-   **Drafting**: "Write a scene where [Character A] meets [Character B] for the first time."

> **Pro Tip**: Use the **"@"** key to explicitly reference a specific character or document in your chat.

## Troubleshooting

-   **The AI got a fact wrong**: Check your **World** entities. Does the entity exist? Is the description clear? The AI relies on what you've written there.
-   **The generation is stalled**: Large generations can take time. If it seems stuck, try refreshing the page. The system saves progress at every step, so you won't lose work.
