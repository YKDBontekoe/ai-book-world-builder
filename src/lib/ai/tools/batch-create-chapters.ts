import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { db, getProjectByIdWithAccess, getVolumePlanById } from "@/lib/db/queries";
import { chapter } from "@/lib/db/schema";

export const batchCreateChapters = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
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
		execute: async (args: any) => {
			const { volumeId, chapters, projectId: projectIdInput } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!session?.user?.id) {
				return { error: "Authentication required to create chapters." };
			}

			try {
				// Verify the volume exists and get its project/outline info
				// We do this once for the batch
				const volumePlan = await getVolumePlanById({ id: volumeId });

				if (!volumePlan) {
					return {
						error: `Volume with ID '${volumeId}' not found.`,
					};
				}

				// If projectId was provided, verify it matches the volume's project
				if (finalProjectId && volumePlan.projectId !== finalProjectId) {
					return {
						error: "Volume does not belong to the specified project.",
					};
				}

				// Verify ownership of the project (using the volume's projectId)
				const project = await getProjectByIdWithAccess({
					id: volumePlan.projectId,
					userId: session.user.id,
				});

				if (!project || project.userId !== session.user.id) {
					return {
						error: "Unauthorized: You do not have write access to this project.",
					};
				}

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
