# Architecture Overview

This document summarizes the key modules that power the chat experience, persistence layer, authentication, and blob storage, and shows how the AI SDK is wired through the request lifecycle.

## Chat pipeline
- **Client chat surface**: The `components/chat.tsx` client component uses the AI SDK `useChat` hook to manage state, throttle sends, and stream UI updates over `DefaultChatTransport` targeting `/api/chat`. It enriches outbound requests with the selected model and visibility flag, mirrors server data through `DataStreamHandler`, and reconciles usage updates from `data-usage` events.【F:components/chat.tsx†L5-L145】
- **Server execution**: The `/api/chat` route turns UI messages into model messages, enforces auth and daily message entitlements, and decides whether to create a new chat (with generated title) or load history. It streams responses via `streamText` with optional tool calls and smooth chunking, forwards telemetry, and persists messages plus last-usage context when streaming completes.【F:app/(chat)/api/chat/route.ts†L1-L231】
- **Chat tools**: AI functions such as `getWeather`, `createDocument`, `updateDocument`, and `requestSuggestions` are registered as tools for the model when allowed, enabling the assistant to branch into document workflows or suggestion generation during a chat turn.【F:app/(chat)/api/chat/route.ts†L74-L126】

## Data persistence
- **Database access**: `lib/db/queries.ts` centralizes Drizzle ORM queries against Postgres for users, chats, messages, streams, votes, and documents. It handles lifecycle operations such as creating chats, saving or deleting messages, updating visibility, pagination for history, and persisting usage context for analytics and throttling.【F:lib/db/queries.ts†L1-L200】
- **Schema coverage**: The same module offers helpers for counting messages per user (used in rate limits), saving stream IDs for resumable transport, pruning trailing messages, and recording votes or suggestions associated with chats.【F:lib/db/queries.ts†L200-L520】
- **Source material ledger**: The `SourceMaterial` table records uploaded reference files with project and user links, MIME type, size, blob URL, and status transitions, indexed by project and user for quick retrieval during chat grounding.【F:lib/db/schema/source-material.ts†L17-L52】

## Authentication
- **NextAuth configuration**: `app/(auth)/auth.ts` configures credential-based login and a guest-provider pathway. Sessions attach `id` and `type` to the JWT and session objects, allowing downstream handlers (such as `/api/chat` and file uploads) to authorize requests and apply entitlements based on user type.【F:app/(auth)/auth.ts†L1-L73】
- **Auth gating**: The chat entry page enforces authentication by redirecting unauthenticated users through the guest sign-in route before instantiating a new chat session, ensuring every chat run is associated with a user identity.【F:app/(chat)/page.tsx†L16-L43】

## File/blob storage
- **Uploads via Vercel Blob**: The `/api/files/upload` endpoint enforces project-scoped uploads (auth + projectId), validates PDF/EPUB/DOCX/TXT MIME types, and applies per-role size limits before creating a pending `SourceMaterial` record. After the blob is written with a project prefix, the handler advances the record to `uploaded` status and returns structured status and error codes for clients.【F:app/(chat)/api/files/upload/route.ts†L1-L158】【F:lib/source-materials.ts†L1-L88】

## AI SDK integration
- **Provider registry**: `lib/ai/providers.ts` declares language model IDs via the AI SDK `customProvider`, defaulting to Vercel AI Gateway-backed xAI models in production and mocked models in tests. Reasoning models are wrapped with `extractReasoningMiddleware` to expose “think” traces alongside responses.【F:lib/ai/providers.ts†L1-L29】
- **Model selection and prompts**: The chat route selects models dynamically based on the user’s choice, applies a system prompt with geolocation hints, and streams text via `streamText`, which also emits usage telemetry consumed by the UI.【F:app/(chat)/api/chat/route.ts†L88-L231】

## Request flow (end-to-end)
```text
User -> /chat (page) --auth--> guest/login
  -> Chat component (useChat) --POST /api/chat--> auth + rate limit + load/create chat
      -> streamText (AI SDK) -> tools (weather/doc/suggestions) -> data-usage events
      -> persist messages/usage (Drizzle/Postgres)
  <- SSE/JSON stream --DefaultChatTransport--> UI renders Messages & usage
```

## Code map
- Client chat UI: [`components/chat.tsx`](../components/chat.tsx)
- Chat API & streaming: [`app/(chat)/api/chat/route.ts`](../app/(chat)/api/chat/route.ts)
- Database queries: [`lib/db/queries.ts`](../lib/db/queries.ts)
- Authentication: [`app/(auth)/auth.ts`](../app/(auth)/auth.ts)
- File uploads (blob): [`app/(chat)/api/files/upload/route.ts`](../app/(chat)/api/files/upload/route.ts)
- Model provider registry: [`lib/ai/providers.ts`](../lib/ai/providers.ts)
```
