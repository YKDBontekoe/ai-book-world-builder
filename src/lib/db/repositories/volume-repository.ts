import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { type DbTransaction, db } from "@/lib/db";
import {
	type Chapter,
	type ChapterDraft,
	chapter,
	chapterDraft,
	type Volume,
	volume,
} from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateVolumeInput {
	projectId: string;
	outlineId: string;
	title: string;
	summary?: string;
}

export interface UpdateVolumeInput {
	title?: string;
	summary?: string;
}

export interface ChapterPlanInput {
	title: string;
	notes?: string;
	sequence: number;
	status?: string;
}

export type VolumePlan = Volume & {
	chapters: Array<Chapter & { drafts: ChapterDraft[] }>;
};

// ============================================================================
// Helper Functions
// ============================================================================

function mergeVolumeData(
	volumes: Volume[],
	chapters: Chapter[],
	drafts: ChapterDraft[],
): VolumePlan[] {
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

// ============================================================================
// Repository Implementation
// ============================================================================

export class VolumeRepository extends BaseRepository<
	Volume,
	CreateVolumeInput,
	UpdateVolumeInput
> {
	/**
	 * Find a volume by ID
	 */
	async findById(id: string): Promise<Volume | null> {
		try {
			const [result] = await db.select().from(volume).where(eq(volume.id, id));
			return result ?? null;
		} catch (error) {
			console.error("VolumeRepository.findById error:", error);
			throw new DatabaseError("Failed to find volume");
		}
	}

	/**
	 * Find all volumes
	 */
	async findAll(_options?: FindOptions): Promise<Volume[]> {
		try {
			return await db.select().from(volume).orderBy(desc(volume.createdAt));
		} catch (error) {
			console.error("VolumeRepository.findAll error:", error);
			throw new DatabaseError("Failed to list volumes");
		}
	}

	/**
	 * Find volumes by project ID
	 */
	async findByProject(projectId: string): Promise<Volume[]> {
		try {
			return await db
				.select()
				.from(volume)
				.where(eq(volume.projectId, projectId))
				.orderBy(desc(volume.createdAt));
		} catch (error) {
			console.error("VolumeRepository.findByProject error:", error);
			throw new DatabaseError("Failed to load volumes for project");
		}
	}

	/**
	 * Find volume with full plan (chapters and drafts)
	 */
	async findByIdWithPlan(id: string): Promise<VolumePlan | null> {
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

			return mergeVolumeData(
				[selectedVolume],
				chaptersForVolume,
				draftsForVolume,
			)[0];
		} catch (error) {
			console.error("VolumeRepository.findByIdWithPlan error:", error);
			throw new DatabaseError("Failed to load volume plan");
		}
	}

	/**
	 * Find all volume plans for a project
	 */
	async findByProjectWithPlans(projectId: string): Promise<VolumePlan[]> {
		try {
			const volumePlans = await db
				.select()
				.from(volume)
				.where(eq(volume.projectId, projectId))
				.orderBy(desc(volume.createdAt));

			if (volumePlans.length === 0) {
				return [];
			}

			const volumeIds = volumePlans.map((item: Volume) => item.id);
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

			return mergeVolumeData(volumePlans, chaptersForVolumes, draftsForVolumes);
		} catch (error) {
			console.error("VolumeRepository.findByProjectWithPlans error:", error);
			throw new DatabaseError("Failed to load volume plans for project");
		}
	}

	/**
	 * Create a new volume
	 */
	async create(data: CreateVolumeInput): Promise<Volume> {
		try {
			const [created] = await db
				.insert(volume)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			console.error("VolumeRepository.create error:", error);
			throw new DatabaseError("Failed to create volume");
		}
	}

	/**
	 * Create a volume with chapters (full plan)
	 */
	async createWithChapters(
		data: CreateVolumeInput,
		chapters: ChapterPlanInput[],
	): Promise<VolumePlan> {
		try {
			return await db.transaction(async (tx: DbTransaction) => {
				const [volumeRecord] = await tx
					.insert(volume)
					.values({
						...data,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				const chapterRows = chapters.map((chapterPlan) => ({
					projectId: data.projectId,
					outlineId: data.outlineId,
					volumeId: volumeRecord.id,
					title: chapterPlan.title,
					notes: chapterPlan.notes,
					status: chapterPlan.status ?? "planned",
					sequence: chapterPlan.sequence,
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				const createdChapters = chapterRows.length
					? await tx.insert(chapter).values(chapterRows).returning()
					: [];

				return mergeVolumeData([volumeRecord], createdChapters, [])[0];
			});
		} catch (error) {
			console.error("VolumeRepository.createWithChapters error:", error);
			throw new DatabaseError("Failed to create volume plan");
		}
	}

	/**
	 * Update an existing volume
	 */
	async update(id: string, data: UpdateVolumeInput): Promise<Volume> {
		try {
			const [updated] = await db
				.update(volume)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(volume.id, id))
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("Volume", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("VolumeRepository.update error:", error);
			throw new DatabaseError("Failed to update volume");
		}
	}

	/**
	 * Delete a volume by ID
	 */
	async delete(id: string): Promise<void> {
		try {
			await db.delete(volume).where(eq(volume.id, id));
		} catch (error) {
			console.error("VolumeRepository.delete error:", error);
			throw new DatabaseError("Failed to delete volume");
		}
	}
}

// Export singleton instance
export const volumeRepository = new VolumeRepository();
