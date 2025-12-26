"use server";

import { withProjectWriteAccess } from "@/lib/actions-utils";
import { invalidateCache } from "@/lib/cache";
import { sceneRepository } from "@/lib/db/repositories";
import type { Scene } from "@/lib/db/schema";
import type { Result } from "@/lib/result";

export async function updateSceneAction({
	id,
	title,
	status,
	content,
	projectId,
}: {
	id: string;
	title?: string;
	status?: string;
	content?: string;
	projectId: string;
}): Promise<Result<Scene>> {
	return withProjectWriteAccess(projectId, async () => {
		const updatedScene = await sceneRepository.update(id, {
			title,
			status,
			content,
		});

		// Invalidate structure cache if title changes, as it's part of the structure view
		if (title) {
			await invalidateCache(`project-structure:${projectId}`);
		}

		// Ensure we return the Scene type (with dates handled by repo/schema)
		return updatedScene;
	});
}
