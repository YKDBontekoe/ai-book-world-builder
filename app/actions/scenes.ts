"use server";

import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess, updateScene } from "@/lib/db/queries";

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

	if (!session) {
		throw new Error("Unauthorized");
	}

	const project = await getProjectByIdWithAccess({
		id: projectId,
		userId: session.user.id,
	});

	if (!project || project.userId !== session.user?.id) {
		throw new Error("Unauthorized");
	}

	const updatedScene = await updateScene({
		id,
		title,
		status,
		content,
		projectId,
	});

	return {
		...updatedScene,
		createdAt: updatedScene.createdAt.toISOString(),
		updatedAt: updatedScene.updatedAt.toISOString(),
	};
}
