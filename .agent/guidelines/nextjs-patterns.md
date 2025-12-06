# Next.js 14 App Router Patterns

This document outlines the specific Next.js 14 App Router patterns used in the AI Book World Builder project.

## Server vs Client Component Patterns

### Client Components
We use `'use client'` components extensively for the interactive chat interface.

**Key Pattern: Orchestrator Components**
The `Chat` component (`components/chat.tsx`) acts as a client-side orchestrator that manages state and passes handlers to interacting sub-components.

```typescript
// components/chat.tsx
'use client';

import { useChat } from "ai/react";

export function Chat({ id, initialMessages }: ChatProps) {
  const { messages, append, reload, stop } = useChat({
    api: "/api/chat",
    id,
    initialMessages,
    // ...configuration
  });

  return (
    <>
      <ChatHeader />
      <Messages messages={messages} />
      <MultimodalInput sendMessage={append} />
    </>
  );
}
```

### Server Components
We use Server Components for the initial page load and layout shells.

```typescript
// app/(chat)/chat/[id]/page.tsx
export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const chat = await getChatById({ id: params.id });
  
  // Data passed as props to Client Component
  return <Chat id={chat.id} initialMessages={chat.messages} />;
}
```

## Data Fetching

### SWR for Client-Side Polling
We use `swr` for data that needs live updates or isn't critical for initial render, like vote status.

```typescript
// components/chat.tsx
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

const { data: votes } = useSWR<Vote[]>(
  messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
  fetcher
);
```

### Server Actions
We use Server Actions for mutations that redirect or revalidate, like generating titles.

```typescript
// app/actions.ts
'use server';

export async function generateTitleFromUserMessage({ message }: { message: Message }) {
  // Logic...
  return title;
}
```

## Route Handlers

Our API routes (e.g., `app/(chat)/api/chat/route.ts`) follow a strict pattern:
1. Parse request body with Zod schema.
2. Verify authentication (`auth()`).
3. specific checks (rate limits, permissions).
4. Core logic (AI streaming, DB operations).
5. Error handling using `ChatSDKError`.

```typescript
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = postRequestBodySchema.parse(json);
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }
    
    // ... logic
    
    return new Response(stream);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    // ... generic error handling
    return new ChatSDKError("offline:chat").toResponse();
  }
}
```
