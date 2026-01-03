import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { type Scene, type SceneCard, scene, sceneCard } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function getScenesForChapter({
	chapterId,
}: {
	chapterId: string;
}): Promise<Scene[]> {
	try {
		return await db
			.select()
			.from(scene)
			.where(eq(scene.chapterId, chapterId))
			.orderBy(asc(scene.sequence));
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to load scenes");
	}
}

export async function getScenesForProject({
	projectId,
	excludeContent = false,
}: {
	projectId: string;
	excludeContent?: boolean;
}): Promise<Scene[]> {
	try {
		if (excludeContent) {
			// Optimized query: Select only metadata columns, skip heavy content
			// We select NULL as 'content' to satisfy the Scene type shape
			return await db
				.select({
					id: scene.id,
					createdAt: scene.createdAt,
					updatedAt: scene.updatedAt,
					title: scene.title,
					sequence: scene.sequence,
					content: sql<string | null>`NULL`.as("content"),
					wordCount: scene.wordCount,
					status: scene.status,
					prevSceneId: scene.prevSceneId,
					chapterId: scene.chapterId,
					projectId: scene.projectId,
				})
				.from(scene)
				.where(eq(scene.projectId, projectId))
				.orderBy(asc(scene.sequence));
		}

		return await db
			.select()
			.from(scene)
			.where(eq(scene.projectId, projectId))
			.orderBy(asc(scene.sequence));
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load project scenes",
		);
	}
}

export async function createScene({
	projectId,
	chapterId,
	title,
	sequence,
	content,
	status,
}: {
	projectId: string;
	chapterId: string;
	title: string;
	sequence: number;
	content?: string;
	status?: string;
}): Promise<Scene> {
	try {
		const [created] = await db
			.insert(scene)
			.values({
				projectId,
				chapterId,
				title,
				sequence,
				content,
				status: status ?? "planned",
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return created;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to create scene");
	}
}

export async function updateScene({
	id,
	title,
	sequence,
	content,
	status,
	projectId,
}: {
	id: string;
	title?: string;
	sequence?: number;
	content?: string;
	status?: string;
	projectId?: string;
}): Promise<Scene> {
	try {
		const [updated] = await db
			.update(scene)
			.set({
				...(title ? { title } : {}),
				...(sequence !== undefined ? { sequence } : {}),
				...(content ? { content } : {}),
				...(status ? { status } : {}),
				updatedAt: new Date(),
			})
			.where(
				projectId
					? and(eq(scene.id, id), eq(scene.projectId, projectId))
					: eq(scene.id, id),
			)
			.returning();

		if (!updated) {
			throw new ChatSDKError("not_found:database", "Scene not found");
		}

		return updated;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to update scene");
	}
}

export async function updateSceneContent({
	sceneId,
	content,
	status,
}: {
	sceneId: string;
	content: string;
	status?: string;
}): Promise<Scene | null> {
	try {
		const [updated] = await db
			.update(scene)
			.set({
				content,
				status: status ?? "drafted",
				updatedAt: new Date(),
			})
			.where(eq(scene.id, sceneId))
			.returning();

		return updated ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update scene content",
		);
	}
}

export async function getSceneCardForScene({
	sceneId,
}: {
	sceneId: string;
}): Promise<SceneCard | null> {
	try {
		const [card] = await db
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.sceneId, sceneId));

		return card ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to load scene card");
	}
}

export async function createSceneCard({
	projectId,
	sceneId,
	purpose,
	setting,
	atmosphere,
	emotionalBeats,
	characterGoals,
	constraints,
	plannedReveal,
}: {
	projectId: string;
	sceneId: string;
	purpose: string;
	setting?: string;
	atmosphere?: string;
	emotionalBeats?: string[];
	characterGoals?: Record<string, string>;
	constraints?: string[];
	plannedReveal?: string;
}): Promise<SceneCard> {
	try {
		const [created] = await db
			.insert(sceneCard)
			.values({
				projectId,
				sceneId,
				purpose,
				setting,
				atmosphere,
				emotionalBeats,
				characterGoals,
				constraints,
				plannedReveal,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return created;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create scene card",
		);
	}
}

export async function getSceneById({
	id,
}: {
	id: string;
}): Promise<Scene | null> {
	try {
		const [found] = await db
			.select()
			.from(scene)
			.where(eq(scene.id, id))
			.limit(1);
		return found ?? null;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError("bad_request:database", "Failed to load scene");
	}
}

export async function updateSceneCard({
	sceneId,
	purpose,
	setting,
	atmosphere,
	emotionalBeats,
	characterGoals,
	constraints,
	plannedReveal,
	chronologicalSequence,
	timeSetting,
}: Partial<SceneCard> & { sceneId: string }): Promise<SceneCard> {
	try {
		const [updated] = await db
			.update(sceneCard)
			.set({
				...(purpose ? { purpose } : {}),
				...(setting ? { setting } : {}),
				...(atmosphere ? { atmosphere } : {}),
				...(emotionalBeats ? { emotionalBeats } : {}),
				...(characterGoals ? { characterGoals } : {}),
				...(constraints ? { constraints } : {}),
				...(plannedReveal ? { plannedReveal } : {}),
				...(chronologicalSequence !== undefined
					? { chronologicalSequence }
					: {}),
				...(timeSetting ? { timeSetting } : {}),
				updatedAt: new Date(),
			})
			.where(eq(sceneCard.sceneId, sceneId))
			.returning();

		if (!updated) {
			throw new ChatSDKError("not_found:database", "Scene card not found");
		}
		return updated;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update scene card",
		);
	}
}
