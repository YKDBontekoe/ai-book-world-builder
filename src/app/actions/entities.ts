"use server";

import { revalidatePath } from "next/cache";
import { authorizeProjectAccess } from "@/lib/auth/utils";
import { entityRepository } from "@/lib/db/repositories";
import type { EntityWithDetails } from "@/lib/db/repositories/entity-repository";

export async function getEntitiesForProject(
	projectId: string,
): Promise<{ success: EntityWithDetails[] } | { error: string }> {
	try {
		const authResult = await authorizeProjectAccess(projectId);
		if (authResult.error) {
			return { error: authResult.error };
		}

		const entities = await entityRepository.findByProjectWithDetails(projectId);
		return { success: entities };
	} catch (e) {
		console.error(e);
		return { error: "Failed to fetch entities" };
	}
}

export async function getEntities(projectId: string) {
	const authResult = await authorizeProjectAccess(projectId);
	if (authResult.error) {
		// Throwing error here to align with original function signature
		throw new Error(authResult.error);
	}

	const entities = await entityRepository.findByProject(projectId);

	// Serialize dates
	return entities.map((entity) => ({
		...entity,
		createdAt: entity.createdAt.toISOString(),
		updatedAt: entity.updatedAt.toISOString(),
		startDate: entity.startDate?.toISOString() ?? null,
		endDate: entity.endDate?.toISOString() ?? null,
	}));
}

export async function updateEntityAction({
	id,
	name,
	kind,
	summary,
	attributes,
	projectId,
}: {
	id: string;
	name?: string;
	kind?: string;
	summary?: string;
	attributes?: Array<{ name: string; value: string }>;
	projectId: string;
}) {
	const entity = await entityRepository.findById(id);
	if (!entity) {
		throw new Error("Entity not found");
	}

	if (entity.projectId !== projectId) {
		throw new Error("Entity does not belong to the provided project");
	}

	const authResult = await authorizeProjectAccess(entity.projectId, {
		requiresWrite: true,
	});

	if (authResult.error) {
		throw new Error(authResult.error);
	}

	const updatedEntity = await entityRepository.update(id, {
		name,
		kind,
		summary,
		attributes,
	});

	return {
		...updatedEntity,
		createdAt: updatedEntity.createdAt.toISOString(),
		updatedAt: updatedEntity.updatedAt.toISOString(),
		startDate: updatedEntity.startDate?.toISOString() ?? null,
		endDate: updatedEntity.endDate?.toISOString() ?? null,
	};
}

export async function deleteEntityAction(id: string) {
	const entity = await entityRepository.findById(id);
	if (!entity) {
		// No-op if entity doesn't exist to make deletion idempotent
		return;
	}

	const authResult = await authorizeProjectAccess(entity.projectId, {
		requiresWrite: true,
	});

	if (authResult.error) {
		throw new Error(authResult.error);
	}

	await entityRepository.delete(id);
	revalidatePath("/(chat)", "page");
}
