import "server-only";
import { eq, type InferSelectModel } from "drizzle-orm";

import { type DbTransaction, db } from "@/lib/db";
import { projectRepository } from "@/lib/db/repositories";
import {
	chapter,
	chapterDraft,
	entity,
	entityAttribute,
	outline,
	project,
	relationship,
	scene,
	sceneCard,
	volume,
} from "@/lib/db/schema";

// Type definitions for table rows
type EntityRow = InferSelectModel<typeof entity>;
type OutlineRow = InferSelectModel<typeof outline>;
type ProjectRow = InferSelectModel<typeof project>;
type SceneRow = InferSelectModel<typeof scene>;

// Helper for chunked inserts
async function chunkedInsert<T extends Record<string, unknown>, TTable>(
	tx: DbTransaction,
	table: TTable,
	items: T[],
	chunkSize = 1000,
) {
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		// @ts-expect-error - Drizzle types for insert are complex but this is safe
		await tx.insert(table).values(chunk);
	}
}

/**
 * Service to handle the complex logic of deep-cloning an entire project.
 *
 * This service is responsible for:
 * 1. Cloning the Project record itself.
 * 2. Cloning all Entities, Attributes, and Relationships.
 * 3. Cloning the Book Structure (Outlines, Volumes, Chapters).
 * 4. Cloning Scenes and their Metadata (Cards).
 *
 * ## ID Mapping Strategy
 * To maintain referential integrity (foreign keys) in the new project, we:
 * 1. Generate new UUIDs for every record.
 * 2. Maintain `Map<OldID, NewID>` for each entity type (Entity, Chapter, etc.).
 * 3. When inserting dependent records (e.g., a Scene belonging to a Chapter),
 *    we look up the new Chapter ID in the map using the old Chapter ID.
 */
export class ProjectDuplicationService {
	/**
	 * Creates a complete fork of a project.
	 *
	 * Uses a transaction to ensure all-or-nothing execution. If any part of the
	 * cloning process fails, the database is rolled back to prevent partial states.
	 *
	 * @param originalProjectId - The source project ID.
	 * @param userId - The user who will own the new project.
	 * @param newName - Optional name for the new project.
	 */
	async forkProject(
		originalProjectId: string,
		userId: string,
		newName?: string,
	): Promise<{ success: boolean; projectId?: string; error?: string }> {
		// 1. Pre-flight check for project size
		const [entityCount, sceneCount] = await Promise.all([
			db.$count(entity, eq(entity.projectId, originalProjectId)),
			db.$count(scene, eq(scene.projectId, originalProjectId)),
		]);

		if (entityCount + sceneCount > 2000) {
			return {
				success: false,
				error:
					"Project is too large to fork instantly. Please export and import instead.",
			};
		}

		const originalProject = await projectRepository.findByIdWithAccess(
			originalProjectId,
			userId,
		);

		if (!originalProject) {
			return { success: false, error: "Project not found or access denied" };
		}

		const rawName = newName || `Fork of ${originalProject.name}`;
		const finalName = rawName.slice(0, 100);

		try {
			const result = await db.transaction(async (tx: DbTransaction) => {
				// 1. Create New Project
				const newProject = await this.cloneProjectRecord(
					tx,
					originalProject,
					finalName,
					userId,
					originalProjectId,
				);

				// ID Maps
				const entityIdMap = new Map<string, string>();
				const outlineIdMap = new Map<string, string>();
				const volumeIdMap = new Map<string, string>();
				const chapterIdMap = new Map<string, string>();
				const sceneIdMap = new Map<string, string>();

				// 2. Clone Entities & Relations
				await this.cloneEntities(
					tx,
					originalProjectId,
					newProject.id,
					entityIdMap,
				);
				await this.cloneAttributes(
					tx,
					originalProjectId,
					newProject.id,
					entityIdMap,
				);
				await this.cloneRelationships(
					tx,
					originalProjectId,
					newProject.id,
					entityIdMap,
				);

				// 3. Clone Structure
				await this.cloneOutlines(
					tx,
					originalProjectId,
					newProject.id,
					outlineIdMap,
				);
				await this.cloneVolumes(
					tx,
					originalProjectId,
					newProject.id,
					outlineIdMap,
					volumeIdMap,
				);
				await this.cloneChapters(
					tx,
					originalProjectId,
					newProject.id,
					volumeIdMap,
					outlineIdMap,
					chapterIdMap,
				);
				await this.cloneChapterDrafts(
					tx,
					originalProjectId,
					newProject.id,
					chapterIdMap,
					volumeIdMap,
					outlineIdMap,
				);

				// 4. Clone Scenes
				await this.cloneScenes(
					tx,
					originalProjectId,
					newProject.id,
					chapterIdMap,
					sceneIdMap,
				);
				await this.cloneSceneCards(
					tx,
					originalProjectId,
					newProject.id,
					sceneIdMap,
				);

				return { success: true, projectId: newProject.id };
			});

			return result;
		} catch (error) {
			console.error("Fork project error:", error);
			return { success: false, error: "Failed to fork project" };
		}
	}

	private async cloneProjectRecord(
		tx: DbTransaction,
		originalProject: ProjectRow,
		name: string,
		userId: string,
		forkedFromId: string,
	) {
		const [newProject] = await tx
			.insert(project)
			.values({
				name,
				description: originalProject.description,
				visibility: "private",
				userId,
				folders: originalProject.folders,
				forkedFromId,
				createdAt: new Date(),
			})
			.returning();
		return newProject;
	}

	private async cloneEntities(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		idMap: Map<string, string>,
	) {
		const limit = 100;
		let offset = 0;
		let hasMore = true;

		while (hasMore) {
			const oldEntities = await tx
				.select()
				.from(entity)
				.where(eq(entity.projectId, originalProjectId))
				.limit(limit)
				.offset(offset);

			if (oldEntities.length === 0) {
				hasMore = false;
				break;
			}

			const newEntities = oldEntities.map((old: EntityRow) => {
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

			await chunkedInsert(tx, entity, newEntities);
			offset += limit;
		}
	}

	private async cloneAttributes(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		entityIdMap: Map<string, string>,
	) {
		const oldAttributes = await tx
			.select()
			.from(entityAttribute)
			.where(eq(entityAttribute.projectId, originalProjectId));

		if (oldAttributes.length > 0) {
			const newAttributes = [];
			for (const old of oldAttributes) {
				const newEntityId = entityIdMap.get(old.entityId);
				if (newEntityId) {
					const { id: _id, ...data } = old;
					newAttributes.push({
						...data,
						id: crypto.randomUUID(),
						entityId: newEntityId,
						projectId: newProjectId,
						createdAt: new Date(),
					});
				}
			}
			if (newAttributes.length > 0) {
				await chunkedInsert(tx, entityAttribute, newAttributes);
			}
		}
	}

	private async cloneRelationships(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		entityIdMap: Map<string, string>,
	) {
		const oldRelationships = await tx
			.select()
			.from(relationship)
			.where(eq(relationship.projectId, originalProjectId));

		if (oldRelationships.length > 0) {
			const newRelationships = [];
			for (const old of oldRelationships) {
				const sourceId = entityIdMap.get(old.sourceEntityId);
				const targetId = entityIdMap.get(old.targetEntityId);
				if (sourceId && targetId) {
					const { id: _id, ...data } = old;
					newRelationships.push({
						...data,
						id: crypto.randomUUID(),
						sourceEntityId: sourceId,
						targetEntityId: targetId,
						projectId: newProjectId,
						createdAt: new Date(),
					});
				}
			}
			if (newRelationships.length > 0) {
				await chunkedInsert(tx, relationship, newRelationships);
			}
		}
	}

	private async cloneOutlines(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		idMap: Map<string, string>,
	) {
		const oldOutlines = await tx
			.select()
			.from(outline)
			.where(eq(outline.projectId, originalProjectId));

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
			await chunkedInsert(tx, outline, newOutlines);
		}
	}

	private async cloneVolumes(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		outlineIdMap: Map<string, string>,
		volumeIdMap: Map<string, string>,
	) {
		const oldVolumes = await tx
			.select()
			.from(volume)
			.where(eq(volume.projectId, originalProjectId));

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
				await chunkedInsert(tx, volume, newVolumes);
			}
		}
	}

	private async cloneChapters(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		volumeIdMap: Map<string, string>,
		outlineIdMap: Map<string, string>,
		chapterIdMap: Map<string, string>,
	) {
		const oldChapters = await tx
			.select()
			.from(chapter)
			.where(eq(chapter.projectId, originalProjectId));

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
				await chunkedInsert(tx, chapter, newChapters);
			}
		}
	}

	private async cloneChapterDrafts(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		chapterIdMap: Map<string, string>,
		volumeIdMap: Map<string, string>,
		outlineIdMap: Map<string, string>,
	) {
		const oldChapterDrafts = await tx
			.select()
			.from(chapterDraft)
			.where(eq(chapterDraft.projectId, originalProjectId));

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
				await chunkedInsert(tx, chapterDraft, newDrafts);
			}
		}
	}

	/**
	 * Clones scenes using a Two-Pass strategy to resolve linked-list dependencies.
	 *
	 * Scenes reference each other via `prevSceneId`. If we tried to insert them
	 * purely sequentially, we might encounter a `prevSceneId` that hasn't been
	 * created yet (or we wouldn't know its new ID).
	 *
	 * Pass 1: Fetch ALL scene IDs and generate their new counterparts immediately.
	 *         Populate `sceneIdMap`.
	 *
	 * Pass 2: Fetch full scene data in batches. When inserting, we can now
	 *         confidently resolve `prevSceneId` using the map from Pass 1.
	 */
	private async cloneScenes(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		chapterIdMap: Map<string, string>,
		sceneIdMap: Map<string, string>,
	) {
		const limit = 50;
		let offset = 0;
		let hasMore = true;

		// 1. Light fetch for ID Mapping
		type SceneMeta = Pick<SceneRow, "id" | "prevSceneId" | "chapterId">;
		const allSceneMeta = (await tx
			.select()
			.from(scene)
			.where(eq(scene.projectId, originalProjectId))) as SceneMeta[];

		for (const meta of allSceneMeta) {
			sceneIdMap.set(meta.id, crypto.randomUUID());
		}

		// 2. Heavy fetch and insert in batches
		while (hasMore) {
			const batch = (await tx
				.select()
				.from(scene)
				.where(eq(scene.projectId, originalProjectId))
				.limit(limit)
				.offset(offset)) as SceneRow[];

			if (batch.length === 0) {
				hasMore = false;
				break;
			}

			const newScenesToInsert = [];
			for (const old of batch) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				const newId = sceneIdMap.get(old.id);
				if (newChapterId && newId) {
					// Resolve prevSceneId using the pre-filled map
					const newPrevId = old.prevSceneId
						? (sceneIdMap.get(old.prevSceneId) ?? null)
						: null;

					const { id: _id, ...data } = old;
					newScenesToInsert.push({
						...data,
						id: newId,
						chapterId: newChapterId,
						prevSceneId: newPrevId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}

			if (newScenesToInsert.length > 0) {
				await chunkedInsert(tx, scene, newScenesToInsert);
			}
			offset += limit;
		}
	}

	private async cloneSceneCards(
		tx: DbTransaction,
		originalProjectId: string,
		newProjectId: string,
		sceneIdMap: Map<string, string>,
	) {
		const oldSceneCards = await tx
			.select()
			.from(sceneCard)
			.where(eq(sceneCard.projectId, originalProjectId));

		if (oldSceneCards.length > 0) {
			const newSceneCards = [];
			for (const old of oldSceneCards) {
				const newSceneId = sceneIdMap.get(old.sceneId);
				if (newSceneId) {
					const { id: _id, ...data } = old;
					newSceneCards.push({
						...data,
						id: crypto.randomUUID(),
						sceneId: newSceneId,
						projectId: newProjectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			if (newSceneCards.length > 0) {
				await chunkedInsert(tx, sceneCard, newSceneCards);
			}
		}
	}
}

export const projectDuplicationService = new ProjectDuplicationService();
