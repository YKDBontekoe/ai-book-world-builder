import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
	type ChapterDraft,
	chapter,
	chapterDraft,
	chapterVersion,
} from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export async function getChaptersWithContent({
	projectId,
}: {
	projectId: string;
}): Promise<Array<typeof chapter.$inferSelect & { content: string | null }>> {
	try {
		const chapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, projectId))
			.orderBy(asc(chapter.sequence));

		if (chapters.length === 0) {
			return [];
		}

		const chapterIds = chapters.map((c) => c.id);

		// Optimize: Fetch latest versions for all chapters in one query using DISTINCT ON
		// We use DISTINCT ON (chapterId) to get unique rows per chapter,
		// and ORDER BY chapterId, version DESC to ensure we get the latest version.
		const versions = await db
			.selectDistinctOn([chapterVersion.chapterId], {
				chapterId: chapterVersion.chapterId,
				content: chapterVersion.content,
			})
			.from(chapterVersion)
			.where(inArray(chapterVersion.chapterId, chapterIds))
			.orderBy(chapterVersion.chapterId, desc(chapterVersion.version));

		// Create a map for O(1) lookup
		const versionMap = new Map(versions.map((v) => [v.chapterId, v.content]));

		return chapters.map((ch) => ({
			...ch,
			content: versionMap.get(ch.id) ?? null,
		}));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load chapters with content",
		);
	}
}

export async function getChaptersForProject({
	projectId,
}: {
	projectId: string;
}) {
	try {
		return await db
			.select({
				id: chapter.id,
				title: chapter.title,
				sequence: chapter.sequence,
				status: chapter.status,
				notes: chapter.notes,
			})
			.from(chapter)
			.where(eq(chapter.projectId, projectId))
			.orderBy(asc(chapter.sequence));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load chapters for project",
		);
	}
}

export async function markChapterAsDrafted({
	chapterId,
}: {
	chapterId: string;
}): Promise<void> {
	try {
		await db
			.update(chapter)
			.set({ status: "drafted", updatedAt: new Date() })
			.where(eq(chapter.id, chapterId));
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to update chapter status",
		);
	}
}

export async function createChapterDraftEntry({
	chapterId,
	volumeId,
	outlineId,
	projectId,
	content,
}: {
	chapterId: string;
	volumeId: string;
	outlineId: string;
	projectId: string;
	content: string;
}): Promise<ChapterDraft> {
	try {
		const [draft] = await db
			.insert(chapterDraft)
			.values({
				chapterId,
				volumeId,
				outlineId,
				projectId,
				content,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		await markChapterAsDrafted({ chapterId });

		return draft;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to save chapter draft",
		);
	}
}
