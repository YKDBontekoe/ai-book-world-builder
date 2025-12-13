<p align="center">
  <img alt="AI Book World Builder" src="app/(chat)/opengraph-image.png">
</p>

<h1 align="center">AI Book World Builder</h1>

<p align="center">
  A specialized AI tool for authors to build worlds, plan stories, and generate books using advanced LLMs.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#design-system"><strong>Design System</strong></a> ·
  <a href="#verification"><strong>Verification</strong></a>
</p>
<br/>

**AI Book World Builder** helps authors craft complex narratives by grounding AI generations in their custom world data. It combines project-aware chat with structured book generation workflows.

## Features

### 📚 Book Generation
A step-by-step wizard to go from concept to draft:
- **Context Selection**: Choose specific entities, outlines, and scenes to ground the generation.
- **Configuration**: Select AI models (Writer/Reviewer), set writing style, and define revision rounds.
- **Review & Generate**: Verify settings before launching the generation process.
- **Dashboard**: Monitor progress as chapters are written, reviewed, and refined in real-time.

### 🌍 Project-Aware Chat
- **Context Grounding**: Chat with an AI that knows your project's specific entities (characters, locations, lore).
- **Persistent Context**: Project selection is preserved across sessions via URL and cookies.
- **Quick Prompts**: Launch context-specific prompts directly from the project dashboard.

### 📝 Story Workspace
- **Outlining**: Create and manage outlines with controls for POV, tone, and pacing.
- **Drafting**: Write side-by-side with AI suggestions.
- **Versioning**: Auto-save drafts, diff versions, and restore previous states.
- **Entity Management**: Organize your world's lore in a structured database.

## Design System

This project adheres to a **Native macOS Aesthetic** to provide a premium, desktop-class experience on the web.
- **Visuals**: Extensive use of glassmorphism (`.glass`, `.glass-panel`), translucent materials, and `rounded-lg` (16px) or `rounded-2xl` corners.
- **Motion**: Fluid animations using spring physics (stiffness: 400, damping: 25).
- **Typography**: Clean, legible sans-serif fonts optimized for reading and writing.

See [`docs/design-system.md`](docs/design-system.md) for full guidelines.

## Verification

We employ a **Dual Verification Strategy** to ensure high quality and stability.

### 1. Functional Verification (TypeScript)
We use **Playwright** and **Vitest** for logic and regression testing.
- Run Unit Tests: `pnpm exec vitest run`
- Run E2E Tests: `pnpm exec playwright test`

### 2. Visual Verification (Python)
We use Python scripts with Playwright to perform visual verification, ensuring the UI matches the design system.
- Scripts are located in the `verification/` directory.
- These scripts capture screenshots to verify layout and styling.

> **Note**: Both functional and visual checks must pass before merging changes. See [`AGENTS.md`](AGENTS.md) for the contributor workflow.

## Getting Started

### Prerequisites
- Node.js & pnpm
- PostgreSQL database (e.g., Neon)
- Blob storage (e.g., Vercel Blob)
- AI Gateway API key (or keys for individual providers like OpenAI, Anthropic)

### Installation

1.  **Clone and Install**
    ```bash
    git clone https://github.com/YKDBontekoe/ai-book-world-builder.git
    cd ai-book-world-builder
    pnpm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env.local` and fill in your keys:
    ```bash
    cp .env.example .env.local
    ```

3.  **Database Setup**
    Initialize the database schema:
    ```bash
    pnpm db:migrate
    ```

4.  **Run Locally**
    ```bash
    pnpm dev
    ```
    The app will be available at `http://localhost:3000`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Vercel AI SDK
- **Database**: Drizzle ORM + PostgreSQL
- **Styling**: Tailwind CSS v4
- **Auth**: Auth.js
- **Testing**: Playwright, Vitest

## License

This project is open source.
