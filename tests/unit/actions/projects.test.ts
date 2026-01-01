
import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
	auth: vi.fn(),
}));

const dbMock = vi.hoisted(() => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		transaction: vi.fn(),
	},
}));

vi.mock("@/app/(auth)/auth", () => authMock);
vi.mock("@/lib/db/drizzle", () => dbMock);
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

import { deleteProjects } from "@/app/actions/projects";

const mockedAuth = vi.mocked(authMock.auth);
const mockedDb = dbMock.db;

const userId = "user-123";
const ownedProjectId1 = "project-owned-1";
const ownedProjectId2 = "project-owned-2";

function buildSession() {
	return {
		user: {
			id: userId,
		},
	} as any;
}

describe("projects server actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("deleteProjects", () => {
		it("should only delete projects owned by the user", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			const mockOwnedProjects = [{ id: ownedProjectId1 }, { id: ownedProjectId2 }];
			mockedDb.where.mockResolvedValue(mockOwnedProjects);

			// Mock the transaction to do nothing
			mockedDb.transaction.mockImplementation(async (callback) => {
				const tx = {
					select: vi.fn().mockReturnThis(),
					from: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue([]),
					delete: vi.fn().mockReturnThis(),
				};
				await callback(tx);
			});

			const result = await deleteProjects([ownedProjectId1, ownedProjectId2]);

			expect(result.success).toBe(true);
			expect(mockedDb.where).toHaveBeenCalled();
			expect(mockedDb.transaction).toHaveBeenCalled();
		});

		it("should return an error if user is not authenticated", async () => {
			mockedAuth.mockResolvedValue(null);
			const result = await deleteProjects([ownedProjectId1]);
			expect(result.error).toBe("Unauthorized");
		});

        it("should not delete anything if no valid projects are found", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			mockedDb.where.mockResolvedValue([]);

			const result = await deleteProjects(["project-unowned-1"]);

			expect(result.error).toBe("No valid projects to delete");
			expect(mockedDb.transaction).not.toHaveBeenCalled();
		});
	});
});
