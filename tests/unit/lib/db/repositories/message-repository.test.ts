import { beforeEach, describe, expect, it, vi } from "vitest";
import { messageRepository } from "@/lib/db/repositories/message-repository";
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
		innerJoin: vi.fn(),
		execute: vi.fn(),
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
		"innerJoin",
		"execute",
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
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	gte: vi.fn(),
	inArray: vi.fn(),
	count: vi.fn(() => ({ name: "count" })),
}));

describe("MessageRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.results = null;
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a message when found", async () => {
			const mockMsg = { id: "m1", parts: [] };
			mocks.result = [mockMsg];

			const result = await messageRepository.findById("m1");
			expect(result).toEqual(mockMsg);
		});
	});

	describe("findByChatId", () => {
		it("should return messages for a chat", async () => {
			const mockMsgs = [{ id: "m1", chatId: "c1" }];
			mocks.result = mockMsgs;

			const result = await messageRepository.findByChatId("c1");
			expect(result).toEqual(mockMsgs);
		});
	});

	describe("create", () => {
		it("should create and return a message", async () => {
			const mockInput = { chatId: "c1", role: "user", parts: "hello" };
			const mockCreated = { id: "m1", ...mockInput };
			mocks.result = [mockCreated];

			const result = await messageRepository.create(mockInput);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("createMany", () => {
		it("should insert multiple messages", async () => {
			const mockMsgs = [
				{ id: "m1", chatId: "c1" },
				{ id: "m2", chatId: "c1" },
			];
			mocks.result = [];
			await messageRepository.createMany(mockMsgs as any);
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("deleteAfterTimestamp", () => {
		it("should delete messages and votes after timestamp", async () => {
			const mockMsgsToDelete = [{ id: "m2" }];

			mocks.results = [
				mockMsgsToDelete, // find messages to delete
				[], // delete votes
				[], // delete messages
			];

			await messageRepository.deleteAfterTimestamp("c1", new Date());
			expect(mocks.delete).toHaveBeenCalledTimes(2);
		});
	});

	describe("getCountByUserInWindow", () => {
		it("should return message count for user", async () => {
			mocks.result = [{ count: 5 }];
			const result = await messageRepository.getCountByUserInWindow("u1", 24);
			expect(result).toBe(5);
			expect(mocks.innerJoin).toHaveBeenCalled();
		});
	});

	describe("Vote Operations", () => {
		describe("vote", () => {
			it("should update existing vote", async () => {
				const existingVote = { id: "v1", messageId: "m1", isUpvoted: true };

				mocks.results = [
					[existingVote], // find existing
					[], // update
				];

				await messageRepository.vote({
					chatId: "c1",
					messageId: "m1",
					type: "down",
				});
				expect(mocks.update).toHaveBeenCalled();
			});

			it("should insert new vote if not exists", async () => {
				mocks.results = [
					[], // find existing (none)
					[], // insert
				];

				await messageRepository.vote({
					chatId: "c1",
					messageId: "m1",
					type: "up",
				});
				expect(mocks.insert).toHaveBeenCalled();
			});
		});

		describe("getVotesByChatId", () => {
			it("should return votes for chat", async () => {
				const mockVotes = [{ id: "v1", chatId: "c1" }];
				mocks.result = mockVotes;

				const result = await messageRepository.getVotesByChatId("c1");
				expect(result).toEqual(mockVotes);
			});
		});
	});
});
