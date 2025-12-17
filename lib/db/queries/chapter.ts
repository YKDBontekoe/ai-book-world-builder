import "server-only";
import { asc, desc, eq } from "drizzle-orm";
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
}) {
	try {
		const chapters = await db
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, projectId))
			.orderBy(asc(chapter.sequence));

		const result = [];
		for (const ch of chapters) {
			const [version] = await db
				.select({ content: chapterVersion.content })
				.from(chapterVersion)
				.where(eq(chapterVersion.chapterId, ch.id))
				.orderBy(desc(chapterVersion.version))
				.limit(1);

			result.push({
				...ch,
				content: version?.content || null,
			});
		}
		return result;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load chapters with content",
		);
	}
}

export async function createChapter({
	projectId,
	title,
	sequence,
}: {
	projectId: string;
	title: string;
	sequence: number;
}) {
	try {
		const [createdChapter] = await db
			.insert(chapter)
			.values({
				projectId,
				title,
				sequence,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return createdChapter;
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create chapter",
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
