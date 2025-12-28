import { type LanguageModel, simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";

const createMockModel = (): LanguageModel => {
	return new MockLanguageModelV3({
		doGenerate: async () => ({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop" as any,
			usage: {
				inputTokens: {
					total: 10,
					noCache: undefined,
					cacheRead: undefined,
					cacheWrite: undefined,
				},
				outputTokens: {
					total: 20,
					text: 20,
					reasoning: 0,
				},
			},
			text: "Hello, world!",
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}),
		doStream: async () => ({
			stream: simulateReadableStream({
				chunks: [
					{ type: "text-delta", id: "1", delta: "Mock response" },
					{
						type: "finish",
						finishReason: "stop" as any,
						usage: {
							inputTokens: {
								total: 10,
								noCache: undefined,
								cacheRead: undefined,
								cacheWrite: undefined,
							},
							outputTokens: {
								total: 20,
								text: 20,
								reasoning: 0,
							},
						},
					},
				],
			}),
			rawCall: { rawPrompt: null, rawSettings: {} },
		}),
	});
};

export const chatModel = createMockModel();
export const liteModel = createMockModel();
export const reasoningModel = createMockModel();
export const gpt4oMiniModel = createMockModel();
export const geminiModel = createMockModel();
export const haikuModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
