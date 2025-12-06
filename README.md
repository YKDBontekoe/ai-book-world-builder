<p align="center">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
</p>

<h1 align="center">Chat SDK</h1>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon](https://neon.tech/) for saving chat history and user data
  - Blob storage for efficient file storage
- Project-aware chat
  - Switch between recent projects from the chat hero and launch quick-start prompts per world
  - Ground agent replies in selected project folders and entities via the AI SDK-powered copilot backend
  - Persist project selection across sessions via URL and cookie context so conversations stay grounded
- Story workspace
  - Generate outlines with POV, tone, and pacing controls and save them per project
  - Draft prose side-by-side with AI suggestions grounded in your lore entities
  - Saved outlines stay deduplicated and sorted by newest first in the draft workspace
  - Highlight text to fire rewrite prompts, review AI rationales, and restore or diff auto-versioned drafts
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This template uses an AI gateway to access multiple AI models through a unified interface. The default configuration includes [xAI](https://x.ai) models (`grok-2-vision-1212`, `grok-3-mini`) routed through the gateway.

Available chat models:

- **Grok Vision** (`chat-model`): Multimodal chat with image upload support.
- **Grok Lite** (`chat-model-lite`): Cost-effective, text-only chats for everyday prompts.
- **Grok Reasoning** (`chat-model-reasoning`): Chain-of-thought responses for complex tasks.

Image uploads require the Grok Vision model because it is the only vision-enabled option.

### AI Gateway Authentication

Provide an AI Gateway API key by setting the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can also switch to direct LLM providers like [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://ai-sdk.dev/providers/ai-sdk-providers) with just a few lines of code.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. Copy the example file to `.env.local` and fill in the required values for your chosen providers.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install dependencies with your preferred package manager (examples below use `pnpm`).
2. Copy `.env.example` to `.env.local` and update the environment variables.

```bash
pnpm install
pnpm db:migrate # Setup database or apply latest database changes
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).

## Data handling and safety

Review [docs/data-handling.md](docs/data-handling.md) for guidance on managing secrets and environment variables, protecting PII, applying rate limits, logging safely, and adding guard rails to model prompts and generated content.

## Testing

See [docs/testing.md](docs/testing.md) for expectations and commands covering unit (Vitest/React Testing Library), integration/end-to-end (Playwright), and accessibility checks, plus what must pass in CI before merging changes.

## Git hooks

Set the local hooks path to `.githooks` to ensure commits run linting and type checks before landing:

```bash
git config core.hooksPath .githooks
```

The `pre-commit` hook runs `pnpm lint` and `pnpm exec tsc --noEmit` to catch regressions early.
