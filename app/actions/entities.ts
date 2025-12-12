"use server";

import { auth } from "@/app/(auth)/auth";
import { getEntitiesForProject, updateEntity } from "@/lib/db/queries";

export async function getEntities(projectId: string) {
	const session = await auth();

	if (!session) {
		throw new Error("Unauthorized");
	}

	// TODO: Verify user access to the project if needed,
	// though getEntitiesForProject might just return empty if ID is invalid
	// or we rely on the UI to not pass invalid IDs.
	// ideally getProjectByIdWithAccess check should be here or in the query.

	const entities = await getEntitiesForProject({ projectId });

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

	if (!session) {
		throw new Error("Unauthorized");
	}

	// TODO: Verify access to project

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

import { revalidatePath } from "next/cache";
import { deleteEntity } from "@/lib/db/queries";

export async function deleteEntityAction(id: string) {
	const session = await auth();

	if (!session) {
		throw new Error("Unauthorized");
	}

	// TODO: Verify access to project

	await deleteEntity({ id });
	revalidatePath("/(chat)", "page"); // Revalidate broadly to ensure lists update
}
