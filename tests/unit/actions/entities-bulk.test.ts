import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
	auth: vi.fn(),
}));

const repositoriesMock = vi.hoisted(() => ({
	entityRepository: {
		findById: vi.fn(),
		findByIdWithDetails: vi.fn(),
		findByProject: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		bulkDelete: vi.fn(),
		create: vi.fn(),
		createAttribute: vi.fn(),
		createRelationship: vi.fn(),
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
	bulkDeleteEntitiesAction,
	restoreEntitiesAction,
} from "@/app/actions/entities";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import type { Entity, Project } from "@/lib/db/schema";
import { unwrap } from "@/lib/result";

const mockedAuth = vi.mocked(auth);
const mockedFindByIdWithAccess = vi.mocked(
	projectRepository.findByIdWithAccess,
);
const mockedFindByIdWithDetails = vi.mocked(
	entityRepository.findByIdWithDetails,
);
const mockedBulkDelete = vi.mocked(entityRepository.bulkDelete);
const mockedCreate = vi.mocked(entityRepository.create);
const mockedCreateAttribute = vi.mocked(entityRepository.createAttribute);
const mockedCreateRelationship = vi.mocked(entityRepository.createRelationship);
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

const id1 = "550e8400-e29b-41d4-a716-446655440010";
const id2 = "550e8400-e29b-41d4-a716-446655440020";
const attrId1 = "550e8400-e29b-41d4-a716-446655440011";
const relId1 = "550e8400-e29b-41d4-a716-446655440012";

function buildEntityWithDetails(id: string) {
	return {
		id,
		projectId,
		name: "Entity " + id,
		kind: "character",
		summary: null,
		startDate: new Date("2024-01-01"),
		endDate: null,
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-01"),
		attributes: [
			{
				id: attrId1,
				projectId,
				entityId: id,
				name: "Attr 1",
				value: "Value 1",
				dataType: "text",
				createdAt: new Date("2024-01-01"),
			},
		],
		relationships: [
			{
				id: relId1,
				projectId,
				sourceEntityId: id,
				targetEntityId: "other-id",
				type: "knows",
				createdAt: new Date("2024-01-01"),
			},
		],
	};
}

describe("bulk entities actions", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("bulkDeleteEntitiesAction", () => {
		it("deletes entities and returns backup", async () => {
			const entity1 = buildEntityWithDetails(id1);
			const entity2 = buildEntityWithDetails(id2);

			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(buildProject());

			// Mock findByIdWithDetails to return entity1 then entity2
			mockedFindByIdWithDetails
				.mockResolvedValueOnce(entity1 as any)
				.mockResolvedValueOnce(entity2 as any);

			mockedBulkDelete.mockResolvedValue();

			const result = unwrap(
				await bulkDeleteEntitiesAction({
					projectId,
					ids: [id1, id2],
				}),
			);

			expect(mockedBulkDelete).toHaveBeenCalledWith([id1, id2]);
			expect(result.success).toBe(true);
			expect(result.backup).toHaveLength(2);
			expect(result.backup![0].id).toBe(id1);
			expect(result.backup![1].id).toBe(id2);
			// Check serialization
			expect(typeof result.backup![0].createdAt).toBe("string");
		});

		it("fails if user does not own project", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(
				buildProject({ userId: "other-user" }),
			);

			const result = await bulkDeleteEntitiesAction({
				projectId,
				ids: [id1],
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain("Only project owner can delete entities");
			expect(mockedBulkDelete).not.toHaveBeenCalled();
		});
	});

	describe("restoreEntitiesAction", () => {
		it("restores entities, attributes and relationships", async () => {
			mockedAuth.mockResolvedValue(buildSession());
			mockedFindByIdWithAccess.mockResolvedValue(buildProject());
			mockedCreate.mockResolvedValue({} as any);

			const backup = [
				{
					id: id1,
					projectId,
					name: "Entity 1",
					kind: "character",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
					attributes: [
						{
							id: attrId1,
							projectId,
							entityId: id1,
							name: "Attr 1",
							value: "Val 1",
							dataType: "text",
							createdAt: "2024-01-01T00:00:00Z",
						},
					],
					relationships: [
						{
							id: relId1,
							projectId,
							sourceEntityId: id1,
							targetEntityId: id2,
							type: "knows",
							createdAt: "2024-01-01T00:00:00Z",
						},
					],
				},
				{
					id: id2,
					projectId,
					name: "Entity 2",
					kind: "character",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
					attributes: [],
					relationships: [], // Relationships are deduplicated, so it's fine if it's missing or present
				},
			];

			const result = unwrap(
				await restoreEntitiesAction({
					projectId,
					entities: backup as any, // Cast because backup has extra string fields vs schema optionality quirks
				}),
			);

			expect(result.restoredCount).toBe(2);

			// Verify Entity Create calls
			expect(mockedCreate).toHaveBeenCalledTimes(2);
			expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({
				id: id1,
				name: "Entity 1",
			}));
			expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({
				id: id2,
				name: "Entity 2",
			}));

			// Verify Attribute Create calls
			expect(mockedCreateAttribute).toHaveBeenCalledTimes(1);
			expect(mockedCreateAttribute).toHaveBeenCalledWith(expect.objectContaining({
				id: attrId1,
				name: "Attr 1",
			}));

			// Verify Relationship Create calls
			expect(mockedCreateRelationship).toHaveBeenCalledTimes(1);
			expect(mockedCreateRelationship).toHaveBeenCalledWith(expect.objectContaining({
				id: relId1,
				sourceEntityId: id1,
				targetEntityId: id2,
			}));
		});
	});
});
