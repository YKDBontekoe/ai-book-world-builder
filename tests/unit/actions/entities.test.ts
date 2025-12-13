import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
	deleteEntity: vi.fn(),
	getEntitiesForProject: vi.fn(),
	getEntityById: vi.fn(),
	getProjectByIdWithAccess: vi.fn(),
	updateEntity: vi.fn(),
}));

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
import {
	deleteEntity,
	getEntitiesForProject,
	getEntityById,
	getProjectByIdWithAccess,
	updateEntity,
} from "@/lib/db/queries";
import type { Entity, Project } from "@/lib/db/schema";

const mockedAuth = vi.mocked(auth);
const mockedGetProjectByIdWithAccess = vi.mocked(getProjectByIdWithAccess);
const mockedGetEntitiesForProject = vi.mocked(getEntitiesForProject);
const mockedGetEntityById = vi.mocked(getEntityById);
const mockedUpdateEntity = vi.mocked(updateEntity);
const mockedDeleteEntity = vi.mocked(deleteEntity);
const mockedRevalidatePath = vi.mocked(revalidatePath);

const userId = "user-123";
const projectId = "project-123";

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
		id: "entity-123",
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
		mockedGetProjectByIdWithAccess.mockResolvedValue(buildProject());
		mockedGetEntitiesForProject.mockResolvedValue([entity]);

		const result = await getEntities(projectId);

		expect(mockedGetProjectByIdWithAccess).toHaveBeenCalledWith({
			id: projectId,
			userId,
		});
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
		mockedAuth.mockResolvedValue(buildSession());
		mockedGetProjectByIdWithAccess.mockResolvedValue(null);

		await expect(getEntities(projectId)).rejects.toThrow(
			"Project not found or access denied",
		);
		expect(mockedGetEntitiesForProject).not.toHaveBeenCalled();
	});

	it("updates an entity when the user owns the project", async () => {
		const entity = buildEntity();
		const updatedEntity = buildEntity({ name: "Updated" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetEntityById.mockResolvedValue(entity);
		mockedGetProjectByIdWithAccess.mockResolvedValue(buildProject());
		mockedUpdateEntity.mockResolvedValue(updatedEntity);

		const result = await updateEntityAction({
			id: entity.id,
			name: updatedEntity.name,
			projectId,
		});

		expect(mockedGetProjectByIdWithAccess).toHaveBeenCalledWith({
			id: projectId,
			userId,
		});
		expect(mockedUpdateEntity).toHaveBeenCalledWith({
			id: entity.id,
			name: updatedEntity.name,
			kind: undefined,
			summary: undefined,
			attributes: undefined,
		});
		expect(result.name).toBe(updatedEntity.name);
		expect(result.updatedAt).toBe(updatedEntity.updatedAt.toISOString());
	});

	it("rejects updates when the user lacks access", async () => {
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetEntityById.mockResolvedValue(entity);
		mockedGetProjectByIdWithAccess.mockResolvedValue(null);

		await expect(
			updateEntityAction({ id: entity.id, projectId }),
		).rejects.toThrow("Access denied to entity");
		expect(mockedUpdateEntity).not.toHaveBeenCalled();
	});

	it("rejects updates when the entity belongs to another project", async () => {
		const entity = buildEntity({ projectId: "other-project" });

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetEntityById.mockResolvedValue(entity);
		mockedGetProjectByIdWithAccess.mockResolvedValue(
			buildProject({ id: entity.projectId }),
		);

		await expect(
			updateEntityAction({ id: entity.id, projectId }),
		).rejects.toThrow("Entity does not belong to the provided project");
		expect(mockedUpdateEntity).not.toHaveBeenCalled();
	});

	it("deletes an entity when the user has permission", async () => {
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetEntityById.mockResolvedValue(entity);
		mockedGetProjectByIdWithAccess.mockResolvedValue(buildProject());
		mockedDeleteEntity.mockResolvedValue();

		await deleteEntityAction(entity.id);

		expect(mockedDeleteEntity).toHaveBeenCalledWith({ id: entity.id });
		expect(mockedRevalidatePath).toHaveBeenCalledWith("/(chat)", "page");
	});

	it("fails deletion when the user cannot access the project", async () => {
		const entity = buildEntity();

		mockedAuth.mockResolvedValue(buildSession());
		mockedGetEntityById.mockResolvedValue(entity);
		mockedGetProjectByIdWithAccess.mockResolvedValue(null);

		await expect(deleteEntityAction(entity.id)).rejects.toThrow(
			"Access denied to entity",
		);
		expect(mockedDeleteEntity).not.toHaveBeenCalled();
	});
});
