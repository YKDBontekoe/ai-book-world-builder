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

	const project = await projectRepository.findByIdWithAccess(
		projectId,
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

export async function deleteScenesAction({
	projectId,
	sceneIds,
}: {
	projectId: string;
	sceneIds: string[];
}) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const project = await projectRepository.findByIdWithAccess(
		projectId,
		session.user.id,
	);

	if (!project || project.userId !== session.user.id) {
		throw new Error("Unauthorized");
	}

	await sceneRepository.deleteMany(sceneIds, projectId);

	await invalidateCache(`project-structure:${projectId}`);

	return { success: true };
}
