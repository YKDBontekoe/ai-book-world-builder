import type { LanguageModel } from "ai";

const createMockModel = (): LanguageModel => {
  const model: any = {
    specificationVersion: "v2",
    provider: "mock",
    modelId: "mock-model",
    defaultObjectGenerationMode: "json",
    supportedUrls: [],
    supportsImageUrls: false,
    supportsStructuredOutputs: true,
  };

  model.doGenerate = async (options: any) => {
    // Basic prompt inspection to return JSON for planning
    const promptString = JSON.stringify(options.inputFormat === "messages" ? options.input : options.prompt);

    let text = "Hello, world!";

    if (promptString.includes("Break this chapter into")) {
        // Return Scene Plan JSON
        text = JSON.stringify({
            scenes: [
                { title: "Scene 1", beat: "Something happens" },
                { title: "Scene 2", beat: "Something else happens" }
            ]
        });
    } else if (promptString.includes("Create a book outline")) {
        // Return Book Plan JSON
        text = JSON.stringify({
            title: "Mock Book",
            logline: "A mock story.",
            summary: "Full summary.",
            chapters: [
                { title: "Chapter 1", summary: "Summary 1" },
                { title: "Chapter 2", summary: "Summary 2" }
            ]
        });
    }

    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: "text", text }],
      warnings: [],
    };
  };

  model.doStream = async () => ({
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({
          type: "text-delta",
          id: "mock-id",
          delta: "Mock response",
        });
        controller.close();
      },
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  });

  return model as LanguageModel;
};

export const chatModel = createMockModel();
export const liteModel = createMockModel();
export const reasoningModel = createMockModel();
export const gpt4oMiniModel = createMockModel();
export const geminiModel = createMockModel();
export const haikuModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
