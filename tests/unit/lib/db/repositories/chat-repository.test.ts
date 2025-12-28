import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatRepository } from "@/lib/db/repositories/chat-repository";
import { NotFoundError } from "@/lib/errors";

const mocks = vi.hoisted(() => {
	const mockChain: any = {
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn(),
		limit: vi.fn(),
		offset: vi.fn(),
		insert: vi.fn(),
		values: vi.fn(),
		returning: vi.fn(),
		update: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		transaction: vi.fn((cb) => cb(mockChain)),
		_then: vi.fn(), // Internal thenable for async resolution
		result: [],
		results: null as any[] | null,
		error: null,
	};

	// Mock the thenable behavior for promise-like chaining
	// biome-ignore lint/suspicious/noThenProperty: Mocking a promise
	mockChain.then = async (resolve: any, reject: any) => {
		const currentResult =
			mockChain.results && mockChain.results.length > 0
				? mockChain.results.shift()
				: mockChain.result;

		if (mockChain.error) {
			if (reject) {
				return reject(mockChain.error);
			}
			throw mockChain.error;
		}
		if (resolve) {
			return resolve(currentResult);
		}
		return currentResult;
	};

	const methods = [
		"select",
		"from",
		"where",
		"orderBy",
		"limit",
		"offset",
		"insert",
		"values",
		"returning",
		"update",
		"set",
		"delete",
	];

	for (const method of methods) {
		mockChain[method].mockReturnValue(mockChain);
	}

	return mockChain;
});

vi.mock("@/lib/db/drizzle", () => ({
	db: mocks,
}));

vi.mock("drizzle-orm", () => ({
	and: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	gt: vi.fn(),
	lt: vi.fn(),
	inArray: vi.fn(),
}));

describe("ChatRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a chat when found", async () => {
			const mockChat = { id: "c1", title: "Chat 1" };
			mocks.result = [mockChat];

			const result = await chatRepository.findById("c1");
			expect(result).toEqual(mockChat);
		});
	});

	describe("findByUserPaginated", () => {
		it("should return paginated chats", async () => {
			const mockChats = [
				{ id: "c1", createdAt: new Date() },
				{ id: "c2", createdAt: new Date() },
			];
			mocks.result = mockChats;

			const result = await chatRepository.findByUserPaginated("u1", {
				limit: 1,
			});
			expect(result.chats).toHaveLength(1);
			expect(result.hasMore).toBe(true);
		});

		it("should handle startingAfter", async () => {
			const startingChat = { id: "c0", createdAt: new Date(1000) };
			const nextChats = [{ id: "c1", createdAt: new Date(2000) }];

			mocks.results = [
				[startingChat], // find selectedChat
				nextChats, // query results
			];

			const result = await chatRepository.findByUserPaginated("u1", {
				limit: 10,
				startingAfter: "c0",
			});
			expect(result.chats).toEqual(nextChats);
			expect(result.hasMore).toBe(false);
		});

		it("should throw NotFoundError if startingAfter chat not found", async () => {
			mocks.result = [];
			await expect(
				chatRepository.findByUserPaginated("u1", {
					limit: 10,
					startingAfter: "invalid",
				}),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("create", () => {
		it("should create and return a chat", async () => {
			const mockInput = {
				id: "c1",
				userId: "u1",
				title: "New",
				visibility: "private" as const,
			};
			const mockCreated = { ...mockInput, createdAt: new Date() };
			mocks.result = [mockCreated];

			const result = await chatRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update and return chat", async () => {
			const mockChat = { id: "c1", title: "Updated" };
			mocks.result = [mockChat];

			const result = await chatRepository.update("c1", { title: "Updated" });
			expect(result).toEqual(mockChat);
		});
	});

	describe("updateVisibility", () => {
		it("should update visibility", async () => {
			mocks.result = [];
			await chatRepository.updateVisibility("c1", "public");
			expect(mocks.update).toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should call delete on all related tables", async () => {
			mocks.result = [];
			await chatRepository.delete("c1");
			expect(mocks.delete).toHaveBeenCalledTimes(4); // vote, message, stream, chat
		});
	});

	describe("deleteAllByUser", () => {
		it("should delete all chats for a user", async () => {
			const userChats = [{ id: "c1" }, { id: "c2" }];

			mocks.results = [
				userChats, // find userChats
				[], // delete votes
				[], // delete messages
				[], // delete streams
				[{ id: "c1" }, { id: "c2" }], // delete chats returning
			];

			const result = await chatRepository.deleteAllByUser("u1");
			expect(result.deletedCount).toBe(2);
			expect(mocks.delete).toHaveBeenCalledTimes(4);
		});

		it("should return 0 if no chats found", async () => {
			mocks.result = [];
			const result = await chatRepository.deleteAllByUser("u1");
			expect(result.deletedCount).toBe(0);
		});
	});
});
