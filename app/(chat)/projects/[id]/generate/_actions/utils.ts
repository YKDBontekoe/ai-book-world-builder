import "server-only";
import { auth } from "@/app/(auth)/auth";
import { db, getProjectByIdWithAccess } from "@/lib/db/queries";
import { bookGeneration, chapter, scene } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type AuthResult<T> = Promise<T | { error: string }>;

export async function withProjectAuth<T>(
	projectId: string,
	fn: (userId: string) => Promise<T>,
): AuthResult<T> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	const project = await getProjectByIdWithAccess({
		id: projectId,
		userId: session.user.id,
	});

	if (!project) {
		return { error: "Project not found" };
	}

	if (project.userId !== session.user.id) {
		return {
			error:
				"Unauthorized: You can only generate content for your own projects.",
		};
	}

	return fn(session.user.id);
}

export async function withGenerationAuth<T>(
	generationId: string,
	fn: (userId: string, generation: typeof bookGeneration.$inferSelect) => Promise<T>,
): AuthResult<T> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	const [gen] = await db
		.select()
		.from(bookGeneration)
		.where(eq(bookGeneration.id, generationId));

	if (!gen) return { error: "Generation not found" };

	const project = await getProjectByIdWithAccess({
		id: gen.projectId,
		userId: session.user.id,
	});

	if (!project || project.userId !== session.user.id) {
		return { error: "Unauthorized" };
	}

	return fn(session.user.id, gen);
}

export async function withChapterAuth<T>(
	chapterId: string,
	fn: (userId: string, chapterData: typeof chapter.$inferSelect) => Promise<T>,
): AuthResult<T> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	const [targetChapter] = await db
		.select()
		.from(chapter)
		.where(eq(chapter.id, chapterId));

	if (!targetChapter) return { error: "Chapter not found" };

	const project = await getProjectByIdWithAccess({
		id: targetChapter.projectId,
		userId: session.user.id,
	});

	if (!project || project.userId !== session.user.id) {
		return { error: "Unauthorized" };
	}

	return fn(session.user.id, targetChapter);
}

export async function withSceneAuth<T>(
	sceneId: string,
	fn: (userId: string, sceneData: typeof scene.$inferSelect) => Promise<T>,
): AuthResult<T> {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Authentication required" };
	}

	const [targetScene] = await db
		.select()
		.from(scene)
		.where(eq(scene.id, sceneId));

	if (!targetScene) return { error: "Scene not found" };

	const project = await getProjectByIdWithAccess({
		id: targetScene.projectId,
		userId: session.user.id,
	});

	if (!project || project.userId !== session.user.id) {
		return { error: "Unauthorized" };
	}

	return fn(session.user.id, targetScene);
}
