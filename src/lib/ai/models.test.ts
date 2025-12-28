import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { getResponseChunksByPrompt } from "../../../tests/prompts/utils";

export const chatModel = new MockLanguageModelV3({
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop" as const,
			usage: {
				inputTokens: 10,
				outputTokens: 20,
				totalTokens: 30,
			},
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt),
		}) as any,
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const reasoningModel = new MockLanguageModelV3({
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop" as const,
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt, true),
		}) as any,
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const titleModel = new MockLanguageModelV3({
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop" as const,
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "This is a test title" }],
			warnings: [],
		}) as any,
	doStream: async () =>
		({
			stream: simulateReadableStream({
				chunks: [
					{ id: "1", type: "text-start" },
					{ id: "1", type: "text-delta", delta: "This is a test title" },
					{ id: "1", type: "text-end" },
					{
						type: "finish",
						finishReason: "stop",
						usage: { inputTokens: 3, outputTokens: 10 },
					},
				],
			}),
			rawCall: { rawPrompt: null, rawSettings: {} },
		}) as any,
});

export const artifactModel = new MockLanguageModelV3({
	doGenerate: async () =>
		({
			rawCall: { rawPrompt: null, rawSettings: {} },
			finishReason: "stop" as const,
			usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
			content: [{ type: "text", text: "Hello, world!" }],
			warnings: [],
		}) as any,
	doStream: async ({ prompt }: any) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt),
		}) as any,
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});
