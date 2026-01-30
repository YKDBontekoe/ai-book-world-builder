import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateSceneContent } from "@/lib/db/queries/scene";

const mocks = vi.hoisted(() => {
	type MockMethod = ReturnType<typeof vi.fn>;
	interface MockChain {
		select: MockMethod;
		from: MockMethod;
		where: MockMethod;
		orderBy: MockMethod;
		limit: MockMethod;
		offset: MockMethod;
		insert: MockMethod;
		values: MockMethod;
		returning: MockMethod;
		update: MockMethod;
		set: MockMethod;
		delete: MockMethod;
		then: MockMethod;
		result: any[];
		error: any;
	}

	const mockChain = {
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
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
		then: vi.fn((resolve, reject) => {
			if (mockChain.error) {
				return Promise.reject(mockChain.error).catch(reject);
			}
			return Promise.resolve(mockChain.result).then(resolve);
		}),
		result: [],
		error: null,
	} as MockChain;

	const methods: (keyof MockChain)[] = [
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

const ormMocks = vi.hoisted(() => ({
	and: vi.fn().mockReturnValue("AND_CLAUSE"),
	asc: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	sql: Object.assign(
		vi.fn(() => ({ as: vi.fn() })),
		{ raw: vi.fn() },
	),
}));

vi.mock("drizzle-orm", () => ormMocks);

describe("Scene Queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		mocks.result = [];
		mocks.error = null;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("updateSceneContent", () => {
		it("should update content without projectId (legacy)", async () => {
			const mockScene = { id: "s1", content: "New Content", status: "drafted" };
			mocks.result = [mockScene];

			const result = await updateSceneContent({
				sceneId: "s1",
				content: "New Content",
			});
			expect(result).toEqual(mockScene);
			expect(mocks.update).toHaveBeenCalled();
			expect(mocks.where).toHaveBeenCalled();
			expect(ormMocks.and).not.toHaveBeenCalled();
		});

		it("should update content with projectId check", async () => {
			const mockScene = {
				id: "s1",
				content: "Secure Content",
				status: "drafted",
				projectId: "p1",
			};
			mocks.result = [mockScene];

			const result = await updateSceneContent({
				sceneId: "s1",
				content: "Secure Content",
				projectId: "p1",
			});

			expect(result).toEqual(mockScene);
			expect(mocks.update).toHaveBeenCalled();

			// Verify that 'and' was called to combine the checks
			expect(ormMocks.and).toHaveBeenCalled();
			expect(mocks.where).toHaveBeenCalledWith("AND_CLAUSE");
		});
	});
});
