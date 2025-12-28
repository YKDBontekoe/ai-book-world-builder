import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { getResponseChunksByPrompt } from "../../../tests/prompts/utils";

const mockUsage = {
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
};

export const chatModel = new MockLanguageModelV3({
	doGenerate: async () => ({
		rawCall: { rawPrompt: null, rawSettings: {} },
		finishReason: "stop" as any,
		usage: mockUsage,
		text: "Hello, world!",
		content: [{ type: "text", text: "Hello, world!" }],
		warnings: [],
	}),
	doStream: async ({ prompt }) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt),
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const reasoningModel = new MockLanguageModelV3({
	doGenerate: async () => ({
		rawCall: { rawPrompt: null, rawSettings: {} },
		finishReason: "stop" as any,
		usage: mockUsage,
		text: "Hello, world!",
		content: [{ type: "text", text: "Hello, world!" }],
		warnings: [],
	}),
	doStream: async ({ prompt }) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt, true),
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const titleModel = new MockLanguageModelV3({
	doGenerate: async () => ({
		rawCall: { rawPrompt: null, rawSettings: {} },
		finishReason: "stop" as any,
		usage: mockUsage,
		text: "This is a test title",
		content: [{ type: "text", text: "This is a test title" }],
		warnings: [],
	}),
	doStream: async () => ({
		stream: simulateReadableStream({
			chunks: [
				{ type: "text-delta", id: "1", delta: "This is a test title" },
				{
					type: "finish",
					finishReason: "stop" as any,
					usage: mockUsage,
				},
			],
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});

export const artifactModel = new MockLanguageModelV3({
	doGenerate: async () => ({
		rawCall: { rawPrompt: null, rawSettings: {} },
		finishReason: "stop" as any,
		usage: mockUsage,
		text: "Hello, world!",
		content: [{ type: "text", text: "Hello, world!" }],
		warnings: [],
	}),
	doStream: async ({ prompt }) => ({
		stream: simulateReadableStream({
			chunks: getResponseChunksByPrompt(prompt),
		}),
		rawCall: { rawPrompt: null, rawSettings: {} },
	}),
});
