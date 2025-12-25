import { z } from "zod";
import { createProtectedTool } from "@/lib/ai/tool-utils";
import { sceneRepository } from "@/lib/db/repositories";

const batchCreateScenesSchema = z.object({
	chapterId: z
		.string()
		.describe("The ID of the chapter these scenes belong to."),
	scenes: z.array(
		z.object({
			title: z.string().describe("The title of the scene."),
			sequence: z
				.number()
				.describe("The order/sequence of the scene in the chapter."),
			content: z
				.string()
				.optional()
				.describe("Initial content/draft of the scene."),
			status: z
				.enum(["planned", "drafted", "completed", "revised"])
				.optional()
				.describe("Status of the scene."),
		}),
	),
	projectId: z
		.string()
		.optional()
		.describe("Project ID (optional if context is clear)."),
});

export const batchCreateScenes = createProtectedTool({
	description: "Create multiple new scenes in a chapter.",
	inputSchema: batchCreateScenesSchema,
	requireProjectId: true,
	execute: async (args, { projectId }) => {
		// projectId is guaranteed to be defined because requireProjectId is true
		const finalProjectId = projectId as string;
		const { chapterId, scenes } = args;

		const results = [];

		for (const sceneData of scenes) {
			try {
				const scene = await sceneRepository.create({
					projectId: finalProjectId,
					chapterId,
					title: sceneData.title,
					sequence: sceneData.sequence,
					content: sceneData.content,
					status: sceneData.status,
				});

				results.push({
					title: scene.title,
					id: scene.id,
					success: true,
				});
			} catch (err) {
				results.push({
					title: sceneData.title,
					success: false,
					error: err instanceof Error ? err.message : String(err),
				});
			}
		}

		const successCount = results.filter((r) => r.success).length;

		return {
			message: `Processed ${results.length} scenes. ${successCount} created successfully.`,
			results,
		};
	},
});
