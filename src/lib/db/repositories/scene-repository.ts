import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Scene, type SceneCard, scene, sceneCard } from "@/lib/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateSceneInput {
	projectId: string;
	chapterId: string;
	title: string;
	sequence: number;
	content?: string;
	status?: string;
	prevSceneId?: string;
}

export interface UpdateSceneInput {
	title?: string;
	sequence?: number;
	content?: string;
	status?: string;
	prevSceneId?: string;
}

export interface CreateSceneCardInput {
	projectId: string;
	sceneId: string;
	purpose: string;
	setting?: string;
	atmosphere?: string;
	emotionalBeats?: string[];
	characterGoals?: Record<string, string>;
	constraints?: string[];
	plannedReveal?: string;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SceneRepository extends BaseRepository<
	Scene,
	CreateSceneInput,
	UpdateSceneInput
> {
	/**
	 * Find a scene by ID
	 */
	async findById(id: string): Promise<Scene | null> {
		try {
			const [result] = await db
				.select()
				.from(scene)
				.where(eq(scene.id, id))
				.limit(1);
			return result ?? null;
		} catch (error) {
			console.error("SceneRepository.findById error:", error);
			throw new DatabaseError("Failed to find scene");
		}
	}

	/**
	 * Find a scene by ID within a specific project (secure)
	 */
	async findByIdInProject(
		id: string,
		projectId: string,
	): Promise<Scene | null> {
		try {
			const [result] = await db
				.select()
				.from(scene)
				.where(and(eq(scene.id, id), eq(scene.projectId, projectId)))
				.limit(1);
			return result ?? null;
		} catch (error) {
			console.error("SceneRepository.findByIdInProject error:", error);
			throw new DatabaseError("Failed to find scene in project");
		}
	}

	/**
	 * Find all scenes (not commonly used)
	 */
	async findAll(_options?: FindOptions): Promise<Scene[]> {
		try {
			return await db.select().from(scene).orderBy(asc(scene.sequence));
		} catch (error) {
			console.error("SceneRepository.findAll error:", error);
			throw new DatabaseError("Failed to list scenes");
		}
	}

	/**
	 * Find scenes by chapter ID
	 */
	async findByChapter(chapterId: string): Promise<Scene[]> {
		try {
			return await db
				.select()
				.from(scene)
				.where(eq(scene.chapterId, chapterId))
				.orderBy(asc(scene.sequence));
		} catch (error) {
			console.error("SceneRepository.findByChapter error:", error);
			throw new DatabaseError("Failed to load scenes");
		}
	}

	/**
	 * Find scenes by project ID
	 */
	async findByProject(
		projectId: string,
		excludeContent = false,
	): Promise<Scene[]> {
		try {
			if (excludeContent) {
				// Optimized query: Select only metadata columns, skip heavy content
				return await db
					.select({
						id: scene.id,
						createdAt: scene.createdAt,
						updatedAt: scene.updatedAt,
						title: scene.title,
						sequence: scene.sequence,
						content: sql<string | null>`NULL`.as("content"),
						wordCount: scene.wordCount,
						status: scene.status,
						prevSceneId: scene.prevSceneId,
						chapterId: scene.chapterId,
						projectId: scene.projectId,
					})
					.from(scene)
					.where(eq(scene.projectId, projectId))
					.orderBy(asc(scene.sequence));
			}

			return await db
				.select()
				.from(scene)
				.where(eq(scene.projectId, projectId))
				.orderBy(asc(scene.sequence));
		} catch (error) {
			console.error("SceneRepository.findByProject error:", error);
			throw new DatabaseError("Failed to load project scenes");
		}
	}

	/**
	 * Create a new scene
	 */
	async create(data: CreateSceneInput): Promise<Scene> {
		try {
			const [created] = await db
				.insert(scene)
				.values({
					projectId: data.projectId,
					chapterId: data.chapterId,
					title: data.title,
					sequence: data.sequence,
					content: data.content,
					status: data.status ?? "planned",
					prevSceneId: data.prevSceneId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			console.error("SceneRepository.create error:", error);
			throw new DatabaseError("Failed to create scene");
		}
	}

	/**
	 * Update an existing scene
	 */
	async update(
		id: string,
		data: UpdateSceneInput,
		projectId?: string,
	): Promise<Scene> {
		try {
			const updateData: Record<string, unknown> = { updatedAt: new Date() };
			if (data.title !== undefined) updateData.title = data.title;
			if (data.sequence !== undefined) updateData.sequence = data.sequence;
			if (data.content !== undefined) updateData.content = data.content;
			if (data.status !== undefined) updateData.status = data.status;
			if (data.prevSceneId !== undefined)
				updateData.prevSceneId = data.prevSceneId;

			const [updated] = await db
				.update(scene)
				.set(updateData)
				.where(
					projectId
						? and(eq(scene.id, id), eq(scene.projectId, projectId))
						: eq(scene.id, id),
				)
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("Scene", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("SceneRepository.update error:", error);
			throw new DatabaseError("Failed to update scene");
		}
	}

	/**
	 * Update scene content specifically
	 */
	async updateContent(
		id: string,
		content: string,
		status?: string,
		projectId?: string,
	): Promise<Scene> {
		try {
			const [updated] = await db
				.update(scene)
				.set({
					content,
					status: status ?? "drafted",
					updatedAt: new Date(),
				})
				.where(
					projectId
						? and(eq(scene.id, id), eq(scene.projectId, projectId))
						: eq(scene.id, id),
				)
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("Scene", id);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("SceneRepository.updateContent error:", error);
			throw new DatabaseError("Failed to update scene content");
		}
	}

	/**
	 * Delete a scene by ID
	 */
	async delete(id: string, projectId?: string): Promise<void> {
		try {
			await db
				.delete(scene)
				.where(
					projectId
						? and(eq(scene.id, id), eq(scene.projectId, projectId))
						: eq(scene.id, id),
				);
		} catch (error) {
			console.error("SceneRepository.delete error:", error);
			throw new DatabaseError("Failed to delete scene");
		}
	}

	/**
	 * Get the last scene in a chapter
	 */
	async getLastInChapter(chapterId: string): Promise<Scene | null> {
		try {
			const [lastScene] = await db
				.select()
				.from(scene)
				.where(eq(scene.chapterId, chapterId))
				.orderBy(desc(scene.sequence))
				.limit(1);
			return lastScene ?? null;
		} catch (error) {
			console.error("SceneRepository.getLastInChapter error:", error);
			throw new DatabaseError("Failed to get last scene");
		}
	}

	/**
	 * Get next sequence number for a chapter
	 */
	async getNextSequence(chapterId: string): Promise<number> {
		const lastScene = await this.getLastInChapter(chapterId);
		return (lastScene?.sequence ?? 0) + 1;
	}

	// ============================================================================
	// Scene Card Operations
	// ============================================================================

	/**
	 * Get scene card for a scene
	 */
	async getSceneCard(sceneId: string): Promise<SceneCard | null> {
		try {
			const [card] = await db
				.select()
				.from(sceneCard)
				.where(eq(sceneCard.sceneId, sceneId));
			return card ?? null;
		} catch (error) {
			console.error("SceneRepository.getSceneCard error:", error);
			throw new DatabaseError("Failed to load scene card");
		}
	}

	/**
	 * Create a scene card
	 */
	async createSceneCard(data: CreateSceneCardInput): Promise<SceneCard> {
		try {
			const [created] = await db
				.insert(sceneCard)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return created;
		} catch (error) {
			console.error("SceneRepository.createSceneCard error:", error);
			throw new DatabaseError("Failed to create scene card");
		}
	}

	/**
	 * Update a scene card
	 */
	async updateSceneCard(
		sceneId: string,
		data: Partial<Omit<CreateSceneCardInput, "projectId" | "sceneId">>,
	): Promise<SceneCard> {
		try {
			const [updated] = await db
				.update(sceneCard)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(sceneCard.sceneId, sceneId))
				.returning();

			if (!updated) {
				throw NotFoundError.forResource("SceneCard", sceneId);
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("SceneRepository.updateSceneCard error:", error);
			throw new DatabaseError("Failed to update scene card");
		}
	}
}

// Export singleton instance
export const sceneRepository = new SceneRepository();
