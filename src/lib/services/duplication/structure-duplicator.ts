import { eq, type InferSelectModel } from "drizzle-orm";

import type { DbTransaction } from "@/lib/db";
import { chapter, chapterDraft, outline, volume } from "@/lib/db/schema";
import { chunkedInsert } from "./utils";

type OutlineRow = InferSelectModel<typeof outline>;
type VolumeRow = InferSelectModel<typeof volume>;
type ChapterRow = InferSelectModel<typeof chapter>;
type ChapterDraftRow = InferSelectModel<typeof chapterDraft>;

export class StructureDuplicator {
	constructor(private tx: DbTransaction) {}

	async cloneOutlines(
		originalProjectId: string,
		newProjectId: string,
		idMap: Map<string, string>,
	): Promise<void> {
		const oldOutlines = (await this.tx
			.select()
			.from(outline)
			.where(eq(outline.projectId, originalProjectId))) as OutlineRow[];

		if (oldOutlines.length > 0) {
			const newOutlines = oldOutlines.map((old: OutlineRow) => {
				const newId = crypto.randomUUID();
				idMap.set(old.id, newId);
				const { id: _id, ...data } = old;
				return {
					...data,
					id: newId,
					projectId: newProjectId,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			});
			await chunkedInsert(this.tx, outline, newOutlines);
		}
	}

	async cloneVolumes(
		originalProjectId: string,
		newProjectId: string,
		outlineIdMap: Map<string, string>,
		volumeIdMap: Map<string, string>,
	): Promise<void> {
		const oldVolumes = (await this.tx
			.select()
			.from(volume)
			.where(eq(volume.projectId, originalProjectId))) as VolumeRow[];

		if (oldVolumes.length > 0) {
			const newVolumes = [];
			for (const old of oldVolumes) {
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newOutlineId) {
					const newId = crypto.randomUUID();
					volumeIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					newVolumes.push({
						...data,
						id: newId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newVolumes.length > 0) {
				await chunkedInsert(this.tx, volume, newVolumes);
			}
		}
	}

	async cloneChapters(
		originalProjectId: string,
		newProjectId: string,
		volumeIdMap: Map<string, string>,
		outlineIdMap: Map<string, string>,
		chapterIdMap: Map<string, string>,
	): Promise<void> {
		const oldChapters = (await this.tx
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, originalProjectId))) as ChapterRow[];

		if (oldChapters.length > 0) {
			const newChapters = [];
			for (const old of oldChapters) {
				const newVolumeId = volumeIdMap.get(old.volumeId);
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newVolumeId && newOutlineId) {
					const newId = crypto.randomUUID();
					chapterIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					newChapters.push({
						...data,
						id: newId,
						volumeId: newVolumeId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newChapters.length > 0) {
				await chunkedInsert(this.tx, chapter, newChapters);
			}
		}
	}

	async cloneChapterDrafts(
		originalProjectId: string,
		newProjectId: string,
		chapterIdMap: Map<string, string>,
		volumeIdMap: Map<string, string>,
		outlineIdMap: Map<string, string>,
	): Promise<void> {
		const oldChapterDrafts = (await this.tx
			.select()
			.from(chapterDraft)
			.where(
				eq(chapterDraft.projectId, originalProjectId),
			)) as ChapterDraftRow[];

		if (oldChapterDrafts.length > 0) {
			const newDrafts = [];
			for (const old of oldChapterDrafts) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				const newVolumeId = volumeIdMap.get(old.volumeId);
				const newOutlineId = outlineIdMap.get(old.outlineId);
				if (newChapterId && newVolumeId && newOutlineId) {
					const { id: _id, ...data } = old;
					newDrafts.push({
						...data,
						id: crypto.randomUUID(),
						chapterId: newChapterId,
						volumeId: newVolumeId,
						outlineId: newOutlineId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newDrafts.length > 0) {
				await chunkedInsert(this.tx, chapterDraft, newDrafts);
			}
		}
	}
}
