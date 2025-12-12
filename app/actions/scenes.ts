"use server";

import { auth } from "@/app/(auth)/auth";
import { updateScene } from "@/lib/db/queries";

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

	// TODO: Verify access to project

	const updatedScene = await updateScene({
		id,
		title,
		status,
		content,
	});

	return {
		...updatedScene,
		createdAt: updatedScene.createdAt.toISOString(),
		updatedAt: updatedScene.updatedAt.toISOString(),
	};
}
