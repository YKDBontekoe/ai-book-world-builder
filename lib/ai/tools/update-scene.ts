import { tool } from "ai";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import {
	getProjectByIdWithAccess,
	updateScene as updateSceneMutation,
} from "@/lib/db/queries";
import { scene } from "@/lib/db/schema";

export const updateScene = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description: "Update an existing scene.",
		inputSchema: z.object({
			id: z.string().describe("The ID of the scene to update."),
			title: z.string().optional().describe("New title."),
			sequence: z.number().optional().describe("New sequence number."),
			content: z.string().optional().describe("New content."),
			status: z
				.enum(["planned", "drafted", "completed", "revised"])
				.optional()
				.describe("New status."),
		}),
		execute: async (args: any) => {
			const { id, title, sequence, content, status } = args;

			if (!session?.user?.id) {
				return { error: "Unauthorized" };
			}

			try {
				let targetProjectId = projectId;

				// If project context is missing, we must infer it from the scene
				// to perform a security check.
				if (!targetProjectId) {
					const [existingScene] = await db
						.select({ projectId: scene.projectId })
						.from(scene)
						.where(eq(scene.id, id))
						.limit(1);

					if (!existingScene) {
						return { error: "Scene not found" };
					}
					targetProjectId = existingScene.projectId;
				}

				// SECURITY: Verify user owns the project before allowing update
				const project = await getProjectByIdWithAccess({
					id: targetProjectId,
					userId: session.user.id,
				});

				if (!project) {
					return { error: "Unauthorized: Project access denied" };
				}

				const updatedScene = await updateSceneMutation({
					id,
					title,
					sequence,
					content,
					status,
					projectId: targetProjectId, // Pass verified project ID
				});

				return {
					message: `Scene '${updatedScene.title}' updated successfully.`,
					scene: {
						...updatedScene,
						createdAt: updatedScene.createdAt.toISOString(),
						updatedAt: updatedScene.updatedAt.toISOString(),
					},
				};
			} catch (error) {
				return {
					error: `Failed to update scene: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
