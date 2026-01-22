import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
	type Chapter,
	type ChapterDraft,
	chapter,
	chapterDraft,
	chapterVersion,
} from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateChapterInput {
	projectId: string;
	volumeId: string;
	outlineId: string;
	title: string;
	sequence: number;
	notes?: string;
	status?: string;
}

export interface UpdateChapterInput {
	title?: string;
	notes?: string;
	status?: string;
	sequence?: number;
}

export interface ChapterWithContent extends Chapter {
	content: string | null;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class ChapterRepository extends BaseRepository<
	Chapter,
	CreateChapterInput,
	UpdateChapterInput
> {
	/**
	 * Find a chapter by ID
	 */
	async findById(id: string): Promise<Chapter | null> {
		try {
			const [result] = await db
				.select()
				.from(chapter)
				.where(eq(chapter.id, id));
			return result ?? null;
		} catch (error) {
			console.error("ChapterRepository.findById error:", error);
			throw new DatabaseError("Failed to find chapter");
		}
	}

	/**
	 * Find all chapters (not commonly used, prefer findByProject)
	 */
	async findAll(_options?: FindOptions): Promise<Chapter[]> {
		try {
			return await db.select().from(chapter).orderBy(asc(chapter.sequence));
		} catch (error) {
			console.error("ChapterRepository.findAll error:", error);
			throw new DatabaseError("Failed to list chapters");
		}
	}

	/**
	 * Find chapters by project ID
	 */
	async findByProject(projectId: string): Promise<Chapter[]> {
		try {
			return await db
				.select()
				.from(chapter)
				.where(eq(chapter.projectId, projectId))
				.orderBy(asc(chapter.sequence));
		} catch (error) {
			console.error("ChapterRepository.findByProject error:", error);
			throw new DatabaseError("Failed to list chapters for project");
		}
	}

	/**
	 * Find chapters by volume ID
	 */
	async findByVolume(volumeId: string): Promise<Chapter[]> {
		try {
			return await db
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, volumeId))
				.orderBy(asc(chapter.sequence));
		} catch (error) {
			console.error("ChapterRepository.findByVolume error:", error);
			throw new DatabaseError("Failed to list chapters for volume");
		}
	}

	/**
	 * Find chapters with their latest content (from chapter versions)
	 */
	async findByProjectWithContent(
		projectId: string,
	): Promise<ChapterWithContent[]> {
		try {
			const chapters = await db
				.select()
				.from(chapter)
				.where(eq(chapter.projectId, projectId))
				.orderBy(asc(chapter.sequence));

			const result: ChapterWithContent[] = [];
			for (const ch of chapters) {
				const [version] = await db
					.select({ content: chapterVersion.content })
					.from(chapterVersion)
					.where(eq(chapterVersion.chapterId, ch.id))
					.orderBy(desc(chapterVersion.version))
					.limit(1);

				result.push({
					...ch,
					content: version?.content ?? null,
				});
			}
			return result;
		} catch (error) {
			console.error("ChapterRepository.findByProjectWithContent error:", error);
			throw new DatabaseError("Failed to load chapters with content");
		}
	}

	/**
	 * Create a new chapter
	 */
	async create(data: CreateChapterInput): Promise<Chapter> {
		try {
			const [createdChapter] = await db
				.insert(chapter)
				.values({
					...data,
					status: data.status ?? "planned",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return createdChapter;
		} catch (error) {
			console.error("ChapterRepository.create error:", error);
			throw new DatabaseError("Failed to create chapter");
		}
	}

	/**
	 * Update an existing chapter
	 */
	async update(
		id: string,
		data: UpdateChapterInput,
		projectId?: string,
	): Promise<Chapter> {
		try {
			const whereClause = projectId
				? and(eq(chapter.id, id), eq(chapter.projectId, projectId))
				: eq(chapter.id, id);

			const [updatedChapter] = await db
				.update(chapter)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(whereClause)
				.returning();

			if (!updatedChapter) {
				throw NotFoundError.forResource("Chapter", id);
			}

			return updatedChapter;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("ChapterRepository.update error:", error);
			throw new DatabaseError("Failed to update chapter");
		}
	}

	/**
	 * Mark a chapter as drafted
	 */
	async markAsDrafted(chapterId: string): Promise<void> {
		try {
			await db
				.update(chapter)
				.set({ status: "drafted", updatedAt: new Date() })
				.where(eq(chapter.id, chapterId));
		} catch (error) {
			console.error("ChapterRepository.markAsDrafted error:", error);
			throw new DatabaseError("Failed to update chapter status");
		}
	}

	/**
	 * Delete a chapter by ID
	 */
	async delete(id: string, projectId?: string): Promise<void> {
		try {
			const whereClause = projectId
				? and(eq(chapter.id, id), eq(chapter.projectId, projectId))
				: eq(chapter.id, id);

			const [deleted] = await db.delete(chapter).where(whereClause).returning();

			if (!deleted) {
				throw NotFoundError.forResource("Chapter", id);
			}
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("ChapterRepository.delete error:", error);
			throw new DatabaseError("Failed to delete chapter");
		}
	}

	/**
	 * Create a draft entry for a chapter
	 */
	async createDraft(data: {
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
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Mark the chapter as drafted
			await this.markAsDrafted(data.chapterId);

			return draft;
		} catch (error) {
			console.error("ChapterRepository.createDraft error:", error);
			throw new DatabaseError("Failed to save chapter draft");
		}
	}

	/**
	 * Get the last chapter in a volume (for sequence calculation)
	 */
	async getLastInVolume(volumeId: string): Promise<Chapter | null> {
		try {
			const [lastChapter] = await db
				.select()
				.from(chapter)
				.where(eq(chapter.volumeId, volumeId))
				.orderBy(desc(chapter.sequence))
				.limit(1);

			return lastChapter ?? null;
		} catch (error) {
			console.error("ChapterRepository.getLastInVolume error:", error);
			throw new DatabaseError("Failed to get last chapter");
		}
	}

	/**
	 * Get next sequence number for a volume
	 */
	async getNextSequence(volumeId: string): Promise<number> {
		const lastChapter = await this.getLastInVolume(volumeId);
		return (lastChapter?.sequence ?? 0) + 1;
	}
}

// Export singleton instance
export const chapterRepository = new ChapterRepository();
