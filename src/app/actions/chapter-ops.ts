"use server";

import { and, eq, gt, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { withProjectWriteAccess } from "@/lib/actions-utils";
import { db } from "@/lib/db";
import { chapter, outline, volume } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

// Schema for reordering chapters
const reorderChaptersSchema = z.object({
	projectId: z.string().uuid(),
	updates: z.array(
		z.object({
			id: z.string().uuid(),
			sequence: z.number().int().min(1),
		}),
	),
});

export const reorderChaptersAction = async (
	input: z.infer<typeof reorderChaptersSchema>,
) => {
	return withProjectWriteAccess(input.projectId, async () => {
		const { updates } = input;

		if (updates.length === 0) return { success: true };

		try {
			await db.transaction(async (tx: any) => {
				// 1. Temporarily set sequences to negative to avoid unique constraint violations
				for (const update of updates) {
					await tx
						.update(chapter)
						.set({ sequence: -update.sequence })
						.where(eq(chapter.id, update.id));
				}

				// 2. Set to the new positive sequences
				for (const update of updates) {
					await tx
						.update(chapter)
						.set({ sequence: update.sequence })
						.where(eq(chapter.id, update.id));
				}
			});

			revalidatePath(`/projects/${input.projectId}`);
			return { success: true };
		} catch (error) {
			console.error("Failed to reorder chapters:", error);
			throw new ChatSDKError("bad_request:api", "Failed to reorder chapters");
		}
	});
};

const updateChapterSchema = z.object({
	projectId: z.string().uuid(),
	chapterId: z.string().uuid(),
	data: z.object({
		title: z.string().min(1).max(255).optional(),
		notes: z.string().optional(),
		status: z.string().optional(),
	}),
});

export const updateChapterAction = async (
	input: z.infer<typeof updateChapterSchema>,
) => {
	return withProjectWriteAccess(input.projectId, async () => {
		try {
			await db
				.update(chapter)
				.set({
					...input.data,
					updatedAt: new Date(),
				})
				.where(eq(chapter.id, input.chapterId));

			revalidatePath(`/projects/${input.projectId}`);
			return { success: true };
		} catch (error) {
			console.error("Failed to update chapter:", error);
			throw new ChatSDKError("bad_request:api", "Failed to update chapter");
		}
	});
};

const createChapterSchema = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1).max(255),
});

export const createChapterAction = async (
	input: z.infer<typeof createChapterSchema>,
) => {
	return withProjectWriteAccess(input.projectId, async () => {
		try {
			// 1. Get outline and volume
			const outlines = await db
				.select()
				.from(outline)
				.where(eq(outline.projectId, input.projectId))
				.limit(1);

			if (outlines.length === 0) {
				throw new ChatSDKError("not_found:document", "Project outline not found");
			}
			const currentOutline = outlines[0];

			const volumes = await db
				.select()
				.from(volume)
				.where(eq(volume.outlineId, currentOutline.id))
				.limit(1);

			// Create a default volume if none exists
			let volumeId = volumes[0]?.id;
			if (!volumeId) {
				const [newVolume] = await db
					.insert(volume)
					.values({
						projectId: input.projectId,
						outlineId: currentOutline.id,
						title: "Volume 1",
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();
				volumeId = newVolume.id;
			}

			// 2. Get max sequence
			const [result] = await db
				.select({ maxSeq: max(chapter.sequence) })
				.from(chapter)
				.where(eq(chapter.volumeId, volumeId));

			const nextSequence = (result.maxSeq || 0) + 1;

			// 3. Create chapter
			const [newChapter] = await db
				.insert(chapter)
				.values({
					projectId: input.projectId,
					outlineId: currentOutline.id,
					volumeId: volumeId,
					title: input.title,
					sequence: nextSequence,
					status: "planned",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			revalidatePath(`/projects/${input.projectId}`);
			return { success: true, data: newChapter };
		} catch (error) {
			console.error("Failed to create chapter:", error);
			throw new ChatSDKError("bad_request:api", "Failed to create chapter");
		}
	});
};

const deleteChapterSchema = z.object({
	projectId: z.string().uuid(),
	chapterId: z.string().uuid(),
});

export const deleteChapterAction = async (
	input: z.infer<typeof deleteChapterSchema>,
) => {
	return withProjectWriteAccess(input.projectId, async () => {
		try {
			await db.transaction(async (tx: any) => {
				// 1. Get chapter to delete to find its sequence and volume
				const [target] = await tx
					.select()
					.from(chapter)
					.where(eq(chapter.id, input.chapterId))
					.limit(1);

				if (!target) return; // Already deleted

				// 2. Delete the chapter
				await tx.delete(chapter).where(eq(chapter.id, input.chapterId));

				// 3. Shift subsequent chapters down
				await tx
					.update(chapter)
					.set({
						sequence: sql`${chapter.sequence} - 1`,
					})
					.where(
						and(
							eq(chapter.volumeId, target.volumeId),
							gt(chapter.sequence, target.sequence),
						),
					);
			});

			revalidatePath(`/projects/${input.projectId}`);
			return { success: true };
		} catch (error) {
			console.error("Failed to delete chapter:", error);
			throw new ChatSDKError("bad_request:api", "Failed to delete chapter");
		}
	});
};
