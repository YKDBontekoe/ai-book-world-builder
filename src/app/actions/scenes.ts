"use server";

import { auth } from "@/app/(auth)/auth";
import { invalidateCache } from "@/lib/cache";
import { projectRepository, sceneRepository } from "@/lib/db/repositories";

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
}) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	// First, get the scene to verify ownership from the DB record
	const sceneToUpdate = await sceneRepository.findById(id);
	if (!sceneToUpdate) {
		throw new Error("Scene not found");
	}

	// Now, verify the scene belongs to the project the user claims
	if (sceneToUpdate.projectId !== projectId) {
		// This is a critical security check to prevent IDOR.
		// The user might have access to `projectId` but the `sceneId` could be from another project.
		throw new Error("Scene does not belong to the specified project");
	}

	// Then, check if the user has write access to that project
	const project = await projectRepository.findByIdWithAccess(
		sceneToUpdate.projectId, // Use the verified project ID from the scene record
		session.user.id,
	);

	if (!project || project.userId !== session.user.id) {
		throw new Error("Unauthorized");
	}

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
	}

	return {
		...updatedScene,
		createdAt: updatedScene.createdAt.toISOString(),
		updatedAt: updatedScene.updatedAt.toISOString(),
	};
}
