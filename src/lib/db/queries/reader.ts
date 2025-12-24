import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { readingProgress } from "@/lib/db/schema/reader";

export async function getReadingProgress({
	projectId,
	userId,
}: {
	projectId: string;
	userId: string;
}) {
	const [record] = await db
		.select()
		.from(readingProgress)
		.where(
			and(
				eq(readingProgress.projectId, projectId),
				eq(readingProgress.userId, userId),
			),
		);
	return record || null;
}

export async function saveReadingProgressQuery({
	projectId,
	userId,
	chapterId,
	progress,
}: {
	projectId: string;
	userId: string;
	chapterId: string;
	progress: number;
}) {
	return db
		.insert(readingProgress)
		.values({
			projectId,
			userId,
			chapterId,
			progress,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: [readingProgress.userId, readingProgress.projectId],
			set: {
				chapterId,
				progress,
				updatedAt: new Date(),
			},
		})
		.returning();
}
