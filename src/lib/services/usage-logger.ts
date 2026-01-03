import "server-only";

import type { LanguageModelUsage } from "ai";
import { enrichUsage } from "@/lib/ai/usage-tracking";
import { db } from "@/lib/db/drizzle";
import { bookGeneration, bookGenerationStep } from "@/lib/db/schema";

export type UsageLogContext = {
	projectId: string;
	chapterId?: string;
	generationType: "story_generation" | "planning" | "review";
	stepType: string;
};

/**
 * Persists AI usage to the database.
 * This populates the data source for the dashboard.
 */
export async function logGenerationUsage({
	projectId,
	usage,
	modelId,
	context,
}: {
	projectId: string;
	usage?: LanguageModelUsage;
	modelId?: string;
	context: UsageLogContext;
}) {
	if (!usage || !modelId) {
		console.warn("Skipping usage log: Missing usage or modelId");
		return;
	}

	try {
		// 1. Enrich usage with cost data
		const enrichedUsage = await enrichUsage({
			usage,
			selectedChatModel: modelId,
			isDynamicModel: false,
		});

		// 2. Create a "BookGeneration" record (acting as the session/parent)
		// In a real flow, this might exist already, but for atomic actions we create one on the fly
		const [gen] = await db
			.insert(bookGeneration)
			.values({
				projectId: projectId,
				status: "completed",
				createdAt: new Date(),
				updatedAt: new Date(),
				// Use generationType as a tag if possible, or just default settings
				settings: { type: context.generationType },
			})
			.returning();

		// 3. Create the "BookGenerationStep" record (this is what the dashboard queries!)
		await db.insert(bookGenerationStep).values({
			generationId: gen.id,
			chapterId: context.chapterId,
			sequence: 1, // Atomic action, so sequence 1
			stepType: context.stepType,
			status: "completed",
			usage: enrichedUsage,
			tokenCount: usage.totalTokens,
			createdAt: new Date(),
			updatedAt: new Date(),
			startedAt: new Date(),
			completedAt: new Date(),
		});
	} catch (error) {
		console.error("Failed to log generation usage:", error);
		// Do not throw, as this is a non-critical side effect
	}
}
