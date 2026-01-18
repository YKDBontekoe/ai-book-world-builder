import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mocks
const mocks = vi.hoisted(() => ({
	generateText: vi.fn(),
	generateObject: vi.fn(),
	streamText: vi.fn(),
	getSelectedModelId: vi.fn(),
	myProvider: {
		languageModel: vi.fn((id) => ({ id })),
	},
}));

// Mock dependencies
vi.mock("ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("ai")>();
	return {
		...actual,
		generateText: mocks.generateText,
		generateObject: mocks.generateObject,
		streamText: mocks.streamText,
	};
});

vi.mock("@/lib/ai/models", () => ({
	getSelectedModelId: mocks.getSelectedModelId,
}));

vi.mock("@/lib/ai/providers", () => ({
	myProvider: mocks.myProvider,
}));

import { z } from "zod";
// Import after mocks
import { aiClient } from "@/lib/ai/services/ai-client";

describe("AI Client", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getSelectedModelId.mockResolvedValue("default-model");
	});

	describe("generateText", () => {
		it("should generate text with default model (large tier)", async () => {
			mocks.generateText.mockResolvedValue({ text: "Generated text" });

			const result = await aiClient.generateText({
				prompt: "Test prompt",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.text).toBe("Generated text");
			}
			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("large");
		});

		it("should use explicit modelId when provided", async () => {
			mocks.generateText.mockResolvedValue({ text: "Text" });

			await aiClient.generateText({
				prompt: "Test",
				options: { modelId: "explicit-model" },
			});

			expect(mocks.getSelectedModelId).not.toHaveBeenCalled();
			expect(mocks.myProvider.languageModel).toHaveBeenCalledWith(
				"explicit-model",
			);
		});

		it("should use modelTier when provided", async () => {
			mocks.generateText.mockResolvedValue({ text: "Text" });
			mocks.getSelectedModelId.mockResolvedValue("light-model");

			await aiClient.generateText({
				prompt: "Test",
				options: { modelTier: "light" },
			});

			expect(mocks.getSelectedModelId).toHaveBeenCalledWith("light");
		});

		it("should return error on failure", async () => {
			mocks.generateText.mockRejectedValue(new Error("API Error"));

			const result = await aiClient.generateText({
				prompt: "Test",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("API Error");
			}
		});
	});

	describe("generateObject", () => {
		const testSchema = z.object({
			title: z.string(),
		});

		it("should generate object with schema", async () => {
			mocks.generateObject.mockResolvedValue({
				object: { title: "Test Title" },
			});

			const result = await aiClient.generateObject({
				prompt: "Generate a title",
				schema: testSchema,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.object).toEqual({ title: "Test Title" });
			}
		});

		it("should pass temperature option", async () => {
			mocks.generateObject.mockResolvedValue({ object: { title: "T" } });

			await aiClient.generateObject({
				prompt: "Test",
				schema: testSchema,
				options: { temperature: 0.5 },
			});

			expect(mocks.generateObject).toHaveBeenCalledWith(
				expect.objectContaining({
					temperature: 0.5,
				}),
			);
		});

		it("should return error on failure", async () => {
			mocks.generateObject.mockRejectedValue(
				new Error("Schema validation failed"),
			);

			const result = await aiClient.generateObject({
				prompt: "Test",
				schema: testSchema,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Schema validation failed");
			}
		});
	});

	describe("streamText", () => {
		it("should collect streamed text", async () => {
			const mockStream = (async function* () {
				yield "Hello";
				yield " ";
				yield "World";
			})();

			mocks.streamText.mockReturnValue({
				textStream: mockStream,
			});

			const result = await aiClient.streamText({
				prompt: "Test",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.text).toBe("Hello World");
			}
		});

		it("should call onChunk callback for each chunk", async () => {
			const chunks: string[] = [];
			const mockStream = (async function* () {
				yield "A";
				yield "B";
				yield "C";
			})();

			mocks.streamText.mockReturnValue({
				textStream: mockStream,
			});

			await aiClient.streamText({
				prompt: "Test",
				onChunk: (chunk) => chunks.push(chunk),
			});

			expect(chunks).toEqual(["A", "B", "C"]);
		});
	});
});
