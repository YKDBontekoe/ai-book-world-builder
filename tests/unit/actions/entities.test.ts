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

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
	deleteEntityAction,
	getEntities,
	updateEntityAction,
} from "@/app/actions/entities";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import type { Entity, Project } from "@/lib/db/schema";
import { unwrap } from "@/lib/result";

const mockedAuth = vi.mocked(auth);
const mockedFindByIdWithAccess = vi.mocked(
	projectRepository.findByIdWithAccess,
);
const mockedFindByProject = vi.mocked(entityRepository.findByProject);
const mockedFindById = vi.mocked(entityRepository.findById);
const mockedUpdate = vi.mocked(entityRepository.update);
const mockedDelete = vi.mocked(entityRepository.delete);
const mockedRevalidatePath = vi.mocked(revalidatePath);

const userId = "550e8400-e29b-41d4-a716-446655440000";
const projectId = "550e8400-e29b-41d4-a716-446655440001";

function buildSession() {
	return {
		user: {
			email: null,
			id: userId,
			image: null,
			name: "Test User",
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
		createdAt: new Date("2024-01-01T00:00:00Z"),
		visibility: "private",
		folders: [],
		...overrides,
	} as Project;
}

function buildEntity(overrides?: Partial<Entity>): Entity {
	return {
		id: "550e8400-e29b-41d4-a716-446655440002",
		name: "Entity Name",
		kind: "character",
		summary: null,
		projectId,
		startDate: new Date("2024-01-02T00:00:00Z"),
		endDate: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-03T00:00:00Z"),
		...overrides,
	} as Entity;
}

describe("entities server actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns entities when the user can access the project", async () => {
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(buildProject());
		mockedFindByProject.mockResolvedValue([entity]);

		const result = unwrap(await getEntities({ projectId }));

		expect(mockedFindByIdWithAccess).toHaveBeenCalledWith(projectId, userId);
		expect(result).toEqual([
			{
				...entity,
				createdAt: entity.createdAt.toISOString(),
				updatedAt: entity.updatedAt.toISOString(),
				startDate: entity.startDate?.toISOString(),
				endDate: null,
			},
		]);
	});

	it("throws when the project is inaccessible", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockedAuth.mockResolvedValue(buildSession());
		mockedFindByIdWithAccess.mockResolvedValue(null);

		const result = await getEntities({ projectId });
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: `Project not found: ${projectId}`,
		});
		expect(mockedFindByProject).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("updates an entity when the user owns the project", async () => {
		const entity = buildEntity();
		const updatedEntity = buildEntity({ name: "Updated" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindById.mockResolvedValue(entity);
		mockedFindByIdWithAccess.mockResolvedValue(buildProject());
		mockedUpdate.mockResolvedValue(updatedEntity);

		const result = unwrap(
			await updateEntityAction({
				id: entity.id,
				name: updatedEntity.name,
				projectId,
			}),
		);

		expect(mockedFindByIdWithAccess).toHaveBeenCalledWith(
			entity.projectId,
			userId,
		);
		expect(mockedUpdate).toHaveBeenCalledWith(entity.id, {
			name: updatedEntity.name,
			kind: undefined,
			summary: undefined,
			attributes: undefined,
		});
		expect(result.name).toBe(updatedEntity.name);
		expect(result.updatedAt).toBe(updatedEntity.updatedAt.toISOString());
	});

	it("rejects updates when the user lacks access", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindById.mockResolvedValue(entity);
		mockedFindByIdWithAccess.mockResolvedValue(null);

		const result = await updateEntityAction({ id: entity.id, projectId });
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: "Access denied to entity",
		});
		expect(mockedUpdate).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("rejects updates when the entity belongs to another project", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const entity = buildEntity({ projectId: "other-project" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindById.mockResolvedValue(entity);
		mockedFindByIdWithAccess.mockResolvedValue(
			buildProject({ id: entity.projectId }),
		);

		const result = await updateEntityAction({ id: entity.id, projectId });
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: "Entity does not belong to the provided project",
		});
		expect(mockedUpdate).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("deletes an entity when the user has permission", async () => {
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindById.mockResolvedValue(entity);
		mockedFindByIdWithAccess.mockResolvedValue(buildProject());
		mockedDelete.mockResolvedValue();

		unwrap(await deleteEntityAction({ id: entity.id }));

		expect(mockedDelete).toHaveBeenCalledWith(entity.id);
		expect(mockedRevalidatePath).toHaveBeenCalledWith("/(chat)", "page");
	});

	it("fails deletion when the user cannot access the project", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedFindById.mockResolvedValue(entity);
		mockedFindByIdWithAccess.mockResolvedValue(null);

		const result = await deleteEntityAction({ id: entity.id });
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: "Access denied to entity",
		});
		expect(mockedDelete).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("VULNERABILITY FIX: rejects update when user does not own the project (even if public)", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const entity = buildEntity();
		// Attacker session
		(mockedAuth as any).mockResolvedValue({
			user: {
				id: "attacker",
				email: null,
				image: null,
				name: "Attacker",
				type: "regular",
			},
			expires: new Date().toISOString(),
		});

		mockedFindById.mockResolvedValue(entity);

		// Public project owned by someone else
		mockedFindByIdWithAccess.mockResolvedValue(
			buildProject({
				userId: "victim",
				visibility: "public",
			}),
		);

		const result = await updateEntityAction({
			id: entity.id,
			projectId: entity.projectId,
			name: "Hacked",
		});
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: "Only project owner can modify entities",
		});

		expect(mockedUpdate).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("VULNERABILITY FIX: rejects deletion when user does not own the project (even if public)", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const entity = buildEntity();
		// Attacker session
		(mockedAuth as any).mockResolvedValue({
			user: {
				id: "attacker",
				email: null,
				image: null,
				name: "Attacker",
				type: "regular",
			},
			expires: new Date().toISOString(),
		});

		mockedFindById.mockResolvedValue(entity);

		// Public project owned by someone else
		mockedFindByIdWithAccess.mockResolvedValue(
			buildProject({
				userId: "victim",
				visibility: "public",
			}),
		);

		const result = await deleteEntityAction({ id: entity.id });
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toEqual({
			success: false,
			error: "Only project owner can delete entities",
		});

		expect(mockedDelete).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
