"use server";

import { auth } from "@/app/(auth)/auth";
import {
        deleteEntity,
        getEntitiesForProject,
        getEntityById,
        getProjectByIdWithAccess,
        updateEntity,
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

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

        await deleteEntity({ id });
        revalidatePath("/(chat)", "page"); // Revalidate broadly to ensure lists update
}
