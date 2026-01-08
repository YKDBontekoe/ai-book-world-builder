import "server-only";

import { type ExtractTablesWithRelations, eq, inArray } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { db } from "@/lib/db/drizzle";
import { projectRepository } from "@/lib/db/repositories";
import type * as schema from "@/lib/db/schema";
import {
	bookExport,
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapter,
	chapterDraft,
	chapterVersion,
	entity,
	entityAttribute,
	generationNote,
	outline,
	project,
	relationship,
	scene,
	sceneCard,
	storyState,
	volume,
} from "@/lib/db/schema";

// Helper for chunked inserts
async function chunkedInsert<T extends Record<string, unknown>, TTable>(
	tx: PgTransaction<
		PostgresJsQueryResultHKT,
		typeof schema,
		ExtractTablesWithRelations<typeof schema>
	>,
	table: TTable,
	items: T[],
	chunkSize = 1000,
) {
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		// @ts-expect-error - Dynamic table insertion is tricky with Drizzle types
		await tx.insert(table).values(chunk);
	}
}

export class ProjectService {
	async deleteProjects(projectIds: string[], userId: string) {
		if (projectIds.length === 0) {
			return { success: true };
		}

		if (projectIds.length > 50) {
			return { error: "Cannot delete more than 50 projects at once." };
		}

		try {
			// Verify ownership for all projects
			const projects = await db
				.select({ id: project.id, userId: project.userId })
				.from(project)
				.where(inArray(project.id, projectIds));

			const ownedProjectIds = projects
				.filter((p) => p.userId === userId)
				.map((p) => p.id);

			if (ownedProjectIds.length === 0) {
				return { error: "No valid projects to delete" };
			}

			await db.transaction(async (tx) => {
				// 1. Generation related tables (Leaf first)
				const generations = await tx
					.select({ id: bookGeneration.id })
					.from(bookGeneration)
					.where(inArray(bookGeneration.projectId, ownedProjectIds));

				const generationIds = generations.map((g) => g.id);

				if (generationIds.length > 0) {
					await tx
						.delete(generationNote)
						.where(inArray(generationNote.generationId, generationIds));
					await tx
						.delete(bookGenerationAsset)
						.where(inArray(bookGenerationAsset.generationId, generationIds));
					await tx
						.delete(bookGenerationStep)
						.where(inArray(bookGenerationStep.generationId, generationIds));
					await tx
						.delete(storyState)
						.where(inArray(storyState.generationId, generationIds));
					await tx
						.delete(chapterVersion)
						.where(inArray(chapterVersion.generationId, generationIds));
				}

				// Delete generations
				await tx
					.delete(bookGeneration)
					.where(inArray(bookGeneration.projectId, ownedProjectIds));

				// 2. Book Exports
				await tx
					.delete(bookExport)
					.where(inArray(bookExport.projectId, ownedProjectIds));

				// 3. Structure (Scenes, Chapters, etc.)
				await tx
					.delete(sceneCard)
					.where(inArray(sceneCard.projectId, ownedProjectIds));
				await tx.delete(scene).where(inArray(scene.projectId, ownedProjectIds));
				await tx
					.delete(chapterDraft)
					.where(inArray(chapterDraft.projectId, ownedProjectIds));
				await tx
					.delete(chapter)
					.where(inArray(chapter.projectId, ownedProjectIds));
				await tx
					.delete(volume)
					.where(inArray(volume.projectId, ownedProjectIds));
				await tx
					.delete(outline)
					.where(inArray(outline.projectId, ownedProjectIds));

				// 4. Entities & Relationships
				await tx
					.delete(relationship)
					.where(inArray(relationship.projectId, ownedProjectIds));
				await tx
					.delete(entityAttribute)
					.where(inArray(entityAttribute.projectId, ownedProjectIds));
				await tx
					.delete(entity)
					.where(inArray(entity.projectId, ownedProjectIds));

				// 5. Project itself
				await tx.delete(project).where(inArray(project.id, ownedProjectIds));
			});

			return { success: true };
		} catch (error) {
			console.error("Delete projects error:", error);
			return { error: "Failed to delete projects" };
		}
	}

	async forkProject(
		originalProjectId: string,
		userId: string,
		newName?: string,
	) {
		// 1. Pre-flight check for project size to prevent OOM/Timeouts
		const [entityCount, sceneCount] = await Promise.all([
			db.$count(entity, eq(entity.projectId, originalProjectId)),
			db.$count(scene, eq(scene.projectId, originalProjectId)),
		]);

		// Limit to reasonable size (2000 total items)
		if (entityCount + sceneCount > 2000) {
			return {
				error:
					"Project is too large to fork instantly. Please export and import instead.",
			};
		}

		const originalProject = await projectRepository.findByIdWithAccess(
			originalProjectId,
			userId,
		);

		if (!originalProject) {
			return { error: "Project not found or access denied" };
		}

		// Validate name length
		const rawName = newName || `Fork of ${originalProject.name}`;
		const finalName = rawName.slice(0, 100); // Truncate to DB limit

		try {
			const result = await db.transaction(async (tx) => {
				// 1. Create New Project
				const [newProject] = await tx
					.insert(project)
					.values({
						name: finalName,
						description: originalProject.description,
						visibility: "private",
						userId,
						folders: originalProject.folders,
						forkedFromId: originalProjectId,
						createdAt: new Date(),
					})
					.returning();

				// Map IDs
				const entityIdMap = new Map<string, string>();
				const outlineIdMap = new Map<string, string>();
				const volumeIdMap = new Map<string, string>();
				const chapterIdMap = new Map<string, string>();
				const sceneIdMap = new Map<string, string>();

				// 2. Entities (Fetch & Insert)
				{
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

						const newEntities = oldEntities.map((old) => {
							const newId = crypto.randomUUID();
							entityIdMap.set(old.id, newId);
							const { id: _id, ...data } = old;
							return {
								...data,
								id: newId,
								projectId: newProject.id,
								createdAt: new Date(),
								updatedAt: new Date(),
							};
						});

						await chunkedInsert(tx, entity, newEntities);
						offset += limit;
					}
				}

				// 3. Attributes (Fetch & Insert)
				{
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
									projectId: newProject.id,
									createdAt: new Date(),
								});
							}
						}
						if (newAttributes.length > 0) {
							await chunkedInsert(tx, entityAttribute, newAttributes);
						}
					}
				}

				// 4. Relationships (Fetch & Insert)
				{
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
									projectId: newProject.id,
									createdAt: new Date(),
								});
							}
						}
						if (newRelationships.length > 0) {
							await chunkedInsert(tx, relationship, newRelationships);
						}
					}
				}

				// 5. Outline (Fetch & Insert)
				{
					const oldOutlines = await tx
						.select()
						.from(outline)
						.where(eq(outline.projectId, originalProjectId));

					if (oldOutlines.length > 0) {
						const newOutlines = oldOutlines.map((old) => {
							const newId = crypto.randomUUID();
							outlineIdMap.set(old.id, newId);
							const { id: _id, ...data } = old;
							return {
								...data,
								id: newId,
								projectId: newProject.id,
								createdAt: new Date(),
								updatedAt: new Date(),
							};
						});
						await chunkedInsert(tx, outline, newOutlines);
					}
				}

				// 6. Volume (Fetch & Insert)
				{
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
									projectId: newProject.id,
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

				// 7. Chapter (Fetch & Insert)
				{
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
									projectId: newProject.id,
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

				// 8. Chapter Drafts (Fetch & Insert)
				{
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
									projectId: newProject.id,
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

				// 9. Scenes (Fetch, Map, Insert)
				{
					const limit = 50;
					let offset = 0;
					let hasMore = true;

					// 1. Light fetch for ID Mapping
					const allSceneMeta = await tx
						.select({
							id: scene.id,
							prevSceneId: scene.prevSceneId,
							chapterId: scene.chapterId,
						})
						.from(scene)
						.where(eq(scene.projectId, originalProjectId));

					for (const meta of allSceneMeta) {
						sceneIdMap.set(meta.id, crypto.randomUUID());
					}

					// 2. Heavy fetch and insert in batches
					while (hasMore) {
						const batch = await tx
							.select()
							.from(scene)
							.where(eq(scene.projectId, originalProjectId))
							.limit(limit)
							.offset(offset);

						if (batch.length === 0) {
							hasMore = false;
							break;
						}

						const newScenesToInsert = [];
						for (const old of batch) {
							const newChapterId = chapterIdMap.get(old.chapterId);
							if (newChapterId) {
								const newId = sceneIdMap.get(old.id);
								if (!newId) {
									throw new Error(`Failed to map scene ID for ${old.id}`);
								}

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
									projectId: newProject.id,
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

				// 10. Scene Cards (Fetch & Insert)
				{
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
									projectId: newProject.id,
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

				return { success: true, projectId: newProject.id };
			});

			return result;
		} catch (error) {
			console.error("Fork project error:", error);
			return { error: "Failed to fork project" };
		}
	}
}

export const projectService = new ProjectService();
