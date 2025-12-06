# AI Integration Patterns (Vercel AI SDK)

This document outlines how AI features are implemented in the project, specifically in `app/(chat)/api/chat/route.ts` and `lib/ai`.

## Streaming Response Pattern

We use `streamText` from the `ai` package and pipe it through `JsonToSseTransformStream`.

```typescript
// app/(chat)/api/chat/route.ts
const stream = createUIMessageStream({
  execute: ({ writer: dataStream }) => {
    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      system: systemPrompt({ ... }),
      messages: convertToModelMessages(uiMessages),
      tools: {
        getWeather,
        createDocument: createDocument({ session, dataStream }),
        // ...
      },
      onFinish: async ({ usage }) => {
        // Handle usage tracking
        dataStream.write({ type: "data-usage", data: usage });
      },
    });

    result.consumeStream();
    dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
  },
});

return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
```

## Provider Configuration

Providers are configured in `lib/ai/providers.ts` using `customProvider` to switch between mocking (test) and real gateways (prod).

```typescript
// lib/ai/providers.ts
export const myProvider = customProvider({
  languageModels: {
    "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
    "chat-model-reasoning": wrapLanguageModel({
      model: gateway.languageModel("xai/grok-3-mini"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    // ...
  },
});
```

## Tool Implementation

Tools are defined as standard AI SDK tools but often inject context (like session or dataStream).

```typescript
// lib/ai/tools/create-document.ts
export const createDocument = ({ session, dataStream }) => tool({
  description: '...',
  parameters: z.object({ ... }),
  execute: async ({ title, content }) => {
    // DB operations
    // Stream updates via dataStream if needed
    return { id, title, content };
  },
});
```

## Error Handling

We handle specific AI errors, such as Gateway credit card requirements.

```typescript
if (error instanceof Error && error.message?.includes("AI Gateway requires a valid credit card")) {
  return new ChatSDKError("bad_request:activate_gateway").toResponse();
}
```
