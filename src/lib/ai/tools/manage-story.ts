import { tool } from "ai";
import { eq } from "drizzle-orm"; // Needed for chapter updates if we inline logic
import type { Session } from "next-auth";
import { z } from "zod";
import {
	createScene,
	db,
	getVolumePlanById,
	updateScene,
} from "@/lib/db/queries";
import { chapter } from "@/lib/db/schema";

const manageStorySchema = z.object({
	projectId: z
		.string()
		.optional()
		.describe("Project ID (optional if context is clear)."),
	target: z
		.enum(["chapter", "scene"])
		.describe("What story element to manage."),
	action: z.enum(["create", "update"]).describe("The action to perform."),
	data: z
		.array(
			z.object({
				id: z
					.string()
					.optional()
					.describe("ID of the item (required for update)."),
				title: z
					.string()
					.optional()
					.describe("Title of the chapter or scene."),
				sequence: z.number().optional().describe("Order sequence."),
				// For Chapters
				volumeId: z
					.string()
					.optional()
					.describe("Volume ID (required for creating chapters)."),
				// For Scenes
				chapterId: z
					.string()
					.optional()
					.describe("Chapter ID (required for creating scenes)."),
				content: z.string().optional().describe("Content/draft for scenes."),
				status: z
					.string()
					.optional()
					.describe("Status (planned, drafted, etc)."),
				notes: z.string().optional().describe("Notes for chapters."),
			}),
		)
		.describe("List of items to process."),
});

export const manageStory = ({
	session,
	projectId,
}: {
	session: Session | null;
	projectId?: string;
}) =>
	tool({
		description:
			"Manage the structure of the story (Chapters and Scenes). " +
			"Can create or update multiple chapters or scenes in one go.",
		inputSchema: manageStorySchema,
		execute: async (args: z.infer<typeof manageStorySchema>) => {
			const { projectId: projectIdInput, target, action, data } = args;
			const finalProjectId = projectIdInput || projectId;

			if (!session?.user) {
				return { error: "Authentication required to manage story." };
			}

			if (!finalProjectId) {
				// Some updates might not strictly need projectId if we have IDs, but good practice.
				// Let's rely on data item checks mostly if we can, but consistency is key.
			}

			const results = [];

			for (const item of data) {
				try {
					if (target === "chapter") {
						if (action === "create") {
							if (
								!item.title ||
								!item.volumeId ||
								item.sequence === undefined
							) {
								results.push({
									title: item.title,
									success: false,
									error:
										"Title, VolumeId, and Sequence required for chapter creation.",
								});
								continue;
							}

							// Verify volume (optimization: could batch this lookup)
							const volumePlan = await getVolumePlanById({ id: item.volumeId });
							if (!volumePlan) {
								results.push({
									title: item.title,
									success: false,
									error: "Volume not found.",
								});
								continue;
							}

							const [created] = await db
								.insert(chapter)
								.values({
									title: item.title,
									notes: item.notes ?? null,
									sequence: item.sequence,
									volumeId: item.volumeId,
									outlineId: volumePlan.outlineId,
									projectId: volumePlan.projectId,
									status: item.status ?? "planned",
									createdAt: new Date(),
									updatedAt: new Date(),
								})
								.returning();

							results.push({
								title: created.title,
								id: created.id,
								success: true,
								type: "chapter",
								action: "created",
							});
						} else if (action === "update") {
							if (!item.id) {
								results.push({
									title: item.title,
									success: false,
									error: "ID required for update.",
								});
								continue;
							}

							const [updated] = await db
								.update(chapter)
								.set({
									...(item.title ? { title: item.title } : {}),
									...(item.sequence !== undefined
										? { sequence: item.sequence }
										: {}),
									...(item.status ? { status: item.status } : {}),
									...(item.notes ? { notes: item.notes } : {}),
									updatedAt: new Date(),
								})
								.where(eq(chapter.id, item.id))
								.returning();

							if (!updated) {
								results.push({
									title: item.title,
									success: false,
									error: "Chapter not found.",
								});
								continue;
							}

							results.push({
								title: updated.title,
								id: updated.id,
								success: true,
								type: "chapter",
								action: "updated",
							});
						}
					} else if (target === "scene") {
						if (action === "create") {
							if (
								!item.title ||
								!item.chapterId ||
								item.sequence === undefined
							) {
								results.push({
									title: item.title,
									success: false,
									error:
										"Title, ChapterId, and Sequence required for scene creation.",
								});
								continue;
							}

							let effectiveProjectId = finalProjectId;

							if (!effectiveProjectId) {
								// Fetch chapter to get projectId
								const [chap] = await db
									.select({ projectId: chapter.projectId })
									.from(chapter)
									.where(eq(chapter.id, item.chapterId))
									.limit(1);

								if (chap) {
									effectiveProjectId = chap.projectId;
								} else {
									results.push({
										title: item.title,
										success: false,
										error: "Chapter not found, cannot determine Project ID.",
									});
									continue;
								}
							}

							const created = await createScene({
								projectId: effectiveProjectId,
								chapterId: item.chapterId,
								title: item.title,
								sequence: item.sequence,
								content: item.content,
								status: item.status,
							});

							results.push({
								title: created.title,
								id: created.id,
								success: true,
								type: "scene",
								action: "created",
							});
						} else if (action === "update") {
							if (!item.id) {
								results.push({
									title: item.title,
									success: false,
									error: "ID required for update.",
								});
								continue;
							}

							const updated = await updateScene({
								id: item.id,
								...item,
							});

							results.push({
								title: updated.title,
								id: updated.id,
								success: true,
								type: "scene",
								action: "updated",
							});
						}
					}
				} catch (err) {
					results.push({
						title: item.title,
						success: false,
						error: err instanceof Error ? err.message : String(err),
					});
				}
			}

			const successCount = results.filter((r) => r.success).length;

			return {
				message: `Processed ${data.length} ${target}s. ${successCount} successful.`,
				results,
			};
		},
	});
