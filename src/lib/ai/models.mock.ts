import type { LanguageModel } from "ai";

const createMockModel = (): LanguageModel => {
  return {
    specificationVersion: "v1", // Updated to v1 for simpler compat, or keep v2 but ensure types align
    provider: "mock",
    modelId: "mock-model",
    defaultObjectGenerationMode: "json",
    doGenerate: async (options: any) => { // Added explicit any to suppress TS7006
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
        text,
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        rawCall: { rawPrompt: null, rawSettings: {} },
        warnings: [],
      };
    },
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({
            type: "text-delta",
            textDelta: "Mock response", // v1 spec usually uses textDelta
          });
          controller.close();
        },
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      warnings: [],
    }),
  } as unknown as LanguageModel;
};

export const chatModel = createMockModel();
export const liteModel = createMockModel();
export const reasoningModel = createMockModel();
export const gpt4oMiniModel = createMockModel();
export const geminiModel = createMockModel();
export const haikuModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
