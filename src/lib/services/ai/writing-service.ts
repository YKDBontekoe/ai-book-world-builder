import "server-only";

import { eq } from "drizzle-orm";
import { generationService } from "@/lib/ai/writer-service";
import { db, getScenesForChapter, updateSceneContent } from "@/lib/db/queries";
import { scene } from "@/lib/db/schema";
import { verifyProjectAccessViaScenes, verifySceneAccess } from "./utils";

export const writingService = {
	/**
	 * Batch writes all scenes in a chapter.
	 * Iterates sequentially to maintain context.
	 */
	async batchWriteChapter(
		chapterId: string,
		instructions?: string,
	): Promise<{ success: boolean; writtenCount: number }> {
		const scenes = await getScenesForChapter({ chapterId });
		if (!scenes || scenes.length === 0) {
			throw new Error("No scenes found in chapter.");
		}

		await verifyProjectAccessViaScenes(scenes);

		let writtenCount = 0;
		// Sort by sequence to ensure logical flow
		const sortedScenes = scenes.sort((a, b) => a.sequence - b.sequence);

		for (const sceneItem of sortedScenes) {
			// Skip if already has substantial content (safety check)
			if (sceneItem.content && sceneItem.content.length > 500) {
				continue;
			}

			try {
				const { text } = await generationService.draftScene(
					sceneItem.title,
					{
						purpose: "Part of batch generation",
					},
					instructions,
				);

				if (text) {
					await updateSceneContent({
						sceneId: sceneItem.id,
						content: text,
						status: "drafted",
					});
					writtenCount++;
				}
			} catch (e) {
				console.error(`Failed to write scene ${sceneItem.id}`, e);
			}
		}

		return { success: true, writtenCount };
	},

	/**
	 * Rewrites a specific scene based on instructions.
	 */
	async rewriteScene(
		sceneId: string,
		instructions: string,
	): Promise<{ text: string }> {
		await verifySceneAccess(sceneId);

		const sceneItem = await db.query.scene.findFirst({
			where: eq(scene.id, sceneId),
		});

		if (!sceneItem) throw new Error("Scene not found");

		const prompt = `
      You are an expert editor and fiction writer.
      Rewrite the following scene based on these instructions: "${instructions}"

      Original Scene Title: ${sceneItem.title}
      Original Content:
      ${sceneItem.content || "(No content yet)"}
    `;

		const { text } = await generationService.continueWriting("", prompt, {
			modelId: "large",
		});

		if (!text) throw new Error("Failed to generate rewrite.");

		return { text };
	},

	/**
	 * Expands a skeletal scene into full prose.
	 */
	async expandScene(sceneId: string, notes: string): Promise<{ text: string }> {
		await verifySceneAccess(sceneId);

		const sceneItem = await db.query.scene.findFirst({
			where: eq(scene.id, sceneId),
		});
		if (!sceneItem) throw new Error("Scene not found");

		const prompt = `
      You are an expert fiction writer.
      Expand the following rough notes/skeleton into a full, vivid scene.
      Focus on sensory details, dialogue, and pacing.

      Scene Title: ${sceneItem.title}
      Notes/Skeleton:
      ${notes || sceneItem.content || ""}
    `;

		const { text } = await generationService.continueWriting("", prompt, {
			modelId: "large",
		});

		if (!text) throw new Error("Failed to generate text.");

		return { text };
	},
};
