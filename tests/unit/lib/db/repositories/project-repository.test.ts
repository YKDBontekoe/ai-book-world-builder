import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
	ne: vi.fn(),
	or: vi.fn(),
	inArray: vi.fn(),
}));

describe("ProjectRepository", () => {
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

		it("should throw DatabaseError on failure", async () => {
			vi.spyOn(projectRepository, "findById").mockRejectedValueOnce(
				new DatabaseError("DB"),
			);
			await expect(projectRepository.findByIdWithAccess("p1")).rejects.toThrow(
				DatabaseError,
			);
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

	describe("findAll", () => {
		it("should return all projects", async () => {
			const projects = [{ id: "p1" }];
			mocks.result = projects;
			const result = await projectRepository.findAll();
			expect(result).toEqual(projects);
		});

		it("should apply pagination and sorting", async () => {
			mocks.result = [];
			await projectRepository.findAll({
				limit: 10,
				offset: 5,
				orderBy: "createdAt",
				orderDirection: "desc",
			});
			expect(mocks.limit).toHaveBeenCalledWith(10);
			expect(mocks.offset).toHaveBeenCalledWith(5);
			expect(mocks.orderBy).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.findAll()).rejects.toThrow(DatabaseError);
		});
	});

	describe("findVisibleToUser", () => {
		it("should return visible projects", async () => {
			const projects = [{ id: "p1" }];
			mocks.result = projects;
			const result = await projectRepository.findVisibleToUser("u1");
			expect(result).toEqual(projects);
		});

		it("should apply filter 'mine'", async () => {
			mocks.result = [];
			await projectRepository.findVisibleToUser("u1", "mine");
			expect(mocks.where).toHaveBeenCalled(); // verify called (logic mocked by drizzle-orm mock)
		});

		it("should apply filter 'shared'", async () => {
			mocks.result = [];
			await projectRepository.findVisibleToUser("u1", "shared");
			expect(mocks.where).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.findVisibleToUser("u1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByUserId", () => {
		it("should return user projects", async () => {
			const projects = [{ id: "p1" }];
			mocks.result = projects;
			const result = await projectRepository.findByUserId("u1");
			expect(result).toEqual(projects);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.findByUserId("u1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("create", () => {
		it("should create and return a project", async () => {
			const mockInput = {
				name: "New Project",
				description: "Desc",
				visibility: "private" as const,
				userId: "u1",
			};
			const mockProject = { id: "p1", ...mockInput };
			mocks.result = [mockProject];

			const result = await projectRepository.create(mockInput);
			expect(result).toEqual(mockProject);
			expect(mocks.insert).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				projectRepository.create({
					name: "n",
					visibility: "public",
					userId: "u",
				}),
			).rejects.toThrow(DatabaseError);
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

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.update("p1", {})).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("delete", () => {
		it("should call delete", async () => {
			mocks.result = {};
			await projectRepository.delete("p1");
			expect(mocks.delete).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.delete("p1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("deleteMany", () => {
		it("should return early if empty array", async () => {
			await projectRepository.deleteMany([]);
			expect(mocks.delete).not.toHaveBeenCalled();
		});

		it("should delete multiple projects", async () => {
			await projectRepository.deleteMany(["p1", "p2"]);
			expect(mocks.delete).toHaveBeenCalled();
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.deleteMany(["p1"])).rejects.toThrow(
				DatabaseError,
			);
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

		it("should throw DatabaseError on failure", async () => {
			vi.spyOn(projectRepository, "findByIdWithAccess").mockResolvedValueOnce({
				id: "p1",
			} as any);
			mocks.error = new Error("DB Error");
			await expect(projectRepository.fork("p1", "u1")).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findByIds", () => {
		it("should return early if empty ids", async () => {
			const result = await projectRepository.findByIds([]);
			expect(result).toEqual([]);
			expect(mocks.select).not.toHaveBeenCalled();
		});

		it("should return projects", async () => {
			const projects = [{ id: "p1" }];
			mocks.result = projects;
			const result = await projectRepository.findByIds(["p1"]);
			expect(result).toEqual(projects);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(projectRepository.findByIds(["p1"])).rejects.toThrow(
				DatabaseError,
			);
		});
	});

	describe("findOwnedByUser", () => {
		it("should return early if empty ids", async () => {
			const result = await projectRepository.findOwnedByUser([], "u1");
			expect(result).toEqual([]);
			expect(mocks.select).not.toHaveBeenCalled();
		});

		it("should return owned projects", async () => {
			const projects = [{ id: "p1" }];
			mocks.result = projects;
			const result = await projectRepository.findOwnedByUser(["p1"], "u1");
			expect(result).toEqual(projects);
		});

		it("should throw DatabaseError on failure", async () => {
			mocks.error = new Error("DB Error");
			await expect(
				projectRepository.findOwnedByUser(["p1"], "u1"),
			).rejects.toThrow(DatabaseError);
		});
	});
});
