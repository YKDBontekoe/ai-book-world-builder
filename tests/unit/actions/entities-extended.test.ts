import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
	auth: vi.fn(),
}));

const repositoriesMock = vi.hoisted(() => ({
	entityRepository: {
		findById: vi.fn(),
		findByProject: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		create: vi.fn(),
		createAttribute: vi.fn(),
		bulkDelete: vi.fn(),
	},
	projectRepository: {
		findByIdWithAccess: vi.fn(),
	},
}));

vi.mock("@/app/(auth)/auth", () => authMock);
vi.mock("@/lib/db/repositories", () => repositoriesMock);

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

import { auth } from "@/app/(auth)/auth";
import {
	bulkDeleteEntitiesAction,
	createEntityAction,
} from "@/app/actions/entities";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import type { Entity, Project } from "@/lib/db/schema";
import { unwrap } from "@/lib/result";

const mockedAuth = vi.mocked(auth);
const mockedFindByIdWithAccess = vi.mocked(
	projectRepository.findByIdWithAccess,
);
const mockedCreate = vi.mocked(entityRepository.create);
const mockedCreateAttribute = vi.mocked(entityRepository.createAttribute);
const mockedBulkDelete = vi.mocked(entityRepository.bulkDelete);
const mockedFindById = vi.mocked(entityRepository.findById);

const userId = "550e8400-e29b-41d4-a716-446655440000";
const projectId = "550e8400-e29b-41d4-a716-446655440001";

function buildSession() {
	return {
		user: {
			id: userId,
			email: null,
			name: "Test User",
			image: null,
			type: "regular",
		},
		expires: new Date().toISOString(),
	} as any;
}

function buildProject(overrides?: Partial<Project>): Project {
	return {
		id: projectId,
		name: "Test Project",
		description: null,
		userId,
		createdAt: new Date(),
		updatedAt: new Date(),
		visibility: "private",
		folders: [],
		...overrides,
	} as Project;
}

describe("extended entities actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("createEntityAction", () => {
		it("creates entity and attributes", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(buildProject());

			const newEntity = {
				id: "entity-1",
				projectId,
				name: "Gandalf",
				kind: "character",
				summary: "Wizard",
				createdAt: new Date(),
				updatedAt: new Date(),
				startDate: null,
				endDate: null,
			} as Entity;

			mockedCreate.mockResolvedValue(newEntity);
			mockedCreateAttribute.mockResolvedValue({} as any);

			const result = unwrap(
				await createEntityAction({
					projectId,
					name: "Gandalf",
					kind: "character",
					summary: "Wizard",
					attributes: [{ name: "Role", value: "Wizard" }],
				}),
			);

			expect(mockedFindByIdWithAccess).toHaveBeenCalledWith(projectId, userId);
			expect(mockedCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Gandalf",
					kind: "character",
				}),
			);
			expect(mockedCreateAttribute).toHaveBeenCalled();
			expect(result.id).toBe("entity-1");
		});

		it("fails if not owner", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(
				buildProject({ userId: "other" }),
			);

			const result = await createEntityAction({
				projectId,
				name: "Gandalf",
				kind: "character",
			});

			expect(consoleSpy).toHaveBeenCalled();
			expect(result.success).toBe(false);
			expect(mockedCreate).not.toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe("bulkDeleteEntitiesAction", () => {
		it("deletes entities if all belong to project and user owns project", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(buildProject());

			mockedFindById.mockResolvedValue({ projectId } as Entity); // for all calls

			const ids = [
				"550e8400-e29b-41d4-a716-446655440011",
				"550e8400-e29b-41d4-a716-446655440012",
			];
			const result = unwrap(
				await bulkDeleteEntitiesAction({
					projectId,
					ids,
				}),
			);

			expect(mockedFindById).toHaveBeenCalledTimes(2);
			expect(mockedBulkDelete).toHaveBeenCalledWith(ids);
			expect(result.success).toBe(true);
		});

		it("fails if one entity belongs to another project", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(buildProject());

			mockedFindById
				.mockResolvedValueOnce({ projectId } as Entity)
				.mockResolvedValueOnce({ projectId: "other" } as Entity);

			const result = await bulkDeleteEntitiesAction({
				projectId,
				ids: [
					"550e8400-e29b-41d4-a716-446655440011",
					"550e8400-e29b-41d4-a716-446655440012",
				],
			});

			expect(consoleSpy).toHaveBeenCalled();
			expect(result.success).toBe(false);
			expect(mockedBulkDelete).not.toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});
});
