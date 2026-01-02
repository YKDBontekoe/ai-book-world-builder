"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { sceneRepository } from "@/lib/db/repositories";
import { sceneStatus } from "@/lib/db/schema/scenes";
import { err } from "@/lib/result";

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

export async function updateSceneAction(params: {
	id: string;
	title?: string;
	status?: string;
	content?: string;
	projectId: string;
}) {
	const validation = updateSceneSchema.safeParse(params);
	if (!validation.success) {
		const errorMessage = validation.error.issues
			.map((i) => i.message)
			.join(", ");
		return err(`Validation failed: ${errorMessage}`);
	}

	const { id, title, status, content, projectId } = validation.data;

	return withProjectWriteAccess(projectId, async () => {
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
	});
}
