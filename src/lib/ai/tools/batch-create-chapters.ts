import type { Session } from "next-auth";
import { z } from "zod";
import { db, getVolumePlanById } from "@/lib/db/queries";
import { projectRepository } from "@/lib/db/repositories";
import { chapter } from "@/lib/db/schema";

import { createProtectedTool } from "@/lib/ai/tool-utils";

export const batchCreateChapters = createProtectedTool({
	description: "Create multiple new chapters in a volume.",
	inputSchema: z.object({
		volumeId: z
			.string()
			.describe("The ID of the volume these chapters belong to."),
		chapters: z.array(
			z.object({
				title: z.string().describe("The title of the chapter."),
				sequence: z.number().describe("The order/sequence of the chapter."),
				status: z
					.enum(["planned", "drafting", "drafted", "review", "final"])
					.optional()
					.default("planned"),
				notes: z.string().optional().describe("Notes for the chapter"),
			}),
		),
		projectId: z
			.string()
			.optional()
			.describe("Project ID (optional if context is clear)."),
	}),
	requireProjectId: false, // We derive projectId from volumeId
	execute: async (args, { projectId, session }) => {
		const { volumeId, chapters, projectId: projectIdInput } = args;
		const finalProjectId = projectIdInput || projectId;

		try {
			// Verify the volume exists and get its project/outline info
			// We do this once for the batch
			const volumePlan = await getVolumePlanById({ id: volumeId });

			if (!volumePlan) {
				return {
					error: `Volume with ID '${volumeId}' not found.`,
				};
			}

			// If finalProjectId is provided, ensure it matches
			const projectMatches =
				!finalProjectId || volumePlan.projectId === finalProjectId;
			if (!projectMatches) {
				return {
					error: "Provided project ID does not match volume's project.",
				};
			}

			// SECURITY: Verify project ownership using the volume's projectId
			// (Since a user could provide a valid volumeId from a public project they don't own)
			await projectRepository.findByIdWithOwnership(
				volumePlan.projectId,
				session.user?.id as string,
			);

			const results: Array<{
				title: string;
				id?: string;
				sequence?: number;
				success: boolean;
				error?: string;
			}> = [];

			for (const chapterData of chapters) {
					try {
						// Check for duplicates in existing volumePlan chapters?
						// Ideally we should refetch or check against a local set we build up.
						const isDuplicate =
							volumePlan.chapters.some(
								(c) => c.sequence === chapterData.sequence,
							) ||
							results.some(
								(r) => r.sequence === chapterData.sequence && r.success,
							);

						if (isDuplicate) {
							results.push({
								title: chapterData.title,
								success: false,
								error: `Sequence ${chapterData.sequence} already exists.`,
							});
							continue;
						}

						const [createdChapter] = await db
							.insert(chapter)
							.values({
								title: chapterData.title,
								notes: chapterData.notes ?? null,
								sequence: chapterData.sequence,
								volumeId,
								outlineId: volumePlan.outlineId,
								projectId: volumePlan.projectId,
								status: chapterData.status ?? "planned",
								createdAt: new Date(),
								updatedAt: new Date(),
							})
							.returning();

						results.push({
							title: createdChapter.title,
							id: createdChapter.id,
							sequence: createdChapter.sequence,
							success: true,
						});
					} catch (err) {
						results.push({
							title: chapterData.title,
							success: false,
							error: err instanceof Error ? err.message : String(err),
						});
					}
				}

				const successCount = results.filter((r) => r.success).length;

				return {
					message: `Processed ${results.length} chapters. ${successCount} created successfully.`,
					results,
				};
			} catch (error) {
				return {
					error: `Failed to batch create chapters: ${error instanceof Error ? error.message : String(error)}`,
				};
			}
		},
	});
