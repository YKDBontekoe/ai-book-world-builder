import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { type StoryState, storyState } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function getStoryStateForGeneration({
	generationId,
}: {
	generationId: string;
}): Promise<StoryState[]> {
	try {
		return await db
			.select()
			.from(storyState)
			.where(eq(storyState.generationId, generationId))
			.orderBy(asc(storyState.chapterNumber));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load story state",
		);
	}
}

export async function createOrUpdateStoryState({
	projectId,
	generationId,
	chapterNumber,
	characterKnowledge,
	characterInjuries,
	relationshipChanges,
	openThreads,
	revealsMade,
	worldStateChanges,
}: {
	projectId: string;
	generationId: string;
	chapterNumber: number;
	characterKnowledge?: Record<string, string[]>;
	characterInjuries?: Record<string, string[]>;
	relationshipChanges?: Array<{
		source: string;
		target: string;
		change: string;
	}>;
	openThreads?: string[];
	revealsMade?: string[];
	worldStateChanges?: string[];
}): Promise<StoryState> {
	try {
		const [existing] = await db
			.select()
			.from(storyState)
			.where(
				and(
					eq(storyState.generationId, generationId),
					eq(storyState.chapterNumber, chapterNumber),
				),
			);

		if (existing) {
			const [updated] = await db
				.update(storyState)
				.set({
					characterKnowledge: characterKnowledge ?? existing.characterKnowledge,
					characterInjuries: characterInjuries ?? existing.characterInjuries,
					relationshipChanges:
						relationshipChanges ?? existing.relationshipChanges,
					openThreads: openThreads ?? existing.openThreads,
					revealsMade: revealsMade ?? existing.revealsMade,
					worldStateChanges: worldStateChanges ?? existing.worldStateChanges,
					updatedAt: new Date(),
				})
				.where(eq(storyState.id, existing.id))
				.returning();

			return updated;
		}

		const [created] = await db
			.insert(storyState)
			.values({
				projectId,
				generationId,
				chapterNumber,
				characterKnowledge,
				characterInjuries,
				relationshipChanges,
				openThreads,
				revealsMade,
				worldStateChanges,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return created;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create/update story state",
		);
	}
}
