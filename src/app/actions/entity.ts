"use server";

import { and, eq } from "drizzle-orm";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db/drizzle";
import {
	getAttributesForProject,
	getEntitiesForProject,
} from "@/lib/db/queries/entity";
import { entityAttribute } from "@/lib/db/schema";

export async function getEntitiesWithImagesAction(projectId: string) {
	try {
		await ensureProjectAccess(projectId, false);
		const [entities, attributes] = await Promise.all([
			getEntitiesForProject({ projectId }),
			getAttributesForProject({ projectId }),
		]);

		return {
			success: true,
			data: entities.map((e) => ({
				...e,
				imageUrl: attributes.find(
					(a) => a.entityId === e.id && a.name === "image_url",
				)?.value,
			})),
		};
	} catch (_error) {
		return { success: false, error: "Failed to fetch entities" };
	}
}

export async function setEntityImageAction(
	entityId: string,
	imageUrl: string,
	projectId: string,
) {
	try {
		await ensureProjectAccess(projectId, true);

		// Check if attribute exists
		const [existing] = await db
			.select()
			.from(entityAttribute)
			.where(
				and(
					eq(entityAttribute.entityId, entityId),
					eq(entityAttribute.name, "image_url"),
				),
			);

		if (existing) {
			await db
				.update(entityAttribute)
				.set({ value: imageUrl, updatedAt: new Date() } as any) // Cast if updatedAt missing in schema
				.where(eq(entityAttribute.id, existing.id));
		} else {
			await db.insert(entityAttribute).values({
				projectId,
				entityId,
				name: "image_url",
				value: imageUrl,
				dataType: "url",
				createdAt: new Date(),
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Failed to set entity image:", error);
		return { success: false, error: "Failed to save image" };
	}
}
