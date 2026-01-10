import { beforeEach, describe, expect, it, vi } from "vitest";
import { projectRepository } from "@/lib/db/repositories/project-repository";
import { DatabaseError, ForbiddenError, NotFoundError } from "@/lib/errors";

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
		// biome-ignore lint/suspicious/noThenProperty: Mocking thenable for Drizzle
		then: vi.fn((resolve, reject) => {
			if (mockChain.error) {
				return Promise.reject(mockChain.error).catch(reject);
			}
			return Promise.resolve(mockChain.result).then(resolve);
		}),
		result: [],
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
	ne: vi.fn(),
	or: vi.fn(),
	inArray: vi.fn(),
}));

describe("ProjectRepository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.result = [];
		mocks.error = null;
	});

	describe("findById", () => {
		it("should return a project when found", async () => {
			const mockProject = { id: "p1", name: "Project 1" };
			mocks.result = [mockProject];

			const result = await projectRepository.findById("p1");
			expect(result).toEqual(mockProject);
		});

		it("should return null when not found", async () => {
			mocks.result = [];
			const result = await projectRepository.findById("p1");
			expect(result).toBeNull();
		});

		it("should throw DatabaseError on database failure", async () => {
			mocks.error = new Error("DB error");
			await expect(projectRepository.findById("p1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByIdWithAccess", () => {
		it("should return project if public and no user provided", async () => {
			const mockProject = { id: "p1", visibility: "public", userId: "u1" };
			vi.spyOn(projectRepository, "findById").mockResolvedValueOnce(
				mockProject as any,
			);

			const result = await projectRepository.findByIdWithAccess("p1");
			expect(result).toEqual(mockProject);
		});

		it("should return null if private and no user provided", async () => {
			const mockProject = { id: "p1", visibility: "private", userId: "u1" };
			vi.spyOn(projectRepository, "findById").mockResolvedValueOnce(
				mockProject as any,
			);

			const result = await projectRepository.findByIdWithAccess("p1");
			expect(result).toBeNull();
		});

		it("should return project if private but owned by user", async () => {
			const mockProject = { id: "p1", visibility: "private", userId: "u1" };
			vi.spyOn(projectRepository, "findById").mockResolvedValueOnce(
				mockProject as any,
			);

			const result = await projectRepository.findByIdWithAccess("p1", "u1");
			expect(result).toEqual(mockProject);
		});

		it("should return null if private and not owned by user", async () => {
			const mockProject = { id: "p1", visibility: "private", userId: "u1" };
			vi.spyOn(projectRepository, "findById").mockResolvedValueOnce(
				mockProject as any,
			);

			const result = await projectRepository.findByIdWithAccess("p1", "u2");
			expect(result).toBeNull();
		});
	});

	describe("findByIdWithOwnership", () => {
		it("should throw NotFoundError if project not found", async () => {
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce(
				null,
			);
			await expect(
				projectRepository.findByIdWithOwnership("p1", "u1"),
			).rejects.toThrow(NotFoundError);
		});

		it("should throw ForbiddenError if not owned by user", async () => {
			const mockProject = { id: "p1", userId: "u2" };
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce(
				mockProject as any,
			);
			await expect(
				projectRepository.findByIdWithOwnership("p1", "u1"),
			).rejects.toThrow(ForbiddenError);
		});

		it("should return project if owned by user", async () => {
			const mockProject = { id: "p1", userId: "u1" };
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce(
				mockProject as any,
			);
			const result = await projectRepository.findByIdWithOwnership("p1", "u1");
			expect(result).toEqual(mockProject);
		});
	});

	describe("create", () => {
		it("should create and return a project", async () => {
			const mockInput = {
				name: "New Project",
				visibility: "private" as const,
				userId: "u1",
			};
			const mockProject = { id: "p1", ...mockInput };
			mocks.result = [mockProject];

			const result = await projectRepository.create(mockInput);
			expect(result).toEqual(mockProject);
			expect(mocks.insert).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update and return project", async () => {
			const mockProject = { id: "p1", name: "Updated" };
			mocks.result = [mockProject];

			const result = await projectRepository.update("p1", { name: "Updated" });
			expect(result).toEqual(mockProject);
			expect(mocks.update).toHaveBeenCalled();
		});

		it("should throw NotFoundError if project does not exist", async () => {
			mocks.result = [];
			await expect(
				projectRepository.update("p1", { name: "Updated" }),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("delete", () => {
		it("should call delete", async () => {
			mocks.result = {};
			await projectRepository.delete("p1");
			expect(mocks.delete).toHaveBeenCalled();
		});
	});

	describe("fork", () => {
		it("should fork a project", async () => {
			const original = {
				id: "p1",
				name: "Original",
				description: "Desc",
				folders: [],
			};
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce(
				original as any,
			);

			const forked = { id: "p2", name: "Fork of Original", userId: "u2" };
			mocks.result = [forked];

			const result = await projectRepository.fork("p1", "u2");
			expect(result).toEqual(forked);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw NotFoundError if original project not found", async () => {
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce(
				null,
			);
			await expect(projectRepository.fork("p1", "u1")).rejects.toThrow(
				NotFoundError,
			);
		});
	});
});
