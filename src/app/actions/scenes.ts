"use server";

import { auth } from "@/app/(auth)/auth";
import { invalidateCache } from "@/lib/cache";
import { projectRepository, sceneRepository } from "@/lib/db/repositories";
import { sceneStatus } from "@/lib/db/schema/scenes";
import { z } from "zod";

const updateSceneSchema = z.object({
	id: z.string().uuid(),
	projectId: z.string().uuid(),
	title: z.string().max(255, "Title is too long").optional(),
	status: z.enum(sceneStatus).optional(),
	content: z.string().max(100000, "Content is too long (max 100k chars)").optional(),
});

export async function updateSceneAction(params: {
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

	// Validate inputs using Zod
	// We use 'safeParse' but since this is a server action called by client code that expects errors to bubble up
	// (or handled via try/catch in UI), and the existing code throws Errors, we can use .parse()
	// or manually throw to maintain signature.
	// However, usually Server Actions should return discriminated unions for errors.
	// The existing implementation throws Error("Unauthorized").
	// I will use parse() which throws ZodError, which is good for strictly invalid data.
	// Or I can catch ZodError and throw a friendly Error.

	const validation = updateSceneSchema.safeParse(params);
	if (!validation.success) {
		// Flatten errors to a string or throw first error
		const errorMessage = validation.error.issues.map(i => i.message).join(", ");
		throw new Error(`Validation failed: ${errorMessage}`);
	}

	const { id, title, status, content, projectId } = validation.data;

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
