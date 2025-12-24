import type { LanguageModel } from "ai";

const createMockModel = (): LanguageModel => {
	return {
		specificationVersion: "v1",
		provider: "mock",
		modelId: "mock-model",
		defaultObjectGenerationMode: "json",
		doGenerate: async (options: any) => {
			const promptString = JSON.stringify(
				options.inputFormat === "messages" ? options.input : options.prompt,
			);
			let text = "Hello, world!";

			if (promptString.includes("Break this chapter into")) {
				text = JSON.stringify({
					scenes: [
						{ title: "Scene 1", beat: "Something happens" },
						{ title: "Scene 2", beat: "Something else happens" },
					],
				});
			} else if (promptString.includes("Create a book outline")) {
				text = JSON.stringify({
					title: "Mock Book",
					logline: "A mock story.",
					summary: "Full summary.",
					chapters: [
						{ title: "Chapter 1", summary: "Summary 1" },
						{ title: "Chapter 2", summary: "Summary 2" },
					],
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
						textDelta: "Mock response",
					});
					controller.close();
				},
			}),
			rawCall: { rawPrompt: null, rawSettings: {} },
			usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
			warnings: [],
		}),
	} as any as LanguageModel;
};

export const chatModel = createMockModel();
export const liteModel = createMockModel();
export const reasoningModel = createMockModel();
export const gpt4oMiniModel = createMockModel();
export const geminiModel = createMockModel();
export const haikuModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
