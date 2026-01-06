import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getGatewayIdForRole } from "@/lib/ai/model-routing";
import { generationService } from "@/lib/ai/services/generation-service";
import {
	addTaskLogEntry,
	getBookGenerationForProject,
	getProjectByIdWithAccess,
	getSceneCardForScene,
	getScenesForChapter,
	updateSceneContent,
} from "@/lib/db/queries";

export const draftScene = ({ session }: { session: Session | null }) =>
	tool({
		description:
			"The Writer. Drafts or rewrites the prose for a specific scene.",
		inputSchema: z.object({
			projectId: z.string().describe("The ID of the project"),
			chapterId: z.string().describe("The ID of the chapter"),
			sceneId: z.string().describe("The ID of the scene to draft"),
			instructions: z
				.string()
				.optional()
				.describe("Specific drafting instructions (e.g. 'Make it more tense')"),
		}),
		execute: async (args: any) => {
			const { projectId, chapterId, sceneId, instructions } = args;
			try {
				if (!projectId || !chapterId || !sceneId) {
					return { error: "Missing required parameters" };
				}
				if (!session?.user) return { error: "Authentication required." };

				// Verify Project Ownership
				const project = await getProjectByIdWithAccess({
					id: projectId,
					userId: session.user.id,
				});

				if (!project || project.userId !== session.user.id) {
					return { error: "Unauthorized access to project." };
				}

				// We check for generation but do not require it for manual drafting
				const generation = await getBookGenerationForProject({ projectId });

				const scenes = await getScenesForChapter({ chapterId });
				const currentScene = scenes.find((s) => s.id === sceneId);

				if (!currentScene) return { error: "Scene not found in chapter." };

				if (currentScene.projectId !== projectId) {
					return { error: "Scene validation failed." };
				}

				const sceneCard = await getSceneCardForScene({ sceneId });
				if (!sceneCard) return { error: "Scene card not found." };

				// Use standard writer role model
				const writerModel = await getGatewayIdForRole("writer");

				const { text: prose, error } = await generationService.draftScene(
					currentScene.title,
					{
						purpose: sceneCard.purpose,
						setting: sceneCard.setting ?? undefined,
						emotionalBeats: sceneCard.emotionalBeats ?? undefined,
					},
					instructions,
					{ modelId: writerModel },
				);

				if (error || !prose) return { error: error || "No text generated" };

				// Update Database
				await updateSceneContent({
					sceneId,
					content: prose,
					status: "drafted",
				});

				// Log Task (only if generation exists)
				if (generation) {
					await addTaskLogEntry({
						generationId: generation.id,
						entry: {
							id: crypto.randomUUID(),
							timestamp: new Date().toISOString(),
							type: "tool_result",
							modelId: writerModel,
							content: `Drafted scene: ${currentScene.title}`,
							metadata: { sceneId, wordCount: prose.split(" ").length },
						},
					});
				}

				return {
					success: true,
					sceneId,
					wordCount: prose.split(" ").length,
					preview: prose.substring(0, 200) + "...",
				};
			} catch (error) {
				console.error("Draft scene failed:", error);
				return { error: "Drafting failed: " + (error as Error).message };
			}
		},
	});
