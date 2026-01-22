import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chatRepository } from "@/lib/db/repositories/chat-repository";
import { DatabaseError, NotFoundError } from "@/lib/errors";

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
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
		then(onFulfilled: any, onRejected: any) {
			const currentResult =
				mockChain.results && mockChain.results.length > 0
					? mockChain.results.shift()
					: mockChain.result;

			const p = mockChain.error
				? Promise.reject(mockChain.error)
				: Promise.resolve(currentResult);

			return p.then(onFulfilled, onRejected);
		},
		result: [],
		results: null as any[] | null,
		error: null,
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

vi.mock("@/lib/db", () => ({
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
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("findById", () => {
		it("should return a chat when found", async () => {
			const mockChat = { id: "c1", title: "Chat 1" };
			mocks.result = [mockChat];

			const result = await chatRepository.findById("c1");
			expect(result).toEqual(mockChat);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await chatRepository.findById("c1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.findById("c1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findAll", () => {
		it("should return all chats", async () => {
			const chats = [{ id: "c1" }];
			mocks.result = chats;
			const result = await chatRepository.findAll();
			expect(result).toEqual(chats);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.findAll()).rejects.toThrow(DatabaseError);
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

		it("should handle endingBefore", async () => {
			const endingChat = { id: "cEnd", createdAt: new Date(3000) };
			const prevChats = [{ id: "c1", createdAt: new Date(2000) }];

			mocks.results = [
				[endingChat], // find selectedChat
				prevChats, // query results
			];

			const result = await chatRepository.findByUserPaginated("u1", {
				limit: 10,
				endingBefore: "cEnd",
			});
			expect(result.chats).toEqual(prevChats);
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

		it("should throw NotFoundError if endingBefore chat not found", async () => {
			mocks.result = [];
			await expect(
				chatRepository.findByUserPaginated("u1", {
					limit: 10,
					endingBefore: "invalid",
				}),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on query failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				chatRepository.findByUserPaginated("u1", { limit: 10 }),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("create", () => {
		const mockInput = {
			id: "c1",
			userId: "u1",
			title: "New",
			visibility: "private" as const,
		};

		it("should create and return a chat", async () => {
			const mockCreated = { ...mockInput, createdAt: new Date() };
			mocks.result = [mockCreated];

			const result = await chatRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.create(mockInput)).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("update", () => {
		it("should update and return chat", async () => {
			const mockChat = { id: "c1", title: "Updated" };
			mocks.result = [mockChat];

			const result = await chatRepository.update("c1", { title: "Updated" });
			expect(result).toEqual(mockChat);
		});

		it("should throw NotFoundError if chat does not exist", async () => {
			mocks.result = [];
			await expect(
				chatRepository.update("c1", { title: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.update("c1", { title: "U" })).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("updateVisibility", () => {
		it("should update visibility", async () => {
			mocks.result = [];
			await chatRepository.updateVisibility("c1", "public");
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				chatRepository.updateVisibility("c1", "public"),
			).rejects.toThrow(DatabaseError);
		});
	});

	describe("updateLastContext", () => {
		it("should update last context", async () => {
			mocks.result = [];
			await chatRepository.updateLastContext("c1", {
				modelId: "m1",
				promptTokens: 10,
			} as any);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should catch and warn on failure instead of throwing", async () => {
			mocks.error = new Error("DB Error");
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			await chatRepository.updateLastContext("c1", {} as any);

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe("delete", () => {
		it("should call delete on all related tables", async () => {
			mocks.result = [];
			await chatRepository.delete("c1");
			expect(mocks.delete).toHaveBeenCalledTimes(4); // vote, message, stream, chat
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.delete("c1")).rejects.toThrow(DatabaseError);
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

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(chatRepository.deleteAllByUser("u1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});
});
