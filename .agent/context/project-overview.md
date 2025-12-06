# Project Overview

AI Book World Builder is a sophisticated AI-powered application designed to help users create immersive book worlds. It leverages the latest web technologies to provide a responsive, real-time chat interface with rich artifact management capabilities.

## Technology Stack

### Core Framework
- **Next.js 16 (App Router)**: Utilizing the latest features including Server Components, Server Actions, and Partial Prerendering.
- **React 19**: Leveraging new hooks (`useActionState`, `useFormStatus`) and concurrent features.

### Database & ORM
- **PostgreSQL**: Primary relational database.
- **Drizzle ORM**: Type-safe database access with `drizzle-kit` for migrations.
- **Redis**: Used for resumable stream context (optional).

### UI & Styling
- **Tailwind CSS 4**: Utility-first styling engine.
- **shadcn/ui**: Reusable component primitives based on Radix UI.
- **Framer Motion**: Animation library.
- **Geist Font**: Optimised typeface.

### AI Capabilities
- **Vercel AI SDK 5**: Core library for AI integration.
- **Providers**: xAI (Grok) integration via Vercel AI Gateway.
- **Streaming**: Real-time text streaming with tool calling.

### Dev Tools
- **Biome (Ultracite)**: Fast formatter and linter.
- **Playwright**: End-to-end testing framework.
- **TypeScript**: Strict type safety.

## Key Features

1. **Interactive Chat**: Real-time AI chat with history and branching.
2. **Artifact System**: AI generative documents (text, code) that can be edited and versioned.
3. **World Building**: Project-based organization for entities, attributes, and relationships.
4. **Multimodal Input**: Support for text and file attachments.

## Project Structure

- `app/`: Next.js App Router file-system routing.
- `components/`: React components (UI primitives and feature-based).
- `lib/`: Utilities, database queries, AI configuration, and types.
- `hooks/`: Custom React hooks.
- `docs/`: System documentation.
