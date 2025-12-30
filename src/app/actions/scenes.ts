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

import { z } from "zod";

const deleteScenesSchema = z.object({
	projectId: z.string().uuid(),
	sceneIds: z.array(z.string().uuid()),
});

export async function deleteScenesAction({
	projectId,
	sceneIds,
}: {
	projectId: string;
	sceneIds: string[];
}) {
	const validated = deleteScenesSchema.parse({ projectId, sceneIds });
	if (validated.sceneIds.length === 0) {
		return { success: true };
	}

	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const project = await projectRepository.findByIdWithAccess(
		validated.projectId,
		session.user.id,
	);

	if (!project || project.userId !== session.user.id) {
		throw new Error("Unauthorized");
	}

	try {
		await sceneRepository.deleteMany(validated.sceneIds, validated.projectId);
	} catch (error) {
		console.error("Failed to delete scenes:", error);
		throw new Error("Failed to delete scenes");
	}

	await invalidateCache(`project-structure:${validated.projectId}`);

	return { success: true };
}
