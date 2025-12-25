import "server-only";

import { z } from "zod";
import { updateSceneContent as dbUpdateSceneContent } from "@/app/actions/writer";
import { verifySceneAccess } from "@/lib/services/ai/utils";
import { tool } from "ai";

const inputSchema = z.object({
	sceneId: z
		.string()
		.describe(
			"The UUID of the scene to update. You must use the active scene ID provided in the context.",
		),
	content: z
		.string()
		.describe(
			"The full new content for the scene. This replaces the existing content entirely.",
		),
	instruction: z
		.string()
		.optional()
		.describe(
			"A summary of what was changed (e.g. 'Rewrote paragraph 2 to be more ominous').",
		),
});

export const updateSceneContent = () =>
	tool({
		description:
			"Update the content of the currently active scene. Use this to rewrite, expand, or modify the scene text based on user instructions.",
		// Use inputSchema to match existing tools like draft-scene.ts
		inputSchema,
		execute: async (args: any) => {
			const { sceneId, content, instruction } = args;

			// 1. Verify Access
			await verifySceneAccess(sceneId);

			// 2. Update Database
			const result = await dbUpdateSceneContent(sceneId, content);

			if (!result.success) {
				return {
					error: "Failed to update scene content in the database.",
				};
			}

			// 3. Return Success
			return {
				success: true,
				sceneId,
				instruction: instruction || "Updated scene content.",
				newContent: content,
			};
		},
	});
