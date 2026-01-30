"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { sceneRepository } from "@/lib/db/repositories";
import { sceneStatus } from "@/lib/db/schema/scenes";

const updateSceneSchema = z.object({
	id: z.string().uuid(),
	projectId: z.string().uuid(),
	title: z.string().max(255, "Title is too long").optional(),
	status: z.enum(sceneStatus).optional(),
	content: z
		.string()
		.max(100000, "Content is too long (max 100k chars)")
		.optional(),
});

export const updateSceneAction = createUserAction({
	input: updateSceneSchema,
	handler: async ({ input: { id, projectId, title, status, content } }) => {
		// Ensure the user has write access to the project
		await ensureProjectAccess(projectId, true);

		const updatedScene = await sceneRepository.update(
			id,
			{
				title,
				status,
				content,
			},
			projectId,
		);

		// Invalidate structure cache if title changes, as it's part of the structure view
		if (title) {
			await invalidateCache(`project-structure:${projectId}`);
			revalidatePath(`/projects/${projectId}`);
		}

		return {
			...updatedScene,
			createdAt: updatedScene.createdAt.toISOString(),
			updatedAt: updatedScene.updatedAt.toISOString(),
		};
	},
});
