"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { entityRepository, projectRepository } from "@/lib/db/repositories";
import type { Entity } from "@/lib/db/schema";

export async function getEntitiesForProject(
	projectId: string,
): Promise<{ success: Entity[] } | { error: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { error: "Unauthorized" };
		}

		const project = await projectRepository.findByIdWithAccess(
			projectId,
			session.user.id,
		);

		if (!project) {
			return { error: "Project not found or access denied" };
		}

		const entities = await entityRepository.findByProject(projectId);
		return { success: entities };
	} catch (e) {
		console.error(e);
		return { error: "Failed to fetch entities" };
	}
}

export async function getEntities(projectId: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const project = await projectRepository.findByIdWithAccess(
		projectId,
		session.user.id,
	);

	if (!project) {
		throw new Error("Project not found or access denied");
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
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const entity = await entityRepository.findById(id);

	if (!entity) {
		throw new Error("Entity not found");
	}

	const project = await projectRepository.findByIdWithAccess(
		entity.projectId,
		session.user.id,
	);

	if (!project) {
		throw new Error("Access denied to entity");
	}

	if (project.userId !== session.user.id) {
		throw new Error("Unauthorized: Only project owner can modify entities");
	}

	if (entity.projectId !== projectId) {
		throw new Error("Entity does not belong to the provided project");
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
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const entity = await entityRepository.findById(id);

	if (!entity) {
		throw new Error("Entity not found");
	}

	const project = await projectRepository.findByIdWithAccess(
		entity.projectId,
		session.user.id,
	);

	if (!project) {
		throw new Error("Access denied to entity");
	}

	if (project.userId !== session.user.id) {
		throw new Error("Unauthorized: Only project owner can delete entities");
	}

	await entityRepository.delete(id);
	revalidatePath("/(chat)", "page");
}
