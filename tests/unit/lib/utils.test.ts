import { describe, expect, it, vi } from "vitest";
import type { DBMessage, Document } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { UIMessage } from "ai";
import {
	cn,
	convertToUIMessages,
	generateUUID,
	getTextFromMessage,
	sanitizeText,
} from "@/lib/utils";

describe("lib/utils", () => {
	describe("cn", () => {
		it("should merge class names correctly", () => {
			expect(cn("c1", "c2")).toBe("c1 c2");
			expect(cn("c1", { c2: true, c3: false })).toBe("c1 c2");
			expect(cn("p-4 p-2")).toBe("p-2"); // Tailwind merge check
		});
	});

	describe("generateUUID", () => {
		it("should generate a valid UUID v4 string", () => {
			const uuid = generateUUID();
			expect(uuid).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
			);
		});

		it("should generate unique UUIDs", () => {
			const uuid1 = generateUUID();
			const uuid2 = generateUUID();
			expect(uuid1).not.toBe(uuid2);
		});
	});

	describe("sanitizeText", () => {
		it("should remove <has_function_call> tag", () => {
			const input = "Some text <has_function_call> here.";
			expect(sanitizeText(input)).toBe("Some text  here.");
		});

		it("should return text unchanged if tag is missing", () => {
			const input = "No tag here.";
			expect(sanitizeText(input)).toBe("No tag here.");
		});
	});

	describe("convertToUIMessages", () => {
		it("should convert DBMessage to ChatMessage correctly", () => {
			const dbMessage: DBMessage = {
				id: "msg-1",
				role: "user",
				parts: [{ type: "text", text: "Hello" }],
				createdAt: new Date("2023-01-01T12:00:00Z"),
				usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
			} as DBMessage;

			const [uiMessage] = convertToUIMessages([dbMessage]);

			expect(uiMessage.id).toBe("msg-1");
			expect(uiMessage.role).toBe("user");
			expect(uiMessage.parts).toEqual([{ type: "text", text: "Hello" }]);
			expect(uiMessage.metadata?.createdAt).toBeDefined();
			expect(uiMessage.usage).toEqual({
				promptTokens: 10,
				completionTokens: 20,
				totalTokens: 30,
			});
		});

		it("should handle missing usage", () => {
			const dbMessage: DBMessage = {
				id: "msg-1",
				role: "assistant",
				parts: [{ type: "text", text: "Hi" }],
				createdAt: new Date("2023-01-01T12:00:00Z"),
				usage: null,
			} as DBMessage;

			const [uiMessage] = convertToUIMessages([dbMessage]);
			expect(uiMessage.usage).toBeUndefined();
		});
	});

	describe("getTextFromMessage", () => {
		it("should extract text from message parts", () => {
			const message: ChatMessage = {
				id: "1",
				role: "user",
				parts: [
					{ type: "text", text: "Hello" },
					{ type: "text", text: " world" },
				],
				createdAt: new Date(),
			};
			expect(getTextFromMessage(message)).toBe("Hello world");
		});

		it("should ignore non-text parts", () => {
			const message: ChatMessage = {
				id: "1",
				role: "assistant",
				parts: [
					{ type: "text", text: "Check this:" },
					{
						type: "tool-invocation",
						toolInvocation: { toolCallId: "1", toolName: "test", args: {} },
					} as any, // Cast to any to satisfy UIMessage type constraints during test
				],
				createdAt: new Date(),
			};
			expect(getTextFromMessage(message)).toBe("Check this:");
		});

		it("should return empty string if no text parts", () => {
			const message: ChatMessage = {
				id: "1",
				role: "assistant",
				parts: [
					{
						type: "tool-invocation",
						toolInvocation: { toolCallId: "1", toolName: "test", args: {} },
					} as any,
				],
				createdAt: new Date(),
			};
			expect(getTextFromMessage(message)).toBe("");
		});
	});
});
