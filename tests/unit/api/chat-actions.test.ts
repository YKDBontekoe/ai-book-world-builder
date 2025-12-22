import type { Session } from "next-auth";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
	deleteMessagesByChatIdAfterTimestamp: vi.fn(),
	getChatById: vi.fn(),
	getMessageById: vi.fn(),
	updateChatVisibilityById: vi.fn(),
}));

import { auth } from "@/app/(auth)/auth";
import {
	deleteTrailingMessages,
	updateChatVisibility,
} from "@/app/(chat)/actions";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import {
	deleteMessagesByChatIdAfterTimestamp,
	getChatById,
	getMessageById,
	updateChatVisibilityById,
} from "@/lib/db/queries";
import type { Chat, DBMessage } from "@/lib/db/schema";

const mockedAuth = vi.mocked(auth);
const mockedGetMessageById = vi.mocked(getMessageById);
const mockedGetChatById = vi.mocked(getChatById);
const mockedDeleteMessagesByChatIdAfterTimestamp = vi.mocked(
	deleteMessagesByChatIdAfterTimestamp,
);
const mockedUpdateChatVisibilityById = vi.mocked(updateChatVisibilityById);

function buildSession(userId: string): Session {
	return {
		user: {
			email: null,
			id: userId,
			image: null,
			name: "Test User",
			type: "regular",
		},
		expires: new Date().toISOString(),
	} satisfies Session;
}

function buildChat({ userId, id }: { userId: string; id: string }): Chat {
	return {
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		id,
		lastContext: null,
		title: "Test Chat",
		userId,
		visibility: "private",
	};
}

function buildMessage({
	chatId,
	id,
}: {
	chatId: string;
	id: string;
}): DBMessage {
	return {
		attachments: [],
		chatId,
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		id,
		parts: [],
		role: "user",
		usage: null,
	};
}

describe("deleteTrailingMessages", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("throws when no session is available", async () => {
		mockedAuth.mockResolvedValue(null);

		await expect(deleteTrailingMessages({ id: "message-1" })).rejects.toThrow(
			"Unauthorized",
		);

		expect(mockedGetMessageById).not.toHaveBeenCalled();
	});

	it("throws when the chat does not belong to the session user", async () => {
		mockedAuth.mockResolvedValue(buildSession("user-1"));
		mockedGetMessageById.mockResolvedValue([
			buildMessage({ chatId: "chat-1", id: "message-1" }),
		]);
		mockedGetChatById.mockResolvedValue(
			buildChat({ id: "chat-1", userId: "user-2" }),
		);

		await expect(deleteTrailingMessages({ id: "message-1" })).rejects.toThrow(
			"Forbidden",
		);

		expect(mockedDeleteMessagesByChatIdAfterTimestamp).not.toHaveBeenCalled();
	});

	it("deletes trailing messages for the chat owner", async () => {
		mockedAuth.mockResolvedValue(buildSession("user-1"));
		mockedGetMessageById.mockResolvedValue([
			buildMessage({ chatId: "chat-1", id: "message-1" }),
		]);
		mockedGetChatById.mockResolvedValue(
			buildChat({ id: "chat-1", userId: "user-1" }),
		);

		await deleteTrailingMessages({ id: "message-1" });

		expect(mockedDeleteMessagesByChatIdAfterTimestamp).toHaveBeenCalledWith({
			chatId: "chat-1",
			timestamp: new Date("2024-01-01T00:00:00.000Z"),
		});
	});
});

describe("updateChatVisibility", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("throws when the session is missing", async () => {
		mockedAuth.mockResolvedValue(null);

		const visibility: VisibilityType = "public";

		await expect(
			updateChatVisibility({ chatId: "chat-1", visibility }),
		).rejects.toThrow("Unauthorized");

		expect(mockedUpdateChatVisibilityById).not.toHaveBeenCalled();
	});

	it("rejects visibility updates from non-owners", async () => {
		mockedAuth.mockResolvedValue(buildSession("user-1"));
		mockedGetChatById.mockResolvedValue(
			buildChat({ id: "chat-1", userId: "user-2" }),
		);

		const visibility: VisibilityType = "private";

		await expect(
			updateChatVisibility({ chatId: "chat-1", visibility }),
		).rejects.toThrow("Forbidden");

		expect(mockedUpdateChatVisibilityById).not.toHaveBeenCalled();
	});

	it("updates visibility for the owning user", async () => {
		mockedAuth.mockResolvedValue(buildSession("user-1"));
		mockedGetChatById.mockResolvedValue(
			buildChat({ id: "chat-1", userId: "user-1" }),
		);

		const visibility: VisibilityType = "public";

		await updateChatVisibility({ chatId: "chat-1", visibility });

		expect(mockedUpdateChatVisibilityById).toHaveBeenCalledWith({
			chatId: "chat-1",
			visibility: "public",
		});
	});
});
