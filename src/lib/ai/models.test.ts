import { experimental_generateObject, simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { getResponseChunksByPrompt } from "../../../tests/prompts/utils";

export const chatModel = new MockLanguageModelV3({
	specificationVersion: "v2",
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunkDelayInMs: 500,
			initialDelayInMs: 1000,
			chunks: getResponseChunksByPrompt(prompt) as any,
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const reasoningModel = new MockLanguageModelV3({
	specificationVersion: "v2",
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunkDelayInMs: 500,
_FIX_ME_		initialDelayInMs: 1000,
			chunks: getResponseChunksByPrompt(prompt, true) as any,
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const titleModel = new MockLanguageModelV3({
	specificationVersion: "v2",
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "This is a test title" }],
			warnings: [],
		}) as any,
	doStream: async () => ({
		stream: simulateReadableStream({
			chunkDelayInMs: 500,
			initialDelayInMs: 1000,
			chunks: [
				{ id: "1", type: "text-start" },
				{ id: "1", type: "text-delta", delta: "This is a test title" },
				{ id: "1", type: "text-end" },
				{
					type: "finish",
					finishReason: "stop",
					usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
				},
			] as any,
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const artifactModel = new MockLanguageModelV3({
	specificationVersion: "v2",
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunkDelayInMs: 50,
			initialDelayInMs: 1000,
			chunks: getResponseChunksByPrompt(prompt) as any,
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});
