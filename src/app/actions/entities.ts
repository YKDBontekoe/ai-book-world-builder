"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
	deleteEntity,
	getEntitiesForProject as getEntitiesQuery,
	getEntityById,
	getProjectByIdWithAccess,
	updateEntity,
} from "@/lib/db/queries";
import { Entity } from "@/lib/db/schema";

export async function getEntitiesForProject(projectId: string): Promise<{ success: Entity[] } | { error: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const project = await getProjectByIdWithAccess({
            id: projectId,
            userId: session.user.id
        });

        if (!project) {
            return { error: "Project not found or access denied" };
        }

        const entities = await getEntitiesQuery({ projectId });
        return { success: entities };
    } catch (e) {
        console.error(e);
        return { error: "Failed to fetch entities" };
    }
}

// RESTORED FUNCTIONS

export async function getEntities(projectId: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const project = await getProjectByIdWithAccess({
		id: projectId,
        userId: session.user.id,
	});

	if (!project) {
		throw new Error("Project not found or access denied");
	}

	const entities = await getEntitiesQuery({ projectId });

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

	const entity = await getEntityById({ id });

	if (!entity) {
		throw new Error("Entity not found");
	}

	const project = await getProjectByIdWithAccess({
		id: entity.projectId,
		userId: session.user.id,
	});

	if (!project) {
		throw new Error("Access denied to entity");
	}

	if (project.userId !== session.user.id) {
		throw new Error("Unauthorized: Only project owner can modify entities");
	}

	if (entity.projectId !== projectId) {
		throw new Error("Entity does not belong to the provided project");
	}

	const updatedEntity = await updateEntity({
		id,
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

	const entity = await getEntityById({ id });

	if (!entity) {
		throw new Error("Entity not found");
	}

	const project = await getProjectByIdWithAccess({
		id: entity.projectId,
		userId: session.user.id,
	});

	if (!project) {
		throw new Error("Access denied to entity");
	}

	if (project.userId !== session.user.id) {
		throw new Error("Unauthorized: Only project owner can delete entities");
	}

	await deleteEntity({ id });
	revalidatePath("/(chat)", "page"); // Revalidate broadly to ensure lists update
}
