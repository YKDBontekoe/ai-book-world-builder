import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	type Chapter,
	type ChapterDraft,
	chapter,
	chapterDraft,
	type Volume,
	volume,
} from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

export type VolumePlan = Volume & {
	chapters: Array<Chapter & { drafts: ChapterDraft[] }>;
};

export function mergeVolumeData({
	volumes,
	chapters,
	drafts,
}: {
	volumes: Volume[];
	chapters: Chapter[];
	drafts: ChapterDraft[];
}): VolumePlan[] {
	const draftsByChapter = new Map<string, ChapterDraft[]>();
	const chaptersByVolume = new Map<
		string,
		Array<Chapter & { drafts: ChapterDraft[] }>
	>();

	for (const draftItem of drafts) {
		const existingDrafts = draftsByChapter.get(draftItem.chapterId) ?? [];
		draftsByChapter.set(draftItem.chapterId, [...existingDrafts, draftItem]);
	}

	for (const chapterItem of chapters) {
		const withDrafts = {
			...chapterItem,
			drafts: draftsByChapter.get(chapterItem.id) ?? [],
		};
		const existingChapters = chaptersByVolume.get(chapterItem.volumeId) ?? [];

		chaptersByVolume.set(chapterItem.volumeId, [
			...existingChapters,
			withDrafts,
		]);
	}

	return volumes.map((volumeItem) => ({
		...volumeItem,
		chapters: [...(chaptersByVolume.get(volumeItem.id) ?? [])].sort(
			(first, second) => first.sequence - second.sequence,
		),
	}));
}

export async function createVolumePlan({
	projectId,
	outlineId,
	title,
	summary,
	chapters,
}: {
	projectId: string;
	outlineId: string;
	title: string;
	summary?: string;
	chapters: Array<{
		title: string;
		notes?: string;
		sequence: number;
		status?: string;
	}>;
}): Promise<VolumePlan> {
	try {
		return await db.transaction(async (transaction) => {
			const [volumeRecord] = await transaction
				.insert(volume)
				.values({
					projectId,
					outlineId,
					title,
					summary,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const chapterRows = chapters.map((chapterPlan) => ({
				projectId,
				outlineId,
				volumeId: volumeRecord.id,
				title: chapterPlan.title,
				notes: chapterPlan.notes,
				status: chapterPlan.status ?? "planned",
				sequence: chapterPlan.sequence,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			const createdChapters = chapterRows.length
				? await transaction.insert(chapter).values(chapterRows).returning()
				: [];

			return mergeVolumeData({
				volumes: [volumeRecord],
				chapters: createdChapters,
				drafts: [],
			})[0];
		});
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to create volume plan",
		);
	}
}

export async function getVolumePlansForProject({
	projectId,
}: {
	projectId: string;
}): Promise<VolumePlan[]> {
	try {
		const volumePlans = await db
			.select()
			.from(volume)
			.where(eq(volume.projectId, projectId))
			.orderBy(desc(volume.createdAt));

		if (volumePlans.length === 0) {
			return [];
		}

		const volumeIds = volumePlans.map((item) => item.id);
		const [chaptersForVolumes, draftsForVolumes] = await Promise.all([
			db
				.select()
				.from(chapter)
				.where(inArray(chapter.volumeId, volumeIds))
				.orderBy(asc(chapter.sequence)),
			db
				.select()
				.from(chapterDraft)
				.where(inArray(chapterDraft.volumeId, volumeIds))
				.orderBy(desc(chapterDraft.createdAt)),
		]);

		return mergeVolumeData({
			volumes: volumePlans,
			chapters: chaptersForVolumes,
			drafts: draftsForVolumes,
		});
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load volume plans for project",
		);
	}
}

export async function getVolumePlanById({
	id,
}: {
	id: string;
}): Promise<VolumePlan | null> {
	try {
		const [selectedVolume] = await db
			.select()
			.from(volume)
			.where(eq(volume.id, id));

		if (!selectedVolume) {
			return null;
		}

		const [chaptersForVolume, draftsForVolume] = await Promise.all([
			db
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, selectedVolume.id))
				.orderBy(asc(chapter.sequence)),
			db
				.select()
				.from(chapterDraft)
				.where(eq(chapterDraft.volumeId, selectedVolume.id))
				.orderBy(desc(chapterDraft.createdAt)),
		]);

		return mergeVolumeData({
			volumes: [selectedVolume],
			chapters: chaptersForVolume,
			drafts: draftsForVolume,
		})[0];
	} catch (_error) {
		throw new ChatSDKError(
			"bad_request:database",
			"Failed to load volume plan",
		);
	}
}
