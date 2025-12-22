import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createScene as createSceneMutation } from "@/lib/db/queries";

export const batchCreateScenes = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description: "Create multiple new scenes in a chapter.",
		inputSchema: z.object({
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
		}),
		execute: async (args: any) => {
			const { chapterId, scenes, projectId: projectIdInput } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!finalProjectId) {
				return { error: "Project ID is required to create scenes." };
			}

			try {
				const results = [];

				for (const sceneData of scenes) {
					try {
						// Basic validation for existing scenes could be added here,
						// but `createSceneMutation` typically handles basic inserts.
						// We won't re-sequence everything here to save complexity, assuming the LLM provides reasonable sequences.

						const scene = await createSceneMutation({
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
			} catch (error) {
				return {
					error: `Failed to batch create scenes: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
