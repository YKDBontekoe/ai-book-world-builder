# User Guide: AI Book World Builder

Welcome to the AI Book World Builder! This guide will help you navigate the features designed to help you craft complex narratives, plan stories, and generate books.

## Getting Started

1.  **Create a Project**: On the dashboard, click **"New Project"**. Give it a title and a genre. This creates your workspace.
2.  **Add Entities**: Go to the **"World"** tab. Here you can add Characters, Locations, and Lore. The more you add here, the smarter the AI becomes about your world.
3.  **Create an Outline**: In the **"Story"** tab, start planning your chapters. You don't need to write the prose yet—just the high-level beats.

## Book Generation Wizard

The Book Generation feature is a powerful tool to turn your outline into a draft. Here is how to use it effectively.

### 1. Context Selection
*Why it matters:* The AI doesn't know your whole book by default. You need to tell it what matters for *this specific generation run*.
- **Entities**: Select the characters and locations that appear in the chapters you are generating.
- **Scenes**: Select the specific scenes from your outline you want to write.

> **Tip**: Don't select everything! Selecting only relevant characters keeps the AI focused and prevents it from hallucinating interactions that shouldn't happen.

### 2. Model Selection
We separate the "Writer" from the "Reviewer".
- **Writer Model**: This is the creative engine (usually Claude 3.5 Sonnet). It focuses on prose, dialogue, and pacing.
- **Reviewer Model**: This acts as an editor. It checks the writer's work for logical inconsistencies or weak writing.

### 3. Writing Style
You can control the "Voice" of the AI.
- **Presets**: Choose from styles like "Hemingway" (short, punchy) or "Tolkien" (descriptive, epic).
- **Custom**: You can write your own style prompt!
  - *Example*: "Write in a noir style, with cynical inner monologues and shadowy descriptions."
- **Author Inspirations**: List authors you want the AI to emulate.

## Project-Aware Chat

The chat bar on the right isn't just a standard chatbot. It knows your project.

- **Ask about your world**: "Who is the king of the Western Lands?" (It looks up your "Western Lands" entity).
- **Brainstorm**: "Give me 5 plot twists involving [Character Name]."
- **Drafting**: "Write a scene where [Character A] meets [Character B] for the first time."

> **Pro Tip**: Use the **"@"** key to explicitly reference a specific character or document in your chat.

## Troubleshooting

- **The AI got a fact wrong**: Check your **World** entities. Does the entity exist? Is the description clear? The AI relies on what you've written there.
- **The generation is stalled**: Large generations can take time. If it seems stuck, try refreshing the page. The "Orchestrator" saves progress at every step, so you won't lose work.
